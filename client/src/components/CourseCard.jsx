import React from 'react';
import { Link } from 'react-router-dom';

const COVERS = [
  'from-indigo-600 via-violet-600 to-fuchsia-500',
  'from-sky-600 via-blue-600 to-indigo-600',
  'from-emerald-600 via-teal-600 to-cyan-500',
  'from-amber-500 via-orange-600 to-rose-500',
  'from-violet-600 via-purple-600 to-indigo-700',
  'from-rose-500 via-pink-600 to-fuchsia-600',
];

export function coverFor(id) {
  const n = typeof id === 'number' ? id : String(id || '').length;
  return COVERS[n % COVERS.length];
}

export function initials(title = '?') {
  return title.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';
}

export default function CourseCard({ course, enrolled, progress, onEnroll, enrolling }) {
  const cover = coverFor(course.id);
  const pct = Math.round(Number(progress ?? 0));
  return (
    <article className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.06)] hover:shadow-[0_16px_40px_-16px_rgba(79,70,229,0.35)] hover:-translate-y-1 transition-all duration-300">
      <div className={`relative h-36 bg-gradient-to-br ${cover} overflow-hidden`}>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_85%_15%,white,transparent_35%)]" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur border border-white/30">
            {course.category || 'Course'}
          </span>
          {enrolled && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white text-indigo-700">
              Enrolled
            </span>
          )}
        </div>
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div className="h-11 w-11 rounded-xl bg-white/95 text-slate-900 font-bold flex items-center justify-center shadow">
            {initials(course.title)}
          </div>
          <span className="text-white/90 text-xs font-medium">★ 4.8 · Updated 2026</span>
        </div>
      </div>
      <div className="p-5">
        <Link to={`/courses/${course.id}`} className="font-semibold text-slate-900 dark:text-white leading-snug hover:text-indigo-700 dark:hover:text-indigo-300 line-clamp-1">
          {course.title}
        </Link>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2.5rem]">{course.description || 'A hands-on course with lessons, quizzes and assignments.'}</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-semibold text-slate-600 dark:text-slate-300">
              {(course.instructor_name || 'I')[0]}
            </span>
            {course.instructor_name || 'Instructor'}
          </span>
          <span aria-hidden>·</span>
          <span>{course.lessons_count ?? 'Self-paced'}</span>
        </div>
        {enrolled && (
          <div className="mt-4">
            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
              <span>Progress</span><span>{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <Link
            to={`/courses/${course.id}`}
            className="flex-1 text-center text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 transition"
          >
            View
          </Link>
          {!enrolled ? (
            <button
              onClick={() => onEnroll?.(course)}
              disabled={enrolling}
              className="flex-1 text-sm font-semibold px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-slate-200 transition disabled:opacity-60"
            >
              {enrolling ? 'Enrolling…' : 'Enroll'}
            </button>
          ) : (
            <Link
              to={`/courses/${course.id}`}
              className="flex-1 text-center text-sm font-semibold px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition"
            >
              Continue
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
