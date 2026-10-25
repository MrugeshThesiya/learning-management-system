import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { Alert, FullPageLoader } from '../components/Feedback.jsx';
import { coverFor } from '../components/CourseCard.jsx';

const btnPrimary = 'rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold px-4 py-2.5 hover:bg-indigo-600 dark:hover:bg-slate-200 transition disabled:opacity-60';
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [done, setDone] = useState([]);
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setErr(null);
    let c;
    try { c = await api.getCourse(id); } catch (e) {
      if (e.status === 404 || e.status === 400) setNotFound(true); else setErr(e.message);
      setLoading(false);
      return;
    }
    setCourse(c);
    try {
      const [l, a, q, enrs] = await Promise.all([
        api.courseLessons(id), api.courseAssignments(id), api.courseQuizzes(id), api.myEnrollments(),
      ]);
      setLessons(l); setAssignments(a); setQuizzes(q);
      const mine = enrs.find((e) => String(e.course_id) === String(id)) || null;
      setEnrollment(mine);
      setDone(mine ? (await api.courseProgress(id)).completed : []);
    } catch (e) { setErr(e.message); }
    setLoading(false);
  }, [id]);

  useEffect(() => { setLoading(true); setNotFound(false); load(); }, [load]);

  const progress = enrollment ? Math.round(Number(enrollment.progress || 0)) : 0;
  const learner = !course?.can_manage;
  const doneSet = useMemo(() => new Set(done), [done]);

  const enroll = async () => {
    setBusy(true); setErr(null);
    try { await api.enroll(id); await load(); } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  const toggleLesson = async (lesson) => {
    if (!enrollment) return;
    setErr(null);
    const wasDone = doneSet.has(lesson.id);
    // optimistic, then reconcile with the server's authoritative progress
    setDone((p) => (wasDone ? p.filter((x) => x !== lesson.id) : [...p, lesson.id]));
    try {
      const r = await api.setLessonDone(id, lesson.id, !wasDone);
      setDone(r.completed);
      setEnrollment((e) => ({ ...e, progress: r.progress }));
    } catch (e) {
      setDone((p) => (wasDone ? [...p, lesson.id] : p.filter((x) => x !== lesson.id)));
      setErr(e.message);
    }
  };

  if (loading) return <FullPageLoader label="Loading course…" />;
  if (notFound || !course) return (
    <div className="text-center py-20">
      <h1 className="text-2xl font-black text-slate-900 dark:text-white">{err ? 'Could not load course' : 'Course not found'}</h1>
      <p className="text-slate-500 dark:text-slate-400 mt-2">{err || 'It may have been unpublished or removed.'}</p>
      <Link to="/courses" className="mt-5 inline-flex px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold">Back to catalog</Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <Link to="/courses" className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">← Back to catalog</Link>
      {err && <Alert>{err}</Alert>}

      <div className={`relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br ${coverFor(course.id)} text-white p-7 sm:p-10`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.25),transparent_50%)]" />
        <div className="relative">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20 border border-white/30 backdrop-blur">
            {course.is_published ? 'Course · Self-paced' : 'Draft · only you can see this'}
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">{course.title}</h1>
          <p className="mt-2 text-white/85 max-w-2xl">{course.description || 'A hands-on course with lessons, quizzes and assignments.'}</p>
          <p className="mt-2 text-sm text-white/70">Taught by {course.instructor_name || 'an instructor'}</p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {course.can_manage ? (
              <Link to={`/courses/${course.id}/manage`} className="px-6 py-3 rounded-xl bg-white text-slate-900 text-sm font-bold hover:bg-slate-100">Manage course</Link>
            ) : !enrollment ? (
              <button onClick={enroll} disabled={busy} className="px-6 py-3 rounded-xl bg-white text-slate-900 text-sm font-bold hover:bg-slate-100 disabled:opacity-60">
                {busy ? 'Enrolling…' : 'Enroll now — free'}
              </button>
            ) : (
              <span className="px-5 py-3 rounded-xl bg-white/20 border border-white/30 backdrop-blur text-sm font-bold">Enrolled · {progress}% complete</span>
            )}
            <span className="px-5 py-3 rounded-xl bg-black/20 border border-white/20 text-sm font-semibold">
              {plural(lessons.length, 'lesson')} · {plural(quizzes.length, 'quiz', 'quizzes')} · {plural(assignments.length, 'assignment')}
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
        <section className={card}>
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-slate-900 dark:text-white">Curriculum</h2>
            {enrollment && <span className="text-xs font-bold text-slate-400">{done.length}/{lessons.length} done</span>}
          </div>
          {enrollment && (
            <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
          {!enrollment && learner && lessons.length > 0 && (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Enroll to track your progress and mark lessons complete.</p>
          )}
          <div className="mt-5 space-y-2.5">
            {lessons.length === 0 && <p className="text-sm text-slate-400">No lessons have been added to this course yet.</p>}
            {lessons.map((l, i) => {
              const checked = doneSet.has(l.id);
              const expanded = open === l.id;
              return (
                <div key={l.id} className={`rounded-xl border transition ${checked ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30' : 'border-slate-200 dark:border-slate-700'}`}>
                  <div className="flex items-center gap-3.5 p-4">
                    <button
                      onClick={() => toggleLesson(l)} disabled={!enrollment}
                      title={enrollment ? (checked ? 'Mark as not done' : 'Mark as done') : 'Enroll to track progress'}
                      aria-label={checked ? 'Mark as not done' : 'Mark as done'}
                      className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center text-sm font-bold transition ${checked ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'} ${enrollment ? 'hover:ring-2 hover:ring-emerald-400' : 'cursor-default'}`}>
                      {checked ? '✓' : i + 1}
                    </button>
                    <button onClick={() => setOpen(expanded ? null : l.id)} className="flex-1 text-left">
                      <span className={`block text-sm font-bold ${checked ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>{l.title}</span>
                    </button>
                    <button onClick={() => setOpen(expanded ? null : l.id)} className="text-xs font-semibold text-slate-400" aria-label="Toggle lesson content">{expanded ? 'Hide' : 'Read'}</button>
                  </div>
                  {expanded && (
                    <div className="px-4 pb-4 pl-[3.75rem] text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                      {l.content || 'No notes for this lesson.'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <aside className="space-y-4">
          <div className={card}>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Quizzes</h3>
            <div className="mt-3 space-y-2.5">
              {quizzes.length === 0 && <p className="text-sm text-slate-400">No quizzes yet.</p>}
              {quizzes.map((q) => (
                <QuizRunner key={q.id} quiz={q} canTake={!!enrollment} onTaken={load} />
              ))}
            </div>
          </div>
          <div className={card}>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Assignments</h3>
            <div className="mt-3 space-y-2.5">
              {assignments.length === 0 && <p className="text-sm text-slate-400">No assignments yet.</p>}
              {assignments.map((a) => (
                <AssignmentCard key={a.id} assignment={a} canSubmit={!!enrollment} onSubmitted={load} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function QuizRunner({ quiz, canTake, onTaken }) {
  const [state, setState] = useState('idle'); // idle | taking | result
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  const start = async () => {
    setErr(null); setBusy(true);
    try {
      const d = await api.getQuiz(quiz.id);
      setQuestions(d.questions); setAnswers({}); setResult(null); setState('taking');
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  const submit = async () => {
    if (questions.some((q) => answers[q.id] === undefined)) { setErr('Answer every question before submitting.'); return; }
    setErr(null); setBusy(true);
    try {
      setResult(await api.submitQuiz(quiz.id, answers));
      setState('result');
      onTaken?.();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{quiz.title}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {quiz.questions} {quiz.questions === 1 ? 'question' : 'questions'}
            {quiz.best && <> · Best {quiz.best.score}/{quiz.best.total}</>}
          </p>
        </div>
        {state === 'idle' && (
          <button onClick={start} disabled={!canTake || busy || !quiz.questions} title={canTake ? '' : 'Enroll to take quizzes'} className={`${btnPrimary} !py-1.5 !px-3 text-xs shrink-0`}>
            {quiz.best ? 'Retake' : 'Take quiz'}
          </button>
        )}
      </div>
      {err && <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">{err}</p>}
      {state === 'taking' && (
        <div className="mt-3 space-y-4">
          {questions.map((q, qi) => (
            <fieldset key={q.id}>
              <legend className="text-sm font-semibold text-slate-900 dark:text-white">{qi + 1}. {q.question}</legend>
              <div className="mt-1.5 space-y-1">
                {q.options.map((o, oi) => (
                  <label key={oi} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input type="radio" name={`q${quiz.id}-${q.id}`} checked={answers[q.id] === oi} onChange={() => setAnswers((p) => ({ ...p, [q.id]: oi }))} className="accent-indigo-600" />
                    {o}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <div className="flex gap-2">
            <button onClick={submit} disabled={busy} className={btnPrimary}>{busy ? 'Submitting…' : 'Submit answers'}</button>
            <button onClick={() => setState('idle')} className="text-sm font-semibold text-slate-500 px-3">Cancel</button>
          </div>
        </div>
      )}
      {state === 'result' && result && (
        <div className="mt-3 space-y-3">
          <p className="text-sm font-bold text-slate-900 dark:text-white">You scored {result.score}/{result.total} ({Math.round((result.score / result.total) * 100)}%)</p>
          <ul className="space-y-1.5">
            {questions.map((q, qi) => {
              const r = result.results.find((x) => x.id === q.id);
              return (
                <li key={q.id} className={`text-xs rounded-lg px-2.5 py-1.5 ${r?.correct ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-500/15 text-red-800 dark:text-red-300'}`}>
                  {qi + 1}. {r?.correct ? 'Correct' : `Incorrect — answer: ${q.options[r?.correct_index]}`}
                </li>
              );
            })}
          </ul>
          <button onClick={start} className={`${btnPrimary} !py-1.5 !px-3 text-xs`}>Try again</button>
        </div>
      )}
    </div>
  );
}

function AssignmentCard({ assignment: a, canSubmit, onSubmitted }) {
  const mine = a.my_submission;
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(mine?.content || '');
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setErr(null); setBusy(true);
    try { await api.submitAssignment(a.id, text); setEditing(false); await onSubmitted?.(); }
    catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 p-3.5">
      <p className="text-sm font-bold text-slate-900 dark:text-white">{a.title}</p>
      {a.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 whitespace-pre-wrap">{a.description}</p>}
      {a.due_date && <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-1.5">Due {new Date(a.due_date).toLocaleDateString()}</p>}
      {mine && !editing && (
        <div className="mt-2 text-xs">
          <p className="font-semibold text-emerald-600 dark:text-emerald-400">
            Submitted {new Date(mine.submitted_at).toLocaleDateString()} · {mine.grade !== null && mine.grade !== undefined ? `Grade: ${mine.grade}/100` : 'Awaiting grade'}
          </p>
          <p className="mt-1 text-slate-600 dark:text-slate-300 line-clamp-3 whitespace-pre-wrap">{mine.content}</p>
        </div>
      )}
      {canSubmit && !editing && (
        <button onClick={() => { setText(mine?.content || ''); setEditing(true); }} className={`${btnPrimary} !py-1.5 !px-3 text-xs mt-2.5`}>{mine ? 'Resubmit' : 'Submit work'}</button>
      )}
      {!canSubmit && <p className="mt-2 text-[11px] text-slate-400">Enroll to submit work.</p>}
      {editing && (
        <div className="mt-2.5 space-y-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Write your answer or paste a link to your work…"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          {mine && <p className="text-[11px] text-amber-600 dark:text-amber-400">Resubmitting clears your current grade.</p>}
          {err && <p className="text-xs font-semibold text-red-600 dark:text-red-400">{err}</p>}
          <div className="flex gap-2">
            <button onClick={submit} disabled={busy} className={`${btnPrimary} !py-1.5 !px-3 text-xs`}>{busy ? 'Submitting…' : 'Submit'}</button>
            <button onClick={() => setEditing(false)} className="text-xs font-semibold text-slate-500 px-2">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
