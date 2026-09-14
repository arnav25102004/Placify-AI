from fastapi.testclient import TestClient

from app.main import app
from app.database import SessionLocal
from app.models.user import User
from app.auth_utils import get_password_hash

client = TestClient(app)


def _admin_auth_headers():
    # Use a short-lived, immediately-committed session — dev_db.py writes via its own
    # raw engine connection, so a long-held transaction here would deadlock SQLite's
    # single-writer lock against it.
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.email == "testadmin@placify.ai").first():
            db.add(
                User(
                    email="testadmin@placify.ai",
                    password_hash=get_password_hash("testpassword"),
                    role="admin",
                    campus_id=1,
                )
            )
            db.commit()
    finally:
        db.close()

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "testadmin@placify.ai", "password": "testpassword"},
    )
    assert response.status_code == 200, response.text
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_dev_db_requires_admin():
    response = client.get("/api/v1/dev/db/tables")
    assert response.status_code in (401, 403, 422)


def test_dev_db_tables_inspection():
    headers = _admin_auth_headers()
    response = client.get("/api/v1/dev/db/tables", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "tables" in data
    table_names = [t["name"] for t in data["tables"]]
    assert "users" in table_names
    assert "documents" in table_names
    assert "batches" in table_names


def test_dev_db_insert_and_query_flow():
    headers = _admin_auth_headers()

    # 1. Insert a custom test user
    insert_payload = {
        "data": {
            "email": "tester.dev@placify.internal",
            "password": "devpassword123",
            "role": "student",
            "campus_id": 1,
            "full_name": "Test Automation User",
            "department": "QA Engineering",
        },
        "auto_hash_passwords": True,
    }
    insert_res = client.post("/api/v1/dev/db/tables/users/rows", json=insert_payload, headers=headers)
    assert insert_res.status_code == 200
    res_data = insert_res.json()
    assert res_data["status"] == "success"
    assert res_data["inserted_count"] == 1

    # 2. Get rows from users table with search
    get_res = client.get(
        "/api/v1/dev/db/tables/users/rows?search=tester.dev@placify.internal", headers=headers
    )
    assert get_res.status_code == 200
    rows_data = get_res.json()
    assert rows_data["total_count"] >= 1
    user_row = rows_data["rows"][0]
    assert user_row["email"] == "tester.dev@placify.internal"
    assert user_row["full_name"] == "Test Automation User"
    assert user_row["password_hash"].startswith("$2b$")

    # 3. Run custom SQL query
    query_payload = {
        "query": "SELECT id, email, full_name, role FROM users WHERE email = :email",
        "params": {"email": "tester.dev@placify.internal"},
    }
    sql_res = client.post("/api/v1/dev/db/query", json=query_payload, headers=headers)
    assert sql_res.status_code == 200
    query_data = sql_res.json()
    assert query_data["type"] == "select"
    assert len(query_data["rows"]) == 1
    assert query_data["rows"][0][1] == "tester.dev@placify.internal"

    # 4. Clean up the test user
    del_res = client.post(
        "/api/v1/dev/db/tables/users/delete-row",
        json={"primary_key": {"id": user_row["id"]}},
        headers=headers,
    )
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "success"
