import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, clearSession, getToken, getStoredUser, isTokenExpired, persistSession } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getToken());
  // 'loading' on boot / every hard reload, then 'authenticated' | 'guest'
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const booted = useRef(false);

  const setSession = useCallback((nextToken, nextUser) => {
    setToken(nextToken || null);
    setUser(nextUser || null);
    persistSession(nextToken, nextUser);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
    setStatus('guest');
    setError(null);
  }, []);

  // Validate the persisted session against the server (boot, tab focus, other-tab changes).
  // Only the very first check shows a loading screen — re-checks are silent so open pages and
  // half-filled forms are never torn down, and a flaky network never logs you out (only a 401 does).
  const validate = useCallback(async () => {
    const t = getToken();
    if (!t || isTokenExpired(t)) {
      clearSession();
      setToken(null);
      setUser(null);
      setStatus('guest');
      return null;
    }
    try {
      const data = await api.me();
      const freshUser = data?.user || getStoredUser();
      setSession(t, freshUser);
      setStatus('authenticated');
      setError(null);
      return freshUser;
    } catch (e) {
      if (e.status === 401) {
        clearSession();
        setToken(null);
        setUser(null);
        setStatus('guest');
        return null;
      }
      // Server unreachable / 5xx: keep the cached session so the user isn't kicked out.
      const cached = getStoredUser();
      if (cached) { setUser(cached); setStatus('authenticated'); return cached; }
      setStatus('guest');
      return null;
    }
  }, [setSession]);

  useEffect(() => {
    // Listeners must be (re)attached on every mount — React StrictMode runs this effect twice in dev.
    if (!booted.current) { booted.current = true; validate(); }
    const onFocus = () => { if (getToken()) validate(); };
    const onStorage = (e) => {
      if (e.key === 'lms_token' || e.key === 'lms_user') validate();
    };
    const onUnauthorized = () => logout();
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);
    window.addEventListener('lms:unauthorized', onUnauthorized);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('lms:unauthorized', onUnauthorized);
    };
  }, [validate, logout]);

  const login = useCallback(async (email, password) => {
    setError(null);
    const data = await api.login(email.trim(), password).catch((e) => {
      setError(e.message);
      throw e;
    });
    const nextToken = data.access_token || data.token;
    let nextUser = data.user || null;
    if (!nextUser) {
      // Fallback for older API shape: hydrate from /me
      persistSession(nextToken, null);
      try {
        const me = await api.me();
        nextUser = me.user;
      } catch { nextUser = getStoredUser(); }
    }
    setSession(nextToken, nextUser);
    setStatus('authenticated');
    return nextUser;
  }, [setSession]);

  const register = useCallback(async ({ name, email, password, role }) => {
    setError(null);
    const data = await api.register({ full_name: name.trim(), email: email.trim(), password, role }).catch((e) => {
      setError(e.message);
      throw e;
    });
    const nextToken = data.access_token || data.token;
    if (nextToken) {
      setSession(nextToken, data.user || null);
      setStatus('authenticated');
      // Hydrate full profile
      try {
        const me = await api.me();
        setSession(nextToken, me.user);
        return me.user;
      } catch { return data.user || null; }
    }
    // No token returned (legacy): fall through to explicit login
    return login(email, password);
  }, [login, setSession]);

  const refresh = useCallback(() => validate(), [validate]);

  const value = useMemo(() => ({
    user, token, status, error,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    login, register, logout, refresh,
  }), [user, token, status, error, login, register, logout, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
