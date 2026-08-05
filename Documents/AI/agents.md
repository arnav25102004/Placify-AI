# Agent Operating Rules — Placify AI

## Purpose
Defines the non-negotiable rules an AI agent (or a human following the same discipline) follows when working in this repository, so the documentation tree stays trustworthy over time instead of drifting from the actual code.

## Responsibilities
Enforce minimal-context loading, document normativity, domain ownership boundaries, and zero silent architectural drift — across every session, not just the first one.

## Scope
Covers agent behavior/discipline only. Does NOT cover what to say or how to phrase a request (see [`prompts.md`](prompts.md)) or the concrete step sequence for a given task type (see [`workflows.md`](workflows.md)).

## High-Level Overview
Four rules, applied every session:

1. **Minimal-context loading.** Load [`Agent.md`](../../Agent.md) → [`Documents/index.md`](../index.md) → the relevant domain's entry document → the specific leaf document(s) the task needs. Never read the entire `Documents/` tree to make one change — that defeats the purpose of the tree existing.
2. **Documents are normative, not descriptive.** A document under `Documents/` is a requirement code must satisfy, not a description to weigh against alternatives — unless the user explicitly asks for a design review or architecture change. If a task seems to require deviating from a document, stop and confirm with the user rather than quietly implementing something different.
3. **Domain ownership.** An agent working within one domain (say, Backend) does not silently edit another domain's documents (say, Database) as a side effect. Cross-domain implications get flagged to the user explicitly, never resolved unilaterally.
4. **No silent architectural drift.** If implementation reveals a document is wrong, outdated, or incomplete, the agent updates the document in the same pass and notes the change — it never quietly codes around a stale document and leaves the mismatch for someone else to discover later.

## Design Principles
See High-Level Overview — the four rules above are this document's entire content; there is no additional principle layer beyond them.

## Workflow
For the step-by-step sequence applied to specific task shapes (new feature, new data source, bug fix, staleness review), see [`workflows.md`](workflows.md). This document defines the rules those workflows must obey, not the workflows themselves.

## Inputs
Any incoming task or question directed at this repository.

## Outputs
Code changes, document updates, or direct answers, all consistent with the four rules above.

## Dependencies
- [`Agent.md`](../../Agent.md) — the root entry point this document expands on.
- [`Documents/index.md`](../index.md) — the master map this document's minimal-context-loading rule points through.

## Interactions with Other Services
N/A — this is a governance document, not a runtime component.

## Security Considerations
Never fabricate credentials or secrets in any document or example code, even placeholder-looking ones that could be mistaken for real values — use unambiguous placeholders like `<GEMINI_API_KEY>`.

## Performance Considerations
N/A.

## Future Improvements
None currently identified — revisit if a real drift incident occurs and reveals a gap in these four rules.

## Notes for Developers
If you (human or agent) ever find yourself about to implement something that contradicts an existing document without having confirmed the change with the user first, stop — that's exactly the failure mode Rule 2 exists to prevent, and it's the single most common way documentation-first systems silently rot into documentation-optional systems.
