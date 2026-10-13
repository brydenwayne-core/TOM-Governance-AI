from datetime import date
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, model_validator

ADVISOR_IDS = ["mission", "finance", "governance-risk", "preservation", "community"]
Mode = Literal["both", "current", "strategic"]
Position = Literal["support", "conditional", "oppose", "undetermined"]


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class AdvisorProfile(StrictModel):
    id: str
    code: str
    name: str
    version: str
    mandate: str
    principles: list[str]
    constraints: list[str]
    evidence_requirements: list[str]
    metrics: list[str]
    escalation: list[str]
    keywords: list[str]


class DocumentMetadata(StrictModel):
    document_id: str = Field(min_length=1, max_length=100, pattern=r"^[A-Za-z0-9_.-]+$")
    title: str = Field(min_length=1, max_length=200)
    organization: str = Field(min_length=1, max_length=100)
    document_type: Literal[
        "mission",
        "vision",
        "values",
        "bylaws",
        "strategy",
        "finance",
        "collections",
        "community",
        "governance",
        "other",
    ]
    version: str = Field(pattern=r"^\d+(?:\.\d+){0,2}$")
    status: Literal["simulated", "verified", "proposed"]
    approval_status: Literal["approved", "pending", "not_applicable"]
    effective_date: date | None = None
    classification: Literal["public_demo", "internal", "confidential"]
    source_type: Literal["repository", "upload"]
    authoritative: bool = False
    applicable_advisors: list[str] = Field(min_length=1)
    approval_evidence: str | None = None
    source_location: str | None = None
    supersedes: str | None = None
    policy_key: str | None = None
    policy_position: Literal["allow", "require_review", "prohibit"] | None = None

    @model_validator(mode="after")
    def validate_authority(self):
        if not set(self.applicable_advisors) <= set(ADVISOR_IDS):
            raise ValueError("Unknown applicable advisor")
        if self.authoritative and (
            self.status != "verified"
            or self.approval_status != "approved"
            or not self.approval_evidence
            or not self.effective_date
        ):
            raise ValueError("Authority requires verified, approved, dated evidence of approval")
        if self.status == "simulated" and (self.authoritative or self.classification != "public_demo"):
            raise ValueError("Simulated documents must be non-authoritative public_demo")
        if (self.policy_key is None) != (self.policy_position is None):
            raise ValueError("Policy key and position must be supplied together")
        return self


def default_weights():
    from app.governance.configuration import CHARTER

    return CHARTER.scoring_weights.copy()


class Scenario(StrictModel):
    title: str = Field(min_length=3, max_length=160)
    proposal: str = Field(min_length=20, max_length=12000)
    desired_outcome: str = Field(min_length=3, max_length=2000)
    horizon: Literal["90-day pilot", "12-month strategy", "Three-year transformation"] = "90-day pilot"
    mode: Mode = "both"
    budget: float = Field(default=0, ge=0, le=1e12, allow_inf_nan=False)
    projected_revenue: float = Field(default=0, ge=0, le=1e12, allow_inf_nan=False)
    document_ids: list[str] = Field(default_factory=list, max_length=100)
    weights: dict[str, float] = Field(default_factory=default_weights)

    @model_validator(mode="after")
    def validate_weights(self):
        if set(self.weights) != set(ADVISOR_IDS) or any(not 0 <= v <= 100 for v in self.weights.values()):
            raise ValueError("Weights must include exactly five advisor IDs with values between 0 and 100")
        if abs(sum(self.weights.values()) - 100) > 0.001:
            raise ValueError("Weights must sum to 100")
        return self


class Citation(StrictModel):
    document_id: str
    version: str
    chunk_id: str
    quote: str = Field(min_length=1)


class Gate(StrictModel):
    category: Literal["mission", "legal", "safety", "preservation", "authority", "evidence", "finance", "community"]
    reason: str
    severity: Literal["blocking", "review"]
    verified: bool = False


class Assessment(StrictModel):
    advisor_id: str
    position: Position
    rationale: str
    benefits: list[str]
    risks: list[str]
    assumptions: list[str]
    evidence_gaps: list[str]
    citations: list[Citation]
    gates: list[Gate]
    score: float = Field(ge=1, le=5, allow_inf_nan=False)
    current_state: str
    strategic_possibilities: list[str]


class Challenge(StrictModel):
    from_advisor: str
    to_advisor: str
    concern: str
    response: str


class ChallengeRound(StrictModel):
    challenges: list[Challenge] = Field(min_length=1, max_length=25)


class Revision(StrictModel):
    assessment: Assessment
    changed: bool
    reason: str
    remaining_objections: list[str]


class Action(StrictModel):
    action: str
    owner: str
    milestone: str
    dependency: str


class Metric(StrictModel):
    name: str
    target: str
    owner: str


class Synthesis(StrictModel):
    summary: str
    recommendation: str
    agreements: list[str]
    alternatives: list[str]
    actions: list[Action]
    metrics: list[Metric]


class GovernanceCharter(StrictModel):
    version: str
    advisory_only: Literal[True]
    modes: list[Literal["current", "strategic"]]
    hard_gates: list[Literal["mission", "legal", "safety", "preservation", "authority", "evidence"]]
    evidence_is_instruction: Literal[False]
    scoring_weights: dict[str, float]

    @model_validator(mode="after")
    def mandatory_controls(self):
        if set(self.modes) != {"current", "strategic"}:
            raise ValueError("Both governance modes must be defined")
        if set(self.hard_gates) != {"mission", "legal", "safety", "preservation", "authority", "evidence"}:
            raise ValueError("Mandatory hard gates cannot be removed")
        if set(self.scoring_weights) != set(ADVISOR_IDS) or abs(sum(self.scoring_weights.values()) - 100) > 0.001:
            raise ValueError("Charter must define five weights summing to 100")
        if any(not 0 <= v <= 100 for v in self.scoring_weights.values()):
            raise ValueError("Invalid charter weights")
        return self


class EvidencePassage(StrictModel):
    document_id: str
    version: str
    chunk_id: str
    text: str
    title: str
    status: Literal["simulated", "verified", "proposed"]
    authoritative: bool
    relevance: int


class EvidenceSnapshot(StrictModel):
    metadata: DocumentMetadata
    sha256: str = Field(pattern=r"^[a-f0-9]{64}$")
    ingested_at: str


class Dissent(StrictModel):
    advisor_id: str
    position: Position
    objections: list[str]
    reason: str


class RiskEntry(StrictModel):
    advisor_id: str
    risk: str
    likelihood: str
    impact: str
    mitigation: str


class ExecutionEvent(StrictModel):
    stage: Literal["independent", "challenge", "revision", "synthesis"]
    actor: str
    started_at: str
    completed_at: str


class DecisionReport(StrictModel):
    id: str
    created_at: str
    organization: str
    scenario: Scenario
    simulation: bool
    demo_evidence: bool
    provider: str
    configuration_version: str
    advisor_versions: dict[str, str]
    stages: list[str] = Field(min_length=6, max_length=6)
    execution_trace: list[ExecutionEvent] = Field(min_length=12, max_length=12)
    initial: list[Assessment] = Field(min_length=5, max_length=5)
    challenges: list[Challenge]
    revisions: list[Revision] = Field(min_length=5, max_length=5)
    dissent: list[Dissent]
    gates: list[Gate]
    policy_conflicts: list[dict]
    current_status: Literal["permissible", "conditional", "prohibited", "undetermined", "not_assessed"]
    strategic_options: list[str]
    weighted_score: float = Field(ge=1, le=5, allow_inf_nan=False)
    eligible_for_human_review: bool
    synthesis: Synthesis
    evidence: list[EvidencePassage]
    evidence_snapshot: list[EvidenceSnapshot]
    authority_notice: str
    mode_notice: str
    risk_matrix: list[RiskEntry]
