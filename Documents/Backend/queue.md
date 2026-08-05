# Queue & Concurrency — Placify AI (Teacher Portal)

## Purpose
Defines exactly how document extraction jobs are queued and processed, and why this design does not degrade or fail when multiple teachers upload large batches simultaneously. This is the single most load-bearing document in the Backend domain — it answers "will this crash."

## Responsibilities
- Guarantee upload requests return quickly regardless of batch size or concurrent teacher count.
- Guarantee Gemini API call volume never exceeds its rate limit, regardless of queue depth.
- Guarantee no job is silently lost on worker failure.

## Scope
Covers the queue/worker model and its behavior under concurrent load. Does NOT cover the Gemini/Drive API integration detail itself (see [`services.md`](services.md)) or the HTTP contract (see [`api.md`](api.md)).

## High-Level Overview
Redis holds a single Celery task queue. A fixed pool of Celery worker processes continuously pulls jobs off that queue, one job per free worker, and executes the extraction task (fetch file from Drive → call Gemini → parse result → write to Postgres). The number of documents being extracted **at any instant** is bounded by worker count — never by how many teachers are uploading or how many jobs are waiting.

```
Teacher A uploads 50 ─┐
Teacher B uploads 50 ─┼──► FastAPI writes rows, enqueues 1 job per doc, returns instantly
Teacher C uploads 50 ─┘
                              │
                              ▼
                    Redis queue (FIFO): [A1,A2,...,A50,B1,...,B50,C1,...,C50]
                              │
                     ┌────────┴────────┬────────┬────────┬────────┬────────┐
                     ▼                 ▼         ▼        ▼        ▼        ▼
                 Worker 1          Worker 2  Worker 3 Worker 4 Worker 5 Worker 6
                     │                 │         │        │        │        │
                     └─────────────────┴─────────┴────────┴────────┴────────┘
                                        all call Gemini, rate-limited via token bucket
```

## Design Principles
1. **Worker count, not teacher count, bounds Gemini call concurrency.** This is the entire safety argument: 1 teacher or 20 teachers uploading simultaneously produces the same number of in-flight Gemini calls — only queue depth changes, never concurrency. See [ADR-001](../architecture-decisions.md#adr-001-async-job-queue-for-document-extraction).
2. **FIFO ordering for Phase 1, deliberately.** Jobs are processed strictly in arrival order across all teachers' batches — there is no per-teacher fairness guarantee yet. See [ADR-004](../architecture-decisions.md#adr-004-fifo-queue-ordering-for-phase-1) for why this was chosen over a round-robin dispatcher, and what signal would justify revisiting it.
3. **Outbound rate limiting, not inbound rejection.** Gemini's own requests-per-minute quota is respected via a Redis-backed token bucket that workers must acquire from before calling Gemini — uploads are never rejected or throttled to protect Gemini; only the outbound call rate is.
4. **At-least-once job execution.** Celery workers use `acks_late=True`, so a job returns to the queue if its worker crashes mid-execution, rather than silently disappearing. Extraction logic must therefore be idempotent-safe (safe to run twice on the same document without corrupting state).
5. **Retry with backoff before giving up.** A failed extraction call (e.g., transient `429` or network error) retries automatically (exponential backoff, capped at ~3–4 attempts) before the document is flagged `needs_manual_review` — failures are visible and actionable, never silent.
6. **Circuit breaker for sustained outages.** If consecutive failures exceed a threshold (suggesting Gemini itself is down, not a transient blip), the worker pool pauses consumption and raises an alert rather than continuing to fail every job in the queue. See [`DevOps/monitoring.md`](../DevOps/monitoring.md).

## Workflow
**Per-document job lifecycle:**
1. FastAPI writes a `documents` row (`status=pending`) and calls `extract_document.delay(document_id)`.
2. Job lands at the back of the Redis queue.
3. A free worker pops the job, sets `status=processing`.
4. Worker acquires a token from the rate-limit bucket (waits if none available).
5. Worker fetches the file from Google Drive, calls Gemini, parses the structured response.
6. On success: writes to `extractions`, sets `status=needs_review`.
7. On transient failure: retries with backoff (steps 4–6 repeat).
8. On repeated failure: sets `status=needs_manual_review`, logs the failure for `DevOps/monitoring.md` alerting.

## Inputs
One Celery job per uploaded document, containing `document_id` only (the job looks up everything else from Postgres/Drive — no large payloads passed through Redis).

## Outputs
Updated `documents.status` and new `extractions` rows in PostgreSQL (see [`Database/architecture.md`](../Database/architecture.md)).

## Dependencies
- [`Backend/services.md`](services.md) — the actual Gemini/Drive calls a worker makes.
- [`Database/architecture.md`](../Database/architecture.md) — `documents` and `extractions` schema.
- [`DevOps/monitoring.md`](../DevOps/monitoring.md) — queue depth and failure-rate alerting.
- [ADR-001](../architecture-decisions.md#adr-001-async-job-queue-for-document-extraction), [ADR-004](../architecture-decisions.md#adr-004-fifo-queue-ordering-for-phase-1).

## Interactions with Other Services
Workers are the **only** part of the backend that calls Gemini or Google Drive directly — see [`Backend/architecture.md`](architecture.md) Design Principle 1. FastAPI never talks to either service directly.

## Security Considerations
Job payloads contain only a `document_id`, never file contents or extracted PII, keeping sensitive student data out of Redis (which is not the system of record and should not need the same access controls as Postgres).

## Performance Considerations
- **Worker count sizing:** start at 6 workers. Each Gemini call takes ~2–8s; 6 workers clears roughly 2,700–4,200 documents/hour, comfortably ahead of the ~2,200/hour peak-season burst estimate. This is a config value (`--concurrency=N`), not a code change — tune it based on observed queue-depth metrics.
- **Rate-limit bucket sizing:** must be set to the actual confirmed RPM/TPM quota of the college's paid Gemini tier — this number is an open input, not yet confirmed (see [`Documents/index.md`](../index.md) Architecture Review). Worker count should never be set high enough that even fully-parallel workers would exceed this quota — the token bucket is the real limiter regardless of worker count.
- **What "10 teachers upload at once" actually costs:** queue depth grows to ~500 jobs; total drain time grows accordingly; Gemini call concurrency stays exactly at worker-pool size the entire time. No component's failure mode is triggered by teacher count.

## Future Improvements
- Per-teacher round-robin fair dispatch (deferred per [ADR-004](../architecture-decisions.md#adr-004-fifo-queue-ordering-for-phase-1)) — build only if real usage shows FIFO wait times under concurrent bursts are a genuine problem.
- Per-batch priority (e.g., smaller batches jump ahead of large ones) — not currently planned, would need its own ADR if proposed.

## Notes for Developers
Never add a code path that calls Gemini or Drive from inside a FastAPI request handler — always enqueue a Celery task instead, even for "just one file." If you're tempted to special-case a single-file upload as synchronous "since it's fast," don't — consistency here is what keeps the concurrency story simple and provable. When you change worker count or the rate-limit bucket size, note the new values here and in [`DevOps/deployment.md`](../DevOps/deployment.md) so they don't drift out of sync.
