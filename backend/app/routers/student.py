import hashlib
import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_student
from app.logging_config import get_logger
from app.models.document import Document
from app.models.user import User
from app.schemas.document import DocumentStatus
from app.services.drive_adapter import drive_adapter
from app.tasks.extraction import extract_document, process_document_extraction

logger = get_logger("placify.student")
router = APIRouter(prefix="/api/v1/student", tags=["student"])


@router.post("/offer-letter", response_model=DocumentStatus, status_code=202)
def submit_offer_letter(
    file: UploadFile,
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """
    Allows a student to upload their single offer letter.
    Uploads file to Google Drive, persists Document row, and enqueues Celery extraction.
    """
    if not file:
        raise HTTPException(status_code=400, detail="Offer letter file is required")

    content = file.file.read()
    if not content:
        raise HTTPException(status_code=400, detail="File content cannot be empty")

    file_hash = hashlib.sha256(content).hexdigest()
    filename = file.filename or "student_offer_letter.pdf"
    content_type = file.content_type or "application/pdf"

    # Stream/upload raw file to Google Drive
    drive_res = drive_adapter.upload_file(content, filename, content_type)

    doc = Document(
        batch_id=None,
        student_id=current_student.id,
        submission_source="student_self",
        drive_file_id=drive_res["drive_file_id"],
        drive_view_link=drive_res["drive_view_link"],
        file_hash=file_hash,
        status="pending",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    logger.info(f"Student id={current_student.id} submitted offer letter '{filename}', enqueued document id={doc.id}")

    # Enqueue async extraction job
    use_celery = False
    if os.getenv("TESTING") != "true":
        try:
            import redis
            r = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"), socket_timeout=0.5)
            r.ping()
            use_celery = True
        except Exception:
            use_celery = False

    if use_celery:
        try:
            extract_document.delay(doc.id)
        except Exception:
            process_document_extraction(doc.id, db=db)
    else:
        process_document_extraction(doc.id, db=db)

    db.refresh(doc)

    return DocumentStatus(
        id=doc.id,
        status=doc.status,
        submission_source=doc.submission_source,
        student_id=doc.student_id,
        batch_id=doc.batch_id,
    )


@router.get("/my-submissions", response_model=List[DocumentStatus])
def list_my_submissions(
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """
    Returns all offer letter submissions uploaded by the logged-in student.
    """
    return db.query(Document).filter(Document.student_id == current_student.id).all()
