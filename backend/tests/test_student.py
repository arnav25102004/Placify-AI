import io
import pytest
from app.database import SessionLocal
from app.models.user import User
from app.auth_utils import get_password_hash

@pytest.fixture
def student_auth_headers(client):
    db = SessionLocal()
    if not db.query(User).filter(User.email == "teststudent@placify.ai").first():
        user = User(
            email="teststudent@placify.ai",
            password_hash=get_password_hash("testpassword"),
            role="student",
            campus_id=1,
        )
        db.add(user)
        db.commit()
    db.close()

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "teststudent@placify.ai", "password": "testpassword"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_student_offer_letter_submission_and_verification(client, student_auth_headers, auth_headers):
    # 1. Student submits single offer letter
    file_data = ("file", ("my_offer_letter.pdf", io.BytesIO(b"%PDF-1.4 Student Personal Offer Letter Content"), "application/pdf"))
    res = client.post("/api/v1/student/offer-letter", files={"file": file_data[1]}, headers=student_auth_headers)
    assert res.status_code == 202
    doc_data = res.json()
    doc_id = doc_data["id"]
    assert doc_data["submission_source"] == "student_self"

    # 2. Student lists own submissions
    res_my_subs = client.get("/api/v1/student/my-submissions", headers=student_auth_headers)
    assert res_my_subs.status_code == 200
    my_subs = res_my_subs.json()
    assert any(s["id"] == doc_id for s in my_subs)

    # 3. Teacher fetches student submission detail
    res_teacher_view = client.get(f"/api/v1/documents/{doc_id}", headers=auth_headers)
    assert res_teacher_view.status_code == 200
    detail = res_teacher_view.json()
    assert detail["id"] == doc_id
    assert detail["submission_source"] == "student_self"
    assert detail["extraction"] is not None

    # 4. Teacher approves student submission
    res_verify = client.post(
        f"/api/v1/documents/{doc_id}/verify",
        json={"action": "approve"},
        headers=auth_headers
    )
    assert res_verify.status_code == 200
    assert res_verify.json()["status"] == "verified"
