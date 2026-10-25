const express = require('express');
const router = express.Router();
const { query } = require('../db');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');
const { deleteCourseData } = require('../lib/cleanup');
const { canManageCourse, canViewCourse, optionalUser, numericParam } = require('../middleware/courseAccess');

router.param('id', numericParam);
router.param('lessonId', numericParam);

// Course rows enriched with the data the UI cards need (instructor name, counts)
const COURSE_SELECT = `
  SELECT c.*, u.full_name AS instructor_name,
         (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id)::int AS lessons_count,
         (SELECT COUNT(*) FROM quizzes q WHERE q.course_id = c.id)::int AS quizzes_count,
         (SELECT COUNT(*) FROM assignments a WHERE a.course_id = c.id)::int AS assignments_count,
         (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id)::int AS students
  FROM courses c LEFT JOIN users u ON u.id = c.instructor_id`;

// Recompute stored enrollment progress (% of lessons completed) for a course
async function recomputeProgress(courseId, userId) {
  await query(
    `UPDATE enrollments e SET progress = COALESCE((
       SELECT ROUND(100.0 * COUNT(lp.lesson_id) / NULLIF((SELECT COUNT(*) FROM lessons WHERE course_id = e.course_id), 0))
       FROM lesson_progress lp JOIN lessons l ON l.id = lp.lesson_id
       WHERE l.course_id = e.course_id AND lp.user_id = e.user_id
     ), 0)
     WHERE e.course_id = $1 AND ($2::int IS NULL OR e.user_id = $2)`,
    [courseId, userId ?? null]
  );
}

router.post('/', auth, requireRole('instructor', 'admin'), async (req, res) => {
  const { title, description, is_published } = req.body;
  if (!title || !String(title).trim()) return res.status(400).json({ error: 'Title is required' });
  const r = await query(
    'INSERT INTO courses (title, description, instructor_id, is_published) VALUES ($1,$2,$3,$4) RETURNING *',
    [String(title).trim(), description, req.user.sub, !!is_published]
  );
  res.status(201).json(r.rows[0]);
});

router.get('/', async (req, res) => {
  const r = await query(`${COURSE_SELECT} WHERE c.is_published = TRUE ORDER BY c.created_at DESC, c.id DESC`);
  res.json(r.rows);
});

router.get('/search', async (req, res) => {
  const q = '%' + (req.query.q || '') + '%';
  const r = await query(
    `${COURSE_SELECT} WHERE c.is_published = TRUE AND (c.title ILIKE $1 OR c.description ILIKE $1 OR u.full_name ILIKE $1)
     ORDER BY c.created_at DESC, c.id DESC`,
    [q]
  );
  res.json(r.rows);
});

// Every course incl. drafts — admin console only
router.get('/all', auth, requireRole('admin'), async (req, res) => {
  const r = await query(`${COURSE_SELECT} ORDER BY c.created_at DESC, c.id DESC`);
  res.json(r.rows);
});

// Instructor studio: my courses with enrollment stats
router.get('/teaching', auth, requireRole('instructor', 'admin'), async (req, res) => {
  const r = await query(
    `SELECT c.*, COUNT(e.id)::int AS students,
            COALESCE(AVG(e.progress), 0)::float AS avg_progress,
            (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id)::int AS lessons_count
     FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id
     WHERE c.instructor_id = $1
     GROUP BY c.id ORDER BY c.created_at DESC`,
    [req.user.sub]
  );
  res.json(r.rows);
});

// Single course (drafts are only visible to the owner / admin)
router.get('/:id', async (req, res) => {
  const user = optionalUser(req);
  if (!(await canViewCourse(user, req.params.id))) return res.status(404).json({ error: 'Course not found' });
  const r = await query(`${COURSE_SELECT} WHERE c.id = $1`, [req.params.id]);
  res.json({ ...r.rows[0], can_manage: await canManageCourse(user, req.params.id) });
});

// Owner (or admin) can edit title/description/publish state
router.patch('/:id', auth, async (req, res) => {
  if (!(await canManageCourse(req.user, req.params.id))) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { title, description, is_published } = req.body;
  if (title !== undefined && !String(title).trim()) return res.status(400).json({ error: 'Title cannot be empty' });
  const fields = [];
  const vals = [];
  if (title !== undefined) { vals.push(String(title).trim()); fields.push(`title=$${vals.length}`); }
  if (description !== undefined) { vals.push(description); fields.push(`description=$${vals.length}`); }
  if (is_published !== undefined) { vals.push(!!is_published); fields.push(`is_published=$${vals.length}`); }
  if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });
  vals.push(req.params.id);
  const r = await query(`UPDATE courses SET ${fields.join(', ')} WHERE id=$${vals.length} RETURNING *`, vals);
  if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(r.rows[0]);
});

// Deletes a course and everything that hangs off it (owner / admin)
router.delete('/:id', auth, async (req, res) => {
  if (!(await canManageCourse(req.user, req.params.id))) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  await deleteCourseData(req.params.id);
  res.json({ ok: true });
});

router.post('/:id/lessons', auth, requireRole('instructor', 'admin'), async (req, res) => {
  if (!(await canManageCourse(req.user, req.params.id))) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { title, content, order } = req.body;
  if (!title || !String(title).trim()) return res.status(400).json({ error: 'Title is required' });
  const r = await query(
    `INSERT INTO lessons (course_id, title, content, "order")
     VALUES ($1,$2,$3, COALESCE($4, (SELECT COALESCE(MAX("order"), 0) + 1 FROM lessons WHERE course_id=$1))) RETURNING *`,
    [req.params.id, String(title).trim(), content, Number.isInteger(order) ? order : null]
  );
  await recomputeProgress(req.params.id);
  res.status(201).json(r.rows[0]);
});

router.patch('/:id/lessons/:lessonId', auth, requireRole('instructor', 'admin'), async (req, res) => {
  if (!(await canManageCourse(req.user, req.params.id))) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { title, content } = req.body;
  if (title !== undefined && !String(title).trim()) return res.status(400).json({ error: 'Title cannot be empty' });
  const r = await query(
    `UPDATE lessons SET title = COALESCE($1, title), content = COALESCE($2, content)
     WHERE id=$3 AND course_id=$4 RETURNING *`,
    [title === undefined ? null : String(title).trim(), content === undefined ? null : content, req.params.lessonId, req.params.id]
  );
  if (!r.rows[0]) return res.status(404).json({ error: 'Lesson not found' });
  res.json(r.rows[0]);
});

router.delete('/:id/lessons/:lessonId', auth, requireRole('instructor', 'admin'), async (req, res) => {
  if (!(await canManageCourse(req.user, req.params.id))) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const r = await query('DELETE FROM lessons WHERE id=$1 AND course_id=$2 RETURNING id', [req.params.lessonId, req.params.id]);
  if (!r.rows[0]) return res.status(404).json({ error: 'Lesson not found' });
  await recomputeProgress(req.params.id);
  res.json({ ok: true });
});

router.get('/:id/lessons', async (req, res) => {
  if (!(await canViewCourse(optionalUser(req), req.params.id))) return res.status(404).json({ error: 'Course not found' });
  const r = await query('SELECT * FROM lessons WHERE course_id=$1 ORDER BY "order", id', [req.params.id]);
  res.json(r.rows);
});

// The signed-in student's completed lessons for a course
router.get('/:id/progress', auth, async (req, res) => {
  const r = await query(
    `SELECT lp.lesson_id FROM lesson_progress lp JOIN lessons l ON l.id = lp.lesson_id
     WHERE l.course_id = $1 AND lp.user_id = $2`,
    [req.params.id, req.user.sub]
  );
  res.json({ completed: r.rows.map((x) => x.lesson_id) });
});

// Mark a lesson done / not done; the enrollment progress % follows automatically
router.put('/:id/lessons/:lessonId/complete', auth, async (req, res) => {
  const enr = await query('SELECT id FROM enrollments WHERE user_id=$1 AND course_id=$2', [req.user.sub, req.params.id]);
  if (!enr.rows[0]) return res.status(403).json({ error: 'Enroll in this course first' });
  const lesson = await query('SELECT id FROM lessons WHERE id=$1 AND course_id=$2', [req.params.lessonId, req.params.id]);
  if (!lesson.rows[0]) return res.status(404).json({ error: 'Lesson not found' });
  if (req.body.done === false) {
    await query('DELETE FROM lesson_progress WHERE user_id=$1 AND lesson_id=$2', [req.user.sub, req.params.lessonId]);
  } else {
    await query('INSERT INTO lesson_progress (user_id, lesson_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [req.user.sub, req.params.lessonId]);
  }
  await recomputeProgress(req.params.id, req.user.sub);
  const done = await query(
    `SELECT lp.lesson_id FROM lesson_progress lp JOIN lessons l ON l.id = lp.lesson_id
     WHERE l.course_id = $1 AND lp.user_id = $2`,
    [req.params.id, req.user.sub]
  );
  const p = await query('SELECT progress::float AS progress FROM enrollments WHERE id=$1', [enr.rows[0].id]);
  res.json({ completed: done.rows.map((x) => x.lesson_id), progress: p.rows[0].progress });
});

module.exports = router;
module.exports.recomputeProgress = recomputeProgress;
