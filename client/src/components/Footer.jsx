import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer({ minimal }) {
  if (minimal) {
    return (
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
          <p>© 2026 Learnova LMS · Crafted for focused learning</p>
          <p className="font-medium">Questions? Contact support@learnova.app</p>
        </div>
      </footer>
    );
  }
  return (
    <footer className="bg-slate-950 dark:bg-black text-slate-300 dark:text-slate-400 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center font-black">L</span>
            <span className="font-extrabold text-white text-lg">Learnova</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">A modern learning platform for courses, quizzes, assignments and progress tracking — built for students and instructors.</p>
        </div>
        <div>
          <h4 className="font-semibold text-white text-sm">Platform</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/courses" className="hover:text-white">Course catalog</Link></li>
            <li><Link to="/dashboard" className="hover:text-white">Dashboard</Link></li>
            <li><Link to="/my-learning" className="hover:text-white">My learning</Link></li>
            <li><Link to="/register" className="hover:text-white">Create account</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white text-sm">Account</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/login" className="hover:text-white">Sign in</Link></li>
            <li><Link to="/register" className="hover:text-white">Sign up</Link></li>
            <li><a href="#features" className="hover:text-white">Features</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white text-sm">Stay in the loop</h4>
          <p className="mt-4 text-sm text-slate-400">New courses and features, once a month. No spam.</p>
          <form onSubmit={(e) => e.preventDefault()} className="mt-4 flex gap-2">
            <input placeholder="you@email.com" className="flex-1 min-w-0 rounded-xl bg-white/10 border border-white/10 px-3.5 py-2.5 text-sm placeholder:text-slate-500 text-white focus:outline-none focus:border-indigo-400" />
            <button className="rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold px-4 transition">Join</button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs text-slate-500">
          <p>© 2026 Learnova LMS. All rights reserved.</p>
          <p>Privacy · Terms · Status</p>
        </div>
      </div>
    </footer>
  );
}
