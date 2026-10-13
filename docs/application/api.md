# API reference

Interactive OpenAPI docs are provided by the backend at `/docs`. All endpoints except health require operator authorization, unless the API is an unauthenticated loopback demo. Header: `Authorization: Bearer <operator-token>`.

| Method and path | Behavior |
| --- | --- |
| `GET /api/health` | Database liveness and mode/provider/organization metadata |
| `GET /api/advisors` | Five validated configuration profiles |
| `GET /api/documents` | Source register, versions, hashes, active flags |
| `POST /api/documents` | Multipart `file` and optional metadata JSON; immutable ingestion |
| `GET /api/evidence?query=...&advisor_id=...` | Applicable current passages |
| `POST /api/decisions` | Execute full structured deliberation and atomically persist report |
| `GET /api/decisions` | Up to 100 most recent decision summaries |
| `GET /api/decisions/{id}` | Complete saved report with source snapshot |
| `GET /api/decisions/{id}/export` | Plain Markdown report download |
| `GET /api/audit` | Up to 100 recent metadata-only audit events |

A scenario includes `title`, `proposal`, `desired_outcome`, `horizon`, `mode`, `budget`, `projected_revenue`, optional `document_ids` and weights by advisor ID. See JSON schemas and `tests/scenarios`.

Errors: 401 for authentication; 403 for nonlocal unauthenticated demo clients; 404 for absent or inaccessible reports; 413 for oversized multipart requests; 422 for invalid input/evidence/provider output; 429 for full per-process run capacity; 502 for provider execution failures; 504 for run timeout. No partial decision is saved on execution failure. Validation errors avoid echoing uploaded confidential content. AI refusals or invalid structured responses stop execution instead of manufacturing a result.

This synchronous request/async execution API is appropriate for the v0.1 pilot. Add a durable job API before large-scale production use.
