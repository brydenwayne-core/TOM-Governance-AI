# Implementation roadmap and acceptance backlog

## v0.1 implemented

- Engineering specifications, charter, profiles and validation schemas.
- React workbench with dual-mode intake, five advisors, report tabs, dissent, evidence, risks, roadmap, metrics, export, history and comparison.
- FastAPI backend with operator authentication, organization-scoped SQLite persistence, metadata audit and reports.
- Mock and typed OpenAI Responses adapters; application-controlled isolation, challenges, revisions, citation validation and gates.
- Markdown/text/PDF/DOCX ingestion, immutable versions, cross-ID supersession, metadata classification, lexical chunk retrieval and policy-conflict register.
- Nine fictional knowledge documents, reusable templates, three scenario regressions.
- Locked dependencies, CI, Pages deployment workflow and container configuration.

## Pilot acceptance requiring outside resources

1. Foundation-specific evidence: actual mission, bylaws, approved policies, strategic plan and relevant financial data. Human owners must verify source authenticity and priorities.
2. Live model evaluation: configured key/model, representative outputs, cost/latency and prompt-injection review against approved data.
3. Deployment validation: production HTTPS, exact CORS, credentials, protected storage, PostgreSQL tests when selected and approved public Pages publication.

## Subsequent implementation issues

| Priority | Work item | Acceptance |
| --- | --- | --- |
| P0 before broad production | SSO and role-based authorization | Separate source approvers, readers and operators; user-scoped audit |
| P0 before scaling | Durable job queue and distributed quotas | Restart-safe runs, cancellation, retry policy and spend controls |
| P0 before schema evolution | Database migrations and retention | Tested upgrades, protected backups, deletion policy |
| P1 | Semantic retrieval and conflicting-policy analysis | Evaluate recall, traceability, authority and false conflict rate |
| P1 | Policy approval workflow | Separate human approvals and conflict resolution; no pending source overriding current policy |
| P1 | Human evaluation and scoring calibration | Adopted weights, supported targets and documented dissent quality |
| P2 | OCR / richer formats / malware checks | Safe extraction with no embedded execution |
| P2 | Salesforce integration | Authorized mappings for decision/program/impact records; no donor exposure in Pages |
| P2 | Multi-organization product | Tenant-scoped identity, evidence, decisions and lifecycle |

The original conversation proposed staged review before coding. The user's subsequent instruction authorizes building the whole application, so this release implements the v0.1 workflow while keeping external dependencies and future enterprise integrations explicit.
