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


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
