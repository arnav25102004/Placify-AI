import http
import time
import uuid
from typing import Optional
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.auth_utils import decode_token
from app.database import engine, Base
from app.logging_config import (
    setup_logging,
    get_logger,
    set_request_context,
    clear_request_context,
)
from app.seed import seed_db
import app.models  # Ensure all models are registered with Base.metadata
from app.routers import auth, batches, documents, student, dev_db, pr, faculty, admin

# Initialize system-wide informative logging
setup_logging()
logger = get_logger("placify.api")

app = FastAPI(
    title="Placify AI — Placement Intelligence API",
    description="Placement document extraction, verification, and audit pipeline.",
    version="1.0.0",
)


def _extract_caller_info(auth_header: Optional[str]) -> str:
    """Safely extracts user identity from JWT without breaking unauthenticated calls."""
    if not auth_header or not auth_header.startswith("Bearer "):
        return "anonymous"
    token = auth_header.removeprefix("Bearer ").strip()
    try:
        payload = decode_token(token)
        user_id = payload.get("sub", "?")
        role = payload.get("role", "")
        campus_id = payload.get("campus_id", "")
        role_info = f"{role}" if role else "user"
        if campus_id:
            role_info += f",c:{campus_id}"
        return f"uid:{user_id}({role_info})"
    except Exception:
        return "invalid-auth"


# Auto-initialize and seed local database on startup
@app.on_event("startup")
def on_startup():
    logger.info("Starting Placify AI backend service...")
    logger.info("Verifying database connection and schemas...")
    Base.metadata.create_all(bind=engine)
    from app.database import ensure_user_profile_columns, ensure_document_columns
    ensure_user_profile_columns(engine)
    ensure_document_columns(engine)
    seed_db()
    logger.info("Placify AI services online and verified ready for requests.")


# Informative Enterprise Request Logging Middleware
@app.middleware("http")
async def enterprise_logging_middleware(request: Request, call_next):
    start_time = time.time()
    request_id = request.headers.get("X-Request-ID") or f"req-{uuid.uuid4().hex[:8]}"
    client_ip = request.client.host if request.client else "unknown"
    method = request.method
    path = request.url.path
    query = request.url.query
    full_url = f"{path}?{query}" if query else path
    auth_header = request.headers.get("Authorization")
    caller_info = _extract_caller_info(auth_header)
    content_length = request.headers.get("Content-Length", "0")
    user_agent = request.headers.get("User-Agent", "unknown")
    if len(user_agent) > 40:
        user_agent = user_agent[:37] + "..."

    # Bind request correlation context
    set_request_context(request_id, caller_info)

    logger.info(
        f"--> [HTTP IN] {method} {full_url} | client={client_ip} | caller={caller_info} | bytes_in={content_length} | agent='{user_agent}'"
    )

    try:
        response = await call_next(request)
        duration_ms = (time.time() - start_time) * 1000.0
        status = response.status_code

        # Determine HTTP status description
        try:
            status_phrase = http.HTTPStatus(status).phrase
        except ValueError:
            status_phrase = "Unknown"

        log_level = logger.info
        if status >= 500:
            log_level = logger.error
        elif status >= 400:
            log_level = logger.warning

        bytes_out = response.headers.get("Content-Length", "-")
        log_level(
            f"<-- [HTTP OUT] {method} {full_url} | status={status} {status_phrase} | latency={duration_ms:.2f}ms | bytes_out={bytes_out} | client={client_ip}"
        )

        response.headers["X-Request-ID"] = request_id
        return response
    except Exception as exc:
        duration_ms = (time.time() - start_time) * 1000.0
        logger.error(
            f"<-- [HTTP ERR] {method} {full_url} | status=500 Internal Server Error | latency={duration_ms:.2f}ms | client={client_ip} | error={type(exc).__name__}: {exc}",
            exc_info=True,
        )
        raise exc
    finally:
        clear_request_context()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "placify-ai-api", "storage": "local_sqlite_persistent"}


app.include_router(auth.router)
app.include_router(batches.router)
app.include_router(documents.router)
app.include_router(student.router)
app.include_router(dev_db.router)
app.include_router(pr.router)
app.include_router(faculty.router)
app.include_router(admin.router)
