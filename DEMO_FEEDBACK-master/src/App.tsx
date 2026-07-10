import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { CreateFeedback } from './pages/CreateFeedback';
import { SubmitFeedback } from './pages/SubmitFeedback';
import { HomePage } from './components/HomePage';
import { LoginOptions } from './components/LoginOptions'; // Import LoginOptions
import { LoginForm } from './components/auth/LoginForm'; // Import LoginForm
import { ContactUs } from './components/ContactUs';
import { MySubmissions } from './components/dashboard/MySubmissions';
import { FeedbackReceived } from './components/dashboard/FeedbackReceived';
import { AdminAllFeedback } from './components/dashboard/AdminAllFeedback';
import { ReportsDashboard } from './components/reports/ReportsDashboard';
import { AboutPage } from './components/AboutPage';
import { TutorialPage } from './components/TutorialPage';
import { LearnMorePage } from './components/LearnMorePage';
// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

// Role-based Route Component
const RoleProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles: string[] 
}> = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

// Public Route Component (redirect if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" /> : <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Home Page */}
      <Route path="/" element={<HomePage />} />

      {/* About Page */}
      <Route path="/about" element={<AboutPage />} />

      {/* Tutorial Page */}
      <Route path="/tutorial" element={<TutorialPage />} />

      {/* Learn More Page */}
      <Route path="/learn-more" element={<LearnMorePage />} />

      {/* Login Options */}
      <Route path="/login-options" element={<LoginOptions />} />

      {/* Contact Us */}
      <Route path="/contact-us" element={<ContactUs />} />

      {/* Dynamic Login Form */}
      <Route path="/login/:role" element={<LoginForm />} />

      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      {/* Admin and Faculty can create feedback */}
      <Route path="/create-feedback" element={
        <ProtectedRoute>
          <RoleProtectedRoute allowedRoles={['admin', 'faculty']}>
            <CreateFeedback />
          </RoleProtectedRoute>
        </ProtectedRoute>
      } />

      <Route path="/manage-users" element={
        <ProtectedRoute>
          <RoleProtectedRoute allowedRoles={['admin']}>
            <div className="text-center py-8">
              <p className="text-gray-500">User Management (Coming Soon)</p>
            </div>
          </RoleProtectedRoute>
        </ProtectedRoute>
      } />

      <Route path="/all-feedback" element={
        <ProtectedRoute>
          <RoleProtectedRoute allowedRoles={['admin']}>
            <AdminAllFeedback />
          </RoleProtectedRoute>
        </ProtectedRoute>
      } />

      {/* Student routes */}
      <Route path="/submit-feedback" element={
        <ProtectedRoute>
          <RoleProtectedRoute allowedRoles={['student']}>
            <SubmitFeedback />
          </RoleProtectedRoute>
        </ProtectedRoute>
      } />

      <Route path="/submit-feedback/:formId" element={
        <ProtectedRoute>
          <RoleProtectedRoute allowedRoles={['student']}>
            <SubmitFeedback />
          </RoleProtectedRoute>
        </ProtectedRoute>
      } />

      <Route path="/my-feedback" element={
        <ProtectedRoute>
          <RoleProtectedRoute allowedRoles={['student']}>
            <MySubmissions />
          </RoleProtectedRoute>
        </ProtectedRoute>
      } />

      {/* Faculty routes */}
      <Route path="/feedback-received" element={
        <ProtectedRoute>
          <RoleProtectedRoute allowedRoles={['faculty']}>
            <FeedbackReceived />
          </RoleProtectedRoute>
        </ProtectedRoute>
      } />

      {/* Shared routes */}
      <Route path="/reports" element={
        <ProtectedRoute>
          <RoleProtectedRoute allowedRoles={['admin', 'faculty']}>
            <ReportsDashboard />
          </RoleProtectedRoute>
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="*" element={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">404</h1>
            <p className="text-gray-600 mt-2">Page not found</p>
          </div>
        </div>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;