require('dotenv').config();
const { pool } = require('./db');

const MAX_RETRIES = 60;
const DELAY_MS = 2000;

async function wait() {
  for (let i = 1; i <= MAX_RETRIES; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('database ready');
      await pool.end().catch(() => {});
      process.exit(0);
    } catch (e) {
      console.log(`waiting for database... (${i}/${MAX_RETRIES}): ${e.message}`);
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }
  console.error('database never became ready');
  await pool.end().catch(() => {});
  process.exit(1);
}

wait();
