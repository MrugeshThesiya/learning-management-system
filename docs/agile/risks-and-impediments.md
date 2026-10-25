# Risks & Impediments Log

Reviewed in refinement and at every retrospective. **Likelihood / Impact:** L / M / H.

## Risks
| ID | Risk | L | I | Mitigation | Status |
| --- | --- | --- | --- | --- | --- |
| R1 | Authorization gaps expose other users' data or drafts | M | H | Server-side role + ownership checks (`middleware/courseAccess.js`); tests for every forbidden path | Mitigated (Sprint 6) |
| R2 | Unhandled errors crash the API | M | H | Async error handling, id validation, JSON error responses | Mitigated (Sprint 6) |
| R3 | Documentation drifts from the product | H | M | Docs updates are part of the Definition of Done | Open — monitored |
| R4 | Tooling behaves differently per environment (e.g. file watching on FUSE/NTFS/Docker volumes) | M | M | Polling watchers configured and documented in the README | Mitigated |
| R5 | Default `JWT_SECRET` fallback used outside development | L | H | `.env.example` + compose set a secret; **action:** fail fast in production when unset | Open |
| R6 | No client-side automated tests or lint in CI | H | M | Backlog item G10 | Open |
| R7 | Self-registered instructors can publish content immediately | M | M | Backlog item G3 (approval flow) | Open |
| R8 | Ephemeral Postgres in Docker loses data on restart | H | L | Intentional for demos; seed re-runs automatically. Use a named volume for real deployments | Accepted |

## Impediments (resolved)
| ID | Impediment | Resolution |
| --- | --- | --- |
| I1 | Postgres container failed on volume ownership | Switched to `tmpfs` data directory for local/demo runs |
| I2 | CI failed without lockfiles | Lockfiles committed; CI uses `npm install` |
| I3 | Tailwind v4 required a different PostCSS plugin and import syntax | Updated config and `@import "tailwindcss"` |
| I4 | A new route returned 404 in the dev server | Root cause was missing file-change events; enabled polling (see R4) |
