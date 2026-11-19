# Health Triage & Symptom Reasoning System

An academic rule-based AI expert system demonstrating how reported
warning signs can be evaluated using production rules, forward chaining,
backward chaining, and certainty-factor calculations.

> **Important:** This is an academic prototype only. It is not a medical
> device, does not provide a medical diagnosis, and must not be used to
> decide whether someone is safe or to delay professional medical care.

## Project Overview

The application has two components:

-   **Frontend:** A web interface for entering patient details,
    symptoms, severity, duration, and warning signs.
-   **Backend:** A FastAPI service that validates submitted information
    and runs the rule-based reasoning pipeline.

When a configured warning sign matches a rule, the system returns
`emergency_escalation`. If no configured emergency rule matches, it
returns `insufficient_information`. This does not mean the person is
safe.

## Current Warning-Sign Rules

  Rule   Warning sign
  ------ -----------------------------
  R001   Severe breathing difficulty
  R002   Chest pain
  R003   Unconsciousness
  R004   New confusion
  R005   Severe bleeding
  R006   Stroke-like symptoms
  R007   Severe allergic reaction
  R008   Coughing blood

These are prototype rules, not clinically validated rules.

## AI Reasoning Methods

1.  **Input validation:** Pydantic validates the submitted patient
    information.
2.  **Fact creation:** Selected warning signs are converted into facts.
3.  **Forward chaining:** The engine checks facts against production
    rules and derives conclusions.
4.  **Backward chaining:** The engine checks whether the goal
    `emergency_escalation` can be established.
5.  **Certainty factor:** The system calculates a score using configured
    rule values.
6.  **Response generation:** The API returns the outcome, activated
    rules, score, and reasoning explanation.

The certainty score is a rule-based calculation, not a medical
probability or actual measure of patient risk.

## Technology Stack

  -----------------------------------------------------------------------
  Component                           Technologies
  ----------------------------------- -----------------------------------
  Backend                             Python, FastAPI, Pydantic, Uvicorn

  Frontend                            Next.js, React, TypeScript

  Styling                             Tailwind CSS

  AI reasoning                        Production rules, forward chaining,
                                      backward chaining, certainty
                                      factors
  -----------------------------------------------------------------------

## Project Structure

``` text
HealthTriage/
├── backend/
│   ├── app/
│   │   ├── inference/
│   │   │   ├── backward_chaining.py
│   │   │   ├── certainty_factor.py
│   │   │   └── forward_chaining.py
│   │   ├── knowledge_base/
│   │   │   └── rules.py
│   │   ├── models/
│   │   │   └── patient.py
│   │   ├── services/
│   │   │   └── triage_service.py
│   │   └── main.py
│   ├── tests/
│   │   ├── test_api.py
│   │   ├── test_backward_chaining.py
│   │   ├── test_certainty_factor.py
│   │   ├── test_forward_chaining.py
│   │   └── test_rules.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── data/
│   │   └── types/
│   ├── package.json
│   └── package-lock.json
└── .gitignore
```

## Run Locally

### Prerequisites

-   Python
-   Node.js and npm

### 1. Start the Backend

Open PowerShell in the project root:

``` powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Run automated backend tests:

``` powershell
python -m pytest
```

Backend URLs:

-   API: http://127.0.0.1:8000
-   API documentation: http://127.0.0.1:8000/docs
-   Health check: http://127.0.0.1:8000/health
-   Rules reference: http://127.0.0.1:8000/api/rules

Keep this terminal running.

### 2. Start the Frontend

Open a second PowerShell window:

``` powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

The frontend currently connects to `http://127.0.0.1:8000/api/triage`.

## API Endpoint

### POST `/api/triage`

Example request:

``` json
{
  "age": 25,
  "symptoms": ["chest discomfort"],
  "warning_signs": ["chest_pain"],
  "duration_hours": 1,
  "severity": 8,
  "medical_history": [],
  "risk_factors": [],
  "vital_signs": {},
  "additional_information": null
}
```

The response includes `outcome`, `certainty_score`, `activated_rules`,
forward- and backward-chaining results, an explanation, and a
disclaimer.

Use the interactive API documentation at http://127.0.0.1:8000/docs to
inspect the request and response schemas.

## Current Limitations

-   Only the eight warning-sign rules listed above currently drive the
    emergency outcome.
-   Although the input model accepts age, symptoms, duration, severity,
    medical history, risk factors, and vital signs, the current
    reasoning service uses the selected `warning_signs` to create
    inference facts.
-   `insufficient_information` means no configured emergency rule
    matched. It is not an all-clear result.
-   Certainty scores are based on configured rule values, not clinical
    probabilities.
-   Clinical references and qualified review are still required before
    any real-world health use.
-   An automated backend test suite is not currently included in this
    repository.

## Academic Purpose

This project demonstrates an AI expert-system workflow for educational
purposes, including knowledge representation, rule matching, inference,
and explainable reasoning.

Any extension toward real-world use would require clinical expertise,
validated evidence, privacy and security controls, extensive testing,
and appropriate regulatory review.
