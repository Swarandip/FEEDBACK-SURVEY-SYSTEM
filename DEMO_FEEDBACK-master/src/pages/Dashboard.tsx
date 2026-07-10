import React from 'react';
import { useAuth } from '../context/AuthContext';
import { StudentDashboard } from '../components/dashboard/StudentDashboard';
import { FacultyDashboard } from '../components/dashboard/FacultyDashboard';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (user?.role) {
      case 'student':
        return <StudentDashboard />;
      case 'faculty':
        return <FacultyDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Invalid user role</p>
          </div>
        );
    }
  };

  return renderDashboard();
};