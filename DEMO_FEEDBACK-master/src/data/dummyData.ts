import { User, FeedbackForm, FeedbackResponse } from '../types';

// Dummy users for authentication
export const dummyUsers: (User & { password: string })[] = [
  {
    id: '1',
    email: 'john.student@university.edu',
    password: 'password123',
    name: 'John Doe',
    role: 'student',
    department: 'Computer Science',
    semester: 6,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    email: 'jane.faculty@university.edu',
    password: 'password123',
    name: 'Dr. Jane Smith',
    role: 'faculty',
    department: 'Computer Science',
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Administrator',
    role: 'admin',
    createdAt: '2024-01-01'
  }
];

// Dummy feedback forms
export const dummyFeedbackForms: FeedbackForm[] = [
  {
    id: 'form-1',
    title: 'Course Feedback - Web Development',
    description: 'Please provide your feedback on the Web Development course',
    questions: [
      {
        id: 'q1',
        text: 'How would you rate the overall course content?',
        type: 'rating',
        options: ['1', '2', '3', '4', '5'],
        required: true
      },
      {
        id: 'q2',
        text: 'What did you like most about this course?',
        type: 'text',
        required: true
      },
      {
        id: 'q3',
        text: 'Which topics were most useful?',
        type: 'checkbox',
        options: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'Databases'],
        required: false
      },
      {
        id: 'q4',
        text: 'How would you rate the instructor?',
        type: 'radio',
        options: ['Excellent', 'Good', 'Average', 'Poor'],
        required: true
      }
    ],
    createdBy: '3',
    targetAudience: 'student',
    isActive: true,
    createdAt: '2024-02-01',
    expiresAt: '2024-12-31'
  },
  {
    id: 'form-2',
    title: 'Faculty Satisfaction Survey',
    description: 'Annual faculty satisfaction and workplace environment survey',
    questions: [
      {
        id: 'q1',
        text: 'How satisfied are you with your current position?',
        type: 'radio',
        options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
        required: true
      },
      {
        id: 'q2',
        text: 'What improvements would you suggest?',
        type: 'text',
        required: false
      }
    ],
    createdBy: '3',
    targetAudience: 'faculty',
    isActive: true,
    createdAt: '2024-02-15'
  }
];

// Dummy feedback responses
export const dummyFeedbackResponses: FeedbackResponse[] = [
  {
    id: 'response-1',
    formId: 'form-1',
    userId: '1',
    userName: 'John Doe',
    responses: {
      'q1': '4',
      'q2': 'The practical exercises were very helpful',
      'q3': ['JavaScript', 'React'],
      'q4': 'Excellent'
    },
    submittedAt: '2024-02-10T10:30:00Z'
  }
];