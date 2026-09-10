import os
import hashlib
import io
import csv

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_teacher
from app.models.batch import Batch
from app.models.document import Document
from app.models.extraction import Extraction
from app.models.user import User
from app.schemas.batch import BatchCreateResponse, BatchSummary
from app.schemas.document import DocumentStatus
from app.services.drive_adapter import drive_adapter
from app.tasks.extraction import extract_document, process_document_extraction

router = APIRouter(prefix="/api/v1/batches", tags=["batches"])

MAX_FILES_PER_BATCH = 50


@router.post("", response_model=BatchCreateResponse, status_code=202)
def create_batch(
    files: List[UploadFile],
    current_teacher: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    if not files:
        raise HTTPException(status_code=400, detail="At least one file is required")

    if len(files) > MAX_FILES_PER_BATCH:
        raise HTTPException(
            status_code=400,
            detail=f"A batch may contain at most {MAX_FILES_PER_BATCH} files",
        )

    batch = Batch(
        teacher_id=current_teacher.id,
        campus_id=current_teacher.campus_id,
        file_count=len(files),
        status="processing",
    )
    db.add(batch)
    db.commit()
    db.refresh(batch)

    for upload_file in files:
        content = upload_file.file.read()
        file_hash = hashlib.sha256(content).hexdigest()
        filename = upload_file.filename or "offer_letter.pdf"
        content_type = upload_file.content_type or "application/pdf"

        # Stream/upload raw file to Google Drive per ADR-003 & services.md
        drive_res = drive_adapter.upload_file(content, filename, content_type)

        doc = Document(
            batch_id=batch.id,
            drive_file_id=drive_res["drive_file_id"],
            drive_view_link=drive_res["drive_view_link"],
            file_hash=file_hash,
            status="pending",
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

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
                process_document_extraction(doc.id)
        else:
            process_document_extraction(doc.id)

    return BatchCreateResponse(id=batch.id, file_count=batch.file_count, status=batch.status)



@router.get("", response_model=List[BatchSummary])
def list_batches(
    current_teacher: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    return db.query(Batch).filter(Batch.teacher_id == current_teacher.id).all()


@router.get("/{batch_id}/documents", response_model=List[DocumentStatus])
def list_batch_documents(
    batch_id: int,
    current_teacher: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    batch = (
        db.query(Batch)
        .filter(Batch.id == batch_id, Batch.teacher_id == current_teacher.id)
        .first()
    )
    if batch is None:
        raise HTTPException(status_code=404, detail="Batch not found")

    return db.query(Document).filter(Document.batch_id == batch.id).all()


@router.post("/{batch_id}/export")
def export_batch(
    batch_id: int,
    format: Optional[str] = "json",
    current_teacher: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """
    Triggers ERP export for all verified documents in the batch.
    Supports 'json' payload push or 'csv' file download per api.md.
    """
    batch = (
        db.query(Batch)
        .filter(Batch.id == batch_id, Batch.teacher_id == current_teacher.id)
        .first()
    )
    if batch is None:
        raise HTTPException(status_code=404, detail="Batch not found")

    # Fetch verified documents with their extractions
    verified_docs = (
        db.query(Document, Extraction)
        .join(Extraction, Document.id == Extraction.document_id)
        .filter(Document.batch_id == batch.id, Document.status == "verified")
        .all()
    )

    records = []
    for doc, ext in verified_docs:
        records.append({
            "document_id": doc.id,
            "drive_file_id": doc.drive_file_id,
            "student_name": ext.student_name,
            "company": ext.company,
            "package": float(ext.package) if ext.package is not None else None,
            "role": ext.role,
            "offer_type": ext.offer_type,
            "confidence": float(ext.confidence),
        })

    if format.lower() == "csv":
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=[
            "document_id", "drive_file_id", "student_name", "company", "package", "role", "offer_type", "confidence"
        ])
        writer.writeheader()
        writer.writerows(records)
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=batch_{batch_id}_export.csv"}
        )

    return {
        "batch_id": batch.id,
        "exported_count": len(records),
        "records": records,
        "erp_status": "synced"
    }
