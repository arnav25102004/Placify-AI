"""
Input guardrails for uploaded offer-letter files: a size limit (none existed
before this) and real MIME sniffing from the file's magic bytes rather than
trusting the client-declared Content-Type header.
"""
from fastapi import HTTPException

MAX_UPLOAD_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB

_MAGIC_SIGNATURES = {
    b"%PDF": "application/pdf",
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG\r\n\x1a\n": "image/png",
}


def validate_upload(content: bytes, filename: str) -> str:
    """
    Raises HTTPException(400) if the content is empty, too large, or not a
    recognized PDF/JPEG/PNG by its actual bytes. Returns the sniffed content
    type on success — callers should use this, not the client-declared one,
    when storing the file.
    """
    if not content:
        raise HTTPException(status_code=400, detail="File content cannot be empty")

    if len(content) > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File '{filename}' exceeds the {MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)}MB upload limit",
        )

    for signature, content_type in _MAGIC_SIGNATURES.items():
        if content.startswith(signature):
            return content_type

    raise HTTPException(
        status_code=400,
        detail=f"File '{filename}' is not a recognized PDF/JPEG/PNG file (checked by content, not filename)",
    )
