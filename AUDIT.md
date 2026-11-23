# Expert System Audit Summary: HealthTriage

**Date:** 2026-11-23  
**Auditor:** Senior AI Architect & Clinical Expert Systems Engineer  
**Course Project:** University AI Course - Preliminary Symptom Triage & Reasoning System (General Public)

---

## 1. Executive Summary

This audit assesses the current repository state against the **Course Specification & Grading Rubric**.

The current application provides an operational prototype with a Next.js 16 frontend and FastAPI backend. However, the reasoning architecture currently only evaluates 8 hardcoded emergency red-flag rules triggered exclusively by `warning_signs`. The system functions effectively as a binary emergency detector rather than a comprehensive, graded expert triage system that uses symptoms, duration, severity, age bands, and risk factors with true clinical citations, multi-tier decision logic, certainty factor aggregation, and interactive backward-chaining query resolution.

---

## 2. Component-by-Component Audit

### 2.1 Backend Knowledge Base (`backend/app/knowledge_base/rules.py`)
- **Currently Works:**
  - Flat list of 8 `ProductionRule` dataclass objects (`R001`–`R008`) corresponding to critical warning signs (chest pain, severe dyspnea, unconsciousness, etc.).
  - Each rule has `certainty_factor: 1.0` and concludes `emergency_escalation`.
- **Missing / Defects Against Spec:**
  - **No Graded Tiers:** Only 1 conclusion exists (`emergency_escalation`). Lacks multi-tier classification: `self_care`, `see_doctor_routine`, `see_doctor_soon`, `urgent_care_today`, and `emergency`.
  - **No Symptom Clusters or Age/Risk Modifiers:** 20–30 graded rules covering fever, cough/breathing, headache, abdominal pain, diarrhea/dehydration, sore throat, and non-red-flag chest discomfort are completely missing.
  - **Unused Patient Parameters:** Conditions only evaluate raw `warning_signs` strings. Age bands (`infant < 3m`, `child < 5y`, `adult`, `elderly >= 65`), duration thresholds, severity scales, and risk factors (`diabetes`, `pregnancy`, `heart_disease`, `asthma_copd`, `immunocompromised`) are never evaluated by any rule.
  - **No Structured Clinical Citations:** Every rule lists `"Clinical safety reference required"` as a placeholder. Real clinical guidelines (NHS, WHO, CDC, NICE, ICMR) with URLs and access dates are missing.

### 2.2 Inference Engine (`backend/app/inference/`)
- **Forward Chaining (`forward_chaining.py`):**
  - *Currently Works:* Basic iterative fact expansion loop up to a fixed point.
  - *Missing:* Does not evaluate composite structured conditions (e.g. `symptom == 'fever'` AND `duration_hours > 72` AND `age < 5`). Does not record structured premise matching details, resulting tiers, or rule confidence.
- **Certainty Factor Engine (`certainty_factor.py`):**
  - *Currently Works:* Has `calculate(rule_cf, match_strength)` and combined CF formula `1 - prod(1 - cf_i)`.
  - *Defects:* In practice, CF never affects any decision because all 8 rules have CF 1.0 and conclude `emergency_escalation`. There is no premise uncertainty weighting (`min(premise_cfs)`), nor tier-by-tier grouping.
- **Backward Chaining (`backward_chaining.py`):**
  - *Currently Works:* Checks whether the static goal `"emergency_escalation"` is already satisfied by initial facts.
  - *Defects:* Only passive goal verification. It **does not identify missing premises** or formulate the next question to ask an uncertain user.
- **Decision Logic & Safeguards:**
  - Lacks hierarchical tier selection, over-escalation bias on uncertainty, and fail-safe fallback (`no_rule_matched`).

### 2.3 API Layer (`backend/app/main.py`, `models/patient.py`, `services/triage_service.py`)
- **Currently Works:**
  - `GET /health` returns status healthy.
  - `GET /api/rules` returns all 8 rules.
  - `POST /api/triage` validates `PatientInput` and executes inference.
- **Missing / Defects Against Spec:**
  - `POST /api/triage/next-question` endpoint does not exist.
  - `PatientInput` accepts `age`, `symptoms`, `duration_hours`, `severity`, `medical_history`, `risk_factors`, and `vital_signs`, but `TriageService.assess()` discards everything except `patient.warning_signs`.
  - Response does not return structured rule explanations citing clinical sources or explainable rule traces for multi-tier decisions.

### 2.4 Frontend (`frontend/src/`)
- **Currently Works:**
  - Polished modern UI with landing hero, intake form, results view, 7-step pipeline cards, and knowledge table.
- **Missing / Defects Against Spec:**
  - Hardcoded `http://127.0.0.1:8000` in `AssessmentForm.tsx` and `Navbar.tsx` instead of using `process.env.NEXT_PUBLIC_API_URL`. Missing `frontend/.env.example`.
  - No interactive adaptive questioning flow (driven by backward chaining).
  - Results view only handles binary emergency vs insufficient info. Cannot display the 5 clinical urgency tiers with distinct styling, rule sources, and combined CFs.

### 2.5 Test Suite (`backend/tests/`)
- **Currently Works:**
  - 24 basic unit tests verifying R001-R008 and static API calls.
- **Missing / Defects Against Spec:**
  - Lacks 20 diverse end-to-end clinical triage test cases covering pediatric fever, elderly cardiac presentations, pregnancy emergencies, conflicting symptoms, boundary values, and uncertainty propagation.
  - Missing `docs/TEST_REPORT.md`.

### 2.6 Documentation & Disclaimers
- `README.md` contradicts itself: claims tests don't exist in "Current Limitations" while providing pytest instructions.
- `README.md` tech stack table has a formatting bug where markdown renders "factors" as a heading.
- Missing `docs/REFERENCES.md`, `docs/DESIGN_NOTES.md`, and `docs/UNVERIFIED_RULES.md`.

---

## 3. Action Plan

| Phase | Target Area | Key Deliverable |
| :--- | :--- | :--- |
| **A** | Knowledge Base | Structured `Rule` model, 8 red-flag override rules + 25 graded clinical rules (NHS, CDC, WHO, NICE, ICMR cited), `UNVERIFIED_RULES.md` |
| **B** | Inference Engine | Multi-tier forward chaining, MYCIN CF propagation with premise min-weighting, backward-chaining interactive question selector (`POST /api/triage/next-question`) |
| **C** | Backend API & Service | Full utilization of age/duration/severity/risk factors, enriched response format with backward compatibility |
| **D** | Frontend | `NEXT_PUBLIC_API_URL` env config, adaptive question-by-question flow, multi-tier result badges, rule citation display |
| **E** | Verification & Tests | 20 comprehensive E2E test cases with edge cases, `docs/TEST_REPORT.md`, 100% pytest pass |
| **F** | Documentation & Clean Commits | Fix README bugs, author `docs/REFERENCES.md` and `docs/DESIGN_NOTES.md`, modular git commits per section |
