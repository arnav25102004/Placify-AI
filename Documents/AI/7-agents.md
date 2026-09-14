# 7-Agent Architecture — Placify AI

## Purpose
Defines the multi-agent system orchestrating document verification, fraud detection, and referral matching across the Student, PR Management, and Faculty modules.

## Responsibilities
- Automate document pre-processing, text/vision parsing, authenticity auditing, and cross-matching against student profile data.
- Supply high-confidence verification guidance and discrepancy detection to In-charge Faculty reviewers.
- Power smart junior-to-senior referral matching and automate audit compliance and College ERP export.

## Scope
Governs the AI processing pipeline operating inside backend background workers (Celery) and event hooks. The LLM integration (`app/services/llm_client.py`) supports Gemini natively plus NVIDIA NIM and Groq via an OpenAI-compatible interface, with a deterministic mock fallback when no provider is configured. Agents 6 (Referral Matching) and the RAG-based matching it describes are design-only — not yet implemented (see `Documents/next-implementation-plan.md`).

## High-Level Overview

```
                      [ Document Upload / Request Submission ]
                                         │
                                         ▼
                           ┌───────────────────────────┐
                           │ 1. Ingestion & Pre-OCR    │
                           │    Agent                  │
                           └─────────────┬─────────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
      ┌───────────────────────────┐             ┌───────────────────────────┐
      │ 2. Information Extraction │             │ 3. Document Authenticity  │
      │    Agent (Parser)         │             │    & Fraud Detection Agent│
      └─────────────┬─────────────┘             └─────────────┬─────────────┘
                    │                                         │
                    └────────────────────┬────────────────────┘
                                         │
                                         ▼
                           ┌───────────────────────────┐
                           │ 4. Cross-Verification &   │
                           │    Profile Matching Agent │
                           └─────────────┬─────────────┘
                                         │
                                         ▼
                           ┌───────────────────────────┐
                           │ 5. Faculty Assistant &    │
                           │    Discrepancy Agent      │
                           └─────────────┬─────────────┘
                                         │
                         [ Once Faculty Approves in UI ]
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
      ┌───────────────────────────┐             ┌───────────────────────────┐
      │ 6. Referral & Mentorship  │             │ 7. Audit & ERP Sync       │
      │    Matching Agent         │             │    Compliance Agent       │
      └───────────────────────────┘             └───────────────────────────┘
```

---

## The 7 Specialized Agents

### 1. Ingestion & Pre-OCR Agent
- **Trigger:** Document uploaded by student or batch-uploaded by faculty/PR.
- **Responsibilities:**
  - Validates MIME type and file format (PDF, PNG, JPEG).
  - Determines file health: scan quality, DPI, image orientation/skew, and digital vs. scanned text layers.
  - Generates normalized page images and extracts raw digital text layers for parser ingestion.
- **Outputs:** Sanitized document artifact reference + pre-OCR text payload.

### 2. Information Extraction Agent (Parser)
- **Trigger:** Cleaned document artifact produced by Ingestion Agent.
- **Responsibilities:**
  - Invokes the LLM (via OpenAI-compatible API: NVIDIA NIM / Gemini) with strict structured JSON schema mode.
  - Extracts key placement fields:
    - Candidate Name, Student/Roll Number
    - Company Name & Designation/Job Role
    - Offer Type (Internship, PPO, Full-Time)
    - Compensation Breakdown (CTC, Base Salary, Joining Bonus, Stipend)
    - Joining Date & Location
    - Bond terms, probation duration, and mandatory conditions.
- **Outputs:** `StructuredOfferPayload` conforming to Pydantic extraction schema.

### 3. Document Authenticity & Fraud Detection Agent
- **Trigger:** Runs concurrently with Agent 2 upon file ingestion.
- **Responsibilities:**
  - Computes SHA-256 hash to detect duplicate letter submissions across different students.
  - Inspects PDF metadata inconsistencies: producer tools (Canva, Photoshop, Acrobat edit traces), modified timestamps vs. stated offer dates, font embedding mismatches.
  - Identifies compensation outliers and flags unverified company email domains or suspicious formatting patterns.
- **Outputs:** `AuthenticityScore` (0–100%) and array of `FraudFlags` (e.g., `DUPLICATE_HASH`, `METADATA_EDIT_DETECTED`, `SUSPICIOUS_DOMAIN`).

### 4. Cross-Verification & Profile Matching Agent
- **Trigger:** Successful outputs from Agent 2 and Agent 3.
- **Responsibilities:**
  - Cross-checks extracted candidate name and ID against the student's institutional record (`users` table).
  - Verifies that the document matches the active document request issued by the PR/Faculty.
  - Checks student graduation batch timeline to ensure correct cohort attribution (internship vs. final placement).
- **Outputs:** `MatchResult` with confidence scores for candidate identity, company match, and batch eligibility.

### 5. Faculty Assistant & Discrepancy Agent
- **Trigger:** Completion of profile matching.
- **Responsibilities:**
  - Prepares the side-by-side payload for the Faculty Verification Workspace.
  - Highlights specific discrepancies (e.g., "Student name match: 88%", "Bond detected: 2 years, ₹2,00,000 penalty", "High fraud risk flag: PDF altered").
  - Generates pre-populated, actionable recommendation chips for the reviewer (Approve, Request Re-upload with note, Reject).
- **Outputs:** Enriched verification card rendered in the Faculty UI (`GET /documents/{id}`).

### 6. Referral & Mentorship Matching Agent
- **Trigger:** Placement record verified and approved; or junior student browses placement explorer.
- **Responsibilities:**
  - Indexes placed senior profiles by company, role, package tier, interview experience, and skill tags.
  - Computes similarity/match scores for juniors seeking referrals or guidance based on target company, skill overlaps, and batch graduation year.
  - Alerts seniors when a high-compatibility junior requests a referral.
- **Outputs:** Ranked senior-junior mentorship recommendations and referral match scores.

### 7. Audit & ERP Sync Compliance Agent
- **Trigger:** In-charge Faculty clicks "Approve & Commit".
- **Responsibilities:**
  - Validates all business invariants before persistent storage.
  - Formats data into a university ERP-compliant JSON/CSV payload and makes it available for a Coordinator/Admin to download and import into the ERP themselves — export is human-mediated, not an automatic push to a live ERP endpoint (no college ERP integration has been authorized; see `POST /batches/{id}/export`).
  - Records an append-only row in `audit_logs` capturing reviewer ID, timestamp, original AI extraction, and teacher edits.
- **Outputs:** A downloadable ERP-ready export file and an immutable audit log entry.

---

## Design Principles
1. **Parallel Execution:** Agents 2 (Extraction) and 3 (Fraud Detection) run concurrently inside Celery workers to minimize latency.
2. **Strict Privacy Isolation:** Document inspection outputs and raw files are accessible only to authorized PRs, In-charge Faculty, and Placement Admins. Junior students querying Agent 6 never receive raw offer letters or sensitive personal data.
3. **Provider Agility:** All LLM calls route through a unified client (`app/services/llm_client.py`) trying providers in priority order via the `LLM_PROVIDER_PRIORITY` env var — Gemini (native SDK) and NVIDIA NIM/Groq (OpenAI-compatible) today, config-only to add more. Falls back to a deterministic mock when no provider is configured, so the pipeline never hard-fails.
