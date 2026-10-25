# Branching, Review & Release Workflow

```
main      ●───●───●───●───●───●───●───●   always releasable, tagged (vX.Y.0 at sprint end)
           \ / \ /     \ /     \ /
feature/*   ●   ●       ●       ●          one short-lived branch per story / fix
```

We use trunk-based development: short-lived branches merged straight into `main` through reviewed pull requests.

## Branches
| Branch | Purpose |
| --- | --- |
| `main` | Production-ready code. CI must be green; every change arrives through a PR. |
| `feature/<story-id>-<slug>` | One story, e.g. `feature/D2-take-quiz`. |
| `fix/<slug>` | Bug fixes, e.g. `fix/stale-vite-watcher`. |

## Day-to-day
1. Pick a story from the sprint backlog; move its issue to **In progress**.
2. `git checkout main && git pull && git checkout -b feature/<id>-<slug>`.
3. Commit small and often with Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`, `ci:`); reference the story ID in the body.
4. Open a PR into `main` using the PR template. CI must pass; at least one reviewer approves.
5. Merge, delete the branch, move the issue to **Done** only if the [Definition of Done](definition-of-done.md) is met.

## Release (end of sprint)
1. Sprint review demo from `main`.
2. Update [CHANGELOG.md](../../CHANGELOG.md) and backlog statuses.
3. Tag `main` as `vX.Y.0`.
4. Run the retrospective and record actions.

## Hotfix
Branch from `main` as `fix/<slug>` and PR straight into `main`; tag a patch release (`vX.Y.Z`).

## Environments
| Environment | How | Data |
| --- | --- | --- |
| Local dev | `docker compose up -d db` + `npm run dev` in `server/` and `client/` | Seeded via `npm run seed` |
| Full stack | `docker compose up --build` | Ephemeral Postgres, seeded on start |
| CI | GitHub Actions + Postgres service | Created by the tests, cleaned up afterwards |
