import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, decodeToken, isTokenExpired, persistSession, getToken, getStoredUser, clearSession } from './api.js';

const makeToken = (payload) => `h.${btoa(JSON.stringify(payload))}.s`;
const jsonResponse = (status, body) => ({ status, ok: status >= 200 && status < 300, json: async () => body });

describe('token helpers', () => {
  it('decodes a JWT payload and tolerates garbage', () => {
    expect(decodeToken(makeToken({ sub: 7, role: 'student' }))).toMatchObject({ sub: 7, role: 'student' });
    expect(decodeToken('not-a-token')).toBeNull();
  });

  it('detects expired tokens, with a small safety margin', () => {
    const now = Math.floor(Date.now() / 1000);
    expect(isTokenExpired(makeToken({ exp: now - 60 }))).toBe(true);
    expect(isTokenExpired(makeToken({ exp: now + 3600 }))).toBe(false);
    expect(isTokenExpired(makeToken({}))).toBe(false);
  });
});

describe('session storage', () => {
  it('persists, reads and clears the session', () => {
    persistSession('tok', { id: 1, email: 'a@b.c' });
    expect(getToken()).toBe('tok');
    expect(getStoredUser()).toEqual({ id: 1, email: 'a@b.c' });
    clearSession();
    expect(getToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });
});

describe('request layer', () => {
  beforeEach(() => { vi.stubGlobal('fetch', vi.fn()); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('sends the bearer token and JSON body', async () => {
    persistSession('abc', { id: 1 });
    fetch.mockResolvedValue(jsonResponse(200, { ok: true }));
    await api.post('/enrollments', { course_id: 3 });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toMatch(/\/enrollments$/);
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer abc');
    expect(JSON.parse(init.body)).toEqual({ course_id: 3 });
  });

  it('surfaces the server error message and status', async () => {
    fetch.mockResolvedValue(jsonResponse(409, { error: 'Already enrolled' }));
    await expect(api.enroll(1)).rejects.toMatchObject({ message: 'Already enrolled', status: 409 });
  });

  it('broadcasts an unauthorized event on 401 for authenticated calls only', async () => {
    const handler = vi.fn();
    window.addEventListener('lms:unauthorized', handler);
    fetch.mockResolvedValue(jsonResponse(401, { error: 'Unauthorized' }));
    await expect(api.myEnrollments()).rejects.toMatchObject({ status: 401 });
    expect(handler).toHaveBeenCalledTimes(1);

    await expect(api.login('a@b.c', 'wrong')).rejects.toMatchObject({ status: 401 });
    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener('lms:unauthorized', handler);
  });

  it('turns a network failure into a friendly error', async () => {
    fetch.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(api.listCourses()).rejects.toMatchObject({ network: true, message: expect.stringMatching(/Cannot reach the server/) });
  });

  it('encodes search queries', async () => {
    fetch.mockResolvedValue(jsonResponse(200, []));
    await api.searchCourses('c++ & more');
    expect(fetch.mock.calls[0][0]).toMatch(/\/courses\/search\?q=c%2B%2B%20%26%20more$/);
  });
});
