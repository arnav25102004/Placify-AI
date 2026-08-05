> This document is also the entry point for the `Database/` documentation folder.

# Database Architecture — Placify AI (Teacher Portal)

## Purpose
Defines the schema, table responsibilities, and integrity rules for the Teacher Portal's data layer — the system of record for every document, extraction, and verification action.

## Responsibilities
- Store all durable state: users, batches, documents, extracted data, audit history.
- Guarantee append-only integrity for audit-sensitive data.
- Support the query patterns the Backend actually needs (per-batch status, per-teacher scoping, fraud dedup) via correct indexing.

## Scope
Covers PostgreSQL schema and integrity rules. Does NOT cover index-level tuning detail (see [`indexing.md`](indexing.md)) or migration process (see [`migrations.md`](migrations.md)). Neo4j (student-networking graph DB) is out of scope entirely — it belongs to the not-yet-designed Student Portal.

## High-Level Overview
Five tables for Phase 1: `users`, `batches`, `documents`, `extractions`, `audit_logs`. The original product spec named four tables and omitted `batches` — that omission would have made "recent batches" and per-batch status queries (both named Frontend features) impossible to implement cleanly, so `batches` is added here as a first-class table.

```
users ──┬─< batches ──< documents ──< extractions
        │                   │
        └───────────────────┴─< audit_logs
```

## Design Principles
1. **Raw-before-transformed.** `documents.drive_file_id` is written and confirmed **before** any extraction job runs — the original file's existence never depends on AI processing succeeding. See [ADR-003](../architecture-decisions.md#adr-003-google-drive-as-document-storage).
2. **Append-only audit trail.** `audit_logs` permits `INSERT` only, enforced at the database role level (no `UPDATE`/`DELETE` grant), not merely by application convention. See [ADR-002](../architecture-decisions.md#adr-002-append-only-audit-log).
3. **Corrections are new rows, not overwrites.** An edited extraction creates a new `extractions` row referencing the same `document_id`, with the prior row retained — so "what did the AI say vs. what did the teacher correct" is always reconstructable.
4. **Every row that matters is scoped for tenancy.** `campus_id` (via `teacher_id` → `users.campus_id`, or denormalized onto `batches` directly for query simplicity) is present wherever a query needs to filter by campus, supporting the 5-campus rollout without separate databases per campus. See [ADR pending — multi-campus data partitioning strategy is an open decision, not yet recorded as an ADR since no single-vs-shared-DB choice has been finalized].

## Workflow
N/A at this level — see [`Documents/index.md`](../index.md) Workflow for the end-to-end data flow through these tables.

## Inputs
Writes from the Backend: batch/document creation (upload), extraction results (Celery workers), verification actions (teacher), export reads (batch export).

## Outputs
Query results consumed by the Backend for every API response; ERP export payloads built from `extractions` + `documents` joins.

## Dependencies
- [`Database/indexing.md`](indexing.md) — indexes supporting the query patterns described here.
- [`Database/migrations.md`](migrations.md) — how schema changes are applied safely.
- [ADR-002](../architecture-decisions.md#adr-002-append-only-audit-log), [ADR-003](../architecture-decisions.md#adr-003-google-drive-as-document-storage).

## Interactions with Other Services
Accessed only by the Backend (via SQLAlchemy) — never directly by the Frontend or by Celery workers except through the same backend data-access layer. See [`Backend/architecture.md`](../Backend/architecture.md) Design Principle 3 (single entry point).

## Security Considerations
- `audit_logs` has no `UPDATE`/`DELETE` grant for the application's database role — this is enforced at the Postgres role/permission level, not only in application code, so a bug in application logic cannot silently violate the append-only guarantee.
- No file contents or raw PII beyond what's needed for placement records (student name, company, package, etc.) are stored in the database — original files remain in Google Drive, referenced by ID only.

## Performance Considerations
See [`indexing.md`](indexing.md) for the specific indexes each query pattern needs. At Phase 1 volumes (a few thousand documents/year, low thousands of concurrent writes during peak bursts), a single Postgres instance handles this load without read replicas or partitioning.

## Future Improvements
- Multi-campus data partitioning strategy (shared tables with `campus_id` filter vs. per-campus schema/database) is an open decision for Phase 4 (multi-campus rollout) — Phase 1 uses the simpler shared-table-with-filter approach and this should be revisited with its own ADR if 5-campus scale reveals a real need for isolation.
- If the Student Portal's Neo4j graph DB is introduced later, this document should gain an "Interactions with Other Services" entry describing how/if any data syncs from Postgres to Neo4j (e.g., via CDC, per the general design-principles checklist) — not yet needed since that portal isn't designed.

## Notes for Developers
Never grant `UPDATE` or `DELETE` on `audit_logs` to the application's database role, even temporarily for a migration or fix — if historical audit data is ever wrong, the correct fix is a new corrective row explaining the correction, not an edit to the original. When adding a new table, update the ER diagram above and add a row to this domain's nonexistent-but-implied file table if one is added — currently all Database docs are listed directly in [`Documents/index.md`](../index.md) since this domain has only three files.
