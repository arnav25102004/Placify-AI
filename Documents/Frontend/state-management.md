# State Management — Placify AI (Teacher Portal)

## Purpose
Defines how session/auth state, batch/document data, and polling-derived status live in the frontend, and how they stay consistent with the backend's authoritative state.

## Responsibilities
- Hold the authenticated session (JWT, teacher identity) for the app's lifetime.
- Cache batch/document data fetched from the backend, with clear invalidation on relevant actions.
- Drive the polling loop that keeps per-document status current in the verification workspace and dashboard.

## Scope
Covers state shape and update rules. Does NOT cover the API calls themselves (see [`api.md`](api.md)) or which routes read which state (see [`routing.md`](routing.md)).

## High-Level Overview
Server state (batches, documents, extractions) is managed via a query-cache library (e.g., TanStack Query) rather than hand-rolled global state — this gives polling, caching, and invalidation-on-mutation for free, rather than reimplementing it. Auth/session state (the decoded JWT identity, not the token's security handling — see Security Considerations) is a small, separate client-side store.

## Design Principles
1. **Server state and client state are not the same thing and are not stored the same way.** Batch/document data is always considered a cache of backend truth, invalidated aggressively on any mutation (verify action, export) — never treated as locally-owned state that could drift from Postgres.
2. **Polling is scoped, not global.** Only the currently-viewed batch's documents are polled — not every batch a teacher has ever created — to avoid unnecessary backend load. See [`features/verification-workspace.md`](features/verification-workspace.md).
3. **A verification action invalidates and refetches immediately** rather than assuming its optimistic update was correct — because it writes to the append-only audit log, the UI must reconcile with what the backend actually recorded. See [`Frontend/architecture.md`](architecture.md) Design Principle 3.

## Workflow
1. On login, decode and store the JWT identity client-side; the raw token itself is sent as a bearer header on every request (see [`api.md`](api.md)).
2. On dashboard/batch view mount, fetch batch/document data; if any document is `Queued`/`Processing`, begin polling that batch's status endpoint.
3. Stop polling once every document in the viewed batch reaches a terminal state (`Needs Review`, `Verified`, `Rejected`).
4. On a verify action, invalidate that document's (and batch's) cached data, refetch.

## Inputs
API responses from [`Backend/api.md`](../Backend/api.md); user-triggered mutations (verify actions).

## Outputs
Rendered, current-as-of-last-fetch state to every component reading it.

## Dependencies
- [`Frontend/api.md`](api.md) — the fetch/mutation functions this state layer wraps.
- [`Backend/api.md`](../Backend/api.md) — the authoritative data source.

## Interactions with Other Services
N/A directly — all data arrives via the API client described in [`api.md`](api.md).

## Security Considerations
The JWT itself is not held in this query-cache state — see [`Frontend/architecture.md`](architecture.md) Security Considerations for token storage (httpOnly cookie preferred).

## Performance Considerations
Polling interval and scope (per-batch, not global) are the main performance lever here — see [`features/verification-workspace.md`](features/verification-workspace.md) for the specific interval chosen and why.

## Future Improvements
Replace polling with push-based updates once Kafka is introduced (Phase 2) — see [`Frontend/architecture.md`](architecture.md) Future Improvements.

## Notes for Developers
Never store batch/document/extraction data in a way that isn't invalidated on the corresponding backend mutation — if you add a new mutation (e.g., a bulk-approve action), make sure its cache-invalidation is added in the same change, not left for a later "fix the stale UI" pass.
