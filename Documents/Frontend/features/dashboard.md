# Feature: Dashboard — Teacher Portal

## Purpose
Defines the teacher's landing view: stats summary, recent batches, and the entry point into batch upload.

## Responsibilities
- Show at-a-glance stats: total uploaded, pending verification, verified today, rejected, fraud alerts.
- List recent batches with their current aggregate status.
- Provide the entry point to [`batch-upload.md`](batch-upload.md).

## Scope
Covers the dashboard/landing view only. Does NOT cover batch upload itself (see [`batch-upload.md`](batch-upload.md)) or per-document verification (see [`verification-workspace.md`](verification-workspace.md)).

## High-Level Overview
Stats cards computed from `GET /batches` (aggregated client-side or via a dedicated stats endpoint, to be decided at implementation time — see Future Improvements) plus a table of recent batches, each row showing batch creation time, file count, and a rollup status (e.g., "38/50 verified").

## Design Principles
1. **Rollup status must reflect real per-document state, not just batch existence.** A batch row showing "50 uploaded" alone (with no indication of how many are still `Queued` vs `Verified`) would repeat the same status-honesty failure called out in [`verification-workspace.md`](verification-workspace.md) — the dashboard must show the same granularity, just aggregated.

## Workflow
On load: fetch recent batches (see [`Frontend/api.md`](../api.md)); render stats cards and batch table; link each batch row to `/batches/:batchId`.

## Inputs
`GET /batches` response.

## Outputs
Rendered stats and batch table; navigation into batch detail or upload.

## Dependencies
- [`Backend/api.md`](../../Backend/api.md) — the `GET /batches` endpoint.
- [`Frontend/routing.md`](../routing.md) — links into `/batches/:batchId`.

## Interactions with Other Services
The FastAPI backend only.

## Security Considerations
Batch list is always scoped server-side to the authenticated teacher — see [`Backend/authentication.md`](../../Backend/authentication.md); this view never accepts a teacher/campus filter from client state as authoritative.

## Performance Considerations
Stats aggregation (totals across all batches) may warrant a dedicated backend endpoint rather than aggregating client-side over every batch's documents, once batch history grows large — not yet decided (see Future Improvements).

## Future Improvements
Decide whether stats are computed client-side from `GET /batches` or via a dedicated `GET /stats` endpoint — deferred until real data volume shows whether client-side aggregation is fast enough.

## Notes for Developers
Keep this view's definition of "pending verification" consistent with the five-state status model defined in [`Frontend/architecture.md`](../architecture.md) — don't introduce a separate, dashboard-only status vocabulary.
