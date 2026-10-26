# Learning Management System (LMS)

A full-stack Learning Management System built with **React** (frontend), **Node.js/Express** (backend), and **PostgreSQL** (database), fully dockerized and developed following **Agile principles**.

## Team
| Roll no. | Name | GitHub |
| --- | --- | --- |
| 23BCP230 | Vency Thummar | [@Vency-1238](https://github.com/Vency-1238) |
| 23BCP250 | Mrugesh Thesiya | [@MrugeshThesiya](https://github.com/MrugeshThesiya) |
| 23BCP525D | Vaidehi Desai | [@VAIDEHIIIII](https://github.com/VAIDEHIIIII) |

## Agile Development Process
We work in **2-week Scrum sprints** with a prioritised product backlog, a Definition of Done, feature branches and pull requests, and CI on every push. Six sprints took the product from foundations to a packaged, tested release:

1. Sprint 1 — Project setup, authentication, base models
2. Sprint 2 — Course & lesson management
3. Sprint 3 — Enrollment & progress tracking
4. Sprint 4 — Quizzes & assignments with grading
5. Sprint 5 — Search, dashboards
6. Sprint 6 — Dockerization, CI/CD, hardening, polish

Ceremonies: sprint planning, daily stand-up, backlog refinement, sprint review (demo) and retrospective. Work is tracked as user stories with acceptance criteria; branches follow `feature/<id>-<slug>` and commits use Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`, `ci:`).

| Document | Purpose |
| --- | --- |
| [AGILE.md](AGILE.md) | Process overview, roles, cadence, tooling |
| [Product vision](docs/agile/product-vision.md) | Goals, personas, success measures |
| [Product backlog](docs/agile/product-backlog.md) | Epics, user stories, acceptance criteria, status |
| [Sprint plan](docs/agile/sprint-plan.md) | Sprint goals, increments, audit findings and retrospective |
| [Definition of Done](docs/agile/definition-of-done.md) | Ready/Done checklists and working agreements |
| [Workflow](docs/agile/workflow.md) | Branching, review and release flow |
| [Risks & impediments](docs/agile/risks-and-impediments.md) | Risk register and resolved blockers |
| [Ceremony templates](docs/agile/templates/) | Planning, stand-up, review, retrospective |
| [CHANGELOG](CHANGELOG.md) | Release history by sprint |

## Features
- JWT-based registration/login with roles (student/instructor/admin), persistent sessions re-validated on reload
- Role-based workspaces: student dashboard (enrollments, progress), instructor studio (create courses/lessons/quizzes, grade submissions), admin console (users, all courses, publish control)
- Course creation, publishing (drafts are private to the owner/admin), lessons
- Student enrollment; progress is computed from completed lessons and stored server-side
- Quizzes: instructors author questions, students take them and see per-question results
- Assignments: students submit/resubmit work, instructors grade it (0–100)
- Course search
- Admin console: change roles, delete users and courses; instructors can edit lessons and delete lessons, quizzes, assignments and whole courses
- Dark mode by default with light-mode toggle
- React UI with routing
- Dockerized stack + GitHub Actions CI

## Run with Docker
Prerequisites: Docker + Docker Compose.

```bash
docker compose up --build
```
Frontend: http://localhost:5173, Backend: http://localhost:4000 (health: `GET /health`), DB: localhost:5433.

How the stack starts:
- `db` (Postgres 16) has a `pg_isready` healthcheck; `server` waits for `db` to be healthy.
- `server` runs `node src/wait-for-db.js && node src/seed.js && npm start`: it waits for Postgres (up to ~120s), ensures `schema.sql` tables exist, then idempotently seeds demo data on every start.
- `server`/`client` use `restart: unless-stopped`.

Useful commands:
```bash
docker compose up -d        # start in background
docker compose ps           # container status
docker compose logs -f server  # follow API logs
docker compose down         # stop and remove containers/network
```

The compose database is ephemeral (`tmpfs`); data resets on `down` and the server container re-seeds demo data on every start.

## Run locally
Backend (needs Postgres — easiest: `docker compose up -d db` from the repo root):
```bash
cd server && npm install && npm run dev
```
`server/.env` is preconfigured for the compose DB (`postgres://lms:lms@localhost:5433/lms`).
Frontend:
```bash
cd client && npm install && npm run dev
```
> File watching uses polling (`vite.config.js`, `nodemon --legacy-watch`) so edits are picked up on FUSE/NTFS/network drives, where inotify events never fire. Without it the dev server keeps serving stale code (e.g. new routes 404).

## Demo data & test credentials
Seed demo users, courses, lessons, a quiz, an assignment, and enrollments (automatic in `docker compose up`; run manually for local dev):
```bash
cd server && npm run seed
```
The seed is idempotent — safe to re-run. All three app roles are covered:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@learnova.app` | `admin123` |
| Instructor | `instructor@learnova.app` (Ian Instructor), `priya@learnova.app` (Priya Mehta) | `instructor123` |
| Student | `demo@learnova.app` (Demo Learner), `rahul@learnova.app`, `sofia@learnova.app`, `liam@learnova.app` | `password123` |

> Local-dev only. Never use these in production.
> The seed creates 10 published courses, 7 users and 9 enrollments with lesson progress, so every dashboard shows data immediately.

## Tests

Both halves of the app are tested, and CI runs both on every push and pull request.

- **Server** — Jest + supertest integration tests against a real Postgres (`cd server && npm test`).
- **Client** — Vitest + React Testing Library (`cd client && npm test`): API layer, course card, route guards and the login form. `npm run build` is also part of CI.
- **E2E** — Selenium + pytest browser tests (`pip install -r e2e/requirements.txt && python -m pytest e2e -v`): landing, login/register validation, logout, catalog search, enrollment and detail navigation against the running stack. See [e2e/README.md](e2e/README.md). Dockerized via `docker compose --profile e2e up` (selenium grid + runner).

Server tests, by OS. Linux:
```bash
cd server && npm test
```

macOS:
```bash
cd server && npm test
```

Windows (PowerShell):
```powershell
cd server; npm test
```


## API Endpoints
- POST /auth/register, POST /auth/login, GET /auth/me
- GET/POST /courses, GET /courses/search?q=, GET /courses/all, GET /courses/teaching (instructor/admin), PATCH /courses/:id (owner/admin)
- POST /courses/:id/lessons (owner/admin), GET /courses/:id/lessons
- POST /enrollments, GET /enrollments/mine, PATCH /enrollments/:id/progress
- POST /quizzes, GET /quizzes/course/:courseId, POST /quizzes/:id/questions, GET /quizzes/:id/attempts (owner/admin), GET /quizzes/:id, POST /quizzes/:id/submit
- POST /assignments, GET /assignments/course/:id, GET /assignments/:id/submissions (owner/admin), POST /assignments/:id/submit, PATCH /assignments/submissions/:id/grade (owner/admin)
- GET /admin/overview, GET /admin/users (admin only)

## Architecture
```
client (React/Vite)  ->  server (Express)  ->  PostgreSQL
```
- Frontend communicates via REST JSON over HTTP. It uses `VITE_API_URL` (compose sets `http://localhost:4000`) and falls back to `http://localhost:4000`.
- Backend uses `pg` pool; schema auto-initialized on startup (`index.js`), and `seed.js` also applies `schema.sql` so a fresh ephemeral DB works.
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
│   │   ├── seed.js
│   │   ├── wait-for-db.js
│   │   ├── middleware/
│   │   └── routes/
│   └── tests/
├── docker-compose.yml
├── Dockerfile.server
├── Dockerfile.client
└── .github/workflows/ci.yml
```

## Environment Variables
Server (`server/.env`, see `.env.example`):
- DATABASE_URL — inside compose: `postgres://lms:lms@db:5432/lms`; local dev via `docker compose up -d db`: `postgres://lms:lms@localhost:5433/lms` (default `postgres://lms:lms@localhost:5432/lms`)
- JWT_SECRET (default "secret")
- PORT (default 4000)

Client:
- VITE_API_URL (default `http://localhost:4000`; compose sets it explicitly)
