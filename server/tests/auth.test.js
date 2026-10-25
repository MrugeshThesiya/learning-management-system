const request = require('supertest');
const app = require('../src/index');
const { pool } = require('../src/db');

const stamp = Date.now();
const created = [];
const mkUser = async (name, role = 'student') => {
  const email = `${name}-${stamp}@test.local`;
  const res = await request(app).post('/auth/register').send({ email, full_name: name, password: 'pass123', role });
  created.push(email);
  return { email, token: res.body.token, id: res.body.user?.id, res };
};

afterAll(async () => {
  // Remove everything the tests created so the dev database stays clean
  await pool.query(`DELETE FROM quiz_attempts WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1))`, [created]);
  await pool.query(`DELETE FROM submissions WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1))`, [created]);
  await pool.query(`DELETE FROM lesson_progress WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1))`, [created]);
  await pool.query(`DELETE FROM enrollments WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1))`, [created]);
  await pool.query(`DELETE FROM quiz_questions WHERE quiz_id IN (SELECT q.id FROM quizzes q JOIN courses c ON c.id=q.course_id WHERE c.instructor_id IN (SELECT id FROM users WHERE email = ANY($1)))`, [created]);
  await pool.query(`DELETE FROM quizzes WHERE course_id IN (SELECT id FROM courses WHERE instructor_id IN (SELECT id FROM users WHERE email = ANY($1)))`, [created]);
  await pool.query(`DELETE FROM assignments WHERE course_id IN (SELECT id FROM courses WHERE instructor_id IN (SELECT id FROM users WHERE email = ANY($1)))`, [created]);
  await pool.query(`DELETE FROM lessons WHERE course_id IN (SELECT id FROM courses WHERE instructor_id IN (SELECT id FROM users WHERE email = ANY($1)))`, [created]);
  await pool.query(`DELETE FROM courses WHERE instructor_id IN (SELECT id FROM users WHERE email = ANY($1))`, [created]);
  await pool.query(`DELETE FROM users WHERE email = ANY($1)`, [created]);
  await pool.end();
});

describe('auth', () => {
  it('registers a user', async () => {
    const u = await mkUser('reg');
    expect(u.res.status).toBe(201);
    expect(u.res.body.user.role).toBe('student');
  });
  it('logs in', async () => {
    const u = await mkUser('login');
    const res = await request(app).post('/auth/login').send({ email: u.email, password: 'pass123' });
    expect(res.status).toBe(200);
    expect(res.body.access_token).toBeDefined();
  });
  it('rejects a duplicate email with 409', async () => {
    const u = await mkUser('dupe');
    const res = await request(app).post('/auth/register').send({ email: u.email, full_name: 'x', password: 'pass123' });
    expect(res.status).toBe(409);
  });
  it('does not let public sign-up create admins', async () => {
    const res = await request(app).post('/auth/register').send({ email: `evil-${stamp}@test.local`, full_name: 'Evil', password: 'pass123', role: 'admin' });
    expect(res.status).toBe(400);
  });
});

describe('course lifecycle', () => {
  it('covers draft visibility, enrollment, progress, quizzes and assignments', async () => {
    const teacher = await mkUser('teacher', 'instructor');
    const other = await mkUser('other', 'instructor');
    const student = await mkUser('student');
    const auth = (u) => ({ Authorization: `Bearer ${u.token}` });

    // draft course
    const c = await request(app).post('/courses').set(auth(teacher)).send({ title: 'Draft course', description: 'd' });
    expect(c.status).toBe(201);
    const id = c.body.id;
    expect((await request(app).get('/courses')).body.find((x) => x.id === id)).toBeUndefined();
    expect((await request(app).get(`/courses/${id}`)).status).toBe(404);
    const own = await request(app).get(`/courses/${id}`).set(auth(teacher));
    expect(own.status).toBe(200);
    expect(own.body.can_manage).toBe(true);
    expect((await request(app).get('/courses/all').set(auth(teacher))).status).toBe(403);
    expect((await request(app).patch(`/courses/${id}`).set(auth(other)).send({ title: 'hijack' })).status).toBe(403);
    expect((await request(app).post('/enrollments').set(auth(student)).send({ course_id: id })).status).toBe(404);

    // publish + lessons
    await request(app).patch(`/courses/${id}`).set(auth(teacher)).send({ is_published: true });
    const l1 = await request(app).post(`/courses/${id}/lessons`).set(auth(teacher)).send({ title: 'L1' });
    const l2 = await request(app).post(`/courses/${id}/lessons`).set(auth(teacher)).send({ title: 'L2' });
    expect(l1.status).toBe(201);
    expect(l2.body.order).toBeGreaterThan(l1.body.order);

    // enroll + progress follows lesson completion
    expect((await request(app).put(`/courses/${id}/lessons/${l1.body.id}/complete`).set(auth(student)).send({})).status).toBe(403);
    expect((await request(app).post('/enrollments').set(auth(student)).send({ course_id: id })).status).toBe(201);
    expect((await request(app).post('/enrollments').set(auth(student)).send({ course_id: id })).status).toBe(409);
    const done = await request(app).put(`/courses/${id}/lessons/${l1.body.id}/complete`).set(auth(student)).send({ done: true });
    expect(done.body.progress).toBe(50);
    const undone = await request(app).put(`/courses/${id}/lessons/${l1.body.id}/complete`).set(auth(student)).send({ done: false });
    expect(undone.body.progress).toBe(0);
    const mine = await request(app).get('/enrollments/mine').set(auth(student));
    expect(mine.body[0].title).toBe('Draft course');

    // quiz: answers are hidden from students and scored by question id
    const quiz = await request(app).post('/quizzes').set(auth(teacher)).send({ course_id: id, title: 'Q' });
    expect((await request(app).post('/quizzes').set(auth(student)).send({ course_id: id, title: 'no' })).status).toBe(403);
    await request(app).post(`/quizzes/${quiz.body.id}/questions`).set(auth(teacher)).send({ question: '1+1', options: ['1', '2'], correct_index: 1 });
    expect((await request(app).post(`/quizzes/${quiz.body.id}/questions`).set(auth(teacher)).send({ question: 'bad', options: ['a', 'b'], correct_index: 5 })).status).toBe(400);
    const view = await request(app).get(`/quizzes/${quiz.body.id}`).set(auth(student));
    expect(view.body.questions[0].correct_index).toBeUndefined();
    const qid = view.body.questions[0].id;
    const attempt = await request(app).post(`/quizzes/${quiz.body.id}/submit`).set(auth(student)).send({ answers: { [qid]: 1 } });
    expect(attempt.body).toMatchObject({ score: 1, total: 1 });
    expect((await request(app).get(`/quizzes/${quiz.body.id}/attempts`).set(auth(student))).status).toBe(403);
    expect((await request(app).get(`/quizzes/${quiz.body.id}/attempts`).set(auth(teacher))).body).toHaveLength(1);

    // assignment: submit, grade, validation
    const a = await request(app).post('/assignments').set(auth(teacher)).send({ course_id: id, title: 'A1' });
    const sub = await request(app).post(`/assignments/${a.body.id}/submit`).set(auth(student)).send({ content: 'my work' });
    expect(sub.status).toBe(201);
    expect((await request(app).post(`/assignments/${a.body.id}/submit`).set(auth(student)).send({ content: '  ' })).status).toBe(400);
    expect((await request(app).patch(`/assignments/submissions/${sub.body.id}/grade`).set(auth(other)).send({ grade: 90 })).status).toBe(403);
    expect((await request(app).patch(`/assignments/submissions/${sub.body.id}/grade`).set(auth(teacher)).send({ grade: 500 })).status).toBe(400);
    expect((await request(app).patch(`/assignments/submissions/${sub.body.id}/grade`).set(auth(teacher)).send({ grade: 90 })).body.grade).toBe(90);
    const list = await request(app).get(`/assignments/course/${id}`).set(auth(student));
    expect(list.body[0].my_submission.grade).toBe(90);
  });

  it('answers bad ids with 400/404 instead of crashing', async () => {
    expect((await request(app).get('/courses/abc')).status).toBe(400);
    expect((await request(app).get('/courses/999999')).status).toBe(404);
    expect((await request(app).get('/nope')).status).toBe(404);
  });

  it('lets owners edit lessons and delete courses, and admins manage users', async () => {
    const teacher = await mkUser('del-teacher', 'instructor');
    const other = await mkUser('del-other', 'instructor');
    const student = await mkUser('del-student');
    const adminUser = await mkUser('del-admin');
    await pool.query(`UPDATE users SET role='admin' WHERE email=$1`, [adminUser.email]);
    const admin = { token: (await request(app).post('/auth/login').send({ email: adminUser.email, password: 'pass123' })).body.token };
    const auth = (u) => ({ Authorization: `Bearer ${u.token}` });

    const c = await request(app).post('/courses').set(auth(teacher)).send({ title: 'To delete', is_published: true });
    const id = c.body.id;
    const l = await request(app).post(`/courses/${id}/lessons`).set(auth(teacher)).send({ title: 'Old', content: 'x' });
    const edited = await request(app).patch(`/courses/${id}/lessons/${l.body.id}`).set(auth(teacher)).send({ title: 'New', content: 'y' });
    expect(edited.body).toMatchObject({ title: 'New', content: 'y' });
    expect((await request(app).patch(`/courses/${id}/lessons/${l.body.id}`).set(auth(other)).send({ title: 'no' })).status).toBe(403);

    await request(app).post('/enrollments').set(auth(student)).send({ course_id: id });
    const quiz = await request(app).post('/quizzes').set(auth(teacher)).send({ course_id: id, title: 'Q' });
    await request(app).post(`/quizzes/${quiz.body.id}/questions`).set(auth(teacher)).send({ question: 'q', options: ['a', 'b'], correct_index: 0 });
    await request(app).post(`/assignments`).set(auth(teacher)).send({ course_id: id, title: 'A' });

    expect((await request(app).delete(`/courses/${id}`).set(auth(other))).status).toBe(403);
    expect((await request(app).delete(`/courses/${id}`).set(auth(teacher))).status).toBe(200);
    expect((await request(app).get(`/courses/${id}`)).status).toBe(404);
    expect((await request(app).get('/enrollments/mine').set(auth(student))).body).toHaveLength(0);

    // admin user management
    expect((await request(app).delete(`/admin/users/${student.id}`).set(auth(teacher))).status).toBe(403);
    expect((await request(app).patch(`/admin/users/${student.id}`).set(auth(admin)).send({ role: 'root' })).status).toBe(400);
    expect((await request(app).patch(`/admin/users/${student.id}`).set(auth(admin)).send({ role: 'instructor' })).body.role).toBe('instructor');
    const keep = await request(app).post('/courses').set(auth(teacher)).send({ title: 'Keeps teacher' });
    expect((await request(app).delete(`/admin/users/${teacher.id}`).set(auth(admin))).status).toBe(409);
    await request(app).delete(`/courses/${keep.body.id}`).set(auth(admin));
    expect((await request(app).delete(`/admin/users/${student.id}`).set(auth(admin))).status).toBe(200);
    expect((await request(app).delete(`/admin/users/${adminUser.id}`).set(auth(admin))).status).toBe(400);
  });
});
