from sqlalchemy import Column, Integer, String
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default="teacher")
    campus_id = Column(Integer, nullable=False)
    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    department = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
