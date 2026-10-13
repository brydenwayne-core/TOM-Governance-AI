import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / ".data"
DATA.mkdir(mode=0o700, exist_ok=True)
DEMO = os.getenv("TOM_DEMO", "true").lower() == "true"
PROVIDER = os.getenv("TOM_PROVIDER", "mock")
ORGANIZATION = os.getenv("TOM_ORGANIZATION", "tom-demo")
DATABASE_URL = os.getenv("TOM_DATABASE_URL", f"sqlite:///{DATA / 'tom.db'}")
TOKEN = os.getenv("TOM_API_TOKEN", "")
MODEL = os.getenv("TOM_OPENAI_MODEL", "gpt-4.1-mini")
ORIGINS = os.getenv("TOM_CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
if PROVIDER not in {"mock", "openai"}:
    raise RuntimeError("TOM_PROVIDER must be mock or openai")
if not DEMO and (len(TOKEN) < 32 or PROVIDER != "openai"):
    raise RuntimeError("Production requires TOM_API_TOKEN (at least 32 characters) and TOM_PROVIDER=openai")
if PROVIDER == "openai" and not os.getenv("TOM_OPENAI_API_KEY"):
    raise RuntimeError("OpenAI provider requires server-side TOM_OPENAI_API_KEY")
