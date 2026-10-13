from app.models import Gate

HARD = {"mission", "legal", "safety", "preservation", "authority", "evidence"}


def enforce(assessments, evidence, policy_conflicts):
    gates = [g for a in assessments for g in a.gates]
    authoritative = {e["chunk_id"] for e in evidence if e.get("authoritative") and e["status"] == "verified"}
    for a in assessments:
        if any(g.verified for g in a.gates) and not any(c.chunk_id in authoritative for c in a.citations):
            raise ValueError("Verified gate requires authoritative evidence citation")
    if not authoritative:
        gates.append(
            Gate(
                category="evidence",
                reason="No current verified authoritative source was supplied; organizational permissibility is undetermined.",
                severity="blocking",
                verified=False,
            )
        )
    for conflict in policy_conflicts:
        gates.append(
            Gate(
                category="authority",
                reason=f"Policy conflict: {conflict['policy_key']}. Human resolution required.",
                severity="blocking",
                verified=True,
            )
        )
    return list({(g.category, g.reason, g.severity, g.verified): g for g in gates}.values())


def current_status(gates, mode):
    if mode == "strategic":
        return "not_assessed"
    if any(g.category == "evidence" and g.severity == "blocking" for g in gates):
        return "undetermined"
    if any(
        g.category in {"mission", "legal", "safety", "preservation"} and g.severity == "blocking" and g.verified
        for g in gates
    ):
        return "prohibited"
    return "conditional" if gates else "permissible"


def weighted_score(assessments, weights):
    return round(sum(a.score * weights[a.advisor_id] / 100 for a in assessments), 2)
