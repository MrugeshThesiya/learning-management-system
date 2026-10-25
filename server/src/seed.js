require('dotenv').config();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

// Demo accounts (passwords are for local development only)
const USERS = [
  { email: 'admin@learnova.app', full_name: 'Ava Admin', password: 'admin123', role: 'admin' },
  { email: 'instructor@learnova.app', full_name: 'Ian Instructor', password: 'instructor123', role: 'instructor' },
  { email: 'priya@learnova.app', full_name: 'Priya Mehta', password: 'instructor123', role: 'instructor' },
  { email: 'demo@learnova.app', full_name: 'Demo Learner', password: 'password123', role: 'student' },
  { email: 'rahul@learnova.app', full_name: 'Rahul Verma', password: 'password123', role: 'student' },
  { email: 'sofia@learnova.app', full_name: 'Sofia Alvarez', password: 'password123', role: 'student' },
  { email: 'liam@learnova.app', full_name: 'Liam Chen', password: 'password123', role: 'student' },
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
  {
    title: 'SQL & Database Design',
    description: 'Model data properly, write confident queries and keep PostgreSQL fast as it grows.',
    lessons: [
      ['Relational thinking', 'Tables, keys and relationships, and how to model a real domain.'],
      ['Querying with SQL', 'SELECT, JOIN, GROUP BY and subqueries on realistic data.'],
      ['Normalization', 'Remove duplication without making queries painful.'],
      ['Indexes & performance', 'Read query plans and add indexes that actually help.'],
    ],
    quiz: {
      title: 'SQL fundamentals check',
      questions: [
        ['Which clause filters grouped rows?', ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'], 1],
        ['What does a PRIMARY KEY guarantee?', ['Fast sorting', 'Unique, non-null rows', 'Encryption', 'Foreign keys'], 1],
        ['Which join keeps unmatched rows from the left table?', ['INNER', 'LEFT', 'CROSS', 'SELF'], 1],
      ],
    },
    assignment: ['Design a bookstore schema', 'Model authors, books and orders, then write five queries that answer real questions.', 10],
  },
  {
    instructor: 'priya@learnova.app',
    title: 'Cybersecurity Essentials',
    description: 'Threats, defences and secure habits every developer and team should have.',
    lessons: [
      ['The threat landscape', 'Who attacks, why, and the most common entry points.'],
      ['Authentication done right', 'Password hashing, MFA and session handling.'],
      ['Web app security', 'XSS, CSRF, injection and how to prevent them.'],
      ['Incident response', 'Detect, contain, recover and write the post-mortem.'],
    ],
    quiz: {
      title: 'Security basics check',
      questions: [
        ['Which is the safest way to store passwords?', ['Plain text', 'Reversible encryption', 'Salted hash', 'Base64'], 2],
        ['What does parameterised SQL prevent?', ['XSS', 'SQL injection', 'CSRF', 'DDoS'], 1],
      ],
    },
  },
  {
    instructor: 'priya@learnova.app',
    title: 'Product Management Basics',
    description: 'Discover problems worth solving, prioritise ruthlessly and ship with your team.',
    lessons: [
      ['What a product manager does', 'Roles, responsibilities and how PMs work with engineering and design.'],
      ['User research', 'Interviews, surveys and turning feedback into insight.'],
      ['Prioritisation', 'Impact vs effort, roadmaps and saying no.'],
      ['Agile delivery', 'Backlogs, sprints and measuring what you ship.'],
    ],
    assignment: ['Write a one-page product brief', 'Define the problem, users, success metrics and a first release scope for a product idea.', 14],
  },
  {
    instructor: 'priya@learnova.app',
    title: 'Technical Writing for Developers',
    description: 'Clear READMEs, API docs and design notes that people actually read.',
    lessons: [
      ['Know your reader', 'Audience, purpose and the shape of good documentation.'],
      ['READMEs that work', 'Structure a project overview, quick start and troubleshooting.'],
      ['Documenting APIs', 'Endpoints, examples and error responses.'],
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
  // Ensure tables exist (compose DB is ephemeral via tmpfs, so this runs on fresh PG)
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);

  const ids = {};
  for (const u of USERS) {
    ids[u.email] = (await upsertUser(u)).id;
    console.log(`user: ${u.email} (${u.role})`);
  }

  for (const c of COURSES) {
    // No unique constraint on title, so look first to keep the seed idempotent
    const instructorId = ids[c.instructor || 'instructor@learnova.app'];
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

  // Realistic activity: enrollments with real lesson progress (completed lesson counts)
  const ENROLLMENTS = [
    ['demo@learnova.app', 'Full-Stack Web Development', 4],
    ['demo@learnova.app', 'Data Science Foundations', 2],
    ['rahul@learnova.app', 'Full-Stack Web Development', 6],
    ['rahul@learnova.app', 'SQL & Database Design', 2],
    ['sofia@learnova.app', 'Cybersecurity Essentials', 3],
    ['sofia@learnova.app', 'Product Management Basics', 1],
    ['sofia@learnova.app', 'UI Design Systems', 4],
    ['liam@learnova.app', 'Python Programming Basics', 3],
    ['liam@learnova.app', 'Machine Learning Essentials', 1],
  ];
  for (const [email, title, completed] of ENROLLMENTS) {
    const userId = ids[email];
    const course = await pool.query('SELECT id FROM courses WHERE title=$1 ORDER BY id LIMIT 1', [title]);
    const courseId = course.rows[0].id;
    await pool.query(
      `INSERT INTO enrollments (user_id, course_id) VALUES ($1,$2) ON CONFLICT (user_id, course_id) DO NOTHING`,
      [userId, courseId]
    );
    await pool.query(
      `INSERT INTO lesson_progress (user_id, lesson_id)
       SELECT $1, id FROM lessons WHERE course_id=$2 ORDER BY "order", id LIMIT $3
       ON CONFLICT DO NOTHING`,
      [userId, courseId, completed]
    );
    await pool.query(
      `UPDATE enrollments e SET progress = COALESCE((
         SELECT ROUND(100.0 * COUNT(*) / NULLIF((SELECT COUNT(*) FROM lessons WHERE course_id=e.course_id), 0))
         FROM lesson_progress lp JOIN lessons l ON l.id = lp.lesson_id
         WHERE l.course_id = e.course_id AND lp.user_id = e.user_id), 0)
       WHERE e.user_id=$1 AND e.course_id=$2`,
      [userId, courseId]
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
