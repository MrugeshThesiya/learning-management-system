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
  // Always send the token when we have one (public endpoints use it to unlock drafts for owners);
  // `auth` only controls whether a 401 means "your session died".
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    const err = new Error('Cannot reach the server. Check that the API is running and try again.');
    err.network = true;
    throw err;
  }
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
  put: (p, body, o) => request(p, { ...o, method: 'PUT', body }),
  del: (p, o) => request(p, { ...o, method: 'DELETE' }),

  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  me: () => request('/auth/me', { method: 'GET' }),

  stats: () => request('/stats', { method: 'GET', auth: false }),
  listCourses: () => request('/courses', { method: 'GET', auth: false }),
  searchCourses: (q) => request(`/courses/search?q=${encodeURIComponent(q || '')}`, { method: 'GET', auth: false }),
  getCourse: (id) => request(`/courses/${id}`, { method: 'GET', auth: false }),
  courseLessons: (id) => request(`/courses/${id}/lessons`, { method: 'GET', auth: false }),
  courseProgress: (id) => request(`/courses/${id}/progress`, { method: 'GET' }),
  setLessonDone: (courseId, lessonId, done) => request(`/courses/${courseId}/lessons/${lessonId}/complete`, { method: 'PUT', body: { done } }),
  courseAssignments: (id) => request(`/assignments/course/${id}`, { method: 'GET' }),
  submitAssignment: (id, content) => request(`/assignments/${id}/submit`, { method: 'POST', body: { content } }),

  enroll: (course_id) => request('/enrollments', { method: 'POST', body: { course_id } }),
  myEnrollments: () => request('/enrollments/mine', { method: 'GET' }),

  // Quizzes
  courseQuizzes: (courseId) => request(`/quizzes/course/${courseId}`, { method: 'GET' }),
  getQuiz: (quizId) => request(`/quizzes/${quizId}`, { method: 'GET' }),
  submitQuiz: (quizId, answers) => request(`/quizzes/${quizId}/submit`, { method: 'POST', body: { answers } }),

  // Instructor studio
  teachingCourses: () => request('/courses/teaching', { method: 'GET' }),
  allCourses: () => request('/courses/all', { method: 'GET' }),
  createCourse: (payload) => request('/courses', { method: 'POST', body: payload }),
  updateCourse: (id, payload) => request(`/courses/${id}`, { method: 'PATCH', body: payload }),
  addLesson: (courseId, payload) => request(`/courses/${courseId}/lessons`, { method: 'POST', body: payload }),
  deleteCourse: (id) => request(`/courses/${id}`, { method: 'DELETE' }),
  updateLesson: (courseId, lessonId, payload) => request(`/courses/${courseId}/lessons/${lessonId}`, { method: 'PATCH', body: payload }),
  deleteQuiz: (quizId) => request(`/quizzes/${quizId}`, { method: 'DELETE' }),
  deleteAssignment: (id) => request(`/assignments/${id}`, { method: 'DELETE' }),
  deleteLesson: (courseId, lessonId) => request(`/courses/${courseId}/lessons/${lessonId}`, { method: 'DELETE' }),
  createQuiz: (course_id, title) => request('/quizzes', { method: 'POST', body: { course_id, title } }),
  quizQuestions: (quizId) => request(`/quizzes/${quizId}/questions`, { method: 'GET' }),
  addQuestion: (quizId, payload) => request(`/quizzes/${quizId}/questions`, { method: 'POST', body: payload }),
  deleteQuestion: (quizId, questionId) => request(`/quizzes/${quizId}/questions/${questionId}`, { method: 'DELETE' }),
  quizAttempts: (quizId) => request(`/quizzes/${quizId}/attempts`, { method: 'GET' }),
  createAssignment: (payload) => request('/assignments', { method: 'POST', body: payload }),
  assignmentSubmissions: (assignmentId) => request(`/assignments/${assignmentId}/submissions`, { method: 'GET' }),
  gradeSubmission: (submissionId, grade) => request(`/assignments/submissions/${submissionId}/grade`, { method: 'PATCH', body: { grade } }),

  // Admin
  adminOverview: () => request('/admin/overview', { method: 'GET' }),
  adminSetRole: (id, role) => request(`/admin/users/${id}`, { method: 'PATCH', body: { role } }),
  adminDeleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  adminUsers: () => request('/admin/users', { method: 'GET' }),
};

export { TOKEN_KEY, USER_KEY };
