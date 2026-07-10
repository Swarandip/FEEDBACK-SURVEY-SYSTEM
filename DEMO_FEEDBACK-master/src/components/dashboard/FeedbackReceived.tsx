import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { feedbackApi } from '../../api/feedback';
import { Card } from '../common/Card';
import { FileText, MessageSquare, Star, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../common/Button';

type ApiFacultyResponse = {
  _id: string;
  form_id: { _id: string; form_title: string; questions?: any[] } | string;
  user_id?: { _id: string; full_name?: string } | null;
  submitted_at: string;
  is_anonymous?: boolean;
  answers?: Array<{
    question_id: string;
    option_value?: string | null;
    answer_text?: string | null;
    rating_value?: number | null;
  }>;
};

export const FeedbackReceived: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<ApiFacultyResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState<Record<string, boolean>>({});
  const [expandedFormId, setExpandedFormId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await feedbackApi.getFacultyResponses(user.id);
        setResponses(res as ApiFacultyResponse[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load feedback received');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const grouped = useMemo(() => {
    type FormGroup = {
      formId: string;
      formTitle: string;
      questions: any[];
      responses: ApiFacultyResponse[];
      overallAvgRating: string;
    };

    const map = new Map<string, FormGroup>();

    for (const r of responses) {
      if (!r || !r.form_id || typeof r.form_id !== 'object') continue;
      const formId = String(r.form_id._id);
      const formTitle = r.form_id.form_title;
      const questions = Array.isArray(r.form_id.questions) ? r.form_id.questions : [];

      if (!map.has(formId)) {
        map.set(formId, {
          formId,
          formTitle,
          questions,
          responses: [],
          overallAvgRating: 'N/A'
        });
      }

      map.get(formId)!.responses.push(r);
    }

    for (const [, group] of map) {
      const ratings: number[] = [];
      for (const resp of group.responses) {
        for (const a of resp.answers || []) {
          if (a && a.rating_value != null && Number.isFinite(Number(a.rating_value))) {
            ratings.push(Number(a.rating_value));
          }
        }
      }
      group.overallAvgRating = ratings.length
        ? (ratings.reduce((s, n) => s + n, 0) / ratings.length).toFixed(1)
        : 'N/A';
    }

    return Array.from(map.values()).sort((a, b) => b.responses.length - a.responses.length);
  }, [responses]);

  const totalResponses = responses.length;
  const totalForms = grouped.length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg text-white p-6">
        <h1 className="text-2xl font-bold">Feedback Received</h1>
        <p className="mt-2 opacity-90">All responses for forms you created.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Forms</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{totalForms}</p>
          <p className="text-sm text-gray-600 mt-1">Created by you</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
            <MessageSquare className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Responses</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{totalResponses}</p>
          <p className="text-sm text-gray-600 mt-1">Received</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-3">
            <Star className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Top Form Avg</h3>
          <p className="text-sm text-gray-600 mt-2">
            {grouped[0]?.overallAvgRating !== undefined ? grouped[0]?.overallAvgRating : 'N/A'}
          </p>
        </Card>
      </div>

      <Card title="Feedback (click to open)" subtitle="Click a feedback form to view responses">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-2">Loading responses...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : responses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No feedback received yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map((g) => {
              const isOpen = expandedFormId === g.formId;
              return (
                <div key={g.formId} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedFormId(isOpen ? null : g.formId)}
                    className="w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-start justify-between gap-4"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{g.formTitle}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Responses: {g.responses.length} | Overall Avg Rating: {g.overallAvgRating}
                      </p>
                    </div>
                    <div className="mt-1 text-gray-500">
                      {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="p-4 border-t border-gray-200 bg-white">
                      <div className="space-y-4">
                        {(g.questions || []).length === 0 ? (
                          <p className="text-sm text-gray-600">Questions not available for this form.</p>
                        ) : (
                          (g.questions || []).map((q: any) => {
                      const qId = q?._id ? String(q._id) : null;
                      const qType = q?.question_type;

                      const limit = 5;
                      const listKey = qId ? `${g.formId}:${qId}` : `${g.formId}:unknown`;

                      const entries = qId
                        ? g.responses.map((resp) => {
                            const ans = (resp.answers || []).find((a: any) => String(a.question_id) === qId);
                            return { resp, ans };
                          })
                        : [];

                      const studentLabel = (resp: ApiFacultyResponse) => {
                        if (resp.is_anonymous) return 'Anonymous';
                        if (resp.user_id && (resp.user_id as any).full_name) return (resp.user_id as any).full_name;
                        return 'Student';
                      };

                      if (qType === 'rating') {
                        const ratingEntries = entries
                          .map((e) => ({
                            student: studentLabel(e.resp),
                            rating: e.ans?.rating_value != null ? Number(e.ans.rating_value) : null
                          }))
                          .filter((x) => x.rating != null && Number.isFinite(x.rating as number));

                        const avg = ratingEntries.length
                          ? (ratingEntries.reduce((s, x) => s + (x.rating as number), 0) / ratingEntries.length).toFixed(1)
                          : 'N/A';

                        const list = ratingEntries.map((x, i) => ({
                          key: `${listKey}:r:${i}`,
                          label: `${x.student}: ${x.rating}/5`
                        }));

                        const show = showAll[listKey] || false;
                        const visibleList = show ? list : list.slice(0, limit);

                        return (
                          <div key={listKey} className="border border-gray-200 rounded-lg p-3">
                            <p className="font-medium text-gray-900">{q.question_text}</p>
                            <p className="text-sm text-gray-600 mt-1">Avg rating: {avg}</p>

                            <div className="mt-2 space-y-1">
                              {visibleList.length === 0 ? (
                                <p className="text-sm text-gray-500">No ratings yet.</p>
                              ) : (
                                visibleList.map((item) => (
                                  <div key={item.key} className="text-sm text-gray-700">
                                    {item.label}
                                  </div>
                                ))
                              )}
                            </div>

                            {list.length > limit && (
                              <div className="mt-2">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => setShowAll((prev) => ({ ...prev, [listKey]: !prev[listKey] }))}
                                >
                                  {show ? 'Show less' : 'Show more'}
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      }

                      // Non-rating questions
                      const answerEntries = entries
                        .map((e) => ({
                          student: studentLabel(e.resp),
                          answer: e.ans?.answer_text != null && String(e.ans.answer_text).trim()
                            ? String(e.ans.answer_text)
                            : null
                        }))
                        .filter((x) => x.answer != null);

                      const list = answerEntries.map((x, i) => ({
                        key: `${listKey}:t:${i}`,
                        label: `${x.student}: ${x.answer}`
                      }));

                      const show = showAll[listKey] || false;
                      const visibleList = show ? list : list.slice(0, limit);

                      return (
                        <div key={listKey} className="border border-gray-200 rounded-lg p-3">
                          <p className="font-medium text-gray-900">{q.question_text}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Answers: {answerEntries.length} {answerEntries.length === 1 ? 'submission' : 'submissions'}
                          </p>

                          <div className="mt-2 space-y-1">
                            {visibleList.length === 0 ? (
                              <p className="text-sm text-gray-500">No answers yet.</p>
                            ) : (
                              visibleList.map((item) => (
                                <div key={item.key} className="text-sm text-gray-700">
                                  {item.label}
                                </div>
                              ))
                            )}
                          </div>

                          {list.length > limit && (
                            <div className="mt-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setShowAll((prev) => ({ ...prev, [listKey]: !prev[listKey] }))}
                              >
                                {show ? 'Show less' : 'Show more'}
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

