import asyncio
import pytest
from app.agents.providers import MockProvider, OpenAIProvider
from app.documents.retrieval.search import validate_citations
from app.governance.gates import current_status, weighted_score
from app.models import Gate, Scenario
from app.orchestration.engine import deliberate
from app.storage import Session, documents


def test_full_workflow_preserves_independent_and_revised_records(client, scenario):
    with Session() as s:
        rows = documents(s, "tom-demo")
        report = asyncio.run(deliberate(scenario, rows, MockProvider()))
    assert len(report["initial"]) == len(report["revisions"]) == 5
    assert len(report["challenges"]) == 3 and len(report["dissent"]) == 5
    assert report["initial"][1]["score"] == 3.5 and report["revisions"][1]["assessment"]["score"] == 3
    assert report["current_status"] == "undetermined" and not report["eligible_for_human_review"]
    assert all(not e["metadata"]["authoritative"] for e in report["evidence_snapshot"])
    for a in report["initial"]:
        from app.models import Citation

        validate_citations([Citation.model_validate(c) for c in a["citations"]], report["evidence"])


@pytest.mark.parametrize(
    "mode,status", [("both", "undetermined"), ("current", "undetermined"), ("strategic", "not_assessed")]
)
def test_modes(client, scenario, mode, status):
    with Session() as s:
        report = asyncio.run(
            deliberate(scenario.model_copy(update={"mode": mode}), documents(s, "tom-demo"), MockProvider())
        )
    assert report["current_status"] == status
    if mode == "current":
        assert report["strategic_options"] == []


def test_scores_cannot_override_hard_gates():
    gates = [Gate(category="mission", reason="Verified mission violation", severity="blocking", verified=True)]
    assert current_status(gates, "both") == "prohibited"
    assert (
        current_status(gates + [Gate(category="evidence", reason="Missing sources", severity="blocking")], "both")
        == "undetermined"
    )


def test_deficit_preserves_finance_dissent(client, scenario):
    with Session() as s:
        r = asyncio.run(
            deliberate(scenario.model_copy(update={"budget": 30000}), documents(s, "tom-demo"), MockProvider())
        )
    finance = next(d for d in r["dissent"] if d["advisor_id"] == "finance")
    assert finance["position"] == "oppose" and "funding source missing" in str(finance["objections"])


def test_invalid_citation_fails_before_challenge(client, scenario):
    class BadProvider(MockProvider):
        async def initial(self, p, s, e):
            a = await super().initial(p, s, e)
            a.citations[0].quote = "FABRICATED POLICY"
            return a

        async def challenge(self, s, a):
            raise AssertionError("Must not reach deliberation with invalid citations")

    with Session() as s, pytest.raises(ValueError, match="quote"):
        asyncio.run(deliberate(scenario, documents(s, "tom-demo"), BadProvider()))


def test_wrong_advisor_identity_fails(client, scenario):
    class BadProvider(MockProvider):
        async def initial(self, p, s, e):
            a = await super().initial(p, s, e)
            a.advisor_id = "not-an-advisor"
            return a

    with Session() as s, pytest.raises(ValueError, match="identity"):
        asyncio.run(deliberate(scenario, documents(s, "tom-demo"), BadProvider()))


def test_simulated_sources_never_enter_production(client, scenario):
    with Session() as s, pytest.raises(ValueError, match="Simulated"):
        asyncio.run(deliberate(scenario, documents(s, "tom-demo"), MockProvider(), demo=False))


def test_selected_nonexistent_evidence_fails(client, scenario):
    with Session() as s, pytest.raises(ValueError, match="missing"):
        asyncio.run(
            deliberate(
                scenario.model_copy(update={"document_ids": ["DOES-NOT-EXIST"]}),
                documents(s, "tom-demo"),
                MockProvider(),
            )
        )


def test_weight_validation_and_nan():
    base = {
        "title": "Some decision",
        "proposal": "A sufficiently detailed proposal about educational programs.",
        "desired_outcome": "Education",
    }
    for changes in [
        {"budget": float("nan")},
        {"weights": {"mission": 100}},
        {"weights": {"mission": 90, "finance": 20, "governance-risk": 20, "preservation": 15, "community": 15}},
    ]:
        with pytest.raises(ValueError):
            Scenario(**base, **changes)


def test_initial_provider_contract_is_isolated(monkeypatch, scenario):
    from app.governance.configuration import PROFILES

    monkeypatch.setenv("TOM_OPENAI_API_KEY", "test-not-real")
    provider = OpenAIProvider()
    payloads = []

    async def fake_generate(schema, payload):
        payloads.append(payload)
        return await MockProvider().initial(PROFILES[0], scenario, [])

    provider.generate = fake_generate
    asyncio.run(provider.initial(PROFILES[0], scenario, []))
    assert set(payloads[0]) == {"stage", "profile", "scenario", "evidence"}
    assert "assessments" not in payloads[0] and "original" not in payloads[0]
    assert weighted_score([asyncio.run(MockProvider().initial(PROFILES[0], scenario, []))], {"mission": 100}) == 3.5


def test_one_verified_document_cannot_establish_complete_governance(scenario):
    from test_documents import metadata, row
    from datetime import datetime, timezone

    source = row(
        metadata(
            status="verified",
            approval_status="approved",
            authoritative=True,
            effective_date="2025-01-01",
            approval_evidence="Human-approved resolution",
        )
    )
    source.organization = "tom-demo"
    source.sha256 = "a" * 64
    source.ingested_at = datetime.now(timezone.utc)
    report = asyncio.run(deliberate(scenario, [source], MockProvider(), demo=False))
    assert report["current_status"] == "undetermined"
    assert any("lacks verified evidence" in g["reason"] for g in report["gates"])


def test_charter_cannot_disable_mandatory_controls():
    from app.governance.configuration import CHARTER
    from app.models import GovernanceCharter

    content = CHARTER.model_dump()
    content["hard_gates"] = ["mission"]
    with pytest.raises(ValueError, match="Mandatory"):
        GovernanceCharter.model_validate(content)


def test_each_advisor_execution_retains_timestamps(client, scenario):
    from datetime import datetime

    with Session() as s:
        report = asyncio.run(deliberate(scenario, documents(s, "tom-demo"), MockProvider()))
    events = report["execution_trace"]
    assert len(events) == 12
    for stage in ["independent", "revision"]:
        assert len([e for e in events if e["stage"] == stage]) == 5
    for e in events:
        assert datetime.fromisoformat(e["completed_at"]) >= datetime.fromisoformat(e["started_at"])
