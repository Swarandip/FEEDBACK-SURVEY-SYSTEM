const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question_text: { type: String, required: true },
  question_type: {
    type: String,
    enum: ['text', 'radio', 'checkbox', 'dropdown', 'rating'],
    required: true
  },
  is_required: { type: Boolean, default: false },
  options: [{ type: String }],
  question_order: { type: Number }
});

const FeedbackFormSchema = new mongoose.Schema({
  form_title: { type: String, required: true },
  form_description: { type: String },
  subject_name: { type: String },
  subject_code: { type: String },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_by_name: { type: String },
  is_anonymous: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true },
  target_audience: { type: String, enum: ['student', 'faculty', 'all'], default: 'student' },
  target_semesters: [{ type: Number }],
  /** When set, only these student user IDs can see/submit (from uploaded name list + semester filter). */
  target_student_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  start_date: { type: Date },
  end_date: { type: Date },
  questions: [QuestionSchema],
  created_at: { type: Date, default: Date.now }
});

// Indexes for common queries
FeedbackFormSchema.index({ created_by: 1 });
FeedbackFormSchema.index({ is_active: 1 });
FeedbackFormSchema.index({ start_date: 1, end_date: 1 });

module.exports = mongoose.model('FeedbackForm', FeedbackFormSchema);

