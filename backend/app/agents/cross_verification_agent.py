"""Agent 4: Cross-Verification — compares extracted fields against the roster record."""
import difflib
from typing import Any, Dict

from app.logging_config import get_logger
from app.mcp_server.server import get_student_record_impl
from app.models.document import Document

logger = get_logger("placify.cross_verification_agent")


def _names_match(a: str, b: str) -> float:
    if not a or not b:
        return 0.0
    return difflib.SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()


def verify(doc: Document, extraction_data, db=None) -> Dict[str, Any]:
    """
    Returns {"profile_match_score": float|None, "discrepancies": list[str]}.
    Looks up the roster record via the MCP get_student_record tool's underlying
    implementation (an in-process call here — no transport round-trip needed
    within this codebase). Pass the caller's own `db` session through when one
    is available (e.g. from the orchestrator) so this sees uncommitted writes
    from the same request/test rather than opening a separate session.
    """
    discrepancies = []
    profile_match_score = None

    if doc.managed_student_id:
        record = get_student_record_impl(doc.managed_student_id, db=db)
        if record.get("found"):
            name_score = _names_match(record["name"], extraction_data.student_name)
            profile_match_score = round(name_score, 2)
            if name_score < 0.6:
                discrepancies.append(
                    f"Extracted name '{extraction_data.student_name}' does not closely match "
                    f"roster name '{record['name']}' (similarity {name_score:.2f})"
                )

    if doc.company_name_hint and extraction_data.company:
        if doc.company_name_hint.strip().lower() != extraction_data.company.strip().lower():
            discrepancies.append(
                f"Extracted company '{extraction_data.company}' differs from the "
                f"requested company '{doc.company_name_hint}'"
            )

    return {"profile_match_score": profile_match_score, "discrepancies": discrepancies}
