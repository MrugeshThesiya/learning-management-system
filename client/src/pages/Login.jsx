import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Alert, InlineSpinner } from '../components/Feedback.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setErr(null);
    if (!email.trim() || !password) { setErr('Enter your email and password.'); return; }
    setBusy(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (e2) {
      setErr(e2.message || 'Sign in failed. Check your details and try again.');
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#f6f7fb] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Brand panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-slate-950 dark:bg-black text-white p-12 flex-col justify-between border-r border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.5),transparent_55%),radial-gradient(circle_at_85%_90%,rgba(217,70,239,0.35),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
        <Link to="/" className="relative flex items-center gap-2.5">
          <span className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center font-black text-lg">L</span>
          <span className="font-extrabold text-xl">Learnova</span>
        </Link>
        <div className="relative">
          <h2 className="text-4xl font-black leading-tight tracking-tight">Welcome back.<br />Let's keep the streak alive.</h2>
          <p className="mt-4 text-slate-400 max-w-md">Pick up right where you left off — your enrollments, progress and grades are exactly as you left them.</p>
        </div>
        <p className="relative text-xs text-slate-500">Protected by secure JWT sessions · Your login persists across reloads</p>
      </div>

      {/* Form panel */}
      <div className="relative flex items-center justify-center p-6 sm:p-10">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6"><ThemeToggle /></div>
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black">L</span>
            <span className="font-extrabold text-lg">Learnova</span>
          </Link>
          <h1 className="text-3xl font-black tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">New here? <Link to="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">Create an account</Link></p>

          {from !== '/dashboard' && (
            <div className="mt-5 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/50 px-4 py-3 text-sm font-medium text-amber-800 dark:text-amber-300">
              Please sign in to continue to <span className="font-bold">{from}</span>
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl shadow-slate-900/5">
            {err && <Alert>{err}</Alert>}
            <div>
              <label className="text-sm font-semibold">Email</label>
              <input
                className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="you@example.com" type="email" autoComplete="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Password</label>
              <div className="relative mt-1.5">
                <input
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-4 py-3 pr-12 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••" type={show ? 'text' : 'password'} autoComplete="current-password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                  {show ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>
            <button disabled={busy} className="w-full rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold py-3 hover:bg-indigo-600 dark:hover:bg-slate-200 transition disabled:opacity-60 flex items-center justify-center gap-2">
              {busy && <InlineSpinner />} {busy ? 'Signing you in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
