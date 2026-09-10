from decimal import Decimal
from typing import Optional
from pydantic import BaseModel


class DocumentStatus(BaseModel):
    id: int
    status: str
    submission_source: Optional[str] = "teacher_batch"
    student_id: Optional[int] = None
    batch_id: Optional[int] = None

    class Config:
        from_attributes = True


class ExtractionDetail(BaseModel):
    student_name: str
    company: str
    package: Optional[Decimal]
    role: Optional[str]
    offer_type: Optional[str]
    confidence: Decimal

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
