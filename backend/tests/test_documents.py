import json
from datetime import date, timedelta
from io import BytesIO
from types import SimpleNamespace
import pytest
from docx import Document
from app.documents.indexing.chunks import chunk_text
from app.documents.ingestion.service import ingest
from app.documents.parsing.parser import parse
from app.documents.retrieval.search import retrieve, validate_citations
from app.documents.validation.rules import conflicts, latest_current
from app.models import Citation, DocumentMetadata
from app.storage import Session


def metadata(**overrides):
    return {
        "document_id": "TEST-DOC",
        "title": "Mission policy",
        "organization": "tom-demo",
        "document_type": "mission",
        "version": "1.0",
        "status": "simulated",
        "approval_status": "not_applicable",
        "classification": "public_demo",
        "source_type": "upload",
        "authoritative": False,
        "applicable_advisors": ["mission"],
        **overrides,
    }


def row(meta, text="Protect artistic freedom and inclusive community education."):
    return SimpleNamespace(
        document_id=meta["document_id"],
        version=meta["version"],
        metadata_json=meta,
        chunks=chunk_text(text, meta["document_id"], meta["version"]),
    )


def test_simulated_cannot_claim_authority():
    with pytest.raises(ValueError):
        DocumentMetadata.model_validate(metadata(authoritative=True))
    with pytest.raises(ValueError):
        DocumentMetadata.model_validate(metadata(classification="confidential"))


def test_verified_requires_approval_date_and_evidence():
    with pytest.raises(ValueError):
        DocumentMetadata.model_validate(metadata(status="verified", authoritative=True, approval_status="approved"))
    approved = metadata(
        status="verified",
        authoritative=True,
        approval_status="approved",
        effective_date="2025-01-01",
        approval_evidence="Board resolution 01",
    )
    assert DocumentMetadata.model_validate(approved).authoritative


def test_version_precedence_and_future_versions():
    rows = [
        row(metadata(version="1.9")),
        row(metadata(version="1.10")),
        row(metadata(version="2.0", effective_date=str(date.today() + timedelta(days=1)))),
    ]
    assert [r.version for r in latest_current(rows, True)] == ["1.10"]
    assert latest_current(rows, False) == []


def test_pending_new_version_does_not_replace_approved():
    approved = metadata(
        status="verified",
        authoritative=True,
        approval_status="approved",
        effective_date="2025-01-01",
        approval_evidence="Resolution",
    )
    pending = metadata(version="2.0", status="proposed", approval_status="pending")
    assert latest_current([row(approved), row(pending)], False)[0].version == "1.0"


def test_retrieval_filters_advisor_and_never_uses_proposed_sources():
    rows = [row(metadata()), row(metadata(document_id="PROPOSED", status="proposed", approval_status="pending"))]
    results = retrieve(rows, "artistic freedom", "mission", True)
    assert len(results) == 1 and results[0]["document_id"] == "TEST-DOC"
    assert retrieve(rows, "artistic freedom", "finance", True) == []


def test_citation_integrity():
    evidence = retrieve([row(metadata())], "freedom", "mission", True)
    valid = Citation(document_id="TEST-DOC", version="1.0", chunk_id="TEST-DOC@1.0:1", quote="artistic freedom")
    validate_citations([valid], evidence)
    for bad in [
        valid.model_copy(update={"quote": "invented policy"}),
        valid.model_copy(update={"version": "9.0"}),
        valid.model_copy(update={"chunk_id": "OTHER:1"}),
    ]:
        with pytest.raises(ValueError):
            validate_citations([bad], evidence)


def test_conflicting_current_policies_are_visible():
    rows = [
        row(metadata(policy_key="visitor-access", policy_position="allow")),
        row(metadata(document_id="OTHER", policy_key="visitor-access", policy_position="prohibit")),
    ]
    assert conflicts(rows)[0]["policy_key"] == "visitor-access"


def test_upload_immutable_and_repeatable(client):
    with Session() as s:
        one = ingest(s, b"Protect artistic freedom.", "source.txt", "tom-demo", True, metadata())
        s.commit()
        two = ingest(s, b"Protect artistic freedom.", "source.txt", "tom-demo", True, metadata())
        assert one.id == two.id
        with pytest.raises(ValueError):
            ingest(s, b"Different content", "source.txt", "tom-demo", True, metadata())
        with pytest.raises(ValueError):
            ingest(s, b"Protect artistic freedom.", "source.txt", "different-org", True, metadata())


def test_parser_frontmatter_and_docx():
    embedded, text = parse(("---\n" + json.dumps(metadata()) + "\n---\n\nProtect mission.").encode(), "file.md")
    assert embedded["document_id"] == "TEST-DOC" and text == "Protect mission."
    doc = Document()
    doc.add_paragraph("Collections require review.")
    out = BytesIO()
    doc.save(out)
    assert "Collections require review." in parse(out.getvalue(), "file.docx")[1]
    for data, name in [(b"", "empty.txt"), (b"no", "file.exe"), (b"%PDF-invalid", "file.pdf")]:
        with pytest.raises(Exception):
            parse(data, name)


def test_oversize_upload_rejected(client):
    r = client.post(
        "/api/documents",
        files={"file": ("big.txt", b"a" * (5 * 1024 * 1024 + 1))},
        data={"metadata": json.dumps(metadata())},
    )
    assert r.status_code == 422


def test_supersession_only_current_replacements_retire_evidence():
    old = row(metadata())
    new = row(metadata(document_id="NEW", supersedes="TEST-DOC"))
    assert [r.document_id for r in latest_current([old, new], True)] == ["NEW"]
    pending = row(metadata(document_id="NEW", supersedes="TEST-DOC", status="proposed", approval_status="pending"))
    assert [r.document_id for r in latest_current([old, pending], True)] == ["TEST-DOC"]


def test_supersession_cycles_fail_closed():
    a = row(metadata(document_id="A", supersedes="B"))
    b = row(metadata(document_id="B", supersedes="A"))
    with pytest.raises(ValueError, match="Cyclic"):
        latest_current([a, b], True)


def test_document_hash_is_hash_of_original_file(client):
    import hashlib

    with Session() as s:
        result = ingest(s, b"Original source bytes.", "source.txt", "tom-demo", True, metadata())
        assert result.sha256 == hashlib.sha256(b"Original source bytes.").hexdigest()
        with pytest.raises(ValueError, match="immutable"):
            ingest(s, b"Original source bytes.", "source.txt", "tom-demo", True, metadata(title="Changed metadata"))
