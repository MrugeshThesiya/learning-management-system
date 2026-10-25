# Sprint Plan & Increments

Sprints are **2 weeks**. Each sprint has a goal, pulls stories from the [product backlog](product-backlog.md), and ends with a demoable increment. Increments below are traceable to commits (see [CHANGELOG](../../CHANGELOG.md)).

> Record dates, attendees and the sprint's Product Owner / Scrum Master in the planning notes created from [`templates/sprint-planning.md`](templates/sprint-planning.md) and keep them next to this file (`docs/agile/sprints/sprint-N.md`).

## Roadmap overview
| Sprint | Goal | Stories | Increment (what a user could do afterwards) |
| --- | --- | --- | --- |
| 1 | Foundations: a signed-in user exists | A1, A2, A3, F3 (auth tests) | Register and log in; Express + Postgres service; CI-ready test harness |
| 2 | Instructors can author courses | B1, B2, B3, B5, C1 | Create/publish courses and lessons; browse the catalog |
| 3 | Students can learn and be tracked | C2, C3, C4, F5 | Enroll, complete lessons, see progress on "My learning" |
| 4 | Assessment | D1–D6 | Quizzes with scoring, assignments with submissions and grading |
| 5 | Discovery & dashboards | C1 (search), E1, E2, E4, B6 | Search, role-specific dashboards, admin overview. **B6 (categories) was not finished and moved back to the backlog as G1.** |
| 6 | Ship it: packaging, quality, polish | F1, F2, F4, F6, A4, B4, E3 | Docker one-command run, CI, dark mode, validation/security hardening, delete/management features |

## Project timeline and history note
- **Project kickoff:** 15 October 2026.
- **Repository history:** the work done between kickoff and 25 October 2026 was lost before it was committed to this repository, so the commit history here begins on 25 October 2026. Commit dates are kept as they actually happened; the sprint increments below were rebuilt in this repository and are traceable to those commits (see [CHANGELOG](../../CHANGELOG.md)).

## Sprint 1 — Foundations
- **Goal:** a user can create an account and authenticate against a real database.
- **Done:** Express server + Postgres connection, registration, JWT login, auth integration tests.

## Sprint 2 — Course & lesson management
- **Goal:** instructors can build and publish a course.
- **Done:** courses/lessons endpoints, React scaffold, routing and course listing pages.

## Sprint 3 — Enrollment & progress
- **Goal:** students enroll and see progress.
- **Done:** enrollment endpoints, progress on enrollments, seeded demo student with progress.
- **Improvement later (Sprint 6):** progress was initially a manually synced number; it is now derived from completed lessons stored on the server (C3).

## Sprint 4 — Quizzes & assignments
- **Goal:** instructors assess; students are graded.
- **Done:** quiz/question/attempt model and endpoints, assignments, submissions and grading with ownership checks.
- **Improvement later (Sprint 6):** student-facing quiz-taking and assignment-submission UI, per-question results, resubmission (D2, D5).

## Sprint 5 — Search, dashboards
- **Goal:** find content quickly and give each role a useful home screen.
- **Done:** course search, student/instructor/admin dashboards, admin overview, publish control.
- **Not done → backlog:** course categories (B6/G1) were never implemented, so the story was returned to the backlog and re-prioritised instead of being marked done.

## Sprint 6 — Packaging, quality and polish
- **Goal:** the product can be started with one command, is protected by CI, and behaves safely on bad input.
- **Done:** Dockerisation (ephemeral Postgres; seed on start), GitHub Actions CI, Tailwind UI, dark mode, a full product audit and hardening pass (see below), management features (delete course/quiz/assignment/lesson edit, admin user roles and deletion).

### Sprint 6 audit — what inspection found and what we changed
Findings from an end-to-end review of every page and endpoint, each turned into backlog items and closed in the sprint:

| Finding | Impact | Fix |
| --- | --- | --- |
| Dev server served stale code (new route returned 404) because the repo sits on a file system without change events | "Page not found" for an existing route | Polling file watchers in Vite and nodemon (F6) |
| Anyone could self-register as `admin` | Privilege escalation | Whitelist roles at sign-up (A1) |
| `/courses/all` and search exposed unpublished drafts | Data leak | Admin-only listing; drafts hidden everywhere else (B2) |
| Non-numeric ids and async errors crashed the API | Denial of service | Id guards, async error handling, JSON 404/500 (F4) |
| Progress kept in browser storage; students had no way to take quizzes or submit work | Features incomplete | D2, D5, C3 delivered |
| Window refocus re-mounted the whole app; a network blip logged users out | Lost form input, surprise logouts | Silent session re-validation (A2) |
| Landing page showed invented statistics, logos and testimonials; cards showed a hard-coded rating | Misleading content | Replaced by live data (stats endpoint, featured course) |
| Seed script duplicated courses when re-run | Unrepeatable demos | Idempotent seed (F5) |

### Sprint 6 retrospective (what we learned)
- **Keep:** pairing every fix with an API test (7 integration tests now guard the above).
- **Problem:** environment-specific tooling issues (file watching) cost time because they looked like application bugs. **Action:** documented in the README and in [risks](risks-and-impediments.md#r4).
- **Problem:** documentation drifted from the code (README/AGILE.md team lists differed; plan promised categories). **Action:** Definition of Done now requires updating docs and the backlog status.
- **Try next:** add client build + lint to CI (G10).

## Velocity & burndown
We track **stories completed per sprint** rather than story-point velocity until the team has several sprints of data. Burndown is read from the project board (Done column) at each review.

## Next sprint candidates (Sprint 7)
Top of the future backlog: **G1** categories, **G2** password change/reset, **G10** CI for the client, **G9** pagination. To be confirmed at the next planning session.
