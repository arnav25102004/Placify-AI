import traceback
from sqlalchemy.orm import Session
from app.celery_app import celery_app
from app.database import SessionLocal
from app.models.document import Document
from app.models.extraction import Extraction
from app.services.drive_adapter import drive_adapter
from app.services.gemini_adapter import gemini_adapter
from app.services.rate_limiter import TokenBucketRateLimiter

from app.logging_config import get_logger

logger = get_logger("placify.extraction")
rate_limiter = TokenBucketRateLimiter(key="gemini_rate_limiter", capacity=60, refill_rate=1.0)

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

        # Call Gemini adapter for structured extraction
        extraction_data = gemini_adapter.extract_fields(file_bytes, f"doc_{doc.id}.pdf")

        # Save extraction row
        extraction = Extraction(
            document_id=doc.id,
            student_name=extraction_data.student_name,
            company=extraction_data.company,
            package=extraction_data.package,
            role=extraction_data.role,
            offer_type=extraction_data.offer_type,
            confidence=extraction_data.confidence,
        )
        db.add(extraction)

        doc.status = "needs_review"
        db.commit()
        logger.info(
            f"Extraction completed for document_id={document_id} -> student='{extraction_data.student_name}', "
            f"company='{extraction_data.company}', package={extraction_data.package} LPA, "
            f"role='{extraction_data.role}', confidence={extraction_data.confidence:.2f}"
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
