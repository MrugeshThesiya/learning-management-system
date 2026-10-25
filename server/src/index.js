require('dotenv').config();
require('express-async-errors'); // forward rejected async handlers to the error middleware
const express = require('express');
const cors = require('cors');
const { pool } = require('./db');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
const schema = fs.readFileSync(path.join(__dirname,'schema.sql'),'utf8');
const initPromise = pool
  .query(schema)
  .catch((e) => console.error('DB init failed — is Postgres running? Set DATABASE_URL. Details:', e.message));
app.use(async (req,res,next)=>{ await initPromise; next(); });

app.get('/health', async (req, res) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'ok' }); }
  catch (e) { res.status(500).json({ status: 'error' }); }
});

const auth = require('./routes/auth');
const courses = require('./routes/courses');
const enrollments = require('./routes/enrollments');
const quizzes = require('./routes/quizzes');
const assignments = require('./routes/assignments');
const admin = require('./routes/admin');
const stats = require('./routes/stats');
app.use('/auth', auth);
app.use('/courses', courses);
app.use('/enrollments', enrollments);
app.use('/quizzes', quizzes);
app.use('/assignments', assignments);
app.use('/admin', admin);
app.use('/stats', stats);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
  console.error(`${req.method} ${req.originalUrl} failed:`, err.message);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

const port = process.env.PORT || 4000;
if (require.main === module) app.listen(port, () => console.log('listening', port));
module.exports = app;
