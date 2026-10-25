const { pool } = require('../db');

// Tables reference each other without ON DELETE CASCADE, so children are removed explicitly (in one transaction).
async function deleteCourseData(courseId, client) {
  const run = async (c) => {
    await c.query('DELETE FROM quiz_attempts WHERE quiz_id IN (SELECT id FROM quizzes WHERE course_id=$1)', [courseId]);
    await c.query('DELETE FROM quiz_questions WHERE quiz_id IN (SELECT id FROM quizzes WHERE course_id=$1)', [courseId]);
    await c.query('DELETE FROM quizzes WHERE course_id=$1', [courseId]);
    await c.query('DELETE FROM submissions WHERE assignment_id IN (SELECT id FROM assignments WHERE course_id=$1)', [courseId]);
    await c.query('DELETE FROM assignments WHERE course_id=$1', [courseId]);
    await c.query('DELETE FROM lessons WHERE course_id=$1', [courseId]); // lesson_progress cascades
    await c.query('DELETE FROM enrollments WHERE course_id=$1', [courseId]);
    await c.query('DELETE FROM courses WHERE id=$1', [courseId]);
  };
  if (client) return run(client);
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    await run(c);
    await c.query('COMMIT');
  } catch (e) {
    await c.query('ROLLBACK');
    throw e;
  } finally { c.release(); }
}

module.exports = { deleteCourseData };
