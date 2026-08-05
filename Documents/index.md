# Documents Index — Placify AI

## Purpose
This is the map of the entire Placify AI documentation tree. Any agent or contributor asking "where do I look for X?" starts here, second stop after [`Agent.md`](../Agent.md).

## Responsibilities
- List every domain and its entry document.
- Give a shallow, two-minute system overview (depth lives in domain documents, never duplicated here).
- State platform-wide design principles.
- Show the major end-to-end flow so a reader can trace one document/request through every layer without opening every file.

## Scope
Covers navigation and cross-cutting principles for the **Teacher Portal module only** — the only module currently architected in depth. PR Portal and Student Portal domains do not exist yet in this tree; see [`Agent.md`](../Agent.md) Future Improvements.

## High-Level Overview
Placify AI's Teacher Portal lets a teacher upload a batch of offer letters (PDFs/images), which are processed asynchronously by Gemini Pro to extract structured student/placement data, verified side-by-side by the teacher against the original document, and exported to the college ERP on approval. The system must not block or fail when multiple teachers upload large batches simultaneously — this is the central non-functional requirement driving the Backend and Database designs.

| Domain | Entry Document | Concern |
|---|---|---|
| Backend | [`Backend/architecture.md`](Backend/architecture.md) | API server, async job processing, queueing, external integrations |
| Database | [`Database/architecture.md`](Database/architecture.md) | Schema, indexing, migrations, data integrity |
| Frontend | [`Frontend/architecture.md`](Frontend/architecture.md) | Teacher-facing React app: upload, verification workspace, dashboards |
| DevOps | [`DevOps/deployment.md`](DevOps/deployment.md) | Containerization, CI/CD, monitoring, deployment topology |
| AI | [`AI/index.md`](AI/index.md) | How AI agents operate on this repo, plus the Gemini extraction integration's operating rules |

## Design Principles
1. **Documentation-first.** No component is implemented before its design document exists under `Documents/` and is treated as final. See [`AI/agents.md`](AI/agents.md).
2. **Decouple accept-from-process.** Any request that triggers slow, failure-prone external work (Gemini extraction, Drive upload) is split into an instant accept step and a queued processing step — never done inline on the request thread. See [ADR-001](architecture-decisions.md#adr-001-async-job-queue-for-document-extraction) and [`Backend/queue.md`](Backend/queue.md).
3. **Queue absorbs burstiness, never fails on it.** Concurrent uploads from multiple teachers increase queue depth and wait time, never error rate. See [`Backend/queue.md`](Backend/queue.md).
4. **Rate-limit outbound, not inbound.** External API limits (Gemini) are respected by throttling calls to that API, not by rejecting teacher uploads. See [`Backend/queue.md`](Backend/queue.md).
5. **Raw-before-transformed.** The original uploaded file is stored in Google Drive and referenced by ID before any AI transformation runs, so a bad extraction never destroys the ability to reprocess. See [`Database/architecture.md`](Database/architecture.md).
6. **Append-only audit trail.** Every approve/reject/edit action is an immutable new row, never an overwrite or delete. See [ADR-002](architecture-decisions.md#adr-002-append-only-audit-log) and [`Database/architecture.md`](Database/architecture.md).
7. **Single entry point.** The React frontend talks only to the FastAPI backend — never directly to Postgres, Redis, Google Drive, or Gemini. See [`Backend/architecture.md`](Backend/architecture.md).
8. **Observability before scaling.** Queue depth, Gemini call latency/error rate, and worker throughput are instrumented before adding more workers or campuses. See [`DevOps/monitoring.md`](DevOps/monitoring.md).

## Architecture Review & Key Recommendations
Non-obvious refinements made while designing this system, each with its ADR:
- **Celery requires Redis as its broker from Phase 1, not Phase 2.** The originally proposed "Celery with SQLAlchemy broker" is not a valid configuration — SQLAlchemy can only serve as a result backend. See [ADR-001](architecture-decisions.md#adr-001-async-job-queue-for-document-extraction).
- **Google Drive replaces Cloudinary for file storage**, using a service account against a Shared Drive, not a personal account — personal accounts don't survive account offboarding. See [ADR-003](architecture-decisions.md#adr-003-google-drive-as-document-storage).
- **FIFO queue, not per-teacher fair-dispatch, for Phase 1.** A round-robin dispatcher across teacher batches was considered and deferred — see [ADR-004](architecture-decisions.md#adr-004-fifo-queue-ordering-for-phase-1).

## Workflow
**Document upload → verification → export path:**
```
Teacher (browser)
   │  upload batch (≤50 files)
   ▼
FastAPI  ──────────────► Google Drive (Shared Drive)
   │  writes batch + document rows        (raw file stored, file_id returned)
   ▼
PostgreSQL (status: pending)
   │  enqueues 1 job per document
   ▼
Redis (Celery broker / FIFO queue)
   │  drained by fixed worker pool, rate-limited to Gemini quota
   ▼
Celery Worker ─────────► Gemini Pro API (structured extraction)
   │  writes result
   ▼
PostgreSQL (extractions table, status: needs_review)
   │  teacher opens Verification Workspace
   ▼
Teacher approves / edits / rejects ──► audit_logs (append-only)
   │  on batch complete
   ▼
Export to ERP (REST push or CSV)
```
See [`Backend/architecture.md`](Backend/architecture.md) for the full request lifecycle and [`Backend/queue.md`](Backend/queue.md) for how this holds under concurrent multi-teacher load.

## Inputs
Teacher-uploaded offer letter files (PDF/image), teacher verification actions (approve/reject/edit).

## Outputs
Verified, structured placement records exported to the college ERP; an immutable audit trail of all verification actions.

## Dependencies
- [`Backend/architecture.md`](Backend/architecture.md)
- [`Database/architecture.md`](Database/architecture.md)
- [`Frontend/architecture.md`](Frontend/architecture.md)
- [`DevOps/deployment.md`](DevOps/deployment.md)
- [`AI/index.md`](AI/index.md)
- [`architecture-decisions.md`](architecture-decisions.md)
- [`future-additions.md`](future-additions.md) — non-normative preview of Phase 2 (PR Portal) and Phase 3 (Student Portal)

## Interactions with Other Services
N/A — this is a documentation index, not a runtime component. Runtime service interactions are detailed in [`Backend/architecture.md`](Backend/architecture.md).

## Security Considerations
N/A at index level — see [`Backend/authentication.md`](Backend/authentication.md) for auth/access-control detail and [`Database/architecture.md`](Database/architecture.md) for data-integrity/audit detail.

## Performance Considerations
N/A at index level — see [`Backend/queue.md`](Backend/queue.md) for concurrency/throughput detail.

## Future Improvements
- Add a "Read Path" flow diagram once the Student Portal (analytics-heavy, read-heavy) is architected — this index currently only documents the Teacher Portal's write/verification path.
- Add PR Portal and Student Portal rows to the domain table once those modules are designed. See [`future-additions.md`](future-additions.md) for the current, non-normative preview of both.

## Notes for Developers
Keep this table's rows in sync with what actually exists on disk under `Documents/` — if you add a domain folder, add its row here in the same change. Do not duplicate architectural depth here; if you find yourself writing more than one paragraph about how something works, that content belongs in the domain document, with this index linking to it.
