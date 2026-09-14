from sqlalchemy import Column, Integer, String, Float, Text
from app.database import Base


class Senior(Base):
    __tablename__ = "seniors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    batch = Column(String, nullable=False, default="2024")
    department = Column(String, nullable=False)
    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    package_lpa = Column(Float, nullable=False, default=10.0)
    offer_type = Column(String, nullable=False, default="Full-Time")
    skills = Column(Text, nullable=True)  # JSON or comma-separated
    interview_experience = Column(Text, nullable=True)
    linkedin_url = Column(String, nullable=True)
    email = Column(String, nullable=True)
    referral_status = Column(String, nullable=False, default="Available")
    campus = Column(String, nullable=False, default="Bangalore Main Campus")
