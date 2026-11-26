# Health Triage & Symptom Reasoning Expert System

[![CI](https://github.com/nayanpagare081-byte/HealthTriage/actions/workflows/ci.yml/badge.svg)](https://github.com/nayanpagare081-byte/HealthTriage/actions/workflows/ci.yml)

An academic rule-based artificial intelligence expert system demonstrating clinical symptom reasoning, multi-tier urgency classification, forward and backward chaining, and MYCIN certainty factor evidence combination.

> **CRITICAL MEDICAL SAFEGUARD & ACADEMIC DISCLAIMER:**  
> This application is an **academic prototype** built for a university AI coursework project. It is **NOT** a certified medical device, does not provide clinical diagnoses, cannot rule out serious illness, and must **NEVER** replace evaluation by a qualified doctor or emergency services. If you feel unwell or suspect an emergency, immediately call local emergency services (e.g., 999, 911, 112) or seek professional clinical care.

---

## 1. Project Overview

The system models preliminary clinical triage for the general public (patients navigating healthcare access, not clinicians diagnosing diseases). It takes patient-reported symptoms, duration, severity, age groups, and chronic risk factors, applies hand-crafted production rules codified from authoritative clinical guidelines (NHS, NICE, WHO, RCOG), and derives structured triage recommendations.

### Key Capabilities:
- **5-Tier Urgency Classification**:
  - `emergency`: Immediate life-threatening emergency care (999 / A&E).
  - `urgent_care_today`: Same-day clinical assessment (urgent treatment centre, NHS 111, urgent GP).
  - `see_doctor_soon`: Medical evaluation within 24 to 48 hours.
  - `see_doctor_routine`: Non-urgent appointment for chronic or mild subacute symptoms.
  - `self_care`: Supportive home management with hydration, rest, and antipyretics.
  - `no_rule_matched`: Safe fallback advisory when symptoms do not match configured production rules.
- **Red-Flag Override**: Immediate life threats (acute central chest pain, respiratory distress, anaphylaxis, stroke symptoms) bypass mathematical certainty calculations to prevent under-triage.
- **Self-Care Safety Guards**: Self-care recommendations are programmatically barred from firing if any red flag, vulnerable age group (<5 years or &ge;65 years), or chronic risk factor is present.
- **Over-Escalation Fail-Safe**: On conflicting evidence or marginal certainty, the inference engine chooses the more urgent clinical tier.
- **Dual-Chaining Architecture**:
  - **Forward Chaining**: Iterates to a fixed point from patient facts, computing MYCIN certainty factors and recording step-by-step reasoning traces.
  - **Backward Chaining**: Goal-directed prover evaluating hypotheses from highest urgency downward, powering an interactive adaptive questionnaire (`POST /api/triage/next-question`).

---

## 2. Knowledge Base & Clinical Rules

The knowledge base (`backend/app/knowledge_base/rules.py`) contains **41 clinical production rules** spanning 8 symptom clusters:

1. **Emergency Red Flags (R001–R008)**: Breathing difficulty, crushing chest pain, unconsciousness, acute delirium, severe bleeding, stroke signs, anaphylaxis, coughing blood (NHS 111 / 999 Guidelines).
2. **Fever Cluster (R009–R014)**: Infant <3 months fever (NICE NG143), infant 3–6 months high fever (NICE NG143), fever &ge;5 days (NICE NG143), fever with immunocompromise (NICE CG151), fever with meningeal signs (NICE NG240), mild viral fever (NHS).
3. **Cough & Respiratory (R015–R018)**: Asthma/COPD exacerbation (NICE NG115), persistent cough >3 weeks (NICE NG12), elderly productive cough & fever (NICE QS110), mild viral bronchitis (NICE NG120).
4. **Headache Cluster (R019–R023)**: Thunderclap headache (NICE CG150), scalp tenderness in older adult (NICE CKS), worsening headache with vomiting (NICE CG150), migraine pattern (NICE CG150), mild tension headache (NHS).
5. **Abdominal Pain (R024–R028)**: Agonizing abdominal pain (NHS), abdominal pain in pregnancy (NHS/RCOG), right lower quadrant pain (NICE CKS Appendicitis), chronic pain >2 weeks in older adult (NICE NG12), mild transient cramps (NHS).
6. **Diarrhoea & Dehydration (R029–R032)**: Severe dehydration/anuria (NHS), prolonged diarrhoea >7 days or bloody stool (NHS), gastroenteritis in infant <1 year (NICE CG84), mild acute diarrhoea (WHO/NHS).
7. **Sore Throat (R033–R036)**: Inability to swallow/stridor (NICE CKS/NHS), severe sore throat with high fever (NICE NG84), persistent sore throat >10 days (NHS), mild viral cold sore throat (NHS).
8. **Non-Red-Flag Chest Pain Variants (R037–R041)**: Pleuritic chest pain (NICE CKS), acid reflux burning (NICE CG184), chest discomfort in high-risk patients (NICE CG95), chest wall tenderness (NHS), atypical chest discomfort in diabetic/elderly patients (R041 restored).

> **Verification Status**: Across all 41 rules, 16 rules are verified against directly opened guidelines and 25 rules that use engineering heuristics or generalizations are tagged as `UNVERIFIED` pending team review.

---

## 3. Technology Stack

| Component | Technologies & Frameworks | Description |
| :--- | :--- | :--- |
| **Backend** | Python 3.14, FastAPI, Pydantic v2, Uvicorn | Production-rule inference engine, REST API, input validation |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 | Responsive UI, adaptive backward-chaining questionnaire, multi-tier result styling |
| **Icons & Design** | Lucide React, Geist Fonts | Modern accessible UI components |
| **AI Reasoning** | Hand-crafted Forward Chaining, Backward Chaining, MYCIN Certainty Factors | Pure Python rule engine without third-party black-box libraries |
| **Test Suite** | Pytest, FastAPI TestClient, AnyIO | 71 automated unit and end-to-end clinical benchmark tests |

---

## 4. Project Directory Structure

```text
HealthTriage/
├── README.md                         # Project documentation and user guide
├── backend/
│   ├── app/
│   │   ├── inference/
│   │   │   ├── backward_chaining.py  # Goal-directed prover and adaptive question selector
│   │   │   ├── certainty_factor.py   # MYCIN-style evidence combination engine
│   │   │   ├── fact_extraction.py    # Patient proposition extractor and normalizer
│   │   │   └── forward_chaining.py   # Fixed-point forward chaining production engine
│   │   ├── knowledge_base/
│   │   │   └── rules.py              # 40 clinical production rules, tiers, and self-care guards
│   │   ├── models/
│   │   │   └── patient.py            # Pydantic schemas for patient inputs and triage outputs
│   │   ├── services/
│   │   │   └── triage_service.py     # Triage orchestration service and over-escalation logic
│   │   └── main.py                   # FastAPI application routes and CORS setup
│   ├── tests/
│   │   ├── test_api.py               # API endpoint and payload validation tests
│   │   ├── test_backward_chaining.py # Backward chaining goal resolution tests
│   │   ├── test_certainty_factor.py  # MYCIN mathematical calculation tests
│   │   ├── test_clinical_cases.py    # 20 End-to-end clinical benchmark scenarios
│   │   ├── test_forward_chaining.py  # Forward chaining fixed-point tests
│   │   └── test_rules.py             # Rule model, override flags, and self-care guard tests
│   ├── requirements.txt              # Backend dependencies
│   └── .venv/                        # Python virtual environment
└── frontend/
    ├── .env.example                  # Environment configuration template
    ├── .env.local                    # Local environment variables (NEXT_PUBLIC_API_URL)
    ├── package.json                  # Node dependencies and scripts
    └── src/
        ├── app/                      # Next.js App Router root layout and page
        ├── components/
        │   ├── AssessmentForm.tsx    # Adaptive and standard patient assessment forms
        │   ├── AssessmentResultView.tsx # Multi-tier visualizer and rule explanations
        │   ├── DisclaimerBanner.tsx  # Pre-assessment safety warning
        │   ├── KnowledgeBaseTable.tsx# Interactive browser for all 40 production rules
        │   └── Navbar.tsx            # Navigation and backend live health status indicator
        ├── data/                     # Preset demo cases and rules metadata
        └── types/
            └── triage.ts             # TypeScript interfaces for API contracts
```

---

## 5. How to Run Locally

### Prerequisites
- Python 3.10+ (tested with Python 3.14)
- Node.js 18+ and npm

### 1. Start the Backend API
Open a terminal in the project root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000 --reload
```

Backend URLs:
- API Root: `http://127.0.0.1:8000`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`
- Health Endpoint: `http://127.0.0.1:8000/health`
- Rules Catalog: `http://127.0.0.1:8000/api/rules`

### 2. Run Automated Backend Tests
In your activated backend terminal:

```powershell
python -m pytest -v
```

All 71 unit, region, certainty, and clinical benchmark tests pass with 100% green coverage.

### 3. Start the Frontend Application
Open a second terminal window:

```powershell
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000` in your web browser. The frontend automatically reads the backend API URL from `NEXT_PUBLIC_API_URL` (defaulting to `http://127.0.0.1:8000`).

---

## 6. API Reference

### `POST /api/triage`
Evaluates a patient's reported symptoms, warning signs, duration, severity, risk factors, region, and optional uncertainty flags.

**Request Payload:**
```json
{
  "age": 28,
  "symptoms": ["abdominal_pain", "mild nausea"],
  "warning_signs": [],
  "uncertain_symptoms": ["mild nausea"],
  "uncertain_warning_signs": [],
  "duration_hours": 6,
  "severity": 6,
  "medical_history": [],
  "risk_factors": ["pregnancy"],
  "vital_signs": {},
  "additional_information": "Acute lower pelvic cramps.",
  "region": "IN"
}
```

*New & Optional Fields*:
- `region`: Patient jurisdiction (default `"IN"` -> 112 / 108 ambulance; also `"GB"` -> 999, `"US"` -> 911, `"AU"` -> 000, `"CA"` -> 911).
- `uncertain_symptoms`: Symptoms reported as "Not sure" (assigned premise CF 0.50).
- `uncertain_warning_signs`: Red flags marked "Not sure" (suppresses immediate 999 override, strictly enforces `urgent_care_today` floor with safety advisory).

**Response Payload:**
```json
{
  "tier": "urgent_care_today",
  "outcome": "urgent_care_today",
  "certainty_score": 0.90,
  "emergency_number": "112",
  "region": "IN",
  "fired_rules": [
    {
      "rule_id": "R025",
      "name": "Abdominal or pelvic pain in pregnancy",
      "tier": "urgent_care_today",
      "certainty_factor": 0.90,
      "source": "NHS & RCOG Clinical Guidance | URL: https://www.nhs.uk/pregnancy/related-conditions/common-symptoms/stomach-pain/",
      "matched_conditions": ["symptom:abdominal_pain", "risk:pregnancy"],
      "premise_cfs": {
        "symptom:abdominal_pain": 1.0,
        "risk:pregnancy": 1.0
      },
      "explanation": "Abdominal pain during pregnancy requires urgent same-day obstetric evaluation."
    }
  ],
  "forward_chaining_trace": [
    "R025: Abdominal or pelvic pain in pregnancy -> concluded urgent_care_today (CF: 0.90)"
  ],
  "backward_chaining_result": {
    "goal": "emergency_escalation",
    "established": false
  },
  "explanation": "URGENT CARE: Significant acute symptoms or high-risk clinical factors were detected. Same-day clinical evaluation is strongly recommended.",
  "rule_by_rule_explanation": [
    "Rule R025 fired because symptom:abdominal_pain (CF: 1.00), risk:pregnancy (CF: 1.00), giving tier 'urgent_care_today' with resulting CF 0.90."
  ],
  "disclaimer": "Academic prototype only. This expert system is NOT a diagnostic tool."
}
```

### `POST /api/triage/next-question`
Adaptive backward-chaining question selector. Takes current partial facts and answered questions, returning the next missing clinical premise to query.

---

## 7. Limitations & Clinical Governance

1. **Non-Diagnostic Scope**: The system reasons about navigation urgency, not disease etiology. It does not perform differential diagnosis.
2. **Subjective Patient Inputs**: Relies on self-reported symptoms and pain severity scores (1–10). In real-world clinical practice, triage requires physical examination, auscultation, and objective vital sign monitors.
3. **Unverified Rules Protocol**: Rules that generalize narrower clinical guidelines or rely on engineering duration/severity cutoffs are tagged as `UNVERIFIED` in `rules.py` and must receive formal clinical committee review prior to any real-world pilot.
