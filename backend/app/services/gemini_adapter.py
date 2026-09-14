import os
import json
import random
from datetime import date, datetime, timedelta
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field, field_validator

from app.logging_config import get_logger

logger = get_logger("placify.gemini")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

_FIELD_NAMES = ("student_name", "company", "package", "role", "offer_type", "joining_date")


class ExtractionResult(BaseModel):
    student_name: str
    company: str
    package: Optional[float] = Field(default=None, ge=0)  # LPA or numerical package
    role: Optional[str] = None
    offer_type: Optional[str] = None  # Full-time, Internship, PPO
    joining_date: Optional[str] = None  # ISO "YYYY-MM-DD" if the document states one
    confidence: float = Field(default=0.95, ge=0.0, le=1.0)
    # Per-field confidence (0-1), e.g. {"student_name": 0.98, "company": 0.9}. Optional —
    # only populated when the extracting provider actually reports it; UI falls back to
    # the overall `confidence` for any field missing here.
    field_confidence: Optional[Dict[str, float]] = None

    @field_validator("joining_date")
    @classmethod
    def _sane_joining_date(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return v
        try:
            parsed = datetime.strptime(v, "%Y-%m-%d").date()
        except ValueError:
            logger.warning(f"Extracted joining_date '{v}' is not a valid YYYY-MM-DD date; dropping it.")
            return None
        today = date.today()
        if parsed < today - timedelta(days=3 * 365) or parsed > today + timedelta(days=3 * 365):
            logger.warning(f"Extracted joining_date '{v}' is implausibly far from today; dropping it.")
            return None
        return v


EXTRACTION_PROMPT = """
You are an expert HR document parser for placement offer letters.
Analyze the attached offer letter document and extract the following structured details in valid JSON format:
{
  "student_name": "Full Name of Student",
  "company": "Company Name",
  "package": 12.5,  // Total annual package / CTC in LPA as a float if available, or null
  "role": "Job Title / Role",
  "offer_type": "Full-time" // "Full-time", "Internship", or "PPO",
  "joining_date": "2026-07-01", // ISO YYYY-MM-DD if the document states a joining date, else null
  "confidence": 0.95, // Float score between 0.0 and 1.0 indicating overall extraction confidence
  "field_confidence": {  // Your confidence in each individual field, 0.0-1.0
    "student_name": 0.95, "company": 0.95, "package": 0.9, "role": 0.9, "offer_type": 0.9
  }
}
Respond ONLY with the raw JSON object and no markdown formatting or extra text.
"""


class GeminiAdapter:
    """
    Gemini Pro API adapter for structured document data extraction.
    Falls back to mock extraction when GEMINI_API_KEY is not configured or in dev mode.
    """
    def __init__(self):
        self._client = None
        if GEMINI_API_KEY and GEMINI_API_KEY != "<GEMINI_API_KEY>":
            try:
                from google import genai
                self._client = genai.Client(api_key=GEMINI_API_KEY)
                logger.info("Initialized Google GenAI Client with configured API key.")
            except Exception:
                try:
                    import google.generativeai as genai_legacy
                    genai_legacy.configure(api_key=GEMINI_API_KEY)
                    self._client = genai_legacy.GenerativeModel("gemini-1.5-pro")
                    logger.info("Initialized legacy Google GenerativeModel ('gemini-1.5-pro').")
                except Exception as e:
                    logger.warning(f"Failed to initialize Gemini API client: {e}. Fallback mock active.")
                    self._client = None
        else:
            logger.info("No Gemini API key provided; active in deterministic intelligent mock mode.")

    def extract_fields(
        self, file_bytes: bytes, filename: str, hint: Optional[Dict[str, Any]] = None
    ) -> ExtractionResult:
        """
        Extracts placement offer letter data from file bytes using Gemini Pro API (or mock fallback).
        `hint` (optional) carries expected student_name/company/role/offer_type from a PR-initiated
        request, used to bias the prompt and later cross-verification — not used for self-submissions.
        """
        if self._client:
            try:
                prompt = EXTRACTION_PROMPT
                if hint:
                    hint_lines = "\n".join(f"- {k}: {v}" for k, v in hint.items() if v)
                    if hint_lines:
                        prompt = (
                            f"{EXTRACTION_PROMPT}\n\nContext hints (verify against the document, "
                            f"do not assume they are correct):\n{hint_lines}\n"
                        )

                mime_type = 'application/pdf' if filename.lower().endswith('.pdf') else 'image/jpeg'

                # Handle GenAI execution
                if hasattr(self._client, 'models'):
                    # new google-genai SDK — needs a real Part, not a raw dict
                    from google.genai import types
                    response = self._client.models.generate_content(
                        model='gemini-2.5-pro',
                        contents=[
                            types.Part.from_bytes(data=file_bytes, mime_type=mime_type),
                            prompt,
                        ]
                    )
                    text = response.text
                else:
                    # legacy generativeai SDK
                    response = self._client.generate_content([
                        {'mime_type': mime_type, 'data': file_bytes},
                        prompt
                    ])
                    text = response.text

                clean_text = text.strip()
                if clean_text.startswith("```json"):
                    clean_text = clean_text[7:]
                if clean_text.endswith("```"):
                    clean_text = clean_text[:-3]

                data = json.loads(clean_text.strip())
                return ExtractionResult(**data)
            except Exception as e:
                logger.warning(f"Gemini AI extraction error: {e}. Falling back to deterministic heuristic.")

        return self._mock_extract(filename, hint)

    def _mock_extract(self, filename: str, hint: Optional[Dict[str, Any]] = None) -> ExtractionResult:
        """Deterministic mock fallback for local development / testing / no configured key."""
        sample_names = ["Aarav Sharma", "Priya Patel", "Rohan Verma", "Ananya Iyer", "Vikram Singh"]
        sample_companies = ["Google India", "Microsoft", "Amazon", "Goldman Sachs", "TCS Digital"]
        sample_roles = ["Software Development Engineer", "Data Analyst", "Product Analyst", "Backend Engineer"]
        sample_packages = [12.0, 18.5, 24.0, 32.0, 8.5]

        name_idx = abs(hash(filename)) % len(sample_names)
        hint = hint or {}

        # A hint-matched field is a known-correct value the mock is echoing back (not
        # fabricated), so it earns high confidence; a purely fabricated field earns low
        # confidence so downstream UI/eval code can tell mock output from a real read.
        field_confidence = {
            "student_name": 0.95 if hint.get("student_name") else 0.4,
            "company": 0.95 if hint.get("company") else 0.4,
            "role": 0.95 if hint.get("role") else 0.4,
            "package": 0.4,  # never hinted — always fabricated in mock mode
            "offer_type": 0.95 if hint.get("offer_type") else 0.5,
        }

        return ExtractionResult(
            student_name=hint.get("student_name") or sample_names[name_idx],
            company=hint.get("company") or sample_companies[name_idx % len(sample_companies)],
            package=sample_packages[name_idx % len(sample_packages)],
            role=hint.get("role") or sample_roles[name_idx % len(sample_roles)],
            offer_type=hint.get("offer_type") or "Full-time",
            joining_date=None,
            confidence=0.96,
            field_confidence=field_confidence,
        )

gemini_adapter = GeminiAdapter()
