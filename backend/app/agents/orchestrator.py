"""
Plain-Python pipeline orchestrator (no LangGraph — see next-implementation-plan.md
for why). Coordinates: ingestion -> extraction + fraud (run in parallel, matching
7-agents.md's "Design Principle 1: Parallel Execution") -> cross-verification ->
discrepancy explanation, then persists one Extraction row.

Fast/deep path: a known-good company domain with zero prior fraud flags on the
requesting PR/Faculty skips the LLM-driven deep fraud reasoning in favor of the
cheap deterministic check alone. This is an honest if/else with a real signal
behind it, not a graph framework.
"""
import concurrent.futures
import json
import os

from sqlalchemy.orm import Session

from app.agents import cross_verification_agent, discrepancy_agent, extraction_agent, fraud_agent
from app.database import SessionLocal
from app.logging_config import get_logger
from app.mcp_server.server import check_company_domain
from app.models.document import Document
from app.models.extraction import Extraction
from app.models.managed_student import ManagedStudent
from app.services.drive_adapter import drive_adapter
from app.services.rate_limiter import TokenBucketRateLimiter

logger = get_logger("placify.orchestrator")
rate_limiter = TokenBucketRateLimiter(key="extraction_rate_limiter", capacity=60, refill_rate=1.0)


def _real_filename(doc: Document) -> str:
    """
    Derives the actual uploaded filename (with its real extension) for OCR/mime
    detection, instead of always assuming ".pdf". Local-storage file IDs encode
    the original filename (`local_<uuid12>_<filename>`); a real Google Drive ID
    is opaque, so ".pdf" remains the fallback there, matching prior behavior.
    """
    if doc.drive_file_id and doc.drive_file_id.startswith("local_"):
        without_prefix = doc.drive_file_id[len("local_"):]
        parts = without_prefix.split("_", 1)
        if len(parts) == 2 and os.path.splitext(parts[1])[1]:
            return f"doc_{doc.id}{os.path.splitext(parts[1])[1]}"
    return f"doc_{doc.id}.pdf"


def _requester_has_prior_fraud_flags(db: Session, doc: Document) -> bool:
    """Fast/deep path signal: has this requester had a fraud flag on a prior submission?"""
    if not doc.requested_by_id:
        return False
    flagged = (
        db.query(Extraction)
        .join(Document, Extraction.document_id == Document.id)
        .filter(Document.requested_by_id == doc.requested_by_id, Extraction.fraud_flags.isnot(None))
        .first()
    )
    return flagged is not None


def run_pipeline(document_id: int, db: Session = None) -> None:
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            logger.warning(f"Document id={document_id} not found; aborting pipeline.")
            return

        logger.info(f"Orchestrator starting pipeline for document_id={document_id} (status='{doc.status}')")
        doc.status = "processing"
        db.commit()

        rate_limiter.acquire(tokens=1, timeout=10.0)
        file_bytes = drive_adapter.download_file(doc.drive_file_id)
        logger.info(f"Downloaded {len(file_bytes)} bytes for document_id={document_id}")

        managed_student = None
        if doc.managed_student_id:
            managed_student = db.query(ManagedStudent).filter(ManagedStudent.id == doc.managed_student_id).first()

        hint = None
        if doc.managed_student_id or doc.company_name_hint:
            hint = {
                "student_name": managed_student.name if managed_student else None,
                "company": doc.company_name_hint,
                "role": doc.role_title_hint,
                "offer_type": doc.offer_type_hint,
            }

        domain_check = check_company_domain(doc.company_name_hint) if doc.company_name_hint else {"status": "unknown"}
        prior_flags = _requester_has_prior_fraud_flags(db, doc)
        use_fast_path = domain_check.get("status") == "known" and not prior_flags
        logger.info(
            f"document_id={document_id} fast_path={use_fast_path} "
            f"(company_status={domain_check.get('status')}, requester_prior_flags={prior_flags})"
        )

        # The DB-bound duplicate-file check always runs synchronously on this session
        # first (SQLAlchemy sessions aren't thread-safe). The company-plausibility
        # check has no DB access, so — when a company hint exists — it can run
        # genuinely concurrently with extraction's (slow, IO-bound) LLM call instead
        # of waiting on extraction's result, per 7-agents.md's parallel-execution design.
        duplicate_flag = fraud_agent.check_duplicate(db, doc)
        filename = _real_filename(doc)

        if doc.company_name_hint:
            with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
                extraction_future = pool.submit(extraction_agent.extract, file_bytes, filename, hint)
                company_future = pool.submit(fraud_agent.assess_company, doc.company_name_hint, use_fast_path is False)
                extraction_data = extraction_future.result()
                company_result = company_future.result()
        else:
            # No hint (self-submission) — the company check has nothing to run against
            # until extraction produces one, so it necessarily runs after, not in parallel.
            extraction_data = extraction_agent.extract(file_bytes, filename, hint)
            company_result = fraud_agent.assess_company(extraction_data.company, deep=not use_fast_path)

        fraud_result = fraud_agent.combine(duplicate_flag, company_result)
        cross_result = cross_verification_agent.verify(doc, extraction_data, db=db)
        discrepancy_text = discrepancy_agent.explain(extraction_data, fraud_result, cross_result)

        extraction = Extraction(
            document_id=doc.id,
            student_name=extraction_data.student_name,
            company=extraction_data.company,
            package=extraction_data.package,
            role=extraction_data.role,
            offer_type=extraction_data.offer_type,
            joining_date=extraction_data.joining_date,
            confidence=extraction_data.confidence,
            field_confidence=json.dumps(extraction_data.field_confidence) if extraction_data.field_confidence else None,
            authenticity_score=fraud_result["authenticity_score"],
            profile_match_score=cross_result["profile_match_score"],
            fraud_flags=json.dumps(fraud_result["fraud_flags"]) if fraud_result["fraud_flags"] else None,
            discrepancies=json.dumps(cross_result["discrepancies"]) if cross_result["discrepancies"] else None,
            discrepancy_summary=discrepancy_text,
        )
        db.add(extraction)
        doc.status = "needs_review"
        db.commit()

        logger.info(
            f"Pipeline completed for document_id={document_id} -> student='{extraction_data.student_name}', "
            f"company='{extraction_data.company}', authenticity={fraud_result['authenticity_score']:.2f}, "
            f"fast_path={use_fast_path}"
            + (f", fraud_flags={fraud_result['fraud_flags']}" if fraud_result["fraud_flags"] else "")
            + (f", discrepancies={cross_result['discrepancies']}" if cross_result["discrepancies"] else "")
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Pipeline failed for document_id={document_id}: {type(e).__name__}: {e}", exc_info=True)
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
