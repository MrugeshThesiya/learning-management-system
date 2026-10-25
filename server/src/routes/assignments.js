const express = require('express');
const router = express.Router();
const { query } = require('../db');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  const { course_id, title, description, due_date } = req.body;
  const r = await query('INSERT INTO assignments (course_id,title,description,due_date) VALUES ($1,$2,$3,$4) RETURNING *', [course_id, title, description, due_date]);
  res.status(201).json(r.rows[0]);
});
router.get('/course/:id', async (req, res) => {
  const r = await query('SELECT * FROM assignments WHERE course_id=$1', [req.params.id]);
  res.json(r.rows);
});
router.post('/:id/submit', auth, async (req, res) => {
  const r = await query('INSERT INTO submissions (assignment_id,user_id,content) VALUES ($1,$2,$3) RETURNING *', [req.params.id, req.user.sub, req.body.content]);
  res.status(201).json(r.rows[0]);
});
router.patch('/submissions/:id/grade', auth, async (req, res) => {
  const r = await query('UPDATE submissions SET grade=$1 WHERE id=$2 RETURNING *', [req.body.grade, req.params.id]);
  res.json(r.rows[0]);
});

module.exports = router;
