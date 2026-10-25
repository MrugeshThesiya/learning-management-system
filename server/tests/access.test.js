const request = require('supertest');
const app = require('../src/index');
const { pool } = require('../src/db');

const stamp = Date.now();
const created = [];
const mkUser = async (name, role = 'student') => {
  const email = `${name}-${stamp}@test.local`;
  const res = await request(app).post('/auth/register').send({ email, full_name: `Access ${name}`, password: 'pass123', role });
  created.push(email);
  return { email, token: res.body.token, id: res.body.user?.id, res };
};
const auth = (u) => ({ Authorization: `Bearer ${u.token}` });

afterAll(async () => {
  const who = `SELECT id FROM users WHERE email = ANY($1)`;
  await pool.query(`DELETE FROM lesson_progress WHERE user_id IN (${who})`, [created]);
  await pool.query(`DELETE FROM enrollments WHERE user_id IN (${who}) OR course_id IN (SELECT id FROM courses WHERE instructor_id IN (${who}))`, [created]);
  await pool.query(`DELETE FROM lessons WHERE course_id IN (SELECT id FROM courses WHERE instructor_id IN (${who}))`, [created]);
  await pool.query(`DELETE FROM courses WHERE instructor_id IN (${who})`, [created]);
  await pool.query(`DELETE FROM users WHERE email = ANY($1)`, [created]);
  await pool.end();
});

describe('health and unknown routes', () => {
  it('answers unknown API routes with a JSON 404', async () => {
    const res = await request(app).get('/definitely-not-a-route');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});

describe('session handling', () => {
  it('rejects a login with the wrong password or missing fields', async () => {
    const u = await mkUser('wrongpw');
    const bad = await request(app).post('/auth/login').send({ email: u.email, password: 'nope-nope' });
    expect(bad.status).toBe(401);
    const missing = await request(app).post('/auth/login').send({ email: u.email });
    expect(missing.status).toBe(400);
  });

  it('validates the session on /auth/me and rejects missing or bad tokens', async () => {
    const u = await mkUser('me');
    const ok = await request(app).get('/auth/me').set(auth(u));
    expect(ok.status).toBe(200);
    expect(ok.body.user.email).toBe(u.email);
    expect(ok.body.user.password_hash).toBeUndefined();

    expect((await request(app).get('/auth/me')).status).toBe(401);
    expect((await request(app).get('/auth/me').set({ Authorization: 'Bearer not.a.token' })).status).toBe(401);
  });

  it('logs out', async () => {
    const res = await request(app).post('/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

describe('role based access', () => {
  it('lets only instructors create courses and requires a title', async () => {
    const student = await mkUser('role-student');
    const teacher = await mkUser('role-teacher', 'instructor');

    expect((await request(app).post('/courses').send({ title: 'Anon' })).status).toBe(401);
    expect((await request(app).post('/courses').set(auth(student)).send({ title: 'Nope' })).status).toBe(403);
    expect((await request(app).post('/courses').set(auth(teacher)).send({ title: '   ' })).status).toBe(400);
    expect((await request(app).post('/courses').set(auth(teacher)).send({ title: 'Allowed' })).status).toBe(201);
  });

  it('keeps admin endpoints away from non-admins', async () => {
    const student = await mkUser('adm-student');
    const teacher = await mkUser('adm-teacher', 'instructor');

    for (const path of ['/admin/overview', '/admin/users', '/courses/all']) {
      expect((await request(app).get(path)).status).toBe(401);
      expect((await request(app).get(path).set(auth(student))).status).toBe(403);
      expect((await request(app).get(path).set(auth(teacher))).status).toBe(403);
    }
  });

  it('gives admins the platform overview, user directory and all courses', async () => {
    const adminUser = await mkUser('adm-admin');
    await pool.query(`UPDATE users SET role='admin' WHERE email=$1`, [adminUser.email]);
    // role is baked into the token, so sign in again to pick it up
    const login = await request(app).post('/auth/login').send({ email: adminUser.email, password: 'pass123' });
    const admin = { token: login.body.token };

    const overview = await request(app).get('/admin/overview').set(auth(admin));
    expect(overview.status).toBe(200);
    expect(overview.body.users.total).toBeGreaterThan(0);
    expect(Array.isArray(overview.body.users.byRole)).toBe(true);
    expect(overview.body.courses.total).toBeGreaterThanOrEqual(overview.body.courses.published);

    const users = await request(app).get('/admin/users').set(auth(admin));
    expect(users.status).toBe(200);
    expect(users.body.some((u) => u.email === adminUser.email)).toBe(true);
    expect(JSON.stringify(users.body)).not.toContain('password_hash');

    expect((await request(app).get('/courses/all').set(auth(admin))).status).toBe(200);
  });
});

describe('public catalogue', () => {
  it('searches published courses only and exposes real platform stats', async () => {
    const teacher = await mkUser('cat-teacher', 'instructor');
    const word = `Zephyr${stamp}`;
    const pub = await request(app).post('/courses').set(auth(teacher)).send({ title: `${word} published`, description: 'visible', is_published: true });
    await request(app).post('/courses').set(auth(teacher)).send({ title: `${word} draft`, description: 'hidden', is_published: false });

    const found = await request(app).get('/courses/search').query({ q: word });
    expect(found.status).toBe(200);
    expect(found.body.map((c) => c.id)).toEqual([pub.body.id]);

    const list = await request(app).get('/courses');
    expect(list.body.every((c) => c.is_published)).toBe(true);

    const stats = await request(app).get('/stats');
    expect(stats.status).toBe(200);
    for (const k of ['learners', 'courses', 'lessons', 'enrollments']) {
      expect(typeof stats.body[k]).toBe('number');
    }
    expect(stats.body.courses).toBeGreaterThanOrEqual(1);
  });

  it('teaching list shows an instructor only their own courses', async () => {
    const a = await mkUser('own-a', 'instructor');
    const b = await mkUser('own-b', 'instructor');
    const course = await request(app).post('/courses').set(auth(a)).send({ title: `Owned ${stamp}` });

    const mineA = await request(app).get('/courses/teaching').set(auth(a));
    expect(mineA.body.map((c) => c.id)).toContain(course.body.id);
    const mineB = await request(app).get('/courses/teaching').set(auth(b));
    expect(mineB.body.map((c) => c.id)).not.toContain(course.body.id);

    // Another instructor cannot edit or delete it
    expect((await request(app).patch(`/courses/${course.body.id}`).set(auth(b)).send({ title: 'Hijack' })).status).toBe(403);
    expect((await request(app).delete(`/courses/${course.body.id}`).set(auth(b))).status).toBe(403);
  });
});
