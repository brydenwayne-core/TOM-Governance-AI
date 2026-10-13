from sqlalchemy import select
from app.documents.parsing.parser import parse
from app.documents.indexing.chunks import chunk_text, fingerprint
from app.models import DocumentMetadata
from app.storage import DocumentRow, audit


def ingest(session, data, filename, organization, demo, metadata=None):
    embedded, text = parse(data, filename)
    m = DocumentMetadata.model_validate(metadata if metadata is not None else embedded)
    if m.organization != organization:
        raise ValueError("Document organization must match this deployment")
    if not demo and m.status == "simulated":
        raise ValueError("Simulated documents are forbidden in production")
    if demo and m.status != "simulated":
        raise ValueError("Demo deployments accept simulated documents only")
    if m.supersedes:
        if m.supersedes == m.document_id:
            raise ValueError("Use versioning, not self-supersession, for the same document ID")
        target = session.scalar(
            select(DocumentRow).where(DocumentRow.organization == organization, DocumentRow.document_id == m.supersedes)
        )
        if not target:
            raise ValueError("Superseded document must already exist in this organization")
    existing = session.scalar(
        select(DocumentRow).where(
            DocumentRow.organization == organization,
            DocumentRow.document_id == m.document_id,
            DocumentRow.version == m.version,
        )
    )
    digest = fingerprint(data)
    if existing:
        if existing.sha256 != digest or existing.metadata_json != m.model_dump(mode="json"):
            raise ValueError("A document version is immutable; increment the version for changed content or metadata")
        return existing
    row = DocumentRow(
        organization=organization,
        document_id=m.document_id,
        version=m.version,
        metadata_json=m.model_dump(mode="json"),
        content=text,
        sha256=digest,
        chunks=chunk_text(text, m.document_id, m.version),
    )
    session.add(row)
    audit(session, organization, "document.ingested", f"{m.document_id}@{m.version}")
    session.flush()
    from app.documents.validation.rules import latest_current
    from app.storage import documents

    latest_current(documents(session, organization), demo)
    return row
