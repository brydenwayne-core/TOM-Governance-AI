import { describe, it, expect } from "vitest";
import { simulate, sample, documents } from "./demo";
import { request } from "./api";
describe("Governance demo", () => {
  it("retains five independent and revised positions, citations, and dissent", () => {
    const r = simulate(sample.scenario);
    expect(r.initial).toHaveLength(5);
    expect(r.revisions).toHaveLength(5);
    expect(r.dissent).toHaveLength(5);
    expect(r.current_status).toBe("undetermined");
    expect(r.eligible_for_human_review).toBe(false);
    for (const a of r.initial)
      for (const c of a.citations)
        expect(
          r.evidence.find((e) => e.chunk_id === c.chunk_id)?.text,
        ).toContain(c.quote);
  });
  it("preserves financial opposition when projected funding is insufficient", () => {
    const r = simulate({ ...sample.scenario, budget: 40000 });
    expect(r.dissent.find((d) => d.advisor_id === "finance")?.position).toBe(
      "oppose",
    );
    expect(r.weighted_score).toBeLessThan(
      simulate(sample.scenario).weighted_score,
    );
  });
  it("respects mode and evidence selections", () => {
    const r = simulate({
      ...sample.scenario,
      mode: "current",
      document_ids: [documents[0].document_id],
    });
    expect(r.strategic_options).toHaveLength(0);
    expect(
      r.evidence.every((e) => e.document_id === documents[0].document_id),
    ).toBe(true);
    expect(
      simulate({ ...sample.scenario, mode: "strategic" }).current_status,
    ).toBe("not_assessed");
  });
  it("rejects invalid weights", () => {
    expect(() =>
      simulate({ ...sample.scenario, weights: { mission: 0 } }),
    ).toThrow("100");
  });
  it("rejects remote plaintext API connections before sending tokens", async () => {
    await expect(
      request({ url: "http://example.com", token: "secret" }, "/documents"),
    ).rejects.toThrow("HTTPS");
  });
});
