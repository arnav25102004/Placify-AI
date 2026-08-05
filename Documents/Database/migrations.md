# Migrations — Placify AI (Teacher Portal)

## Purpose
Defines how schema changes are made safely, so the database schema and this documentation tree never silently drift apart.

## Responsibilities
Own the process for applying, reviewing, and recording schema changes.

## Scope
Covers migration process and discipline. Does NOT cover what the schema currently contains (see [`architecture.md`](architecture.md)) or index rationale (see [`indexing.md`](indexing.md)).

## High-Level Overview
Migrations are managed via Alembic (SQLAlchemy's migration tool), one migration file per schema change, applied in strict sequential order, never edited after being merged to `main`.

## Design Principles
1. **A schema change is not done until its document is updated.** If a migration adds/changes a column or table, [`architecture.md`](architecture.md) (and [`indexing.md`](indexing.md) if relevant) is updated in the same change — this is the Database domain's application of the repo-wide "no silent architectural drift" rule in [`AI/agents.md`](../AI/agents.md).
2. **Never edit a merged migration.** A wrong or outdated migration gets a new, corrective migration — mirroring the same append-only discipline applied to [`architecture-decisions.md`](../architecture-decisions.md) and `audit_logs` itself.
3. **Migrations are reversible where practical.** Every migration defines both an upgrade and a downgrade path, so a bad deploy can be rolled back without manual SQL surgery.

## Workflow
1. Write the migration (Alembic autogenerate + manual review — never trust autogenerate blindly for data-affecting changes).
2. Update [`architecture.md`](architecture.md) and/or [`indexing.md`](indexing.md) to match, in the same commit/PR.
3. Run the migration against a local/staging database, confirm both upgrade and downgrade work.
4. Merge; CI applies the migration on deploy (see [`DevOps/deployment.md`](../DevOps/deployment.md)).

## Inputs
A schema change requirement, arising from a new feature or a correction to a wrong document.

## Outputs
An Alembic migration file, plus the corresponding documentation update.

## Dependencies
- [`Database/architecture.md`](architecture.md) — must stay in sync with every applied migration.
- [`DevOps/deployment.md`](../DevOps/deployment.md) — how migrations run as part of deployment.

## Interactions with Other Services
Applied against the single PostgreSQL instance described in [`architecture.md`](architecture.md).

## Security Considerations
Migrations that touch `audit_logs` permissions (see [ADR-002](../architecture-decisions.md#adr-002-append-only-audit-log)) require explicit review — accidentally granting `UPDATE`/`DELETE` on that table in a migration is the single most damaging mistake this document exists to prevent.

## Performance Considerations
Migrations that add indexes to large existing tables should use `CREATE INDEX CONCURRENTLY` to avoid locking writes — not yet a concern at Phase 1 data volumes, but worth stating as the default habit going forward.

## Future Improvements
None currently identified.

## Notes for Developers
If you write a migration and the corresponding documentation update feels awkward or you're tempted to skip it "just this once," that's the signal the schema change might not be as well-understood as it should be — stop and reconcile the design first, per [`AI/agents.md`](../AI/agents.md)'s "no silent architectural drift" rule.
