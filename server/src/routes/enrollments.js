const express = require('express');
const router = express.Router();
const { query } = require('../db');
const auth = require('../middleware/auth');
const { numericParam } = require('../middleware/courseAccess');

router.param('id', numericParam);

router.post('/', auth, async (req, res) => {
  const courseId = req.body.course_id;
  if (!/^\d+$/.test(String(courseId ?? ''))) return res.status(400).json({ error: 'course_id is required' });
  const course = await query('SELECT is_published, instructor_id FROM courses WHERE id=$1', [courseId]);
  if (!course.rows[0] || !course.rows[0].is_published) return res.status(404).json({ error: 'Course not found' });
  if (String(course.rows[0].instructor_id) === String(req.user.sub)) {
    return res.status(400).json({ error: "You can't enroll in your own course" });
  }
  const r = await query(
    `INSERT INTO enrollments (user_id, course_id) VALUES ($1,$2)
     ON CONFLICT (user_id, course_id) DO NOTHING RETURNING *`,
    [req.user.sub, courseId]
  );
  if (!r.rows[0]) return res.status(409).json({ error: 'You are already enrolled in this course' });
  res.status(201).json(r.rows[0]);
});

// My enrollments joined with their course info, so a course that was later unpublished still shows up
router.get('/mine', auth, async (req, res) => {
  const r = await query(
    `SELECT e.id, e.user_id, e.course_id, e.progress::float AS progress, e.enrolled_at,
            c.title, c.description, c.is_published, u.full_name AS instructor_name,
            (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id)::int AS lessons_count
     FROM enrollments e
     JOIN courses c ON c.id = e.course_id
     LEFT JOIN users u ON u.id = c.instructor_id
     WHERE e.user_id = $1 ORDER BY e.enrolled_at DESC`,
    [req.user.sub]
  );
  res.json(r.rows);
});

router.patch('/:id/progress', auth, async (req, res) => {
  const progress = Number(req.body.progress);
  if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
    return res.status(400).json({ error: 'progress must be a number between 0 and 100' });
  }
  const r = await query(
    'UPDATE enrollments SET progress=$1 WHERE id=$2 AND user_id=$3 RETURNING *',
    [progress, req.params.id, req.user.sub]
  );
  if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(r.rows[0]);
});

module.exports = router;
