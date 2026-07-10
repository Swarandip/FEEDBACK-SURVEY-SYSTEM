import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { User, LogOut, Menu } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
        <h1 className="ml-2 lg:ml-0 text-xl font-semibold text-gray-900">
          Feedback & Survey System
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-gray-600" />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
          </div>
        </div>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={handleLogout}
          className="flex items-center space-x-1"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
};