const API_URL = 'https://feedback-survey-system-i3ty.onrender.com/api';

export interface ApiQuestion {
  _id: string;
  question_text: string;
  question_type: string;
  is_required: boolean;
  options: string[];
  question_order: number;
}

export interface MatchedRecipient {
  id: string;
  fullName: string;
  email?: string;
  semester?: number | null;
  matchedFrom: string;
}

export interface MatchRecipientsResult {
  parsedCount: number;
  matched: MatchedRecipient[];
  unmatched: string[];
  matchedCount: number;
  unmatchedCount: number;
  targetSemesters: number[];
}

export interface ApiFeedbackForm {
  _id: string;
  form_title: string;
  form_description?: string;
  target_audience?: 'student' | 'faculty' | 'all';
  target_semesters?: number[];
  target_student_ids?: string[];
  is_active: boolean;
  start_date?: string | null;
  end_date?: string | null;
  created_by_name?: string;
  questions: ApiQuestion[];
}

export interface ApiFeedbackResponse {
  _id: string;
  form_id: { _id: string; form_title: string } | string;
  user_id?: { _id: string; full_name: string } | null;
  submitted_at: string;
  is_anonymous: boolean;
  answers?: Array<{
    question_id: string;
    option_value?: string | null;
    answer_text?: string | null;
    rating_value?: number | null;
  }>;
}

export const feedbackApi = {
  async getForms(forUserId?: string): Promise<ApiFeedbackForm[]> {
    const q = forUserId ? `?forUserId=${encodeURIComponent(forUserId)}` : '';
    const res = await fetch(`${API_URL}/feedback/forms${q}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to fetch forms');
    return json.data || [];
  },

  async matchRecipients(file: File, targetSemesters: number[]): Promise<MatchRecipientsResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetSemesters', JSON.stringify(targetSemesters));
    const res = await fetch(`${API_URL}/feedback/match-recipients`, {
      method: 'POST',
      body: formData
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to match recipients');
    return json;
  },

  async getForm(formId: string, forUserId?: string): Promise<ApiFeedbackForm | null> {
    const q = forUserId ? `?forUserId=${encodeURIComponent(forUserId)}` : '';
    const res = await fetch(`${API_URL}/feedback/forms/${formId}${q}`);
    const json = await res.json();
    if (!json.success) {
      if (res.status === 403) throw new Error(json.message || 'Access denied');
      return null;
    }
    return json.data;
  },

  async createForm(data: {
    formTitle: string;
    formDescription: string;
    createdBy: string;
    createdByName: string;
    createdByRole?: string;
    isAnonymous?: boolean;
    targetAudience?: 'student' | 'faculty' | 'all';
    targetSemesters?: number[];
    targetStudentIds?: string[];
    startDate?: string | null;
    endDate?: string | null;
    questions: Array<{
      text: string;
      type: string;
      isRequired: boolean;
      options?: string[];
    }>;
  }) {
    const res = await fetch(`${API_URL}/feedback/forms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to create form');
    return json.formId;
  },

  async checkSubmitted(formId: string, userId: string): Promise<boolean> {
    const res = await fetch(
      `${API_URL}/feedback/responses/check?formId=${encodeURIComponent(formId)}&userId=${encodeURIComponent(userId)}`
    );
    const json = await res.json();
    if (!json.success) return false;
    return !!json.submitted;
  },

  async submitResponse(data: {
    formId: string;
    userId: string | null;
    isAnonymous: boolean;
    answers: Array<{
      questionId: string;
      answerText?: string | null;
      optionValue?: string | null;
      ratingValue?: number | null;
    }>;
  }) {
    const res = await fetch(`${API_URL}/feedback/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to submit response');
    return json.responseId;
  },

  async getUserResponses(userId: string) {
    const res = await fetch(`${API_URL}/feedback/responses/by-user/${userId}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to fetch responses');
    return json.data || [];
  },

  async getFacultyResponses(facultyId: string): Promise<ApiFeedbackResponse[]> {
    const res = await fetch(`${API_URL}/feedback/responses/by-faculty/${encodeURIComponent(facultyId)}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to fetch faculty responses');
    return json.data || [];
  },

  async getAllResponses(): Promise<ApiFeedbackResponse[]> {
    const res = await fetch(`${API_URL}/feedback/responses/all`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to fetch all responses');
    return json.data || [];
  }
};
