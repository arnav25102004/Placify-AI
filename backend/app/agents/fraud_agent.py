"""
Agent 3: Fraud Detection — the first genuinely agentic step. When an LLM
provider is configured, the model itself decides whether to call the
check_company_domain tool and how to weigh the result; otherwise falls back
to the same deterministic check run directly.

Split into a DB-bound duplicate-file check and a network-only company-check so
the orchestrator can run the (slow, IO-bound) company check concurrently with
extraction without sharing a SQLAlchemy session across threads.
"""
import json
from typing import Any, Dict, List, Optional

from app.logging_config import get_logger
from app.mcp_server.server import check_company_domain
from app.models.document import Document
from app.services.llm_client import llm_client

logger = get_logger("placify.fraud_agent")

_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "check_company_domain",
            "description": "Checks whether a claimed employer name is a known or plausible company.",
            "parameters": {
                "type": "object",
                "properties": {"company_name": {"type": "string"}},
                "required": ["company_name"],
            },
        },
    }
]


def _execute_tool(name: str, args: dict) -> Any:
    if name == "check_company_domain":
        return check_company_domain(args.get("company_name", ""))
    return {"error": f"unknown tool '{name}'"}


def check_duplicate(db, doc: Document) -> Optional[str]:
    """DB-bound: is this exact file already attached to another document? Always run
    synchronously against the caller's own session — never call this from a worker
    thread sharing a session with other concurrent DB work."""
    duplicate = (
        db.query(Document)
        .filter(Document.file_hash == doc.file_hash, Document.id != doc.id)
        .first()
    )
    if duplicate:
        return f"Identical file already submitted as document #{duplicate.id}"
    return None


def assess_company(company_name: str, deep: bool = True) -> Dict[str, Any]:
    """
    No DB access — safe to run concurrently with extraction in a worker thread.
    Returns {"authenticity_penalty": float, "fraud_flags": list[str]}.

    When `deep` is True (the orchestrator's "deep path"), the company-plausibility
    check goes through the LLM (with tool access) if a provider is configured,
    letting it reason about the result. When `deep` is False (the "fast path" for
    known-good companies with no prior fraud history) or no LLM is available, the
    same tool is called directly with a fixed decision rule instead.
    """
    fraud_flags: List[str] = []
    penalty = 0.0

    text = None
    if deep:
        prompt = (
            "You are a fraud-review assistant for placement offer letters. Given the claimed "
            f"company name '{company_name}', decide whether it looks like a real, "
            "plausible employer. Use the check_company_domain tool if it helps. Respond with ONLY "
            'a JSON object: {"suspicious": true|false, "reason": "..."}. No markdown.'
        )
        text = llm_client.generate_with_tools(prompt, tools=_TOOLS, tool_executor=_execute_tool)

    if text:
        try:
            clean = text.strip().strip("`")
            if clean.lower().startswith("json"):
                clean = clean[4:]
            verdict = json.loads(clean.strip())
            if verdict.get("suspicious"):
                reason = verdict.get("reason") or f"LLM fraud check flagged '{company_name}' as suspicious"
                fraud_flags.append(reason)
                penalty += 0.3
        except Exception as e:
            logger.warning(f"Fraud agent LLM response was not valid JSON, ignoring: {e}")
    else:
        # Deterministic fallback — same tool, called directly, fixed decision rule.
        domain_check = check_company_domain(company_name)
        if domain_check.get("status") == "unknown" and not domain_check.get("plausible_name", True):
            fraud_flags.append(f"Company name '{company_name}' does not look like a real employer name")
            penalty += 0.2

    return {"authenticity_penalty": penalty, "fraud_flags": fraud_flags}


def combine(duplicate_flag: Optional[str], company_result: Dict[str, Any]) -> Dict[str, Any]:
    """Merges the two independent checks into the final fraud assessment."""
    fraud_flags = list(company_result.get("fraud_flags", []))
    authenticity_score = 1.0 - company_result.get("authenticity_penalty", 0.0)
    if duplicate_flag:
        fraud_flags.insert(0, duplicate_flag)
        authenticity_score -= 0.4
    authenticity_score = max(0.0, min(1.0, authenticity_score))
    return {"authenticity_score": authenticity_score, "fraud_flags": fraud_flags}
