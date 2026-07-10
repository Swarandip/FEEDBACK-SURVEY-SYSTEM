// Type definitions for the application
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'faculty' | 'admin';
  department?: string;
  semester?: number;
  createdAt: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'text' | 'radio' | 'checkbox' | 'dropdown' | 'rating';
  options?: string[];
  required: boolean;
}

export interface FeedbackForm {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdBy: string;
  targetAudience: 'student' | 'faculty' | 'all';
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface FeedbackResponse {
  id: string;
  formId: string;
  userId: string;
  userName: string;
  responses: { [questionId: string]: string | string[] };
  submittedAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt'> & { password: string }) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}