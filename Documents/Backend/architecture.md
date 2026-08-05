> This document is also the entry point for the `Backend/` documentation folder.

# Backend Architecture — Placify AI (Teacher Portal)

## Purpose
Defines the shape of the backend system for the Teacher Portal: a single FastAPI monolith backed by an async job queue, and why that shape is correct at current scale.

## Responsibilities
- Accept authenticated teacher requests (login, batch upload, verification actions, export).
- Persist all state changes to PostgreSQL.
- Offload slow, external-API-dependent work (Gemini extraction, Google Drive I/O) to background workers.
- Never let request latency depend on external API latency.

## Scope
Covers the backend's overall shape and how its pieces fit together. Does NOT cover: authentication mechanics (see [`authentication.md`](authentication.md)), queue/concurrency mechanics (see [`queue.md`](queue.md)), external service integration detail (see [`services.md`](services.md)), or the HTTP contract itself (see [`api.md`](api.md)).

## High-Level Overview
The backend is a **single FastAPI monolith** for Phase 1 — not microservices. With one user type (teachers), one core workflow (upload → extract → verify → export), and a 4-person team, splitting into services would add deployment and coordination overhead without a corresponding benefit. See [ADR-001](../architecture-decisions.md#adr-001-async-job-queue-for-document-extraction).

The one architectural rule that matters more than any other: **the request/response cycle never waits on Gemini or Google Drive for anything slower than a single file transfer.** Every code path that would otherwise block on an external API is split into (a) an instant, synchronous "accept and record" step, and (b) an asynchronous "do the slow work" step picked up by a Celery worker. This is what allows the same backend to serve one teacher or twenty teachers uploading simultaneously without behaving differently.

```
┌─────────────────────────────────────────────────────────┐
│                      FastAPI (sync)                      │
│  auth │ batch upload │ verification actions │ export     │
└──────────────┬────────────────────────────────┬──────────┘
               │ writes                          │ enqueues
               ▼                                  ▼
        PostgreSQL                          Redis (Celery broker)
               ▲                                  │
               │ writes result                    ▼
               └──────────────────────── Celery Worker Pool
                                                   │
                                    ┌──────────────┴──────────────┐
                                    ▼                              ▼
                              Gemini Pro API                Google Drive API
```

## Design Principles
1. **Accept-then-process, never process-inline.** Any handler that would call Gemini or upload to Drive synchronously is a bug, not a shortcut. See [ADR-001](../architecture-decisions.md#adr-001-async-job-queue-for-document-extraction).
2. **Stateless API layer.** FastAPI holds no in-memory session/job state — everything needed to resume or inspect a job lives in PostgreSQL or Redis, so the API layer can run multiple replicas behind Nginx without coordination.
3. **One database, one source of truth.** No caching layer sits between the API and Postgres for Phase 1 beyond Redis's narrow role as a queue and short-TTL preview-link cache (see [`services.md`](services.md)) — premature caching adds staleness risk without a proven need at this scale.
4. **Monolith now, seams for later.** Code is organized by domain module (auth, documents, extraction, export) inside the one FastAPI app, so a future split (e.g., extracting the document-processing path into its own service in Phase 3) is a extraction of an existing module boundary, not a rewrite.

## Workflow
See [`Documents/index.md`](../index.md) Workflow section for the full upload-to-export flow diagram. This document's concern is only the backend's internal shape, not the end-to-end product flow.

## Inputs
HTTP requests from the Frontend (see [`../Frontend/architecture.md`](../Frontend/architecture.md)): login, batch upload (multipart file stream), verification actions, export trigger.

## Outputs
JSON API responses; enqueued Celery jobs; rows written to PostgreSQL; files written to Google Drive; ERP export payloads (REST push or CSV).

## Dependencies
- [`Database/architecture.md`](../Database/architecture.md) — schema this backend reads/writes.
- [`Backend/queue.md`](queue.md) — how async job processing is structured.
- [`Backend/services.md`](services.md) — Gemini and Google Drive integration detail.
- [`Backend/authentication.md`](authentication.md) — login and access control.
- [`Backend/api.md`](api.md) — the HTTP contract itself.
- [`DevOps/deployment.md`](../DevOps/deployment.md) — how this runs in containers.

## Interactions with Other Services
- **Frontend → Backend:** HTTPS/JSON, single entry point through Nginx (no direct Frontend-to-Postgres or Frontend-to-Drive access).
- **Backend → PostgreSQL:** synchronous, via SQLAlchemy, for all state reads/writes.
- **Backend → Redis:** synchronous enqueue on write paths; Celery workers consume asynchronously.
- **Backend → Google Drive / Gemini:** only from within Celery workers, never from the FastAPI request path. See [`services.md`](services.md).

## Security Considerations
- All endpoints except login require a valid JWT; role/campus scoping enforced at the query layer, not just the route layer (a teacher's queries are always filtered by their own `teacher_id`/`campus_id` server-side, never trusted from client input). See [`authentication.md`](authentication.md).
- File uploads are validated by content-type and size limit before being accepted, to avoid arbitrary file storage abuse.
- No secrets (Gemini API key, Drive service account credentials, DB credentials) are ever committed to the repo — see [`DevOps/deployment.md`](../DevOps/deployment.md) for secret management.

## Performance Considerations
- Throughput is governed by Celery worker count, not by API server capacity — see [`queue.md`](queue.md) for the concurrency model and sizing rationale.
- The FastAPI layer itself can be horizontally scaled (multiple replicas behind Nginx) if it ever becomes a bottleneck, but at Phase 1 scale (220 teachers) this is not expected to be necessary.

## Future Improvements
- If the Student Portal's read-heavy analytics traffic (10,000+ juniors) eventually shares this backend, revisit whether it needs to be split into its own service rather than added as another module in this monolith — do not assume the current monolith shape extends unchanged to that traffic profile.

## Notes for Developers
When adding a new endpoint, ask first: "does this touch Gemini or Drive?" If yes, it must enqueue a job, not call the service inline — this is the one rule most likely to be violated under time pressure, and it's the rule the entire concurrency story depends on. See [`queue.md`](queue.md) before writing any handler that touches an external API.
