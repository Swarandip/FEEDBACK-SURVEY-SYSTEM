const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  question_id: { type: String, required: true },
  option_value: { type: String },
  answer_text: { type: String },
  rating_value: { type: Number }
});

const FeedbackResponseSchema = new mongoose.Schema({
  form_id: { type: mongoose.Schema.Types.ObjectId, ref: 'FeedbackForm', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  is_anonymous: { type: Boolean, default: false },
  answers: [AnswerSchema],
  submitted_at: { type: Date, default: Date.now }
});

// Indexes for common queries (prevent duplicate submissions, fast lookups)
FeedbackResponseSchema.index({ form_id: 1, user_id: 1 });
FeedbackResponseSchema.index({ form_id: 1 });
FeedbackResponseSchema.index({ submitted_at: -1 });

module.exports = mongoose.model('FeedbackResponse', FeedbackResponseSchema);

