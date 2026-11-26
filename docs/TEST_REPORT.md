# Clinical Triage Test Report & Benchmark Results

This report documents the verification and test execution of the **Health Triage Expert System** against the 20 course-specified end-to-end clinical benchmark scenarios, inference unit suites, and multi-threshold sensitivity analyses.

---

## Executive Summary

- **Total Test Cases Executed**: 71
- **Passed**: 71 (100%)
- **Failed**: 0 (0%)
- **Execution Date**: 2026-11-26
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

## Sensitivity Analysis 3: Uncertain Premise ("Not Sure") Impact on 20 Clinical Benchmark Cases

To evaluate the operational behavior of the premise certainty factor model, all 20 clinical benchmark cases were re-executed with the primary premise (red-flag warning sign if present, or chief symptom) marked as "Not sure" ($CF = 0.50$):

| Case ID | Scenario / Clinical Description | Original Tier | Uncertain Premise Tested | New Tier | Certainty Shift ($CF$) | Shift Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CASE_01** | Emergency Red Flag R001: Severe breathing difficulty | `emergency` | Warning Sign: severe_breathing_difficulty | `urgent_care_today` | 1.00 $\rightarrow$ 0.50 | **CHANGED** (Override suppressed; safety floor enforced) |
| **CASE_02** | Emergency Red Flag R002: Acute central chest pain | `emergency` | Warning Sign: chest_pain | `urgent_care_today` | 1.00 $\rightarrow$ 0.50 | **CHANGED** (Override suppressed; safety floor enforced) |
| **CASE_03** | Emergency Red Flag R003: Unconsciousness or collapse | `emergency` | Warning Sign: unconsciousness | `urgent_care_today` | 1.00 $\rightarrow$ 0.50 | **CHANGED** (Override suppressed; safety floor enforced) |
| **CASE_04** | Emergency Red Flag R004: Sudden new acute confusion | `emergency` | Warning Sign: new_confusion | `urgent_care_today` | 1.00 $\rightarrow$ 0.50 | **CHANGED** (Override suppressed; safety floor enforced) |
| **CASE_05** | Emergency Red Flag R005: Severe uncontrolled bleeding | `emergency` | Warning Sign: severe_bleeding | `urgent_care_today` | 1.00 $\rightarrow$ 0.50 | **CHANGED** (Override suppressed; safety floor enforced) |
| **CASE_06** | Emergency Red Flag R006: Stroke-like symptoms (FAST) | `emergency` | Warning Sign: stroke_like_symptoms | `urgent_care_today` | 1.00 $\rightarrow$ 0.50 | **CHANGED** (Override suppressed; safety floor enforced) |
| **CASE_07** | Emergency Red Flag R007: Severe allergic reaction / anaphylaxis | `emergency` | Warning Sign: severe_allergic_reaction | `urgent_care_today` | 1.00 $\rightarrow$ 0.50 | **CHANGED** (Override suppressed; safety floor enforced) |
| **CASE_08** | Emergency Red Flag R008: Coughing up blood (haemoptysis) | `emergency` | Warning Sign: coughing_blood | `urgent_care_today` | 1.00 $\rightarrow$ 0.50 | **CHANGED** (Override suppressed; safety floor enforced) |
| **CASE_09** | Vulnerable Age: Infant under 3 months with fever | `emergency` | Symptom: fever | `emergency` | 0.95 $\rightarrow$ 0.47 | Unchanged (R009 emergency rule retained) |
| **CASE_10** | Vulnerable Age: Infant 3-6 months with high fever | `urgent_care_today` | Symptom: fever | `urgent_care_today` | 0.85 $\rightarrow$ 0.42 | Unchanged (R010 urgent care retained) |
| **CASE_11** | High-Risk: Pregnancy with acute abdominal pain | `urgent_care_today` | Symptom: abdominal_pain | `urgent_care_today` | 0.90 $\rightarrow$ 0.45 | Unchanged (R025 urgent care retained) |
| **CASE_12** | High-Risk: Elderly diabetic patient with atypical chest discomfort | `urgent_care_today` | Symptom: chest_pain | `urgent_care_today` | 0.98 $\rightarrow$ 0.67 | Unchanged (R041/R039 urgent care retained) |
| **CASE_13** | High-Risk: Acute cough exacerbation in COPD/Asthma | `urgent_care_today` | Symptom: cough | `urgent_care_today` | 0.85 $\rightarrow$ 0.42 | Unchanged (R015 urgent care retained) |
| **CASE_14** | Boundary Threshold: Prolonged fever at exact 5-day cutoff (120h) | `see_doctor_soon` | Symptom: fever | `see_doctor_soon` | 0.80 $\rightarrow$ 0.40 | Unchanged (R011 retained) |
| **CASE_15** | Boundary Threshold: Chronic cough at exact 3-week cutoff (504h) | `see_doctor_routine` | Symptom: cough | `see_doctor_routine` | 0.80 $\rightarrow$ 0.40 | Unchanged (R016 retained) |
| **CASE_16** | Severe Dehydration: Diarrhoea with anuria / postural dizziness | `urgent_care_today` | Symptom: diarrhoea | `urgent_care_today` | 0.90 $\rightarrow$ 0.45 | Unchanged (R029 urgent care retained) |
| **CASE_17** | Airway Threat: Sore throat with inability to swallow secretions | `emergency` | Symptom: sore_throat | `emergency` | 0.95 $\rightarrow$ 0.47 | Unchanged (R033 emergency retained) |
| **CASE_18** | Self-Care: Standard healthy adult with mild tension-type headache | `self_care` | Symptom: headache | `self_care` | 0.80 $\rightarrow$ 0.40 | Unchanged ($0.40 \ge 0.35$ threshold) |
| **CASE_19** | Conflicting Symptoms: Mild cough vs Red-Flag severe bleeding | `emergency` | Warning Sign: severe_bleeding | `urgent_care_today` | 1.00 $\rightarrow$ 0.50 | **CHANGED** (Override suppressed; safety floor enforced) |
| **CASE_20** | No Rule Matched: Non-specific mild fatigue without matched rules | `no_rule_matched` | Symptom: mild fatigue | `no_rule_matched` | 0.00 $\rightarrow$ 0.00 | Unchanged |

### Key Findings from Uncertain Premise Analysis:
*   **Total Cases Changing Tier**: **9 of 20 (45%)**
    *   **Cases 1–8 & 19 (Red-Flag Warning Signs)**: All 9 cases shift from `emergency` to `urgent_care_today`. Because the red-flag warning sign was marked "not sure", the immediate 999/112 ambulance override is safely suppressed, and the system enforces the non-negotiable safety floor of `urgent_care_today` while providing the explicit advisory: *"You were unsure about a serious warning sign. If it is present, call {emergency_number} now."*
*   **Total Cases Invariant in Tier**: **11 of 20 (55%)**
    *   Cases 9–17, 18, and 20 retain their baseline clinical tier while appropriately registering decreased certainty factors reflecting user uncertainty.

---

## Unit Testing Component Breakdown

| Test File | Target Module | Scope | Tests Run | Pass / Fail |
| :--- | :--- | :--- | :--- | :--- |
| `tests/test_rules.py` | `knowledge_base/rules.py` | Rule count, ID indexing, override flags, self-care guards, R040 chest safety test, low-CF fallback test, chest-pain gap tests, R041 restoration test | 15 | 15 / 0 |
| `tests/test_certainty_factor.py` | `inference/certainty_factor.py` | MYCIN formula, range checks, score combination | 6 | 6 / 0 |
| `tests/test_forward_chaining.py` | `inference/forward_chaining.py` | Fixed-point loop, fact derivation, self-care blocking | 6 | 6 / 0 |
| `tests/test_backward_chaining.py` | `inference/backward_chaining.py` | Goal verification, adaptive question selection | 4 | 4 / 0 |
| `tests/test_api.py` | `app/main.py` | Endpoints (`/health`, `/api/rules`, `/api/triage`, `/api/triage/next-question`), Pydantic validation | 8 | 8 / 0 |
| `tests/test_regions.py` | `config/regions.py` | Regional numbers (IN=112, GB=999, US=911, AU=000, CA=911), fallback defaults, no 999 leak for IN | 5 | 5 / 0 |
| `tests/test_premise_certainty.py` | `inference/fact_extraction.py` & `triage_service.py` | Premise CF assignment (0.5 vs 1.0), MYCIN conclusion scaling, self-care threshold fallback, red-flag safety floor, explanation premise transparency | 7 | 7 / 0 |
| `tests/test_clinical_cases.py` | `services/triage_service.py` | 20 clinical benchmark scenarios & edge cases | 20 | 20 / 0 |
