import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_SQLITE_PATH = os.path.join(BASE_DIR, "data", "placify.db")
os.makedirs(os.path.join(BASE_DIR, "data"), exist_ok=True)

DEFAULT_DB_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_SQLITE_PATH}")

def get_engine():
    db_url = os.getenv("DATABASE_URL", DEFAULT_DB_URL)
    if db_url.startswith("sqlite"):
        return create_engine(db_url, connect_args={"check_same_thread": False})
    return create_engine(db_url)

engine = get_engine()

def get_session():
    # If environment variable changed (e.g. In tests), bind to latest engine
    current_engine = get_engine()
    return sessionmaker(bind=current_engine, autocommit=False, autoflush=False)()

class SessionProxy:
    def __call__(self, **kwargs):
        current_engine = get_engine()
        return sessionmaker(bind=current_engine, autocommit=False, autoflush=False)(**kwargs)

SessionLocal = SessionProxy()

Base = declarative_base()


def ensure_user_profile_columns(target_engine=None):
    """Safely adds missing profile columns to the users table if running on SQLite or pre-existing db."""
    try:
        from sqlalchemy import inspect, text
        eng = target_engine or engine
        inspector = inspect(eng)
        if "users" in inspector.get_table_names():
            existing_columns = {c["name"] for c in inspector.get_columns("users")}
            expected_cols = {
                "full_name": "VARCHAR",
                "phone": "VARCHAR",
                "department": "VARCHAR",
                "designation": "VARCHAR",
                "bio": "TEXT",
                "avatar_url": "VARCHAR",
                "linkedin_url": "VARCHAR",
                "github_url": "VARCHAR",
            }
            with eng.begin() as conn:
                for col_name, col_type in expected_cols.items():
                    if col_name not in existing_columns:
                        conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
    except Exception:
        pass


def ensure_document_columns(target_engine=None):
    """Safely adds PR-request and fraud/cross-verification columns to documents/extractions if missing."""
    try:
        from sqlalchemy import inspect, text
        eng = target_engine or engine
        inspector = inspect(eng)
        table_names = inspector.get_table_names()

        if "documents" in table_names:
            existing_columns = {c["name"] for c in inspector.get_columns("documents")}
            expected_cols = {
                "managed_student_id": "INTEGER",
                "requested_by_id": "INTEGER",
                "incharge_faculty_id": "INTEGER",
                "company_name_hint": "VARCHAR",
                "role_title_hint": "VARCHAR",
                "offer_type_hint": "VARCHAR",
            }
            with eng.begin() as conn:
                for col_name, col_type in expected_cols.items():
                    if col_name not in existing_columns:
                        conn.execute(text(f"ALTER TABLE documents ADD COLUMN {col_name} {col_type}"))

        if "extractions" in table_names:
            existing_columns = {c["name"] for c in inspector.get_columns("extractions")}
            expected_cols = {
                "authenticity_score": "NUMERIC",
                "profile_match_score": "NUMERIC",
                "fraud_flags": "TEXT",
                "discrepancies": "TEXT",
                "field_confidence": "TEXT",
                "discrepancy_summary": "TEXT",
                "joining_date": "VARCHAR",
                "fraud_flag_outcome": "VARCHAR",
            }
            with eng.begin() as conn:
                for col_name, col_type in expected_cols.items():
                    if col_name not in existing_columns:
                        conn.execute(text(f"ALTER TABLE extractions ADD COLUMN {col_name} {col_type}"))
    except Exception:
        pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

