from sqlalchemy import Column, ForeignKey, Integer, String

from app.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False, index=True)
    drive_file_id = Column(String, nullable=False)
    drive_view_link = Column(String, nullable=False)
    file_hash = Column(String, nullable=False, index=True)
    status = Column(String, nullable=False, default="pending")
