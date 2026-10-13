import asyncio
from datetime import datetime, timezone
from uuid import uuid4
from app.agents.providers import MockProvider, OpenAIProvider
from app.config import DEMO, PROVIDER, ORGANIZATION
from app.documents.retrieval.search import retrieve, validate_citations
from app.documents.validation.rules import latest_current, conflicts
from app.governance.configuration import PROFILES, CHARTER
from app.governance.gates import enforce, current_status, weighted_score
from app.models import ADVISOR_IDS, Gate, DecisionReport


async def deliberate(scenario, rows, provider=None, demo=DEMO):
    provider = provider or (OpenAIProvider() if PROVIDER == "openai" else MockProvider())
    if not demo and any(r.metadata_json["status"] == "simulated" for r in rows):
        raise ValueError("Simulated evidence forbidden in production")
    selected = latest_current(rows, demo)
    if scenario.document_ids:
        if not set(scenario.document_ids) <= {r.document_id for r in selected}:
            raise ValueError("Selected document is missing or inapplicable")
        selected = [r for r in selected if r.document_id in scenario.document_ids]
    trace = []

    async def timed(stage, actor, operation):
        started = datetime.now(timezone.utc).isoformat()
        value = await operation
        trace.append(
            {
                "stage": stage,
                "actor": actor,
                "started_at": started,
                "completed_at": datetime.now(timezone.utc).isoformat(),
            }
        )
        return value

    evidence = {p.id: retrieve(selected, scenario.proposal + " " + " ".join(p.keywords), p.id, demo) for p in PROFILES}
    initial = await asyncio.gather(
        *(timed("independent", p.id, provider.initial(p, scenario, evidence[p.id])) for p in PROFILES)
    )
    for p, a in zip(PROFILES, initial):
        if a.advisor_id != p.id:
            raise ValueError("Wrong advisor identity")
        validate_citations(a.citations, evidence[p.id])
    challenges = await timed("challenge", "facilitator", provider.challenge(scenario, initial))
    for c in challenges.challenges:
        if c.from_advisor not in ADVISOR_IDS or c.to_advisor not in ADVISOR_IDS or c.from_advisor == c.to_advisor:
            raise ValueError("Invalid challenge participants")
    revisions = await asyncio.gather(
        *(
            timed("revision", p.id, provider.revise(p, scenario, evidence[p.id], a, challenges))
            for p, a in zip(PROFILES, initial)
        )
    )
    for p, a, r in zip(PROFILES, initial, revisions):
        if r.assessment.advisor_id != p.id:
            raise ValueError("Wrong revision advisor identity")
        validate_citations(r.assessment.citations, evidence[p.id])
        r.changed = a.model_dump() != r.assessment.model_dump()
    for assessment in initial + [r.assessment for r in revisions]:
        if scenario.mode == "current":
            assessment.strategic_possibilities = []
        elif scenario.mode == "strategic":
            assessment.current_state = "Not assessed in strategic-only mode."
    all_evidence = {e["chunk_id"]: e for group in evidence.values() for e in group}
    policy_conflicts = conflicts(selected)
    revised = [r.assessment for r in revisions]
    gates = enforce(initial + revised, list(all_evidence.values()), policy_conflicts)
    # Evidence completeness is checked per mandate, independent of model scores.
    for profile in PROFILES:
        supplied_types = {
            r.metadata_json["document_type"]
            for r in selected
            if profile.id in r.metadata_json["applicable_advisors"]
            and r.metadata_json["authoritative"]
            and r.metadata_json["status"] == "verified"
        }
        missing = set(profile.evidence_requirements) - supplied_types
        if missing and any(e.get("authoritative") for e in all_evidence.values()):
            gates.append(
                Gate(
                    category="evidence",
                    severity="blocking",
                    verified=False,
                    reason=f"{profile.name} lacks verified evidence for: {', '.join(sorted(missing))}.",
                )
            )
    synthesis = await timed(
        "synthesis", "facilitator", provider.synthesize(scenario, initial, revisions, challenges, gates)
    )
    dissent = [
        {
            "advisor_id": r.assessment.advisor_id,
            "position": r.assessment.position,
            "objections": r.remaining_objections,
            "reason": r.reason,
        }
        for r in revisions
        if r.remaining_objections or r.assessment.position in {"oppose", "undetermined"}
    ]
    report = {
        "organization": ORGANIZATION,
        "id": str(uuid4()),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "scenario": scenario.model_dump(),
        "simulation": provider.identifier == "deterministic-simulation-v1",
        "demo_evidence": demo,
        "provider": provider.identifier,
        "configuration_version": CHARTER.version,
        "advisor_versions": {p.id: p.version for p in PROFILES},
        "stages": ["intake", "independent", "challenge", "revision", "synthesis", "accountability"],
        "execution_trace": trace,
        "initial": [a.model_dump() for a in initial],
        "challenges": challenges.model_dump()["challenges"],
        "revisions": [r.model_dump() for r in revisions],
        "dissent": dissent,
        "gates": [g.model_dump() for g in gates],
        "policy_conflicts": policy_conflicts,
        "current_status": current_status(gates, scenario.mode),
        "strategic_options": synthesis.alternatives if scenario.mode != "current" else [],
        "weighted_score": weighted_score(revised, scenario.weights),
        "eligible_for_human_review": not any(
            g.severity == "blocking" or g.category in {"authority", "legal", "preservation"} for g in gates
        ),
        "synthesis": synthesis.model_dump(),
        "evidence": list(all_evidence.values()),
        "evidence_snapshot": [
            {"metadata": r.metadata_json, "sha256": r.sha256, "ingested_at": r.ingested_at.isoformat()}
            for r in selected
        ],
        "authority_notice": "Advisory only. No AI output authorizes spending, policy changes or implementation.",
        "mode_notice": "Mode A assesses current evidence; Mode B explores possibilities requiring human authorization.",
        "risk_matrix": [
            {
                "advisor_id": a.advisor_id,
                "risk": risk,
                "likelihood": "unassessed",
                "impact": "requires human review",
                "mitigation": "Resolve advisor conditions before implementation",
            }
            for a in revised
            for risk in a.risks
        ],
    }

    return DecisionReport.model_validate(report).model_dump(mode="json")
