import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Alert } from '../../components/Feedback.jsx';

function StatCard({ label, value, grad }) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${grad} text-white p-5`}>
      <p className="text-3xl font-black">{value}</p>
      <p className="text-xs font-bold uppercase tracking-widest opacity-80">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [ov, us, cs] = await Promise.all([
          api.adminOverview(), api.adminUsers(), api.allCourses(),
        ]);
        if (!alive) return;
        setOverview(ov);
        setUsers(Array.isArray(us) ? us : []);
        setCourses(Array.isArray(cs) ? cs : []);
      } catch (e) { if (alive) setErr(e.message); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  const togglePublish = async (course) => {
    setToggling(course.id);
    try {
      const updated = await api.updateCourse(course.id, { is_published: !course.is_published });
      setCourses((prev) => prev.map((c) => (c.id === course.id ? updated : c)));
    } catch (e) { setErr(e.message); }
    finally { setToggling(null); }
  };

  const removeCourse = async (course) => {
    if (!window.confirm(`Permanently delete "${course.title}" and all its content and enrollments?`)) return;
    setErr(null);
    try {
      await api.deleteCourse(course.id);
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
      setOverview(await api.adminOverview());
      setUsers(await api.adminUsers());
    } catch (e) { setErr(e.message); }
  };

  const changeRole = async (u, role) => {
    setErr(null);
    try {
      await api.adminSetRole(u.id, role);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role } : x)));
      setOverview(await api.adminOverview());
    } catch (e) { setErr(e.message); }
  };

  const removeUser = async (u) => {
    if (!window.confirm(`Delete ${u.full_name} (${u.email}) and their enrollments, attempts and submissions?`)) return;
    setErr(null);
    try {
      await api.adminDeleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      setOverview(await api.adminOverview());
    } catch (e) { setErr(e.message); }
  };

  const firstName = (user?.full_name || 'there').split(' ')[0];
  const roleCount = (r) => overview?.users?.byRole?.find((x) => x.role === r)?.count ?? 0;

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-[1.75rem] bg-slate-950 dark:bg-black border dark:border-slate-800 text-white p-7 sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(139,92,246,0.3),transparent_55%),radial-gradient(circle_at_90%_100%,rgba(99,102,241,0.4),transparent_55%)]" />
        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">Admin console</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">Platform overview, {firstName}.</h1>
            <p className="mt-2 text-slate-300/90 max-w-lg">Manage users, courses and enrollment across the whole platform.</p>
            <div className="mt-5 flex gap-2.5">
              <Link to="/teach/new" className="px-5 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-semibold hover:bg-violet-50 transition">+ New course</Link>
              <Link to="/courses" className="px-5 py-2.5 rounded-xl border border-white/20 text-sm font-semibold hover:bg-white/10 transition">View catalog</Link>
            </div>
          </div>
        </div>
      </div>

      {err && <Alert>{err}</Alert>}

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-pulse">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Users" value={overview?.users?.total ?? 0} grad="from-indigo-600 to-violet-500" />
          <StatCard label="Courses" value={overview?.courses?.total ?? 0} grad="from-sky-600 to-blue-600" />
          <StatCard label="Enrollments" value={overview?.enrollments?.total ?? 0} grad="from-emerald-500 to-teal-500" />
          <StatCard label="Published" value={`${overview?.courses?.published ?? 0}/${overview?.courses?.total ?? 0}`} grad="from-violet-600 to-purple-600" />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Users */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="font-extrabold text-slate-900 dark:text-white">Users <span className="ml-1 text-xs font-bold text-slate-400">· {roleCount('student')} students · {roleCount('instructor')} instructors · {roleCount('admin')} admins</span></h2>
          <div className="mt-4 space-y-2 max-h-96 overflow-auto pr-1">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50">
                <span className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-indigo-600 to-violet-500 text-white text-sm font-bold flex items-center justify-center">{(u.full_name || 'U')[0]}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{u.full_name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{u.email} · {u.enrolled} enrolled · {u.teaching} teaching</p>
                </div>
                {u.id === user?.id ? (
                  <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300">You</span>
                ) : (
                  <>
                    <select value={u.role} onChange={(e) => changeRole(u, e.target.value)} aria-label={`Role for ${u.full_name}`}
                      className="shrink-0 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2 py-1.5">
                      <option value="student">student</option>
                      <option value="instructor">instructor</option>
                      <option value="admin">admin</option>
                    </select>
                    <button onClick={() => removeUser(u)} className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/40">Delete</button>
                  </>
                )}
              </div>
            ))}
            {users.length === 0 && !loading && <p className="text-sm text-slate-400">No users yet.</p>}
          </div>
        </section>

        {/* Courses */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="font-extrabold text-slate-900 dark:text-white">All courses</h2>
          <div className="mt-4 space-y-2 max-h-96 overflow-auto pr-1">
            {courses.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{c.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{c.is_published ? 'Published' : 'Draft'}</p>
                </div>
                <Link to={`/courses/${c.id}/manage`} className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300">Manage</Link>
                <button onClick={() => removeCourse(c)} className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/40">Delete</button>
                <button
                  onClick={() => togglePublish(c)} disabled={toggling === c.id}
                  className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition disabled:opacity-50 ${c.is_published ? 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300' : 'bg-emerald-600 text-white'}`}
                >
                  {toggling === c.id ? '…' : c.is_published ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            ))}
            {courses.length === 0 && !loading && <p className="text-sm text-slate-400">No courses yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
