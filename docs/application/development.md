# Development guide

Use the existing checkout in an isolated cloud task. Do not create a worktree unless requested. `bash scripts/setup.sh` creates a repository-local virtual environment and installs exact Python/Node dependencies using lockfiles. Tool caches are local ignored files. Installation is idempotent and does not start services or overwrite application files.

Run backend from `backend` with `../.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000`; run frontend from `frontend` with `npm run dev`. Verify health and a complete decision request, not just the port. Connect the frontend to the local API to test persistence/uploads. Static demo is deliberately the default browser mode.

Environment variables are not auto-loaded from `.env`. Export them explicitly through the shell, service platform or container env configuration. Do not put provider keys in Vite variables. Only `VITE_API_URL` (public backend address) and `VITE_BASE_PATH` (public asset path) affect frontend deployment.

## Validation

Backend: `pytest backend/tests -q` and `ruff check --config backend/pyproject.toml backend scripts`. Frontend: `npm --prefix frontend run lint`, `run typecheck`, `test`, `run build`. Browser: run `npm run test:e2e` from frontend after Chromium is installed. Tests cover static demo and live mock API flows.

Scenario fixtures cover educational programming, archive digitization and community engagement. Run `python scripts/check_scenarios.py` with the virtual environment to verify all cases. Mock response correctness is limited to workflow invariants, not actual governance wisdom. Real OpenAI calls are optional and require credentials; do not make them in default CI.

`python scripts/export_demo.py` refreshes the public fixture from fictional documents and the mock engine. `python scripts/export_schemas.py` refreshes governance JSON schemas from Pydantic types. The fixture generator never queries confidential stores. Update profile/configuration versions when governance behavior changes. Run formatter before lint. Lock updates are intentional code changes, not onboarding side effects.

## Persistence

Default SQLite file: `.data/tom.db`. Test databases are temporary. Browser E2E tests start a mock-only backend on port 18000 with an isolated `.data/e2e.db`; they do not reuse a running development API or provider credentials. SQLite supports a single-host pilot; PostgreSQL support is available through `TOM_DATABASE_URL=postgresql+psycopg://...`. Initial tables are created at startup. Introduce reviewed migrations before evolving deployed schemas. Back up protected data before updates.
