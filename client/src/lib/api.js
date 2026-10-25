const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

const TOKEN_KEY = 'lms_token';
const USER_KEY = 'lms_user';

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function persistSession(token, user) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch { /* private mode */ }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch { /* ignore */ }
}

export function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch { return null; }
}

export function isTokenExpired(token) {
  const d = decodeToken(token);
  if (!d || !d.exp) return false;
  return d.exp * 1000 < Date.now() + 10_000;
}

async function request(path, { method = 'GET', body, auth = true, signal } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });
  let data = null;
  try { data = await res.json(); } catch { data = null; }
  if (res.status === 401 && auth) {
    // Let callers decide, but broadcast so AuthContext can log out.
    window.dispatchEvent(new CustomEvent('lms:unauthorized'));
  }
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  base: API_BASE,
  get: (p, o) => request(p, { ...o, method: 'GET' }),
  post: (p, body, o) => request(p, { ...o, method: 'POST', body }),
  patch: (p, body, o) => request(p, { ...o, method: 'PATCH', body }),

  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  me: () => request('/auth/me', { method: 'GET' }),

  listCourses: () => request('/courses', { method: 'GET', auth: false }),
  searchCourses: (q) => request(`/courses/search?q=${encodeURIComponent(q || '')}`, { method: 'GET', auth: false }),
  courseLessons: (id) => request(`/courses/${id}/lessons`, { method: 'GET', auth: false }),
  courseAssignments: (id) => request(`/assignments/course/${id}`, { method: 'GET', auth: false }),

  enroll: (course_id) => request('/enrollments', { method: 'POST', body: { course_id } }),
  myEnrollments: () => request('/enrollments/mine', { method: 'GET' }),
  updateProgress: (id, progress) => request(`/enrollments/${id}/progress`, { method: 'PATCH', body: { progress } }),
};

export { TOKEN_KEY, USER_KEY };
