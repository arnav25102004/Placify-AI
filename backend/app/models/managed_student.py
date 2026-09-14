from sqlalchemy import Column, ForeignKey, Integer, String

from app.database import Base


class ManagedStudent(Base):
    __tablename__ = "managed_students"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    roll_no = Column(String, nullable=False, index=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    cgpa = Column(String, nullable=True)
    department = Column(String, nullable=True)
    batch_timeline = Column(String, nullable=True)
    pr_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    campus_id = Column(Integer, nullable=False)
    status = Column(String, nullable=False, default="Unplaced")
    incharge_faculty_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    photo_url = Column(String, nullable=True)
