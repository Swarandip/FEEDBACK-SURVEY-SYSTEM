require('dotenv').config();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const FeedbackForm = require('./models/FeedbackForm');
const FeedbackResponse = require('./models/FeedbackResponse');

async function createUserIfMissing({ username, email, password, full_name, role, department, semester }) {
  const existing = await User.findOne({ email });
  if (existing) {
    return existing;
  }

  const password_hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password_hash,
    full_name,
    role,
    department,
    semester: role === 'student' && semester != null ? semester : undefined
  });

  console.log(`✅ Created user: ${email} (${role})`);
  return user;
}

async function seed() {
  await connectDB();

  // Ensure baseline users
  const student = await createUserIfMissing({
    username: 'John Doe',
    email: 'john.student@university.edu',
    password: 'password123',
    full_name: 'John Doe',
    role: 'student',
    department: 'Computer Science',
    semester: 4
  });

  const faculty = await createUserIfMissing({
    username: 'Dr. Jane Smith',
    email: 'jane.faculty@university.edu',
    password: 'password123',
    full_name: 'Dr. Jane Smith',
    role: 'faculty',
    department: 'Computer Science'
  });

  // Admin may already be created by connectDB seeder; ensure it exists/updated
  const admin = await createUserIfMissing({
    username: 'Administrator',
    email: 'admin@example.com',
    password: 'admin123',
    full_name: 'Administrator',
    role: 'admin',
    department: 'Administration'
  });

  // Seed feedback form similar to dummyData.ts "Course Feedback - Web Development"
  const existingForm = await FeedbackForm.findOne({
    form_title: 'Course Feedback - Web Development'
  });

  let form = existingForm;

  if (!existingForm) {
    form = await FeedbackForm.create({
      form_title: 'Course Feedback - Web Development',
      form_description: 'Please provide your feedback on the Web Development course',
      created_by: admin._id,
      created_by_name: admin.full_name,
      is_anonymous: false,
      is_active: true,
      target_audience: 'student',
      target_semesters: [3, 4, 5, 6],
      start_date: new Date(),
      end_date: new Date(new Date().getFullYear(), 11, 31),
      questions: [
        {
          question_text: 'How would you rate the overall course content?',
          question_type: 'rating',
          is_required: true,
          options: ['1', '2', '3', '4', '5'],
          question_order: 1
        },
        {
          question_text: 'What did you like most about this course?',
          question_type: 'text',
          is_required: true,
          options: [],
          question_order: 2
        },
        {
          question_text: 'Which topics were most useful?',
          question_type: 'checkbox',
          is_required: false,
          options: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'Databases'],
          question_order: 3
        },
        {
          question_text: 'How would you rate the instructor?',
          question_type: 'radio',
          is_required: true,
          options: ['Excellent', 'Good', 'Average', 'Poor'],
          question_order: 4
        }
      ]
    });

    console.log('✅ Created feedback form: Course Feedback - Web Development');
  }

  // Seed one example response from the student
  const existingResponse = await FeedbackResponse.findOne({
    form_id: form._id,
    user_id: student._id
  });

  if (!existingResponse) {
    const questionsByOrder = form.questions.reduce((acc, q) => {
      acc[q.question_order] = q;
      return acc;
    }, {});

    await FeedbackResponse.create({
      form_id: form._id,
      user_id: student._id,
      is_anonymous: false,
      answers: [
        {
          question_id: questionsByOrder[1]._id.toString(),
          rating_value: 4
        },
        {
          question_id: questionsByOrder[2]._id.toString(),
          answer_text: 'The practical exercises were very helpful'
        },
        {
          question_id: questionsByOrder[3]._id.toString(),
          answer_text: 'JavaScript, React'
        },
        {
          question_id: questionsByOrder[4]._id.toString(),
          answer_text: 'Excellent'
        }
      ]
    });

    console.log('✅ Created sample feedback response from John Doe');
  }

  console.log('✅ MongoDB seed complete.');
  await mongoose.disconnect();
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    mongoose.disconnect().finally(() => process.exit(1));
  });

