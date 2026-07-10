import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Plus, Trash2, Save } from 'lucide-react';
import { Question } from '../../types';
import { feedbackApi } from '../../api/feedback';
import { useAuth } from '../../context/AuthContext';
import { RecipientUploadSection, RecipientState } from './RecipientUploadSection';

export const FeedbackCreator: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const isAdmin = user?.role === 'admin';

  // Form state - faculty can only target students
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAudience: 'student' as 'student' | 'faculty' | 'all',
    targetSemesters: [] as number[],
    expiresAt: ''
  });

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'q1',
      text: '',
      type: 'text',
      options: [],
      required: true
    }
  ]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [recipient, setRecipient] = useState<RecipientState>({
    targetStudentIds: [],
    matchResult: null,
    fileName: null
  });

  // Handle form data changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'targetAudience' && value !== 'student') {
      setRecipient({ targetStudentIds: [], matchResult: null, fileName: null });
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const toggleSemester = (sem: number) => {
    setFormData(prev => ({
      ...prev,
      targetSemesters: prev.targetSemesters.includes(sem)
        ? prev.targetSemesters.filter(s => s !== sem)
        : [...prev.targetSemesters, sem].sort((a, b) => a - b)
    }));
  };

  const selectAllSemesters = () => {
    setFormData(prev => ({
      ...prev,
      targetSemesters: prev.targetSemesters.length === 8 ? [] : [1, 2, 3, 4, 5, 6, 7, 8]
    }));
  };

  // Handle question changes
  const handleQuestionChange = (questionId: string, field: keyof Question, value: any) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  // Add new question
  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q${questions.length + 1}`,
      text: '',
      type: 'text',
      options: [],
      required: true
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  // Remove question
  const removeQuestion = (questionId: string) => {
    if (questions.length > 1) {
      setQuestions(prev => prev.filter(q => q.id !== questionId));
    }
  };

  // Add option to question
  const addOption = (questionId: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, options: [...(q.options || []), ''] }
        : q
    ));
  };

  // Remove option from question
  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, options: q.options?.filter((_, i) => i !== optionIndex) }
        : q
    ));
  };

  // Update option text
  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { 
            ...q, 
            options: q.options?.map((opt, i) => i === optionIndex ? value : opt) 
          }
        : q
    ));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Form title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Form description is required';
    }
    
    // Validate questions
    questions.forEach((question, index) => {
      if (!question.text.trim()) {
        newErrors[`question_${question.id}`] = `Question ${index + 1} text is required`;
      }
      
      if (['radio', 'checkbox', 'dropdown'].includes(question.type)) {
        if (!question.options || question.options.length === 0) {
          newErrors[`question_${question.id}_options`] = `Question ${index + 1} needs at least one option`;
        } else if (question.options.some(opt => !opt.trim())) {
          newErrors[`question_${question.id}_options`] = `Question ${index + 1} has empty options`;
        }
      }
      
      if (question.type === 'rating' && (!question.options || question.options.length === 0)) {
        // Set default rating options if not set
        question.options = ['1', '2', '3', '4', '5'];
      }
    });
    
    if (
      formData.targetAudience === 'student' &&
      recipient.fileName &&
      recipient.targetStudentIds.length === 0
    ) {
      newErrors.recipients =
        'No students matched from your file. Check names, semesters, and that students exist in the database.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user?.id) return;
    
    setIsLoading(true);
    
    try {
      await feedbackApi.createForm({
        formTitle: formData.title.trim(),
        formDescription: formData.description.trim(),
        createdBy: user.id,
        createdByName: user.name,
        createdByRole: user.role,
        isAnonymous: false,
        targetAudience: formData.targetAudience,
        targetSemesters: formData.targetAudience === 'student' ? formData.targetSemesters : [],
        targetStudentIds:
          formData.targetAudience === 'student' && recipient.targetStudentIds.length > 0
            ? recipient.targetStudentIds
            : undefined,
        startDate: null,
        endDate: formData.expiresAt || null,
        questions: questions.map(q => ({
          text: q.text.trim(),
          type: q.type,
          isRequired: q.required,
          options: q.type === 'rating' ? ['1', '2', '3', '4', '5'] : (q.options?.filter(opt => opt.trim()) || [])
        }))
      });
      alert('Feedback form created successfully!');
      navigate('/dashboard');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create form');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white p-6">
        <h1 className="text-2xl font-bold">Create Feedback Form</h1>
        <p className="mt-2 opacity-90">Design a new feedback form for your audience</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Form Information */}
        <Card title="Form Information" subtitle="Basic details about your feedback form">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Form Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter form title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                rows={3}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe what this feedback form is about"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <select
                  id="targetAudience"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleFormChange}
                  disabled={!isAdmin}
                  className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="student">Students</option>
                  <option value="faculty">Faculty</option>
                  <option value="all">All Users</option>
                </select>
                {!isAdmin && (
                  <p className="mt-1 text-xs text-gray-500">Faculty can only create forms for students.</p>
                )}
              </div>

              <div>
                <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  id="expiresAt"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleFormChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {formData.targetAudience === 'student' && (
              <>
                <RecipientUploadSection
                  targetSemesters={formData.targetSemesters}
                  value={recipient}
                  onChange={setRecipient}
                />
                {errors.recipients && (
                  <p className="text-sm text-red-600">{errors.recipients}</p>
                )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Semesters (leave empty for all)
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  <button
                    type="button"
                    onClick={selectAllSemesters}
                    className="text-sm px-3 py-1.5 rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100"
                  >
                    {formData.targetSemesters.length === 8 ? 'Clear all' : 'All semesters'}
                  </button>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <label key={sem} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.targetSemesters.includes(sem)}
                        onChange={() => toggleSemester(sem)}
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-sm">Sem {sem}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Filter by semester. With a student list file, names are matched only within the semester(s) you select here. Empty = all semesters.
                </p>
              </div>
              </>
            )}
          </div>
        </Card>

        {/* Questions Section */}
        <Card title="Questions" subtitle="Add questions to your feedback form">
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    Question {index + 1}
                  </h4>
                  {questions.length > 1 && (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeQuestion(question.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text *
                    </label>
                    <input
                      type="text"
                      value={question.text}
                      onChange={(e) => handleQuestionChange(question.id, 'text', e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors[`question_${question.id}`] ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your question"
                    />
                    {errors[`question_${question.id}`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`question_${question.id}`]}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Type
                      </label>
                      <select
                        value={question.type}
                        onChange={(e) => handleQuestionChange(question.id, 'type', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="text">Text Input</option>
                        <option value="radio">Single Choice</option>
                        <option value="checkbox">Multiple Choice</option>
                        <option value="dropdown">Dropdown</option>
                        <option value="rating">Rating (1-5)</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center space-x-2 mt-6">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(e) => handleQuestionChange(question.id, 'required', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="text-sm text-gray-700">Required question</span>
                      </label>
                    </div>
                  </div>

                  {/* Options for radio, checkbox, dropdown */}
                  {['radio', 'checkbox', 'dropdown'].includes(question.type) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options *
                      </label>
                      <div className="space-y-2">
                        {question.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                            <Button
                              type="button"
                              variant="danger"
                              size="sm"
                              onClick={() => removeOption(question.id, optionIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => addOption(question.id)}
                          className="flex items-center space-x-1"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Option</span>
                        </Button>
                      </div>
                      {errors[`question_${question.id}_options`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`question_${question.id}_options`]}</p>
                      )}
                    </div>
                  )}

                  {/* Rating preview */}
                  {question.type === 'rating' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating Scale (1-5)
                      </label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className="text-2xl text-yellow-400">★</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="secondary"
              onClick={addQuestion}
              className="flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Question</span>
            </Button>
          </div>
        </Card>

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
            <Save className="h-4 w-4" />
            <span>Create Form</span>
          </Button>
        </div>
      </form>
    </div>
  );
};