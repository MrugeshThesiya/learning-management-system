import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Alert, InlineSpinner } from '../components/Feedback.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const strength = password.length >= 10 ? 3 : password.length >= 7 ? 2 : password.length >= 4 ? 1 : 0;

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setErr(null);
    if (!name.trim() || !email.trim() || !password) { setErr('Please fill in your name, email and password.'); return; }
    if (password.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    setBusy(true);
    try {
      await register({ name, email, password, role });
      navigate('/dashboard', { replace: true });
    } catch (e2) {
      setErr(e2.message || 'Could not create your account. Try a different email.');
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#f6f7fb] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="relative flex items-center justify-center p-6 sm:p-10 order-2 lg:order-1">
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6"><ThemeToggle /></div>
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black">L</span>
            <span className="font-extrabold text-lg">Learnova</span>
          </Link>
          <h1 className="text-3xl font-black tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Already have one? <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">Sign in</Link></p>

          <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl shadow-slate-900/5">
            {err && <Alert>{err}</Alert>}
            <div>
              <label className="text-sm font-semibold">Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" autoComplete="name"
                className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-sm font-semibold">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" autoComplete="email"
                className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-sm font-semibold">Password</label>
              <div className="relative mt-1.5">
                <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 characters" type={show ? 'text' : 'password'} autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-4 py-3 pr-12 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                  {show ? 'HIDE' : 'SHOW'}
                </button>
              </div>
              <div className="mt-2 flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={`h-1.5 flex-1 rounded-full ${strength > i ? (strength === 3 ? 'bg-emerald-500' : strength === 2 ? 'bg-amber-400' : 'bg-red-400') : 'bg-slate-100 dark:bg-slate-700'}`} />
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold">I am joining as</label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {['student', 'instructor'].map((r) => (
                  <button key={r} type="button" onClick={() => setRole(r)}
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition ${role === r ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-600 dark:ring-indigo-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <button disabled={busy} className="w-full rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold py-3 hover:bg-indigo-600 dark:hover:bg-slate-200 transition disabled:opacity-60 flex items-center justify-center gap-2">
              {busy && <InlineSpinner />} {busy ? 'Creating account…' : 'Create account'}
            </button>
            <p className="text-center text-xs text-slate-400 dark:text-slate-500">By continuing you agree to the Terms & Privacy Policy.</p>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex relative overflow-hidden bg-slate-950 dark:bg-black text-white p-12 flex-col justify-between order-1 lg:order-2 border-l border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.5),transparent_55%),radial-gradient(circle_at_15%_90%,rgba(217,70,239,0.35),transparent_55%)]" />
        <div className="relative" />
        <div className="relative">
          <h2 className="text-4xl font-black leading-tight tracking-tight">One account.<br />Every course, quiz & grade.</h2>
          <div className="mt-8 space-y-3 max-w-md">
            {[['Enroll in seconds', 'One click and the course is yours, with progress from 0 to 100%.'], ['Learn anywhere', 'Your session follows you — reload, switch tabs, come back later.'], ['Prove your skills', 'Pass quizzes, submit assignments and build a real record.']].map(([t, d]) => (
              <div key={t} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <span className="h-8 w-8 shrink-0 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">✓</span>
                <div><p className="font-bold text-sm">{t}</p><p className="text-sm text-slate-400">{d}</p></div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-slate-500">Free to start · No credit card required</p>
      </div>
    </div>
  );
}
