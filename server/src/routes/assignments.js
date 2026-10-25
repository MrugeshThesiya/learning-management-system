const express = require('express');
const router = express.Router();
const { query } = require('../db');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');
const { canManageCourse, canViewCourse, numericParam } = require('../middleware/courseAccess');

router.param('id', numericParam);

router.post('/', auth, requireRole('instructor', 'admin'), async (req, res) => {
  const { course_id, title, description, due_date } = req.body;
  if (!(await canManageCourse(req.user, course_id))) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (!title || !String(title).trim()) return res.status(400).json({ error: 'Title is required' });
  const r = await query('INSERT INTO assignments (course_id,title,description,due_date) VALUES ($1,$2,$3,$4) RETURNING *', [course_id, String(title).trim(), description, due_date || null]);
  res.status(201).json(r.rows[0]);
});

// Assignments of a course; for the caller each one also carries their own submission (if any)
router.get('/course/:id', auth, async (req, res) => {
  if (!(await canViewCourse(req.user, req.params.id))) return res.status(404).json({ error: 'Course not found' });
  const r = await query(
    `SELECT a.*, (SELECT row_to_json(s) FROM (
        SELECT id, content, grade::float AS grade, submitted_at FROM submissions s
        WHERE s.assignment_id = a.id AND s.user_id = $2) s) AS my_submission
     FROM assignments a WHERE a.course_id=$1 ORDER BY a.due_date NULLS LAST, a.id`,
    [req.params.id, req.user.sub]
  );
  res.json(r.rows);
});

// Submissions for an assignment — visible to the course owner / admin (for grading)
router.get('/:id/submissions', auth, async (req, res) => {
  const a = await query('SELECT course_id FROM assignments WHERE id=$1', [req.params.id]);
  if (!a.rows[0]) return res.status(404).json({ error: 'Assignment not found' });
  if (!(await canManageCourse(req.user, a.rows[0].course_id))) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const r = await query(
    `SELECT s.id, s.assignment_id, s.user_id, s.content, s.grade::float AS grade, s.submitted_at, u.full_name, u.email
     FROM submissions s JOIN users u ON u.id = s.user_id
     WHERE s.assignment_id=$1 ORDER BY s.submitted_at DESC`,
    [req.params.id]
  );
  res.json(r.rows);
});

// Students submit (or resubmit) their work; resubmitting clears the previous grade
router.post('/:id/submit', auth, async (req, res) => {
  const a = await query('SELECT course_id FROM assignments WHERE id=$1', [req.params.id]);
  if (!a.rows[0]) return res.status(404).json({ error: 'Assignment not found' });
  const enrolled = await query('SELECT 1 FROM enrollments WHERE user_id=$1 AND course_id=$2', [req.user.sub, a.rows[0].course_id]);
  if (!enrolled.rows[0]) return res.status(403).json({ error: 'Enroll in this course to submit work' });
  const content = (req.body.content || '').trim();
  if (!content) return res.status(400).json({ error: 'Write your answer before submitting' });
  const r = await query(
    `INSERT INTO submissions (assignment_id,user_id,content) VALUES ($1,$2,$3)
     ON CONFLICT (assignment_id, user_id)
     DO UPDATE SET content = EXCLUDED.content, grade = NULL, submitted_at = NOW()
     RETURNING id, content, grade::float AS grade, submitted_at`,
    [req.params.id, req.user.sub, content]
  );
  res.status(201).json(r.rows[0]);
});

router.delete('/:id', auth, requireRole('instructor', 'admin'), async (req, res) => {
  const a = await query('SELECT course_id FROM assignments WHERE id=$1', [req.params.id]);
  if (!a.rows[0]) return res.status(404).json({ error: 'Assignment not found' });
  if (!(await canManageCourse(req.user, a.rows[0].course_id))) return res.status(403).json({ error: 'Forbidden' });
  await query('DELETE FROM submissions WHERE assignment_id=$1', [req.params.id]);
  await query('DELETE FROM assignments WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

router.patch('/submissions/:id/grade', auth, requireRole('instructor', 'admin'), async (req, res) => {
  const grade = Number(req.body.grade);
  if (req.body.grade === '' || req.body.grade === null || !Number.isFinite(grade) || grade < 0 || grade > 100) {
    return res.status(400).json({ error: 'Grade must be a number between 0 and 100' });
  }
  const s = await query(
    `SELECT a.course_id FROM submissions s JOIN assignments a ON a.id = s.assignment_id WHERE s.id=$1`,
    [req.params.id]
  );
  if (!s.rows[0]) return res.status(404).json({ error: 'Submission not found' });
  if (!(await canManageCourse(req.user, s.rows[0].course_id))) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const r = await query('UPDATE submissions SET grade=$1 WHERE id=$2 RETURNING id, grade::float AS grade', [grade, req.params.id]);
  res.json(r.rows[0]);
});

module.exports = router;
