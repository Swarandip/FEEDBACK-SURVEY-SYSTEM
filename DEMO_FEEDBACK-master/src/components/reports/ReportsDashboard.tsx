import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../common/Card';
import { useAuth } from '../../context/AuthContext';
import { feedbackApi, ApiFeedbackResponse } from '../../api/feedback';
import { PieChart, DonutChart, RATING_PIE_COLORS } from './Charts';
import { ChevronRight, BarChart3, FileText } from 'lucide-react';

type FormReport = {
  formId: string;
  formTitle: string;
  responses: ApiFeedbackResponse[];
  responseCount: number;
  avgRating: number | null;
  ratingHistogram: Record<number, number>; // 1..5
  textAnswerCount: number;
};

function safeFormId(r: ApiFeedbackResponse): string | null {
  const fid = r.form_id as any;
  if (!fid) return null;
  if (typeof fid === 'object' && fid._id) return String(fid._id);
  return String(fid);
}

function safeFormTitle(r: ApiFeedbackResponse): string {
  const fid = r.form_id as any;
  if (fid && typeof fid === 'object' && fid.form_title) return String(fid.form_title);
  return 'Form';
}

export const ReportsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<ApiFeedbackResponse[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const res =
          user.role === 'admin'
            ? await feedbackApi.getAllResponses()
            : await feedbackApi.getFacultyResponses(user.id);
        setResponses(res);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id, user?.role]);

  const reports = useMemo<FormReport[]>(() => {
    const map = new Map<string, FormReport>();

    for (const r of responses) {
      const formId = safeFormId(r);
      if (!formId) continue;
      const formTitle = safeFormTitle(r);

      if (!map.has(formId)) {
        map.set(formId, {
          formId,
          formTitle,
          responses: [],
          responseCount: 0,
          avgRating: null,
          ratingHistogram: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          textAnswerCount: 0
        });
      }
      map.get(formId)!.responses.push(r);
    }

    for (const [, rep] of map) {
      rep.responseCount = rep.responses.length;
      const ratings: number[] = [];

      for (const resp of rep.responses) {
        for (const a of resp.answers || []) {
          if (a.rating_value != null && Number.isFinite(Number(a.rating_value))) {
            const v = Number(a.rating_value);
            if (v >= 1 && v <= 5) rep.ratingHistogram[v] = (rep.ratingHistogram[v] || 0) + 1;
            ratings.push(v);
          }
          if (a.answer_text != null && String(a.answer_text).trim()) {
            rep.textAnswerCount += 1;
          }
        }
      }

      rep.avgRating = ratings.length ? ratings.reduce((s, n) => s + n, 0) / ratings.length : null;
    }

    return Array.from(map.values()).sort((a, b) => b.responseCount - a.responseCount);
  }, [responses]);

  const selected = useMemo(() => {
    if (!selectedFormId) return null;
    return reports.find((r) => r.formId === selectedFormId) || null;
  }, [reports, selectedFormId]);

  const totalResponses = responses.length;
  const totalForms = reports.length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-lg text-white p-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="mt-2 opacity-90">
          {user?.role === 'admin'
            ? 'System-wide analytics for all feedback.'
            : 'Analytics for feedback forms you created.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-3">
            <FileText className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Forms</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{totalForms}</p>
          <p className="text-sm text-gray-600 mt-1">With responses</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
            <BarChart3 className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Responses</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">{totalResponses}</p>
          <p className="text-sm text-gray-600 mt-1">Total submissions</p>
        </Card>

        <Card>
          <DonutChart
            value={totalForms === 0 ? 0 : Math.min(1, totalResponses / Math.max(1, totalForms * 10))}
            label="Engagement"
            sublabel="Heuristic score (responses vs forms)"
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Feedback forms" subtitle="Click a form to open its report">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto" />
              <p className="mt-2">Loading reports...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No feedback responses yet.</div>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => {
                const isActive = selectedFormId === r.formId;
                return (
                  <button
                    key={r.formId}
                    type="button"
                    onClick={() => setSelectedFormId(r.formId)}
                    className={`w-full text-left p-3 border rounded-lg transition-colors flex items-center justify-between gap-3 ${
                      isActive ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">{r.formTitle}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Responses: {r.responseCount} • Avg rating:{' '}
                        {r.avgRating == null ? 'N/A' : r.avgRating.toFixed(1)}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        <Card
          className="min-w-0"
          title={selected ? `Report: ${selected.formTitle}` : 'Select a feedback form'}
          subtitle={selected ? 'Charts are clickable by selecting a different form.' : 'Choose a form from the list to view charts.'}
        >
          {!selected ? (
            <div className="text-center py-10 text-gray-500">
              Select a form to view its analytics.
            </div>
          ) : (
            <div className="space-y-6 min-w-0">
              <div className="grid grid-cols-1 gap-4 min-w-0 lg:grid-cols-2">
                <Card className="min-w-0 border border-gray-200">
                  <div className="text-sm font-medium text-gray-900">Rating distribution</div>
                  <div className="mt-3 min-w-0 overflow-visible">
                    <PieChart
                      data={[1, 2, 3, 4, 5].map((k) => ({
                        label: `Rating ${k}`,
                        value: selected.ratingHistogram[k] || 0,
                        color: RATING_PIE_COLORS[k - 1]
                      }))}
                    />
                  </div>
                </Card>

                <Card className="min-w-0 border border-gray-200">
                  <div className="text-sm font-medium text-gray-900">Overview</div>
                  <div className="mt-2 space-y-2 text-sm text-gray-700">
                    <div>Responses: <span className="font-medium">{selected.responseCount}</span></div>
                    <div>Avg rating: <span className="font-medium">{selected.avgRating == null ? 'N/A' : selected.avgRating.toFixed(1)}</span></div>
                    <div>Text answers: <span className="font-medium">{selected.textAnswerCount}</span></div>
                  </div>
                </Card>
              </div>

              <div className="text-xs text-gray-500">
                Note: This report uses available rating values across all rating questions in the form.
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

