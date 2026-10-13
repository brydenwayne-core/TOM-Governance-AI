from datetime import date
from app.models import DocumentMetadata


def is_current(metadata, demo=False):
    m = DocumentMetadata.model_validate(metadata)
    if m.effective_date and m.effective_date > date.today():
        return False
    if m.status == "simulated":
        return demo
    return m.authoritative and m.status == "verified" and m.approval_status == "approved"


def version_key(value):
    parts = [int(x) for x in value.split(".")]
    return tuple(parts + [0] * (3 - len(parts)))


def latest_current(rows, demo=False):
    selected = {}
    for row in rows:
        if not is_current(row.metadata_json, demo):
            continue
        key = row.document_id
        if key not in selected or version_key(row.version) > version_key(selected[key].version):
            selected[key] = row
    for key in selected:
        cursor = key
        visited = set()
        while cursor in selected:
            if cursor in visited:
                raise ValueError("Cyclic document supersession requires human resolution")
            visited.add(cursor)
            cursor = selected[cursor].metadata_json.get("supersedes")
    retired = {r.metadata_json.get("supersedes") for r in selected.values()}
    return [r for key, r in selected.items() if key not in retired]


def conflicts(rows):
    policies = {}
    for row in rows:
        m = row.metadata_json
        if m.get("policy_key"):
            policies.setdefault(m["policy_key"], []).append(row)
    return [
        {
            "policy_key": key,
            "documents": [r.document_id for r in group],
            "reason": "Conflicting current policy positions require human resolution",
        }
        for key, group in policies.items()
        if len({r.metadata_json["policy_position"] for r in group}) > 1
    ]
