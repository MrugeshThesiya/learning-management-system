import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { Alert, InlineSpinner } from '../components/Feedback.jsx';

export default function CreateCourse() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [published, setPublished] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setErr(null);
    if (!title.trim()) { setErr('Give your course a title.'); return; }
    setBusy(true);
    try {
      const c = await api.createCourse({ title: title.trim(), description: description.trim(), is_published: published });
      navigate(`/courses/${c.id}/manage`, { replace: true });
    } catch (e2) {
      setErr(e2.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/dashboard" className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">← Back to studio</Link>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Instructor studio</p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Create a new course</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">You'll add lessons, quizzes and assignments on the next screen.</p>
      </div>
      <form onSubmit={submit} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        {err && <Alert>{err}</Alert>}
        <div>
          <label className="text-sm font-semibold text-slate-900 dark:text-white">Course title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Advanced TypeScript Patterns"
            className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-900 dark:text-white">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="What will students learn? Who is it for?"
            className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <label className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300 select-none">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 rounded accent-indigo-600" />
          Publish immediately (otherwise it stays a draft)
        </label>
        <button disabled={busy} className="w-full rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold py-3 hover:bg-indigo-600 dark:hover:bg-slate-200 transition disabled:opacity-60 flex items-center justify-center gap-2">
          {busy && <InlineSpinner />} {busy ? 'Creating…' : 'Create course & continue'}
        </button>
      </form>
    </div>
  );
}
