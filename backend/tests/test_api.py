import io
import pytest

def test_login(client):
    # Success login
    res = client.post("/api/v1/auth/login", json={"email": "testteacher@placify.ai", "password": "testpassword"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "testteacher@placify.ai"
    assert data["user"]["role"] == "teacher"

    token = data["access_token"]
    res_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    assert res_me.json()["email"] == "testteacher@placify.ai"

    # Failed login
    res_fail = client.post("/api/v1/auth/login", json={"email": "testteacher@placify.ai", "password": "wrongpassword"})
    assert res_fail.status_code == 401

def test_batch_upload_and_verification_flow(client, auth_headers):
    # 1. Upload Batch of offer letters
    files = [
        ("files", ("offer1.pdf", io.BytesIO(b"%PDF-1.4 Mock Offer Letter 1 Content"), "application/pdf")),
        ("files", ("offer2.pdf", io.BytesIO(b"%PDF-1.4 Mock Offer Letter 2 Content"), "application/pdf")),
    ]
    res = client.post("/api/v1/batches", files=files, headers=auth_headers)
    assert res.status_code == 202
    batch_data = res.json()
    batch_id = batch_data["id"]
    assert batch_data["file_count"] == 2

    # 2. List Batches
    res_list = client.get("/api/v1/batches", headers=auth_headers)
    assert res_list.status_code == 200
    batches = res_list.json()
    assert any(b["id"] == batch_id for b in batches)

    # 3. List Documents in Batch
    res_docs = client.get(f"/api/v1/batches/{batch_id}/documents", headers=auth_headers)
    assert res_docs.status_code == 200
    docs = res_docs.json()
    assert len(docs) == 2
    doc1_id = docs[0]["id"]
    doc2_id = docs[1]["id"]

    # 4. Get Document Details (Extraction)
    res_detail = client.get(f"/api/v1/documents/{doc1_id}", headers=auth_headers)
    assert res_detail.status_code == 200
    detail = res_detail.json()
    assert detail["id"] == doc1_id
    assert "extraction" in detail
    assert detail["extraction"]["student_name"] is not None

    # 5. Approve Document 1
    res_verify1 = client.post(
        f"/api/v1/documents/{doc1_id}/verify",
        json={"action": "approve"},
        headers=auth_headers
    )
    assert res_verify1.status_code == 200
    assert res_verify1.json()["status"] == "verified"

    # 6. Edit Document 2
    res_verify2 = client.post(
        f"/api/v1/documents/{doc2_id}/verify",
        json={
            "action": "edit",
            "student_name": "Corrected Student Name",
            "company": "Corrected Tech Corp",
            "package": 25.0,
            "role": "Lead Architect",
            "offer_type": "Full-time"
        },
        headers=auth_headers
    )
    assert res_verify2.status_code == 200
    assert res_verify2.json()["status"] == "verified"

    # Verify updated extractions for Document 2
    res_detail2 = client.get(f"/api/v1/documents/{doc2_id}", headers=auth_headers)
    assert res_detail2.json()["extraction"]["student_name"] == "Corrected Student Name"

    # 7. Export Verified Documents
    # JSON export
    res_export = client.post(f"/api/v1/batches/{batch_id}/export?format=json", headers=auth_headers)
    assert res_export.status_code == 200
    export_json = res_export.json()
    assert export_json["exported_count"] == 2

    # CSV export
    res_csv = client.post(f"/api/v1/batches/{batch_id}/export?format=csv", headers=auth_headers)
    assert res_csv.status_code == 200
    assert "text/csv" in res_csv.headers["content-type"]
    assert "student_name" in res_csv.text


def test_request_id_header_and_logging_correlation(client):
    # Test request ID propagation and generation
    res = client.get("/health")
    assert res.status_code == 200
    assert "x-request-id" in res.headers

    # Test custom passed request ID preservation
    custom_id = "custom-test-trace-999"
    res_custom = client.get("/health", headers={"X-Request-ID": custom_id})
    assert res_custom.status_code == 200
    assert res_custom.headers.get("x-request-id") == custom_id

