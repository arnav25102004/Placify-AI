import os
from celery import Celery

# The worker process only imports app.tasks.extraction (via `include` below), which pulls in
# Document/Extraction but not every table Document has an FK to. Explicitly import all models
# here so SQLAlchemy's mapper configuration succeeds on the first query in this process too.
import app.models  # noqa: F401

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "placify_tasks",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["app.tasks.extraction"]
)

celery_app.conf.update(
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    worker_prefetch_multiplier=1,
    result_expires=3600,
)
