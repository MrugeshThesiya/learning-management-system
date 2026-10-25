import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { Alert, FullPageLoader } from '../components/Feedback.jsx';

const inputCls = 'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500';
const btnPrimary = 'rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold px-4 py-2.5 hover:bg-indigo-600 dark:hover:bg-slate-200 transition disabled:opacity-60';

export default function ManageCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editLesson, setEditLesson] = useState(null); // { id, title, content }
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [saved, setSaved] = useState(null);

  // forms
  const [details, setDetails] = useState({ title: '', description: '', is_published: false });
  const [lessonForm, setLessonForm] = useState({ title: '', content: '' });
  const [quizTitle, setQuizTitle] = useState('');
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qForm, setQForm] = useState({ question: '', options: ['', '', '', ''], correct_index: 0 });
  const [attempts, setAttempts] = useState([]);
  const [assignForm, setAssignForm] = useState({ title: '', description: '', due_date: '' });
  const [activeAssign, setActiveAssign] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const c = await api.getCourse(id);
        if (!alive) return;
        if (!c.can_manage) { setErr("You don't have permission to manage this course."); return; }
        const [ls, qs, as] = await Promise.all([
          api.courseLessons(id), api.courseQuizzes(id), api.courseAssignments(id),
        ]);
        if (!alive) return;
        setCourse(c);
        setDetails({ title: c.title || '', description: c.description || '', is_published: !!c.is_published });
        setLessons(Array.isArray(ls) ? ls : []);
        setQuizzes(Array.isArray(qs) ? qs : []);
        setAssignments(Array.isArray(as) ? as : []);
      } catch (e) { if (alive) setErr(e.status === 404 ? 'Course not found.' : e.message); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [id]);

  const mutate = async (fn) => {
    setErr(null); setSaved(null); setBusy(true);
    try { await fn(); } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  const saveDetails = () => mutate(async () => {
    if (!details.title.trim()) throw new Error('Course title is required');
    const updated = await api.updateCourse(id, details);
    setCourse((c) => ({ ...c, ...updated })); setSaved('Course details saved.');
  });

  const addLesson = () => mutate(async () => {
    if (!lessonForm.title.trim()) throw new Error('Lesson title is required');
    const l = await api.addLesson(id, lessonForm);
    setLessons((p) => [...p, l]); setLessonForm({ title: '', content: '' });
  });

  const removeLesson = (lessonId) => mutate(async () => {
    if (!window.confirm('Delete this lesson? Students lose their completion record for it.')) return;
    await api.deleteLesson(id, lessonId);
    setLessons((p) => p.filter((l) => l.id !== lessonId));
  });

  const saveLesson = () => mutate(async () => {
    if (!editLesson.title.trim()) throw new Error('Lesson title is required');
    const updated = await api.updateLesson(id, editLesson.id, { title: editLesson.title, content: editLesson.content });
    setLessons((p) => p.map((l) => (l.id === updated.id ? updated : l)));
    setEditLesson(null);
  });

  const removeQuiz = (quizId) => mutate(async () => {
    if (!window.confirm('Delete this quiz with all its questions and attempts?')) return;
    await api.deleteQuiz(quizId);
    setQuizzes((p) => p.filter((x) => x.id !== quizId));
    if (activeQuiz === quizId) { setActiveQuiz(null); setQuestions([]); setAttempts([]); }
  });

  const removeAssignment = (assignmentId) => mutate(async () => {
    if (!window.confirm('Delete this assignment and all submitted work?')) return;
    await api.deleteAssignment(assignmentId);
    setAssignments((p) => p.filter((x) => x.id !== assignmentId));
    if (activeAssign === assignmentId) { setActiveAssign(null); setSubmissions([]); }
  });

  const removeCourse = () => mutate(async () => {
    if (!window.confirm(`Permanently delete "${course.title}" with all its lessons, quizzes, assignments and enrollments? This cannot be undone.`)) return;
    await api.deleteCourse(id);
    navigate('/dashboard', { replace: true });
  });

  const addQuiz = () => mutate(async () => {
    if (!quizTitle.trim()) throw new Error('Quiz title is required');
    const quiz = await api.createQuiz(id, quizTitle.trim());
    setQuizzes((p) => [...p, { ...quiz, questions: 0 }]);
    setQuizTitle(''); setActiveQuiz(quiz.id);
    setQuestions([]); setAttempts([]);
  });

  const openQuiz = async (quizId) => {
    setActiveQuiz(quizId);
    try {
      const [qs, att] = await Promise.all([api.quizQuestions(quizId), api.quizAttempts(quizId)]);
      setQuestions(Array.isArray(qs) ? qs : []);
      setAttempts(Array.isArray(att) ? att : []);
    } catch (e) { setErr(e.message); }
  };

  const addQuestion = () => mutate(async () => {
    const opts = qForm.options.map((o) => o.trim()).filter(Boolean);
    if (!qForm.question.trim() || opts.length < 2) throw new Error('Question needs text and at least 2 options');
    const created = await api.addQuestion(activeQuiz, { question: qForm.question.trim(), options: opts, correct_index: Number(qForm.correct_index) });
    setQuestions((p) => [...p, created]);
    setQForm({ question: '', options: ['', '', '', ''], correct_index: 0 });
    setQuizzes((p) => p.map((x) => (x.id === activeQuiz ? { ...x, questions: (x.questions || 0) + 1 } : x)));
  });

  const removeQuestion = (questionId) => mutate(async () => {
    await api.deleteQuestion(activeQuiz, questionId);
    setQuestions((p) => p.filter((x) => x.id !== questionId));
    setQuizzes((p) => p.map((x) => (x.id === activeQuiz ? { ...x, questions: Math.max(0, (x.questions || 1) - 1) } : x)));
  });

  const addAssignment = () => mutate(async () => {
    if (!assignForm.title.trim()) throw new Error('Assignment title is required');
    const a = await api.createAssignment({ course_id: Number(id), ...assignForm, due_date: assignForm.due_date || null });
    setAssignments((p) => [...p, a]); setAssignForm({ title: '', description: '', due_date: '' });
  });

  const openAssignment = async (assignmentId) => {
    setActiveAssign(assignmentId);
    try {
      const subs = await api.assignmentSubmissions(assignmentId);
      setSubmissions(Array.isArray(subs) ? subs : []);
    } catch (e) { setErr(e.message); }
  };

  const grade = (subId, gradeVal) => mutate(async () => {
    if (gradeVal === '' || Number.isNaN(Number(gradeVal)) || Number(gradeVal) < 0 || Number(gradeVal) > 100) {
      throw new Error('Enter a grade between 0 and 100');
    }
    const updated = await api.gradeSubmission(subId, Number(gradeVal));
    setSubmissions((p) => p.map((s) => (s.id === subId ? { ...s, grade: updated.grade } : s)));
  });

  if (loading) return <FullPageLoader label="Loading studio…" />;
  if (!course) return <div className="space-y-4"><Alert>{err || 'Course not found.'}</Alert><Link to="/dashboard" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">← Back to dashboard</Link></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link to="/dashboard" className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">← Back to studio</Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Instructor studio</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">{course?.title}</h1>
        </div>
        <Link to={`/courses/${id}`} className="text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">Preview as student</Link>
      </div>

      {err && <Alert>{err}</Alert>}
      {saved && <Alert kind="success">{saved}</Alert>}

      {/* Details */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <h2 className="font-extrabold text-slate-900 dark:text-white">Course details</h2>
        <input value={details.title} onChange={(e) => setDetails({ ...details, title: e.target.value })} placeholder="Title" className={inputCls} />
        <textarea value={details.description} onChange={(e) => setDetails({ ...details, description: e.target.value })} rows={3} placeholder="Description" className={inputCls} />
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <input type="checkbox" checked={details.is_published} onChange={(e) => setDetails({ ...details, is_published: e.target.checked })} className="h-4 w-4 rounded accent-indigo-600" />
            Published (visible in catalog)
          </label>
          <button onClick={saveDetails} disabled={busy} className={btnPrimary}>Save changes</button>
        </div>
      </section>

      {/* Lessons */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <h2 className="font-extrabold text-slate-900 dark:text-white">Lessons · {lessons.length}</h2>
        <div className="space-y-2">
          {lessons.map((l, i) => (
            <div key={l.id} className="flex gap-3 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50">
              <span className="h-7 w-7 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-200">{i + 1}</span>
              {editLesson?.id === l.id ? (
                <div className="flex-1 space-y-2">
                  <input value={editLesson.title} onChange={(e) => setEditLesson({ ...editLesson, title: e.target.value })} className={inputCls} />
                  <textarea value={editLesson.content} onChange={(e) => setEditLesson({ ...editLesson, content: e.target.value })} rows={4} className={inputCls} />
                  <div className="flex gap-2">
                    <button onClick={saveLesson} disabled={busy} className={btnPrimary}>Save lesson</button>
                    <button onClick={() => setEditLesson(null)} className="text-sm font-semibold text-slate-500 px-3">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0"><p className="text-sm font-bold text-slate-900 dark:text-white">{l.title}</p>{l.content && <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{l.content}</p>}</div>
                  <button onClick={() => setEditLesson({ id: l.id, title: l.title, content: l.content || '' })} disabled={busy} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0">Edit</button>
                  <button onClick={() => removeLesson(l.id)} disabled={busy} className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline shrink-0">Delete</button>
                </>
              )}
            </div>
          ))}
          {lessons.length === 0 && <p className="text-sm text-slate-400">No lessons yet.</p>}
        </div>
        <div className="grid sm:grid-cols-[1fr_2fr_auto] gap-2">
          <input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="Lesson title" className={inputCls} />
          <input value={lessonForm.content} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} placeholder="Content / notes" className={inputCls} />
          <button onClick={addLesson} disabled={busy} className={btnPrimary}>Add</button>
        </div>
      </section>

      {/* Quizzes */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <h2 className="font-extrabold text-slate-900 dark:text-white">Quizzes · {quizzes.length}</h2>
        <div className="flex flex-wrap gap-2">
          {quizzes.map((quiz) => (
            <React.Fragment key={quiz.id}>
            <button onClick={() => openQuiz(quiz.id)} className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${activeQuiz === quiz.id ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
              {quiz.title} ({quiz.questions ?? 0})
            </button>
            <button onClick={() => removeQuiz(quiz.id)} disabled={busy} aria-label={`Delete quiz ${quiz.title}`} title="Delete quiz" className="-ml-1 mr-2 px-1 text-xs font-bold text-red-600 dark:text-red-400">✕</button>
            </React.Fragment>
          ))}
        </div>
        <div className="grid sm:grid-cols-[1fr_auto] gap-2">
          <input value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder="New quiz title" className={inputCls} />
          <button onClick={addQuiz} disabled={busy} className={btnPrimary}>Create quiz</button>
        </div>
        {activeQuiz && (
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 space-y-4">
            <div className="space-y-2">
              {questions.map((quest, i) => (
                <div key={quest.id} className="text-sm p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between gap-2">
                    <p className="font-bold text-slate-900 dark:text-white">{i + 1}. {quest.question}</p>
                    <button onClick={() => removeQuestion(quest.id)} disabled={busy} className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline shrink-0">Delete</button>
                  </div>
                  <ul className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {(quest.options || []).map((o, oi) => (
                      <li key={oi} className={oi === quest.correct_index ? 'font-bold text-emerald-600 dark:text-emerald-400' : ''}>{oi === quest.correct_index ? '✓ ' : '• '}{o}</li>
                    ))}
                  </ul>
                </div>
              ))}
              {questions.length === 0 && <p className="text-sm text-slate-400">No questions yet.</p>}
            </div>
            <div className="grid gap-2">
              <input value={qForm.question} onChange={(e) => setQForm({ ...qForm, question: e.target.value })} placeholder="Question" className={inputCls} />
              <div className="grid sm:grid-cols-2 gap-2">
                {qForm.options.map((o, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input type="radio" name="correct" checked={Number(qForm.correct_index) === i} onChange={() => setQForm({ ...qForm, correct_index: i })} className="accent-emerald-600" title="Correct answer" />
                    <input value={o} onChange={(e) => setQForm({ ...qForm, options: qForm.options.map((x, j) => (j === i ? e.target.value : x)) })} placeholder={`Option ${i + 1}`} className={inputCls} />
                  </div>
                ))}
              </div>
              <button onClick={addQuestion} disabled={busy} className={`${btnPrimary} w-fit`}>Add question (radio = correct)</button>
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2">Attempts · {attempts.length}</h3>
              {attempts.length === 0 ? <p className="text-xs text-slate-400">No attempts yet.</p> : (
                <div className="space-y-1.5">
                  {attempts.map((a) => (
                    <div key={a.id} className="flex justify-between text-xs p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{a.full_name} <span className="text-slate-400 font-normal">({a.email})</span></span>
                      <span className="font-bold text-slate-900 dark:text-white">{a.score}/{a.total}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Assignments */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <h2 className="font-extrabold text-slate-900 dark:text-white">Assignments · {assignments.length}</h2>
        <div className="flex flex-wrap gap-2">
          {assignments.map((a) => (
            <React.Fragment key={a.id}>
            <button onClick={() => openAssignment(a.id)} className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${activeAssign === a.id ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
              {a.title}
            </button>
            <button onClick={() => removeAssignment(a.id)} disabled={busy} aria-label={`Delete assignment ${a.title}`} title="Delete assignment" className="-ml-1 mr-2 px-1 text-xs font-bold text-red-600 dark:text-red-400">✕</button>
            </React.Fragment>
          ))}
        </div>
        <div className="grid sm:grid-cols-[1fr_1fr_auto_auto] gap-2">
          <input value={assignForm.title} onChange={(e) => setAssignForm({ ...assignForm, title: e.target.value })} placeholder="Title" className={inputCls} />
          <input value={assignForm.description} onChange={(e) => setAssignForm({ ...assignForm, description: e.target.value })} placeholder="Instructions" className={inputCls} />
          <input type="date" value={assignForm.due_date} onChange={(e) => setAssignForm({ ...assignForm, due_date: e.target.value })} className={inputCls} />
          <button onClick={addAssignment} disabled={busy} className={btnPrimary}>Create</button>
        </div>
        {activeAssign && (
          <div className="space-y-2">
            {submissions.length === 0 && <p className="text-sm text-slate-400">No submissions yet.</p>}
            {submissions.map((s) => (
              <GradeRow key={s.id} submission={s} onGrade={grade} busy={busy} />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-900 p-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-extrabold text-red-700 dark:text-red-400">Danger zone</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Deleting a course removes its lessons, quizzes, assignments, submissions and enrollments.</p>
        </div>
        <button onClick={removeCourse} disabled={busy} className="rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-4 py-2.5 transition disabled:opacity-60">Delete course</button>
      </section>
    </div>
  );
}

function GradeRow({ submission: s, onGrade, busy }) {
  const [val, setVal] = useState(s.grade ?? '');
  return (
    <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
      <div className="flex justify-between gap-2 text-sm">
        <p className="font-bold text-slate-900 dark:text-white">{s.full_name} <span className="font-normal text-slate-400">({s.email})</span></p>
        <p className="text-xs text-slate-400">{new Date(s.submitted_at).toLocaleString()}</p>
      </div>
      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{s.content}</p>
      <div className="mt-2.5 flex gap-2 items-center">
        <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Grade (0–100)" type="number" min="0" max="100" className={`${inputCls} max-w-40`} />
        <button onClick={() => onGrade(s.id, val)} disabled={busy} className={btnPrimary}>Save grade</button>
        {s.grade !== null && s.grade !== undefined && <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Graded: {s.grade}</span>}
      </div>
    </div>
  );
}
