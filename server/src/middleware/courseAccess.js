const { query } = require('../db');

// Instructors may manage their own courses; admins may manage everything.
async function canManageCourse(user, courseId) {
  if (!user || !/^\d+$/.test(String(courseId ?? ''))) return false;
  if (user.role === 'admin') return true;
  const r = await query('SELECT instructor_id FROM courses WHERE id=$1', [courseId]);
  const row = r.rows[0];
  return !!row && String(row.instructor_id) === String(user.sub);
}

// Students may only see published courses (plus ones they are enrolled in); owners/admins see everything.
async function canViewCourse(user, courseId) {
  if (!/^\d+$/.test(String(courseId ?? ''))) return false;
  const r = await query('SELECT is_published FROM courses WHERE id=$1', [courseId]);
  if (!r.rows[0]) return false;
  if (r.rows[0].is_published) return true;
  return canManageCourse(user, courseId);
}

// Reads an optional bearer token without rejecting anonymous requests.
function optionalUser(req) {
  const jwt = require('jsonwebtoken');
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return null;
  try { return jwt.verify(token, process.env.JWT_SECRET || 'secret'); } catch { return null; }
}

// Router param guard: non-numeric ids would otherwise make Postgres throw (500).
function numericParam(req, res, next, value) {
  if (!/^\d+$/.test(value)) return res.status(400).json({ error: 'Invalid id' });
  next();
}

module.exports = { canManageCourse, canViewCourse, optionalUser, numericParam };
