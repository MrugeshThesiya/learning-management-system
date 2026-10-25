import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import CourseCard from '../../components/CourseCard.jsx';
import { Alert, CourseSkeleton, EmptyState } from '../../components/Feedback.jsx';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [c, e] = await Promise.all([api.listCourses(), api.myEnrollments()]);
        if (!alive) return;
        setCourses(Array.isArray(c) ? c : []);
        setEnrollments(Array.isArray(e) ? e : []);
      } catch (e2) { if (alive) setErr(e2.message); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  const enrolledMap = useMemo(() => {
    const m = new Map();
    enrollments.forEach((e) => m.set(String(e.course_id), e));
    return m;
  }, [enrollments]);

  const enrolledCourses = useMemo(
    () => enrollments.map((e) => ({ id: e.course_id, title: e.title, description: e.description, is_published: e.is_published, instructor_name: e.instructor_name, lessons_count: e.lessons_count, _enr: e })),
    [enrollments]
  );
  const suggested = useMemo(() => courses.filter((c) => !enrolledMap.has(String(c.id))).slice(0, 3), [courses, enrolledMap]);
  const avgProgress = enrolledCourses.length
    ? Math.round(enrolledCourses.reduce((s, c) => s + Number(c._enr?.progress || 0), 0) / enrolledCourses.length)
    : 0;

  const enroll = async (course) => {
    setEnrollingId(course.id);
    setErr(null);
    try {
      await api.enroll(course.id);
      setEnrollments(await api.myEnrollments());
    } catch (e2) { setErr(e2.message); }
    finally { setEnrollingId(null); }
  };

  const firstName = (user?.full_name || 'there').split(' ')[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[1.75rem] bg-slate-950 dark:bg-black border dark:border-slate-800 text-white p-7 sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(99,102,241,0.45),transparent_55%),radial-gradient(circle_at_90%_100%,rgba(217,70,239,0.3),transparent_55%)]" />
        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">{greeting()}, {firstName}.</h1>
            <p className="mt-2 text-slate-300/90 max-w-lg">You're enrolled in <b className="text-white">{enrolledCourses.length}</b> {enrolledCourses.length === 1 ? 'course' : 'courses'} with an average progress of <b className="text-white">{avgProgress}%</b>. Keep going.</p>
            <div className="mt-5 flex gap-2.5">
              <Link to="/courses" className="px-5 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-semibold hover:bg-indigo-50 transition">Browse catalog</Link>
              <Link to="/my-learning" className="px-5 py-2.5 rounded-xl border border-white/20 text-sm font-semibold hover:bg-white/10 transition">My learning</Link>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
            {[['Enrolled', enrolledCourses.length], ['Avg. progress', `${avgProgress}%`], ['Available', courses.length]].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-5 py-4 text-center min-w-[110px]">
                <p className="text-2xl font-black">{v}</p>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{k}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {err && <Alert>{err}</Alert>}

      {/* Continue learning */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">Continue learning</h2>
          <Link to="/my-learning" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">View all →</Link>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{[0, 1, 2].map((i) => <CourseSkeleton key={i} />)}</div>
        ) : enrolledCourses.length === 0 ? (
          <EmptyState
            title="Nothing in progress yet"
            hint="Enroll in your first course and it will show up here with live progress."
            action={<Link to="/courses" className="inline-flex px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:bg-indigo-600 dark:hover:bg-slate-200">Explore courses</Link>}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {enrolledCourses.slice(0, 3).map((c) => (
              <CourseCard key={c.id} course={c} enrolled progress={c._enr?.progress} onEnroll={enroll} enrolling={enrollingId === c.id} />
            ))}
          </div>
        )}
      </section>

      {/* Suggested */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">Suggested for you</h2>
          <Link to="/courses" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">View catalog →</Link>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{[0, 1, 2].map((i) => <CourseSkeleton key={i} />)}</div>
        ) : suggested.length === 0 ? (
          <EmptyState title="You're all caught up" hint="You've enrolled in every available course. New courses will appear here." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {suggested.map((c) => (
              <CourseCard key={c.id} course={c} onEnroll={enroll} enrolling={enrollingId === c.id} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
