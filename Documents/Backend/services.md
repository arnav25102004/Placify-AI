# External Services Integration — Placify AI (Teacher Portal)

## Purpose
Defines exactly how the backend integrates with the two external services it depends on — Gemini Pro (extraction) and Google Drive (file storage) — and the specific operational risks of each.

## Responsibilities
- Own the adapter code that calls Gemini and Google Drive, so the rest of the backend never speaks these APIs' native shapes directly.
- Contain the retry/backoff/circuit-breaker logic that makes external-API failure a handled case, not a crash.

## Scope
Covers the Gemini and Google Drive integrations specifically. Does NOT cover the queue mechanics that call these services (see [`queue.md`](queue.md)) or ERP export (a separate outbound integration, documented inline in [`api.md`](api.md) since it is comparatively simple).

## High-Level Overview
Both integrations are accessed **only from Celery workers**, never from the FastAPI request path (see [`architecture.md`](architecture.md) Design Principle 1). Each is wrapped in a thin adapter module so that a future provider swap (e.g., a Groq-based OCR fallback, see Future Improvements) means changing one adapter, not call sites scattered through the codebase.

## Design Principles
1. **Adapter pattern.** `gemini_adapter.py` and `drive_adapter.py` are the only modules that import their respective SDKs. All other code calls a stable internal function signature (`extract_fields(file_ref) -> ExtractionResult`, `upload_file(bytes) -> DriveFileRef`), so swapping either provider later doesn't ripple through the codebase.
2. **Raw file survives the transformation.** The original file is uploaded to Drive and its `file_id` persisted to Postgres **before** extraction runs — a bad or failed Gemini call never risks losing the source document. See [ADR-003](../architecture-decisions.md#adr-003-google-drive-as-document-storage) and [`Database/architecture.md`](../Database/architecture.md).
3. **Never trust a single call.** Every external call is wrapped with retry-with-backoff (see [`queue.md`](queue.md) Design Principle 5) — there is no code path that calls Gemini or Drive exactly once with no failure handling.

## Workflow
**Gemini extraction call (inside a Celery worker):**
1. Fetch file bytes from Drive using the stored `drive_file_id`.
2. Acquire a token from the Redis rate-limit bucket (see [`queue.md`](queue.md)).
3. Call Gemini Pro with the file, requesting structured JSON output (student name, company, package, role, offer type, joining date, location, confidence score).
4. Parse and validate the JSON shape; if malformed, treat as a failure and retry per [`queue.md`](queue.md).
5. Return the structured result to be written to `extractions`.

**Google Drive upload (inside the FastAPI request path, not a worker — this one exception is a raw file transfer, not slow AI processing):**
1. Client streams file to FastAPI.
2. FastAPI streams it onward to Drive via a **resumable upload session** (not a single-shot upload) — so a dropped connection mid-transfer doesn't corrupt the file or leave a partial write.
3. On Drive confirmation, FastAPI writes the `documents` row with `drive_file_id` and `status=uploaded`, then enqueues the extraction job.

## Inputs
- Gemini adapter: a Drive file reference.
- Drive adapter: raw file bytes from the upload request.

## Outputs
- Gemini adapter: `ExtractionResult` (structured fields + confidence score).
- Drive adapter: `DriveFileRef` (file ID + view link).

## Dependencies
- [`Backend/queue.md`](queue.md) — rate-limiting and retry mechanics these adapters rely on.
- [`Database/architecture.md`](../Database/architecture.md) — where results are persisted.
- [ADR-003](../architecture-decisions.md#adr-003-google-drive-as-document-storage).

## Interactions with Other Services
- **Gemini Pro API:** called only by Celery workers, rate-limited via the token bucket in [`queue.md`](queue.md).
- **Google Drive API:** file upload called from the FastAPI request path directly (raw transfer, not AI processing); file read called from Celery workers during extraction.

## Security Considerations
- **Drive service account credentials** and the **Gemini API key** are injected via environment variables / secrets manager, never committed to the repo (see [`DevOps/deployment.md`](../DevOps/deployment.md)).
- Drive access uses a service account against a **Shared Drive** the institution owns — never a personal account's My Drive, so access survives any individual's account changes. See [ADR-003](../architecture-decisions.md#adr-003-google-drive-as-document-storage).
- Files are never made public on Drive; access is via the service account's permissions only, surfaced to the frontend through short-lived, backend-brokered view links, never a raw public Drive URL.

## Performance Considerations
- **Drive API quota:** budget ~2 API calls per file (upload + metadata/permissions), well under the default per-minute quota at Phase 1 upload volumes — reconfirm if campus count or batch size grows materially.
- **Preview link caching:** the verification workspace's side-by-side PDF view caches the Drive preview URL in Redis with a short TTL (~10 minutes) so repeated opens during one review session don't re-hit the Drive API each time — Drive has no CDN-level edge caching the way Cloudinary did.
- **Gemini latency:** ~2–8 seconds per call is the assumption driving worker-count sizing in [`queue.md`](queue.md) — if real-world latency differs materially, revisit that sizing.

## Future Improvements
- A Groq-based OCR+LLM fallback path (Tesseract OCR → Groq structured extraction) was discussed as a resilience option for sustained Gemini outages, and deliberately **not built** for Phase 1 — the college's Gemini tier is paid, making rate-limit-driven failures unlikely, and Groq's free tier lacks native PDF reading (would require adding an OCR stage). Revisit only if a real, sustained Gemini outage actually occurs during a live placement season.

## Notes for Developers
Never call the Gemini or Drive SDKs directly outside `gemini_adapter.py` / `drive_adapter.py` — route through the adapter functions even for one-off scripts or debugging, so the adapter stays the single place that knows how to swap providers later.
