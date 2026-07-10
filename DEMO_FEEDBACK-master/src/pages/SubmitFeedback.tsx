import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FeedbackSubmission } from '../components/feedback/FeedbackSubmission';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { feedbackApi, ApiFeedbackForm } from '../api/feedback';
import { useState, useEffect } from 'react';

export const SubmitFeedback: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const { user } = useAuth();
  const [forms, setForms] = useState<ApiFeedbackForm[]>([]);
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(!formId);

  useEffect(() => {
    if (formId || !user?.id) return;
    const load = async () => {
      try {
        const [formsRes, respRes] = await Promise.all([
          feedbackApi.getForms(user.id),
          feedbackApi.getUserResponses(user.id)
        ]);
        setForms(formsRes);
        const ids = new Set((respRes as { form_id: { _id?: string } | string }[]).map(r => {
          const fid = r.form_id;
          return (typeof fid === 'object' && fid && fid._id) ? fid._id : String(fid);
        }));
        setSubmittedIds(ids);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [formId, user?.id]);

  if (formId) {
    return <FeedbackSubmission />;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card title="Select a feedback form" subtitle="Choose a form to submit your feedback">
        {forms.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No feedback forms available.</p>
        ) : (
          <div className="space-y-3">
            {forms.map((form) => {
              const done = submittedIds.has(form._id);
              return (
                <div key={form._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <h4 className="font-medium text-gray-900">{form.form_title}</h4>
                    <p className="text-sm text-gray-600">{form.form_description || ''}</p>
                  </div>
                  <Link to={`/submit-feedback/${form._id}`}>
                    <Button size="sm" disabled={done}>
                      {done ? 'Completed' : 'Fill Form'}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};