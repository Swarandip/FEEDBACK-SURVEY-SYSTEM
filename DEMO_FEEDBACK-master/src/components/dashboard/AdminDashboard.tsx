import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Users, FileText, BarChart3, PlusCircle, TrendingUp, AlertCircle } from 'lucide-react';
import { dummyUsers, dummyFeedbackForms, dummyFeedbackResponses } from '../../data/dummyData';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  // Calculate statistics
  const totalUsers = dummyUsers.length;
  const totalForms = dummyFeedbackForms.length;
  const totalResponses = dummyFeedbackResponses.length;
  const activeUsers = dummyUsers.filter(u => u.role !== 'admin').length;

  // User role breakdown
  const usersByRole = {
    students: dummyUsers.filter(u => u.role === 'student').length,
    faculty: dummyUsers.filter(u => u.role === 'faculty').length,
    admins: dummyUsers.filter(u => u.role === 'admin').length
  };

  // Recent activities (mock data)
  const recentActivities = [
    { id: 1, type: 'form_created', description: 'New feedback form created: "Course Evaluation"', time: '2 hours ago' },
    { id: 2, type: 'response_received', description: 'New response received for Web Development feedback', time: '4 hours ago' },
    { id: 3, type: 'user_registered', description: 'New student registered: Alice Johnson', time: '1 day ago' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg text-white p-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 opacity-90">
          Welcome back, {user?.name}! Here's your system overview.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{totalUsers}</p>
          <p className="text-sm text-gray-600 mt-1">{activeUsers} active</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
            <FileText className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Feedback Forms</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{totalForms}</p>
          <p className="text-sm text-gray-600 mt-1">{dummyFeedbackForms.filter(f => f.isActive).length} active</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
            <BarChart3 className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Responses</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">{totalResponses}</p>
          <p className="text-sm text-gray-600 mt-1">This month</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-3">
            <TrendingUp className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Response Rate</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">78%</p>
          <p className="text-sm text-gray-600 mt-1">Average</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions" subtitle="Common administrative tasks">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/create-feedback">
            <Button className="w-full flex items-center justify-center space-x-2" size="lg">
              <PlusCircle className="h-5 w-5" />
              <span>Create New Form</span>
            </Button>
          </Link>
          
          <Link to="/manage-users">
            <Button variant="secondary" className="w-full flex items-center justify-center space-x-2" size="lg">
              <Users className="h-5 w-5" />
              <span>Manage Users</span>
            </Button>
          </Link>
          
          <Link to="/reports">
            <Button variant="secondary" className="w-full flex items-center justify-center space-x-2" size="lg">
              <BarChart3 className="h-5 w-5" />
              <span>View Reports</span>
            </Button>
          </Link>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Overview */}
        <Card title="User Overview" subtitle="Distribution of users by role">
          <div className="space-y-4">
            {[
              { role: 'Students', count: usersByRole.students, color: 'blue', icon: Users },
              { role: 'Faculty', count: usersByRole.faculty, color: 'green', icon: Users },
              { role: 'Admins', count: usersByRole.admins, color: 'purple', icon: Users }
            ].map((item) => {
              const Icon = item.icon;
              const percentage = totalUsers > 0 ? (item.count / totalUsers) * 100 : 0;
              
              return (
                <div key={item.role} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 bg-${item.color}-100 rounded-lg`}>
                      <Icon className={`h-4 w-4 text-${item.color}-600`} />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.role}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`bg-${item.color}-500 h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-8">
                      {item.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card title="Recent Activity" subtitle="Latest system activities">
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {activity.type === 'form_created' && (
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                  {activity.type === 'response_received' && (
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                  {activity.type === 'user_registered' && (
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* System Status */}
      <Card title="System Status" subtitle="Current system health and alerts">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-green-900">All Systems Operational</p>
              <p className="text-xs text-green-700">No issues detected</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-900">1 Form Expiring Soon</p>
              <p className="text-xs text-yellow-700">Check expiration dates</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">Response Rate Up 12%</p>
              <p className="text-xs text-blue-700">Compared to last month</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};