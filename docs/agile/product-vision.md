# Product Vision

## Vision statement
**For** instructors who want to publish structured learning and students who want to learn at their own pace, **Learnova** is a web-based learning management system **that** lets instructors build courses with lessons, quizzes and assignments, and lets students enroll, track real progress and get graded — **unlike** juggling documents and spreadsheets, because everything lives in one fast, role-aware workspace.

## Goals
1. Instructors can publish a complete course (lessons, quiz, assignment) without developer help.
2. Students always see accurate, server-side progress, scores and grades.
3. Admins can oversee users and content across the platform.
4. The system is easy to run anywhere (one command via Docker) and safe by default.

## Personas
| Persona | Needs | Key stories |
| --- | --- | --- |
| **Student** (e.g. demo@learnova.app) | Find a course, enroll, complete lessons, take quizzes, submit work, see grades | C1–C4, D2, D5 |
| **Instructor** (instructor@learnova.app) | Create/publish courses, author quizzes/assignments, grade submissions, see engagement | B1–B5, D1, D3, D4, D6, E1 |
| **Admin** (admin@learnova.app) | Oversee platform health, manage users/roles, moderate courses | E2–E4 |

## Success measures
- A new user can register, enroll and finish a lesson in under 2 minutes.
- An instructor can go from "new course" to "published with a quiz" in under 10 minutes.
- Server integration tests cover authentication, authorization (role/ownership) and each core workflow.
- CI is green on `main` at all times.

## Out of scope (for now)
Payments, live video, native mobile apps, third-party SSO. See "Future backlog" in the [product backlog](product-backlog.md).
