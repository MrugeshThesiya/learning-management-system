const { Pool } = require('pg');

// README default — used when DATABASE_URL is not set (e.g. plain `npm run dev`).
const connectionString =
  process.env.DATABASE_URL || 'postgres://lms:lms@localhost:5432/lms';

const pool = new Pool({ connectionString });

// Idle-client errors otherwise throw and crash the process when the DB is down.
pool.on('error', (err) => {
  console.error('Unexpected pg pool error (is Postgres running?):', err.message);
});

module.exports = { pool, query: (t, p) => pool.query(t, p) };
