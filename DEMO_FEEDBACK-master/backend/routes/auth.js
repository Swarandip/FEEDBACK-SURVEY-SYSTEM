const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'feedback-survey-secret-2025';

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName, role, enrollmentNo, department, semester } = req.body;

    // Redacted server-side log to help debug missing writes.
    console.log('Register payload:', {
      username,
      email,
      fullName,
      role,
      department,
      semester,
      enrollmentNo
    });

    const semesterNumber = role === 'student' ? Number(semester) : undefined;
    const semesterFinal =
      role === 'student' && semester != null && semester !== '' && Number.isFinite(semesterNumber)
        ? semesterNumber
        : undefined;

    const existing = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Username (name) or email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password_hash: hashedPassword,
      full_name: fullName,
      role: role || 'student',
      enrollment_no: enrollmentNo,
      department,
      semester: semesterFinal
    });

    console.log('✅ Created user:', {
      userId: user._id.toString(),
      email: user.email,
      semester: user.semester
    });

    res.json({
      success: true,
      message: 'Registration successful',
      userId: user._id
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login - Accept username, email, OR full name
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      is_active: true,
      $or: [{ username }, { email: username }, { full_name: username }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        department: user.department,
        enrollmentNo: user.enrollment_no,
        semester: user.semester
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify token
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        department: user.department,
        enrollmentNo: user.enrollment_no,
        semester: user.semester
      }
    });
  } catch (error) {
    console.error('Token verify error:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

module.exports = router;

