from sqlalchemy import Column, ForeignKey, Integer, String
from app.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    submission_source = Column(String, nullable=False, default="teacher_batch")
    drive_file_id = Column(String, nullable=False)
    drive_view_link = Column(String, nullable=False)
    file_hash = Column(String, nullable=False, index=True)
    status = Column(String, nullable=False, default="pending")

    # PR-initiated request fields (nullable — unset for self-submissions and legacy batch uploads)
    managed_student_id = Column(Integer, ForeignKey("managed_students.id"), nullable=True, index=True)
    requested_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    incharge_faculty_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    company_name_hint = Column(String, nullable=True)
    role_title_hint = Column(String, nullable=True)
    offer_type_hint = Column(String, nullable=True)
