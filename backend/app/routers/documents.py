from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_teacher
from app.models.audit_log import AuditLog
from app.models.batch import Batch
from app.models.document import Document
from app.models.extraction import Extraction
from app.models.user import User
from app.schemas.document import DocumentDetail, VerifyActionRequest

router = APIRouter(prefix="/api/v1/documents", tags=["documents"])


def _get_owned_document(document_id: int, teacher: User, db: Session) -> Document:
    document = (
        db.query(Document)
        .join(Batch, Document.batch_id == Batch.id)
        .filter(Document.id == document_id, Batch.teacher_id == teacher.id)
        .first()
    )
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


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

    return {"id": document.id, "status": document.status}
