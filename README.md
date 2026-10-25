# Learning Management System (LMS)

A full-stack Learning Management System built with **React** (frontend), **Node.js/Express** (backend), and **PostgreSQL** (database), fully dockerized and developed following **Agile principles**.

## Team
- 23BCP230 — Vency Thummar
- 23BCP250 — Mrugesh Thesiya
- 23BCP525D — Vaidehi Desai

## Agile Development Process
We followed Scrum-style iterations across 6 sprints (2 weeks each):
1. Sprint 1 — Project setup, authentication, base models
2. Sprint 2 — Course & lesson management
3. Sprint 3 — Enrollment & progress tracking
4. Sprint 4 — Quizzes & assignments with grading
5. Sprint 5 — Search, categories, dashboards
6. Sprint 6 — Dockerization, CI/CD, polish

Ceremonies: sprint planning, daily standups, sprint review, retrospective. Work tracked via feature branches and pull requests with conventional commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`, `ci:`).

## Features
- JWT-based registration/login with roles (student/instructor)
- Course creation, publishing, lessons
- Student enrollment and progress tracking
- Quizzes with questions and scoring
- Assignments with submissions and grading
- Course search
- React UI with routing
- Dockerized stack + GitHub Actions CI

## Run with Docker
```bash
docker compose up --build
```
Frontend: http://localhost:5173, Backend: http://localhost:4000

## Run locally
Backend:
```bash
cd server && npm install && npm start
```
Frontend:
```bash
cd client && npm install && npm run dev
```

## Tests
```bash
cd server && npm test
```

## API Endpoints
- POST /auth/register, POST /auth/login
- GET/POST /courses, GET /courses/search?q=
- POST /courses/:id/lessons, GET /courses/:id/lessons
- POST /enrollments, GET /enrollments/mine, PATCH /enrollments/:id/progress
- POST /quizzes, POST /quizzes/:id/questions, GET /quizzes/:id, POST /quizzes/:id/submit
- POST /assignments, GET /assignments/course/:id, POST /assignments/:id/submit, PATCH /assignments/submissions/:id/grade

## Architecture
```
client (React/Vite)  ->  server (Express)  ->  PostgreSQL
```
- Frontend communicates via REST JSON over HTTP.
- Backend uses `pg` pool; schema auto-initialized on startup.
- JWT stored client-side (localStorage) and sent as Bearer token.

## Tech Stack
- Frontend: React 18, React Router 6, Vite 5
- Backend: Node.js 20, Express 4, bcryptjs, jsonwebtoken, pg
- Database: PostgreSQL 16
- DevOps: Docker, Docker Compose, GitHub Actions

## Project Structure
```
.
├── client/            # React app
├── server/            # Express API
│   ├── src/
│   │   ├── index.js
│   │   ├── db.js
│   │   ├── schema.sql
│   │   ├── middleware/
│   │   └── routes/
│   └── tests/
├── docker-compose.yml
├── Dockerfile.server
├── Dockerfile.client
└── .github/workflows/ci.yml
```

## Environment Variables (server)
- DATABASE_URL (default postgres://lms:lms@localhost:5432/lms)
- JWT_SECRET (default "secret")
- PORT (default 4000)

## Contributing
Branch from `main`, use conventional commits, open PR. Run tests before pushing.

## License
MIT
