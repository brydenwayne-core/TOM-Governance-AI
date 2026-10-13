# v0.1 validation record

Validated in the attached cloud environment with Python 3.12, Node 24 and system Chromium.

| Check | Outcome |
| --- | --- |
| Backend pytest | 35 passed; one upstream Starlette/httpx deprecation warning |
| Backend Ruff lint | Passed |
| Frontend ESLint and TypeScript | Passed |
| Frontend Vitest | 5 passed |
| Playwright Chromium | 5 passed: intake/report/export/history, comparison, fictional sources, actual mock API execution/upload rejection, mobile layout and connection access |
| Scenario regressions | 3 passed: educational pilot, digital archive, community program |
| JSON schema synchronization | Passed, including complete decision-report schema |
| Production frontend build | Passed |
| npm audit | Zero known vulnerabilities at validation time |
| Setup repeatability | Exact locked setup script rerun successfully |
| Docker image | Built from trusted pip-downloaded wheelhouse; online build-container DNS was unavailable |
| Container functional checks | Health, required authentication, nine fictional sources, five initial/revised assessments, execution trace and report persistence passed |
| Container restart | Saved report and source state preserved |
| Compose and workflow/template syntax | Validated |
| Local backend and frontend | Started; health/database readiness and rendered workbench verified |

Screenshots: [overview](screenshots/overview.png) and [decision report](screenshots/decision-report.png). Both contain only fictional demonstration data.

## External checks not executed

Live OpenAI requests require a server-side key and model configuration. Actual Foundation documents were not supplied. PostgreSQL-specific integration and public hosting were not exercised; SQLite is the verified store. GitHub workflows were supplied and their local commands validated, but no remote Actions run or Pages deployment was performed. Enterprise SSO/RBAC, durable jobs, Salesforce and semantic retrieval remain explicit roadmap work.

## Saved environment configuration

The install_script and start_skill fields were saved successfully in the environment draft. They reproduce dependency installation/build and register backend/frontend startup plus readiness checks. Saving the draft does not execute it, publish a snapshot or deploy the application. Review and save the draft in environment settings, then publish the environment when appropriate.
