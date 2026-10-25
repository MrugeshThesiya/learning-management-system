# Changelog

Format based on [Keep a Changelog](https://keepachangelog.com). Entries are grouped by sprint increment; commit hashes point to the originating work. See [`docs/agile/sprint-plan.md`](docs/agile/sprint-plan.md).

## [Unreleased] — Sprint 6 hardening & management features
### Added
- Student quiz-taking with per-question results and best score; assignment submission and resubmission with grades shown to the student (D2, D5).
- Server-side lesson progress; enrollment progress derives from completed lessons (C3).
- `GET /courses/:id`, `GET /stats`, enrollment responses joined with course info.
- Instructor studio: edit lessons, delete lessons/questions/quizzes/assignments/courses, see correct answers (B3, B4, D1).
- Admin console: change user roles, delete users, delete courses (E3, E4).
- Landing page featured course and statistics powered by live data.
- Agile documentation set (`docs/agile/`), PR and issue templates, this changelog.
- Integration tests for authorization, drafts, enrollment, progress, quizzes, assignments, deletions and bad ids.

### Changed
- Seed is idempotent and sets demo progress from real lesson completions.
- Docker Compose maps the UI to port 5173 and seeds the database on start.
- Dev servers use polling file watchers (Vite, nodemon).
- Session re-validation is silent; only an invalid session (401) signs the user out.

### Fixed
- New routes returning 404 in the dev server because of stale module cache on file systems without change events.
- Public sign-up could create admin accounts; draft courses leaked through `/courses/all`, search and lesson lists.
- Non-numeric ids and async errors crashed the API.
- Quiz scoring depended on unordered rows; fixed to use question ids.

### Removed
- Placeholder content: invented statistics, partner logos, testimonials, hard-coded ratings, no-op newsletter form and "remember me" checkbox, unused `Home` page.

## Sprint 6 increment — Packaging, CI and polish
- `daff1c1` feat: dark mode by default with light mode toggle (A4)
- `1229018` `b411076` fix: Tailwind v4 configuration (I3)
- `76df13b` feat: Tailwind styling for a richer UI
- `d01c295` chore: lockfiles (I2) · `115ceb4` chore: `.gitignore`
- `1cc1845` fix: tmpfs for Postgres data (I1) · `ed1a316` chore: dockerize app with Postgres (F1)
- `dc28806` ci: GitHub Actions workflow (F2) · `3e0568e` fix: CI install step

## Sprint 5 increment — Search and documentation
- `eb40a2e` feat: course search endpoint (C1)
- `4601b7f` feat: frontend routing and course listing pages
- Docs: `40256f9` `75a70e5` `061a93a` `b1a16e6`

## Sprint 4 increment — Quizzes & assignments
- `3fdd801` feat: quizzes and assignments with grading (D1–D6)
- `b63694d` fix: await schema init before handling requests

## Sprint 3 increment — Enrollment & progress
- `3ed5b74` feat: courses, lessons and enrollments endpoints (B1–B3, C2)

## Sprint 2 increment — React frontend
- `7ea895f` feat: React frontend scaffold

## Sprint 1 increment — Foundations
- `04b7bc9` chore: initial project scaffolding
- `b1d8c77` feat: Express server with Postgres connection
- `182250b` feat: user registration and JWT login (A1, A2)
- `4ae092f` test: auth integration tests (F3)
