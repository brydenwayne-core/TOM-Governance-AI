import asyncio
import hmac
import json
import logging
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import PlainTextResponse
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from app import config
from app.documents.ingestion.service import ingest
from app.documents.parsing.parser import MAX_BYTES
from app.documents.retrieval.search import retrieve
from app.documents.validation.rules import latest_current
from app.governance.configuration import PROFILES
from app.models import Scenario, DecisionReport
from app.orchestration.engine import deliberate
from app.reports.export import markdown
from app.storage import AuditRow, DecisionRow, Session, audit, documents

log = logging.getLogger(__name__)
router = APIRouter(prefix="/api")
run_limit = asyncio.Semaphore(2)


async def authorize(request: Request):
    supplied = request.headers.get("authorization", "")
    if config.TOKEN:
        if not hmac.compare_digest(supplied.encode(), f"Bearer {config.TOKEN}".encode()):
            raise HTTPException(401, "Valid operator bearer token required", headers={"WWW-Authenticate": "Bearer"})
    elif not config.DEMO:
        raise HTTPException(503, "Authentication is not configured")
    elif request.client and request.client.host not in {"127.0.0.1", "::1", "localhost", "testclient"}:
        raise HTTPException(403, "Unauthenticated demo API is loopback-only; configure TOM_API_TOKEN for remote use")


protected = [Depends(authorize)]


@router.get("/health")
def health():
    with Session() as s:
        s.execute(select(1))
    return {"status": "ok", "demo": config.DEMO, "provider": config.PROVIDER, "organization": config.ORGANIZATION}


@router.get("/advisors", dependencies=protected)
def advisors():
    return [p.model_dump() for p in PROFILES]


@router.get("/documents", dependencies=protected)
def list_documents():
    with Session() as s:
        rows = documents(s, config.ORGANIZATION)
        active = {r.id for r in latest_current(rows, config.DEMO)}
        return [
            {
                **r.metadata_json,
                "sha256": r.sha256,
                "ingested_at": r.ingested_at.isoformat(),
                "active": r.id in active,
                "chunks": len(r.chunks),
            }
            for r in rows
        ]


@router.post("/documents", dependencies=protected, status_code=201)
async def upload_document(file: UploadFile = File(...), metadata: str | None = Form(None)):
    data = await file.read(MAX_BYTES + 1)
    try:
        supplied = json.loads(metadata) if metadata else None
        with Session() as s:
            row = ingest(s, data, file.filename or "upload.txt", config.ORGANIZATION, config.DEMO, supplied)
            s.commit()
            return {**row.metadata_json, "sha256": row.sha256}
    except (ValueError, ValidationError, IntegrityError) as exc:
        raise HTTPException(
            422, "Document rejected: check format, metadata, organization and immutable version"
        ) from exc
    except Exception as exc:
        raise HTTPException(422, "Unable to parse document; encrypted or malformed files are unsupported") from exc


@router.get("/evidence", dependencies=protected)
def evidence(query: str = "mission budget preservation", advisor_id: str | None = None):
    if len(query) > 2000:
        raise HTTPException(422, "Query too long")
    with Session() as s:
        return retrieve(documents(s, config.ORGANIZATION), query, advisor_id, config.DEMO)


@router.post("/decisions", dependencies=protected, status_code=201, response_model=DecisionReport)
async def run_decision(scenario: Scenario):
    if run_limit.locked():
        raise HTTPException(429, "Two deliberations are running; retry after completion")
    try:
        async with run_limit:
            with Session() as s:
                rows = documents(s, config.ORGANIZATION)
                report = await asyncio.wait_for(deliberate(scenario, rows), timeout=240)
                report["organization"] = config.ORGANIZATION
                s.add(DecisionRow(id=report["id"], organization=config.ORGANIZATION, report=report))
                audit(s, config.ORGANIZATION, "decision.completed", report["id"])
                s.commit()
                return report
    except ValueError as exc:
        raise HTTPException(
            422, "Assessment failed validation: invalid evidence selection, citation, or provider output"
        ) from exc
    except TimeoutError as exc:
        raise HTTPException(504, "Deliberation timed out; no partial decision was saved") from exc
    except Exception as exc:
        log.error("Deliberation failed: %s", type(exc).__name__)
        raise HTTPException(
            502, "AI execution failed; check server configuration. No partial decision was saved."
        ) from exc


@router.get("/decisions", dependencies=protected)
def list_decisions():
    with Session() as s:
        rows = s.scalars(
            select(DecisionRow)
            .where(DecisionRow.organization == config.ORGANIZATION)
            .order_by(DecisionRow.created_at.desc())
            .limit(100)
        )
        return [
            {
                "id": r.id,
                "title": r.report["scenario"]["title"],
                "created_at": r.report["created_at"],
                "current_status": r.report["current_status"],
                "weighted_score": r.report["weighted_score"],
            }
            for r in rows
        ]


def get_report(decision_id):
    with Session() as s:
        row = s.get(DecisionRow, decision_id)
        if not row or row.organization != config.ORGANIZATION:
            raise HTTPException(404, "Decision not found")
        return row.report


@router.get("/decisions/{decision_id}", dependencies=protected, response_model=DecisionReport)
def read_decision(decision_id: str):
    return get_report(decision_id)


@router.get("/decisions/{decision_id}/export", dependencies=protected, response_class=PlainTextResponse)
def export_decision(decision_id: str):
    return PlainTextResponse(
        markdown(get_report(decision_id)), headers={"Content-Disposition": 'attachment; filename="advisory-report.md"'}
    )


@router.get("/audit", dependencies=protected)
def audit_log():
    with Session() as s:
        rows = s.scalars(
            select(AuditRow).where(AuditRow.organization == config.ORGANIZATION).order_by(AuditRow.id.desc()).limit(100)
        )
        return [{"action": r.action, "resource_id": r.resource_id, "at": r.created_at.isoformat()} for r in rows]
