export interface Profile {
  id: string;
  code: string;
  name: string;
  version: string;
  mandate: string;
  principles: string[];
  constraints: string[];
  evidence_requirements: string[];
  metrics: string[];
  escalation: string[];
  keywords: string[];
}
export interface Scenario {
  title: string;
  proposal: string;
  desired_outcome: string;
  horizon: "90-day pilot" | "12-month strategy" | "Three-year transformation";
  mode: "both" | "current" | "strategic";
  budget: number;
  projected_revenue: number;
  document_ids: string[];
  weights: Record<string, number>;
}
export interface Source {
  document_id: string;
  title: string;
  organization: string;
  document_type: string;
  version: string;
  status: string;
  approval_status: string;
  effective_date: string | null;
  classification: string;
  authoritative: boolean;
  applicable_advisors: string[];
  sha256: string;
  active?: boolean;
  chunks?: number;
}
export interface Citation {
  document_id: string;
  version: string;
  chunk_id: string;
  quote: string;
}
export interface Gate {
  category: string;
  reason: string;
  severity: string;
  verified: boolean;
}
export interface Assessment {
  advisor_id: string;
  position: string;
  rationale: string;
  benefits: string[];
  risks: string[];
  assumptions: string[];
  evidence_gaps: string[];
  citations: Citation[];
  gates: Gate[];
  score: number;
  current_state: string;
  strategic_possibilities: string[];
}
export interface Revision {
  assessment: Assessment;
  changed: boolean;
  reason: string;
  remaining_objections: string[];
}
export interface Report {
  id: string;
  created_at: string;
  scenario: Scenario;
  organization: string;
  simulation: boolean;
  demo_evidence: boolean;
  provider: string;
  configuration_version: string;
  advisor_versions: Record<string, string>;
  stages: string[];
  execution_trace: {stage:string;actor:string;started_at:string;completed_at:string}[];
  initial: Assessment[];
  challenges: {
    from_advisor: string;
    to_advisor: string;
    concern: string;
    response: string;
  }[];
  revisions: Revision[];
  dissent: {
    advisor_id: string;
    position: string;
    objections: string[];
    reason: string;
  }[];
  gates: Gate[];
  current_status: string;
  strategic_options: string[];
  weighted_score: number;
  eligible_for_human_review: boolean;
  synthesis: {
    summary: string;
    recommendation: string;
    agreements: string[];
    alternatives: string[];
    actions: {
      action: string;
      owner: string;
      milestone: string;
      dependency: string;
    }[];
    metrics: { name: string; target: string; owner: string }[];
  };
  evidence: {
    document_id: string;
    version: string;
    chunk_id: string;
    text: string;
    title: string;
    status: string;
    authoritative: boolean;
    relevance: number;
  }[];
  evidence_snapshot: {
    metadata: Omit<Source, "sha256">;
    sha256: string;
    ingested_at: string;
  }[];
  authority_notice: string;
  mode_notice: string;
  risk_matrix: {
    advisor_id: string;
    risk: string;
    likelihood: string;
    impact: string;
    mitigation: string;
  }[];
}
export interface HistoryItem {
  id: string;
  title: string;
  created_at: string;
  current_status: string;
  weighted_score: number;
}
