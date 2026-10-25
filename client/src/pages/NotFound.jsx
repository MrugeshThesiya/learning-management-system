import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="text-center py-24">
      <p className="text-7xl font-black bg-gradient-to-r from-indigo-600 dark:from-indigo-400 to-fuchsia-500 dark:to-fuchsia-400 bg-clip-text text-transparent">404</p>
      <h1 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">Page not found</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">The page you're looking for doesn't exist or moved.</p>
      <div className="mt-6 flex justify-center gap-2.5">
        <Link to="/dashboard" className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold">Go to dashboard</Link>
        <Link to="/courses" className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-semibold">Browse courses</Link>
      </div>
    </div>
  );
}
