# Deployment

## GitHub Pages

`deploy-pages.yml` builds only the frontend and uploads `frontend/dist`. Its manual trigger prevents accidental publication during implementation. Set repository Pages source to GitHub Actions, configure the `github-pages` environment with required reviewers, run CI, then manually dispatch the Pages workflow. It uses the repository-relative Vite base path. No backend, raw uploads or database is included.

The published default is synthetic demo content. A configured `VITE_API_URL` is a public endpoint, never a credential. Users connect an operator token at runtime. Set the backend CORS origin to the exact Pages origin (no path), for example `https://brydenwayne-core.github.io`. A project path belongs in Vite's asset base, not a CORS origin.

## Backend

Deploy a separate HTTPS service running `uvicorn app.main:app` from `backend`. Store data in a protected persistent volume or PostgreSQL. `backend/Dockerfile` defines an unprivileged container and installs the Python lock. `compose.yaml` is a token-protected demo deployment and is not itself a production rollout. Building/running containers requires a Docker-capable machine.

Required non-demo settings:

| Variable | Purpose |
| --- | --- |
| `TOM_DEMO=false` | Reject all simulated organizational sources |
| `TOM_PROVIDER=openai` | Select real structured Responses API execution |
| `TOM_API_TOKEN` | Random operator token, at least 32 characters |
| `TOM_OPENAI_API_KEY` | Provider key stored only server-side |
| `TOM_OPENAI_MODEL` | Structured-output-capable model; default `gpt-4.1-mini` |
| `TOM_ORGANIZATION` | Single organization's stable identifier |
| `TOM_DATABASE_URL` | Protected SQLite path or PostgreSQL psycopg connection URL |
| `TOM_CORS_ORIGINS` | Comma-separated exact permitted browser origins |

Configure credentials in the deployment secret store. Do not commit them. The OpenAI key is passed directly to the SDK; environments using a proxy-backed secret must configure replacement for `api.openai.com`. Install registries use PyPI and npm; optional browser downloads use Playwright's CDN domains. No extra provider connection is needed for mock mode.

Start production with a separate empty/protected database, ingest authoritative organizational documents through the authenticated API, and test a representative real decision. Demo data is never converted into verified evidence. Actual Foundation mission/bylaws/approval documents were not supplied in this project.

## Release checks

Run CI and scenario regression; validate TLS/auth/CORS from the real deployment origin; verify persistence/backups and restart readiness; review actual evidence and data consent; validate PostgreSQL and live OpenAI execution on the target environment. Enterprise identity, per-user roles, distributed jobs/rate limiting, retention controls and migrations require additional implementation before broader rollout. Neither Pages nor backend hosting has been published by local setup.

## Restricted cloud container builds

When build-container DNS/egress is unavailable, use a trusted wheelhouse downloaded by pip through the environment's working proxy. TLS and package integrity checks remain enabled. This builds the same application image without container network access:

```bash
PIP_CACHE_DIR=.cache/pip .venv/bin/pip download --only-binary=:all: -r backend/requirements.lock --dest .cache/wheels
DOCKER_CONFIG=.cache/docker docker build --build-arg DEPENDENCY_SOURCE=offline --build-context wheelhouse=.cache/wheels -f backend/Dockerfile -t tom-governance-ai:local .
```

The ordinary Docker build uses the online stage by default. The offline stage is a supported alternative, not a disabled TLS/checksum workaround. Use registry-authenticated downloads and reviewed lockfiles.
