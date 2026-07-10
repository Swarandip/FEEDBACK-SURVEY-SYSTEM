import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { CheckCircle } from 'lucide-react';
import { feedbackApi, ApiFeedbackForm } from '../../api/feedback';
import { useAuth } from '../../context/AuthContext';

export const FeedbackSubmission: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<ApiFeedbackForm | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submittedResponse, setSubmittedResponse] = useState<any | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<{ [questionId: string]: string | string[] }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!formId || !user?.id) return;
      try {
        const [formData, submitted] = await Promise.all([
          feedbackApi.getForm(formId, user.id),
          feedbackApi.checkSubmitted(formId, user.id)
        ]);
        setForm(formData || null);
        setAlreadySubmitted(submitted);

        // If already submitted, load the saved answers so we can show them read-only.
        if (submitted) {
          const allResponses = await feedbackApi.getUserResponses(user.id);
          const match = (allResponses as any[]).find(r => {
            const fid = r.form_id;
            const rid = (typeof fid === 'object' && fid && fid._id) ? fid._id : String(fid);
            return rid === formId;
          });
          setSubmittedResponse(match || null);
        } else {
          setSubmittedResponse(null);
        }
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load form');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [formId, user?.id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-4 text-gray-600">Loading form...</p>
      </div>
    );
  }

  if (loadError || !form) {
    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <Card>
          <p className="text-red-600">{loadError || 'Feedback form not found.'}</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const sems = form.target_semesters || [];
  const notForUserSemester = form.target_audience === 'student' && sems.length > 0 && user?.role === 'student' &&
    (user.semester == null || !sems.includes(user.semester));

  if (notForUserSemester && !alreadySubmitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <Card>
          <p className="text-red-600">This form is not available for your semester.</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  if (alreadySubmitted) {
    const answersByQuestionId = new Map<string, any>();
    const answers = submittedResponse?.answers || [];
    for (const a of answers) {
      if (a?.question_id) answersByQuestionId.set(String(a.question_id), a);
    }

    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <Card>
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Already Submitted</h2>
          <p className="text-gray-600 mb-4">
            You have already submitted feedback for this form.
            {submittedResponse?.submitted_at ? (
              <> Submitted on {new Date(submittedResponse.submitted_at).toLocaleDateString()}.</>
            ) : null}
          </p>

          <div className="text-left space-y-4 mb-6">
            {(form?.questions || []).map((q: any) => {
              const qId = String(q._id);
              const ans = answersByQuestionId.get(qId);

              if (q.question_type === 'rating') {
                const rating = ans?.rating_value;
                const ratingNum = rating != null ? Number(rating) : null;
                return (
                  <div key={qId} className="border border-gray-200 rounded-lg p-3">
                    <p className="font-medium text-gray-900">{q.question_text}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {ratingNum == null ? 'Rating: N/A' : `Rating: ${ratingNum}/5`}
                    </p>
                    <div className="mt-2 flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-lg ${ratingNum != null && star <= ratingNum ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div key={qId} className="border border-gray-200 rounded-lg p-3">
                  <p className="font-medium text-gray-900">{q.question_text}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {ans?.answer_text != null && String(ans.answer_text).trim()
                      ? String(ans.answer_text)
                      : 'Answer: N/A'}
                  </p>
                </div>
              );
            })}
          </div>

          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  // Handle input changes
  const handleResponseChange = (questionId: string, value: string | string[]) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
    
    // Clear error when user provides response
    if (errors[questionId]) {
      setErrors(prev => ({ ...prev, [questionId]: '' }));
    }
  };

  // Handle checkbox changes (multiple selections)
  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    const currentValues = (responses[questionId] as string[]) || [];
    let newValues: string[];
    
    if (checked) {
      newValues = [...currentValues, option];
    } else {
      newValues = currentValues.filter(val => val !== option);
    }
    
    handleResponseChange(questionId, newValues);
  };

  // Validate responses
  const validateResponses = () => {
    const newErrors: { [key: string]: string } = {};
    const questions = form.questions || [];
    
    questions.forEach(question => {
      if (question.is_required) {
        const response = responses[question._id];
        
        if (!response || 
            (typeof response === 'string' && !response.trim()) ||
            (Array.isArray(response) && response.length === 0)) {
          newErrors[question._id] = 'This field is required';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateResponses() || !user?.id) return;
    
    setIsLoading(true);
    
    try {
      const questions = form.questions || [];
      const answers = questions.map(q => {
        const val = responses[q._id];
        if (Array.isArray(val)) {
          return { questionId: q._id, answerText: val.join(', ') };
        }
        if (q.question_type === 'rating' && typeof val === 'string') {
          return { questionId: q._id, ratingValue: parseInt(val, 10) };
        }
        return { questionId: q._id, answerText: typeof val === 'string' ? val : null };
      }).filter(a => a.answerText != null || (a as { ratingValue?: number }).ratingValue != null);

      await feedbackApi.submitResponse({
        formId: form._id,
        userId: user.id,
        isAnonymous: false,
        answers
      });
      setIsSubmitted(true);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to submit' });
    } finally {
      setIsLoading(false);
    }
  };

  // Render question based on type
  const renderQuestion = (question: ApiFeedbackForm['questions'][0]) => {
    const qId = question._id;
    const response = responses[qId];
    const hasError = errors[qId];

    switch (question.question_type) {
      case 'text':
        return (
          <textarea
            value={(response as string) || ''}
            onChange={(e) => handleResponseChange(qId, e.target.value)}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              hasError ? 'border-red-300' : 'border-gray-300'
            }`}
            rows={3}
            placeholder="Enter your response..."
          />
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.map((option: string, index: number) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={qId}
                  value={option}
                  checked={response === option}
                  onChange={(e) => handleResponseChange(qId, e.target.value)}
                  className="text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map((option: string, index: number) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={((response as string[]) || []).includes(option)}
                  onChange={(e) => handleCheckboxChange(qId, option, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={(response as string) || ''}
            onChange={(e) => handleResponseChange(qId, e.target.value)}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select an option...</option>
            {question.options?.map((option: string, index: number) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'rating':
        return (
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleResponseChange(qId, rating.toString())}
                className={`text-3xl transition-colors ${
                  parseInt(response as string) >= rating
                    ? 'text-yellow-400'
                    : 'text-gray-300 hover:text-yellow-200'
                }`}
              >
                ★
              </button>
            ))}
            {response && (
              <span className="ml-3 text-sm text-gray-600 self-center">
                ({response}/5)
              </span>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Show success message after submission
  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <Card>
          <CheckCircle className="h-16 w-16 mx-auto mb-6 text-green-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your feedback has been submitted successfully. We appreciate your time and input.
          </p>
          <div className="space-x-4">
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
            <Button variant="secondary" onClick={() => navigate('/submit-feedback')}>
              Submit Another Form
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Form Header */}
      <Card>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{form.form_title}</h1>
          <p className="text-gray-600 mb-4">{form.form_description || ''}</p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span>{form.questions?.length || 0} questions</span>
            <span>•</span>
            <span className="capitalize">{form.target_audience || 'student'}</span>
            {form.end_date && (
              <>
                <span>•</span>
                <span>Expires: {new Date(form.end_date).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Feedback Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {(form.questions || []).map((question, index) => (
          <Card key={question._id}>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {index + 1}. {question.question_text}
                  {question.is_required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </h3>
                <span className="text-sm text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                  {question.question_type === 'text' ? 'Text' :
                   question.question_type === 'radio' ? 'Single Choice' :
                   question.question_type === 'checkbox' ? 'Multiple Choice' :
                   question.question_type === 'dropdown' ? 'Dropdown' :
                   question.question_type === 'rating' ? 'Rating' : question.question_type}
                </span>
              </div>
              
              {renderQuestion(question)}
              
              {errors[question._id] && (
                <p className="text-sm text-red-600">{errors[question._id]}</p>
              )}
            </div>
          </Card>
        ))}

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            className="flex items-center space-x-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Submit Feedback</span>
          </Button>
        </div>
      </form>
    </div>
  );
};