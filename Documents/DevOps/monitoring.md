# Monitoring & Observability — Placify AI (Teacher Portal)

## Purpose
Defines what gets measured and alerted on — specifically the metrics that answer "is the queue keeping up" and "is Gemini healthy," since those are the two things that determine whether concurrent multi-teacher uploads are actually being handled well in production, not just in theory.

## Responsibilities
Instrument queue depth, worker throughput, Gemini call latency/error rate, and surface alerts before a backlog becomes a user-visible problem.

## Scope
Covers what is monitored and why. Does NOT cover deployment topology (see [`deployment.md`](deployment.md)) or the retry/circuit-breaker logic being measured (see [`Backend/queue.md`](../Backend/queue.md), which this document observes but does not define).

## High-Level Overview
Prometheus scrapes metrics from FastAPI and Celery; Grafana dashboards visualize them. The metrics that matter most, directly tied to the concurrency story in [`Backend/queue.md`](../Backend/queue.md):

| Metric | Why it matters |
|---|---|
| Redis queue depth | Direct signal of whether uploads are outpacing worker throughput — the number that would tell you "10 teachers just uploaded at once" is having a real effect |
| Celery task duration (p50/p95) | Confirms the ~2–8s per-document assumption worker-count sizing relies on |
| Celery task failure/retry rate | Early signal of Gemini rate-limiting or transient errors, before the circuit breaker trips |
| Gemini API error rate by type (429 vs 5xx vs timeout) | Distinguishes "we're calling too fast" (tune the rate-limit bucket) from "Gemini is down" (circuit breaker territory) |
| Time-in-`Queued`-state per document | The actual user-facing wait time under FIFO ordering — the number that would justify revisiting [ADR-004](../architecture-decisions.md#adr-004-fifo-queue-ordering-for-phase-1) |

## Design Principles
1. **Observability before scaling.** Worker count and rate-limit bucket sizing (see [`Backend/queue.md`](../Backend/queue.md)) are tuned based on these real metrics, not guessed and left unchecked.
2. **Alert on the leading indicator, not just the failure.** Alert on sustained queue-depth growth or rising retry rate, not only on documents actually reaching `needs_manual_review` — the goal is to catch a developing backlog before teachers notice a long wait.

## Workflow
Prometheus scrapes on an interval → Grafana dashboards visualize trends → alert rules fire (e.g., to Slack/email) on sustained queue depth growth, elevated Gemini error rate, or the circuit breaker tripping (see [`Backend/queue.md`](../Backend/queue.md)).

## Inputs
Metrics emitted by FastAPI and Celery worker processes.

## Outputs
Grafana dashboards; alert notifications.

## Dependencies
- [`Backend/queue.md`](../Backend/queue.md) — the mechanisms being observed (retry, circuit breaker, rate-limit bucket).
- [`DevOps/deployment.md`](deployment.md) — where Prometheus/Grafana run relative to the rest of the stack.

## Interactions with Other Services
Scrapes metrics endpoints exposed by FastAPI/Celery; does not modify application behavior itself.

## Security Considerations
Grafana dashboards are internal-only (not internet-reachable) — placement data volume/status metrics, while not raw PII, still shouldn't be publicly visible.

## Performance Considerations
Metric scraping overhead is negligible at this scale; no special tuning needed for Phase 1.

## Future Improvements
Add distributed tracing (e.g., OpenTelemetry) if debugging a specific slow request path becomes hard to reason about from metrics/logs alone — not needed at Phase 1's single-monolith scale.

## Notes for Developers
If you tune worker count or the rate-limit bucket size in [`Backend/queue.md`](../Backend/queue.md), check the queue-depth and task-duration dashboards afterward to confirm the change had the intended effect — don't tune blind.
