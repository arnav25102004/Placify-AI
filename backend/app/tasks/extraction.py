import difflib
import json
from sqlalchemy.orm import Session
from app.celery_app import celery_app
from app.database import SessionLocal
from app.models.document import Document
from app.models.extraction import Extraction
from app.models.managed_student import ManagedStudent
from app.services.drive_adapter import drive_adapter
from app.services.gemini_adapter import gemini_adapter
from app.services.rate_limiter import TokenBucketRateLimiter

from app.logging_config import get_logger

logger = get_logger("placify.extraction")
rate_limiter = TokenBucketRateLimiter(key="gemini_rate_limiter", capacity=60, refill_rate=1.0)


def _names_match(a: str, b: str) -> float:
    if not a or not b:
        return 0.0
    return difflib.SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()


def _run_fraud_and_cross_checks(db: Session, doc: Document, extraction_data):
    """
    Deterministic fraud/cross-verification checks. Returns (authenticity_score,
    profile_match_score, fraud_flags_json, discrepancies_json) — any of the score
    fields may be None when there's nothing to check against.
    """
    fraud_flags = []
    discrepancies = []
    authenticity_score = 1.0
    profile_match_score = None

    # Duplicate file check — same file_hash used on a different document
    duplicate = (
        db.query(Document)
        .filter(Document.file_hash == doc.file_hash, Document.id != doc.id)
        .first()
    )
    if duplicate:
        fraud_flags.append(f"Identical file already submitted as document #{duplicate.id}")
        authenticity_score -= 0.4

    # Cross-verification against the PR-managed roster this request was tied to
    if doc.managed_student_id:
        managed_student = db.query(ManagedStudent).filter(ManagedStudent.id == doc.managed_student_id).first()
        if managed_student:
            name_score = _names_match(managed_student.name, extraction_data.student_name)
            profile_match_score = round(name_score, 2)
            if name_score < 0.6:
                discrepancies.append(
                    f"Extracted name '{extraction_data.student_name}' does not closely match "
                    f"roster name '{managed_student.name}' (similarity {name_score:.2f})"
                )

        if doc.company_name_hint and extraction_data.company:
            if doc.company_name_hint.strip().lower() != extraction_data.company.strip().lower():
                discrepancies.append(
                    f"Extracted company '{extraction_data.company}' differs from the "
                    f"requested company '{doc.company_name_hint}'"
                )

    authenticity_score = max(0.0, min(1.0, authenticity_score))
    return (
        authenticity_score,
        profile_match_score,
        json.dumps(fraud_flags) if fraud_flags else None,
        json.dumps(discrepancies) if discrepancies else None,
    )


def process_document_extraction(document_id: int, db: Session = None):
    """
    Core synchronous logic for document extraction.
    Used by Celery task and synchronous dev/test fallback.
    """
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            logger.warning(f"Document id={document_id} not found in database; aborting extraction.")
            return

        logger.info(f"Starting extraction pipeline for document_id={document_id} (drive_file_id='{doc.drive_file_id}', status='{doc.status}')")
        doc.status = "processing"
        db.commit()

        # Acquire rate-limiting token
        rate_limiter.acquire(tokens=1, timeout=10.0)

        # Fetch file bytes from Drive adapter
        file_bytes = drive_adapter.download_file(doc.drive_file_id)
        logger.info(f"Downloaded {len(file_bytes)} bytes for document_id={document_id} (drive_file_id={doc.drive_file_id})")

        hint = None
        if doc.managed_student_id or doc.company_name_hint:
            managed_student = (
                db.query(ManagedStudent).filter(ManagedStudent.id == doc.managed_student_id).first()
                if doc.managed_student_id
                else None
            )
            hint = {
                "student_name": managed_student.name if managed_student else None,
                "company": doc.company_name_hint,
                "role": doc.role_title_hint,
                "offer_type": doc.offer_type_hint,
            }

        # Call Gemini adapter for structured extraction
        extraction_data = gemini_adapter.extract_fields(file_bytes, f"doc_{doc.id}.pdf", hint=hint)

        authenticity_score, profile_match_score, fraud_flags, discrepancies = _run_fraud_and_cross_checks(
            db, doc, extraction_data
        )

        # Save extraction row
        extraction = Extraction(
            document_id=doc.id,
            student_name=extraction_data.student_name,
            company=extraction_data.company,
            package=extraction_data.package,
            role=extraction_data.role,
            offer_type=extraction_data.offer_type,
            confidence=extraction_data.confidence,
            authenticity_score=authenticity_score,
            profile_match_score=profile_match_score,
            fraud_flags=fraud_flags,
            discrepancies=discrepancies,
        )
        db.add(extraction)

        doc.status = "needs_review"
        db.commit()
        logger.info(
            f"Extraction completed for document_id={document_id} -> student='{extraction_data.student_name}', "
            f"company='{extraction_data.company}', package={extraction_data.package} LPA, "
            f"role='{extraction_data.role}', confidence={extraction_data.confidence:.2f}, "
            f"authenticity={authenticity_score:.2f}"
            + (f", fraud_flags={fraud_flags}" if fraud_flags else "")
            + (f", discrepancies={discrepancies}" if discrepancies else "")
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Extraction failed for document_id={document_id}: {type(e).__name__}: {e}", exc_info=True)
        try:
            doc = db.query(Document).filter(Document.id == document_id).first()
            if doc:
                doc.status = "needs_manual_review"
                db.commit()
                logger.warning(f"Document_id={document_id} marked as 'needs_manual_review' due to failure.")
        except Exception:
            pass
    finally:
        if should_close:
            db.close()


@celery_app.task(bind=True, max_retries=3, default_retry_delay=5, acks_late=True)
def extract_document(self, document_id: int):
    """
    Celery background worker task for async document extraction.
    """
    try:
        process_document_extraction(document_id)
    except Exception as exc:
        raise self.retry(exc=exc)
