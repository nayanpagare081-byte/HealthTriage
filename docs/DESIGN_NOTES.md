# Clinical & AI Design Notes

This document details the architectural principles, clinical safety rationale, and knowledge engineering trade-offs governing the **Health Triage Expert System**.

---

## 1. Intended Users: Patients, Not Doctors

### Design Rationale:
The system is explicitly engineered for **lay patients and the general public**, not qualified clinicians or triage nurses. This foundational premise shapes every layer of the system:

1.  **Vocabulary & Cognitive Burden**:
    *   Clinicians evaluate physical signs using specialized instruments (stethoscope, otoscope, manual palpation) and complex scoring rubrics (e.g. CRB65, CURB-65, NEWS2).
    *   Lay patients report subjective, qualitative experiences (e.g. "severe headache", "stomach pain", "feeling dizzy when standing"). The system's fact extraction bridges lay-reported phrases into canonical propositional concepts without requiring medical jargon.
2.  **Decision Scope: Navigation, Not Diagnosis**:
    *   A diagnostic AI system aims to determine an underlying etiology (e.g. distinguishing *Streptococcus pyogenes* from Epstein-Barr mononucleosis).
    *   A triage system does not diagnose diseases. Its sole responsibility is **routing**: directing a person to the appropriate level of clinical care (`emergency`, `urgent_care_today`, `see_doctor_soon`, `see_doctor_routine`, or `self_care`) within a safe timeframe.
3.  **Conservative Safety Philosophy**:
    *   Because self-reported information is inherently noisy, incomplete, and subject to cognitive biases (denial, health anxiety, misestimated duration), the system never assumes clinical stability in the presence of ambiguous symptoms.

---

## 2. Why Red Flags Override Certainty Factors

### Clinical Rationale:
In the Stanford MYCIN model, evidence combines mathematically using certainty factors:
$$CF_{\text{combined}} = CF_1 + CF_2 \times (1 - CF_1)$$
Under purely mathematical CF combination, a single weak negative premise or an uncertain user response could hypothetically attenuate an emergency recommendation (e.g. $0.8 \times 0.5 = 0.4$, falling below an emergency escalation cutoff).

In clinical emergency medicine, **red flags represent absolute contraindications to delay**:
1.  **Irreversible Catastrophe**: Symptoms such as crushing central chest pain (acute myocardial infarction), stroke signs (FAST), acute airway stridor (epiglottitis), or massive hemorrhage have narrow therapeutic windows (minutes to hours). A delay caused by a probabilistic calculation can result in permanent neurological deficit or death.
2.  **Safety Invariant**: When an override rule fires (`override=True`, rules `R001`–`R008`), certainty factor calculations are **completely bypassed**. The engine immediately returns `emergency` with CF 1.0. Mathematical uncertainty calculations are reserved exclusively for graded, non-emergency conditions.

---

## 3. Why the System Fails Toward Over-Escalation

### Decision-Theoretic Asymmetry:
In medical decision-making under uncertainty, the loss matrix between Type I and Type II errors is intensely asymmetrical:

| Decision Made | Actual Clinical State: Mild | Actual Clinical State: Severe |
| :--- | :--- | :--- |
| **Over-Escalation** (Triage to Higher Urgency) | Patient experiences minor inconvenience of an urgent clinic visit. | Patient receives timely, life-saving medical intervention. |
| **Under-Escalation** (Triage to Lower Urgency) | Patient stays home safely. | **Preventable mortality, systemic sepsis, or permanent disability.** |

Because under-triage carries catastrophic clinical costs, the inference engine implements a strict **fail-safe over-escalation bias**:
1.  **Conflict Resolution**: When rules support conflicting tiers (e.g. a mild self-care viral cough coexisting with a chronic cough or moderate chest discomfort), the system always selects the tier of **higher urgency**.
2.  **Low Confidence Policy**: If candidate rules fire but none achieve the nominal confidence threshold (e.g. 0.35), the engine does not downgrade the patient to `self_care` or dismiss the case; it defaults upward to the highest urgency tier indicated by the fired premises.
3.  **Strict Self-Care Guards**: Self-care tier rules (`R014`, `R018`, `R023`, `R028`, `R032`, `R036`, `R040`) are programmatically blocked from firing if **any** warning sign, vulnerable age extreme ($<5$ years or $\ge 65$ years), or chronic risk factor (pregnancy, diabetes, COPD, heart disease, immunocompromise) is present.

---

## 4. Forward vs. Backward Chaining Architecture

The expert system implements a dual-paradigm architecture combining data-driven forward chaining and goal-directed backward chaining:

```
                            Patient Inputs
                                  │
                                  ▼
                        [ Fact Extraction ]
                                  │
             ┌────────────────────┴────────────────────┐
             ▼                                         ▼
   [ Forward Chaining ]                      [ Backward Chaining ]
   (Data-Driven Derivation)                  (Goal-Driven Prover)
             │                                         │
   Iterates to Fixed Point                   Evaluates Urgency Goals:
   Fires all satisfied rules                 emergency -> urgent -> routine
   Computes MYCIN CFs per tier                         │
             │                               Finds missing premises
             ▼                                         ▼
   [ Tier Conflict Resolution ]              [ Adaptive Question Flow ]
   Over-escalation fail-safe                 POST /api/triage/next-question
             │
             ▼
   Final Triage Assessment & Trace
```

### Forward Chaining Implementation:
*   **Mechanism**: Implemented by `ForwardChainingEngine` in `backend/app/inference/forward_chaining.py`.
*   **Operation**: Starts from the base set of verified patient facts (normalized symptoms, duration bands, severity thresholds, age groups, and chronic conditions). It evaluates all production rules, deriving intermediate conclusions, and iterates in a fixed-point loop until no new facts or conclusions can be deduced.
*   **Execution Trace**: Each rule firing records its exact premise bindings, resulting tier, MYCIN certainty contribution, and published guideline citation.

### Backward Chaining Implementation:
*   **Mechanism**: Implemented by `BackwardChainingEngine` in `backend/app/inference/backward_chaining.py`.
*   **Operation**: Starts from a hypothesis or target goal tier (starting at the top of the clinical hierarchy: `emergency`, then `urgent_care_today`, down to `see_doctor_soon`).
*   **Query Resolution (`POST /api/triage/next-question`)**:
    1.  Inspects candidate rules that could establish the target hypothesis.
    2.  Compares rule conditions against already-known facts.
    3.  Identifies missing premises (e.g. "fever $\ge 5$ days", "pregnancy", "stiff neck").
    4.  Translates the missing clinical premise into a patient-friendly questionnaire item with its clinical rationale.
    5.  When the hypothesis is established or all rules for that tier are ruled out, moves down to the next tier or terminates with `has_next_question: false`.
