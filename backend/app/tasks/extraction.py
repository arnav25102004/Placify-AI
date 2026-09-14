from sqlalchemy.orm import Session
from app.celery_app import celery_app
from app.agents.orchestrator import run_pipeline
from app.logging_config import get_logger

logger = get_logger("placify.extraction")


def process_document_extraction(document_id: int, db: Session = None):
    """Thin wrapper kept for backward compatibility with existing call sites —
    the real pipeline logic lives in app.agents.orchestrator.run_pipeline."""
    run_pipeline(document_id, db=db)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=5, acks_late=True)
def extract_document(self, document_id: int):
    """Celery background worker task for async document extraction."""
    try:
        run_pipeline(document_id)
    except Exception as exc:
        raise self.retry(exc=exc)
