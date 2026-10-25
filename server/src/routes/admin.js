const express = require('express');
const router = express.Router();
const { query } = require('../db');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');

// Platform overview for the admin dashboard
router.get('/overview', auth, requireRole('admin'), async (req, res) => {
  const [[users], byRole, [courses], [enrollments], topCourses] = await Promise.all([
    query('SELECT COUNT(*)::int AS total FROM users').then((r) => r.rows),
    query('SELECT role, COUNT(*)::int AS count FROM users GROUP BY role').then((r) => r.rows),
    query('SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE is_published)::int AS published FROM courses').then((r) => r.rows),
    query('SELECT COUNT(*)::int AS total, COALESCE(AVG(progress),0)::float AS avg_progress FROM enrollments').then((r) => r.rows),
    query(
      `SELECT c.id, c.title, c.is_published, COUNT(e.id)::int AS students
       FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id
       GROUP BY c.id ORDER BY students DESC, c.id LIMIT 5`
    ).then((r) => r.rows),
  ]);
  res.json({ users: { total: users.total, byRole }, courses, enrollments, topCourses });
});

// User directory with per-user activity — admin only
router.get('/users', auth, requireRole('admin'), async (req, res) => {
  const r = await query(
    `SELECT u.id, u.email, u.full_name, u.role, u.created_at,
            COUNT(DISTINCT e.course_id)::int AS enrolled,
            COUNT(DISTINCT c.id)::int AS teaching
     FROM users u
     LEFT JOIN enrollments e ON e.user_id = u.id
     LEFT JOIN courses c ON c.instructor_id = u.id
     GROUP BY u.id ORDER BY u.created_at DESC`
  );
  res.json(r.rows);
});

router.param('id', (req, res, next, v) => (/^\d+$/.test(v) ? next() : res.status(400).json({ error: 'Invalid id' })));

router.patch('/users/:id', auth, requireRole('admin'), async (req, res) => {
  const { role } = req.body;
  if (!['student', 'instructor', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  if (String(req.params.id) === String(req.user.sub)) return res.status(400).json({ error: "You can't change your own role" });
  const r = await query('UPDATE users SET role=$1 WHERE id=$2 RETURNING id,email,full_name,role', [role, req.params.id]);
  if (!r.rows[0]) return res.status(404).json({ error: 'User not found' });
  res.json(r.rows[0]);
});

// Deleting a user removes their learning data; instructors with courses must be handled first so content isn't lost silently.
router.delete('/users/:id', auth, requireRole('admin'), async (req, res) => {
  if (String(req.params.id) === String(req.user.sub)) return res.status(400).json({ error: "You can't delete your own account" });
  const u = await query('SELECT id FROM users WHERE id=$1', [req.params.id]);
  if (!u.rows[0]) return res.status(404).json({ error: 'User not found' });
  const teaching = await query('SELECT COUNT(*)::int AS n FROM courses WHERE instructor_id=$1', [req.params.id]);
  if (teaching.rows[0].n > 0) {
    return res.status(409).json({ error: `This user teaches ${teaching.rows[0].n} course(s). Delete those courses first.` });
  }
  await query('DELETE FROM quiz_attempts WHERE user_id=$1', [req.params.id]);
  await query('DELETE FROM submissions WHERE user_id=$1', [req.params.id]);
  await query('DELETE FROM lesson_progress WHERE user_id=$1', [req.params.id]);
  await query('DELETE FROM enrollments WHERE user_id=$1', [req.params.id]);
  await query('DELETE FROM users WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
