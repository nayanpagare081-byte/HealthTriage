"""End-to-End Clinical Triage Test Suite: 20 Documented Clinical Benchmark Cases.

Validates multi-tier rule routing, certainty factor combination, safety overrides,
and boundary threshold conditions across 20 distinct clinical scenarios.
"""

from typing import Any, Dict, List
import pytest
from app.models.patient import PatientInput, WarningSign
from app.services.triage_service import TriageService

CLINICAL_BENCHMARK_CASES: List[Dict[str, Any]] = [
    {
        "id": "CASE_01",
        "description": "Emergency Red Flag R001: Severe breathing difficulty",
        "input": {
            "age": 50,
            "symptoms": ["shortness of breath"],
            "warning_signs": [WarningSign.SEVERE_BREATHING_DIFFICULTY],
            "severity": 9,
            "duration_hours": 2.0,
        },
        "expected_tier": "emergency",
        "expected_rule": "R001",
        "reasoning": "Life-threatening acute breathing difficulty triggers override rule R001 directly to emergency.",
    },
    {
        "id": "CASE_02",
        "description": "Emergency Red Flag R002: Acute central chest pain",
        "input": {
            "age": 58,
            "symptoms": ["chest pain", "diaphoresis"],
            "warning_signs": [WarningSign.CHEST_PAIN],
            "severity": 8,
            "duration_hours": 1.5,
        },
        "expected_tier": "emergency",
        "expected_rule": "R002",
        "reasoning": "Suspected acute coronary syndrome triggers override rule R002 directly to emergency.",
    },
    {
        "id": "CASE_03",
        "description": "Emergency Red Flag R003: Unconsciousness or collapse",
        "input": {
            "age": 32,
            "symptoms": ["syncope"],
            "warning_signs": [WarningSign.UNCONSCIOUSNESS],
            "severity": 10,
            "duration_hours": 0.5,
        },
        "expected_tier": "emergency",
        "expected_rule": "R003",
        "reasoning": "Loss of consciousness triggers override rule R003 directly to emergency.",
    },
    {
        "id": "CASE_04",
        "description": "Emergency Red Flag R004: Sudden new acute confusion",
        "input": {
            "age": 74,
            "symptoms": ["confusion", "disorientation"],
            "warning_signs": [WarningSign.NEW_CONFUSION],
            "severity": 8,
            "duration_hours": 3.0,
        },
        "expected_tier": "emergency",
        "expected_rule": "R004",
        "reasoning": "Acute delirium or altered mental state triggers override rule R004 directly to emergency.",
    },
    {
        "id": "CASE_05",
        "description": "Emergency Red Flag R005: Severe uncontrolled bleeding",
        "input": {
            "age": 29,
            "symptoms": ["laceration", "bleeding"],
            "warning_signs": [WarningSign.SEVERE_BLEEDING],
            "severity": 9,
            "duration_hours": 1.0,
        },
        "expected_tier": "emergency",
        "expected_rule": "R005",
        "reasoning": "Uncontrolled hemorrhage unresponsive to pressure triggers override rule R005 directly to emergency.",
    },
    {
        "id": "CASE_06",
        "description": "Emergency Red Flag R006: Stroke-like symptoms (FAST)",
        "input": {
            "age": 67,
            "symptoms": ["facial droop", "arm weakness"],
            "warning_signs": [WarningSign.STROKE_LIKE_SYMPTOMS],
            "severity": 8,
            "duration_hours": 0.75,
        },
        "expected_tier": "emergency",
        "expected_rule": "R006",
        "reasoning": "Signs of acute stroke trigger override rule R006 directly to emergency.",
    },
    {
        "id": "CASE_07",
        "description": "Emergency Red Flag R007: Severe allergic reaction / anaphylaxis",
        "input": {
            "age": 22,
            "symptoms": ["lip swelling", "wheeze"],
            "warning_signs": [WarningSign.SEVERE_ALLERGIC_REACTION],
            "severity": 9,
            "duration_hours": 0.5,
        },
        "expected_tier": "emergency",
        "expected_rule": "R007",
        "reasoning": "Severe allergic reaction with airway compromise triggers override rule R007 directly to emergency.",
    },
    {
        "id": "CASE_08",
        "description": "Emergency Red Flag R008: Coughing up blood (haemoptysis)",
        "input": {
            "age": 61,
            "symptoms": ["coughing blood"],
            "warning_signs": [WarningSign.COUGHING_BLOOD],
            "severity": 8,
            "duration_hours": 4.0,
        },
        "expected_tier": "emergency",
        "expected_rule": "R008",
        "reasoning": "Gross haemoptysis triggers override rule R008 directly to emergency.",
    },
    {
        "id": "CASE_09",
        "description": "Vulnerable Age: Infant under 3 months with fever",
        "input": {
            "age": 0.15,  # ~8 weeks
            "symptoms": ["fever"],
            "warning_signs": [],
            "severity": 6,
            "duration_hours": 12.0,
        },
        "expected_tier": "emergency",
        "expected_rule": "R009",
        "reasoning": "NICE NG143 Red flag: fever in an infant <3 months carries serious bacterial infection risk.",
    },
    {
        "id": "CASE_10",
        "description": "Vulnerable Age: Infant 3-6 months with high fever",
        "input": {
            "age": 0.35,  # ~4 months
            "symptoms": ["fever"],
            "warning_signs": [],
            "severity": 7,
            "duration_hours": 18.0,
        },
        "expected_tier": "urgent_care_today",
        "expected_rule": "R010",
        "reasoning": "NICE NG143 Amber flag: high fever in an infant 3-6 months warrants urgent same-day assessment.",
    },
    {
        "id": "CASE_11",
        "description": "High-Risk: Pregnancy with acute abdominal pain",
        "input": {
            "age": 28,
            "symptoms": ["abdominal_pain"],
            "risk_factors": ["pregnancy"],
            "severity": 6,
            "duration_hours": 6.0,
        },
        "expected_tier": "urgent_care_today",
        "expected_rule": "R025",
        "reasoning": "NHS / RCOG: Any unexplained abdominal pain in pregnancy warrants same-day urgent obstetric evaluation.",
    },
    {
        "id": "CASE_12",
        "description": "High-Risk: Elderly diabetic patient with atypical chest discomfort",
        "input": {
            "age": 70,
            "symptoms": ["chest_pain"],
            "risk_factors": ["diabetes"],
            "severity": 5,
            "duration_hours": 8.0,
        },
        "expected_tier": "urgent_care_today",
        "expected_rule": "R039",
        "reasoning": "NICE CG95: Diabetic patients may have atypical cardiac ischaemia requiring same-day urgent care.",
    },
    {
        "id": "CASE_13",
        "description": "High-Risk: Acute cough exacerbation in COPD/Asthma",
        "input": {
            "age": 42,
            "symptoms": ["cough"],
            "risk_factors": ["asthma_copd"],
            "severity": 7,
            "duration_hours": 24.0,
        },
        "expected_tier": "urgent_care_today",
        "expected_rule": "R015",
        "reasoning": "NICE NG115: Moderate-to-severe respiratory symptoms in asthma/COPD indicate acute exacerbation.",
    },
    {
        "id": "CASE_14",
        "description": "Boundary Threshold: Prolonged fever at exact 5-day cutoff (120h)",
        "input": {
            "age": 35,
            "symptoms": ["fever"],
            "duration_hours": 120.0,
            "severity": 5,
        },
        "expected_tier": "see_doctor_soon",
        "expected_rule": "R011",
        "reasoning": "NICE NG143 / NHS: Fever persisting >= 5 days (120h boundary) requires timely doctor review.",
    },
    {
        "id": "CASE_15",
        "description": "Boundary Threshold: Chronic cough at exact 3-week cutoff (504h)",
        "input": {
            "age": 52,
            "symptoms": ["cough"],
            "duration_hours": 504.0,
            "severity": 4,
        },
        "expected_tier": "see_doctor_routine",
        "expected_rule": "R016",
        "reasoning": "NICE NG12: Unexplained cough lasting > 3 weeks warrants routine GP evaluation and chest X-ray.",
    },
    {
        "id": "CASE_16",
        "description": "Severe Dehydration: Diarrhoea with anuria / postural dizziness",
        "input": {
            "age": 40,
            "symptoms": ["diarrhoea", "severe_dehydration"],
            "severity": 7,
            "duration_hours": 36.0,
        },
        "expected_tier": "urgent_care_today",
        "expected_rule": "R029",
        "reasoning": "NHS: Diarrhoea with severe dehydration signs requires same-day urgent medical rehydration.",
    },
    {
        "id": "CASE_17",
        "description": "Airway Threat: Sore throat with inability to swallow secretions",
        "input": {
            "age": 34,
            "symptoms": ["sore_throat", "inability_to_swallow"],
            "severity": 9,
            "duration_hours": 12.0,
        },
        "expected_tier": "emergency",
        "expected_rule": "R033",
        "reasoning": "NICE CKS / NHS: Inability to swallow saliva or stridor indicates acute airway threat (epiglottitis).",
    },
    {
        "id": "CASE_18",
        "description": "Self-Care: Standard healthy adult with mild tension-type headache",
        "input": {
            "age": 26,
            "symptoms": ["headache"],
            "duration_hours": 12.0,
            "severity": 3,
            "risk_factors": [],
            "warning_signs": [],
        },
        "expected_tier": "self_care",
        "expected_rule": "R023",
        "reasoning": "Mild short-duration headache in healthy standard adult meets self-care criteria.",
    },
    {
        "id": "CASE_19",
        "description": "Conflicting Symptoms: Mild cough vs Red-Flag severe bleeding",
        "input": {
            "age": 30,
            "symptoms": ["cough"],
            "duration_hours": 24.0,
            "severity": 3,
            "warning_signs": [WarningSign.SEVERE_BLEEDING],
        },
        "expected_tier": "emergency",
        "expected_rule": "R005",
        "reasoning": "Over-escalation safety rule: red-flag severe bleeding completely overrides mild cough to emergency.",
    },
    {
        "id": "CASE_20",
        "description": "No Rule Matched: Non-specific mild fatigue without matched rules",
        "input": {
            "age": 24,
            "symptoms": ["mild fatigue", "dry skin"],
            "duration_hours": 10.0,
            "severity": 2,
            "risk_factors": [],
            "warning_signs": [],
        },
        "expected_tier": "no_rule_matched",
        "expected_rule": None,
        "reasoning": "No production rules matched; returns safe no_rule_matched advisory advising to seek doctor if symptoms persist.",
    },
]


@pytest.mark.parametrize("case", CLINICAL_BENCHMARK_CASES, ids=lambda c: c["id"])
def test_clinical_benchmark_case(case: Dict[str, Any]):
    """Execute triage assessment for each benchmark clinical case."""
    service = TriageService()
    patient = PatientInput(**case["input"])
    result = service.assess(patient)

    assert result["tier"] == case["expected_tier"], (
        f"Case {case['id']} failed: Expected tier '{case['expected_tier']}', "
        f"got '{result['tier']}'. Explanation: {result['explanation']}"
    )

    if case["expected_rule"]:
        assert case["expected_rule"] in result["activated_rules"], (
            f"Case {case['id']} failed: Expected rule '{case['expected_rule']}' "
            f"to fire, but fired rules were {result['activated_rules']}"
        )
