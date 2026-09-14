import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_pr_students():
    response = client.get("/api/v1/pr/students")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 15
    # Verify first student has photoUrl
    assert "photoUrl" in data[0]
    assert data[0]["photoUrl"] is not None


def test_filter_pr_students():
    response = client.get("/api/v1/pr/students?department=CSE&status=Verified_Placed")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    for student in data:
        assert student["department"] == "CSE"
        assert student["status"] == "Verified_Placed"


def test_update_student_offer():
    update_payload = {
        "company": "Amazon AWS",
        "role": "Cloud Architect Intern",
        "packageLPA": 29.5,
        "assignedFaculty": "Dr. Anita Desai (HOD)",
        "offerFileName": "AWS_Offer_Letter.pdf",
        "status": "Letter_Uploaded",
    }
    response = client.put("/api/v1/pr/students/s-01", json=update_payload)
    assert response.status_code == 200
    updated = response.json()
    assert updated["company"] == "Amazon AWS"
    assert updated["packageLPA"] == 29.5
    assert updated["hasOfferLetter"] is True


def test_get_and_update_cohort_allocations():
    # Fetch allocations
    response = client.get("/api/v1/pr/cohort-allocations")
    assert response.status_code == 200
    allocations = response.json()
    assert len(allocations) >= 5

    # Update CSE allocation
    update_payload = {
        "studentsPerPR": 18,
        "notes": "Updated by test",
    }
    put_res = client.put("/api/v1/pr/cohort-allocations/prog-cse", json=update_payload)
    assert put_res.status_code == 200
    updated_alloc = put_res.json()
    assert updated_alloc["studentsPerPR"] == 18
