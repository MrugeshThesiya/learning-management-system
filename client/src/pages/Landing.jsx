import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MarketingNav } from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { api } from '../lib/api.js';
import { coverFor } from '../components/CourseCard.jsx';

const FEATURES = [
  { t: 'Guided course paths', d: 'Structured lessons that take you from fundamentals to real projects, with clear ordering and pacing.', icon: 'M4 6h16M4 12h16M4 18h10' },
  { t: 'Quizzes that stick', d: 'Auto-graded quizzes with instant scoring so you know exactly what to review next.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { t: 'Assignments & feedback', d: 'Submit work, get grades and keep every submission organized by course.', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.4-9.4a2 2 0 012.8 2.8L12 15l-4 1 1-4 8.6-8.6z' },
  { t: 'Progress that motivates', d: 'Enrollment-level progress tracking keeps momentum visible across everything you learn.', icon: 'M3 17l6-6 4 4 8-8' },
  { t: 'Search in seconds', d: 'Find any course instantly by searching titles, descriptions and instructors.', icon: 'M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z' },
  { t: 'Instructor friendly', d: 'Publish courses, add lessons, and manage content with a clean API-first workflow.', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
];

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export default function Landing() {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [featuredLessons, setFeaturedLessons] = useState([]);
  useEffect(() => {
    let alive = true;
    api.stats().then((d) => { if (alive) setStats(d); }).catch(() => {});
    api.listCourses().then(async (d) => {
      if (!alive || !Array.isArray(d)) return;
      setCourses(d.slice(0, 3));
      // feature the course with the most students (ties: most lessons)
      const top = [...d].sort((x, y) => (y.students - x.students) || (y.lessons_count - x.lessons_count))[0];
      if (!top) return;
      setFeatured(top);
      const l = await api.courseLessons(top.id).catch(() => []);
      if (alive) setFeaturedLessons(l);
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f7fb] dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-clip">
      <MarketingNav />

      {/* HERO */}
      <section className="relative pt-12 sm:pt-16 pb-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#eef2ff_0%,#f6f7fb_60%)] dark:bg-[linear-gradient(to_bottom,#0b1129_0%,#020617_60%)]" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[480px] w-[820px] rounded-full bg-gradient-to-r from-indigo-400/30 via-violet-400/30 to-fuchsia-400/30 dark:from-indigo-600/20 dark:via-violet-600/20 dark:to-fuchsia-600/20 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <Link to="/register" className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-200 hover:border-indigo-200 dark:hover:border-indigo-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            New · Quizzes, assignments & progress tracking are live
            <span className="text-indigo-600 dark:text-indigo-400">→</span>
          </Link>
          <h1 className="mt-6 text-4xl sm:text-6xl font-black tracking-tight leading-[1.05]">
            Learn anything,
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 dark:from-indigo-400 dark:via-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent">master everything.</span>
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Learnova is a modern learning platform where instructors publish courses and students
            enroll, learn, take quizzes and track real progress — all in one calm, fast workspace.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register" className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold shadow-xl shadow-slate-900/15 hover:bg-indigo-600 dark:hover:bg-slate-200 transition">
              Start learning free
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm transition">
              Sign in to your account
            </Link>
          </div>
          {stats && (
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <span><b className="text-slate-900 dark:text-white">{stats.learners}</b> {stats.learners === 1 ? 'member' : 'members'}</span>
              <span className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
              <span><b className="text-slate-900 dark:text-white">{stats.courses}</b> {stats.courses === 1 ? 'course' : 'courses'}</span>
              <span className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
              <span><b className="text-slate-900 dark:text-white">{stats.lessons}</b> {stats.lessons === 1 ? 'lesson' : 'lessons'}</span>
            </div>
          )}

          {/* Featured course — live data from the catalog */}
          {featured && (
            <div className="mt-14 relative max-w-4xl mx-auto">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-fuchsia-500/20 blur-2xl rounded-[2rem]" />
              <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl shadow-indigo-950/10 overflow-hidden text-left grid md:grid-cols-[1fr_1.1fr]">
                <div className={`relative p-7 sm:p-8 bg-gradient-to-br ${coverFor(featured.id)} text-white flex flex-col justify-between gap-6`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.25),transparent_50%)]" />
                  <div className="relative">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/80">Featured course</p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight">{featured.title}</h3>
                    <p className="mt-2 text-sm text-white/85 line-clamp-4">{featured.description}</p>
                  </div>
                  <div className="relative">
                    <p className="text-xs font-semibold text-white/80">
                      {plural(featured.lessons_count, 'lesson')} · {plural(featured.quizzes_count, 'quiz', 'quizzes')} · {plural(featured.assignments_count, 'assignment')}
                    </p>
                    <p className="text-xs text-white/70 mt-0.5">Taught by {featured.instructor_name || 'an instructor'}</p>
                    <Link to="/register" className="mt-4 inline-flex px-5 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-bold hover:bg-slate-100 transition">Enroll free</Link>
                  </div>
                </div>
                <div className="p-6 sm:p-7">
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">What you'll learn</p>
                  <ol className="mt-3 space-y-2">
                    {featuredLessons.slice(0, 6).map((l, i) => (
                      <li key={l.id} className="flex gap-3 items-start">
                        <span className="h-6 w-6 shrink-0 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{l.title}</span>
                      </li>
                    ))}
                  </ol>
                  {featuredLessons.length > 6 && <p className="mt-3 text-xs text-slate-400">+ {featuredLessons.length - 6} more lessons</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Everything you need</p>
          <h2 className="mt-3 text-center text-3xl sm:text-4xl font-black tracking-tight">A complete learning OS</h2>
          <p className="mt-3 text-center text-slate-500 dark:text-slate-400 max-w-xl mx-auto">Courses, lessons, quizzes, assignments and progress — designed to feel calm, fast and real.</p>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.t} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:shadow-xl hover:shadow-indigo-600/10 hover:-translate-y-1 transition-all">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={f.icon} /></svg>
                </div>
                <h3 className="mt-4 font-bold">{f.t}</h3>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="rounded-[2rem] bg-slate-950 dark:bg-black border dark:border-slate-800 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(99,102,241,0.35),transparent_50%),radial-gradient(circle_at_90%_100%,rgba(217,70,239,0.25),transparent_50%)]" />
            <div className="relative p-8 sm:p-14 grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">How it works</p>
                <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-white">From signup to skilled in three steps</h2>
                <div className="mt-8 space-y-5">
                  {[['01', 'Create your account', 'Sign up in seconds as a student or instructor. Your session stays signed in across reloads.'], ['02', 'Enroll in a course', 'Browse the catalog, enroll with one click and pick up exactly where you left off.'], ['03', 'Learn & get graded', 'Complete lessons, pass quizzes, submit assignments and watch progress climb.']].map(([n, t, d]) => (
                    <div key={n} className="flex gap-4">
                      <span className="h-10 w-10 shrink-0 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-black text-indigo-300">{n}</span>
                      <div><p className="font-bold text-white">{t}</p><p className="text-sm text-slate-400 mt-1">{d}</p></div>
                    </div>
                  ))}
                </div>
                <Link to="/register" className="mt-8 inline-flex px-6 py-3 rounded-2xl bg-white text-slate-900 font-semibold hover:bg-indigo-50 transition">Create free account</Link>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">Available now</p>
                {courses.length === 0 && <p className="text-sm text-slate-400">Courses will appear here as soon as instructors publish them.</p>}
                {courses.map((c) => (
                  <Link key={c.id} to="/register" className="block rounded-xl bg-white text-slate-900 p-4 hover:bg-indigo-50 transition">
                    <p className="font-bold text-sm">{c.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{plural(c.lessons_count, 'lesson')} · {c.instructor_name || 'Instructor'}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COURSES */}
      <section id="courses" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Popular right now</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">Start with something great</h2>
            </div>
            <Link to="/register" className="text-sm font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-500">Sign up to enroll →</Link>
          </div>
          {courses.length === 0 ? (
            <p className="mt-8 text-slate-500 dark:text-slate-400">No courses have been published yet — check back soon.</p>
          ) : (
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((c) => (
                <div key={c.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className={`h-36 bg-gradient-to-br ${coverFor(c.id)} relative`}>
                    <span className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white border border-white/30 backdrop-blur">Course</span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold">{c.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{c.description}</p>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-3">
                      {plural(c.lessons_count, 'lesson')} · {plural(c.quizzes_count, 'quiz', 'quizzes')} · {c.instructor_name || 'Instructor'}
                    </p>
                    <Link to="/register" className="mt-4 block text-center text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl py-2.5 hover:bg-indigo-600 dark:hover:bg-slate-200 transition">Enroll free</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* STORIES */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="rounded-[2rem] bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-8 sm:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.25),transparent_60%)]" />
            <h2 className="relative text-3xl sm:text-4xl font-black tracking-tight">Your next skill is one click away</h2>
            <p className="relative mt-3 text-white/80">Free to start, no credit card required.</p>
            <div className="relative mt-7 flex flex-col sm:flex-row justify-center gap-3">
              <Link to="/register" className="px-7 py-3.5 rounded-2xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition">Get started free</Link>
              <Link to="/login" className="px-7 py-3.5 rounded-2xl border border-white/40 font-semibold hover:bg-white/10 transition">Sign in</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
