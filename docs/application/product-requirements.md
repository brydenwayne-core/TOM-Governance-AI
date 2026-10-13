# Product requirements · v0.1

TOM Governance AI is an advisory workbench for nonprofit leadership. Five configurable advisors protect mission, finances, governance, cultural preservation, and inclusive community impact. It does not represent actual directors or issue binding decisions.

## Required behavior

- Scenario intake: decision, outcome, horizon, current-state/strategic/both mode, budget and projected revenue, evidence selection.
- Independent initial assessments; challenge round; separately retained revisions; dissent; neutral synthesis; roadmap and metrics.
- Mode A: permissible, conditional, prohibited, or undetermined. Verified evidence is required for factual policy determinations.
- Mode B: opportunities, dependencies, trade-offs and human approval gates. Never implies authorization.
- Source register: document authenticity, approval, effective date, version, classification, hash, source and applicable advisors.
- Authenticated document upload and decision history/export. Markdown, text, PDF and DOCX parsers.
- Configurable scoring with hard gates; defaults 30/20/20/15/15 are illustrative.
- Pages hosts synthetic demonstration content only. Real execution requires a separate authenticated HTTPS API.

## Acceptance criteria

Five original and five revised assessments are recorded; invalid citations fail execution; missing authoritative evidence yields undetermined rather than permission; unresolved hard gates survive synthesis regardless of scoring; simulated evidence cannot enter production decisions. Document version precedence and policy conflicts are visible. Reports distinguish facts, interpretations, assumptions and recommendations. Frontend supports errors, loading, accessible inputs, documents, history and exports.

## Release boundary

A working v0.1, with deterministic simulation and an optional real OpenAI adapter. Single-organization deployments use an operator token; enterprise SSO, multi-tenant RBAC, vector search, Salesforce synchronization and production hosting remain subsequent integrations. No authentic Foundation policies were supplied.
