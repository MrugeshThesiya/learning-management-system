import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import CourseCard from '../components/CourseCard.jsx';
import { Alert, CourseSkeleton, EmptyState } from '../components/Feedback.jsx';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [err, setErr] = useState(null);
  const [enrollingId, setEnrollingId] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [c, e] = await Promise.all([
          api.listCourses().catch(() => { throw new Error('Could not reach the course service. Is the API running on :4000?'); }),
          api.myEnrollments().catch(() => []),
        ]);
        if (!alive) return;
        setCourses(Array.isArray(c) ? c : []);
        setEnrollments(Array.isArray(e) ? e : []);
      } catch (e2) {
        if (alive) setErr(e2.message);
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!debounced) return;
    let alive = true;
    (async () => {
      setSearching(true);
      try {
        const r = await api.searchCourses(debounced);
        if (alive && Array.isArray(r)) setCourses(r);
      } catch { /* keep current list */ }
      finally { if (alive) setSearching(false); }
    })();
    return () => { alive = false; };
  }, [debounced]);

  // If search cleared, reload full list
  useEffect(() => {
    if (debounced !== '') return;
    let alive = true;
    api.listCourses().then((c) => { if (alive && Array.isArray(c)) setCourses(c); }).catch(() => {});
    return () => { alive = false; };
  }, [debounced]);

  const enrolledMap = useMemo(() => {
    const m = new Map();
    enrollments.forEach((e) => m.set(String(e.course_id), e));
    return m;
  }, [enrollments]);

  const visible = useMemo(() => {
    let list = courses;
    if (filter === 'enrolled') list = list.filter((c) => enrolledMap.has(String(c.id)));
    if (filter === 'new') list = list.filter((c) => !enrolledMap.has(String(c.id)));
    if (!debounced) return list;
    const needle = debounced.toLowerCase();
    // Client-side fallback filter (server already filters too)
    const serverFiltered = list.some((c) => (c.title || '').toLowerCase().includes(needle));
    return serverFiltered ? list : courses.filter((c) => ((c.title || '') + ' ' + (c.description || '')).toLowerCase().includes(needle));
  }, [courses, enrolledMap, filter, debounced]);

  const enroll = async (course) => {
    setEnrollingId(course.id);
    try {
      const e = await api.enroll(course.id);
      setEnrollments((prev) => [...prev, e]);
    } catch (e2) {
      setErr(e2.message);
    } finally { setEnrollingId(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Course catalog</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{courses.length} published {courses.length === 1 ? 'course' : 'courses'} · {enrollments.length} enrolled</p>
        </div>
        <div className="relative w-full md:w-80">
          <svg viewBox="0 0 24 24" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" /></svg>
          <input
            value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses…"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searching && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">…</span>}
        </div>
      </div>

      <div className="flex gap-2">
        {[['all', 'All'], ['new', 'Not enrolled'], ['enrolled', 'Enrolled']].map(([v, label]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${filter === v ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
            {label}
          </button>
        ))}
      </div>

      {err && <Alert>{err}</Alert>}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{[0, 1, 2, 3, 4, 5].map((i) => <CourseSkeleton key={i} />)}</div>
      ) : visible.length === 0 ? (
        <EmptyState
          title={debounced ? `No results for “${debounced}”` : 'No courses yet'}
          hint={debounced ? 'Try a different keyword, or clear the search to see everything.' : 'Published courses will appear here as soon as instructors add them.'}
          action={debounced ? <button onClick={() => setQ('')} className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold">Clear search</button> : undefined}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((c) => (
            <CourseCard
              key={c.id} course={c}
              enrolled={enrolledMap.has(String(c.id))}
              progress={enrolledMap.get(String(c.id))?.progress}
              onEnroll={enroll} enrolling={enrollingId === c.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
