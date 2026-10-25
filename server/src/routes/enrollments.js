const express = require('express');
const router = express.Router();
const { query } = require('../db');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const r = await query(
      'INSERT INTO enrollments (user_id, course_id) VALUES ($1,$2) RETURNING *',
      [req.user.sub, req.body.course_id]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.get('/mine', auth, async (req, res) => {
  const r = await query('SELECT * FROM enrollments WHERE user_id=$1', [req.user.sub]);
  res.json(r.rows);
});

router.patch('/:id/progress', auth, async (req, res) => {
  const r = await query(
    'UPDATE enrollments SET progress=$1 WHERE id=$2 AND user_id=$3 RETURNING *',
    [req.body.progress, req.params.id, req.user.sub]
  );
  if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(r.rows[0]);
});

module.exports = router;
