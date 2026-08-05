> This document is also the entry point for the `DevOps/` documentation folder.

# Deployment Topology — Placify AI (Teacher Portal)

## Purpose
Defines how the Teacher Portal's components run together, and how secrets/config are managed — the "how does this actually run" document.

## Responsibilities
Own the container topology, environment/secret management strategy, and the single-host deployment model appropriate to Phase 1's scale.

## Scope
Covers deployment topology and secrets. Does NOT cover container build specifics (see [`docker.md`](docker.md)), CI pipeline detail (see [`github-actions.md`](github-actions.md)), or observability (see [`monitoring.md`](monitoring.md)).

## High-Level Overview
Single Docker Compose stack — this is not a multi-region or high-availability system yet, it's 220 teachers at one institution across 5 campuses sharing one deployment (see [`Database/architecture.md`](../Database/architecture.md) Design Principle 4 on shared-table campus scoping rather than per-campus infrastructure).

```
Nginx (TLS, reverse proxy)
  ├─► FastAPI (1–4 replicas, stateless)
  ├─► Celery workers (4–8, tunable per Backend/queue.md)
  ├─► Redis (1 instance)
  └─► PostgreSQL (1 instance, or college-managed instance)
```

## Design Principles
1. **One deployment, not five.** 5-campus rollout is handled via `campus_id` scoping in the data layer (see [`Database/architecture.md`](../Database/architecture.md)), not five separate deployments — simpler operationally, and consistent with the monolith-first approach in [`Backend/architecture.md`](../Backend/architecture.md).
2. **Stateless services scale horizontally without coordination.** FastAPI replicas share no in-memory state (see [`Backend/architecture.md`](../Backend/architecture.md) Design Principle 2), so adding a replica is a Compose/orchestration change, not a code change.
3. **Secrets never live in the repo.** Gemini API key, Drive service account credentials, DB credentials, and the JWT signing secret are injected via environment variables from a secrets manager (or `.env` outside version control for local dev only) — never committed, never hardcoded.

## Workflow
Deploy sequence on merge to `main` (detail in [`github-actions.md`](github-actions.md)): run tests → build container images → run pending Alembic migrations (see [`Database/migrations.md`](../Database/migrations.md)) → roll out new containers.

## Inputs
Merged code on `main`; environment secrets provisioned outside the repo.

## Outputs
A running stack serving the Teacher Portal at the college's domain, behind TLS.

## Dependencies
- [`DevOps/docker.md`](docker.md) — container definitions for each service.
- [`DevOps/github-actions.md`](github-actions.md) — the CI/CD pipeline that produces and deploys these containers.
- [`DevOps/monitoring.md`](monitoring.md) — what's observed once this is running.
- [`Backend/queue.md`](../Backend/queue.md) — worker count, a config value set here.

## Interactions with Other Services
Nginx is the only externally-reachable component; all other services communicate over the internal Compose network only.

## Security Considerations
- TLS terminates at Nginx; no internal service is directly internet-reachable.
- Secrets management is the single highest-stakes item in this document — a leaked Gemini key or DB credential is a real incident, not a hypothetical, given this handles student PII.

## Performance Considerations
A single mid-size VM (4 vCPU / 8GB RAM class) is generous headroom for Phase 1's estimated peak load (see [`Backend/queue.md`](../Backend/queue.md) Performance Considerations) — this is not a system that needs Kubernetes-scale orchestration yet.

## Future Improvements
Move to an orchestrated multi-node setup (Kubernetes or similar) only if/when Phase 3's Student Portal traffic (10,000+ read-heavy users) demonstrably outgrows a single-host deployment — not adopted preemptively.

## Notes for Developers
Never commit a `.env` file with real values — only commit `.env.example` with placeholder keys. If you add a new external service dependency (a new API key, a new credential), add it to both this document and `.env.example` in the same change.
