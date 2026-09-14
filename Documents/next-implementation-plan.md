# Next Implementation Plan — Real Multi-Agent Pipeline, MCP Tools, Guardrails, Evals

> **Status: PARKED.** Not started. Do not begin implementing this until the user explicitly says to proceed — they are doing a full manual frontend review/correction pass first. This file exists so the plan isn't lost between sessions, not as a green light to build.

## Context

Right now, "7-Agent Architecture" (`Documents/AI/7-agents.md`) is a design doc only — `backend/app/agents/` is an empty package, and the real code is a single Celery task (`process_document_extraction` in `app/tasks/extraction.py`) that inline-implements rough equivalents of Agents 2–4, then stops. There is no MCP, no orchestrator, no tool-calling, no evals, and extraction is a fabricated mock (`gemini_adapter.py`'s `_mock_extract`) because there's no real LLM key configured (`GEMINI_API_KEY=dev_key` placeholder) — which is exactly why extracted values didn't match a real uploaded PDF during testing.

The user asked for a serious 2026-terminology upgrade (MCP, agent harness, orchestrator, RAG, evals, hallucination mitigation, streaming) based on a plan pasted from elsewhere. That plan was evaluated against what this codebase actually is and what an internship-scoped project can defensibly ship. Three scope decisions were made that shape this plan:

1. **Plain Python orchestrator, not LangGraph** — a coordinator function does the same fast/deep-path routing at this scale without a new framework dependency.
2. **Defer Agent 6** (Referral/Mentorship RAG matching) — it's a genuinely new feature (embeddings, pgvector, UI), not a hardening of what exists. Separate plan, later.
3. **Multi-provider LLM with automatic fallback** — NVIDIA NIM and Groq (both free-tier, both OpenAI-API-compatible) as real, working providers *now*, Gemini wired in as just another provider slot for whenever a key exists. This resolves the "fabricated extraction" problem for real: with local OCR (free, no API key) feeding a real free-tier LLM, extraction stops being fabricated entirely — the single biggest change in this plan.

**Scope discipline** (per the pasted plan's own "don't over-engineer" principle, applied literally): 2 agents go genuinely LLM-driven/tool-calling (Fraud Detection, Faculty Assistant/Discrepancy) — the rest stay clean deterministic steps. One MCP server, not three. No LangGraph. No pgvector/embeddings anywhere in this round (nothing in Agents 1–5,7 is a semantic-retrieval problem — it's exact/fuzzy lookups, which is plain SQL). No Prometheus/Grafana (not currently deployed; a simple in-app metrics endpoint gets the same "we track evals" story without new infra). ERP stays exactly as already built — human-mediated export (`/batches/{id}/export`, `/coordinator/drives/{company}/export` already generate CSV/JSON and mark `exported_to_erp`; nothing auto-pushes to a real ERP) — `7-agents.md`'s Agent 7 description still says "dispatches via REST push" and needs correcting to match reality when this plan executes.

**Flag, not fact:** the pasted source plan cited specific claims (e.g., "MCP donated to Linux Foundation's Agentic AI Foundation in December 2025") that were not independently verified. Don't treat those as load-bearing or cite them in a report without checking first — the architecture decisions below stand on their own technical merits regardless.

---

## Phase 0 — Unified LLM client + real OCR (unblocks everything else)

**New:** `backend/app/services/llm_client.py`
- `generate(prompt, system) -> str` and `generate_json(prompt, schema_hint) -> dict`, trying providers in priority order via env var `LLM_PROVIDER_PRIORITY` (default `gemini,nvidia,groq`); each provider needs its own key present (`GEMINI_API_KEY`, `NVIDIA_API_KEY`, `GROQ_API_KEY`) to be tried, absent ones are skipped.
- Implemented with the `openai` Python SDK pointed at each provider's OpenAI-compatible `base_url` (NVIDIA NIM: `https://integrate.api.nvidia.com/v1`; Groq: `https://api.groq.com/openai/v1`; keep the existing `google-genai` path for Gemini specifically since it's already wired).
- On total failure (no keys configured or every provider errors), falls back to the existing deterministic mock generator — never hard-fails the pipeline.
- Reuses `TokenBucketRateLimiter` (`app/services/rate_limiter.py`, already provider-agnostic via its `key` param) — one bucket per provider.
- **Verify current model names against provider docs at implementation time** — Groq/NVIDIA rotate free-tier model availability.

**New:** local OCR pre-step (Agent 1: Ingestion & Pre-OCR, made real)
- Add `pytesseract` + `pdf2image` to `requirements.txt`; add `tesseract-ocr poppler-utils` to `backend/Dockerfile`'s apt-get install line.
- `backend/app/agents/ingestion_agent.py`: raw file bytes + mime type → plain text (PDF → `pdf2image` → `pytesseract`; image → OCR directly).
- OCR text → `llm_client.generate_json(...)` with the existing `EXTRACTION_PROMPT` (already in `gemini_adapter.py`) → structured fields, actually read from the uploaded file for the first time in this project.

**Files touched:** `requirements.txt`, `backend/Dockerfile`, new `app/services/llm_client.py`, new `app/agents/ingestion_agent.py`.

---

## Phase 1 — MCP server + agent module split

**New:** one MCP server (not three), `backend/app/mcp_server/server.py`, using the `mcp` Python SDK, exposing:
- `get_student_record(student_id)` — wraps the existing `Student` model query (currently inline in `tasks/extraction.py`).
- `check_company_domain(company_name)` — heuristic/curated lookup (small known-domains table + a simple plausibility heuristic; honestly scoped, not a real WHOIS/verification service).
- `get_prior_corrections(company_name)` — queries `Extraction` rows where `edited_by IS NOT NULL`, grouped by company, diffed against the prior row for the same `document_id` (feeds Phase 4).

**Refactor:** split `process_document_extraction` into `backend/app/agents/{extraction_agent,fraud_agent,cross_verification_agent,discrepancy_agent}.py`, matching Agents 2/3/4/5 in `7-agents.md`:
- `extraction_agent.py` — OCR text (Phase 0) → `llm_client.generate_json` → `ExtractionResult` (replaces `gemini_adapter.extract_fields` as primary path; `_mock_extract` stays as last-resort fallback).
- `fraud_agent.py` — **first genuinely agentic one**: gives the LLM the MCP tool schemas and lets it decide which to call and how to weigh results into `authenticity_score`/`fraud_flags`, instead of today's fixed if/else order. Falls back to current deterministic logic on LLM failure.
- `cross_verification_agent.py` — existing name/company matching, now via MCP client instead of direct DB query.
- `discrepancy_agent.py` — **second genuinely agentic one** (Phase 4).

**Files touched:** new `app/mcp_server/server.py`, new `app/agents/*.py` (4 files), `requirements.txt` (+`mcp`, +`openai`), `app/tasks/extraction.py` slims down.

---

## Phase 2 — Orchestrator (plain Python, no LangGraph)

**New:** `backend/app/agents/orchestrator.py`
- `run_pipeline(document_id)` replaces `process_document_extraction`'s body: ingestion → extraction + fraud (parallel, matching `7-agents.md`'s already-documented "Design Principle 1: Parallel Execution") → cross-verification → discrepancy agent.
- **Fast/deep path branching:** known-good company domain + zero prior fraud flags on the requesting PR/Faculty → skip LLM-driven deep fraud reasoning, use cheap deterministic checks only. Otherwise run the full agentic fraud path. Honest if/else with real signal behind it, not a graph framework.
- `app/tasks/extraction.py`'s Celery task becomes a thin wrapper calling `orchestrator.run_pipeline`.

**Files touched:** new `app/agents/orchestrator.py`, `app/tasks/extraction.py`.

---

## Phase 3 — Guardrails + per-field confidence (hallucination mitigation)

- **Input guardrails:** file-size limit (none exists today — only the 50-file count cap in `batches.py`) + real MIME sniffing (don't trust client-declared `content_type`) in `batches.py` and `document_requests.py`.
- **Output/business-rule guardrails:** Pydantic validators — package/stipend ≥ 0, joining_date not absurdly before submission date.
- **Per-field confidence:** extend `Extraction` model with `field_confidence` (JSON column), populated by the extraction agent. Wire `CompareDocumentPage.tsx` (currently applies one overall confidence badge to every field) to use real per-field numbers.
- **Action guardrail already satisfied, document only:** no code path auto-exports to a real ERP without an explicit Coordinator/Admin click — already true. Correct `7-agents.md` Agent 7's "dispatches via REST push" line to describe the actual human-mediated CSV/JSON export.

**Files touched:** `app/models/extraction.py` (+column, +migration), `extraction_agent.py`, `app/routers/batches.py`, `app/routers/document_requests.py`, `CompareDocumentPage.tsx`, `Documents/AI/7-agents.md`.

---

## Phase 4 — Discrepancy/Faculty Assistant agent: real prose + streaming

- `discrepancy_agent.py` calls `llm_client` to generate a grounded discrepancy explanation — genuinely LLM-generated via Groq/NVIDIA, not a hardcoded string.
- **Streaming:** new SSE/chunked endpoint streaming the explanation token-by-token to the compare/workspace UI (both providers' OpenAI-compatible APIs support streaming).
- **Correction memory:** surfaces `get_prior_corrections(company_name)` as a UI suggestion — plain SQL grouping, no vector DB.

**Files touched:** `app/agents/discrepancy_agent.py`, new streaming endpoint in `app/routers/documents.py`, frontend compare/workspace pages.

---

## Phase 5 — Evals (no new infra)

- New `GET /api/v1/admin/eval-metrics`: extraction accuracy = `edited_by IS NOT NULL` extractions / total, broken down by which field actually changed (reuse Phase 1's diffing logic).
- Fraud precision/recall: add optional `fraud_flag_outcome` (`confirmed`/`false_positive`) alongside approve/reject/edit in `POST /documents/{id}/verify`, so Faculty can label a flag while verifying.
- Simple Admin-facing stat cards reusing the existing `AdminOverviewPage.tsx` pattern — no Grafana/Prometheus (not currently deployed).

**Files touched:** new endpoint in `app/routers/admin.py`, small schema addition to `VerifyActionRequest`, new Admin frontend section.

---

## Explicitly not building this round (and why)
- **Agent 6 (Referral Matching / RAG / pgvector)** — deferred, separate plan later.
- **LangGraph** — plain orchestrator instead.
- **Real ERP API integration** — already correctly avoided; human-mediated export stands.
- **Prometheus/Grafana** — no second consumer yet; in-app eval endpoint instead.
- **Fine-tuning** — correctly deferred; data collection (`edited_by` corrections) already happening.

## Verification plan (when this is picked back up)
- Backend: `pytest` after each phase, plus direct curl-based smoke tests (upload a real PDF, confirm OCR text is non-empty, confirm extraction values actually reflect it, confirm MCP tool calls appear in logs, confirm fast/deep path selection with known-bad vs known-good company).
- `docker compose up -d --build api worker` after backend changes, `tsc --noEmit` + `vite build` after frontend changes, restart frontend container, re-verify the served bundle before calling anything done.
