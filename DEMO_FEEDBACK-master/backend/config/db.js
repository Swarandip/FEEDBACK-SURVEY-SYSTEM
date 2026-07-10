const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/feedback_survey_system';

async function seedDefaultAdmin() {
  const adminExists = await User.countDocuments({ role: 'admin' });
  if (adminExists > 0) {
    return;
  }

  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    username: 'Administrator',
    email: 'admin@example.com',
    password_hash: hashedPassword,
    full_name: 'Administrator',
    role: 'admin',
    department: 'Administration',
    is_active: true
  });

  console.log('✅ Default admin user created: Administrator / admin123');
}

async function connectDB() {
  try {
    console.log("Connecting to:", MONGODB_URI);

    await mongoose.connect(MONGODB_URI);

    console.log('✅ MongoDB connected successfully!');

    await seedDefaultAdmin();
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
}

module.exports = { connectDB };

