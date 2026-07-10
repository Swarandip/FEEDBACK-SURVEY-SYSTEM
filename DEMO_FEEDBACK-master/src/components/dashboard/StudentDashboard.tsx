import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { MessageSquare, FileText, CheckCircle, Clock } from 'lucide-react';
import { feedbackApi, ApiFeedbackForm } from '../../api/feedback';
import { useAuth } from '../../context/AuthContext';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [forms, setForms] = useState<ApiFeedbackForm[]>([]);
  const [submittedFormIds, setSubmittedFormIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const [formsRes, responsesRes] = await Promise.all([
          feedbackApi.getForms(user.id),
          feedbackApi.getUserResponses(user.id)
        ]);
        setForms(formsRes);
        const ids = new Set((responsesRes as { form_id: { _id?: string } | string }[]).map(r => {
          const fid = r.form_id;
          return (typeof fid === 'object' && fid && fid._id) ? fid._id : String(fid);
        }));
        setSubmittedFormIds(ids);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const availableForms = forms;

  const submittedFeedback = Array.from(submittedFormIds).map(id => {
    const form = forms.find(f => f._id === id);
    return { formId: id, formTitle: form?.form_title || 'Form' };
  });

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white p-6">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
        <p className="mt-2 opacity-90">
          Department: {user?.department} | Semester: {user?.semester}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
            <MessageSquare className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Available Forms</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{availableForms.length}</p>
          <p className="text-sm text-gray-600 mt-1">Ready to fill</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Submitted</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{submittedFeedback.length}</p>
          <p className="text-sm text-gray-600 mt-1">Completed forms</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-3">
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">{availableForms.length - submittedFeedback.length}</p>
          <p className="text-sm text-gray-600 mt-1">To be filled</p>
        </Card>
      </div>

      {/* Available Feedback Forms */}
      <Card title="Available Feedback Forms" subtitle="Click on any form to provide your feedback">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-2">Loading forms...</p>
          </div>
        ) : availableForms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No feedback forms available at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {availableForms.map((form) => {
              const isSubmitted = submittedFormIds.has(form._id);
              
              return (
                <div
                  key={form._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{form.form_title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{form.form_description || ''}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>{form.questions?.length || 0} questions</span>
                        {form.end_date && (
                          <span>Expires: {new Date(form.end_date).toLocaleDateString()}</span>
                        )}
                        <span className="capitalize">{form.target_audience || 'student'}</span>
                        {(form.target_semesters?.length ?? 0) > 0 && (
                          <span>• Sem: {form.target_semesters!.join(', ')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 ml-4">
                      {isSubmitted && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Submitted
                        </span>
                      )}
                      <Link to={`/submit-feedback/${form._id}`}>
                        <Button size="sm" disabled={isSubmitted}>
                          {isSubmitted ? 'Completed' : 'Fill Form'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Recent Submissions */}
      <Card title="Recent Submissions" subtitle="Your latest feedback submissions">
        {submittedFeedback.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>You haven't submitted any feedback yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submittedFeedback.slice(0, 5).map((submission) => (
                <div key={submission.formId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h5 className="font-medium text-gray-900">{submission.formTitle}</h5>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </span>
                </div>
              ))}
            
            {submittedFeedback.length > 5 && (
              <div className="text-center pt-3 border-t border-gray-200">
                <Link to="/my-feedback">
                  <Button variant="secondary" size="sm">
                    View All Submissions
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};