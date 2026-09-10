# Indexing Strategy — Placify AI (Teacher Portal)

## Purpose
Defines which indexes exist and why, tied directly to real query patterns the Backend issues — not speculative "might need this later" indexes.

## Responsibilities
Ensure every query pattern named in [`architecture.md`](architecture.md) and used by [`Backend/api.md`](../Backend/api.md) has a supporting index, and that no unused index is carried as dead weight.

## Scope
Covers PostgreSQL index definitions only. Does NOT cover schema design itself (see [`architecture.md`](architecture.md)) or how indexes are applied/changed over time (see [`migrations.md`](migrations.md)).

## High-Level Overview
| Table | Index | Supports |
|---|---|---|
| `documents` | `(batch_id, status)` | Per-batch status listing (`GET /batches/{id}/documents`) |
| `documents` | `(file_hash)` | Duplicate-file fraud detection during extraction |
| `document_requests` | `(student_id, status)` | Student pending upload request dashboard & notifications |
| `document_requests` | `(incharge_faculty_id, status)` | Faculty verification workspace queue |
| `document_requests` | `(pr_id, status)` | PR batch pipeline monitoring & cohort progress |
| `batches` | `(teacher_id, created_at)` | "Recent batches" dashboard, per-teacher batch listing |
| `audit_logs` | `(document_id, created_at)` | Full audit history for one document, in order |
| `users` | `(email)` unique | Login lookup via institutional email |
| `users` | `(campus_id, batch_timeline)` | Campus senior/junior directory & peer discoverability |

## Design Principles
1. **Every index maps to a named query pattern in this or a sibling document** — no index exists "just in case."
2. **Composite indexes are ordered by selectivity/filter usage**, e.g. `(batch_id, status)` rather than `(status, batch_id)`, since queries always filter by a specific batch first.

## Workflow
N/A — this is a reference document.

## Inputs
Query patterns identified in [`Backend/api.md`](../Backend/api.md) and [`architecture.md`](architecture.md).

## Outputs
Index DDL applied via migrations (see [`migrations.md`](migrations.md)).

## Dependencies
- [`Database/architecture.md`](architecture.md) — the schema these indexes apply to.
- [`Backend/api.md`](../Backend/api.md) — the endpoints these indexes serve.

## Interactions with Other Services
N/A — internal to PostgreSQL.

## Security Considerations
N/A — indexing has no direct security implication here beyond ensuring query performance doesn't degrade in a way that invites timeout-based denial-of-service under legitimate peak load.

## Performance Considerations
At Phase 1 volumes (thousands of documents/year), these five indexes are sufficient — no partial indexes, covering indexes, or partitioning are needed yet. Revisit if `EXPLAIN ANALYZE` on any of the above query patterns shows a sequential scan once real data volume exists.

## Future Improvements
If multi-campus partitioning (see [`architecture.md`](architecture.md) Future Improvements) is adopted, indexes may need a `campus_id` prefix added — do not add this preemptively before that decision is made.

## Notes for Developers
Before adding a new index, confirm there's an actual query in [`Backend/api.md`](../Backend/api.md) that needs it — an unindexed query pattern that appears during implementation should update this table, not silently get a query-time workaround.
