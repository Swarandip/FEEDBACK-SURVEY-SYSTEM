import React from 'react';
import { Card } from '../common/Card';
import { MessageSquare, BarChart3, Users, TrendingUp } from 'lucide-react';
import { dummyFeedbackForms, dummyFeedbackResponses } from '../../data/dummyData';
import { useAuth } from '../../context/AuthContext';

export const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();

  // Get feedback forms that might be related to this faculty
  const relevantForms = dummyFeedbackForms.filter(form => 
    form.targetAudience === 'student' // Forms where students give feedback about faculty
  );

  // Get responses to those forms
  const responses = dummyFeedbackResponses.filter(response =>
    relevantForms.some(form => form.id === response.formId)
  );

  // Calculate average rating for demonstration
  const ratings = responses.flatMap(response => 
    Object.entries(response.responses)
      .filter(([key, value]) => {
        const form = relevantForms.find(f => f.id === response.formId);
        const question = form?.questions.find(q => q.id === key);
        return question?.type === 'rating' && typeof value === 'string';
      })
      .map(([, value]) => parseInt(value as string))
  ).filter(rating => !isNaN(rating));

  const averageRating = ratings.length > 0 
    ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
    : 'N/A';

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg text-white p-6">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
        <p className="mt-2 opacity-90">
          Department: {user?.department} | Role: Faculty Member
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
            <MessageSquare className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Total Forms</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{relevantForms.length}</p>
          <p className="text-sm text-gray-600 mt-1">Available</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Responses</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{responses.length}</p>
          <p className="text-sm text-gray-600 mt-1">Student feedback</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-3">
            <TrendingUp className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Avg Rating</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{averageRating}</p>
          <p className="text-sm text-gray-600 mt-1">Out of 5</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
            <BarChart3 className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">3</p>
          <p className="text-sm text-gray-600 mt-1">Available</p>
        </Card>
      </div>

      {/* Recent Feedback Overview */}
      <Card title="Recent Feedback Overview" subtitle="Summary of recent student feedback">
        {responses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No feedback received yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {responses.slice(0, 3).map((response) => {
              const form = relevantForms.find(f => f.id === response.formId);
              const ratingResponse = Object.entries(response.responses).find(([key, value]) => {
                const question = form?.questions.find(q => q.id === key);
                return question?.type === 'rating';
              });
              
              return (
                <div key={response.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{form?.title}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(response.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Student: {response.userName}</span>
                      {ratingResponse && (
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-lg ${
                                star <= parseInt(ratingResponse[1] as string)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="text-sm text-gray-600 ml-2">
                            ({ratingResponse[1]}/5)
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Show text responses */}
                    {Object.entries(response.responses).map(([questionId, answer]) => {
                      const question = form?.questions.find(q => q.id === questionId);
                      if (question?.type === 'text' && answer) {
                        return (
                          <div key={questionId} className="mt-2">
                            <p className="text-xs text-gray-500 font-medium">{question.text}</p>
                            <p className="text-sm text-gray-700 mt-1 italic">"{answer}"</p>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Course Performance Summary */}
      <Card title="Course Performance Summary" subtitle="Analysis of feedback across different aspects">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Feedback Categories</h4>
            {[
              { category: 'Course Content', score: 4.2, color: 'blue' },
              { category: 'Teaching Method', score: 4.5, color: 'green' },
              { category: 'Interaction', score: 4.1, color: 'purple' },
              { category: 'Assignments', score: 3.8, color: 'orange' }
            ].map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{item.category}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className={`bg-${item.color}-500 h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${(item.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">
                    {item.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Recent Trends</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-700">Student engagement is improving</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-700">Course content well received</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-gray-700">Assignment feedback positive</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};