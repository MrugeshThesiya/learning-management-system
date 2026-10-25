const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { query } = require('../db');

router.post('/register', async (req, res) => {
  const { email, full_name, password, role } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const r = await query(
      'INSERT INTO users (email, full_name, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id,email,full_name,role',
      [email, full_name, hash, role || 'student']
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const r = await query('SELECT * FROM users WHERE email=$1', [email]);
  const u = r.rows[0];
  if (!u || !(await bcrypt.compare(password, u.password_hash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ sub: u.id, role: u.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  res.json({ access_token: token });
});

module.exports = router;
