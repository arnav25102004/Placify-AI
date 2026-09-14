import contextvars
import json
import logging
import os
import sys
import time
from typing import Optional

# Context variables for request correlation and authenticated caller tracking
request_id_ctx: contextvars.ContextVar[str] = contextvars.ContextVar("request_id", default="-")
user_ctx: contextvars.ContextVar[str] = contextvars.ContextVar("user_info", default="-")

def set_request_context(request_id: str, user_info: str = "-") -> None:
    """Sets correlation request ID and caller identity for the current async task context."""
    request_id_ctx.set(request_id)
    user_ctx.set(user_info)

def clear_request_context() -> None:
    """Resets request correlation context."""
    request_id_ctx.set("-")
    user_ctx.set("-")


class ContextFilter(logging.Filter):
    """
    Injects dynamic context variables (request_id, user_info) into log records.
    """
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_ctx.get("-")
        record.user_info = user_ctx.get("-")
        return True


class TextConsoleFormatter(logging.Formatter):
    """
    Human-readable, informative formatter with ANSI colors, precise timestamps,
    component identifiers, and request/user correlation tags.
    """
    COLOR_CODES = {
        logging.DEBUG: "\033[36m",     # Cyan
        logging.INFO: "\033[32m",      # Green
        logging.WARNING: "\033[33m",   # Yellow
        logging.ERROR: "\033[31m",     # Red
        logging.CRITICAL: "\033[1;31m",# Bold Red
    }
    RESET_CODE = "\033[0m"
    DIM_CODE = "\033[2m"
    BOLD_CODE = "\033[1m"

    def __init__(self, use_colors: bool = True):
        super().__init__()
        self.use_colors = use_colors and sys.stdout.isatty()

    def formatTime(self, record: logging.LogRecord, datefmt: Optional[str] = None) -> str:
        ct = self.converter(record.created)
        t = time.strftime("%Y-%m-%d %H:%M:%S", ct)
        s = f"{t}.{int(record.msecs):03d}"
        return s

    def format(self, record: logging.LogRecord) -> str:
        timestamp = self.formatTime(record)
        level = record.levelname
        name = record.name
        req_id = getattr(record, "request_id", "-")
        user = getattr(record, "user_info", "-")
        message = record.getMessage()

        # Build context tag
        ctx_parts = []
        if req_id != "-":
            ctx_parts.append(f"req={req_id}")
        if user != "-":
            ctx_parts.append(f"user={user}")
        
        context_tag = f" [{', '.join(ctx_parts)}]" if ctx_parts else ""

        if self.use_colors:
            color = self.COLOR_CODES.get(record.levelno, "")
            formatted = (
                f"{self.DIM_CODE}{timestamp}{self.RESET_CODE} "
                f"{color}{self.BOLD_CODE}[{level:^5}]{self.RESET_CODE} "
                f"{self.DIM_CODE}[{name}]{self.RESET_CODE}"
                f"{self.DIM_CODE}{context_tag}{self.RESET_CODE} "
                f"{message}"
            )
        else:
            formatted = f"{timestamp} [{level:^5}] [{name}]{context_tag} {message}"

        if record.exc_info:
            if not record.exc_text:
                record.exc_text = self.formatException(record.exc_info)
            if record.exc_text:
                formatted = f"{formatted}\n{record.exc_text}"

        return formatted


class JsonLogFormatter(logging.Formatter):
    """
    Structured JSON formatter for production log aggregation (Prometheus/Grafana/ELK/Datadog).
    """
    def formatTime(self, record: logging.LogRecord, datefmt: Optional[str] = None) -> str:
        ct = self.converter(record.created)
        t = time.strftime("%Y-%m-%dT%H:%M:%S", ct)
        return f"{t}.{int(record.msecs):03d}Z"

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": getattr(record, "request_id", "-"),
            "user": getattr(record, "user_info", "-"),
            "source": f"{record.filename}:{record.lineno}",
        }
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry)


def setup_logging(log_level: Optional[str] = None, log_format: Optional[str] = None) -> None:
    """
    Sets up application-wide informative logging.
    Can be configured via environment variables:
      - LOG_LEVEL: DEBUG, INFO, WARNING, ERROR (default: INFO)
      - LOG_FORMAT: text (default), json
      - LOG_COLORS: true (default), false
    """
    level_name = (log_level or os.getenv("LOG_LEVEL", "INFO")).upper()
    level = getattr(logging, level_name, logging.INFO)
    fmt_type = (log_format or os.getenv("LOG_FORMAT", "text")).lower()
    use_colors = os.getenv("LOG_COLORS", "true").lower() in ("true", "1", "yes")

    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Clear existing handlers to prevent duplicates
    for handler in list(root_logger.handlers):
        root_logger.removeHandler(handler)

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)
    handler.addFilter(ContextFilter())

    if fmt_type == "json":
        handler.setFormatter(JsonLogFormatter())
    else:
        handler.setFormatter(TextConsoleFormatter(use_colors=use_colors))

    root_logger.addHandler(handler)

    # Silence excessively verbose external loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("multipart").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """
    Returns an application logger for the given module/subsystem.
    Example: logger = get_logger("placify.auth")
    """
    return logging.getLogger(name)
