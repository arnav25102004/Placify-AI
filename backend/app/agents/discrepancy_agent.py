"""
Agent 5: Faculty Assistant / Discrepancy Explainer — the second genuinely
agentic step. Produces a short, grounded prose explanation of the fraud and
cross-verification findings for the reviewing faculty member, via a real LLM
call when a provider is configured; falls back to a templated summary
otherwise. Also surfaces past human corrections for the same company.
"""
from typing import Any, Dict, Iterator, List, Optional

from app.logging_config import get_logger
from app.mcp_server.server import get_prior_corrections_impl
from app.services.llm_client import llm_client

logger = get_logger("placify.discrepancy_agent")


def _build_prompt(extraction_data, fraud_result: Dict[str, Any], cross_result: Dict[str, Any]) -> str:
    flags = fraud_result.get("fraud_flags", [])
    discrepancies = cross_result.get("discrepancies", [])
    return (
        "You are assisting a faculty reviewer verifying a student's placement offer letter.\n"
        f"Fraud flags found: {flags or 'none'}.\n"
        f"Cross-verification discrepancies found: {discrepancies or 'none'}.\n"
        f"Extraction confidence: {extraction_data.confidence}.\n"
        "Write a 2-3 sentence plain-English summary a busy faculty member can read in 5 "
        "seconds, explaining what (if anything) to double-check before approving. "
        "No markdown, no preamble."
    )


def _fallback_summary(fraud_result: Dict[str, Any], cross_result: Dict[str, Any]) -> str:
    flags = fraud_result.get("fraud_flags", [])
    discrepancies = cross_result.get("discrepancies", [])
    if not flags and not discrepancies:
        return "No fraud flags or discrepancies were found. This submission looks consistent."
    parts = []
    if flags:
        parts.append(f"Fraud flags: {'; '.join(flags)}.")
    if discrepancies:
        parts.append(f"Discrepancies: {'; '.join(discrepancies)}.")
    return " ".join(parts)


def explain(extraction_data, fraud_result: Dict[str, Any], cross_result: Dict[str, Any]) -> str:
    """Non-streaming variant — used by the synchronous extraction pipeline."""
    if not fraud_result.get("fraud_flags") and not cross_result.get("discrepancies"):
        return _fallback_summary(fraud_result, cross_result)

    text = llm_client.generate(_build_prompt(extraction_data, fraud_result, cross_result))
    if text:
        return text.strip()
    return _fallback_summary(fraud_result, cross_result)


def explain_stream(
    extraction_data, fraud_result: Dict[str, Any], cross_result: Dict[str, Any]
) -> Iterator[str]:
    """
    Streaming variant for the live UI — yields text chunks. Falls back to yielding
    the whole templated summary as one chunk if no streaming provider is available.
    """
    prompt = _build_prompt(extraction_data, fraud_result, cross_result)
    stream = llm_client.generate_stream(prompt)
    if stream is None:
        yield _fallback_summary(fraud_result, cross_result)
        return
    for chunk in stream:
        yield chunk


def prior_corrections_hint(company: str, db=None) -> List[Dict[str, Any]]:
    """Surfaces past human corrections for this company as a UI suggestion."""
    if not company:
        return []
    return get_prior_corrections_impl(company, db=db)
