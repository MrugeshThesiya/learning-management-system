import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { Alert, FullPageLoader } from '../components/Feedback.jsx';
import { coverFor } from '../components/CourseCard.jsx';

export default function CourseDetail() {
  const { id } = useParams();
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`lms_done_${id}`) || '[]'); } catch { return []; }
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [c, l, a, e] = await Promise.all([
          api.listCourses(),
          api.courseLessons(id).catch(() => []),
          api.courseAssignments(id).catch(() => []),
          api.myEnrollments().catch(() => []),
        ]);
        if (!alive) return;
        setCourses(Array.isArray(c) ? c : []);
        setLessons(Array.isArray(l) ? l : []);
        setAssignments(Array.isArray(a) ? a : []);
        setEnrollments(Array.isArray(e) ? e : []);
      } catch (e2) { if (alive) setErr(e2.message); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [id]);

  const course = useMemo(() => courses.find((c) => String(c.id) === String(id)), [courses, id]);
  const enrollment = useMemo(() => enrollments.find((e) => String(e.course_id) === String(id)), [enrollments, id]);
  const lessonProgress = lessons.length ? Math.round((done.length / lessons.length) * 100) : 0;

  useEffect(() => {
    try { localStorage.setItem(`lms_done_${id}`, JSON.stringify(done)); } catch { /* ignore */ }
  }, [done, id]);

  const toggleLesson = (lid) => {
    setDone((prev) => (prev.includes(lid) ? prev.filter((x) => x !== lid) : [...prev, lid]));
  };

  const enroll = async () => {
    setBusy(true);
    try {
      const e = await api.enroll(id);
      setEnrollments((prev) => [...prev, e]);
    } catch (e2) { setErr(e2.message); }
    finally { setBusy(false); }
  };

  const markComplete = async () => {
    if (!enrollment) return;
    try {
      const updated = await api.updateProgress(enrollment.id, lessonProgress >= 100 ? 100 : Math.min(100, Math.max(lessonProgress, 100)));
      setEnrollments((prev) => prev.map((e) => (e.id === enrollment.id ? updated : e)));
    } catch (e2) { setErr(e2.message); }
  };

  if (loading) return <FullPageLoader label="Loading course…" />;
  if (!course && !err) return (
    <div className="text-center py-20">
      <h1 className="text-2xl font-black text-slate-900 dark:text-white">Course not found</h1>
      <p className="text-slate-500 dark:text-slate-400 mt-2">It may have been unpublished.</p>
      <Link to="/courses" className="mt-5 inline-flex px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold">Back to catalog</Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <Link to="/courses" className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">← Back to catalog</Link>
      {err && <Alert>{err}</Alert>}

      {course && (
        <div className={`relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br ${coverFor(course.id)} text-white p-7 sm:p-10`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.25),transparent_50%)]" />
          <div className="relative">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20 border border-white/30 backdrop-blur">Course · Self-paced</span>
            <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">{course.title}</h1>
            <p className="mt-2 text-white/85 max-w-2xl">{course.description || 'A hands-on course with lessons, quizzes and assignments.'}</p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {!enrollment ? (
                <button onClick={enroll} disabled={busy} className="px-6 py-3 rounded-xl bg-white text-slate-900 text-sm font-bold hover:bg-slate-100 disabled:opacity-60">
                  {busy ? 'Enrolling…' : 'Enroll now — free'}
                </button>
              ) : (
                <span className="px-5 py-3 rounded-xl bg-white/20 border border-white/30 backdrop-blur text-sm font-bold">
                  Enrolled · {Math.round(Number(enrollment.progress || 0))}% complete
                </span>
              )}
              <span className="px-5 py-3 rounded-xl bg-black/20 border border-white/20 text-sm font-semibold">{lessons.length} lessons · {assignments.length} assignments</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-slate-900 dark:text-white">Curriculum</h2>
            <span className="text-xs font-bold text-slate-400">{done.length}/{lessons.length} done</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-500 transition-all" style={{ width: `${lessonProgress}%` }} />
          </div>
          <div className="mt-5 space-y-2.5">
            {lessons.length === 0 && <p className="text-sm text-slate-400">No lessons published for this course yet.</p>}
            {lessons.map((l, i) => {
              const checked = done.includes(l.id);
              return (
                <button key={l.id} onClick={() => toggleLesson(l.id)} className={`w-full text-left flex gap-3.5 p-4 rounded-xl border transition ${checked ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-500/10'}`}>
                  <span className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center text-sm font-bold ${checked ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'}`}>
                    {checked ? '✓' : i + 1}
                  </span>
                  <span>
                    <span className={`block text-sm font-bold text-slate-900 dark:text-white ${checked ? 'text-emerald-800 dark:text-emerald-300 line-through' : ''}`}>{l.title}</span>
                    {l.content && <span className="block text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{l.content}</span>}
                  </span>
                </button>
              );
            })}
          </div>
          {enrollment && lessons.length > 0 && (
            <button onClick={markComplete} className="mt-5 w-full rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold py-3 hover:bg-indigo-600 dark:hover:bg-slate-200 transition">
              Sync {lessonProgress}% progress to my record
            </button>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Assignments</h3>
            <div className="mt-3 space-y-2.5">
              {assignments.length === 0 && <p className="text-sm text-slate-400">No assignments yet.</p>}
              {assignments.map((a) => (
                <div key={a.id} className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 p-3.5">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{a.title}</p>
                  {a.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{a.description}</p>}
                  {a.due_date && <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-1.5">Due {new Date(a.due_date).toLocaleDateString()}</p>}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-slate-950 dark:bg-black border dark:border-slate-800 text-white p-6">
            <h3 className="font-extrabold text-sm">How grading works</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">Complete lessons to build progress, pass quizzes for instant scores, and submit assignments for instructor grades.</p>
            <Link to="/my-learning" className="mt-4 block text-center text-sm font-semibold bg-white text-slate-900 rounded-xl py-2.5">Go to My learning</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
