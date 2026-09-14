import io

from app.models.user import User
from app.auth_utils import get_password_hash


def _login(client, email, password):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200, response.text
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _pr_auth_headers(client, db):
    if not db.query(User).filter(User.email == "testpr@placify.ai").first():
        db.add(
            User(
                email="testpr@placify.ai",
                password_hash=get_password_hash("testpassword"),
                role="pr",
                campus_id=1,
            )
        )
        db.commit()
    return _login(client, "testpr@placify.ai", "testpassword")


def _teacher_auth_headers(client, db):
    if not db.query(User).filter(User.email == "testteacher@placify.ai").first():
        db.add(
            User(
                email="testteacher@placify.ai",
                password_hash=get_password_hash("testpassword"),
                role="teacher",
                campus_id=1,
            )
        )
        db.commit()
    return _login(client, "testteacher@placify.ai", "testpassword")


def test_pr_endpoints_require_auth(client, db):
    response = client.get("/api/v1/pr/students")
    assert response.status_code in (401, 403, 422)


def test_create_and_list_managed_students(client, db):
    headers = _pr_auth_headers(client, db)

    create_payload = {
        "name": "Test Student",
        "rollNo": "21cs999",
        "department": "CSE",
        "cgpa": "9.00",
        "batchTimeline": "2021-2025",
    }
    response = client.post("/api/v1/pr/students", json=create_payload, headers=headers)
    assert response.status_code == 201, response.text
    created = response.json()
    assert created["rollNo"] == "21CS999"
    assert created["status"] == "Unplaced"
    assert created["hasOfferLetter"] is False

    response = client.get("/api/v1/pr/students", headers=headers)
    assert response.status_code == 200
    students = response.json()
    assert any(s["rollNo"] == "21CS999" for s in students)


def test_pr_offer_flow_end_to_end(client, db):
    pr_headers = _pr_auth_headers(client, db)
    teacher_headers = _teacher_auth_headers(client, db)

    # PR registers a student into their cohort
    create_res = client.post(
        "/api/v1/pr/students",
        json={"name": "Flow Test Student", "rollNo": "21cs123", "department": "CSE"},
        headers=pr_headers,
    )
    assert create_res.status_code == 201
    student_id = create_res.json()["id"]

    # PR looks up a faculty reviewer to assign
    roster_res = client.get("/api/v1/pr/faculty-roster", headers=pr_headers)
    assert roster_res.status_code == 200
    faculty_roster = roster_res.json()
    assert len(faculty_roster) >= 1
    faculty_id = faculty_roster[0]["id"]

    # PR reports the offer with the file attached directly
    file_content = b"%PDF-1.4 fake offer letter content for testing"
    offer_res = client.post(
        f"/api/v1/pr/students/{student_id}/request-offer",
        files={"file": ("offer.pdf", io.BytesIO(file_content), "application/pdf")},
        data={
            "company": "Test Company Inc",
            "role": "Software Engineer",
            "offer_type": "Full-time",
            "incharge_faculty_id": str(faculty_id),
        },
        headers=pr_headers,
    )
    assert offer_res.status_code == 200, offer_res.text
    updated_student = offer_res.json()
    assert updated_student["hasOfferLetter"] is True
    assert updated_student["status"] == "Letter_Uploaded"
    # Extraction ran synchronously under TESTING=true and populated company/role
    assert updated_student["company"] is not None
    assert updated_student["role"] is not None

    # The assigned faculty can see it in their queue
    queue_res = client.get("/api/v1/faculty/queue", headers=teacher_headers)
    assert queue_res.status_code == 200
    queue = queue_res.json()
    assert any(item["managed_student_id"] == int(student_id) for item in queue)
    queue_item = next(item for item in queue if item["managed_student_id"] == int(student_id))
    assert queue_item["status"] == "needs_review"

    # Faculty verifies it via the existing documents endpoint
    verify_res = client.post(
        f"/api/v1/documents/{queue_item['id']}/verify",
        json={"action": "approve"},
        headers=teacher_headers,
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["status"] == "verified"


def test_get_and_update_cohort_allocations(client, db):
    headers = _pr_auth_headers(client, db)

    response = client.get("/api/v1/pr/cohort-allocations", headers=headers)
    assert response.status_code == 200
    allocations = response.json()
    assert len(allocations) >= 5

    update_payload = {
        "studentsPerPR": 18,
        "notes": "Updated by test",
    }
    put_res = client.put(
        "/api/v1/pr/cohort-allocations/prog-cse", json=update_payload, headers=headers
    )
    assert put_res.status_code == 200
    updated_alloc = put_res.json()
    assert updated_alloc["studentsPerPR"] == 18
