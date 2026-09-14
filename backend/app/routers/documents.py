import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

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

    # Check if this teacher is the assigned in-charge faculty for a PR-initiated request
    doc_via_assignment = (
        db.query(Document)
        .filter(Document.id == document_id, Document.incharge_faculty_id == teacher.id)
        .first()
    )
    if doc_via_assignment:
        return doc_via_assignment

    raise HTTPException(status_code=404, detail="Document not found")


def _latest_extraction(db: Session, document_id: int):
    return (
        db.query(Extraction)
        .filter(Extraction.document_id == document_id)
        .order_by(Extraction.id.desc())
        .first()
    )


@router.get("/{document_id}", response_model=DocumentDetail)
def get_document(
    document_id: int,
    current_teacher: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    document = _get_owned_document(document_id, current_teacher, db)
    extraction = _latest_extraction(db, document.id)
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

    if action.fraud_flag_outcome not in (None, "confirmed", "false_positive"):
        raise HTTPException(status_code=400, detail="fraud_flag_outcome must be 'confirmed' or 'false_positive'")

    latest_extraction = _latest_extraction(db, document.id)

    if action.action == "edit":
        base = latest_extraction
        new_extraction = Extraction(
            document_id=document.id,
            student_name=action.student_name if action.student_name is not None else (base.student_name if base else "Unknown"),
            company=action.company if action.company is not None else (base.company if base else "Unknown"),
            package=action.package if action.package is not None else (base.package if base else None),
            role=action.role if action.role is not None else (base.role if base else None),
            offer_type=action.offer_type if action.offer_type is not None else (base.offer_type if base else None),
            joining_date=base.joining_date if base else None,
            confidence=base.confidence if base else 1.0,
            field_confidence=base.field_confidence if base else None,
            authenticity_score=base.authenticity_score if base else None,
            profile_match_score=base.profile_match_score if base else None,
            fraud_flags=base.fraud_flags if base else None,
            discrepancies=base.discrepancies if base else None,
            discrepancy_summary=base.discrepancy_summary if base else None,
            fraud_flag_outcome=action.fraud_flag_outcome,
            edited_by=current_teacher.id,
        )
        db.add(new_extraction)
        document.status = "verified"
    elif action.action == "approve":
        if latest_extraction and action.fraud_flag_outcome:
            latest_extraction.fraud_flag_outcome = action.fraud_flag_outcome
        document.status = "verified"
    else:
        if latest_extraction and action.fraud_flag_outcome:
            latest_extraction.fraud_flag_outcome = action.fraud_flag_outcome
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
        + (f", fraud_flag_outcome='{action.fraud_flag_outcome}'" if action.fraud_flag_outcome else "")
    )

    return {"id": document.id, "status": document.status}


@router.get("/{document_id}/discrepancy-stream")
def stream_discrepancy_explanation(
    document_id: int,
    current_teacher: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """
    Server-Sent Events endpoint streaming the discrepancy agent's explanation
    token-by-token to the compare/workspace UI. Falls back to a single chunk
    containing the templated summary when no streaming-capable LLM provider
    is configured.
    """
    from app.agents import discrepancy_agent

    document = _get_owned_document(document_id, current_teacher, db)
    extraction = _latest_extraction(db, document.id)
    if not extraction:
        raise HTTPException(status_code=404, detail="No extraction found for this document")

    fraud_result = {"fraud_flags": json.loads(extraction.fraud_flags) if extraction.fraud_flags else []}
    cross_result = {"discrepancies": json.loads(extraction.discrepancies) if extraction.discrepancies else []}

    def event_stream():
        try:
            for chunk in discrepancy_agent.explain_stream(extraction, fraud_result, cross_result):
                yield f"data: {json.dumps({'delta': chunk})}\n\n"
        except Exception as e:
            logger.error(f"Discrepancy stream failed for document_id={document_id}: {e}", exc_info=True)
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        yield "event: done\ndata: {}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.get("/{document_id}/prior-corrections")
def get_prior_corrections_hint(
    document_id: int,
    current_teacher: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """Surfaces past human corrections for this document's company as a UI hint."""
    from app.agents import discrepancy_agent

    document = _get_owned_document(document_id, current_teacher, db)
    extraction = _latest_extraction(db, document.id)
    company = extraction.company if extraction else None
    return {"corrections": discrepancy_agent.prior_corrections_hint(company, db=db) if company else []}


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
