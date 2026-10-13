# Organizational document processing

## Pipeline

Upload → parse text/front matter → validate metadata/authenticity/organization → classify → SHA-256 fingerprint → paragraph chunks → immutable database version → current-source filtering → advisor-specific retrieval → exact citations.

Source metadata schema: `governance/schemas/document.schema.json`; runtime authority is `DocumentMetadata` in `backend/app/models.py`. Versions use dotted numeric components (`1`, `1.0`, `1.10`), with numeric ordering. The latest **eligible** version wins per document ID; pending/future-dated versions do not replace currently approved evidence. `supersedes` names an existing document ID in the same organization. A currently eligible replacement retires that ID from retrieval; pending/future replacements do not. Supersession cycles are rejected. Use a stable document ID with incremented versions for ordinary updates.

A policy key and position can identify conflicting rules. Two current documents with the same key but different positions create a blocking human-resolution gate. This mechanism does not infer all natural-language contradictions; advisors and human reviewers must identify additional conflicts.

## Authenticity and applicability

A simulated source is never authoritative and must be `public_demo`. For production authority, require `status: verified`, `approval_status: approved`, `authoritative: true`, an effective date and explicit approval evidence. Only current authoritative production sources enter retrieval. Operators, not AI, attest approval. Future-dated, proposed and unapproved sources remain visible in the register as inactive. Mode B proposals are generated as possibilities, not inserted as current rules.

Each source declares applicable advisor IDs. Retrieval ranks lexical word overlap with the proposal and advisor keywords. Paragraph splitting creates stable `document_id@version:ordinal` chunk IDs. Quotes must match exact supplied text, with document ID and version consistency. No invented citation enters deliberation.

## Supported ingestion

Markdown and UTF-8 text; text-extractable PDF up to 200 pages; DOCX paragraphs and tables with an expanded archive limit. PDFs and DOCX need metadata JSON supplied with the upload. Markdown supports YAML front matter. Scan-only PDFs, binary-only content, encrypted files, unsupported extensions and oversized input fail cleanly. There is no silent conversion to permissive evidence.

Confidential files, hashes/indexes and generated decisions are excluded from static deployment. The static export script reads only the fictional repository collection and checks status/classification/authority explicitly.
