from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app import config
from app.api.routes import router, authorize
from app.api.limits import UploadSizeLimit
from fastapi.responses import JSONResponse
from app.documents.ingestion.service import ingest
from app.storage import Session, initialize


@asynccontextmanager
async def lifespan(app):
    initialize()
    if config.DEMO:
        if config.ORGANIZATION != "tom-demo":
            raise RuntimeError("Bundled demo sources require TOM_ORGANIZATION=tom-demo")
        with Session() as session:
            for path in sorted((config.ROOT / "docs/organization/mock").glob("*.md")):
                ingest(session, path.read_bytes(), path.name, config.ORGANIZATION, True)
            session.commit()
    yield


app = FastAPI(title="TOM Governance AI", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)


app.add_middleware(UploadSizeLimit)


@app.middleware("http")
async def secure_headers(request, call_next):
    if request.url.path.startswith("/api/") and request.url.path != "/api/health":
        try:
            await authorize(request)
        except HTTPException as exc:
            response = JSONResponse({"detail": exc.detail}, status_code=exc.status_code, headers=exc.headers)
            response.headers["Cache-Control"] = "no-store"
            return response
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Frame-Options"] = "DENY"
    return response


app.include_router(router)
