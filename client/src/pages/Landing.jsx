import React from 'react';
import { Link } from 'react-router-dom';
import { MarketingNav } from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const FEATURES = [
  { t: 'Guided course paths', d: 'Structured lessons that take you from fundamentals to real projects, with clear ordering and pacing.', icon: 'M4 6h16M4 12h16M4 18h10' },
  { t: 'Quizzes that stick', d: 'Auto-graded quizzes with instant scoring so you know exactly what to review next.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { t: 'Assignments & feedback', d: 'Submit work, get grades and keep every submission organized by course.', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.4-9.4a2 2 0 012.8 2.8L12 15l-4 1 1-4 8.6-8.6z' },
  { t: 'Progress that motivates', d: 'Enrollment-level progress tracking keeps momentum visible across everything you learn.', icon: 'M3 17l6-6 4 4 8-8' },
  { t: 'Search in seconds', d: 'Find any course instantly with full-text search across titles and descriptions.', icon: 'M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z' },
  { t: 'Instructor friendly', d: 'Publish courses, add lessons, and manage content with a clean API-first workflow.', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
];

const SHOWCASE = [
  { title: 'Full-Stack Web Development', tag: 'Development', desc: 'From HTML to deployment — build and ship production apps.', grad: 'from-indigo-600 via-violet-600 to-fuchsia-500', meta: '24 lessons · 6 quizzes' },
  { title: 'Data Science Foundations', tag: 'Data', desc: 'Statistics, Python and visualization with real datasets.', grad: 'from-sky-600 via-blue-600 to-indigo-600', meta: '18 lessons · 5 quizzes' },
  { title: 'UI Design Systems', tag: 'Design', desc: 'Typography, color and components that scale to products.', grad: 'from-emerald-600 via-teal-600 to-cyan-500', meta: '16 lessons · 4 projects' },
];

export default function Landing() {
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
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <span><b className="text-slate-900 dark:text-white">12k+</b> learners</span>
            <span className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <span><b className="text-slate-900 dark:text-white">240+</b> courses</span>
            <span className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <span><b className="text-slate-900 dark:text-white">4.9/5</b> avg rating</span>
          </div>

          {/* Product mock */}
          <div className="mt-14 relative max-w-4xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-fuchsia-500/20 blur-2xl rounded-[2rem]" />
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl shadow-indigo-950/10 overflow-hidden text-left">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs font-medium text-slate-400">app.learnova.app/dashboard</span>
              </div>
              <div className="grid sm:grid-cols-[220px_1fr]">
                <div className="hidden sm:block border-r border-slate-100 dark:border-slate-800 p-4 space-y-2 bg-slate-50/50 dark:bg-slate-800/30">
                  {['Dashboard', 'Catalog', 'My learning', 'Quizzes', 'Settings'].map((x, i) => (
                    <div key={x} className={`px-3 py-2.5 rounded-xl text-sm font-semibold ${i === 0 ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700'}`}>{x}</div>
                  ))}
                  <div className="mt-4 rounded-xl p-3 bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                    <p className="text-xs font-bold">Weekly goal</p>
                    <p className="text-[11px] opacity-80">4 of 5 lessons done</p>
                    <div className="mt-2 h-1.5 rounded-full bg-white/25"><div className="h-full w-4/5 rounded-full bg-white" /></div>
                  </div>
                </div>
                <div className="p-5 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Continue learning</p>
                  <h3 className="mt-1 font-bold text-lg text-slate-900 dark:text-white">Full-Stack Web Development</h3>
                  <div className="mt-3 h-2.5 rounded-full bg-slate-100 dark:bg-slate-700"><div className="h-full w-2/3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-500" /></div>
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {[['Enrolled', '8'], ['Hours', '32'], ['Streak', '12d']].map(([k, v]) => (
                      <div key={k} className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 p-3 text-center">
                        <p className="font-extrabold text-lg text-slate-900 dark:text-white">{v}</p><p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{k}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <span className="flex-1 text-center text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl py-2.5">Resume lesson 9</span>
                    <span className="flex-1 text-center text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl py-2.5">Take quiz</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -left-4 sm:-left-10 top-16 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl px-4 py-3 flex items-center gap-3 animate-[float_5s_ease-in-out_infinite]">
              <span className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">✓</span>
              <div><p className="text-xs font-bold text-slate-900 dark:text-white">Quiz passed</p><p className="text-[11px] text-slate-500 dark:text-slate-400">9/10 · React basics</p></div>
            </div>
            <div className="absolute -right-4 sm:-right-10 bottom-16 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl px-4 py-3 flex items-center gap-3 animate-[float_6s_ease-in-out_infinite]">
              <span className="h-9 w-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">▲</span>
              <div><p className="text-xs font-bold text-slate-900 dark:text-white">+18% this week</p><p className="text-[11px] text-slate-500 dark:text-slate-400">Learning activity</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* LOGOS */}
      <section className="py-8 border-y border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm font-bold text-slate-400 dark:text-slate-500">
          {['Northwind', 'Acme Corp', 'Globex', 'Initech', 'Umbrella', 'Hooli'].map((b) => (
            <span key={b} className="tracking-wide">◆ {b}</span>
          ))}
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
                {[['Full-Stack Web Development', 68, 'Lesson 9 · Auth with JWT'], ['Data Science Foundations', 34, 'Lesson 5 · Pandas basics'], ['UI Design Systems', 92, 'Lesson 14 · Final project']].map(([t, p, s]) => (
                  <div key={t} className="rounded-xl bg-white text-slate-900 p-4">
                    <div className="flex justify-between items-center gap-3">
                      <p className="font-bold text-sm">{t}</p>
                      <span className="text-xs font-bold text-indigo-600">{p}%</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{s}</p>
                    <div className="mt-2.5 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-500" style={{ width: `${p}%` }} /></div>
                  </div>
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
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SHOWCASE.map((c) => (
              <div key={c.title} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className={`h-36 bg-gradient-to-br ${c.grad} relative`}>
                  <span className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white border border-white/30 backdrop-blur">{c.tag}</span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold">{c.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{c.desc}</p>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-3">{c.meta}</p>
                  <Link to="/register" className="mt-4 block text-center text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl py-2.5 hover:bg-indigo-600 dark:hover:bg-slate-200 transition">Enroll free</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORIES */}
      <section id="stories" className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-center text-3xl sm:text-4xl font-black tracking-tight">Loved by learners</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-5">
            {[['Priya S.', 'Frontend Developer', 'I finished two courses in a month. The progress tracking kept me accountable every single day.'], ['Daniel K.', 'Data Analyst', 'Quizzes with instant scoring are a game changer. I always knew exactly what to revise.'], ['Amara O.', 'Instructor', 'Publishing lessons and grading assignments is the smoothest workflow I have used.']].map(([n, r, q]) => (
              <figure key={n} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <div className="flex gap-1 text-amber-400">★★★★★</div>
                <blockquote className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">“{q}”</blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <span className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-500 text-white font-bold flex items-center justify-center">{n[0]}</span>
                  <div><p className="text-sm font-bold">{n}</p><p className="text-xs text-slate-500 dark:text-slate-400">{r}</p></div>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-12 rounded-[2rem] bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-8 sm:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.25),transparent_60%)]" />
            <h2 className="relative text-3xl sm:text-4xl font-black tracking-tight">Your next skill is one click away</h2>
            <p className="relative mt-3 text-white/80">Join thousands of learners. Free to start, no credit card required.</p>
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
