# Clinical Triage Test Report & Benchmark Results

This report documents the verification and test execution of the **Health Triage Expert System** against the 20 course-specified end-to-end clinical benchmark scenarios, inference unit suites, and multi-threshold sensitivity analyses.

---

## Executive Summary

- **Total Test Cases Executed**: 59
- **Passed**: 59 (100%)
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
| **CASE_17** | Airway Threat: Sore throat with inability to swallow secretions | Sore throat, cannot swallow | None | `emergency` | `emergency` | `R033` | **PASS** |
| **CASE_18** | Healthy adult mild tension headache (Age 26) | Headache (severity 3, dur 12h) | None | `self_care` | `self_care` | `R023` | **PASS** |
| **CASE_19** | Conflict: Mild viral cough + Red-flag bleeding | Cough + severe bleeding | None | `emergency` | `emergency` | `R005` | **PASS** |
| **CASE_20** | Non-specific mild fatigue / dry skin (Age 24) | Mild fatigue, dry skin | None | `no_rule_matched` | `no_rule_matched` | None | **PASS** |

---

## Sensitivity Analysis 1: Low-to-Moderate Thresholds ($T = 0.25, 0.35, 0.50$)

| Case ID | Clinical Description | Expected Tier | Tier ($T=0.25$) | Tier ($T=0.35$, Default) | Tier ($T=0.50$) | Concordance Status |
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

---

## Sensitivity Analysis 2: High Thresholds ($T = 0.75, 0.85, 0.95$)

To evaluate the impact of strict certainty requirements and the new over-escalation fallback rule (where low-confidence self-care is escalated to routine doctor review), all 20 benchmark clinical cases were re-evaluated at $T = 0.75$, $0.85$, and $0.95$:

| Case ID | Expected Baseline Tier | Tier ($T=0.75$) | Tier ($T=0.85$) | Tier ($T=0.95$) | Shift Status & Clinical Analysis |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CASE_01** | `emergency` | `emergency` | `emergency` | `emergency` | Stable (Red flag override bypasses CF math) |
| **CASE_02** | `emergency` | `emergency` | `emergency` | `emergency` | Stable (Red flag override bypasses CF math) |
| **CASE_03** | `emergency` | `emergency` | `emergency` | `emergency` | Stable (Red flag override bypasses CF math) |
| **CASE_04** | `emergency` | `emergency` | `emergency` | `emergency` | Stable (Red flag override bypasses CF math) |
| **CASE_05** | `emergency` | `emergency` | `emergency` | `emergency` | Stable (Red flag override bypasses CF math) |
| **CASE_06** | `emergency` | `emergency` | `emergency` | `emergency` | Stable (Red flag override bypasses CF math) |
| **CASE_07** | `emergency` | `emergency` | `emergency` | `emergency` | Stable (Red flag override bypasses CF math) |
| **CASE_08** | `emergency` | `emergency` | `emergency` | `emergency` | Stable (Red flag override bypasses CF math) |
| **CASE_09** | `emergency` | `emergency` | `emergency` | `emergency` | Stable (R009 CF 0.95 $\ge$ 0.95) |
| **CASE_10** | `urgent_care_today` | `urgent_care_today` | `urgent_care_today` | `urgent_care_today` | Stable (R010 CF 0.85 $\ge$ 0.85; fallback at 0.95 retains urgent_care_today) |
| **CASE_11** | `urgent_care_today` | `urgent_care_today` | `urgent_care_today` | `urgent_care_today` | Stable (R025 CF 0.90 $\ge$ 0.85; fallback at 0.95 retains urgent_care_today) |
| **CASE_12** | `urgent_care_today` | `urgent_care_today` | `urgent_care_today` | `urgent_care_today` | Stable (R039 CF 0.85 $\ge$ 0.85; fallback at 0.95 retains urgent_care_today) |
| **CASE_13** | `urgent_care_today` | `urgent_care_today` | `urgent_care_today` | `urgent_care_today` | Stable (R015 CF 0.85 $\ge$ 0.85; fallback at 0.95 retains urgent_care_today) |
| **CASE_14** | `see_doctor_soon` | `see_doctor_soon` | `see_doctor_soon` | `see_doctor_soon` | Stable (Fallback at $\ge 0.85$ retains see_doctor_soon) |
| **CASE_15** | `see_doctor_routine` | `see_doctor_routine` | `see_doctor_routine` | `see_doctor_routine` | Stable (Fallback at $\ge 0.85$ retains see_doctor_routine) |
| **CASE_16** | `urgent_care_today` | `urgent_care_today` | `urgent_care_today` | `urgent_care_today` | Stable (R029 CF 0.90 $\ge$ 0.85; fallback at 0.95 retains urgent_care_today) |
| **CASE_17** | `emergency` | `emergency` | `emergency` | `emergency` | Stable (R033 CF 0.95 $\ge$ 0.95) |
| **CASE_18** | `self_care` | `self_care` | `see_doctor_routine` | `see_doctor_routine` | **CHANGED**: Rule R023 has CF 0.80. At $T=0.85$ and $T=0.95$, confidence does not pass threshold; fallback executes and escalates `self_care` to `see_doctor_routine`. |
| **CASE_19** | `emergency` | `emergency` | `emergency` | `emergency` | Stable (Red flag override bypasses CF math) |
| **CASE_20** | `no_rule_matched` | `no_rule_matched` | `no_rule_matched` | `no_rule_matched` | Stable (0 rules matched) |

### Key Takeaway from Sensitivity Analysis
- **19 of 20 cases (95%)** remain invariant across extreme threshold swings ($T = 0.25$ to $T = 0.95$).
- **CASE_18 is the only case that shifts** (from `self_care` to `see_doctor_routine` at $T \ge 0.85$). This shift directly proves that the system's new safety constraint—*never return `self_care` when certainty falls below threshold*—operates as intended, preventing false reassurance when confidence is insufficient.

---

## Unit Testing Component Breakdown

| Test File | Target Module | Scope | Tests Run | Pass / Fail |
| :--- | :--- | :--- | :--- | :--- |
| `tests/test_rules.py` | `knowledge_base/rules.py` | Rule count, ID indexing, override flags, self-care guards, R040 chest safety test, low-CF fallback test, chest-pain gap tests, R041 restoration test | 15 | 15 / 0 |
| `tests/test_certainty_factor.py` | `inference/certainty_factor.py` | MYCIN formula, range checks, score combination | 6 | 6 / 0 |
| `tests/test_forward_chaining.py` | `inference/forward_chaining.py` | Fixed-point loop, fact derivation, self-care blocking | 6 | 6 / 0 |
| `tests/test_backward_chaining.py` | `inference/backward_chaining.py` | Goal verification, adaptive question selection | 4 | 4 / 0 |
| `tests/test_api.py` | `app/main.py` | Endpoints (`/health`, `/api/rules`, `/api/triage`, `/api/triage/next-question`), Pydantic validation | 8 | 8 / 0 |
| `tests/test_clinical_cases.py` | `services/triage_service.py` | 20 clinical benchmark scenarios & edge cases | 20 | 20 / 0 |
