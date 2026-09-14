import os

# Set test environment database URL and TESTING flag before app import
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["TESTING"] = "true"


import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.models.user import User
from app.auth_utils import get_password_hash

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    # Create test teacher
    if not db.query(User).filter(User.email == "testteacher@placify.ai").first():
        user = User(
            email="testteacher@placify.ai",
            password_hash=get_password_hash("testpassword"),
            role="teacher",
            campus_id=1,
        )
        db.add(user)
        db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test.db"):
        try:
            os.remove("./test.db")
        except Exception:
            pass

@pytest.fixture
def db():
    connection = engine.connect()
    transaction = connection.begin()
    db_session = TestingSessionLocal(bind=connection)

    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    yield db_session

    app.dependency_overrides.pop(get_db, None)
    db_session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db):
    return TestClient(app)

@pytest.fixture
def auth_headers(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "testteacher@placify.ai", "password": "testpassword"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
