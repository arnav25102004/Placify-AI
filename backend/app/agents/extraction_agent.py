"""Agent 2: Field Extraction — turns a document into a structured ExtractionResult."""
from typing import Any, Dict, Optional

from app.agents.ingestion_agent import extract_text
from app.logging_config import get_logger
from app.services.gemini_adapter import ExtractionResult, EXTRACTION_PROMPT, gemini_adapter
from app.services.llm_client import llm_client

logger = get_logger("placify.extraction_agent")


def extract(file_bytes: bytes, filename: str, hint: Optional[Dict[str, Any]] = None) -> ExtractionResult:
    """
    Real read-the-file path: local OCR -> multi-provider LLM (text-only, JSON mode).
    Falls back to gemini_adapter's own multimodal call (and, inside that, its
    deterministic mock) when OCR text isn't available or the LLM path doesn't
    return a usable result — this function never fails the pipeline.
    """
    ocr_text = extract_text(file_bytes, filename)

    if ocr_text:
        prompt = EXTRACTION_PROMPT
        if hint:
            hint_lines = "\n".join(f"- {k}: {v}" for k, v in hint.items() if v)
            if hint_lines:
                prompt = (
                    f"{EXTRACTION_PROMPT}\n\nContext hints (verify against the document, "
                    f"do not assume they are correct):\n{hint_lines}\n"
                )
        prompt = f"{prompt}\n\nDocument text (OCR output):\n{ocr_text[:8000]}"

        data = llm_client.generate_json(prompt)
        if data:
            try:
                result = ExtractionResult(**data)
                logger.info(f"Extraction served by OCR+LLM text path for '{filename}'")
                return result
            except Exception as e:
                logger.warning(f"LLM JSON for '{filename}' did not match ExtractionResult schema: {e}")

    return gemini_adapter.extract_fields(file_bytes, filename, hint=hint)
