from typing import Dict, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_admin
from app.models.extraction import Extraction
from app.models.user import User

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])

_DIFF_FIELDS = ("student_name", "company", "package", "role", "offer_type")


@router.get("/eval-metrics")
def get_eval_metrics(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Plain SQL aggregation over data already collected during review — no new
    infra (Prometheus/Grafana not deployed; this is the in-app equivalent):

    - Extraction accuracy: fraction of documents whose extraction was never
      edited by a human, broken down by which field actually changed on the
      ones that were.
    - Fraud precision: of the fraud flags a faculty member labeled while
      verifying (fraud_flag_outcome), what fraction were confirmed real.
    """
    all_extractions = db.query(Extraction).all()

    by_document: Dict[int, List[Extraction]] = {}
    for ext in all_extractions:
        by_document.setdefault(ext.document_id, []).append(ext)

    total_documents = len(by_document)
    edited_documents = 0
    field_change_counts = {field: 0 for field in _DIFF_FIELDS}

    for extractions in by_document.values():
        extractions.sort(key=lambda e: e.id)
        original = extractions[0]
        latest = extractions[-1]
        if any(e.edited_by is not None for e in extractions):
            edited_documents += 1
            for field in _DIFF_FIELDS:
                if getattr(original, field) != getattr(latest, field):
                    field_change_counts[field] += 1

    extraction_accuracy = (
        round((total_documents - edited_documents) / total_documents, 3) if total_documents else None
    )

    fraud_labeled = [e for e in all_extractions if e.fraud_flag_outcome is not None]
    confirmed = len([e for e in fraud_labeled if e.fraud_flag_outcome == "confirmed"])
    false_positives = len([e for e in fraud_labeled if e.fraud_flag_outcome == "false_positive"])
    fraud_precision = round(confirmed / len(fraud_labeled), 3) if fraud_labeled else None

    return {
        "total_documents": total_documents,
        "edited_documents": edited_documents,
        "extraction_accuracy": extraction_accuracy,
        "field_change_counts": field_change_counts,
        "fraud_flags_labeled": len(fraud_labeled),
        "fraud_flags_confirmed": confirmed,
        "fraud_flags_false_positive": false_positives,
        "fraud_precision": fraud_precision,
    }
