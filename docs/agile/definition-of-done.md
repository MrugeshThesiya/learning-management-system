# Definition of Ready, Definition of Done & Working Agreements

## Definition of Ready
A story may enter a sprint only when:
- [ ] It follows *As a / I want / so that* and has an ID in the [backlog](product-backlog.md).
- [ ] Acceptance criteria are testable (Given/When/Then).
- [ ] It is small enough to finish within a sprint by one or two people.
- [ ] Dependencies (API, schema, design) are known or already done.
- [ ] The Product Owner has prioritised it.

## Definition of Done
A story is **Done** only when all of these are true:
- [ ] Acceptance criteria are met and demonstrated on a running build (`docker compose up --build` or local dev).
- [ ] Code reviewed through a pull request by at least one other team member.
- [ ] Automated tests added/updated for new server behaviour (including the forbidden / invalid-input paths); `cd server && npm test` passes locally and in CI.
- [ ] The client builds (`cd client && npm run build`) with no errors; UI has loading, empty and error states and works in dark and light mode.
- [ ] Authorization checked: role and ownership rules enforced on the server, not only hidden in the UI.
- [ ] Inputs validated; no unhandled promise rejections; no secrets committed.
- [ ] No placeholder or fake data shown to users.
- [ ] Docs updated (README / backlog status / CHANGELOG) when behaviour, setup or scope changes.
- [ ] Merged to `main` via PR with a Conventional Commit message; `main` stays releasable.

## Working agreements
- Stand-up updates are short: yesterday, today, blockers. Blockers go to the [impediments log](risks-and-impediments.md).
- Work-in-progress limit: at most **2 stories in progress per person**.
- PRs are reviewed within one working day; PRs stay under ~400 changed lines where possible.
- Never push directly to `main`; never merge with failing CI.
- Scope changes mid-sprint need Product Owner agreement and an explicit trade-off (something leaves the sprint).
- Bugs found in an accepted story are logged as new backlog items with a `bug` label, prioritised like any other work.
- Be respectful in reviews: critique the code, ask questions, suggest alternatives.
