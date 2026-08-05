# Features Index — Frontend (Teacher Portal)

## Purpose
Maps each teacher-facing feature to its document, primary users, and primary data source — so a task like "change how the verification workspace looks" goes straight to one file, not a search through the whole Frontend domain.

## Responsibilities
Keep an up-to-date table of every distinct user-facing feature in the Teacher Portal frontend.

## Scope
Covers Teacher Portal features only. PR Portal and Student Portal features do not exist in this tree yet.

## High-Level Overview
| Feature | Document | Primary Users | Primary Data Source |
|---|---|---|---|
| Batch upload | [`batch-upload.md`](batch-upload.md) | Teachers | `POST /batches` |
| Verification workspace | [`verification-workspace.md`](verification-workspace.md) | Teachers | `GET /documents/{id}`, `POST /documents/{id}/verify` |
| Dashboard | [`dashboard.md`](dashboard.md) | Teachers | `GET /batches` |

## Design Principles
1. **One feature, one document.** A feature never shares a file with another unrelated feature, even if small — this table is the map that keeps that rule enforceable.

## Workflow
N/A — this is an index, not a process document.

## Inputs
New features added to the Teacher Portal frontend.

## Outputs
A current, accurate map from feature name to document.

## Dependencies
- [`Frontend/architecture.md`](../architecture.md) — the overall app shape these features live within.

## Interactions with Other Services
N/A — see each feature document for its specific backend interactions.

## Security Considerations
N/A at index level.

## Performance Considerations
N/A at index level.

## Future Improvements
Add rows here as PR Portal / Student Portal features are designed, once those portals exist as their own Frontend sub-trees or apps.

## Notes for Developers
Add a new row to this table in the same change that adds a new feature document — never let this index go stale relative to what's actually on disk in this folder.
