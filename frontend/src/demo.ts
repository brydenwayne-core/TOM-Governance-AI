import data from "./demo-data.json";
import type { Report, Scenario, Profile, Source } from "./types";
export const profiles: Profile[] = data.profiles;
export const documents: Source[] = data.documents;
export const sample = data.report as Report;
export function simulate(scenario: Scenario): Report {
  if (
    Object.keys(scenario.weights).sort().join(",") !==
      profiles
        .map((p) => p.id)
        .sort()
        .join(",") ||
    Object.values(scenario.weights).some(
      (v) => !Number.isFinite(v) || v < 0 || v > 100,
    ) ||
    Math.abs(Object.values(scenario.weights).reduce((a, b) => a + b, 0) - 100) >
      0.001
  )
    throw new Error("Weights must sum to 100.");
  if (
    scenario.document_ids.some(
      (id) => !documents.some((d) => d.document_id === id),
    )
  )
    throw new Error("Unknown evidence selection.");
  const r = structuredClone(sample);
  r.id = crypto.randomUUID();
  r.created_at = new Date().toISOString();
  r.scenario = structuredClone(scenario);
  for (const event of r.execution_trace) event.started_at = event.completed_at = r.created_at;
  r.synthesis.summary = `Illustrative simulation of “${scenario.title}”. It demonstrates the workflow and does not interpret or validate the proposal.`;
  const deficit = scenario.budget > scenario.projected_revenue;
  const f = r.initial.find((a) => a.advisor_id === "finance")!;
  f.score = deficit ? 2 : 3.5;
  f.position = deficit ? "oppose" : "conditional";
  f.risks = ["Revenue is unverified; validate costs and identify funding."];
  if (deficit)
    f.risks.push("Budget exceeds projected revenue; funding source missing.");
  const revision = r.revisions.find(
    (x) => x.assessment.advisor_id === "finance",
  )!;
  revision.assessment = structuredClone(f);
  revision.assessment.score = deficit ? 2 : 3;
  revision.changed = !deficit;
  revision.reason = deficit
    ? "Maintained opposition pending funding."
    : "Added conservation cost sensitivity.";
  revision.remaining_objections = [...f.risks];
  const selected = scenario.document_ids.length
    ? new Set(scenario.document_ids)
    : new Set(documents.map((d) => d.document_id));
  for (const a of [...r.initial, ...r.revisions.map((x) => x.assessment)])
    a.citations = a.citations.filter((c) => selected.has(c.document_id));
  r.evidence = r.evidence.filter((e) => selected.has(e.document_id));
  r.evidence_snapshot = r.evidence_snapshot.filter((e) =>
    selected.has(e.metadata.document_id),
  );
  for (const a of [...r.initial, ...r.revisions.map((x) => x.assessment)]) {
    if (scenario.mode === "current") a.strategic_possibilities = [];
    if (scenario.mode === "strategic")
      a.current_state = "Not assessed in strategic-only mode.";
  }
  r.dissent = r.revisions
    .filter((x) => x.remaining_objections.length)
    .map((x) => ({
      advisor_id: x.assessment.advisor_id,
      position: x.assessment.position,
      objections: x.remaining_objections,
      reason: x.reason,
    }));
  r.risk_matrix = r.revisions.flatMap((x) =>
    x.assessment.risks.map((risk) => ({
      advisor_id: x.assessment.advisor_id,
      risk,
      likelihood: "unassessed",
      impact: "requires human review",
      mitigation: "Resolve advisor conditions before implementation",
    })),
  );
  r.weighted_score =
    Math.round(
      r.revisions.reduce(
        (sum, x) =>
          sum +
          (x.assessment.score * scenario.weights[x.assessment.advisor_id]) /
            100,
        0,
      ) * 100,
    ) / 100;
  r.current_status =
    scenario.mode === "strategic" ? "not_assessed" : "undetermined";
  r.strategic_options =
    scenario.mode === "current" ? [] : r.synthesis.alternatives;
  return r;
}
