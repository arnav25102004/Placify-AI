# Authentication & Access Control — Placify AI (Teacher Portal)

## Purpose
Defines how teachers log in, how sessions are maintained, and how access is scoped so a teacher can only ever see their own campus's/their own uploaded batches.

## Responsibilities
- Verify teacher identity at login.
- Issue and validate session tokens.
- Enforce that every data query is scoped to the requesting teacher's identity and campus — not just gated at the route level.

## Scope
Covers Teacher Portal authentication only — single role (`teacher`) for Phase 1. Does NOT cover PR or Student portal roles (not yet designed) or ERP-side authentication (covered in [`api.md`](api.md) as part of the export contract).

## High-Level Overview
Authentication uses email + password against the `users` table (bcrypt-hashed passwords), issuing a signed JWT on success. Every request carries that JWT; FastAPI middleware validates it and injects the authenticated `user_id`, `role`, and `campus_id` into the request context.

### Extensible Role-Based Access Control (RBAC)
User permissions are managed strictly via an extensible `role` system. When new user types or elevated privileges are added, a new role is provisioned and assigned without breaking the core architecture:
- `student`: Standard student (timeline setup, campus placement discovery, offer letter upload upon request).
- `pr`: Placement Representative (elevated student managing assigned cohort, issuing upload requests, dynamic faculty assignment).
- `faculty`: Standard faculty / mentor (in-charge verification workspace, auto-matched document validation).
- `placement_coordinator`: Placement Coordinator (elevated faculty managing in-charge assignments, campus drive broadcast requests, exception approvals, College ERP sync).
- `admin`: System-level campus administrator.

Each role has declarative permission scopes enforced at the service and query layers. Adding future roles (e.g. `recruiter`, `alumni_mentor`, `dean`) simply registers a new role identifier and associated permission mappings.

## Design Principles
1. **Server-side scoping, not client-trust.** A teacher's `teacher_id`/`campus_id` come from the validated JWT, never from a request parameter or body field — a malicious or buggy client cannot query another teacher's batches by passing a different ID.
2. **Passwords are never stored or logged in plaintext.** bcrypt hashing only; no reversible encryption.
3. **Tokens expire.** Short-lived access tokens with a refresh mechanism — the exact expiry window is an open decision (see [`Documents/index.md`](../index.md) Architecture Review / open risks) and must be settled before this is built, not left implicit.

## Workflow
1. Teacher submits email + password.
2. Backend verifies against bcrypt hash in `users`.
3. On success, issues a signed JWT containing `user_id`, `role=teacher`, `campus_id`.
4. Client stores the token and sends it as a bearer token on every subsequent request.
5. FastAPI dependency validates the JWT signature and expiry on every protected route, and injects the decoded identity for use in query scoping.

## Inputs
Email + password (login); JWT bearer token (every other request).

## Outputs
Signed JWT (login response); 401 on invalid/expired token.

## Dependencies
- [`Database/architecture.md`](../Database/architecture.md) — `users` table shape.
- [`Backend/api.md`](api.md) — how the token is carried on each endpoint.

## Interactions with Other Services
None external — this is entirely internal to the backend and Postgres.

## Security Considerations
- bcrypt for password hashing (cost factor to be set per current OWASP guidance at implementation time, not hardcoded here).
- JWT signing secret is a managed secret (see [`DevOps/deployment.md`](../DevOps/deployment.md)), never committed to the repo.
- All scoping (campus, teacher ownership) enforced at the query layer server-side — this is the single most important rule in this document, since a route-level-only check is bypassable if a query helper is reused incorrectly elsewhere.

## Performance Considerations
JWT validation is a fast, in-process signature check — no database round-trip needed per request, keeping auth overhead negligible even under concurrent load.

## Future Improvements
- Role field is already present (`role` column on `users`) to accommodate PR and Student roles later without a schema migration — but no PR/Student auth logic exists yet; do not build it ahead of those portals being designed.
- Token expiry window and refresh-token strategy are still open decisions — resolve before implementation begins (see [`Documents/index.md`](../index.md) open risks).

## Notes for Developers
Never add a query that accepts `teacher_id` or `campus_id` as a client-supplied parameter for scoping purposes — always derive it from the validated JWT in the request context. If you find a query that takes these as parameters, that's a bug to fix immediately, not a pattern to follow elsewhere.
