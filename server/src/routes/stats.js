const express = require('express');
const router = express.Router();
const { query } = require('../db');

// Public, real platform numbers for the marketing pages
router.get('/', async (req, res) => {
  const r = await query(
    `SELECT (SELECT COUNT(*) FROM users)::int AS learners,
            (SELECT COUNT(*) FROM courses WHERE is_published)::int AS courses,
            (SELECT COUNT(*) FROM lessons l JOIN courses c ON c.id = l.course_id WHERE c.is_published)::int AS lessons,
            (SELECT COUNT(*) FROM enrollments)::int AS enrollments`
  );
  res.json(r.rows[0]);
});

module.exports = router;
