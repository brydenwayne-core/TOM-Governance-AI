# Security model

## Trust and authentication

Unauthenticated demo API access is limited to loopback clients. Set `TOM_API_TOKEN` to require a bearer token even in demo mode. Non-demo startup requires a token at least 32 characters long and the OpenAI provider. Use a randomly generated operator token, TLS, exact CORS origins and a separate backend deployment. Compare bearer credentials in constant time. Tokens grant full single-organization operator access; role separation and enterprise SSO are not implemented.

The public frontend contains no provider credentials. The operator token entered in the connection form is kept in React memory only, never localStorage, sessionStorage, URL parameters or build variables. Remote plaintext API URLs are rejected. Disconnect removes the token and connected state. Browser caches are not used for confidential data. API responses use `no-store` and security headers.

## Organizational evidence

Metadata validates authenticity, approval, effective date, classification, version and organization. An authorized operator attests source authenticity; the software does not independently verify an external board resolution. Demo mode accepts only non-authoritative simulated `public_demo` documents. Production rejects simulated documents and retrieves only approved, effective, verified authoritative evidence. Unapproved or future-dated material does not override current policy.

Documents are untrusted evidence. They cannot execute code, fetch remote URLs or invoke model tools. The provider's governing instructions explicitly refuse instructions embedded in scenario/source data. This reduces injection exposure but is not a proof that generated reasoning is correct. Outputs and citations are validated before further execution.

Authentication is checked before parsing request bodies. Multipart requests are capped at 6 MiB, individual files at 5 MiB, and extracted text at 120,000 characters. PDF page and DOCX expanded-size limits reduce resource exposure. No OCR, encrypted-document support or macros execute. Raw filenames are not used to write arbitrary files. Confidential extracted text and indexes are retained only in the backend database and excluded from Git and Pages. Apply protected storage, restricted filesystem permissions and encrypted backups at deployment.

## Persistence and audit

Document versions are immutable. Decisions preserve exact used evidence and source hashes. Database lookups restrict organization; cross-organization report IDs return 404. Audit entries contain resource IDs and action timestamps, not prompts or credentials. The v0.1 API has no edit/delete audit endpoint, but administrators can still alter the database; this is not a tamper-evident compliance ledger.

## Operational limitations

Add per-user authorization, distributed rate limits, durable queues, malware scanning, retention/deletion tooling, formal incident response and database migrations before a broad production rollout. Do not expose an unconfigured loopback demo API through an external proxy. Provider execution sends selected evidence to OpenAI; establish organizational consent, retention agreements and access controls before using confidential sources. There is no claim of legal or compliance certification.
