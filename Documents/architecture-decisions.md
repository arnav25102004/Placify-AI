# Architecture Decision Records — Placify AI

## Purpose
Single, append-only log of cross-cutting or expensive-to-reverse architectural decisions. Component-local decisions live in their own domain document instead — this file is only for decisions that affect more than one domain or would be costly to reverse later.

## Responsibilities
Record, permanently and in order, every decision of that shape — including its rejected alternatives and its consequences — so nobody re-litigates a settled question from scratch, and so a reversal is traceable rather than silently overwriting history.

## Scope
Covers only decisions referenced by at least one domain document via `[ADR-00N]` link. Does not cover implementation detail (that lives in the linked domain document) or decisions scoped to a single file/component.

## High-Level Overview
Entries are numbered sequentially, never renumbered or reused. A reversed decision gets a **new** ADR that marks the old one "Superseded by ADR-00N" — the old entry is never edited to reflect the new choice.

## Design Principles
1. Never edit a past entry's Context/Decision/Alternatives/Consequences after the fact — only its status line may change, to record supersession.
2. Every ADR must be linked to from every domain document whose reasoning depends on it, rather than that reasoning being re-explained inline in multiple places.

## Workflow
N/A — this is a reference log, not a process document.

---

### ADR-001: Async job queue for document extraction
- **Context:** Offer-letter extraction via Gemini Pro takes 2–8 seconds per document and calls an external API. A batch upload of up to 50 files, and potentially several teachers uploading simultaneously, cannot be processed synchronously within an HTTP request without blocking and timing out.
- **Decision:** Use Redis as the Celery message broker, with a fixed pool of Celery worker processes pulling extraction jobs off the queue. FastAPI's upload endpoint only writes rows and enqueues jobs — it never calls Gemini directly.
- **Alternatives Considered:**
  - *Synchronous extraction inline in the request handler* — rejected: blocks the HTTP connection for the duration of all 50 Gemini calls, guaranteed to time out under any real batch size.
  - *Celery with a SQLAlchemy/Postgres broker* (originally proposed) — rejected: not a valid Celery configuration. SQLAlchemy can only serve as a Celery **result backend**, never as the **broker** (the component that dispatches tasks to workers). This was a factual error in the original plan, not a viable deferred option.
  - *Deferring Redis/Celery to "Phase 2"* — rejected: without a queue, Phase 1 cannot handle its own stated peak load (220 teachers, burst uploads). Redis and Celery must exist from the first working version of the Teacher Portal.
- **Consequences:** Adds Redis as an infrastructure dependency from day one (small operational cost — a single container). In exchange, upload requests are always fast regardless of batch size or concurrent teacher count, and extraction throughput is governed by worker count, which is an independently tunable knob. See [`Backend/queue.md`](Backend/queue.md).

### ADR-002: Append-only audit log
- **Context:** Placement data changes (teacher edits, approvals, rejections) need legal/institutional defensibility — "who changed what, and when" must never be reconstructable-but-lossy.
- **Decision:** `audit_logs` is insert-only. Application code and the database role permissions both forbid `UPDATE`/`DELETE` on this table. Corrections to extracted data create new rows in `extractions`, never overwrite the prior value.
- **Alternatives Considered:**
  - *Single mutable row per document, overwritten on edit* — rejected: loses the ability to show "what did the AI originally extract vs. what did the teacher correct," which is the exact information a fraud or dispute investigation needs.
- **Consequences:** Slightly higher storage growth over time (acceptable at this scale — thousands of rows/year, not millions) in exchange for a complete, tamper-evident history. See [`Database/architecture.md`](Database/architecture.md).

### ADR-003: Google Drive as document storage
- **Context:** Original plan specified Cloudinary for storing original offer-letter files. The college instead wants to use its existing Google Workspace Drive.
- **Decision:** Store original files in a Google **Shared Drive** owned by the institution, accessed via a Google Cloud **service account** (with domain-wide delegation or direct Shared Drive membership) — not a personal Google account's My Drive.
- **Alternatives Considered:**
  - *Personal Google account OAuth token* — rejected: ties storage access to one individual's credentials; breaks on password change, offboarding, or 2FA changes, and personal My Drive storage isn't organizationally owned.
  - *Keep Cloudinary* — rejected: college wants to use existing paid/owned infrastructure (Drive) rather than a separate third-party service.
- **Consequences:** Requires IT to provision a service account and confirm Shared Drive storage quota before build starts (open risk, not yet confirmed as of this writing). Drive API has per-file overhead of roughly 2 API calls (upload + metadata/permissions) rather than Cloudinary's single-call upload, and lacks CDN-level read latency — mitigated by short-TTL caching of preview links. See [`Backend/services.md`](Backend/services.md).

### ADR-004: FIFO queue ordering for Phase 1
- **Context:** With a single shared Celery/Redis queue, if multiple teachers upload simultaneously, jobs are processed in strict arrival order. A teacher whose batch was queued after another teacher's 50-document batch may see all of their own documents sit in `Queued` state until the earlier batch finishes draining.
- **Decision:** Ship Phase 1 with plain FIFO queue ordering. Do not build a per-teacher round-robin fair-dispatcher for the initial release.
- **Alternatives Considered:**
  - *Round-robin fair dispatcher* (one job per active teacher batch, cycling) — considered and designed in principle, but rejected for Phase 1: it requires an additional dispatcher component (tracking "active batches," cycling job admission into the real queue) that adds build time without a confirmed need. Deferred, not discarded — see Future Improvements below.
- **Consequences:** Under simultaneous multi-teacher bursts, a teacher queued behind a large earlier batch may see a longer wait before their first document starts processing. This is mitigated by making queue position visible in the UI (`Queued` vs `Processing` vs `Done` status per document, per [`Frontend/features/verification-workspace.md`](Frontend/features/verification-workspace.md)) so the wait reads as expected behavior, not a fault. If real usage shows this wait is unacceptable, revisit with a new ADR superseding this one — do not silently add fairness logic without recording why.

## Inputs
Cross-cutting architectural questions raised during design or implementation of any domain.

## Outputs
Numbered, permanent decision records linked from every domain document that depends on them.

## Dependencies
None — this document is a leaf reference, not dependent on other documents, though other documents depend on it.

## Interactions with Other Services
N/A — this is a documentation artifact, not a runtime component.

## Security Considerations
Never record real credentials, tokens, or keys in an ADR's Context/Decision/Consequences text, even as an example of what was rejected.

## Performance Considerations
N/A — see individual ADRs for the performance reasoning behind each decision.

## Future Improvements
- ADR-004's round-robin fair dispatcher remains a designed-but-deferred option. Build it only if real usage shows FIFO wait times under concurrent load are a genuine problem, not preemptively.

## Notes for Developers
Add new ADRs to the bottom of this file, numbered sequentially — never renumber or delete an existing entry. If you're reversing a past decision, write a new ADR and edit only the old entry's implicit status (add a note: "Superseded by ADR-00N") — never rewrite its Context/Decision/Alternatives/Consequences.
