export type UserRole = 'student' | 'faculty' | 'admin';

export interface QueryContext {
  role: UserRole;
  pathname: string;
  userName: string;
  department?: string;
  semester?: number | null;
}

function norm(s: string) {
  return s.trim().toLowerCase();
}

/** Rule-based answers for Feedbackly (no external API). */
export function getQueryBotReply(question: string, ctx: QueryContext): string {
  const q = norm(question);
  if (!q) {
    return 'Type a question below, or tap a suggested topic. I can explain how Feedbackly works for your role and the page you are on.';
  }

  const { role, pathname, userName, department, semester } = ctx;
  const dept = department || 'your department';
  const sem =
    semester != null && Number.isFinite(Number(semester))
      ? `semester ${semester}`
      : 'your semester (if set on your profile)';

  // —— Path-aware (checked first) ——
  if (pathname.includes('/my-feedback')) {
    if (/(submission|submitted|history|past|record)/.test(q)) {
      return 'This page lists feedback forms you already submitted. You can open a row to see status. To fill a new form, use **Submit Feedback** or your **Dashboard**.';
    }
  }
  if (pathname.includes('/submit-feedback')) {
    if (/(how|fill|submit|save|complete)/.test(q)) {
      return 'Choose a form, answer each question (ratings, text, choices), then submit. You can only submit once per form unless an admin resets it.';
    }
  }
  if (pathname.includes('/create-feedback')) {
    if (/(who|permission|create|form)/.test(q)) {
      return '**Admins** can create forms for any audience. **Faculty** can create forms aimed at students. Add a title, description, questions, audience, and active dates, then save.';
    }
  }
  if (pathname.includes('/reports')) {
    if (/(chart|pie|report|rating|graph)/.test(q)) {
      return '**Reports** show analytics from real responses: pick a form to see rating distribution (pie chart) and overview stats. Admins see all forms; faculty see forms they created.';
    }
  }
  if (pathname.includes('/feedback-received')) {
    if (/(view|see|student|response)/.test(q)) {
      return 'Here you can review feedback that students submitted on forms relevant to you. Use **Reports** for charts across your forms.';
    }
  }
  if (pathname.includes('/all-feedback')) {
    if (/(all|every|system)/.test(q)) {
      return '**All Feedback** is an admin-only view of responses across the system. Use it to audit submissions and quality.';
    }
  }

  // —— Role + topic ——
  if (role === 'student') {
    if (/(submit|fill|form|feedback).*(where|how)/.test(q) || /how.*submit/.test(q)) {
      return 'Go to **Dashboard** or **Submit Feedback** in the sidebar. Open a form that is not yet marked completed, answer the questions, and submit.';
    }
    if (/pending|incomplete|not submitted|left/.test(q)) {
      return 'On your **Dashboard**, “Pending” counts forms you have not submitted yet. Open one with **Fill Form** until it shows **Submitted**.';
    }
    if (/semester|department|profile|wrong/.test(q)) {
      return `Your profile shows **${dept}** and **${sem}**. If something is wrong, ask an admin to update your account or re-register with correct details if your app allows it.`;
    }
  }

  if (role === 'faculty') {
    if (/create.*form|new form|make form/.test(q)) {
      return 'Use **Create Feedback** in the sidebar. You can target students, add questions, and publish. Then monitor **Feedback Received** and **Reports**.';
    }
    if (/report|analytics|chart/.test(q)) {
      return 'Open **Reports** for charts and summaries for forms you created. Admins have a wider system view; faculty see their own scope.';
    }
  }

  if (role === 'admin') {
    if (/user|manage|role/.test(q)) {
      return '**Manage Users** in the sidebar is reserved for future user administration. For now, users typically register from the login flow or are seeded in the database.';
    }
    if (/all feedback|every response/.test(q)) {
      return 'Use **All Feedback** to browse responses across all forms. **Reports** summarises analytics; pick a form for rating breakdown.';
    }
    if (/who can create|faculty create/.test(q)) {
      return 'Both **admins** and **faculty** can create forms, with different audience rules enforced by the server.';
    }
  }

  // —— General ——
  if (/(login|password|sign in|credential|forgot)/.test(q)) {
    return 'Sign in from **Login** with the email or name and password your organisation uses. Demo seeded admin often uses **admin@example.com** or **Administrator** with password **admin123** if your database was seeded—ask your admin if unsure.';
  }
  if (/(logout|sign out)/.test(q)) {
    return 'Use your **profile / logout** control in the top header to sign out safely.';
  }
  if (/(backend|api|error|not work|broken|load)/.test(q)) {
    return 'Feedbackly needs the **backend API** (e.g. on port 5000) and **MongoDB** running. If pages spin or show errors, check the browser Network tab for failed requests.';
  }
  if (/(hello|hi|hey|thanks|thank you)/.test(q)) {
    return `Hi **${userName}**! Ask me about submissions, forms, reports, or your **${role}** tools—I answer from built-in help (not a live internet AI).`;
  }
  if (/(what|who) (is|are) feedbackly|about (the )?app/.test(q)) {
    return '**Feedbackly** is this feedback & survey system: students submit course feedback, faculty review and can create student forms, admins oversee forms and system-wide responses.';
  }

  return `I did not match a specific topic. As a **${role}**, try the sidebar: **${role === 'student' ? 'Submit Feedback, My Submissions' : role === 'faculty' ? 'Create Feedback, Feedback Received, Reports' : 'Create Feedback, All Feedback, Reports, Manage Users'}**. Rephrase with words like *submit*, *form*, *report*, or *password*.`;
}

export function getSuggestedQuestions(role: UserRole): string[] {
  switch (role) {
    case 'student':
      return [
        'How do I submit feedback?',
        'What does Pending mean on my dashboard?',
        'Where can I see my past submissions?'
      ];
    case 'faculty':
      return [
        'How do I create a feedback form?',
        'Where are analytics and charts?',
        'Who can see student responses?'
      ];
    case 'admin':
      return [
        'What can admins do in Feedbackly?',
        'Where do I see all responses?',
        'Who can create feedback forms?'
      ];
    default:
      return ['What is Feedbackly?', 'How do I log out?'];
  }
}
