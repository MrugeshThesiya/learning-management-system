import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import CourseCard from '../components/CourseCard.jsx';
import { Alert, CourseSkeleton, EmptyState } from '../components/Feedback.jsx';

export default function MyLearning() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const enrolled = useMemo(() => {
    const m = new Map(enrollments.map((e) => [String(e.course_id), e]));
    return courses.filter((c) => m.has(String(c.id))).map((c) => ({ ...c, _enr: m.get(String(c.id)) }));
  }, [courses, enrollments]);

  const completed = enrolled.filter((c) => Number(c._enr?.progress || 0) >= 100).length;
  const inProgress = enrolled.length - completed;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">My learning</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{enrolled.length} enrolled · {inProgress} in progress · {completed} completed</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[['Enrolled', enrolled.length, 'from-slate-900 to-slate-700'], ['In progress', inProgress, 'from-indigo-600 to-violet-500'], ['Completed', completed, 'from-emerald-500 to-teal-500']].map(([k, v, g]) => (
          <div key={k} className={`rounded-2xl bg-gradient-to-br ${g} text-white p-5`}>
            <p className="text-3xl font-black">{v}</p>
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">{k}</p>
          </div>
        ))}
      </div>

      {err && <Alert>{err}</Alert>}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{[0, 1, 2].map((i) => <CourseSkeleton key={i} />)}</div>
      ) : enrolled.length === 0 ? (
        <EmptyState
          title="You haven't enrolled in anything yet"
          hint="Browse the catalog and enroll with one click — your progress will be tracked here."
          action={<Link to="/courses" className="inline-flex px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:bg-indigo-600 dark:hover:bg-slate-200">Browse catalog</Link>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {enrolled.map((c) => (
            <CourseCard key={c.id} course={c} enrolled progress={c._enr?.progress} />
          ))}
        </div>
      )}
    </div>
  );
}
