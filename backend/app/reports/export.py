def markdown(report):
    s = report['synthesis']
    lines = [f"# {report['scenario']['title']}", "", report['authority_notice'],
        "", "**FICTIONAL SIMULATION**" if report['simulation'] else "**AI-generated advisory report**",
        f"Current-state: {report['current_status']}; score: {report['weighted_score']}/5 (not authorization).",
        "", "## Executive summary", s['summary'], "", "## Recommendation", s['recommendation'], "", "## Governance gates"]
    lines += [f"- {g['category']}: {g['reason']} ({g['severity']})" for g in report['gates']]
    for a, r in zip(report['initial'], report['revisions']):
        lines += ["", f"## Advisor: {a['advisor_id']}", f"Original: {a['position']}", a['rationale'],
            f"Revised: {r['assessment']['position']}; {r['reason']}", "Assumptions:"]
        lines += [f"- {x}" for x in a['assumptions']]
        lines += ["Evidence:"] + [f"- {c['chunk_id']}: {c['quote']}" for c in a['citations']]
    lines += ["", "## Deliberation"] + [f"- {c['from_advisor']} → {c['to_advisor']}: {c['concern']} Response: {c['response']}" for c in report['challenges']]
    lines += ["", "## Dissent"] + [f"- {d['advisor_id']}: {'; '.join(d['objections'])}" for d in report['dissent']]
    lines += ["", "## Risk matrix"] + [f"- {r['advisor_id']}: {r['risk']}; likelihood {r['likelihood']}; {r['mitigation']}" for r in report['risk_matrix']]
    lines += ["", "## Strategic options"] + [f"- {x}" for x in report['strategic_options']]
    lines += ["", "## Roadmap"] + [f"- {a['action']} — {a['owner']}; {a['milestone']}; dependency: {a['dependency']}" for a in s['actions']]
    lines += ["", "## Metrics"] + [f"- {m['name']}: {m['target']} ({m['owner']})" for m in s['metrics']]
    lines += ["", "## Provenance", f"Report: {report['id']}; generated: {report['created_at']}; provider: {report['provider']}",
        f"Configuration: {report['configuration_version']}"]
    lines += [f"- {e['metadata']['document_id']}@{e['metadata']['version']}: SHA-256 {e['sha256']}" for e in report['evidence_snapshot']]
    return "\n".join(lines).replace("<", "&lt;")
