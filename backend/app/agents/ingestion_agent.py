"""Agent 1: Ingestion & Pre-OCR — turns raw uploaded bytes into plain text."""
import io

from app.logging_config import get_logger

logger = get_logger("placify.ingestion_agent")


def extract_text(file_bytes: bytes, filename: str) -> str:
    """
    OCRs a PDF or image into plain text using local Tesseract (no API key needed).
    Never raises — returns "" on any failure so callers can fall back to a
    hint-only or mock extraction rather than breaking the pipeline.
    """
    try:
        import pytesseract
        from PIL import Image

        if filename.lower().endswith(".pdf"):
            from pdf2image import convert_from_bytes

            pages = convert_from_bytes(file_bytes)
            text_parts = [pytesseract.image_to_string(page) for page in pages]
            text = "\n".join(text_parts).strip()
        else:
            image = Image.open(io.BytesIO(file_bytes))
            text = pytesseract.image_to_string(image).strip()

        logger.info(f"OCR extracted {len(text)} characters from '{filename}'")
        return text
    except Exception as e:
        logger.warning(f"OCR extraction failed for '{filename}': {type(e).__name__}: {e}")
        return ""
