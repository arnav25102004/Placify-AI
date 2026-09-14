from sqlalchemy import Column, ForeignKey, Integer, Numeric, String, Text

from app.database import Base


class Extraction(Base):
    __tablename__ = "extractions"

    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, index=True)
    student_name = Column(String, nullable=False)
    company = Column(String, nullable=False)
    package = Column(Numeric, nullable=True)
    role = Column(String, nullable=True)
    offer_type = Column(String, nullable=True)
    joining_date = Column(String, nullable=True)
    confidence = Column(Numeric, nullable=False)
    edited_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Fraud / cross-verification fields (nullable — populated only when checks actually ran)
    authenticity_score = Column(Numeric, nullable=True)
    profile_match_score = Column(Numeric, nullable=True)
    fraud_flags = Column(Text, nullable=True)
    discrepancies = Column(Text, nullable=True)

    # Per-field extraction confidence (JSON-encoded dict) and the discrepancy agent's
    # prose summary — both nullable, populated by the orchestrator pipeline.
    field_confidence = Column(Text, nullable=True)
    discrepancy_summary = Column(Text, nullable=True)

    # Faculty's label on this extraction's fraud flags, set during verify (Phase 5 evals).
    fraud_flag_outcome = Column(String, nullable=True)
