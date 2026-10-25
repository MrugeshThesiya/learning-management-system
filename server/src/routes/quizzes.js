const express = require('express');
const router = express.Router();
const { query } = require('../db');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');
const { canManageCourse, canViewCourse, numericParam } = require('../middleware/courseAccess');

router.param('id', numericParam);
router.param('courseId', numericParam);
router.param('questionId', numericParam);

// Loads a quiz and enforces who may see it; sends the error response itself and returns null on failure.
async function loadQuiz(req, res, { manage = false } = {}) {
  const q = await query('SELECT * FROM quizzes WHERE id=$1', [req.params.id]);
  const quiz = q.rows[0];
  if (!quiz) { res.status(404).json({ error: 'Quiz not found' }); return null; }
  const allowed = manage
    ? await canManageCourse(req.user, quiz.course_id)
    : await canViewCourse(req.user, quiz.course_id);
  if (!allowed) { res.status(manage ? 403 : 404).json({ error: manage ? 'Forbidden' : 'Quiz not found' }); return null; }
  return quiz;
}

router.post('/', auth, requireRole('instructor', 'admin'), async (req, res) => {
  if (!(await canManageCourse(req.user, req.body.course_id))) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (!req.body.title || !String(req.body.title).trim()) return res.status(400).json({ error: 'Title is required' });
  const r = await query('INSERT INTO quizzes (course_id,title) VALUES ($1,$2) RETURNING *', [req.body.course_id, String(req.body.title).trim()]);
  res.status(201).json(r.rows[0]);
});

// Quizzes for a course with question counts and the caller's best score
router.get('/course/:courseId', auth, async (req, res) => {
  if (!(await canViewCourse(req.user, req.params.courseId))) return res.status(404).json({ error: 'Course not found' });
  const r = await query(
    `SELECT q.*, (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id)::int AS questions,
            (SELECT row_to_json(b) FROM (
               SELECT score, total FROM quiz_attempts a WHERE a.quiz_id = q.id AND a.user_id = $2
               ORDER BY score::float / NULLIF(total, 0) DESC NULLS LAST, attempted_at DESC LIMIT 1) b) AS best
     FROM quizzes q WHERE q.course_id = $1 ORDER BY q.id`,
    [req.params.courseId, req.user.sub]
  );
  res.json(r.rows);
});

// Student view: questions WITHOUT the answers
router.get('/:id', auth, async (req, res) => {
  const quiz = await loadQuiz(req, res);
  if (!quiz) return;
  const qs = await query('SELECT id,question,options FROM quiz_questions WHERE quiz_id=$1 ORDER BY id', [req.params.id]);
  res.json({ quiz, questions: qs.rows });
});

// Instructor view: includes the correct answer
router.get('/:id/questions', auth, requireRole('instructor', 'admin'), async (req, res) => {
  const quiz = await loadQuiz(req, res, { manage: true });
  if (!quiz) return;
  const qs = await query('SELECT * FROM quiz_questions WHERE quiz_id=$1 ORDER BY id', [req.params.id]);
  res.json(qs.rows);
});

router.post('/:id/questions', auth, requireRole('instructor', 'admin'), async (req, res) => {
  const quiz = await loadQuiz(req, res, { manage: true });
  if (!quiz) return;
  const { question, options, correct_index } = req.body;
  if (!question || !Array.isArray(options) || correct_index === undefined) {
    return res.status(400).json({ error: 'question, options[] and correct_index are required' });
  }
  const idx = Number(correct_index);
  if (options.length < 2 || !Number.isInteger(idx) || idx < 0 || idx >= options.length) {
    return res.status(400).json({ error: 'Provide at least 2 options and a valid correct_index' });
  }
  const r = await query('INSERT INTO quiz_questions (quiz_id,question,options,correct_index) VALUES ($1,$2,$3,$4) RETURNING *', [req.params.id, question, options, idx]);
  res.status(201).json(r.rows[0]);
});

router.delete('/:id', auth, requireRole('instructor', 'admin'), async (req, res) => {
  const quiz = await loadQuiz(req, res, { manage: true });
  if (!quiz) return;
  await query('DELETE FROM quiz_attempts WHERE quiz_id=$1', [req.params.id]);
  await query('DELETE FROM quiz_questions WHERE quiz_id=$1', [req.params.id]);
  await query('DELETE FROM quizzes WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

router.delete('/:id/questions/:questionId', auth, requireRole('instructor', 'admin'), async (req, res) => {
  const quiz = await loadQuiz(req, res, { manage: true });
  if (!quiz) return;
  const r = await query('DELETE FROM quiz_questions WHERE id=$1 AND quiz_id=$2 RETURNING id', [req.params.questionId, req.params.id]);
  if (!r.rows[0]) return res.status(404).json({ error: 'Question not found' });
  res.json({ ok: true });
});

// All attempts on a quiz — visible to the course owner / admin
router.get('/:id/attempts', auth, async (req, res) => {
  const quiz = await loadQuiz(req, res, { manage: true });
  if (!quiz) return;
  const r = await query(
    `SELECT a.*, u.full_name, u.email FROM quiz_attempts a
     JOIN users u ON u.id = a.user_id
     WHERE a.quiz_id=$1 ORDER BY a.attempted_at DESC`,
    [req.params.id]
  );
  res.json(r.rows);
});

// The caller's own attempts
router.get('/:id/my-attempts', auth, async (req, res) => {
  const quiz = await loadQuiz(req, res);
  if (!quiz) return;
  const r = await query('SELECT * FROM quiz_attempts WHERE quiz_id=$1 AND user_id=$2 ORDER BY attempted_at DESC', [req.params.id, req.user.sub]);
  res.json(r.rows);
});

// answers: { [questionId]: chosenIndex }  (an array aligned with question order is also accepted)
router.post('/:id/submit', auth, async (req, res) => {
  const quiz = await loadQuiz(req, res);
  if (!quiz) return;
  const { answers } = req.body;
  if (!(await canManageCourse(req.user, quiz.course_id))) {
    const enrolled = await query('SELECT 1 FROM enrollments WHERE user_id=$1 AND course_id=$2', [req.user.sub, quiz.course_id]);
    if (!enrolled.rows[0]) return res.status(403).json({ error: 'Enroll in this course to take its quizzes' });
  }
  if (!answers || typeof answers !== 'object') return res.status(400).json({ error: 'answers are required' });
  const qs = await query('SELECT * FROM quiz_questions WHERE quiz_id=$1 ORDER BY id', [req.params.id]);
  if (!qs.rows.length) return res.status(400).json({ error: 'This quiz has no questions yet' });
  const pick = (q, i) => (Array.isArray(answers) ? answers[i] : answers[q.id]);
  let score = 0;
  const results = qs.rows.map((q, i) => {
    const chosen = pick(q, i);
    const correct = chosen !== undefined && chosen !== null && Number(chosen) === q.correct_index;
    if (correct) score++;
    return { id: q.id, chosen: chosen ?? null, correct, correct_index: q.correct_index };
  });
  await query('INSERT INTO quiz_attempts (quiz_id,user_id,score,total) VALUES ($1,$2,$3,$4)', [req.params.id, req.user.sub, score, qs.rows.length]);
  res.json({ score, total: qs.rows.length, results });
});

module.exports = router;
