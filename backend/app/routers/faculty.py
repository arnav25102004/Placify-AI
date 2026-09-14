from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_teacher
from app.logging_config import get_logger
from app.models.document import Document
from app.models.extraction import Extraction
from app.models.user import User
from app.schemas.faculty import FacultyQueueItem

logger = get_logger("placify.faculty")
router = APIRouter(prefix="/api/v1/faculty", tags=["faculty"])

_OPEN_STATUSES = ("pending", "processing", "needs_review")


@router.get("/queue", response_model=List[FacultyQueueItem])
def get_faculty_queue(
    current_teacher: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """
    Returns documents assigned to this faculty member (via PR-initiated requests)
    that are still awaiting review.
    """
    docs = (
        db.query(Document)
        .filter(
            Document.incharge_faculty_id == current_teacher.id,
            Document.status.in_(_OPEN_STATUSES),
        )
        .all()
    )

    items = []
    for doc in docs:
        extraction = (
            db.query(Extraction)
            .filter(Extraction.document_id == doc.id)
            .order_by(Extraction.id.desc())
            .first()
        )
        items.append(
            FacultyQueueItem(
                id=doc.id,
                status=doc.status,
                student_name=extraction.student_name if extraction else None,
                company=extraction.company if extraction else doc.company_name_hint,
                role=extraction.role if extraction else doc.role_title_hint,
                offer_type=extraction.offer_type if extraction else doc.offer_type_hint,
                package=extraction.package if extraction else None,
                confidence=extraction.confidence if extraction else None,
                managed_student_id=doc.managed_student_id,
            )
        )
    return items
