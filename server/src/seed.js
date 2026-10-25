require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./db');

// Demo accounts (passwords are for local development only)
const USERS = [
  { email: 'admin@learnova.app', full_name: 'Ava Admin', password: 'admin123', role: 'admin' },
  { email: 'instructor@learnova.app', full_name: 'Ian Instructor', password: 'instructor123', role: 'instructor' },
  { email: 'demo@learnova.app', full_name: 'Demo Learner', password: 'password123', role: 'student' },
];

const COURSES = [
  {
    title: 'Full-Stack Web Development',
    description: 'From HTML to deployment — build and ship production apps with React, Node.js and PostgreSQL.',
    lessons: [
      ['Getting set up', 'Install Node, VS Code and Git. Verify everything with your first hello-world server.'],
      ['HTML & CSS fundamentals', 'Semantic markup, flexbox, grid and responsive layouts.'],
      ['JavaScript deep dive', 'Closures, async/await, modules and fetching APIs.'],
      ['React essentials', 'Components, hooks, routing and state management.'],
      ['APIs with Express', 'REST design, middleware, validation and JWT auth.'],
      ['Deploy like a pro', 'Docker, environment variables and shipping to production.'],
    ],
    quiz: {
      title: 'React basics check',
      questions: [
        ['Which hook runs after render?', ['useState', 'useEffect', 'useRef', 'useMemo'], 1],
        ['How do you pass data to a child?', ['state', 'props', 'context only', 'refs'], 1],
        ['What does JSX compile to?', ['HTML strings', 'React.createElement calls', 'CSS', 'SQL'], 1],
      ],
    },
    assignment: ['Build a course catalog page', 'Fetch /courses from the API and render a searchable grid with enroll buttons.', 7],
  },
  {
    title: 'Data Science Foundations',
    description: 'Statistics, Python and visualization with real datasets — no PhD required.',
    lessons: [
      ['Python refresher', 'Lists, dicts, comprehensions and virtual environments.'],
      ['NumPy & Pandas', 'Series, DataFrames, grouping and merging.'],
      ['Visualization', 'Tell the story with charts that people understand.'],
      ['Intro statistics', 'Distributions, hypothesis tests and confidence intervals.'],
    ],
  },
  {
    title: 'UI Design Systems',
    description: 'Typography, color and components that scale from side project to product.',
    lessons: [
      ['Design tokens', 'Color, spacing and type scales that keep UIs consistent.'],
      ['Component anatomy', 'Buttons, inputs and cards that handle every state.'],
      ['Figma to code', 'Hand off specs developers will actually thank you for.'],
      ['Final project', 'Ship a mini design system with documentation.'],
    ],
  },
  {
    title: 'Python Programming Basics',
    description: 'Start from zero: syntax, data structures and your first automation scripts.',
    lessons: [
      ['Hello, Python', 'Install, REPL and your first script.'],
      ['Control flow', 'Ifs, loops and functions.'],
      ['Files & modules', 'Read, write and organize real programs.'],
    ],
  },
  {
    title: 'Machine Learning Essentials',
    description: 'Regression to neural nets — train, evaluate and avoid the classic pitfalls.',
    lessons: [
      ['Framing ML problems', 'Supervised vs unsupervised, features and labels.'],
      ['Regression & classification', 'Your first scikit-learn models.'],
      ['Evaluation done right', 'Train/test splits, cross-validation and metrics.'],
      ['Neural nets intro', 'What deep learning is (and is not) good for.'],
    ],
  },
  {
    title: 'Cloud & DevOps Fundamentals',
    description: 'Docker, CI/CD and Postgres — run software like a professional team.',
    lessons: [
      ['Linux & the terminal', 'The 20 commands that cover 90% of the job.'],
      ['Docker basics', 'Images, containers and Compose for local dev.'],
      ['CI with GitHub Actions', 'Test and build on every push.'],
    ],
  },
];

async function upsertUser(u) {
  const hash = await bcrypt.hash(u.password, 10);
  const r = await pool.query(
    `INSERT INTO users (email, full_name, password_hash, role)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (email) DO UPDATE SET full_name=EXCLUDED.full_name, password_hash=EXCLUDED.password_hash, role=EXCLUDED.role
     RETURNING id,email,full_name,role`,
    [u.email, u.full_name, hash, u.role]
  );
  return r.rows[0];
}

async function seed() {
  const ids = {};
  for (const u of USERS) {
    ids[u.email] = (await upsertUser(u)).id;
    console.log(`user: ${u.email} (${u.role})`);
  }
  const instructorId = ids['instructor@learnova.app'];
  const studentId = ids['demo@learnova.app'];

  for (const c of COURSES) {
    // No unique constraint on title, so look first to keep the seed idempotent
    const existing = await pool.query('SELECT id FROM courses WHERE title=$1 ORDER BY id LIMIT 1', [c.title]);
    const courseId = existing.rows[0]
      ? existing.rows[0].id
      : (await pool.query(
          `INSERT INTO courses (title, description, instructor_id, is_published)
           VALUES ($1,$2,$3,TRUE) RETURNING id`,
          [c.title, c.description, instructorId]
        )).rows[0].id;
    console.log(`course: ${c.title}`);

    for (let i = 0; i < c.lessons.length; i++) {
      const [title, content] = c.lessons[i];
      await pool.query(
        `INSERT INTO lessons (course_id, title, content, "order")
         SELECT $1,$2,$3,$4 WHERE NOT EXISTS
         (SELECT 1 FROM lessons WHERE course_id=$1 AND title=$2)`,
        [courseId, title, content, i + 1]
      );
    }

    if (c.quiz) {
      const qr = await pool.query(
        `INSERT INTO quizzes (course_id, title)
         SELECT $1,$2 WHERE NOT EXISTS
         (SELECT 1 FROM quizzes WHERE course_id=$1 AND title=$2) RETURNING id`,
        [courseId, c.quiz.title]
      );
      const quizId = qr.rows[0]?.id
        ?? (await pool.query('SELECT id FROM quizzes WHERE course_id=$1 AND title=$2', [courseId, c.quiz.title])).rows[0].id;
      for (const [question, options, correct_index] of c.quiz.questions) {
        await pool.query(
          `INSERT INTO quiz_questions (quiz_id, question, options, correct_index)
           SELECT $1,$2,$3,$4 WHERE NOT EXISTS
           (SELECT 1 FROM quiz_questions WHERE quiz_id=$1 AND question=$2)`,
          [quizId, question, options, correct_index]
        );
      }
    }

    if (c.assignment) {
      const [title, description, dueInDays] = c.assignment;
      await pool.query(
        `INSERT INTO assignments (course_id, title, description, due_date)
         SELECT $1,$2,$3,NOW() + ($4 || ' days')::interval WHERE NOT EXISTS
         (SELECT 1 FROM assignments WHERE course_id=$1 AND title=$2)`,
        [courseId, title, description, dueInDays]
      );
    }
  }

  // Give the demo student something on the dashboard: enrollments with real lesson progress
  const firstTwo = await pool.query('SELECT id FROM courses WHERE is_published=TRUE ORDER BY id LIMIT 2');
  const completedCounts = [4, 2];
  for (let i = 0; i < firstTwo.rows.length; i++) {
    const courseId = firstTwo.rows[i].id;
    await pool.query(
      `INSERT INTO enrollments (user_id, course_id) VALUES ($1,$2) ON CONFLICT (user_id, course_id) DO NOTHING`,
      [studentId, courseId]
    );
    await pool.query(
      `INSERT INTO lesson_progress (user_id, lesson_id)
       SELECT $1, id FROM lessons WHERE course_id=$2 ORDER BY "order", id LIMIT $3
       ON CONFLICT DO NOTHING`,
      [studentId, courseId, completedCounts[i] ?? 0]
    );
    await pool.query(
      `UPDATE enrollments e SET progress = COALESCE((
         SELECT ROUND(100.0 * COUNT(*) / NULLIF((SELECT COUNT(*) FROM lessons WHERE course_id=e.course_id), 0))
         FROM lesson_progress lp JOIN lessons l ON l.id = lp.lesson_id
         WHERE l.course_id = e.course_id AND lp.user_id = e.user_id), 0)
       WHERE e.user_id=$1 AND e.course_id=$2`,
      [studentId, courseId]
    );
  }

  console.log('seed complete');
  await pool.end();
}

seed().catch(async (e) => {
  console.error('seed failed:', e.message);
  await pool.end().catch(() => {});
  process.exit(1);
});
