# Standard Task Workflows — Placify AI

## Purpose
Defines the concrete step sequence an agent follows for common request shapes in this repository, so execution is consistent across sessions rather than improvised each time.

## Responsibilities
Give a named, repeatable sequence for: adding a feature, adding a data source/integration, fixing a bug, and reviewing a document for staleness.

## Scope
Covers task-execution sequencing only. Does NOT cover the underlying rules these sequences must obey (see [`agents.md`](agents.md)) or how to phrase the initiating request (see [`prompts.md`](prompts.md)).

## High-Level Overview

**Add a new feature (Frontend):**
1. Confirm which portal (currently only Teacher Portal exists) and which existing feature document, if any, it extends.
2. Read [`Frontend/features/index.md`](../Frontend/features/index.md) — does this need a new feature document, or does it extend an existing one?
3. Read [`Backend/api.md`](../Backend/api.md) to confirm the backend contract this feature will call already exists, or needs to be added first (see "add a new data source/integration" below if it doesn't).
4. Write/update the feature document per the Universal Document Template before implementing.
5. Implement; update [`Frontend/features/index.md`](../Frontend/features/index.md)'s table if a new document was added.

**Add a new data source/integration (Backend):**
1. Read [`Backend/services.md`](../Backend/services.md) to confirm the adapter pattern this new integration must follow.
2. Determine if this decision is cross-cutting/hard-to-reverse enough to warrant a new ADR in [`architecture-decisions.md`](../architecture-decisions.md) — if the new integration changes a platform-wide assumption (like ADR-003 did for storage), it needs one; if it's a narrow, easily-reversed implementation detail, it doesn't.
3. Write/update [`Backend/services.md`](../Backend/services.md) (or a new sibling document if the integration is substantial enough to warrant its own file) before implementing.
4. Implement via a dedicated adapter module, never inline API calls scattered through call sites.

**Fix a bug:**
1. Identify which domain's document describes the behavior that's actually broken.
2. Determine: is the code violating the document (a code bug), or is the document itself wrong/outdated (a documentation bug)?
3. If the code is violating a correct document — fix the code only.
4. If the document is wrong — fix the document in the same pass, per [`agents.md`](agents.md) Rule 4 (no silent drift), then fix the code to match the corrected document.

**Review a document for staleness:**
1. Read the document in full alongside the actual current code/config it describes.
2. Note every place they've diverged.
3. Confirm with the user whether the divergence reflects an intentional, undocumented change (update the document to match reality) or an unintentional drift (fix the code to match the document) — do not assume either direction silently.

## Design Principles
1. **Every workflow ends with the document and the code in agreement** — no workflow in this list is considered complete while a known mismatch between them remains unresolved.

## Workflow
See High-Level Overview — this document's content is entirely composed of workflow sequences.

## Inputs
An incoming task, already classified into one of the shapes above (or a new shape not yet covered, in which case propose one rather than improvising ad hoc).

## Outputs
Code changes and/or document updates, always paired per the design principle above.

## Dependencies
- [`AI/agents.md`](agents.md) — the rules these workflows implement.
- [`Documents/index.md`](../index.md) — the map every workflow's first step relies on.

## Interactions with Other Services
N/A.

## Security Considerations
N/A — see the specific domain document relevant to whatever the task touches.

## Performance Considerations
N/A.

## Future Improvements
Add a workflow for "add a new domain" (e.g., when PR Portal or Student Portal are eventually architected) once that actually happens — not written speculatively now, since the shape of that work depends on decisions not yet made.

## Notes for Developers
If a task doesn't fit any workflow above, don't force it into one — propose the task's actual shape to the user and, if it's a recurring shape, add it here afterward so the next session benefits.
