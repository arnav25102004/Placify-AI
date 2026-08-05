# Placify AI

AI-powered placement intelligence platform built for a multi-campus college system. It automates the placement document workflow that's currently manual: teachers upload offer letters one by one into the college ERP, by hand, with no verification step.

**Current build phase: Teacher Portal only.** Teachers upload a batch of offer letters (PDFs/images), Gemini Pro extracts structured student/placement data, teachers verify it side-by-side against the original document, and approved records export to the college ERP.

Target scale: 11,000+ students, 220 teachers, 280 Placement Representatives, 5 campuses, 3,000+ placements/year.

## Documentation

This repository is documentation-first: every architectural decision is written down and reviewed before implementation. Start here, in order:

1. [`Agent.md`](Agent.md) — repository entry point and operating rules.
2. [`Documents/index.md`](Documents/index.md) — master index of every domain (Backend, Database, Frontend, DevOps, AI) and the end-to-end system flow.
3. [`Documents/architecture-decisions.md`](Documents/architecture-decisions.md) — the record of every cross-cutting decision and why it was made.
4. [`Documents/future-additions.md`](Documents/future-additions.md) — preview of the PR Portal (Phase 2) and Student Portal (Phase 3), not yet built.

Do not duplicate architecture detail here — if something needs explaining, it belongs in `Documents/`, linked from `Documents/index.md`.

## Status

Documentation for the Teacher Portal module is complete. Implementation has not yet started.

## Tech stack (Teacher Portal)

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | FastAPI (Python 3.11) |
| AI extraction | Google Gemini Pro |
| File storage | Google Drive (college Shared Drive) |
| Database | PostgreSQL 16 |
| Queue | Redis + Celery |
| Deployment | Docker + Docker Compose, Nginx, GitHub Actions CI/CD |
| Monitoring | Prometheus + Grafana |

See [`Documents/Backend/architecture.md`](Documents/Backend/architecture.md) and [`Documents/DevOps/deployment.md`](Documents/DevOps/deployment.md) for the full picture.
