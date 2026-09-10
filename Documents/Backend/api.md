# API Contract — Placify AI (Teacher Portal)

## Purpose
Defines the HTTP surface the Frontend talks to — the single entry point through which every teacher action flows.

## Responsibilities
Own the request/response shape for every teacher-facing action: login, batch upload, document status polling, verification actions, and ERP export.

## Scope
Covers the HTTP contract only. Does NOT cover what happens behind each endpoint (see [`architecture.md`](architecture.md), [`queue.md`](queue.md), [`services.md`](services.md)) or auth mechanics (see [`authentication.md`](authentication.md)).

## High-Level Overview
All endpoints are versioned under `/api/v1/`, JSON in and out (except file upload, which is multipart), and require a bearer JWT except `/auth/login`.

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v1/auth/login` | POST | Email+password → JWT (PRs, faculty, placement_coordinators, admins) |
| `/api/v1/pr/students` | GET / POST | PR lists and adds/edits students in their assigned 15-student cohort |
| `/api/v1/pr/students/{id}/upload` | POST | PR uploads offer letter for a student, dynamically assigning In-charge Faculty |
| `/api/v1/students/directory` | GET | Campus peer/senior directory (filtered by batch timeline, company, compensation) |
| `/api/v1/placements/history` | GET | Placement outcomes & company history across past/current batches |
| `/api/v1/pr/pipeline` | GET | PR cohort pipeline monitoring (status of assigned 15 students) |
| `/api/v1/faculty/queue` | GET | In-charge faculty review queue of auto-matched documents |
| `/api/v1/coordinator/drives` | GET | Placement Coordinator campus-wide placement drive tracker & stats |
| `/api/v1/coordinator/assign-faculty` | POST | Placement Coordinator assigns or reassigns In-charge Faculty for students |
| `/api/v1/batches` | POST | Create a batch, upload files (multipart, streamed to Drive) |
| `/api/v1/batches` | GET | List the authenticated teacher's batches |
| `/api/v1/batches/{batch_id}/documents` | GET | Per-document status within a batch (`pending`/`processing`/`needs_review`/`verified`/`rejected`) |
| `/api/v1/documents/{document_id}` | GET | Full extraction detail + Drive preview link, for the verification workspace |
| `/api/v1/documents/{document_id}/verify` | POST | Approve / reject / edit action; writes `audit_logs` |
| `/api/v1/documents/{document_id}/export` | POST | Direct REST push of approved document data to College ERP |
| `/api/v1/batches/{batch_id}/export` | POST | Triggers ERP export for all verified documents in the batch |

## Design Principles
1. **Single entry point.** All of the above are the only way the Frontend touches backend state — no direct DB or Drive access from the client. See [`architecture.md`](architecture.md) Design Principle 3.
2. **Status is always pollable, never silent.** The per-document status endpoint exists specifically so the Frontend can show `Queued`/`Processing`/`Done` accurately (see [ADR-004](../architecture-decisions.md#adr-004-fifo-queue-ordering-for-phase-1)) rather than the UI going quiet during a long queue wait.
3. **Batch upload returns before processing completes.** `POST /batches` returns `202 Accepted` with the created batch/document IDs as soon as files are stored and jobs enqueued — never waits for extraction. See [`queue.md`](queue.md).

## Workflow
See [`Documents/index.md`](../index.md) Workflow diagram for how these endpoints compose into the full upload-to-export flow.

## Inputs
Multipart file uploads; JSON action payloads (approve/reject/edit reasons); JWT bearer tokens.

## Outputs
JSON responses per endpoint above; `202 Accepted` for the upload endpoint specifically (not `200`), signaling "accepted for async processing."

## Dependencies
- [`Backend/authentication.md`](authentication.md) — token validation on every route.
- [`Backend/queue.md`](queue.md) — what `POST /batches` triggers.
- [`Database/architecture.md`](../Database/architecture.md) — the tables each endpoint reads/writes.

## Interactions with Other Services
- **ERP export** (`POST /batches/{batch_id}/export`): transforms verified `extractions` rows into the ERP's expected schema and either POSTs to the ERP's REST API or generates a downloadable CSV — the exact ERP contract is an open integration to be scoped with the college's ERP vendor/team before this endpoint is implemented.

## Security Considerations
Every route except login validates the JWT and scopes queries to the authenticated teacher/campus per [`authentication.md`](authentication.md) — no exceptions, including the export endpoint (a teacher can only export their own batches).

## Performance Considerations
Upload endpoint performance is dominated by file transfer time to Drive, not by any processing — this is intentional (see [`services.md`](services.md) resumable upload approach).

## Future Improvements
- Real-time status push (via Kafka/websockets) instead of polling, once the PR Portal's real-time requirements justify introducing Kafka (Phase 2, per the product roadmap) — Phase 1 uses polling deliberately, to avoid pulling in Kafka before there's a second consumer that needs it.
- ERP export contract needs to be scoped as its own decision once the ERP vendor's API/format is confirmed — not yet an open ADR because the shape is entirely unknown, not merely undecided.

## Notes for Developers
Do not add an endpoint that lets the Frontend pass a raw file directly to Gemini or Drive from the client side, bypassing this contract — every file must flow through `POST /batches` so it's recorded in Postgres first, per [ADR-001](../architecture-decisions.md#adr-001-async-job-queue-for-document-extraction) and the raw-before-transformed principle.
