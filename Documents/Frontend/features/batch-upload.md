# Feature: Batch Upload — Teacher Portal

## Purpose
Defines the drag-drop batch upload UI teachers use to submit up to 50 offer letters at once, and how it reflects the accept-then-process split from the backend honestly.

## Responsibilities
- Accept multiple file drops/selects, validate file type/size client-side before sending.
- Show upload progress per file during the transfer to the backend.
- Immediately reflect the backend's `202 Accepted` response by navigating to the batch status view — never wait for extraction to complete before considering "upload" done.

## Scope
Covers the upload UI only. Does NOT cover what happens after upload (see [`verification-workspace.md`](verification-workspace.md)) or the backend's handling of the upload request (see [`Backend/api.md`](../../Backend/api.md)).

## High-Level Overview
Drag-drop zone accepts PDF/image files, client-side validates count (≤50) and per-file size/type before allowing submission, then streams files to `POST /batches` (see [`Backend/api.md`](../../Backend/api.md)), showing a per-file transfer progress bar. On success, redirects to `/batches/:batchId`.

## Design Principles
1. **Client-side validation is a UX courtesy, not a security boundary.** File type/size/count limits are also enforced server-side (see [`Backend/architecture.md`](../../Backend/architecture.md) Security Considerations) — client checks exist only to give the teacher fast feedback, not to be trusted as the only check.
2. **"Uploaded" and "processed" are never conflated in the UI.** The moment the backend returns `202`, the UI shows the batch as created with all documents `Queued` — it must not show a false "done" or "processing" state before the backend has actually enqueued anything.

## Workflow
1. Teacher drags/selects up to 50 files.
2. Client validates count/type/size, shows any rejected files immediately with a reason.
3. On submit, files stream to `POST /batches`; a progress bar reflects transfer completion per file.
4. On `202 Accepted`, redirect to `/batches/:batchId`, where every document initially shows `Queued`.

## Inputs
Dropped/selected files; drag-drop or file-picker interaction.

## Outputs
A `POST /batches` request per [`Backend/api.md`](../../Backend/api.md); navigation to the batch status view.

## Dependencies
- [`Backend/api.md`](../../Backend/api.md) — the upload endpoint contract.
- [`Frontend/api.md`](../api.md) — the client function this feature calls.

## Interactions with Other Services
The FastAPI backend's `POST /batches` endpoint only.

## Security Considerations
Client-side file type/size checks are a UX aid; the backend re-validates independently (see [`Backend/architecture.md`](../../Backend/architecture.md)) — this feature must never assume the client check is sufficient on its own.

## Performance Considerations
Large batches (50 files) upload as a streamed multipart request rather than one giant in-memory blob, so the browser doesn't need to hold all 50 files' bytes simultaneously if avoidable.

## Future Improvements
Resumable upload from the browser side (matching the backend's resumable Drive upload per [`Backend/services.md`](../../Backend/services.md)) if large file/poor network conditions become a real user complaint.

## Notes for Developers
Never show a success/complete state before the backend's `202 Accepted` response actually arrives — a batch upload "finishing" client-side before the server confirms receipt would violate the raw-before-transformed guarantee this whole system depends on.
