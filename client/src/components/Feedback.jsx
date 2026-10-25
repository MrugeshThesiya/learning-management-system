import React from 'react';

export function FullPageLoader({ label = 'Loading…' }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-slate-700" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">{label}</p>
    </div>
  );
}

export function InlineSpinner({ className = 'h-4 w-4' }) {
  return (
    <span className={`inline-block rounded-full border-2 border-white/40 border-t-white animate-spin ${className}`} />
  );
}

export function EmptyState({ title, hint, action }) {
  return (
    <div className="text-center py-14 px-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/60">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
        </svg>
      </div>
      <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">{title}</h3>
      {hint && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function CourseSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden animate-pulse">
      <div className="h-36 bg-slate-100 dark:bg-slate-800" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-24 rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-9 w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export function Alert({ kind = 'error', children }) {
  const styles = kind === 'error'
    ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300'
    : 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300';
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${styles}`}>{children}</div>
  );
}
