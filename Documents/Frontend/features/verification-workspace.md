# Feature: Verification Workspace — Teacher Portal

## Purpose
Defines the side-by-side review UI where a teacher compares the original offer letter against Gemini's extracted fields and approves, rejects, or edits — the single most important screen in the Teacher Portal, since it's where AI output becomes trusted institutional data.

## Responsibilities
- Render the original PDF (via a Drive preview link) alongside an editable form of extracted fields.
- Show a confidence badge per extraction (green >90%, yellow 70–90%, red <70%).
- Submit approve/reject/edit actions to the backend, which writes the append-only audit trail.
- Show accurate per-document status (`Queued`/`Processing`/`Needs Review`/`Verified`/`Rejected`) at all times — this is the feature most directly shaped by [ADR-004](../../architecture-decisions.md#adr-004-fifo-queue-ordering-for-phase-1)'s FIFO-queue tradeoff.

## Scope
Covers the verification screen only. Does NOT cover the upload step (see [`batch-upload.md`](batch-upload.md)) or dashboard-level batch listing (see [`dashboard.md`](dashboard.md)).

## High-Level Overview
Left pane: embedded PDF viewer pointed at the Drive preview link (cached per [`Backend/services.md`](../../Backend/services.md)). Right pane: editable form (student name, company, package, role, offer type, joining date, location) pre-filled from `extractions`, with the confidence badge shown per field or overall. Action buttons: Approve, Reject (with required reason), Edit (unlocks fields), Flag Fraud.

## Design Principles
1. **Status honesty is non-negotiable here specifically.** If a document is still `Queued` (per [ADR-004](../../architecture-decisions.md#adr-004-fifo-queue-ordering-for-phase-1), a teacher may be behind another teacher's larger batch in the FIFO line), this screen must show a clear "waiting to be processed" state with no extracted fields shown as if ready — never a blank form that looks broken.
2. **Every action writes to the audit trail, no exceptions.** Approve, reject, and edit all call `POST /documents/{id}/verify` (see [`Backend/api.md`](../../Backend/api.md)) — there is no "quick approve" path that skips audit logging.
3. **Confidence badges inform, they don't gate.** A red (<70%) confidence badge is a strong visual cue to double-check, but never blocks approval outright — the teacher's judgment is the final check, per the product's core premise (AI extracts, humans verify).

## Workflow
1. Teacher opens a document from the batch view.
2. If `Queued`/`Processing`, show a waiting state with live status (polling per [`Frontend/state-management.md`](../state-management.md)); do not render the form yet.
3. Once `Needs Review`, render PDF + extracted fields side by side, with confidence badge(s).
4. Teacher approves / edits then approves / rejects with a reason / flags fraud.
5. Action submitted to backend; on success, document status updates to `Verified`/`Rejected`/`Fraud Flagged` and the workspace moves to the next document in the batch (if any remain `Needs Review`).

## Inputs
`GET /documents/{id}` response (extracted fields, confidence, Drive preview link); teacher's verification action.

## Outputs
`POST /documents/{id}/verify` request per [`Backend/api.md`](../../Backend/api.md).

## Dependencies
- [`Backend/api.md`](../../Backend/api.md) — the verify endpoint contract.
- [`Backend/services.md`](../../Backend/services.md) — the Drive preview link this screen embeds.
- [`Frontend/state-management.md`](../state-management.md) — polling behavior while a document is not yet ready.
- [ADR-004](../../architecture-decisions.md#adr-004-fifo-queue-ordering-for-phase-1).

## Interactions with Other Services
Only the FastAPI backend — the embedded PDF is a Drive-hosted preview link the backend brokers, not a direct client-to-Drive call.

## Security Considerations
The Drive preview link shown to the browser is backend-brokered and short-lived, never a raw public Drive URL — see [`Backend/services.md`](../../Backend/services.md) Security Considerations.

## Performance Considerations
Polling for a not-yet-ready document uses the scoped, per-batch polling described in [`Frontend/state-management.md`](../state-management.md) — this screen does not poll every document in the system, only the one (or few) currently open.

## Future Improvements
Bulk approve/reject (approving multiple `Needs Review` documents at once without opening each individually) is named in the product vision but not yet designed at the UI level here — add its own section or document when scoped.

## Notes for Developers
Never render the extracted-fields form for a document whose status is not yet `Needs Review` (or later) — a form showing empty/default fields for a still-`Queued` document is exactly the "looks broken" failure mode [ADR-004](../../architecture-decisions.md#adr-004-fifo-queue-ordering-for-phase-1) explicitly calls out as needing UI mitigation.
