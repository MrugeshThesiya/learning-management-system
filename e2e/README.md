# Selenium E2E suite

Browser-driven end-to-end tests for the LMS (landing, auth, catalog/enrollment)
using **Selenium + pytest + headless Chrome**.

## Prerequisites

- App stack running: `docker compose up -d` (or server on `:4000` + client on `:5173`)
- Python 3.10+, Chrome installed (Selenium Manager resolves chromedriver automatically)

## Run locally

```bash
pip install -r e2e/requirements.txt
python -m pytest e2e -v
```

Against a non-default client/API:

```bash
E2E_BASE_URL=http://localhost:5173 E2E_API_URL=http://localhost:4000 python -m pytest e2e -v
```

Watch the browser instead of headless:

```bash
E2E_HEADLESS=0 python -m pytest e2e -v
```

## Run fully dockerized (app + Chrome grid + runner)

```bash
VITE_API_URL=http://server:4000 docker compose --profile e2e up --build --abort-on-container-exit e2e
VITE_API_URL=http://server:4000 docker compose --profile e2e down
```

`VITE_API_URL=http://server:4000` is required here so the page's API calls
resolve from *inside* the selenium container (in-network hostname). The
default compose run (without the profile) is unaffected.

## Layout

| File | Covers |
| --- | --- |
| `helpers.py` / `conftest.py` | driver fixture (local headless Chrome or `E2E_SELENIUM_URL` Remote), `ui_login`, `api_register` |
| `test_landing.py` | hero, register/login entry links + navigation |
| `test_auth.py` | valid login → dashboard, empty/wrong-credential validation, register validation, API-registered user login, logout |
| `test_courses.py` | catalog auth guard, debounced search, enroll flow for a fresh user, catalog → detail navigation |

Fresh users are created via `POST /auth/register` with a UUID email per test,
so the suite is idempotent and parallel-safe. CI runs it in the `e2e` job
(`.github/workflows/ci.yml`) against a preview client build + seeded Postgres.
