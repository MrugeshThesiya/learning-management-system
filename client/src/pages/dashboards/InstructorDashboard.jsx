import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Alert, CourseSkeleton, EmptyState } from '../../components/Feedback.jsx';
import { coverFor } from '../../components/CourseCard.jsx';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const t = await api.teachingCourses();
        if (alive) setCourses(Array.isArray(t) ? t : []);
      } catch (e) { if (alive) setErr(e.message); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  const stats = useMemo(() => {
    const students = courses.reduce((s, c) => s + Number(c.students || 0), 0);
    const avg = courses.length
      ? Math.round(courses.reduce((s, c) => s + Number(c.avg_progress || 0), 0) / courses.length)
      : 0;
    const published = courses.filter((c) => c.is_published).length;
    return { students, avg, published };
  }, [courses]);

  const firstName = (user?.full_name || 'there').split(' ')[0];

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-[1.75rem] bg-slate-950 dark:bg-black border dark:border-slate-800 text-white p-7 sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(16,185,129,0.35),transparent_55%),radial-gradient(circle_at_90%_100%,rgba(99,102,241,0.35),transparent_55%)]" />
        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Instructor studio</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">Welcome back, {firstName}.</h1>
            <p className="mt-2 text-slate-300/90 max-w-lg">You're teaching <b className="text-white">{courses.length}</b> {courses.length === 1 ? 'course' : 'courses'} to <b className="text-white">{stats.students}</b> {stats.students === 1 ? 'student' : 'students'}.</p>
            <div className="mt-5 flex gap-2.5">
              <Link to="/teach/new" className="px-5 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-semibold hover:bg-emerald-50 transition">+ New course</Link>
              <Link to="/courses" className="px-5 py-2.5 rounded-xl border border-white/20 text-sm font-semibold hover:bg-white/10 transition">View catalog</Link>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
            {[['Courses', courses.length], ['Students', stats.students], ['Published', `${stats.published}/${courses.length}`]].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-5 py-4 text-center min-w-[110px]">
                <p className="text-2xl font-black">{v}</p>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{k}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">My courses</h2>
          <Link to="/teach/new" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">+ New course →</Link>
        </div>
        {err && <Alert>{err}</Alert>}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{[0, 1, 2].map((i) => <CourseSkeleton key={i} />)}</div>
        ) : courses.length === 0 ? (
          <EmptyState
            title="No courses yet"
            hint="Create your first course, add lessons and a quiz, then publish it for students."
            action={<Link to="/teach/new" className="inline-flex px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold">Create a course</Link>}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((c) => (
              <article key={c.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className={`h-28 bg-gradient-to-br ${coverFor(c.id)} relative`}>
                  <span className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur border ${c.is_published ? 'bg-emerald-500/25 text-white border-white/30' : 'bg-black/30 text-white/90 border-white/20'}`}>
                    {c.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{c.title}</h3>
                  <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span>{c.students} student{c.students === 1 ? '' : 's'}</span>
                    <span>{Math.round(Number(c.avg_progress || 0))}% avg progress</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link to={`/courses/${c.id}/manage`} className="flex-1 text-center text-sm font-semibold px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-slate-200 transition">Manage</Link>
                    <Link to={`/courses/${c.id}`} className="flex-1 text-center text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-300 transition">Preview</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
