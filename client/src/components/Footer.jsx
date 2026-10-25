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
          <h4 className="font-semibold text-white text-sm">Need help?</h4>
          <p className="mt-4 text-sm text-slate-400">Questions about your account or a course? Reach out and we'll get back to you.</p>
          <a href="mailto:support@learnova.app" className="mt-4 inline-block text-sm font-semibold text-indigo-300 hover:text-white">support@learnova.app</a>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs text-slate-500">
          <p>© 2026 Learnova LMS. All rights reserved.</p>
          
        </div>
      </div>
    </footer>
  );
}
