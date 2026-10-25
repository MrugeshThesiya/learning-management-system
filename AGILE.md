# Agile Methodology

**Project:** Learnova — Learning Management System (React · Node/Express · PostgreSQL)

We use a lightweight **Scrum** process with **Kanban-style flow** inside each sprint, delivered through short-lived feature branches and pull requests. This file is the overview; the detailed artifacts live in [`docs/agile/`](docs/agile/).

| Artifact | Where |
| --- | --- |
| Product vision, goals, personas | [`docs/agile/product-vision.md`](docs/agile/product-vision.md) |
| Product backlog (epics → user stories, acceptance criteria, status) | [`docs/agile/product-backlog.md`](docs/agile/product-backlog.md) |
| Sprint plan, goals and increments | [`docs/agile/sprint-plan.md`](docs/agile/sprint-plan.md) |
| Definition of Ready / Definition of Done / working agreements | [`docs/agile/definition-of-done.md`](docs/agile/definition-of-done.md) |
| Branching, PR and release workflow | [`docs/agile/workflow.md`](docs/agile/workflow.md) |
| Risks and impediments log | [`docs/agile/risks-and-impediments.md`](docs/agile/risks-and-impediments.md) |
| Ceremony templates (planning, daily, review, retro) | [`docs/agile/templates/`](docs/agile/templates/) |
| Release history | [`CHANGELOG.md`](CHANGELOG.md) |

## Team
- 23BCP230 — Vency Thummar
- 23BCP250 — Mrugesh Thesiya
- 23BCP525D — Vaidehi Desai

Scrum roles (Product Owner, Scrum Master, Developers) are agreed at each sprint planning and **rotate** so everyone practises each role. The current assignment is recorded in that sprint's planning notes (see the [planning template](docs/agile/templates/sprint-planning.md)). All three members are Developers.

## Principles we follow
1. **Working software over documents** — every sprint ends with a runnable, demoable increment (`docker compose up --build`).
2. **Small vertical slices** — a story cuts through UI, API and database so it can be demoed on its own.
3. **Inspect and adapt** — scope changes go through the backlog; unfinished stories return to the backlog, they are not silently extended.
4. **Quality is built in** — the [Definition of Done](docs/agile/definition-of-done.md) applies to every story; CI must be green to merge.
5. **Transparency** — the backlog status column and the changelog are the source of truth for progress.

## Cadence
| Ceremony | When | Time-box | Output |
| --- | --- | --- | --- |
| Sprint planning | Day 1 of sprint | 1 h | Sprint goal + sprint backlog |
| Daily stand-up | Daily (async in chat is fine) | 15 min | Yesterday / today / blockers |
| Backlog refinement | Mid-sprint | 30 min | Stories meet the Definition of Ready |
| Sprint review (demo) | Last day | 45 min | Demoed increment, feedback → backlog |
| Retrospective | After review | 30 min | 1–3 improvement actions with owners |

Sprint length: **2 weeks**. Planned roadmap: six sprints (see [sprint plan](docs/agile/sprint-plan.md)).

## Tooling
- **Backlog / board:** GitHub Issues + a Projects board with columns `Backlog → Ready → In progress → In review → Done` (issue templates in `.github/ISSUE_TEMPLATE/`).
- **Version control:** `main` (always releasable) ← short-lived `feature/*` and `fix/*` branches via PR. See [workflow](docs/agile/workflow.md).
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`, `ci:`).
- **CI:** GitHub Actions runs the server test suite against a Postgres service on every push and PR.
