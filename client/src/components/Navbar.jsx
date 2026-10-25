import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';

function Avatar({ name }) {
  const ch = (name || 'U').trim()[0]?.toUpperCase() || 'U';
  return (
    <span className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-600 to-violet-500 text-white text-sm font-bold flex items-center justify-center shadow ring-2 ring-white dark:ring-slate-800">
      {ch}
    </span>
  );
}

export function AppNavbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const doLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const link = ({ isActive }) =>
    `px-3.5 py-2 rounded-xl text-sm font-semibold transition ${isActive ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-600/25">L</span>
          <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-lg">Learnova</span>
          <span className="hidden sm:inline text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20">LMS</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/dashboard" className={link}>Dashboard</NavLink>
          <NavLink to="/courses" className={link}>Catalog</NavLink>
          <NavLink to="/my-learning" className={link}>My learning</NavLink>
        </nav>
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex flex-col items-end leading-tight mr-1">
            <span className="text-sm font-semibold text-slate-900 dark:text-white max-w-[160px] truncate">{user?.full_name || 'Learner'}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">{user?.role || 'student'}</span>
          </div>
          <Avatar name={user?.full_name} />
          <ThemeToggle />
          <button onClick={doLogout} className="hidden sm:inline-flex text-sm font-semibold px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/40 transition">
            Log out
          </button>
          <button onClick={() => setOpen((v) => !v)} className="md:hidden h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center" aria-label="Menu">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 px-4 py-3 flex flex-col gap-1 bg-white dark:bg-slate-950">
          <NavLink to="/dashboard" onClick={() => setOpen(false)} className={link}>Dashboard</NavLink>
          <NavLink to="/courses" onClick={() => setOpen(false)} className={link}>Catalog</NavLink>
          <NavLink to="/my-learning" onClick={() => setOpen(false)} className={link}>My learning</NavLink>
          <button onClick={doLogout} className="text-left px-3.5 py-2 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40">Log out</button>
        </div>
      )}
    </header>
  );
}

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 inset-x-0 z-40 bg-[#f6f7fb]/80 dark:bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between h-14 px-4 rounded-2xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg shadow-slate-900/5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-600/25">L</span>
            <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-lg">Learnova</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white">Features</a>
            <a href="#how" className="hover:text-slate-900 dark:hover:text-white">How it works</a>
            <a href="#courses" className="hover:text-slate-900 dark:hover:text-white">Courses</a>
            <a href="#stories" className="hover:text-slate-900 dark:hover:text-white">Stories</a>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login" className="text-sm font-semibold px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Sign in</Link>
            <Link to="/register" className="text-sm font-semibold px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-slate-200 transition shadow">Get started</Link>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button onClick={() => setOpen((v) => !v)} className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 flex items-center justify-center" aria-label="Menu">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" /></svg>
            </button>
          </div>
        </div>
        {open && (
          <div className="md:hidden mt-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xl flex flex-col gap-1">
            <a href="#features" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">Features</a>
            <a href="#courses" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">Courses</a>
            <a href="#stories" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">Stories</a>
            <div className="flex gap-2 pt-1">
              <Link to="/login" className="flex-1 text-center text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">Sign in</Link>
              <Link to="/register" className="flex-1 text-center text-sm font-semibold px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900">Get started</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
