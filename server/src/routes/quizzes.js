const express = require('express');
const router = express.Router();
const { query } = require('../db');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  const r = await query('INSERT INTO quizzes (course_id,title) VALUES ($1,$2) RETURNING *', [req.body.course_id, req.body.title]);
  res.status(201).json(r.rows[0]);
});
router.post('/:id/questions', auth, async (req, res) => {
  const { question, options, correct_index } = req.body;
  const r = await query('INSERT INTO quiz_questions (quiz_id,question,options,correct_index) VALUES ($1,$2,$3,$4) RETURNING *', [req.params.id, question, options, correct_index]);
  res.status(201).json(r.rows[0]);
});
router.get('/:id', async (req, res) => {
  const q = await query('SELECT * FROM quizzes WHERE id=$1', [req.params.id]);
  const qs = await query('SELECT id,question,options FROM quiz_questions WHERE quiz_id=$1', [req.params.id]);
  res.json({ quiz: q.rows[0], questions: qs.rows });
});
router.post('/:id/submit', auth, async (req, res) => {
  const { answers } = req.body;
  const qs = await query('SELECT * FROM quiz_questions WHERE quiz_id=$1', [req.params.id]);
  let score = 0;
  qs.rows.forEach((q, i) => { if (answers[i] === q.correct_index) score++; });
  await query('INSERT INTO quiz_attempts (quiz_id,user_id,score,total) VALUES ($1,$2,$3,$4)', [req.params.id, req.user.sub, score, qs.rows.length]);
  res.json({ score, total: qs.rows.length });
});

module.exports = router;
