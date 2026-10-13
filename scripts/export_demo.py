"""Export only repository-owned fictional sources; never reads database or uploads."""

import asyncio
import json
from datetime import datetime, timezone
from pathlib import Path
from types import SimpleNamespace
from app.documents.parsing.parser import parse
from app.documents.indexing.chunks import chunk_text, fingerprint
from app.governance.configuration import PROFILES
from app.models import DocumentMetadata, Scenario
from app.agents.providers import MockProvider
from app.orchestration.engine import deliberate

ROOT = Path(__file__).resolve().parents[1]
rows = []
for path in sorted((ROOT / "docs/organization/mock").glob("*.md")):
    metadata, text = parse(path.read_bytes(), path.name)
    m = DocumentMetadata.model_validate(metadata)
    assert m.status == "simulated" and m.classification == "public_demo" and not m.authoritative
    rows.append(
        SimpleNamespace(
            document_id=m.document_id,
            version=m.version,
            organization=m.organization,
            metadata_json=m.model_dump(mode="json"),
            sha256=fingerprint(path.read_bytes()),
            chunks=chunk_text(text, m.document_id, m.version),
            ingested_at=datetime(2026, 1, 1, tzinfo=timezone.utc),
        )
    )
scenario = Scenario(
    title="Expand educational programming at TOM House",
    proposal="Explore paid historical tours, artist workshops and community events through a limited educational pilot that protects collections and accessible participation.",
    desired_outcome="Sustainable revenue, educational reach and inclusive community participation.",
    budget=12000,
    projected_revenue=18000,
)
report = asyncio.run(deliberate(scenario, rows, MockProvider(), demo=True))
report.update(id="illustrative-demo", created_at="2026-01-01T00:00:00Z", organization="tom-demo")
for event in report["execution_trace"]:
    event["started_at"] = event["completed_at"] = "2026-01-01T00:00:00Z"
dataset = {
    "profiles": [p.model_dump() for p in PROFILES],
    "documents": [dict(r.metadata_json, sha256=r.sha256, active=True, chunks=len(r.chunks)) for r in rows],
    "report": report,
}
(ROOT / "frontend/src/demo-data.json").write_text(json.dumps(dataset, indent=2) + "\n")
