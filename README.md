# TOM Governance AI

**Five perspectives. One shared mission.** An evidence-aware nonprofit governance advisory workbench for TOM House and Tom of Finland Foundation, designed for adaptation to other organizations.

This repository implements the user-supplied design as a runnable **v0.1**: React workbench, FastAPI API, document processing, five configurable advisors, independent assessments, challenges, revisions, dissent, hard gates, reports, history, comparisons and scoring. All bundled organizational documents are **fictional**. Nothing here constitutes adopted Foundation policy or board authorization.

## Start locally

Requires Python 3.11+ and Node 22+ (validated with Python 3.12 and Node 24).

```bash
bash scripts/setup.sh
# Terminal 1
cd backend
../.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
# Terminal 2, from repository root
cd frontend
npm run dev
```

The frontend starts at Vite's reported local address. By default it runs a **static demonstration** without network calls or keys. To exercise persistence and uploads, open **Backend connection** and connect to `http://127.0.0.1:8000`. The loopback demo API requires no token. No confidential documents should be used in demo mode.

For a real model, set `TOM_PROVIDER=openai` and supply **server-side** `TOM_OPENAI_API_KEY`; see [deployment](docs/application/deployment.md). The real provider is optional; it never falls back silently to mock execution. Provider calls incur costs and send selected source passages to the configured provider.

## Verify

```bash
.venv/bin/ruff check --config backend/pyproject.toml backend scripts
.venv/bin/pytest backend/tests -q
npm --prefix frontend run lint
npm --prefix frontend run typecheck
npm --prefix frontend test
npm --prefix frontend run build
# One-time Chromium download
cd frontend
PLAYWRIGHT_BROWSERS_PATH=../.cache/ms-playwright npx playwright install chromium
PLAYWRIGHT_BROWSERS_PATH=../.cache/ms-playwright npm run test:e2e
```

Browser tests start frontend and a dedicated mock backend automatically. If system Chromium is already available, skip the download and use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm --prefix frontend run test:e2e`. Install browser system dependencies on minimal Linux machines with Playwright's supported `install-deps` command. Test databases are isolated from the development database. Browser API tests use a separate mock-only service and `.data/e2e.db`, never the development database.

## Repository map

| Path | Purpose |
| --- | --- |
| `frontend/` | React + TypeScript + Vite + Tailwind workbench; static demo adapter and authenticated API client |
| `backend/app/` | FastAPI, SQLAlchemy persistence, typed model providers, orchestration, document pipeline, reports |
| `governance/` | Five versioned YAML profiles, charter policy and generated JSON schemas |
| `docs/application/` | Canonical engineering, governance, API and deployment documentation |
| `docs/organization/` | Fictional knowledge collection and templates, never authentic Foundation policy |
| `docs/reference/` | All five original user-supplied conversation excerpts |
| `tests/scenarios/` | Representative scenario inputs and expected governance invariants |
| `.github/` | CI, manually approved Pages deployment and issue templates |

Start with [requirements](docs/application/product-requirements.md), [architecture](docs/application/architecture.md), [governance charter](docs/application/governance-charter.md), and [development](docs/application/development.md).

## Screenshots and validation

[Workbench overview](docs/application/screenshots/overview.png) · [Decision report](docs/application/screenshots/decision-report.png) · [Executed validation](docs/application/validation.md).

## Release boundaries

This is an advisory development implementation, not a production certification. The real OpenAI adapter requires credentials for a live end-to-end validation. SQLite is tested; PostgreSQL support uses SQLAlchemy/psycopg but needs deployment-specific validation. Authentication is a single-organization operator token, not enterprise SSO/RBAC. Audit entries are append-only through the API but are not a tamper-proof ledger. Confidential data stays outside the static build; deploy the API separately over HTTPS. Salesforce, semantic/vector search, OCR and enterprise identity are explicit future integrations.
