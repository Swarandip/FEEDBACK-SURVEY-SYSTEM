const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  full_name: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'faculty', 'student'],
    default: 'student'
  },
  enrollment_no: { type: String },
  department: { type: String },
  semester: { type: Number },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

// Indexes for common queries
UserSchema.index({ role: 1 });
UserSchema.index({ department: 1 });
UserSchema.index({ is_active: 1 });

module.exports = mongoose.model('User', UserSchema);

