import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, Send, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getQueryBotReply, getSuggestedQuestions, type UserRole } from './queryBotBrain';

type Msg = { id: string; from: 'user' | 'bot'; text: string };

function mdLite(s: string): React.ReactNode {
  const parts = s.split(/\*\*(.+?)\*\*/g);
  return parts.map((chunk, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-gray-900">
        {chunk}
      </strong>
    ) : (
      <span key={i}>{chunk}</span>
    )
  );
}

export const QueryBot: React.FC = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const role = (user?.role || 'student') as UserRole;

  const ctx = useMemo(
    () => ({
      role,
      pathname,
      userName: user?.name || 'there',
      department: user?.department,
      semester: user?.semester ?? null
    }),
    [role, pathname, user?.name, user?.department, user?.semester]
  );

  const suggestions = useMemo(() => getSuggestedQuestions(role), [role]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (!open || messages.length > 0) return;
    setMessages([
      {
        id: 'welcome',
        from: 'bot',
        text: `Hi **${ctx.userName}**! I am the Feedbackly assistant. Ask anything about **${role}** tasks or this page (**${pathname}**).`
      }
    ]);
  }, [open, ctx.userName, role, pathname, messages.length]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const reply = getQueryBotReply(trimmed, ctx);
    setMessages((m) => [
      ...m,
      { id: `u-${Date.now()}`, from: 'user', text: trimmed },
      { id: `b-${Date.now()}`, from: 'bot', text: reply }
    ]);
    setInput('');
  };

  if (!user) return null;

  return (
    <section
      className="mt-10 border-t border-gray-200 pt-6 pb-2"
      aria-label="Feedbackly help assistant"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-3 text-left shadow-sm transition hover:from-indigo-100/80 hover:to-violet-100/80 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 sm:text-base">Query assistant</h2>
            <p className="text-xs text-gray-600 sm:text-sm truncate">
              Ask about Feedbackly — answers for your role and current page
            </p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-indigo-700" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-indigo-700" />
        )}
      </button>

      {open && (
        <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="max-h-[min(420px,55vh)] overflow-y-auto px-3 py-3 sm:px-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-3 flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed sm:max-w-[85%] ${
                    msg.from === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md border border-gray-100'
                  }`}
                >
                  {msg.from === 'bot' ? mdLite(msg.text) : msg.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-gray-100 bg-gray-50/80 px-3 py-2 sm:px-4">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Suggested
            </p>
            <div className="mb-3 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-indigo-200 bg-white px-3 py-1 text-left text-xs text-indigo-800 transition hover:bg-indigo-50"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <label htmlFor="query-bot-input" className="sr-only">
                Your question
              </label>
              <div className="relative min-w-0 flex-1">
                <MessageCircle className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="query-bot-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g. How do I submit feedback?"
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoComplete="off"
                />
              </div>
              <button
                type="submit"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
            <p className="mt-2 text-[10px] text-gray-400">
              Built-in help only — not connected to an external AI. Answers depend on your role and page.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
