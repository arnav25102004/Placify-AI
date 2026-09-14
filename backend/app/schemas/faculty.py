from decimal import Decimal
from typing import Optional
from pydantic import BaseModel


class FacultyQueueItem(BaseModel):
    id: int
    status: str
    student_name: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    offer_type: Optional[str] = None
    package: Optional[Decimal] = None
    confidence: Optional[Decimal] = None
    managed_student_id: Optional[int] = None

    class Config:
        from_attributes = True
