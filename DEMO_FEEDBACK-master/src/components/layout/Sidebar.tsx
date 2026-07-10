import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  FileText, 
  Users, 
  BarChart3, 
  PlusCircle, 
  MessageSquare,
  X 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const getNavigationItems = () => {
    const commonItems = [
      { to: '/dashboard', icon: Home, label: 'Dashboard' }
    ];

    switch (user?.role) {
      case 'student':
        return [
          ...commonItems,
          { to: '/submit-feedback', icon: MessageSquare, label: 'Submit Feedback' },
          { to: '/my-feedback', icon: FileText, label: 'My Submissions' }
        ];
      case 'faculty':
        return [
          ...commonItems,
          { to: '/create-feedback', icon: PlusCircle, label: 'Create Feedback' },
          { to: '/feedback-received', icon: MessageSquare, label: 'Feedback Received' },
          { to: '/reports', icon: BarChart3, label: 'Reports' }
        ];
      case 'admin':
        return [
          ...commonItems,
          { to: '/manage-users', icon: Users, label: 'Manage Users' },
          { to: '/create-feedback', icon: PlusCircle, label: 'Create Feedback' },
          { to: '/all-feedback', icon: FileText, label: 'All Feedback' },
          { to: '/reports', icon: BarChart3, label: 'Reports' }
        ];
      default:
        return commonItems;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-0
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-300 ease-in-out lg:transition-none
        w-64 bg-gray-900 text-white flex flex-col
      `}>
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Feedbackly</h2>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => window.innerWidth < 1024 && onClose()}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                  ${isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            Logged in as: <span className="text-white font-medium">{user?.name}</span>
          </div>
          <div className="text-xs text-gray-400 capitalize mt-1">
            Role: <span className="text-blue-400">{user?.role}</span>
          </div>
        </div>
      </aside>
    </>
  );
};