from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.dependencies.auth import get_current_teacher
from app.logging_config import get_logger
from app.models.audit_log import AuditLog
from app.models.batch import Batch
from app.models.document import Document
from app.models.extraction import Extraction
from app.models.user import User
from app.schemas.document import DocumentDetail, VerifyActionRequest

logger = get_logger("placify.documents")
router = APIRouter(prefix="/api/v1/documents", tags=["documents"])


def _get_owned_document(document_id: int, teacher: User, db: Session) -> Document:
    # Check if document belongs to a batch created by the teacher
    doc_via_batch = (
        db.query(Document)
        .join(Batch, Document.batch_id == Batch.id)
        .filter(Document.id == document_id, Batch.teacher_id == teacher.id)
        .first()
    )
    if doc_via_batch:
        return doc_via_batch

    # Check if document is a student self-submission from same campus
    doc_via_student = (
        db.query(Document)
        .join(User, Document.student_id == User.id)
        .filter(Document.id == document_id, User.campus_id == teacher.campus_id)
        .first()
    )
    if doc_via_student:
        return doc_via_student

    raise HTTPException(status_code=404, detail="Document not found")


@router.get("/{document_id}", response_model=DocumentDetail)
def get_document(
    document_id: int,
    current_teacher: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    document = _get_owned_document(document_id, current_teacher, db)
    extraction = (
        db.query(Extraction)
        .filter(Extraction.document_id == document.id)
        .order_by(Extraction.id.desc())
        .first()
    )
    return DocumentDetail(
        id=document.id,
        status=document.status,
        drive_view_link=document.drive_view_link,
        submission_source=document.submission_source,
        student_id=document.student_id,
        batch_id=document.batch_id,
        extraction=extraction,
    )


@router.post("/{document_id}/verify")
def verify_document(
    document_id: int,
    action: VerifyActionRequest,
    current_teacher: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    document = _get_owned_document(document_id, current_teacher, db)

    if action.action not in ("approve", "reject", "edit"):
        raise HTTPException(status_code=400, detail="action must be approve, reject, or edit")

    if action.action == "reject" and not action.reason:
        raise HTTPException(status_code=400, detail="reason is required to reject a document")

    if action.action == "edit":
        latest_extraction = (
            db.query(Extraction)
            .filter(Extraction.document_id == document.id)
            .order_by(Extraction.id.desc())
            .first()
        )
        base_name = latest_extraction.student_name if latest_extraction else "Unknown"
        base_company = latest_extraction.company if latest_extraction else "Unknown"
        base_pkg = latest_extraction.package if latest_extraction else None
        base_role = latest_extraction.role if latest_extraction else None
        base_type = latest_extraction.offer_type if latest_extraction else None
        base_conf = latest_extraction.confidence if latest_extraction else 1.0

        new_extraction = Extraction(
            document_id=document.id,
            student_name=action.student_name if action.student_name is not None else base_name,
            company=action.company if action.company is not None else base_company,
            package=action.package if action.package is not None else base_pkg,
            role=action.role if action.role is not None else base_role,
            offer_type=action.offer_type if action.offer_type is not None else base_type,
            confidence=base_conf,
            edited_by=current_teacher.id,
        )
        db.add(new_extraction)
        document.status = "verified"
    elif action.action == "approve":
        document.status = "verified"
    else:
        document.status = "rejected"

    db.add(
        AuditLog(
            actor_id=current_teacher.id,
            document_id=document.id,
            action=action.action,
            reason=action.reason,
        )
    )
    db.commit()
    logger.info(
        f"Verification decision recorded: action='{action.action}', document_id={document.id}, "
        f"new_status='{document.status}', actor_id={current_teacher.id}, reason='{action.reason or 'N/A'}'"
    )

    return {"id": document.id, "status": document.status}


@router.get("/files/{file_id}")
def get_local_file(file_id: str):
    """
    Serves stored local documents for verification workspace viewing.
    """
    import os
    from fastapi.responses import Response

    safe_name = file_id.removeprefix("local_")
    LOCAL_STORAGE_DIR = os.getenv(
        "LOCAL_STORAGE_DIR",
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "uploads"),
    )
    file_path = os.path.join(LOCAL_STORAGE_DIR, safe_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Local file not found")

    content_type = "application/pdf"
    if safe_name.lower().endswith(".png"):
        content_type = "image/png"
    elif safe_name.lower().endswith((".jpg", ".jpeg")):
        content_type = "image/jpeg"

    with open(file_path, "rb") as f:
        data = f.read()

    return Response(content=data, media_type=content_type)
