const express = require('express');
const multer = require('multer');
const FeedbackForm = require('../models/FeedbackForm');
const FeedbackResponse = require('../models/FeedbackResponse');
const User = require('../models/User');
const { parseRecipientFile, matchNamesToStudents } = require('../utils/recipientMatcher');
const { canStudentAccessForm } = require('../utils/studentFormAccess');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Get all active forms (optional ?forUserId= for student-scoped list)
router.get('/forms', async (req, res) => {
  try {
    const { forUserId } = req.query;
    let forms = await FeedbackForm.find({ is_active: true })
      .sort({ created_at: -1 })
      .lean();

    if (forUserId) {
      const user = await User.findById(forUserId).lean();
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      if (user.role === 'student') {
        forms = forms.filter((f) => canStudentAccessForm(f, user));
      }
    }

    res.json({ success: true, data: forms });
  } catch (error) {
    console.error('Get forms error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Match names from uploaded Excel/PDF to students (by semester filter)
router.post('/match-recipients', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    let targetSemesters = [];
    if (req.body.targetSemesters) {
      try {
        const parsed = JSON.parse(req.body.targetSemesters);
        targetSemesters = Array.isArray(parsed)
          ? parsed.map(Number).filter((n) => !Number.isNaN(n) && n >= 1 && n <= 8)
          : [];
      } catch {
        targetSemesters = String(req.body.targetSemesters)
          .split(',')
          .map((s) => Number(s.trim()))
          .filter((n) => !Number.isNaN(n));
      }
    }

    const parsedNames = await parseRecipientFile(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    );

    if (parsedNames.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No names found in the file. Use one name per line or in the first column of Excel.'
      });
    }

    const studentQuery = { role: 'student', is_active: true };
    if (targetSemesters.length > 0) {
      studentQuery.semester = { $in: targetSemesters };
    }

    const students = await User.find(studentQuery).lean();
    const { matched, unmatched, parsedCount } = matchNamesToStudents(parsedNames, students);

    res.json({
      success: true,
      parsedCount,
      matched,
      unmatched,
      matchedCount: matched.length,
      unmatchedCount: unmatched.length,
      targetSemesters
    });
  } catch (error) {
    console.error('Match recipients error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single form by ID
router.get('/forms/:formId', async (req, res) => {
  try {
    const form = await FeedbackForm.findById(req.params.formId).lean();

    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    if (!form.is_active) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    const { forUserId } = req.query;
    if (forUserId) {
      const user = await User.findById(forUserId).lean();
      if (user?.role === 'student' && !canStudentAccessForm(form, user)) {
        return res.status(403).json({
          success: false,
          message: 'You are not on the recipient list for this feedback form.'
        });
      }
    }

    res.json({ success: true, data: form });
  } catch (error) {
    console.error('Get form error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get questions for a specific form
router.get('/forms/:formId/questions', async (req, res) => {
  try {
    const form = await FeedbackForm.findById(req.params.formId).lean();

    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    res.json({ success: true, data: form.questions || [] });
  } catch (error) {
    console.error('Get form questions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create a new feedback form
router.post('/forms', async (req, res) => {
  try {
    const {
      formTitle,
      formDescription,
      subjectId,
      createdBy,
      createdByName,
      createdByRole,
      isAnonymous,
      targetAudience,
      targetSemesters,
      targetStudentIds,
      startDate,
      endDate,
      questions
    } = req.body;

    if (createdByRole === 'faculty' && targetAudience !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Faculty can only create forms for students. Use admin account for faculty/all forms.'
      });
    }

    const mappedQuestions = Array.isArray(questions)
      ? questions.map((q, index) => ({
          question_text: q.text,
          question_type: q.type,
          is_required: !!q.isRequired,
          options: q.options || [],
          question_order: index + 1
        }))
      : [];

    const studentIds = Array.isArray(targetStudentIds)
      ? targetStudentIds.filter(Boolean)
      : [];

    const form = await FeedbackForm.create({
      form_title: formTitle,
      form_description: formDescription,
      is_anonymous: !!isAnonymous,
      is_active: true,
      target_audience: targetAudience || 'student',
      target_semesters: Array.isArray(targetSemesters) ? targetSemesters : [],
      target_student_ids: studentIds.length > 0 ? studentIds : [],
      start_date: startDate || null,
      end_date: endDate || null,
      created_by: createdBy || null,
      created_by_name: createdByName || null,
      questions: mappedQuestions
    });

    res.json({ success: true, formId: form._id.toString() });
  } catch (error) {
    console.error('Create form error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit a feedback response
router.post('/responses', async (req, res) => {
  try {
    const { formId, userId, isAnonymous, answers } = req.body;

    if (!isAnonymous && userId) {
      const form = await FeedbackForm.findById(formId).lean();
      const user = await User.findById(userId).lean();
      if (form && user?.role === 'student' && !canStudentAccessForm(form, user)) {
        return res.status(403).json({
          success: false,
          message: 'You are not allowed to submit this feedback form.'
        });
      }
    }

    const mappedAnswers = Array.isArray(answers)
      ? answers.map((ans) => {
          let ratingValue = null;
          if (typeof ans.ratingValue === 'number') {
            ratingValue = ans.ratingValue;
          } else if (ans.ratingValue != null) {
            const parsed = Number(ans.ratingValue);
            ratingValue = Number.isNaN(parsed) ? null : parsed;
          }

          return {
            question_id: ans.questionId,
            option_value: ans.optionId != null ? String(ans.optionId) : null,
            answer_text: ans.answerText || null,
            rating_value: ratingValue
          };
        })
      : [];

    const response = await FeedbackResponse.create({
      form_id: formId,
      user_id: isAnonymous ? null : userId,
      is_anonymous: !!isAnonymous,
      answers: mappedAnswers
    });

    res.json({ success: true, responseId: response._id.toString() });
  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check if user has already submitted a form
router.get('/responses/check', async (req, res) => {
  try {
    const { formId, userId } = req.query;

    if (!formId || !userId) {
      return res.status(400).json({ success: false, message: 'formId and userId required' });
    }

    const existing = await FeedbackResponse.findOne({
      form_id: formId,
      user_id: userId,
      is_anonymous: false
    });

    res.json({ success: true, submitted: !!existing });
  } catch (error) {
    console.error('Check response error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get responses for a user (for student's submitted list)
router.get('/responses/by-user/:userId', async (req, res) => {
  try {
    const responses = await FeedbackResponse.find({ user_id: req.params.userId })
      .populate('form_id', 'form_title')
      .sort({ submitted_at: -1 })
      .lean();

    res.json({ success: true, data: responses });
  } catch (error) {
    console.error('Get user responses error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get responses for a faculty member (responses to forms created by this faculty)
router.get('/responses/by-faculty/:facultyId', async (req, res) => {
  try {
    const { facultyId } = req.params;

    const forms = await FeedbackForm.find({ created_by: facultyId, is_active: true })
      .select('_id')
      .lean();

    if (!forms || forms.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const formIds = forms.map(f => f._id);

    const responses = await FeedbackResponse.find({
      form_id: { $in: formIds }
    })
      // Populate questions so faculty can render per-question breakdown.
      .populate('form_id', 'form_title questions target_audience target_semesters')
      // Populate the student name (when not anonymous) so faculty can see per-student answers.
      .populate('user_id', 'full_name email semester department role')
      .sort({ submitted_at: -1 })
      .lean();

    res.json({ success: true, data: responses });
  } catch (error) {
    console.error('Get faculty responses error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all responses (admin view)
router.get('/responses/all', async (req, res) => {
  try {
    const responses = await FeedbackResponse.find({})
      .populate('form_id', 'form_title questions target_audience target_semesters created_by created_by_name created_at')
      .populate('user_id', 'full_name email semester department role')
      .sort({ submitted_at: -1 })
      .lean();

    res.json({ success: true, data: responses });
  } catch (error) {
    console.error('Get all responses error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get subjects (placeholder – no subjects collection yet)
router.get('/subjects', async (req, res) => {
  try {
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

