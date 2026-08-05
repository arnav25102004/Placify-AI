# Docker & Containers — Placify AI (Teacher Portal)

## Purpose
Defines how each service is containerized for local development and deployment consistency.

## Responsibilities
Own the Dockerfile/Compose definitions for each service and ensure local dev matches production topology closely enough that "works on my machine" issues are rare.

## Scope
Covers container definitions. Does NOT cover where/how these containers are deployed at runtime (see [`deployment.md`](deployment.md)) or how they're built/pushed in CI (see [`github-actions.md`](github-actions.md)).

## High-Level Overview
`docker-compose.yml` at the repo root defines: `api` (FastAPI), `worker` (Celery, same image as `api`, different entrypoint command), `redis`, `postgres`, `nginx`. `api` and `worker` share a single Dockerfile/image — they differ only in their container command, avoiding duplicated dependency installation.

## Design Principles
1. **API and worker share one image.** Since both run the same Python codebase (just different entrypoints — `uvicorn` vs `celery worker`), maintaining two separate images would risk dependency drift between them for no benefit.
2. **Local dev topology mirrors production topology.** The same `docker-compose.yml` (or a close variant with dev-specific overrides) is used locally and as the basis for the deployed topology in [`deployment.md`](deployment.md) — so issues surface locally before deployment, not after.

## Workflow
`docker compose up` brings up the full stack locally; `docker compose run api alembic upgrade head` applies migrations (see [`Database/migrations.md`](../Database/migrations.md)).

## Inputs
Application source code; `.env` file (local dev only, never committed — see [`deployment.md`](deployment.md)).

## Outputs
Built container images, tagged and pushed by CI (see [`github-actions.md`](github-actions.md)).

## Dependencies
- [`DevOps/deployment.md`](deployment.md) — how these containers are actually run in a real environment.
- [`DevOps/github-actions.md`](github-actions.md) — build/push pipeline.

## Interactions with Other Services
N/A — this document describes build/packaging, not runtime service interaction (see [`Backend/architecture.md`](../Backend/architecture.md) for that).

## Security Considerations
Container images never bake in secrets at build time — all secrets are runtime environment variables, injected at container start, never `ARG`/`ENV` values baked into a committed Dockerfile with real values.

## Performance Considerations
Multi-stage Docker build to keep the final image lean (build dependencies not carried into the runtime image).

## Future Improvements
None currently identified for Phase 1.

## Notes for Developers
If you add a new Python dependency, it belongs in the shared `api`/`worker` image's dependency file — don't create a divergent dependency set between the two, since job code (Celery tasks) and API code share the same codebase.
