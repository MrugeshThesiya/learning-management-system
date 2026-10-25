require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./db');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
const schema = fs.readFileSync(path.join(__dirname,'schema.sql'),'utf8');
pool.query(schema).catch(e=>console.error(e));

app.get('/health', async (req, res) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'ok' }); }
  catch (e) { res.status(500).json({ status: 'error' }); }
});

const auth = require('./routes/auth');
const courses = require('./routes/courses');
const enrollments = require('./routes/enrollments');
const quizzes = require('./routes/quizzes');
const assignments = require('./routes/assignments');
app.use('/auth', auth);
app.use('/courses', courses);
app.use('/enrollments', enrollments);
app.use('/quizzes', quizzes);
app.use('/assignments', assignments);

const port = process.env.PORT || 4000;
if (require.main === module) app.listen(port, () => console.log('listening', port));
module.exports = app;
