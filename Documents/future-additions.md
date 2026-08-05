# Future Additions — Phase 2 & Phase 3 — Placify AI

## Purpose
Previews the two modules that come after the Teacher Portal — the PR Portal (Phase 2) and the Student Portal (Phase 3) — so their intended shape is visible in the tree without being treated as a binding design yet. This document is explicitly **not normative**: unlike every other document in this tree, it is descriptive of intent, not a contract to build against. See Design Principles below.

## Responsibilities
- Give a one-hop-away preview of what Phase 2 and Phase 3 will need to solve.
- Name the new infrastructure each phase introduces and why, so nobody in Phase 1 is surprised by it later.
- Explicitly flag what remains undecided, so no agent mistakes a preview for a spec.

## Scope
Covers PR Portal and Student Portal at the level of "what problem does this solve and what does it need" only. Does NOT contain schema, API contracts, or component-level design — none of that exists yet. When either phase is actually architected, it gets its own `Documents/<Domain>/` tree following the same Universal Document Template as Backend/Database/Frontend/DevOps/AI, and the relevant section of this file is retired in favor of real documents (see Future Improvements).

## High-Level Overview

### Phase 2 — PR Portal ("Placement Management System")
Placement Representatives (PRs) each manage a fixed batch of ~50 students through the placement pipeline. Where the Teacher Portal is about *verifying documents*, the PR Portal is about *tracking a pipeline and communicating with students* — a different access pattern (operational dashboard, not document review).

Known needs:
- **My Batch Dashboard** — a PR sees only their assigned 50 students, with a visual pipeline: Document Received → Processing → Verified → Placed.
- **Batch stats** — placement rate, highest/average package, company-wise breakdown, scoped to that PR's batch only.
- **Student tracker** — list of all 50 students, status, company, package, per-student actions.
- **PR-initiated upload** — a PR can also upload offer letters for their batch's students (reuses the Teacher Portal's upload/extraction pipeline, not a separate one).
- **Messaging** — bulk WhatsApp/email to unplaced students in the batch.
- **Referral tracking** — which seniors referred which juniors within the PR's batch.
- **Event management** — scheduling mock interviews/prep sessions, attendance tracking.

**Why this needs Kafka (not needed in Phase 1):** when a teacher verifies a document, the PR overseeing that student's batch needs to see the pipeline update *immediately*, not on the next poll cycle. Phase 1's polling-based status model (see [`Frontend/architecture.md`](Frontend/architecture.md) Future Improvements) is sufficient for one portal reading its own writes, but a second portal reading another portal's writes in near-real-time is the actual justification for introducing an event bus — this is why Kafka is deferred to Phase 2 rather than added speculatively now.

**Why this needs Redis expansion:** PR dashboard stats (batch-wide aggregates, recomputed frequently) are a stronger caching candidate than anything in Phase 1's Teacher Portal, which reads mostly single-batch, single-teacher data.

### Phase 3 — Student Portal ("Analytics & Networking Platform")
Two very different user groups share one portal: **placed students** (manage their own profile, approve referral requests) and **junior students** (read-heavy: analytics, senior search, referral requests, salary prediction). This is the highest-traffic, most read-heavy portal (10,000+ juniors researching, per the product vision) and the first one that needs graph-shaped queries.

Known needs:
- **Placement analytics** — interactive charts: packages by company, internship/PPO/off-campus split, year-on-year trends, branch comparison.
- **Company explorer** — click a company, see all placed seniors from it, required skills, interview experiences.
- **Senior search** — filter by company, package, branch, year, skills.
- **Connect / referral request** — junior requests a referral from a senior; senior gets a skill-match score and one-click approve/reject.
- **Success paths** — a senior's skills → projects → internship → PPO → full-time timeline.
- **Salary predictor** — given CGPA/skills/projects/internships, predicts an expected package range and target companies.
- **Interview prep** — company-specific questions sourced from placed seniors' experiences, mock interview booking.

**Why this needs Neo4j (not needed in Phase 1 or 2):** "which seniors match this junior's skills/interests" and "who referred whom" are graph-shaped questions — relational joins across `users`/`extractions` in PostgreSQL would work but get progressively more awkward as the matching logic grows (multi-hop: junior → skill overlap → senior → company → referral chain). A graph database is justified specifically by this query shape, not by scale alone.

**Why this portal likely needs independent scaling / a service split:** 10,000+ juniors browsing read-heavy analytics is an order of magnitude more traffic than 220 teachers verifying documents, and it has a fundamentally different read/write ratio. This is the point at which the monolith-first approach in [`Backend/architecture.md`](Backend/architecture.md) Future Improvements explicitly anticipates a split becoming worth it.

## Design Principles
1. **This document is descriptive, not normative — the one exception in this tree.** Per [`AI/agents.md`](AI/agents.md) Rule 2, every other document is a contract to build against. This one is not: it exists to preview intent, and nothing here should be implemented as-is without first being turned into a real, reviewed domain document (its own `Documents/PR/` or `Documents/Student/` tree, following the Universal Document Template).
2. **New infrastructure is introduced only when a concrete need forces it, not speculatively.** Kafka is justified by Phase 2's cross-portal real-time requirement; Neo4j is justified by Phase 3's graph-shaped queries. Neither is added to Phase 1 "just in case." This mirrors the reasoning already applied when Redis+Celery were pulled into Phase 1 itself (see [ADR-001](architecture-decisions.md#adr-001-async-job-queue-for-document-extraction)) — infrastructure decisions in this project are always need-driven, never anticipatory.
3. **Shared foundations are reused, not rebuilt.** The PR Portal's document upload reuses the Teacher Portal's existing extraction pipeline ([`Backend/queue.md`](Backend/queue.md), [`Backend/services.md`](Backend/services.md)) rather than standing up a second one — a new portal is a new set of views and access patterns on shared infrastructure, not a parallel system.

## Workflow
Not yet defined — Phase 2 and Phase 3 workflows will be diagrammed in their own domain's `index.md`/`architecture.md` once those modules are actually scoped, following the same Workflow-diagram convention as [`Documents/index.md`](index.md).

## Inputs
Not yet defined at a document-contract level. Conceptually: PR actions (messaging, referral tracking) for Phase 2; junior/placed-student interactions (search, referral requests, profile updates) for Phase 3.

## Outputs
Not yet defined. Conceptually: pipeline visibility for PRs (Phase 2); analytics, recommendations, and referral connections for students (Phase 3).

## Dependencies
- [`Backend/architecture.md`](Backend/architecture.md) — the monolith-first stance this preview's "reuse shared foundations" principle extends.
- [`Backend/queue.md`](Backend/queue.md), [`Backend/services.md`](Backend/services.md) — the extraction pipeline Phase 2's PR upload reuses.
- [`Database/architecture.md`](Database/architecture.md) — the `campus_id`/tenancy pattern Phase 2/3 will extend to PR and student roles.
- [`Backend/authentication.md`](Backend/authentication.md) — the `role` column already provisioned for `pr` and `student` roles, unused until these phases exist.

## Interactions with Other Services
Anticipated, not yet designed: Phase 2 introduces Kafka as an event bus between the Teacher Portal's verification actions and the PR Portal's pipeline view. Phase 3 introduces Neo4j alongside PostgreSQL, with an as-yet-undecided sync mechanism between them (see Future Improvements — this should follow the "outbox/CDC over dual writes" principle from [`Agent.md`](../Agent.md) once actually designed, not be decided ad hoc at implementation time).

## Security Considerations
Not yet defined in detail. Conceptually: PR access must be scoped to their assigned batch only (mirroring the teacher-scoping pattern in [`Backend/authentication.md`](Backend/authentication.md)); Student Portal referral requests expose limited profile data by the placed student's own opt-in choice, never by default.

## Performance Considerations
Not yet defined in detail. Conceptually: Phase 3's read-heavy analytics traffic is the first workload in this system large enough to justify caching/read-replica strategies beyond what [`Database/architecture.md`](Database/architecture.md) currently specifies for Phase 1.

## Future Improvements
- When Phase 2 is actually scoped, retire this file's PR Portal section in favor of a real `Documents/PR/` domain tree (architecture.md, api.md, queue.md if needed, etc.), following the exact template and process used for the Teacher Portal.
- When Phase 3 is actually scoped, retire this file's Student Portal section in favor of a real `Documents/Student/` domain tree, including a Neo4j-specific document under `Documents/Database/` (e.g., `neo4j.md`) alongside the existing `postgres`-focused documents.
- Add rows to [`Documents/index.md`](index.md)'s domain table for PR and Student once those trees exist — this file's job is done at that point for whichever phase was formalized.

## Notes for Developers
Do not implement anything described in this file as-is — it is a preview, not a spec, per Design Principle 1. If a task seems to require PR Portal or Student Portal functionality now, stop and flag that to the user rather than building ahead of the design (see [`AI/agents.md`](AI/agents.md) and [`AI/prompts.md`](AI/prompts.md) on flagging cross-portal assumptions). The right next step, when the time comes, is a proper Step 0–9 documentation pass for that phase, exactly as was done for the Teacher Portal — not an ad hoc extension of this file.
