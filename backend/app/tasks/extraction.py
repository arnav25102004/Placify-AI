import traceback
from app.celery_app import celery_app
from app.database import SessionLocal
from app.models.document import Document
from app.models.extraction import Extraction
from app.services.drive_adapter import drive_adapter
from app.services.gemini_adapter import gemini_adapter
from app.services.rate_limiter import TokenBucketRateLimiter

rate_limiter = TokenBucketRateLimiter(key="gemini_rate_limiter", capacity=60, refill_rate=1.0)

def process_document_extraction(document_id: int):
    """
    Core synchronous logic for document extraction.
    Used by Celery task and synchronous dev/test fallback.
    """
    db = SessionLocal()
    try:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            return

        doc.status = "processing"
        db.commit()

        # Acquire rate-limiting token
        rate_limiter.acquire(tokens=1, timeout=10.0)

        # Fetch file bytes from Drive adapter
        file_bytes = drive_adapter.download_file(doc.drive_file_id)

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
    except Exception as e:
        db.rollback()
        print(f"[Extraction Error] Failed processing document_id={document_id}: {e}")
        traceback.print_exc()
        try:
            doc = db.query(Document).filter(Document.id == document_id).first()
            if doc:
                doc.status = "needs_manual_review"
                db.commit()
        except Exception:
            pass
    finally:
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
