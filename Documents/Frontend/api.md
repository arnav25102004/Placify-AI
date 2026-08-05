# API Client Layer — Placify AI (Teacher Portal)

## Purpose
Defines the single client module through which every frontend component talks to the backend, mirroring [`Backend/api.md`](../Backend/api.md) one-to-one.

## Responsibilities
Own request construction (headers, auth token attachment, base URL), response parsing, and error normalization for every backend call.

## Scope
Covers the client-side wrapper only. Does NOT define the endpoints themselves (see [`Backend/api.md`](../Backend/api.md), which this file must always match exactly) or how responses are cached (see [`state-management.md`](state-management.md)).

## High-Level Overview
One module (`api-client.ts` or equivalent) exports one function per backend endpoint in [`Backend/api.md`](../Backend/api.md) — no component constructs a fetch/axios call directly. Every function attaches the bearer token automatically and throws a normalized error type on non-2xx responses.

## Design Principles
1. **One-to-one mapping with the backend contract.** Every endpoint in [`Backend/api.md`](../Backend/api.md) has exactly one corresponding client function — no ad-hoc URL construction scattered across components.
2. **Errors are normalized, not swallowed.** A `401` triggers a redirect to login (via the state layer); a `4xx`/`5xx` surfaces a specific, actionable message to the component — never a silent failure.

## Workflow
Component calls a client function → function attaches auth header, makes the request → on success, returns parsed JSON; on failure, throws a normalized error the calling component (or the query-cache layer in [`state-management.md`](state-management.md)) handles.

## Inputs
Function calls from components or the state-management layer, with typed parameters matching each backend endpoint's expected payload.

## Outputs
Typed responses matching [`Backend/api.md`](../Backend/api.md)'s response shapes, or normalized errors.

## Dependencies
- [`Backend/api.md`](../Backend/api.md) — the contract this client must mirror exactly; any drift between the two is a bug.
- [`Frontend/state-management.md`](state-management.md) — consumes this client's functions.

## Interactions with Other Services
The FastAPI backend, exclusively — see [`Frontend/architecture.md`](architecture.md) Design Principle 1.

## Security Considerations
The auth token is attached automatically inside this layer, never passed manually by calling components — this keeps token-handling in one place, avoiding a component that forgets to attach it and silently gets a 401.

## Performance Considerations
N/A beyond what's covered in [`state-management.md`](state-management.md) (caching/polling) — this layer is a thin, uncached request wrapper by design.

## Future Improvements
If the backend contract changes (new endpoint, changed shape), this file's function list must be updated in the same change — see Notes for Developers.

## Notes for Developers
If [`Backend/api.md`](../Backend/api.md) gains, removes, or changes an endpoint, update this document and the corresponding client function together — treat any mismatch between the two documents as a bug to fix immediately, not a temporary inconsistency to leave for later.
