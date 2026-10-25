require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./db');
const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'ok' }); }
  catch (e) { res.status(500).json({ status: 'error' }); }
});

const auth = require('./routes/auth');
const courses = require('./routes/courses');
const enrollments = require('./routes/enrollments');
app.use('/auth', auth);
app.use('/courses', courses);
app.use('/enrollments', enrollments);

const port = process.env.PORT || 4000;
if (require.main === module) app.listen(port, () => console.log('listening', port));
module.exports = app;
