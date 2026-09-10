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
| Student Dashboard & Timeline | [`student-dashboard.md`](student-dashboard.md) | Students | `GET /users/profile`, `GET /placements/history` |
| Student Request Upload | [`request-upload.md`](request-upload.md) | Students | `GET /document-requests/my`, `POST /document-requests/{id}/upload` |
| PR Pipeline Management | [`pr-pipeline.md`](pr-pipeline.md) | PRs | `GET /pr/pipeline`, `POST /document-requests` |
| Verification workspace | [`verification-workspace.md`](verification-workspace.md) | In-charge Faculty | `GET /faculty/queue`, `GET /documents/{id}`, `POST /documents/{id}/verify` |
| Faculty Dashboard | [`dashboard.md`](dashboard.md) | Faculty / Mentors | `GET /batches`, `GET /faculty/queue` |
| Coordinator Central Dashboard | [`coordinator-dashboard.md`](coordinator-dashboard.md) | Placement Coordinators | `GET /coordinator/drives`, `POST /coordinator/assign-faculty`, `POST /batches/export` |
| Batch upload | [`batch-upload.md`](batch-upload.md) | Faculty / Coordinators | `POST /batches` |

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
