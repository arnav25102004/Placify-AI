# CI/CD — Placify AI (Teacher Portal)

## Purpose
Defines the GitHub Actions pipeline that gates every change to `main` and deploys on merge.

## Responsibilities
Run tests and linting on every PR; build and push container images and run migrations/deploy on merge to `main`.

## Scope
Covers pipeline stages and triggers. Does NOT cover what's inside the containers being built (see [`docker.md`](docker.md)) or where they're deployed to (see [`deployment.md`](deployment.md)).

## High-Level Overview
Two workflows: a **PR workflow** (lint, type-check, unit tests — must pass before merge) and a **deploy workflow** (triggered on merge to `main`: build images → push to registry → run Alembic migrations → roll out containers per [`deployment.md`](deployment.md)).

## Design Principles
1. **CI exists before feature code does.** Per the product vision's "CI/CD first" principle, the pipeline is set up as part of initial project scaffolding, not retrofitted after features are built.
2. **Migrations run as a distinct, ordered CI step**, never bundled silently into container startup — so a failed migration blocks deploy visibly rather than leaving a container running against a schema it doesn't match.

## Workflow
**PR workflow:** lint → type-check → unit tests → (block merge on any failure).
**Deploy workflow (on merge to `main`):** build images (see [`docker.md`](docker.md)) → push to registry → run `alembic upgrade head` → deploy per [`deployment.md`](deployment.md).

## Inputs
Pushed commits / opened PRs; merges to `main`.

## Outputs
Pass/fail PR status checks; deployed containers on successful merge.

## Dependencies
- [`DevOps/docker.md`](docker.md) — what gets built.
- [`DevOps/deployment.md`](deployment.md) — what happens after build.
- [`Database/migrations.md`](../Database/migrations.md) — the migration step's contract.

## Interactions with Other Services
GitHub Actions runners interact with the container registry and the deployment target (per [`deployment.md`](deployment.md)) — credentials for both are GitHub encrypted secrets, never repo files.

## Security Considerations
Deploy credentials (registry push, deployment target SSH/API access) are GitHub Actions encrypted secrets — never plaintext in workflow YAML.

## Performance Considerations
N/A — pipeline speed is a developer-experience concern, not a system-performance one; kept fast primarily by not re-running unaffected test suites unnecessarily, if the codebase grows large enough to warrant that later.

## Future Improvements
Add a staging environment deploy step between PR merge and production deploy, once there's a real staging target to deploy to — not yet provisioned for Phase 1.

## Notes for Developers
Never add `--no-verify` or skip CI checks to merge faster — if a check is wrong or flaky, fix the check, don't bypass it.
