import json
from app import config
from app.storage import Session, DecisionRow
from test_documents import metadata


def test_health_and_authentication(client, monkeypatch):
    assert client.get("/api/health").json()["status"] == "ok"
    monkeypatch.setattr(config, "TOKEN", "a" * 32)
    assert client.get("/api/documents").status_code == 401
    assert client.get("/api/health").status_code == 200
    assert client.get("/api/documents", headers={"Authorization": "Bearer " + ("a" * 32)}).status_code == 200
    assert client.get("/api/advisors", headers={"Authorization": "Bearer wrong"}).status_code == 401


def test_decision_persistence_history_exports_and_audit(client, scenario):
    r = client.post("/api/decisions", json=scenario.model_dump())
    assert r.status_code == 201
    report = r.json()
    id = report["id"]
    assert client.get(f"/api/decisions/{id}").json() == report
    assert client.get("/api/decisions").json()[0]["id"] == id
    exported = client.get(f"/api/decisions/{id}/export")
    assert exported.status_code == 200 and "## Dissent" in exported.text and "SHA-256" in exported.text
    assert any(a["action"] == "decision.completed" for a in client.get("/api/audit").json())
    assert client.get("/api/decisions/not-a-real-id").status_code == 404


def test_cross_organization_read_is_denied(client):
    with Session() as s:
        s.add(DecisionRow(id="other-org-report", organization="other", report={"confidential": "data"}))
        s.commit()
    assert client.get("/api/decisions/other-org-report").status_code == 404
    assert client.get("/api/decisions").json() == []


def test_rejected_run_does_not_save_partial_decision(client, scenario):
    body = scenario.model_dump()
    body["document_ids"] = ["unknown"]
    assert client.post("/api/decisions", json=body).status_code == 422
    assert client.get("/api/decisions").json() == []


def test_authenticated_upload_and_retrieval(client):
    r = client.post(
        "/api/documents",
        files={"file": ("policy.txt", b"Artistic freedom requires inclusive access.")},
        data={"metadata": json.dumps(metadata())},
    )
    assert r.status_code == 201
    evidence = client.get("/api/evidence?query=artistic&advisor_id=mission").json()
    assert any(e["document_id"] == "TEST-DOC" for e in evidence)
    assert (
        client.post(
            "/api/documents", files={"file": ("policy.txt", b"Changed")}, data={"metadata": json.dumps(metadata())}
        ).status_code
        == 422
    )


def test_multipart_request_total_size_is_bounded(client):
    r = client.post(
        "/api/documents",
        content=b"x" * (6 * 1024 * 1024 + 1),
        headers={"Content-Type": "multipart/form-data; boundary=test"},
    )
    assert r.status_code == 413


def test_authentication_precedes_large_upload_parsing(client, monkeypatch):
    monkeypatch.setattr(config, "TOKEN", "b" * 32)
    r = client.post(
        "/api/documents",
        content=b"x" * (6 * 1024 * 1024 + 1),
        headers={"Content-Type": "multipart/form-data; boundary=test"},
    )
    assert r.status_code == 401
