"""
Placify's single MCP server, exposing read-only lookup tools the fraud and
cross-verification agents use during extraction. Runnable standalone
(`python -m app.mcp_server.server`) for any external MCP client.

Each tool has a `_impl(..., db=None)` function doing the real work and a thin
`@mcp.tool()`-decorated wrapper with the public (no-`db`) signature an external
MCP client sees. In-process callers (app/agents/*.py) call the `_impl` function
directly and pass their own session through — opening a fresh session per call
(as the public wrapper does) would be invisible to a caller's still-open,
uncommitted transaction (e.g. in tests), so don't use the public wrapper from
in-process code that needs read-your-writes consistency.

Verify the `mcp` package's API against the installed version before relying
on this in a new environment — the SDK renamed FastMCP -> MCPServer between
1.x and 2.x with a different import path and some signature changes.
"""
import re
from typing import Any, Dict, List, Optional

from mcp.server.mcpserver import MCPServer
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.logging_config import get_logger
from app.models.document import Document
from app.models.extraction import Extraction
from app.models.managed_student import ManagedStudent

logger = get_logger("placify.mcp_server")

mcp = MCPServer("placify-tools")

# Small curated table — a real domain-verification service is out of scope for this
# round (per next-implementation-plan.md). This is a heuristic, not a WHOIS/DNS check.
_KNOWN_COMPANY_DOMAINS = {
    "google": "google.com",
    "google india": "google.com",
    "microsoft": "microsoft.com",
    "amazon": "amazon.com",
    "goldman sachs": "goldmansachs.com",
    "oracle": "oracle.com",
    "cisco": "cisco.com",
    "cisco systems": "cisco.com",
    "adobe": "adobe.com",
    "atlassian": "atlassian.com",
    "morgan stanley": "morganstanley.com",
    "tcs": "tcs.com",
    "tcs digital": "tcs.com",
    "deloitte": "deloitte.com",
    "jp morgan chase & co.": "jpmorganchase.com",
}


def get_student_record_impl(student_id: int, db: Optional[Session] = None) -> Dict[str, Any]:
    should_close = db is None
    db = db or SessionLocal()
    try:
        student = db.query(ManagedStudent).filter(ManagedStudent.id == student_id).first()
        if not student:
            return {"found": False}
        return {
            "found": True,
            "id": student.id,
            "name": student.name,
            "roll_no": student.roll_no,
            "department": student.department,
            "status": student.status,
        }
    finally:
        if should_close:
            db.close()


@mcp.tool()
def get_student_record(student_id: int) -> Dict[str, Any]:
    """Looks up a PR-managed student's roster record by id, for cross-verification."""
    return get_student_record_impl(student_id)


@mcp.tool()
def check_company_domain(company_name: str) -> Dict[str, Any]:
    """
    Heuristic plausibility check for a claimed employer name — matches against a
    small curated table of known companies, or falls back to a shape heuristic
    (not a real domain/WHOIS verification service).
    """
    normalized = company_name.strip().lower()
    if normalized in _KNOWN_COMPANY_DOMAINS:
        return {
            "status": "known",
            "expected_domain": _KNOWN_COMPANY_DOMAINS[normalized],
        }

    # Shape heuristic for unknown companies: plausible company names are mostly
    # letters/spaces/punctuation, not just digits or a single character.
    plausible = bool(re.match(r"^[A-Za-z][A-Za-z0-9 &.,'\-]{2,}$", company_name.strip()))
    return {
        "status": "unknown",
        "plausible_name": plausible,
    }


def get_prior_corrections_impl(
    company_name: str, limit: int = 10, db: Optional[Session] = None
) -> List[Dict[str, Any]]:
    should_close = db is None
    db = db or SessionLocal()
    try:
        edited = (
            db.query(Extraction)
            .filter(
                Extraction.edited_by.isnot(None),
                Extraction.company.ilike(f"%{company_name.strip()}%"),
            )
            .order_by(Extraction.id.desc())
            .limit(limit)
            .all()
        )

        results = []
        diff_fields = ("student_name", "company", "package", "role", "offer_type")
        for edit in edited:
            prior = (
                db.query(Extraction)
                .filter(Extraction.document_id == edit.document_id, Extraction.id < edit.id)
                .order_by(Extraction.id.desc())
                .first()
            )
            changed_fields = []
            if prior:
                for field in diff_fields:
                    if getattr(prior, field) != getattr(edit, field):
                        changed_fields.append(field)

            results.append(
                {
                    "document_id": edit.document_id,
                    "changed_fields": changed_fields,
                    "corrected_role": edit.role,
                    "corrected_package": float(edit.package) if edit.package is not None else None,
                }
            )
        return results
    finally:
        if should_close:
            db.close()


@mcp.tool()
def get_prior_corrections(company_name: str, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Returns recent human corrections (edited_by IS NOT NULL) made to extractions
    for the given company, with a diff against the extraction they superseded —
    used to surface "past corrections for this company" hints. Plain SQL, no
    vector search.
    """
    return get_prior_corrections_impl(company_name, limit)


if __name__ == "__main__":
    mcp.run()
