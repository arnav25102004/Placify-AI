import json
from decimal import Decimal
from typing import Dict, List, Optional
from pydantic import BaseModel, field_validator


class DocumentStatus(BaseModel):
    id: int
    status: str
    submission_source: Optional[str] = "teacher_batch"
    student_id: Optional[int] = None
    batch_id: Optional[int] = None

    class Config:
        from_attributes = True


def _parse_json_field(v):
    if v is None or isinstance(v, (dict, list)):
        return v
    try:
        return json.loads(v)
    except (TypeError, ValueError):
        return None


class ExtractionDetail(BaseModel):
    student_name: str
    company: str
    package: Optional[Decimal]
    role: Optional[str]
    offer_type: Optional[str]
    joining_date: Optional[str] = None
    confidence: Decimal
    field_confidence: Optional[Dict[str, float]] = None
    authenticity_score: Optional[Decimal] = None
    profile_match_score: Optional[Decimal] = None
    fraud_flags: Optional[List[str]] = None
    discrepancies: Optional[List[str]] = None
    discrepancy_summary: Optional[str] = None

    _parse_field_confidence = field_validator("field_confidence", mode="before")(_parse_json_field)
    _parse_fraud_flags = field_validator("fraud_flags", mode="before")(_parse_json_field)
    _parse_discrepancies = field_validator("discrepancies", mode="before")(_parse_json_field)

    class Config:
        from_attributes = True


class DocumentDetail(BaseModel):
    id: int
    status: str
    drive_view_link: str
    submission_source: Optional[str] = "teacher_batch"
    student_id: Optional[int] = None
    batch_id: Optional[int] = None
    extraction: Optional[ExtractionDetail]

    class Config:
        from_attributes = True


class VerifyActionRequest(BaseModel):
    action: str
    reason: Optional[str] = None
    student_name: Optional[str] = None
    company: Optional[str] = None
    package: Optional[Decimal] = None
    role: Optional[str] = None
    offer_type: Optional[str] = None
    fraud_flag_outcome: Optional[str] = None  # "confirmed" | "false_positive" — Phase 5 evals
