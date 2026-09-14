import io
import json

import pytest
from fastapi import HTTPException

from app.models.user import User
from app.auth_utils import get_password_hash
from app.services.upload_guardrails import validate_upload, MAX_UPLOAD_SIZE_BYTES


def _login(client, email, password):
    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def _pr_auth_headers(client, db):
    if not db.query(User).filter(User.email == "guardtest_pr@placify.ai").first():
        db.add(
            User(
                email="guardtest_pr@placify.ai",
                password_hash=get_password_hash("testpassword"),
                role="pr",
                campus_id=1,
            )
        )
        db.commit()
    return _login(client, "guardtest_pr@placify.ai", "testpassword")


def _teacher_auth_headers(client, db):
    if not db.query(User).filter(User.email == "guardtest_teacher@placify.ai").first():
        db.add(
            User(
                email="guardtest_teacher@placify.ai",
                password_hash=get_password_hash("testpassword"),
                role="teacher",
                campus_id=1,
            )
        )
        db.commit()
    return _login(client, "guardtest_teacher@placify.ai", "testpassword")


def _admin_auth_headers(client, db):
    if not db.query(User).filter(User.email == "guardtest_admin@placify.ai").first():
        db.add(
            User(
                email="guardtest_admin@placify.ai",
                password_hash=get_password_hash("testpassword"),
                role="admin",
                campus_id=1,
            )
        )
        db.commit()
    return _login(client, "guardtest_admin@placify.ai", "testpassword")


# --- Upload guardrails ---------------------------------------------------

def test_validate_upload_rejects_empty():
    with pytest.raises(HTTPException) as exc_info:
        validate_upload(b"", "empty.pdf")
    assert exc_info.value.status_code == 400


def test_validate_upload_rejects_oversized():
    oversized = b"%PDF-1.4" + b"0" * (MAX_UPLOAD_SIZE_BYTES + 1)
    with pytest.raises(HTTPException) as exc_info:
        validate_upload(oversized, "huge.pdf")
    assert exc_info.value.status_code == 400
    assert "exceeds" in exc_info.value.detail


def test_validate_upload_rejects_content_not_matching_magic_bytes():
    # A .pdf filename whose actual bytes are plain text, not a real PDF —
    # this is exactly what "don't trust the client-declared content type" catches.
    with pytest.raises(HTTPException) as exc_info:
        validate_upload(b"this is not a pdf at all", "fake.pdf")
    assert exc_info.value.status_code == 400
    assert "not a recognized" in exc_info.value.detail


def test_validate_upload_accepts_real_pdf_and_png_magic_bytes():
    assert validate_upload(b"%PDF-1.4 real content", "a.pdf") == "application/pdf"
    assert validate_upload(b"\x89PNG\r\n\x1a\nrest", "a.png") == "image/png"
    assert validate_upload(b"\xff\xd8\xffrest", "a.jpg") == "image/jpeg"


def test_pr_request_offer_rejects_non_pdf_file(client, db):
    pr_headers = _pr_auth_headers(client, db)
    create_res = client.post(
        "/api/v1/pr/students",
        json={"name": "Guardrail Test Student", "rollNo": "22gr001", "department": "CSE"},
        headers=pr_headers,
    )
    student_id = create_res.json()["id"]

    offer_res = client.post(
        f"/api/v1/pr/students/{student_id}/request-offer",
        files={"file": ("offer.pdf", io.BytesIO(b"not actually a pdf"), "application/pdf")},
        data={"company": "Fake Corp", "role": "Engineer", "offer_type": "Full-time"},
        headers=pr_headers,
    )
    assert offer_res.status_code == 400


# --- Agents (deterministic mock path, no LLM keys configured under TESTING) ---

def test_fraud_agent_flags_duplicate_file(client, db):
    from app.agents import fraud_agent
    from app.models.document import Document

    doc1 = Document(
        batch_id=None, student_id=None, submission_source="pr_request",
        drive_file_id="local_dup1.pdf", drive_view_link="/x", file_hash="samehash123",
        status="pending",
    )
    doc2 = Document(
        batch_id=None, student_id=None, submission_source="pr_request",
        drive_file_id="local_dup2.pdf", drive_view_link="/x", file_hash="samehash123",
        status="pending",
    )
    db.add(doc1)
    db.add(doc2)
    db.commit()

    duplicate_flag = fraud_agent.check_duplicate(db, doc2)
    assert duplicate_flag is not None
    assert str(doc1.id) in duplicate_flag


def test_fraud_agent_company_check_deterministic_fallback():
    from app.agents import fraud_agent

    # No LLM keys configured under TESTING -> deep=True still falls through to the
    # deterministic tool call since generate_with_tools returns None.
    result = fraud_agent.assess_company("Google India", deep=True)
    assert "fraud_flags" in result
    assert result["fraud_flags"] == []  # known company, not suspicious

    suspicious = fraud_agent.assess_company("1234", deep=True)
    assert len(suspicious["fraud_flags"]) >= 1


def test_cross_verification_agent_flags_name_mismatch(client, db):
    from app.agents import cross_verification_agent
    from app.models.document import Document
    from app.models.managed_student import ManagedStudent
    from app.services.gemini_adapter import ExtractionResult

    pr_headers = _pr_auth_headers(client, db)
    pr_user = db.query(User).filter(User.email == "guardtest_pr@placify.ai").first()

    student = ManagedStudent(
        name="Rohan Mehta", roll_no="22cv001", pr_id=pr_user.id, campus_id=1, status="Unplaced"
    )
    db.add(student)
    db.commit()

    doc = Document(
        batch_id=None, student_id=None, submission_source="pr_request",
        drive_file_id="local_cv1.pdf", drive_view_link="/x", file_hash="crosshash1",
        status="pending", managed_student_id=student.id, company_name_hint="Wipro",
    )
    db.add(doc)
    db.commit()

    extraction_data = ExtractionResult(student_name="Completely Different Name", company="Wipro", confidence=0.9)
    result = cross_verification_agent.verify(doc, extraction_data, db=db)
    assert result["profile_match_score"] is not None
    assert result["profile_match_score"] < 0.6
    assert len(result["discrepancies"]) >= 1


def test_extraction_agent_produces_valid_result():
    from app.agents import extraction_agent

    result = extraction_agent.extract(b"%PDF-1.4 not a real pdf but has the header", "test.pdf", hint={"company": "Acme"})
    assert result.student_name
    assert result.company == "Acme"  # mock echoes the hint back
    assert result.field_confidence is not None


# --- Orchestrator end-to-end (mock LLM path under TESTING) ---

def test_orchestrator_full_pipeline_populates_all_new_fields(client, db):
    from app.agents.orchestrator import run_pipeline
    from app.models.document import Document
    from app.models.extraction import Extraction
    from app.models.managed_student import ManagedStudent

    pr_user = db.query(User).filter(User.email == "guardtest_pr@placify.ai").first()
    if not pr_user:
        pr_user = User(email="guardtest_pr2@placify.ai", password_hash=get_password_hash("x"), role="pr", campus_id=1)
        db.add(pr_user)
        db.commit()

    student = ManagedStudent(name="Orchestrator Test Student", roll_no="22or001", pr_id=pr_user.id, campus_id=1, status="Unplaced")
    db.add(student)
    db.commit()

    doc = Document(
        batch_id=None, student_id=None, submission_source="pr_request",
        drive_file_id="local_orch1.pdf", drive_view_link="/x", file_hash="orchhash1",
        status="pending", managed_student_id=student.id, requested_by_id=pr_user.id,
        company_name_hint="Infosys", role_title_hint="Analyst", offer_type_hint="Full-time",
    )
    db.add(doc)
    db.commit()
    doc_id = doc.id

    # Write the "uploaded" file to local storage so drive_adapter can read it back.
    from app.services.drive_adapter import drive_adapter
    upload_res = drive_adapter.upload_file(b"%PDF-1.4 orchestrator test content", "orch.pdf", "application/pdf")
    doc.drive_file_id = upload_res["drive_file_id"]
    db.commit()

    run_pipeline(doc_id, db=db)

    db.refresh(doc)
    assert doc.status == "needs_review"

    extraction = db.query(Extraction).filter(Extraction.document_id == doc_id).order_by(Extraction.id.desc()).first()
    assert extraction is not None
    assert extraction.company == "Infosys"  # hint echoed back by mock
    assert extraction.authenticity_score is not None
    assert extraction.field_confidence is not None
    assert extraction.discrepancy_summary is not None


# --- Eval metrics endpoint ---

def test_eval_metrics_requires_admin(client, db):
    teacher_headers = _teacher_auth_headers(client, db)
    response = client.get("/api/v1/admin/eval-metrics", headers=teacher_headers)
    assert response.status_code == 403


def test_eval_metrics_returns_structure(client, db):
    admin_headers = _admin_auth_headers(client, db)
    response = client.get("/api/v1/admin/eval-metrics", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    for key in (
        "total_documents", "edited_documents", "extraction_accuracy",
        "field_change_counts", "fraud_flags_labeled", "fraud_flags_confirmed",
        "fraud_flags_false_positive", "fraud_precision",
    ):
        assert key in data


# --- fraud_flag_outcome labeling on verify ---

def test_verify_with_fraud_flag_outcome(client, db):
    from app.models.document import Document
    from app.models.extraction import Extraction

    teacher_headers = _teacher_auth_headers(client, db)
    teacher = db.query(User).filter(User.email == "guardtest_teacher@placify.ai").first()

    doc = Document(
        batch_id=None, student_id=None, submission_source="pr_request",
        drive_file_id="local_ffo1.pdf", drive_view_link="/x", file_hash="ffohash1",
        status="pending", incharge_faculty_id=teacher.id,
    )
    db.add(doc)
    db.commit()
    extraction = Extraction(
        document_id=doc.id, student_name="Test Student", company="Test Co", confidence=0.9,
        fraud_flags=json.dumps(["some flag"]),
    )
    db.add(extraction)
    db.commit()

    response = client.post(
        f"/api/v1/documents/{doc.id}/verify",
        json={"action": "approve", "fraud_flag_outcome": "false_positive"},
        headers=teacher_headers,
    )
    assert response.status_code == 200

    db.refresh(extraction)
    assert extraction.fraud_flag_outcome == "false_positive"


# --- Streaming discrepancy endpoint ---

def test_discrepancy_stream_endpoint(client, db):
    from app.models.document import Document
    from app.models.extraction import Extraction

    teacher_headers = _teacher_auth_headers(client, db)
    teacher = db.query(User).filter(User.email == "guardtest_teacher@placify.ai").first()

    doc = Document(
        batch_id=None, student_id=None, submission_source="pr_request",
        drive_file_id="local_stream1.pdf", drive_view_link="/x", file_hash="streamhash1",
        status="needs_review", incharge_faculty_id=teacher.id,
    )
    db.add(doc)
    db.commit()
    extraction = Extraction(
        document_id=doc.id, student_name="Stream Student", company="Stream Co", confidence=0.9,
        fraud_flags=json.dumps(["duplicate file"]),
    )
    db.add(extraction)
    db.commit()

    response = client.get(f"/api/v1/documents/{doc.id}/discrepancy-stream", headers=teacher_headers)
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]
    body = response.text
    assert "data:" in body
    assert "event: done" in body
