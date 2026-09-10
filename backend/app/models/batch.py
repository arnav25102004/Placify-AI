from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func

from app.database import Base


class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    campus_id = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    file_count = Column(Integer, nullable=False)
    status = Column(String, nullable=False, default="processing")
