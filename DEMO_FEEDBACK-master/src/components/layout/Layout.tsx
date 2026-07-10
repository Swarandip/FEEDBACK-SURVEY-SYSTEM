import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { QueryBot } from '../querybot/QueryBot';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header onToggleSidebar={toggleSidebar} />
        
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
          <QueryBot />
        </main>
      </div>
    </div>
  );
};