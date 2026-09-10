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

### Phase 2 & 3 Evolution — PR-Managed Student Pipeline & Faculty Validation Architecture

The system connects two main portal categories with designated stakeholders:
1. **PR Management Module (Student Data & Cohorts Managed by PRs):**
   - **No Student Accounts:** Students do **not** register or log in. Instead, their institutional information, graduation batch timelines, and placement tracking are entered and maintained directly by their assigned Placement Representative (PR).
   - **Cohort Structure:** Each PR is assigned a tightly-scoped cohort of **~15 students**.
   - **PR Document Ingestion:** The PR collects offer letters from students (internships, PPOs, full-time offers), uploads the documents directly from the PR Dashboard, and assigns the designated In-charge Faculty dynamically.
   - **Cross-Cohort Directory & Placement History:** PRs and Coordinators can view campus placement outcomes, company packages, and senior/junior timelines across batches.

2. **Faculty Student Letter Validation Module:**
   - **Audience:** Assigned In-charge Faculty and Placement Coordinators.
   - **Auto-Extraction & Matching (7-Agent Pipeline):** Once the PR uploads a student's offer letter, the 7-Agent architecture extracts structured fields (company, compensation, role, joining date), performs authenticity and tampering checks, and auto-matches against the student record created by the PR.
   - **Side-by-Side Review:** The In-charge Faculty validates the auto-matched data against the original letter in the Verification Workspace.
   - **Strict Access Control:** The raw document is strictly visible only to the reviewing In-charge Faculty, the student's assigned PR, and Placement Coordinators.
   - **Commit & Export:** Upon faculty approval, an immutable audit log is generated, and the finalized record pushes directly to the College ERP via REST API.

3. **Placement Coordinator Oversight:**
   - Supervises all PR cohorts, manages In-charge Faculty assignments, monitors campus-wide company drives, resolves flagged discrepancies, and coordinates bulk ERP synchronization.

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
