const express = require('express');
const router = express.Router();
const { query } = require('../db');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  const { title, description, is_published } = req.body;
  const r = await query(
    'INSERT INTO courses (title, description, instructor_id, is_published) VALUES ($1,$2,$3,$4) RETURNING *',
    [title, description, req.user.sub, !!is_published]
  );
  res.status(201).json(r.rows[0]);
});

router.get('/', async (req, res) => {
  const r = await query('SELECT * FROM courses WHERE is_published=TRUE');
  res.json(r.rows);
});

router.get('/all', async (req, res) => {
  const r = await query('SELECT * FROM courses');
  res.json(r.rows);
});

router.post('/:id/lessons', auth, async (req, res) => {
  const { title, content, order } = req.body;
  const r = await query(
    'INSERT INTO lessons (course_id, title, content, "order") VALUES ($1,$2,$3,$4) RETURNING *',
    [req.params.id, title, content, order || 0]
  );
  res.status(201).json(r.rows[0]);
});

router.get('/:id/lessons', async (req, res) => {
  const r = await query('SELECT * FROM lessons WHERE course_id=$1 ORDER BY "order"', [req.params.id]);
  res.json(r.rows);
});

module.exports = router;
