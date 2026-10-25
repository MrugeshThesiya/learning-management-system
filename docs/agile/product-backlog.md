# Product Backlog

Ordered by priority within each epic. **Priority** uses MoSCoW (M = must, S = should, C = could). **Status:** ✅ Done (meets the [Definition of Done](definition-of-done.md)) · 🔜 Backlog (not started).

Story format: *As a \<role\>, I want \<capability\> so that \<value\>.* Acceptance criteria are written as testable Given/When/Then statements.

---

## Epic A — Accounts & access
| ID | Pri | Story | Acceptance criteria | Sprint | Status |
| --- | --- | --- | --- | --- | --- |
| A1 | M | As a visitor, I want to register as a student or instructor so that I can use the platform. | **Given** a unique email and a ≥6-char password, **when** I register, **then** I get an account and am signed in. Duplicate email → clear error (409). Public sign-up can never create an admin. | 1 | ✅ |
| A2 | M | As a user, I want to sign in and stay signed in across reloads so that I don't lose my place. | **Given** valid credentials, **then** I receive a JWT, land on my dashboard, and my session is re-validated on reload. A network blip does not log me out; an expired/invalid token does. | 1 | ✅ |
| A3 | M | As the system, I want role-based authorization so that users only do what their role allows. | Students get 403 on instructor actions; instructors can only change their own courses; admins can manage everything; guests are redirected to login. | 1–2 | ✅ |
| A4 | S | As a user, I want to switch between dark and light mode so that the UI is comfortable. | Dark by default; toggle persists across reloads without a flash. | 6 | ✅ |

## Epic B — Course authoring (instructor)
| ID | Pri | Story | Acceptance criteria | Sprint | Status |
| --- | --- | --- | --- | --- | --- |
| B1 | M | As an instructor, I want to create a course so that I can start building content. | Title required; course is a private draft by default; I land in the course studio. | 2 | ✅ |
| B2 | M | As an instructor, I want to publish/unpublish a course so that I control when students see it. | Drafts are visible only to the owner and admins (others get 404); published courses appear in the catalog. | 2 | ✅ |
| B3 | M | As an instructor, I want to add, edit, reorder-by-creation and delete lessons so that the curriculum stays accurate. | Lessons appear in order; deleting a lesson recomputes students' progress. | 2 | ✅ |
| B4 | S | As an instructor, I want to delete a course so that I can retire obsolete content. | Confirmation required; removes lessons, quizzes, assignments, submissions and enrollments atomically. | 6 | ✅ |
| B5 | S | As an instructor, I want a "preview as student" link so that I can check what learners see. | Link opens the public course page; drafts render for the owner. | 2 | ✅ |
| B6 | C | As an instructor, I want to group courses by category so that learners can filter them. | Course has a category; catalog can filter by it. | 5 | 🔜 (carried over, see sprint plan) |

## Epic C — Learning (student)
| ID | Pri | Story | Acceptance criteria | Sprint | Status |
| --- | --- | --- | --- | --- | --- |
| C1 | M | As a student, I want to browse the catalog and search courses so that I can find something relevant. | Catalog lists only published courses with instructor and lesson count; search matches title, description and instructor; empty/error states are shown. | 2, 5 | ✅ |
| C2 | M | As a student, I want to enroll in a course so that I can start learning. | One click; cannot enroll twice (409); cannot enroll in drafts or in my own course. | 3 | ✅ |
| C3 | M | As a student, I want to mark lessons complete so that my progress is tracked. | Progress % = completed lessons / total lessons, stored server-side and consistent across devices. | 3 | ✅ |
| C4 | M | As a student, I want a dashboard and "My learning" page so that I can resume quickly. | Shows enrolled courses with live progress, suggested courses; enrollments remain visible even if the course is later unpublished. | 3, 5 | ✅ |

## Epic D — Assessment
| ID | Pri | Story | Acceptance criteria | Sprint | Status |
| --- | --- | --- | --- | --- | --- |
| D1 | M | As an instructor, I want to create quizzes with multiple-choice questions so that I can test understanding. | ≥2 options and a valid correct answer required; correct answers are never sent to students; questions can be deleted. | 4 | ✅ |
| D2 | M | As a student, I want to take a quiz and see my score immediately so that I know what to revise. | Must be enrolled; all questions answered; shows score and per-question correct/incorrect; best score shown in the course. | 4 | ✅ |
| D3 | S | As an instructor, I want to see quiz attempts so that I can gauge understanding. | Per-student score list, visible to owner/admin only. | 4 | ✅ |
| D4 | M | As an instructor, I want to create assignments with an optional due date so that students have work to submit. | Title required; assignments listed in studio and course page. | 4 | ✅ |
| D5 | M | As a student, I want to submit (and resubmit) my work so that I can be graded. | Must be enrolled; empty submissions rejected; resubmitting replaces content and clears the old grade. | 4 | ✅ |
| D6 | M | As an instructor, I want to grade submissions so that students get feedback. | Grade 0–100 validated; only the course owner/admin can grade; student sees the grade. | 4 | ✅ |

## Epic E — Dashboards & administration
| ID | Pri | Story | Acceptance criteria | Sprint | Status |
| --- | --- | --- | --- | --- | --- |
| E1 | S | As an instructor, I want a dashboard of my courses with student counts and average progress. | Real aggregates from the database; links to manage/preview. | 5 | ✅ |
| E2 | S | As an admin, I want a platform overview so that I can see health at a glance. | Users by role, courses (published/total), enrollments. | 5 | ✅ |
| E3 | S | As an admin, I want to change roles and delete users so that I can administer accounts. | Cannot change/delete myself; deleting an instructor with courses is blocked with an explanation. | 6 | ✅ |
| E4 | S | As an admin, I want to publish/unpublish/delete any course. | Available from the admin console. | 5–6 | ✅ |

## Epic F — Platform & quality (non-functional)
| ID | Pri | Story | Acceptance criteria | Sprint | Status |
| --- | --- | --- | --- | --- | --- |
| F1 | M | As a developer, I want the stack to run with one command so that onboarding is trivial. | `docker compose up --build` serves the UI on :5173 and the API on :4000, seeded with demo data. | 6 | ✅ |
| F2 | M | As a team, we want CI so that regressions are caught. | GitHub Actions runs server tests against Postgres on push/PR. | 6 | ✅ |
| F3 | M | As a team, we want automated API tests. | Tests cover auth, role/ownership rules, enrollment, progress, quizzes, assignments, deletes and bad-id handling. | 1–6 | ✅ |
| F4 | M | As the system, I want input validation and consistent error handling so that bad requests never crash the server. | Non-numeric ids → 400, unknown → 404, unexpected errors → JSON 500; async errors are caught. | 6 | ✅ |
| F5 | S | As a developer, I want idempotent seed data so that demos are repeatable. | `npm run seed` can be re-run without duplicates; demo progress matches completed lessons. | 3, 6 | ✅ |
| F6 | S | As a developer, I want hot reload to work on any file system. | Vite and nodemon use polling so edits apply on FUSE/NTFS/network drives. | 6 | ✅ |

---

## Future backlog (not yet scheduled)
| ID | Pri | Item |
| --- | --- | --- |
| G1 | S | Course categories and category filter (B6, carried over from Sprint 5) |
| G2 | S | Password reset / change password |
| G3 | S | Instructor approval flow for self-registered instructors |
| G4 | C | File uploads for assignment submissions |
| G5 | C | Lesson reordering (drag and drop) and rich-text/markdown lesson content |
| G6 | C | Course ratings and reviews (replace removed placeholder ratings with real data) |
| G7 | C | Email notifications (graded, new submission) |
| G8 | C | Certificates of completion |
| G9 | S | Pagination for catalog and admin lists |
| G10 | S | Run client build and lint in CI; add component tests and one end-to-end smoke test |
| G11 | C | Admin audit log |

## Backlog hygiene rules
- Every story has an ID, an owner-agreed priority and testable acceptance criteria before it enters a sprint ([Definition of Ready](definition-of-done.md#definition-of-ready)).
- Reprioritisation happens at planning or refinement, never mid-sprint without the Product Owner.
- Stories that miss the sprint go back to the top of the backlog and are re-estimated.
