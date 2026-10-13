import asyncio
from datetime import datetime, timezone
from pathlib import Path
from types import SimpleNamespace
from app.agents.providers import MockProvider
from app.documents.indexing.chunks import chunk_text, fingerprint
from app.documents.parsing.parser import parse
from app.models import DocumentMetadata, Scenario
from app.orchestration.engine import deliberate

ROOT = Path(__file__).resolve().parents[1]
rows = []
for path in sorted((ROOT / "docs/organization/mock").glob("*.md")):
    raw, text = parse(path.read_bytes(), path.name)
    meta = DocumentMetadata.model_validate(raw)
    rows.append(
        SimpleNamespace(
            document_id=meta.document_id,
            version=meta.version,
            organization=meta.organization,
            metadata_json=meta.model_dump(mode="json"),
            sha256=fingerprint(path.read_bytes()),
            chunks=chunk_text(text, meta.document_id, meta.version),
            ingested_at=datetime.now(timezone.utc),
        )
    )
for path in sorted((ROOT / "tests/scenarios").glob("*.json")):
    scenario = Scenario.model_validate_json(path.read_text())
    report = asyncio.run(deliberate(scenario, rows, MockProvider(), demo=True))
    assert len(report["initial"]) == len(report["revisions"]) == 5
    assert report["current_status"] == "undetermined" and not report["eligible_for_human_review"]
    assert report["dissent"] and report["gates"] and report["evidence"]
    if scenario.budget > scenario.projected_revenue:
        assert next(d for d in report["dissent"] if d["advisor_id"] == "finance")["position"] == "oppose"
    print(f"PASS {path.stem}: five perspectives, preserved dissent, evidence gate")
