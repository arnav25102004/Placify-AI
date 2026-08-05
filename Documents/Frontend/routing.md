# Routing — Placify AI (Teacher Portal)

## Purpose
Defines the URL structure and route-guarding rules for the Teacher Portal SPA.

## Responsibilities
Own route definitions and the auth-guard that redirects unauthenticated users to login.

## Scope
Covers routing only. Does NOT cover what each route renders in depth (see [`features/index.md`](features/index.md)) or how auth state is stored (see [`state-management.md`](state-management.md)).

## High-Level Overview
| Route | View | Guard |
|---|---|---|
| `/login` | Login form | Public |
| `/dashboard` | Stats cards, recent batches, upload entry | Authenticated |
| `/batches/:batchId` | Per-batch document status list | Authenticated |
| `/documents/:documentId/verify` | Verification workspace (PDF + extracted fields) | Authenticated |
| `/audit` | Audit log view | Authenticated |

## Design Principles
1. **Every authenticated route is guarded identically** — a single route-guard wrapper, not per-page auth checks, so there's one place to get this right.
2. **Route params never substitute for server-side scoping.** `:batchId` in the URL is just a lookup key — the backend still enforces that the batch belongs to the requesting teacher (see [`Backend/authentication.md`](../Backend/authentication.md)); the frontend must not assume a URL it can construct is a URL it's authorized to see data for.

## Workflow
On app load: check for a valid session token → if absent/expired, redirect to `/login` → otherwise render the requested route.

## Inputs
Browser navigation, direct URL entry.

## Outputs
Rendered views per the table above.

## Dependencies
- [`Frontend/state-management.md`](state-management.md) — where auth/session state lives.
- [`Backend/authentication.md`](../Backend/authentication.md) — the actual authorization enforcement this routing table assumes.

## Interactions with Other Services
N/A — client-side routing only.

## Security Considerations
Route guards are a UX convenience, not a security boundary — the real boundary is server-side scoping per [`Backend/authentication.md`](../Backend/authentication.md). Never treat "the route is guarded" as equivalent to "the data is protected."

## Performance Considerations
Route-based code splitting (lazy-loaded verification workspace, since it's the heaviest view with embedded PDF rendering) to keep initial load fast.

## Future Improvements
Add `/pr/*` and `/student/*` route trees only once those portals are designed as separate apps or route groups — not assumed to share this app's routing table.

## Notes for Developers
Do not add a new authenticated route without wiring it through the shared guard — a one-off unguarded route is the most common way auth gets silently bypassed.
