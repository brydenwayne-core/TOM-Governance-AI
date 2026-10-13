import re
from app.documents.validation.rules import latest_current


def retrieve(rows, query, advisor_id=None, demo=False, limit=8):
    terms = set(re.findall(r"[a-z]{3,}", query.lower()))
    results = []
    for row in latest_current(rows, demo):
        if advisor_id and advisor_id not in row.metadata_json["applicable_advisors"]:
            continue
        for chunk in row.chunks:
            words = set(re.findall(r"[a-z]{3,}", chunk["text"].lower()))
            score = len(terms & words)
            results.append(
                {
                    **chunk,
                    "title": row.metadata_json["title"],
                    "status": row.metadata_json["status"],
                    "authoritative": row.metadata_json["authoritative"],
                    "relevance": score,
                }
            )
    return sorted(results, key=lambda x: (-x["relevance"], x["chunk_id"]))[:limit]


def validate_citations(citations, evidence):
    available = {e["chunk_id"]: e for e in evidence}
    for c in citations:
        passage = available.get(c.chunk_id)
        if not passage or c.document_id != passage["document_id"] or c.version != passage["version"]:
            raise ValueError("Advisor cited evidence outside its supplied evidence package")
        if c.quote not in passage["text"]:
            raise ValueError("Citation quote is not an exact source passage")
