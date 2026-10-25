const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { query } = require('../db');
const requireAuth = require('../middleware/auth');

function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );
}

function publicUser(u) {
  if (!u) return null;
  return { id: u.id, email: u.email, full_name: u.full_name, role: u.role, created_at: u.created_at };
}

router.post('/register', async (req, res) => {
  const { email, full_name, name, password, role } = req.body;
  const displayName = full_name || name;
  if (!email || !password || !displayName) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const r = await query(
      'INSERT INTO users (email, full_name, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id,email,full_name,role,created_at',
      [email, displayName, hash, role || 'student']
    );
    const user = r.rows[0];
    const token = signToken(user);
    res.status(201).json({ access_token: token, token, user });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const r = await query('SELECT * FROM users WHERE email=$1', [email]);
  const u = r.rows[0];
  if (!u || !(await bcrypt.compare(password, u.password_hash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = signToken(u);
  res.json({ access_token: token, token, user: publicUser(u) });
});

// Session validation — used by the frontend on every reload / route change
router.get('/me', requireAuth, async (req, res) => {
  try {
    const r = await query(
      'SELECT id,email,full_name,role,created_at FROM users WHERE id=$1',
      [req.user.sub]
    );
    if (!r.rows[0]) return res.status(401).json({ error: 'Session user no longer exists' });
    res.json({ user: r.rows[0] });
  } catch (e) { res.status(500).json({ error: 'Failed to load session' }); }
});

router.post('/logout', (_req, res) => {
  // Stateless JWT: logout is handled client-side by discarding the token.
  res.json({ ok: true });
});

module.exports = router;
