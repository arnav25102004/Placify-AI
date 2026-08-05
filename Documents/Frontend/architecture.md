> This document is also the entry point for the `Frontend/` documentation folder.

# Frontend Architecture — Placify AI (Teacher Portal)

## Purpose
Defines the shape of the Teacher Portal's React application and how it reflects backend job state (queued/processing/done) honestly to the user during async processing.

## Responsibilities
- Render login, dashboard, batch upload, verification workspace, and audit log views.
- Poll or reflect per-document status accurately, so a long queue wait reads as expected behavior, not a bug.
- Talk to the Backend exclusively through the API contract in [`Backend/api.md`](../Backend/api.md) — never directly to Postgres, Drive, or Gemini.

## Scope
Covers the overall app shape. Does NOT cover routing detail (see [`routing.md`](routing.md)), state management (see [`state-management.md`](state-management.md)), the API client layer (see [`api.md`](api.md)), or individual feature behavior (see [`features/index.md`](features/index.md)).

## High-Level Overview
React 18 + Vite + Tailwind CSS, single-page application, teacher-only (no PR/Student views exist in this app). The one UX principle that matters most, directly derived from [ADR-004](../architecture-decisions.md#adr-004-fifo-queue-ordering-for-phase-1): **because Phase 1 uses a plain FIFO queue with no per-teacher fairness, a teacher's batch may sit queued for a while if other teachers uploaded first — the UI must show this as an honest, live `Queued` state, never a blank or ambiguous loading spinner.**

## Design Principles
1. **Single entry point.** All data comes from the FastAPI backend via [`api.md`](api.md)'s client layer — no component ever calls Gemini, Drive, or a database directly. See [`Backend/architecture.md`](../Backend/architecture.md) Design Principle 3.
2. **Status honesty over false immediacy.** Every document in a batch shows one of `Queued` / `Processing` / `Needs Review` / `Verified` / `Rejected` — never a generic spinner that hides which of these states it's actually in. See [`features/verification-workspace.md`](features/verification-workspace.md).
3. **Optimistic UI only where safe.** Verification actions (approve/reject/edit) may update the UI immediately on click, but always reconcile with the backend's authoritative response — never assume success silently for an action that writes to the append-only audit log.

## Workflow
See [`Documents/index.md`](../index.md) Workflow diagram for the full upload-to-export flow this UI drives.

## Inputs
Teacher interactions: login form, drag-drop file upload, verification actions (approve/reject/edit/flag), export trigger.

## Outputs
HTTP requests to the Backend per [`Backend/api.md`](../Backend/api.md); rendered views reflecting current batch/document/audit state.

## Dependencies
- [`Frontend/routing.md`](routing.md)
- [`Frontend/state-management.md`](state-management.md)
- [`Frontend/api.md`](api.md)
- [`Frontend/features/index.md`](features/index.md)
- [`Backend/api.md`](../Backend/api.md) — the contract this app consumes.

## Interactions with Other Services
Only the FastAPI backend, per [`Backend/api.md`](../Backend/api.md) — see [`Backend/architecture.md`](../Backend/architecture.md) for why direct access to any other service is disallowed.

## Security Considerations
JWT is stored client-side (httpOnly cookie preferred over localStorage, to reduce XSS token-theft risk) and attached to every request per [`Backend/authentication.md`](../Backend/authentication.md). No sensitive data (student PII) is cached in a way that survives logout.

## Performance Considerations
Status polling interval (see [`features/verification-workspace.md`](features/verification-workspace.md)) is tuned to feel responsive without hammering the backend — polling, not websockets, for Phase 1, per [`Backend/api.md`](../Backend/api.md) Future Improvements.

## Future Improvements
Move from polling to a push-based status update (websockets or Kafka-backed) once Phase 2 introduces Kafka for the PR Portal — see [`Backend/api.md`](../Backend/api.md) Future Improvements.

## Notes for Developers
When building any view that shows document status, always use the full five-state model (`Queued`/`Processing`/`Needs Review`/`Verified`/`Rejected`) — never collapse `Queued` and `Processing` into a single "loading" state, since the distinction is exactly what keeps a FIFO-queued teacher's wait from looking broken.
