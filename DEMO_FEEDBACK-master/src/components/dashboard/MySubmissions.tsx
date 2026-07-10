import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { feedbackApi } from '../../api/feedback';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { CheckCircle, FileText, Clock } from 'lucide-react';
import type { ApiFeedbackForm } from '../../api/feedback';

type ApiUserResponse = {
  _id: string;
  form_id: { _id: string; form_title: string } | string;
  submitted_at: string;
  is_anonymous?: boolean;
  answers?: Array<{ rating_value?: number | null; answer_text?: string | null }>;
};

export const MySubmissions: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<ApiUserResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await feedbackApi.getUserResponses(user.id);
        setResponses(res as ApiUserResponse[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const completedCount = responses.length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white p-6">
        <h1 className="text-2xl font-bold">My Submissions</h1>
        <p className="mt-2 opacity-90">
          Department: {user?.department} | Semester: {user?.semester}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Submitted Forms</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{completedCount}</p>
          <p className="text-sm text-gray-600 mt-1">Completed feedback</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Status</h3>
          <p className="text-sm text-gray-600 mt-2">All listed forms are completed</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-3">
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Latest</h3>
          <p className="text-sm text-gray-600 mt-2">
            {responses[0]?.submitted_at ? new Date(responses[0].submitted_at).toLocaleString() : 'N/A'}
          </p>
        </Card>
      </div>

      <Card title="Your submitted feedback" subtitle="Click a form to view the submission status">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-2">Loading submissions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : responses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No submissions yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {responses.map((r) => {
              const formId = typeof r.form_id === 'object' ? r.form_id._id : r.form_id;
              const formTitle = typeof r.form_id === 'object' ? r.form_id.form_title : 'Form';
              const isAnonymous = !!r.is_anonymous;

              return (
                <div
                  key={r._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{formTitle}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Submitted: {r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : 'N/A'}
                      </p>
                      {isAnonymous && (
                        <p className="text-xs text-gray-500 mt-1">Submitted anonymously</p>
                      )}
                    </div>
                    <div>
                      <Link to={`/submit-feedback/${formId}`}>
                        <Button size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

