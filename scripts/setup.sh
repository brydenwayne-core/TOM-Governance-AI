#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
export PIP_CACHE_DIR="${PIP_CACHE_DIR:-$ROOT/.cache/pip}"
export npm_config_cache="${npm_config_cache:-$ROOT/.cache/npm}"
python3 -m venv .venv
.venv/bin/python -m pip install -r backend/requirements.lock
.venv/bin/python -m pip install --no-deps --no-build-isolation -e backend
npm --prefix frontend ci --no-audit --no-fund
# Install does not start services, alter organizational source documents, or run live AI requests.
