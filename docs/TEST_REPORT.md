# Clinical Triage Test Report & Benchmark Results

This report documents the verification and test execution of the **Health Triage Expert System** against the 20 course-specified end-to-end clinical benchmark scenarios, inference unit suites, and confidence threshold sensitivity analyses.

---

## Executive Summary

- **Total Test Cases Executed**: 54
- **Passed**: 54 (100%)
- **Failed**: 0 (0%)
- **Execution Date**: 2026-11-23
- **Test Runner**: Pytest 9.2.0 on Python 3.14.8 (Windows)

---

## 20 End-to-End Clinical Benchmark Cases

| Case ID | Scenario / Patient Profile | Symptoms & Signs | Risk Factors | Expected Tier | Resulting Tier | Rule Fired | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CASE_01** | Acute severe dyspnoea (Age 50) | Severe breathing difficulty | None | `emergency` | `emergency` | `R001` | **PASS** |
| **CASE_02** | Crushing central chest pain (Age 58) | Central chest pain, diaphoresis | Smoker | `emergency` | `emergency` | `R002` | **PASS** |
| **CASE_03** | Syncope / sudden collapse (Age 32) | Unconsciousness, collapse | None | `emergency` | `emergency` | `R003` | **PASS** |
| **CASE_04** | Acute delirium in older adult (Age 74) | Sudden confusion, disorientation | None | `emergency` | `emergency` | `R004` | **PASS** |
| **CASE_05** | Uncontrolled severe haemorrhage (Age 29) | Severe uncontrolled bleeding | None | `emergency` | `emergency` | `R005` | **PASS** |
| **CASE_06** | Acute FAST stroke signs (Age 67) | Facial droop, arm weakness | None | `emergency` | `emergency` | `R006` | **PASS** |
| **CASE_07** | Anaphylaxis with airway threat (Age 22) | Severe allergic reaction, lip swelling | None | `emergency` | `emergency` | `R007` | **PASS** |
| **CASE_08** | Frank haemoptysis (Age 61) | Coughing up blood | None | `emergency` | `emergency` | `R008` | **PASS** |
| **CASE_09** | Febrile infant <3 months (Age 0.15y / 8w) | Fever (duration 12h) | Infant <3m | `emergency` | `emergency` | `R009` | **PASS** |
| **CASE_10** | High fever in infant 3–6m (Age 0.35y / 4m) | Fever (severity 7) | Infant 3-6m | `urgent_care_today` | `urgent_care_today` | `R010` | **PASS** |
| **CASE_11** | Abdominal pain in pregnancy (Age 28) | Acute abdominal pain | Pregnancy | `urgent_care_today` | `urgent_care_today` | `R025` | **PASS** |
| **CASE_12** | Atypical chest discomfort in diabetic (Age 70) | Chest discomfort (severity 5) | Diabetes, Age 70 | `urgent_care_today` | `urgent_care_today` | `R039` | **PASS** |
| **CASE_13** | Acute respiratory exacerbation in COPD (Age 42) | Cough (severity 7) | Asthma/COPD | `urgent_care_today` | `urgent_care_today` | `R015` | **PASS** |
| **CASE_14** | Exact 5-day fever threshold boundary (Age 35) | Fever (duration 120.0h) | None | `see_doctor_soon` | `see_doctor_soon` | `R011` | **PASS** |
| **CASE_15** | Exact 3-week cough threshold boundary (Age 52) | Cough (duration 504.0h) | None | `see_doctor_routine` | `see_doctor_routine` | `R016` | **PASS** |
| **CASE_16** | Severe dehydration with anuria (Age 40) | Diarrhoea, severe dehydration | None | `urgent_care_today` | `urgent_care_today` | `R029` | **PASS** |
| **CASE_17** | Sore throat with airway stridor (Age 34) | Sore throat, cannot swallow | None | `emergency` | `emergency` | `R033` | **PASS** |
| **CASE_18** | Healthy adult mild tension headache (Age 26) | Headache (severity 3, dur 12h) | None | `self_care` | `self_care` | `R023` | **PASS** |
| **CASE_19** | Conflict: Mild viral cough + Red-flag bleeding | Cough + severe bleeding | None | `emergency` | `emergency` | `R005` | **PASS** |
| **CASE_20** | Non-specific mild fatigue / dry skin (Age 24) | Mild fatigue, dry skin | None | `no_rule_matched` | `no_rule_matched` | None | **PASS** |

---

## Sensitivity Analysis: Confidence Threshold Comparison (0.25 vs 0.35 vs 0.50)

To assess the stability of clinical triage tier decisions against the minimum Certainty Factor (CF) threshold parameter, all 20 clinical benchmark cases were evaluated at:
- **Low Confidence Threshold**: `0.25` (permissive rule acceptance)
- **Baseline Default Threshold**: `0.35` (course specification default)
- **High Confidence Threshold**: `0.50` (strict rule acceptance)

### Comparative Concordance Matrix

| Case ID | Clinical Description | Expected Tier | Tier (T=0.25) | Tier (T=0.35, Default) | Tier (T=0.50) | Concordance Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CASE_01** | Emergency Red Flag R001: Severe breathing difficulty | `emergency` | `emergency` | `emergency` | `emergency` | 100% Stable |
| **CASE_02** | Emergency Red Flag R002: Acute central chest pain | `emergency` | `emergency` | `emergency` | `emergency` | 100% Stable |
| **CASE_03** | Emergency Red Flag R003: Unconsciousness or collapse | `emergency` | `emergency` | `emergency` | `emergency` | 100% Stable |
| **CASE_04** | Emergency Red Flag R004: Sudden new acute confusion | `emergency` | `emergency` | `emergency` | `emergency` | 100% Stable |
| **CASE_05** | Emergency Red Flag R005: Severe uncontrolled bleeding | `emergency` | `emergency` | `emergency` | `emergency` | 100% Stable |
| **CASE_06** | Emergency Red Flag R006: Stroke-like symptoms (FAST) | `emergency` | `emergency` | `emergency` | `emergency` | 100% Stable |
| **CASE_07** | Emergency Red Flag R007: Severe allergic reaction / anaphylaxis | `emergency` | `emergency` | `emergency` | `emergency` | 100% Stable |
| **CASE_08** | Emergency Red Flag R008: Coughing up blood (haemoptysis) | `emergency` | `emergency` | `emergency` | `emergency` | 100% Stable |
| **CASE_09** | Vulnerable Age: Infant under 3 months with fever | `emergency` | `emergency` | `emergency` | `emergency` | 100% Stable |
| **CASE_10** | Vulnerable Age: Infant 3-6 months with high fever | `urgent_care_today` | `urgent_care_today` | `urgent_care_today` | `urgent_care_today` | 100% Stable |
| **CASE_11** | High-Risk: Pregnancy with acute abdominal pain | `urgent_care_today` | `urgent_care_today` | `urgent_care_today` | `urgent_care_today` | 100% Stable |
| **CASE_12** | High-Risk: Elderly diabetic patient with atypical chest discomfort | `urgent_care_today` | `urgent_care_today` | `urgent_care_today` | `urgent_care_today` | 100% Stable |
| **CASE_13** | High-Risk: Acute cough exacerbation in COPD/Asthma | `urgent_care_today` | `urgent_care_today` | `urgent_care_today` | `urgent_care_today` | 100% Stable |
| **CASE_14** | Boundary Threshold: Prolonged fever at exact 5-day cutoff (120h) | `see_doctor_soon` | `see_doctor_soon` | `see_doctor_soon` | `see_doctor_soon` | 100% Stable |
| **CASE_15** | Boundary Threshold: Chronic cough at exact 3-week cutoff (504h) | `see_doctor_routine` | `see_doctor_routine` | `see_doctor_routine` | `see_doctor_routine` | 100% Stable |
| **CASE_16** | Severe Dehydration: Diarrhoea with anuria / postural dizziness | `urgent_care_today` | `urgent_care_today` | `urgent_care_today` | `urgent_care_today` | 100% Stable |
| **CASE_17** | Airway Threat: Sore throat with inability to swallow secretions | `emergency` | `emergency` | `emergency` | `emergency` | 100% Stable |
| **CASE_18** | Self-Care: Standard healthy adult with mild tension-type headache | `self_care` | `self_care` | `self_care` | `self_care` | 100% Stable |
| **CASE_19** | Conflicting Symptoms: Mild cough vs Red-Flag severe bleeding | `emergency` | `emergency` | `emergency` | `emergency` | 100% Stable |
| **CASE_20** | No Rule Matched: Non-specific mild fatigue without matched rules | `no_rule_matched` | `no_rule_matched` | `no_rule_matched` | `no_rule_matched` | 100% Stable |

### Key Findings from Sensitivity Analysis
1. **100% Tier Stability Across All Benchmarks**: The final selected tier is invariant across $T \in [0.25, 0.50]$.
2. **Robust Rule Confidence Margins**: Every production rule in the knowledge base was designed with an intrinsic Certainty Factor $CF \ge 0.70$ (ranging from $0.70$ for mild self-care viral illness up to $1.00$ for emergency overrides). Consequently, when premise facts are reported with full certainty ($CF = 1.0$), the resulting conclusion CF ($0.70$–$1.00$) comfortably exceeds even the strictest threshold of $0.50$.
3. **Safety Fallback Resilience**: If user input had partial uncertainty (e.g. premise CF = $0.40$, yielding a conclusion CF of $0.40 \times 0.75 = 0.30$), the system's tier selection logic falls back to over-escalation: it selects the highest-urgency tier among all fired rules rather than defaulting to `no_rule_matched`, maintaining patient safety.

---

## Unit Testing Component Breakdown

| Test File | Target Module | Scope | Tests Run | Pass / Fail |
| :--- | :--- | :--- | :--- | :--- |
| `tests/test_rules.py` | `knowledge_base/rules.py` | Rule count, ID indexing, override flags, self-care guards, R040 chest safety test | 10 | 10 / 0 |
| `tests/test_certainty_factor.py` | `inference/certainty_factor.py` | MYCIN formula, range checks, score combination | 6 | 6 / 0 |
| `tests/test_forward_chaining.py` | `inference/forward_chaining.py` | Fixed-point loop, fact derivation, self-care blocking | 6 | 6 / 0 |
| `tests/test_backward_chaining.py` | `inference/backward_chaining.py` | Goal verification, adaptive question selection | 4 | 4 / 0 |
| `tests/test_api.py` | `app/main.py` | Endpoints (`/health`, `/api/rules`, `/api/triage`, `/api/triage/next-question`), Pydantic validation | 8 | 8 / 0 |
| `tests/test_clinical_cases.py` | `services/triage_service.py` | 20 clinical benchmark scenarios & edge cases | 20 | 20 / 0 |

---

## Clinical Safety Guard Verification

Specialised safety verification tests confirmed:
1. **Red-flag Override Immunity**: Rules `R001`–`R008` bypass certainty factor calculations and return `emergency` with CF 1.0.
2. **Chest Symptom Protection (R040)**: Chest-related symptoms never return `self_care`. `R040` (chest wall tenderness) triages to `see_doctor_soon` with a dedicated test verifying a 50-year-old with chest wall tenderness and no risk factors returns `see_doctor_soon`.
3. **Self-Care Guard Enforcement**: Rules `R014`, `R018`, `R023`, `R028`, `R032`, and `R036` are strictly blocked from firing whenever any warning sign, high-risk age group (<5 years or ≥65 years), or chronic risk factor is present.
4. **Over-Escalation Bias**: When candidate rules conflict across multiple tiers, the inference engine chooses the more urgent clinical tier.
