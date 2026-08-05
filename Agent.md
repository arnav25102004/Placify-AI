# Agent.md — Placify AI

## Purpose
This is the entry point for every AI agent or human contributor picking up work in this repository, in any session. It exists so that nobody — human or AI — has to read the whole codebase or documentation tree to make a correct change. Read this file first, always, before touching any other file.

## Responsibilities
- State what Placify AI is, in plain terms.
- Enforce minimal-context loading: point to the next hop, never dump the whole tree.
- Declare the global rules that apply to every domain and every document.
- Define the standard workflow an agent follows for any incoming task.

## Scope
Covers repository-wide orientation and governance only. Domain-specific detail (backend, database, frontend, DevOps, AI-agent operating rules) lives one hop away in `Documents/`. This file explicitly does NOT contain architecture detail — see [`Documents/index.md`](Documents/index.md) for that.

## High-Level Overview
**Placify AI** is an AI-powered placement intelligence platform for a multi-campus college system (target scale: 11,000+ students, 220 teachers, 280 Placement Representatives, 5 campuses, 3,000+ placements/year). It automates the placement document workflow that is currently manual: teachers upload offer letters one by one into the college ERP, by hand, with no verification step.

The platform is split into three portals — Teacher Portal, PR Portal, and Student Portal — each serving a different stakeholder group with different access patterns (write-heavy document verification, operational pipeline tracking, and read-heavy analytics/discovery, respectively).

**Current build phase: Teacher Portal only.** The PR Portal and Student Portal are named in the product vision but are not yet architected in detail and have no corresponding documents in this tree. Do not write code for them, and do not assume their existence when reasoning about the Teacher Portal's architecture, other than as a future consumer of exported/verified data.

## Design Principles
1. **Documentation-first.** No component gets implementation code without a corresponding design document existing under `Documents/` first. See [`Documents/AI/agents.md`](Documents/AI/agents.md) for how this is enforced.
2. **Minimal-context loading.** An agent working on a task loads only: this file → `Documents/index.md` → the relevant domain's folder index → the specific leaf document(s) needed. Never read the entire `Documents/` tree to make one change.
3. **Documents are normative, not descriptive.** A document under `Documents/` is a contract code must satisfy — not a description to be weighed against alternatives — unless the user explicitly asks for a design review or architecture change.
4. **No silent architectural drift.** If implementation reveals a document is wrong, outdated, or incomplete, the document is corrected in the same pass, with the change noted. Code is never quietly written to work around a stale document.
5. **Domain ownership.** An agent working within one domain (e.g., Backend) does not silently edit another domain's documents (e.g., Database). Cross-domain changes are flagged to the user, not made unilaterally.

## Workflow
Every incoming task follows this sequence:
1. **Identify the domain(s) the task touches** (Backend, Database, Frontend, DevOps, AI) — ask the user if ambiguous, do not guess silently for non-trivial tasks.
2. **Read [`Documents/index.md`](Documents/index.md)** to confirm which folder and entry document govern that domain.
3. **Read that domain's folder index**, then the specific leaf document(s) relevant to the task — not the whole folder.
4. **Treat the document as the spec.** If the task requires deviating from it, stop and confirm with the user before implementing — then update the document to match, per Design Principle 4.
5. **If the task is cross-domain**, read each relevant domain's entry document, and flag to the user any place where two domains' documents appear to conflict, rather than silently reconciling them.

## Inputs
Incoming task requests from the user, in any form (feature request, bug report, "how does X work," architecture question).

## Outputs
Code changes, document updates, or direct answers — always grounded in the documents this file points to, not re-derived from scratch each session.

## Dependencies
- [`Documents/index.md`](Documents/index.md) — the master map; every task's second stop after this file.

## Interactions with Other Services
N/A — this is a documentation root, not a runtime component.

## Security Considerations
Never fabricate credentials, API keys, or example secrets in any document in this tree — use clearly-fake placeholders (e.g., `<GEMINI_API_KEY>`) and never a string that could be mistaken for a real value.

## Performance Considerations
N/A — this file is read once per session and is deliberately short; performance-sensitive detail lives in domain documents (see [`Documents/Backend/architecture.md`](Documents/Backend/architecture.md) and [`Documents/Database/architecture.md`](Documents/Database/architecture.md)).

## Future Improvements
- Add PR Portal and Student Portal domains to this tree once they are architected in the same depth as the Teacher Portal. See [`Documents/future-additions.md`](Documents/future-additions.md) for the current, non-normative preview of both.
- Add a top-level `Documents/Product/` domain if cross-portal product requirements (not architecture) need their own home.

## Notes for Developers
This project is **greenfield** for the Teacher Portal module — documents describe intended architecture, not an existing codebase. When you write the first line of implementation code for a document, treat that document as final unless you find it's wrong; if so, fix the document in the same commit, don't drift silently. Start every new session by reading this file, then `Documents/index.md` — never assume context carries over from a prior session.
