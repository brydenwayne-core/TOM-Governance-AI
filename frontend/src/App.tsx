import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  LayoutDashboard,
  Users,
  FileText,
  History,
  Settings,
  ShieldCheck,
  Scale,
  Sparkles,
  Check,
  Download,
  ChevronRight,
  X,
  LoaderCircle,
  BookOpen,
  CircleHelp,
  SlidersHorizontal,
} from "lucide-react";
import type { Report, Scenario, Source, Profile, HistoryItem } from "./types";
import {
  profiles as demoProfiles,
  documents as demoDocuments,
  sample,
  simulate,
} from "./demo";
import { api, download } from "./api";
import type { Connection } from "./api";

type Page =
  | "Overview"
  | "New scenario"
  | "Advisors"
  | "Source register"
  | "Decision history"
  | "Connection";
const sections: { name: Page; icon: typeof Users }[] = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "New scenario", icon: Plus },
  { name: "Advisors", icon: Users },
  { name: "Source register", icon: FileText },
  { name: "Decision history", icon: History },
];
const initials = ["MI", "FS", "GR", "AP", "CD"];
const names: Record<string, string> = {
  mission: "Mission",
  finance: "Finance",
  "governance-risk": "Governance",
  preservation: "Preservation",
  community: "Community",
};
const presets = [
  {
    title: "Expand educational programming at TOM House",
    proposal: sample.scenario.proposal,
    budget: 12000,
    projected_revenue: 18000,
  },
  {
    title: "Digitize and open a collection archive",
    proposal:
      "Create a digital collection archive with rights clearance, conservation oversight and accessible educational interpretation for community members.",
    budget: 24000,
    projected_revenue: 8000,
  },
  {
    title: "Build an inclusive community artist program",
    proposal:
      "Launch accessible artist workshops with subsidized participation, volunteer engagement, preservation controls and a sustainable donor funding plan.",
    budget: 9000,
    projected_revenue: 14000,
  },
];
function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
function AdvisorCards({
  profiles,
  onSelect,
}: {
  profiles: Profile[];
  onSelect: () => void;
}) {
  return (
    <div className="advisor-grid">
      {profiles.map((p, i) => (
        <button
          key={p.id}
          className={`advisor-card accent-${i}`}
          onClick={onSelect}
        >
          <div className="advisor-top">
            <span className="avatar">{initials[i]}</span>
            <span className="code">{p.code}</span>
          </div>
          <h3>{p.name}</h3>
          <p>{p.mandate}</p>
          <span className="advisor-foot">
            <span className="dot" />
            Configured advisor <ArrowUpRight size={15} />
          </span>
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("Overview");
  const [profiles, setProfiles] = useState(demoProfiles);
  const [sources, setSources] = useState<Source[]>(demoDocuments);
  const [scenario, setScenario] = useState<Scenario>(
    structuredClone(sample.scenario),
  );
  const [report, setReport] = useState<Report | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [localReports, setLocalReports] = useState<Record<string, Report>>({});
  const [connection, setConnection] = useState<Connection | null>(null);
  const [url, setUrl] = useState(
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  );
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("Recommendation");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState("");
  const [notice, setNotice] = useState("");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [comparison, setComparison] = useState<Report[]>([]);
  const go = (p: Page) => {
    setPage(p);
    setReport(null);
    setError("");
    setNotice("");
    setComparison([]);
  };
  const change = <K extends keyof Scenario>(key: K, value: Scenario[K]) =>
    setScenario((s) => ({ ...s, [key]: value }));
  async function run(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = connection
        ? await api.run(connection, scenario)
        : simulate(scenario);
      setReport(result);
      setTab("Recommendation");
      setLocalReports((x) => ({ ...x, [result.id]: result }));
      if (connection) setHistory(await api.history(connection));
      else
        setHistory((x) => [
          {
            id: result.id,
            title: result.scenario.title,
            created_at: result.created_at,
            current_status: result.current_status,
            weighted_score: result.weighted_score,
          },
          ...x,
        ]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function connect(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const c = { url, token };
      const [p, d, h] = await Promise.all([
        api.profiles(c),
        api.documents(c),
        api.history(c),
      ]);
      setConnection(c);
      setProfiles(p);
      setSources(d);
      setHistory(h);
      setLocalReports({});
      setCompareIds([]);
      setReport(null);
      setScenario(structuredClone(sample.scenario));
      setNotice("Backend connected. Token stays in memory for this tab only.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function upload(event: FormEvent) {
    event.preventDefault();
    if (!connection || !uploadFile) return;
    setBusy(true);
    setError("");
    try {
      await api.upload(connection, uploadFile, metadata);
      setSources(await api.documents(connection));
      setNotice("Document ingested and indexed. Versions are immutable.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function open(id: string) {
    setBusy(true);
    setError("");
    try {
      setReport(
        connection ? await api.report(connection, id) : localReports[id],
      );
      setTab("Recommendation");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function compare() {
    setBusy(true);
    setError("");
    try {
      setComparison(
        await Promise.all(
          compareIds.map((id) =>
            connection
              ? api.report(connection, id)
              : Promise.resolve(localReports[id]),
          ),
        ),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const sourceName = (id: string) =>
    sources.find((d) => d.document_id === id)?.title || id;
  const simulation = report?.simulation ?? !connection;
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <aside className="sidebar">
        <button
          className="brand"
          onClick={() => go("Overview")}
          aria-label="TOM Governance AI home"
        >
          <span className="brand-mark">
            TOM<span>·</span>
          </span>
          <span className="brand-sub">GOVERNANCE AI</span>
        </button>
        <div className="workspace">
          <span className="workspace-icon">T</span>
          <div>
            <strong>TOM House</strong>
            <small>Governance workbench</small>
          </div>
          <ChevronRight size={14} />
        </div>
        <span className="nav-label">WORKSPACE</span>
        <nav aria-label="Main navigation">
          {sections.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => go(name)}
              className={page === name ? "active" : ""}
            >
              <Icon size={18} />
              {name}
              {name === "New scenario" && <span className="nav-plus">+</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="advisory-card">
            <ShieldCheck size={21} />
            <strong>Intelligence with integrity.</strong>
            <p>
              Independent perspectives.
              <br />
              Human decision authority.
            </p>
            <span>
              Governance charter v0.1 <ArrowUpRight size={13} />
            </span>
          </div>
          <button className="settings-link" onClick={() => go("Connection")}>
            <Settings size={17} />
            Backend connection
          </button>
          <div className="sidebar-status">
            <span className="dot" />
            {connection ? "API connected" : "Demonstration workspace"}
            <Badge>v0.1</Badge>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{report ? "Decision report" : page}</strong>
          </div>
          <div className="topbar-right">
            <button
              aria-label="Manage connection"
              onClick={() => go("Connection")}
            >
              <Badge tone="green">
                {connection ? "Connected API" : "Demo mode"}
              </Badge>
            </button>
            <span className="topbar-divider" />
            <CircleHelp size={18} />
            <span className="user-avatar">TH</span>
          </div>
        </header>
        <main id="main">
          <div className="demo-notice">
            <BookOpen size={15} />
            {connection
              ? "Connected workspace. All outputs remain advisory; source authority is shown in each report."
              : "Demonstration workspace · Fictional documents and illustrative simulations. No authentic Foundation policies."}
          </div>
          {error && (
            <div className="message error" role="alert">
              {error}
              <button aria-label="Dismiss error" onClick={() => setError("")}>
                <X size={16} />
              </button>
            </div>
          )}
          {notice && (
            <div className="message success" role="status">
              {notice}
            </div>
          )}
          {report ? (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">
                    DECISION INTELLIGENCE /{" "}
                    {simulation ? "SIMULATION" : "AI ADVISORY"}
                  </span>
                  <h1>{report.scenario.title}</h1>
                  <p>{report.authority_notice}</p>
                </div>
                <button className="secondary" onClick={() => download(report)}>
                  <Download size={16} />
                  Export JSON
                </button>
              </div>
              <div className="report-stats">
                <div>
                  <span>Mode A · current-state</span>
                  <strong>{report.current_status.replace("_", " ")}</strong>
                </div>
                <div>
                  <span>Illustrative weighted score</span>
                  <strong>
                    {report.weighted_score.toFixed(2)} <small>/ 5</small>
                  </strong>
                </div>
                <div>
                  <span>Unresolved dissent</span>
                  <strong>{report.dissent.length} perspectives</strong>
                </div>
                <div>
                  <span>Authority</span>
                  <strong>Human approval required</strong>
                </div>
              </div>
              <div className="tabs" role="tablist" aria-label="Report sections">
                {[
                  "Recommendation",
                  "Advisor perspectives",
                  "Deliberation & dissent",
                  "Evidence & risks",
                  "Roadmap & metrics",
                ].map((t) => (
                  <button
                    role="tab"
                    aria-selected={tab === t}
                    key={t}
                    onClick={() => setTab(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <section className="report-content" role="tabpanel">
                {tab === "Recommendation" && (
                  <>
                    <div className="panel recommendation">
                      <span className="eyebrow">EXECUTIVE SUMMARY</span>
                      <h2>A considered path forward.</h2>
                      <p>{report.synthesis.summary}</p>
                      <h3>Final advisory recommendation</h3>
                      <p>{report.synthesis.recommendation}</p>
                      <div className="callout">
                        <Scale size={20} />
                        <p>
                          Scores inform discussion. They never override
                          mandatory gates or authorize implementation.
                        </p>
                      </div>
                    </div>
                    <div className="two-col">
                      <div className="panel">
                        <h3>Mode A · current-state governance</h3>
                        <Badge tone="amber">{report.current_status}</Badge>
                        <ul>
                          {report.gates.map((g, i) => (
                            <li key={i}>
                              <strong>
                                {g.category} · {g.severity}
                              </strong>
                              <p>{g.reason}</p>
                              <small>
                                {g.verified
                                  ? "Evidence-backed advisory finding"
                                  : "Unverified / review required"}
                              </small>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="panel">
                        <h3>Mode B · strategic possibilities</h3>
                        {report.scenario.mode === "current" ? (
                          <p>Not assessed in current-state-only mode.</p>
                        ) : (
                          <ul>
                            {report.strategic_options.map((x) => (
                              <li key={x}>{x}</li>
                            ))}
                          </ul>
                        )}
                        <h3>Areas of agreement</h3>
                        <ul>
                          {report.synthesis.agreements.map((x) => (
                            <li key={x}>{x}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                )}
                {tab === "Advisor perspectives" &&
                  report.initial.map((a, i) => {
                    const r = report.revisions.find(
                      (x) => x.assessment.advisor_id === a.advisor_id,
                    )!;
                    return (
                      <article
                        className={`panel perspective accent-${i}`}
                        key={a.advisor_id}
                      >
                        <div className="section-heading">
                          <h2>{names[a.advisor_id]}</h2>
                          <Badge>{r.assessment.position}</Badge>
                        </div>
                        <div className="two-col">
                          <div>
                            <h3>Independent assessment · {a.position}</h3>
                            <p>{a.rationale}</p>
                            <h4>Assumptions</h4>
                            <ul>
                              {a.assumptions.map((x) => (
                                <li key={x}>{x}</li>
                              ))}
                            </ul>
                            <h4>Missing evidence</h4>
                            <ul>
                              {a.evidence_gaps.map((x) => (
                                <li key={x}>{x}</li>
                              ))}
                            </ul>
                            <h4>Potential benefits</h4>
                            <ul>
                              {a.benefits.map((x) => (
                                <li key={x}>{x}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h3>
                              {r.changed ? "Revised" : "Maintained"} position ·{" "}
                              {r.assessment.score}/5
                            </h3>
                            <p>{r.reason}</p>
                            <p>{r.assessment.rationale}</p>
                            <ul>
                              {r.remaining_objections.map((x) => (
                                <li key={x}>{x}</li>
                              ))}
                            </ul>
                            <h4>
                              {report.scenario.mode === "strategic"
                                ? "Current-state not assessed"
                                : "Current-state interpretation"}
                            </h4>
                            {report.scenario.mode !== "strategic" && (
                              <p>{r.assessment.current_state}</p>
                            )}
                            {report.scenario.mode !== "current" && (
                              <>
                                <h4>Strategic possibilities</h4>
                                <ul>
                                  {r.assessment.strategic_possibilities.map(
                                    (x) => (
                                      <li key={x}>{x}</li>
                                    ),
                                  )}
                                </ul>
                              </>
                            )}
                          </div>
                        </div>
                        <details>
                          <summary>
                            Source citations ({a.citations.length})
                          </summary>
                          {a.citations.map((c) => (
                            <blockquote key={c.chunk_id}>
                              <strong>
                                {sourceName(c.document_id)} · {c.chunk_id}
                              </strong>
                              <p>{c.quote}</p>
                            </blockquote>
                          ))}
                        </details>
                      </article>
                    );
                  })}
                {tab === "Deliberation & dissent" && (
                  <>
                    <div className="panel">
                      <h2>Structured challenge round</h2>
                      <div className="timeline">
                        {report.challenges.map((c, i) => (
                          <article key={i}>
                            <span className="step-number">{i + 1}</span>
                            <div>
                              <Badge>
                                {names[c.from_advisor]} → {names[c.to_advisor]}
                              </Badge>
                              <h3>{c.concern}</h3>
                              <p>{c.response}</p>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                    <div className="panel">
                      <h2>Dissent register</h2>
                      <p>
                        Material objections remain visible even when other
                        advisors favor a proposal.
                      </p>
                      {report.dissent.map((d) => (
                        <div className="dissent-row" key={d.advisor_id}>
                          <strong>
                            {names[d.advisor_id]}{" "}
                            <Badge
                              tone={d.position === "oppose" ? "red" : "amber"}
                            >
                              {d.position}
                            </Badge>
                          </strong>
                          <ul>
                            {d.objections.map((x) => (
                              <li key={x}>{x}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {tab === "Evidence & risks" && (
                  <>
                    <div className="panel">
                      <h2>Source-of-truth snapshot</h2>
                      <p>
                        Source content and metadata are evidence, never
                        executable instructions.
                      </p>
                      {report.evidence_snapshot.map((s) => (
                        <details key={s.metadata.document_id}>
                          <summary>
                            {s.metadata.title} · v{s.metadata.version} ·{" "}
                            {s.metadata.status}
                          </summary>
                          <p>
                            Authority:{" "}
                            {s.metadata.authoritative
                              ? "verified authoritative source"
                              : "non-authoritative"}{" "}
                            · {s.metadata.approval_status}
                          </p>
                          <code className="hash">SHA-256 {s.sha256}</code>
                        </details>
                      ))}
                      {report.evidence.map((e) => (
                        <blockquote key={e.chunk_id}>
                          <strong>
                            {e.chunk_id} · {e.status}
                          </strong>
                          <p>{e.text}</p>
                        </blockquote>
                      ))}
                    </div>
                    <div className="panel">
                      <h2>Risk & opportunity register</h2>
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Advisor</th>
                              <th>Risk</th>
                              <th>Likelihood / impact</th>
                              <th>Mitigation</th>
                            </tr>
                          </thead>
                          <tbody>
                            {report.risk_matrix.map((r, i) => (
                              <tr key={i}>
                                <td>{names[r.advisor_id]}</td>
                                <td>{r.risk}</td>
                                <td>
                                  {r.likelihood} / {r.impact}
                                </td>
                                <td>{r.mitigation}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
                {tab === "Roadmap & metrics" && (
                  <>
                    <div className="panel">
                      <h2>Implementation roadmap</h2>
                      {report.synthesis.actions.map((a, i) => (
                        <div className="action-row" key={a.action}>
                          <span className="step-number">{i + 1}</span>
                          <div>
                            <h3>{a.action}</h3>
                            <p>
                              {a.owner} · {a.milestone}
                            </p>
                            <small>Dependency: {a.dependency}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="panel">
                      <h2>Measurement framework</h2>
                      <div className="two-col">
                        {report.synthesis.metrics.map((m) => (
                          <div className="metric" key={m.name}>
                            <h3>{m.name}</h3>
                            <p>{m.target}</p>
                            <small>Proposed owner: {m.owner}</small>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </section>
              <p className="provenance">
                Generated {new Date(report.created_at).toLocaleString()} ·{" "}
                {report.provider} · configuration {report.configuration_version}{" "}
                · {report.id}
              </p>
            </>
          ) : (
            <>
              {page === "Overview" && (
                <>
                  <div className="page-heading">
                    <div>
                      <span className="eyebrow">THE GOVERNANCE WORKBENCH</span>
                      <h1>
                        Five perspectives.
                        <br />
                        <em>One shared mission.</em>
                      </h1>
                      <p>
                        Thoughtful decisions begin with independent thinking.
                        <br />
                        Explore possibilities. Challenge assumptions. Preserve
                        dissent.
                      </p>
                    </div>
                    <button
                      className="primary"
                      onClick={() => go("New scenario")}
                    >
                      <Plus size={17} />
                      New scenario
                    </button>
                  </div>
                  <div className="overview-stats">
                    <div>
                      <span className="stat-icon">
                        <Users size={21} />
                      </span>
                      <div>
                        <strong>05</strong>
                        <span>Independent advisors</span>
                      </div>
                    </div>
                    <div>
                      <span className="stat-icon">
                        <Scale size={21} />
                      </span>
                      <div>
                        <strong>02</strong>
                        <span>Governance modes</span>
                      </div>
                    </div>
                    <div>
                      <span className="stat-icon">
                        <FileText size={21} />
                      </span>
                      <div>
                        <strong>
                          {String(sources.length).padStart(2, "0")}
                        </strong>
                        <span>Knowledge sources</span>
                      </div>
                    </div>
                    <div>
                      <span className="stat-icon">
                        <ShieldCheck size={21} />
                      </span>
                      <div>
                        <strong>Human</strong>
                        <span>Decision authority</span>
                      </div>
                    </div>
                  </div>
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">YOUR ADVISORY BOARD</span>
                      <h2>Distinct mandates. Shared responsibility.</h2>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => go("Advisors")}
                    >
                      Explore advisors <ArrowUpRight size={16} />
                    </button>
                  </div>
                  <AdvisorCards
                    profiles={profiles}
                    onSelect={() => go("Advisors")}
                  />
                  <div className="overview-bottom">
                    <section className="featured">
                      <div>
                        <Badge>START A CONVERSATION</Badge>
                        <h2>
                          What’s the next
                          <br />
                          right step for TOM House?
                        </h2>
                        <p>
                          Test a proposal with five perspectives and a
                          structured, transparent deliberation.
                        </p>
                        <button
                          className="primary"
                          onClick={() => {
                            setScenario(structuredClone(sample.scenario));
                            go("New scenario");
                          }}
                        >
                          Explore an educational pilot <ArrowRight size={16} />
                        </button>
                      </div>
                      <div className="orbit" aria-hidden="true">
                        <div className="orbit-ring" />
                        <span className="orbit-core">TOM</span>
                        {initials.map((n, i) => (
                          <span className={`orbit-node node-${i}`} key={n}>
                            {n}
                          </span>
                        ))}
                      </div>
                    </section>
                    <section className="panel process">
                      <span className="eyebrow">HOW IT WORKS</span>
                      <h2>From question to clarity.</h2>
                      {[
                        {
                          title: "Frame the decision",
                          desc: "A clear proposal and shared evidence.",
                        },
                        {
                          title: "Hear every perspective",
                          desc: "Independent analysis, then structured debate.",
                        },
                        {
                          title: "Find a responsible path",
                          desc: "Dissent, approval gates and measurable next steps.",
                        },
                      ].map((x, i) => (
                        <div className="process-step" key={x.title}>
                          <span>0{i + 1}</span>
                          <div>
                            <h3>{x.title}</h3>
                            <p>{x.desc}</p>
                          </div>
                        </div>
                      ))}
                    </section>
                  </div>
                  <div className="principle">
                    <ShieldCheck size={16} />
                    <span>
                      Advisory intelligence. Real accountability. Every decision
                      remains with human leadership.
                    </span>
                    <span>CHARTER v0.1</span>
                  </div>
                </>
              )}
              {page === "New scenario" && (
                <>
                  <div className="page-heading">
                    <div>
                      <span className="eyebrow">SCENARIO INTAKE</span>
                      <h1>Frame the decision.</h1>
                      <p>
                        Give every advisor the same question, context and
                        evidence.
                      </p>
                    </div>
                    <Badge>
                      {connection
                        ? "Backend execution"
                        : "Illustrative simulation"}
                    </Badge>
                  </div>
                  {!connection && (
                    <div className="callout">
                      <Sparkles size={18} />
                      <p>
                        Demo results illustrate a fixed governance workflow.
                        They do not interpret your proposal as an AI model
                        would.
                      </p>
                    </div>
                  )}
                  <div className="scenario-layout">
                    <form onSubmit={run} className="panel scenario-form">
                      <label>
                        Decision title
                        <input
                          value={scenario.title}
                          minLength={3}
                          maxLength={160}
                          required
                          onChange={(e) => change("title", e.target.value)}
                        />
                      </label>
                      <label>
                        Proposal or challenge
                        <textarea
                          value={scenario.proposal}
                          minLength={20}
                          maxLength={12000}
                          required
                          rows={5}
                          onChange={(e) => change("proposal", e.target.value)}
                        />
                      </label>
                      <label>
                        Desired organizational outcome
                        <textarea
                          value={scenario.desired_outcome}
                          minLength={3}
                          maxLength={2000}
                          required
                          rows={2}
                          onChange={(e) =>
                            change("desired_outcome", e.target.value)
                          }
                        />
                      </label>
                      <div className="two-col">
                        <label>
                          Planning horizon
                          <select
                            value={scenario.horizon}
                            onChange={(e) =>
                              change(
                                "horizon",
                                e.target.value as Scenario["horizon"],
                              )
                            }
                          >
                            <option>90-day pilot</option>
                            <option>12-month strategy</option>
                            <option>Three-year transformation</option>
                          </select>
                        </label>
                        <label>
                          Assessment scope
                          <select
                            value={scenario.mode}
                            onChange={(e) =>
                              change("mode", e.target.value as Scenario["mode"])
                            }
                          >
                            <option value="both">Both governance modes</option>
                            <option value="current">
                              Mode A · current-state only
                            </option>
                            <option value="strategic">
                              Mode B · strategic possibilities only
                            </option>
                          </select>
                        </label>
                      </div>
                      <div className="two-col">
                        <label>
                          Proposed budget (USD)
                          <input
                            type="number"
                            min="0"
                            max="1000000000000"
                            step="0.01"
                            value={scenario.budget}
                            required
                            onChange={(e) =>
                              change("budget", Number(e.target.value))
                            }
                          />
                        </label>
                        <label>
                          Projected revenue (USD)
                          <input
                            type="number"
                            min="0"
                            max="1000000000000"
                            step="0.01"
                            value={scenario.projected_revenue}
                            required
                            onChange={(e) =>
                              change(
                                "projected_revenue",
                                Number(e.target.value),
                              )
                            }
                          />
                        </label>
                      </div>
                      <details>
                        <summary>
                          <SlidersHorizontal size={16} />
                          Evidence selection & illustrative scoring weights
                        </summary>
                        <p>No selection uses all current applicable sources.</p>
                        <div className="source-checks">
                          {sources
                            .filter((s) => s.active !== false)
                            .map((s) => (
                              <label
                                className="check-label"
                                key={s.document_id}
                              >
                                <input
                                  type="checkbox"
                                  checked={scenario.document_ids.includes(
                                    s.document_id,
                                  )}
                                  onChange={(e) =>
                                    change(
                                      "document_ids",
                                      e.target.checked
                                        ? [
                                            ...scenario.document_ids,
                                            s.document_id,
                                          ]
                                        : scenario.document_ids.filter(
                                            (id) => id !== s.document_id,
                                          ),
                                    )
                                  }
                                />
                                {s.title}
                              </label>
                            ))}
                        </div>
                        <div className="weights">
                          {profiles.map((p) => (
                            <label key={p.id}>
                              {names[p.id]} (%)
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={scenario.weights[p.id]}
                                onChange={(e) =>
                                  change("weights", {
                                    ...scenario.weights,
                                    [p.id]: Number(e.target.value),
                                  })
                                }
                              />
                            </label>
                          ))}
                        </div>
                        <p>
                          Weights must total 100. Scores never override
                          governance gates.
                        </p>
                      </details>
                      <div className="form-footer">
                        <span>
                          <ShieldCheck size={15} />
                          Advisory only. No binding decisions.
                        </span>
                        <button className="primary" disabled={busy}>
                          {busy ? (
                            <>
                              <LoaderCircle className="spin" size={17} />
                              Deliberating…
                            </>
                          ) : (
                            <>
                              Run board assessment <ArrowRight size={17} />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                    <aside className="intake-aside">
                      <div className="panel">
                        <span className="eyebrow">
                          TWO LENSES. ONE QUESTION.
                        </span>
                        <h3>Mode A</h3>
                        <p>
                          What is permissible under current, verified policies
                          and authority?
                        </p>
                        <hr />
                        <h3>Mode B</h3>
                        <p>
                          What could become possible with new resources,
                          policies or human authorization?
                        </p>
                      </div>
                      <div className="panel">
                        <h3>Need a starting point?</h3>
                        {presets.map((p) => (
                          <button
                            className="preset"
                            key={p.title}
                            onClick={() => setScenario((s) => ({ ...s, ...p }))}
                          >
                            {p.title}
                            <ArrowUpRight size={16} />
                          </button>
                        ))}
                      </div>
                    </aside>
                  </div>
                </>
              )}
              {page === "Advisors" && (
                <>
                  <div className="page-heading">
                    <div>
                      <span className="eyebrow">INDEPENDENT JUDGMENT</span>
                      <h1>The advisory board.</h1>
                      <p>
                        Five configurable mandates. No simulated director has
                        decision authority.
                      </p>
                    </div>
                  </div>
                  <AdvisorCards
                    profiles={profiles}
                    onSelect={() =>
                      document
                        .getElementById("profile-details")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  />
                  <div id="profile-details" className="profile-details">
                    {profiles.map((p, i) => (
                      <article
                        className={`panel perspective accent-${i}`}
                        key={p.id}
                      >
                        <Badge>
                          {p.code} · v{p.version}
                        </Badge>
                        <h2>{p.name}</h2>
                        <p>{p.mandate}</p>
                        <div className="two-col">
                          <div>
                            <h4>Decision principles</h4>
                            <ul>
                              {p.principles.map((x) => (
                                <li key={x}>{x}</li>
                              ))}
                            </ul>
                            <h4>Constraints</h4>
                            <ul>
                              {p.constraints.map((x) => (
                                <li key={x}>{x}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4>Evidence requirements</h4>
                            <p>{p.evidence_requirements.join(", ")}</p>
                            <h4>Success measures</h4>
                            <p>{p.metrics.join(" · ")}</p>
                            <h4>Escalation</h4>
                            <p>{p.escalation.join(", ")}</p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}
              {page === "Source register" && (
                <>
                  <div className="page-heading">
                    <div>
                      <span className="eyebrow">ORGANIZATIONAL KNOWLEDGE</span>
                      <h1>Evidence before opinion.</h1>
                      <p>
                        Traceable sources. Explicit authority. Clear separation
                        of fact and fiction.
                      </p>
                    </div>
                    <Badge>{sources.length} document versions</Badge>
                  </div>
                  <div className="panel table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Document</th>
                          <th>Version</th>
                          <th>Authenticity</th>
                          <th>Authority & status</th>
                          <th>Classification</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sources.map((d) => (
                          <tr key={d.document_id + d.version}>
                            <td>
                              <strong>{d.title}</strong>
                              <small>
                                {d.document_id} · {d.document_type}
                              </small>
                            </td>
                            <td>{d.version}</td>
                            <td>
                              <Badge
                                tone={
                                  d.status === "simulated" ? "amber" : "green"
                                }
                              >
                                {d.status}
                              </Badge>
                            </td>
                            <td>
                              {d.authoritative
                                ? "Authoritative"
                                : "Non-authoritative"}
                              <small>
                                {d.active === false
                                  ? "Inactive / superseded"
                                  : d.approval_status}{" "}
                                · {d.effective_date || "No effective date"}
                              </small>
                            </td>
                            <td>{d.classification}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!sources.length && (
                      <p>
                        No documents yet. Upload approved source material below.
                      </p>
                    )}
                  </div>
                  <div className="panel">
                    <h2>Ingest a source document</h2>
                    <p>
                      Markdown, plain text, PDF or DOCX · maximum 5 MiB.
                      Metadata can be embedded as Markdown YAML front matter or
                      supplied below. Only an authorized operator may designate
                      a source as verified.
                    </p>
                    {!connection ? (
                      <div className="callout">
                        <FileText size={18} />
                        <p>
                          Uploads require the backend.{" "}
                          <button
                            className="text-button"
                            onClick={() => go("Connection")}
                          >
                            Connect a secure API <ArrowRight size={14} />
                          </button>
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={upload}>
                        <label>
                          Source file
                          <input
                            type="file"
                            accept=".md,.txt,.pdf,.docx"
                            required
                            onChange={(e) =>
                              setUploadFile(e.target.files?.[0] || null)
                            }
                          />
                        </label>
                        <label>
                          Metadata JSON (optional for Markdown with front
                          matter)
                          <textarea
                            rows={5}
                            value={metadata}
                            onChange={(e) => setMetadata(e.target.value)}
                            placeholder='{"document_id":"ORG-001", "title":"Approved mission", ...}'
                          />
                        </label>
                        <button className="primary" disabled={busy}>
                          Upload and index <ArrowRight size={16} />
                        </button>
                      </form>
                    )}
                  </div>
                </>
              )}
              {page === "Decision history" && (
                <>
                  <div className="page-heading">
                    <div>
                      <span className="eyebrow">INSTITUTIONAL MEMORY</span>
                      <h1>Decisions, with context.</h1>
                      <p>
                        {connection
                          ? "Saved backend reports and evidence snapshots."
                          : "Demo history lives only in this tab and resets on reload."}
                      </p>
                    </div>
                    <button
                      className="secondary"
                      disabled={compareIds.length !== 2 || busy}
                      onClick={compare}
                    >
                      Compare two reports
                    </button>
                  </div>
                  {!history.length ? (
                    <div className="empty-state">
                      <History size={32} />
                      <h2>Your decision record starts here.</h2>
                      <p>
                        Run an assessment to preserve perspectives, evidence and
                        dissent.
                      </p>
                      <button
                        className="primary"
                        onClick={() => go("New scenario")}
                      >
                        Create a scenario <Plus size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="panel table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Compare</th>
                            <th>Scenario</th>
                            <th>Current-state</th>
                            <th>Score</th>
                            <th>Report</th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.map((h) => (
                            <tr key={h.id}>
                              <td>
                                <input
                                  aria-label={`Compare ${h.title}`}
                                  type="checkbox"
                                  checked={compareIds.includes(h.id)}
                                  onChange={(e) =>
                                    setCompareIds((x) =>
                                      e.target.checked
                                        ? [...x.slice(-1), h.id]
                                        : x.filter((id) => id !== h.id),
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <strong>{h.title}</strong>
                                <small>
                                  {new Date(h.created_at).toLocaleString()}
                                </small>
                              </td>
                              <td>
                                <Badge tone="amber">{h.current_status}</Badge>
                              </td>
                              <td>{h.weighted_score.toFixed(2)}/5</td>
                              <td>
                                <button
                                  className="text-button"
                                  disabled={busy}
                                  onClick={() => open(h.id)}
                                >
                                  Open <ArrowUpRight size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {comparison.length === 2 && (
                    <div className="two-col">
                      {comparison.map((r) => (
                        <div className="panel" key={r.id}>
                          <h2>{r.scenario.title}</h2>
                          <Badge>{r.current_status}</Badge>
                          <p>
                            Score {r.weighted_score}/5 · {r.dissent.length}{" "}
                            dissent records · {r.gates.length} gates
                          </p>
                          <p>{r.synthesis.recommendation}</p>
                          <h3>Approval conditions</h3>
                          <ul>
                            {r.gates.map((g, i) => (
                              <li key={i}>{g.reason}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              {page === "Connection" && (
                <>
                  <div className="page-heading">
                    <div>
                      <span className="eyebrow">SECURE EXECUTION</span>
                      <h1>Connect the intelligence.</h1>
                      <p>
                        The static site keeps provider credentials on your
                        backend.
                      </p>
                    </div>
                  </div>
                  <div className="two-col">
                    <form className="panel" onSubmit={connect}>
                      <h2>Backend API</h2>
                      <label>
                        API base URL
                        <input
                          type="url"
                          required
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                        />
                      </label>
                      <label>
                        Operator bearer token
                        <input
                          type="password"
                          autoComplete="off"
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                          placeholder="Not needed for a local demo backend"
                        />
                      </label>
                      <p className="help-text">
                        Use HTTPS for remote APIs. This token grants operator
                        access; it is held in memory only and is never saved in
                        browser storage or a Pages build.
                      </p>
                      <button className="primary" disabled={busy}>
                        {busy ? (
                          <LoaderCircle size={16} className="spin" />
                        ) : (
                          <Check size={16} />
                        )}
                        Connect backend
                      </button>
                      {connection && (
                        <button
                          type="button"
                          className="secondary disconnect"
                          onClick={() => {
                            setConnection(null);
                            setToken("");
                            setProfiles(demoProfiles);
                            setSources(demoDocuments);
                            setHistory([]);
                            setLocalReports({});
                            setCompareIds([]);
                            setScenario(structuredClone(sample.scenario));
                            setNotice(
                              "Returned to fictional demonstration mode.",
                            );
                          }}
                        >
                          Disconnect
                        </button>
                      )}
                    </form>
                    <div className="panel">
                      <h2>Deployment boundaries</h2>
                      <p>
                        GitHub Pages hosts this frontend. Confidential files,
                        decision reports and OpenAI credentials belong on a
                        separately hosted authenticated backend.
                      </p>
                      <h3>Before production</h3>
                      <ul>
                        <li>
                          Configure HTTPS, operator authentication and exact
                          CORS origins.
                        </li>
                        <li>
                          Supply approved, dated organizational documents with
                          approval evidence.
                        </li>
                        <li>
                          Confirm provider configuration and data-handling
                          requirements.
                        </li>
                        <li>
                          Review with actual organizational leadership before
                          use.
                        </li>
                      </ul>
                      <p>
                        Operator-token authentication is a v0.1 baseline.
                        Enterprise identity and roles are planned integrations.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
          <footer>
            <span>TOM GOVERNANCE AI</span>
            <span>
              Built for stewardship. Designed for independent thinking.
            </span>
            <span>Advisory framework · v0.1</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
