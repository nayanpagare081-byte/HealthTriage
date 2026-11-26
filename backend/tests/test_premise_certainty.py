"""Tests for Feature 2: Premise Certainty & Not-Sure Answers.

Validates that:
1. Uncertain premise facts receive CF 0.5 and certain facts receive CF 1.0.
2. Conclusion CF = rule.cf * min(premise CFs).
3. Test 7a: Same symptoms, once certain and once uncertain -> certainty_score is lower for uncertain.
4. Test 7b: Self-care rule with uncertain premise falling below threshold does not return self_care (returns see_doctor_routine).
5. Test 7c: Uncertain red flag returns at least urgent_care_today, never self_care or no_rule_matched.
6. Test 7d: Certain red flag still returns emergency.
7. Test 7e: Payload with none of the new fields behaves exactly as before.
8. Premise CFs are presented in rule_by_rule_explanation and in fired_rules payload.
9. Required safety advisory text is present whenever an uncertain red flag is reported.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.patient import PatientInput, WarningSign
from app.services.triage_service import TriageService
from app.knowledge_base.rules import TriageTier, TIER_URGENCY_RANK

client = TestClient(app)


def test_7a_certain_vs_uncertain_premise_certainty_score():
    """Test 7a: Same symptoms, once certain and once uncertain:

    certainty_score is strictly lower for the uncertain version.
    """
    service = TriageService(confidence_threshold=0.35)

    certain_patient = PatientInput(
        age=30,
        symptoms=["cough", "fever"],
        severity=3,
        duration_hours=24.0,
        uncertain_symptoms=[],
    )
    uncertain_patient = PatientInput(
        age=30,
        symptoms=["cough", "fever"],
        severity=3,
        duration_hours=24.0,
        uncertain_symptoms=["cough"],
    )

    certain_res = service.assess(certain_patient)
    uncertain_res = service.assess(uncertain_patient)

    assert certain_res["tier"] == uncertain_res["tier"] or certain_res["tier"] in ["self_care", "see_doctor_routine"]
    assert uncertain_res["certainty_score"] < certain_res["certainty_score"], (
        f"Expected uncertain score ({uncertain_res['certainty_score']}) to be strictly lower "
        f"than certain score ({certain_res['certainty_score']})"
    )


def test_7b_self_care_with_uncertain_premise_escalates_to_routine():
    """Test 7b: A self_care rule with an uncertain premise whose combined CF

    falls below the confidence threshold must NOT return self_care
    (it returns see_doctor_routine).
    """
    # R023 (tension headache) has rule CF 0.80.
    # At confidence threshold 0.50:
    # - With certain premise: CF = 0.80 * 1.0 = 0.80 >= threshold -> self_care
    # - With uncertain premise: CF = 0.80 * 0.5 = 0.40 < threshold -> falls below threshold,
    #   must NOT return self_care (it escalates to see_doctor_routine).
    service = TriageService(confidence_threshold=0.50)

    patient_certain = PatientInput(
        age=26,
        symptoms=["headache"],
        severity=3,
        duration_hours=12.0,
        uncertain_symptoms=[],
    )
    res_certain = service.assess(patient_certain)
    assert res_certain["tier"] == TriageTier.SELF_CARE.value
    assert res_certain["certainty_score"] >= 0.50

    patient_uncertain = PatientInput(
        age=26,
        symptoms=["headache"],
        severity=3,
        duration_hours=12.0,
        uncertain_symptoms=["headache"],
    )
    res_uncertain = service.assess(patient_uncertain)
    assert res_uncertain["tier"] == TriageTier.SEE_DOCTOR_ROUTINE.value
    assert res_uncertain["tier"] != TriageTier.SELF_CARE.value
    assert res_uncertain["certainty_score"] < 0.50


def test_7c_uncertain_red_flag_returns_at_least_urgent_care_today():
    """Test 7c: An uncertain red flag returns at least urgent_care_today,

    never self_care or no_rule_matched.
    """
    service = TriageService(confidence_threshold=0.35)

    # 1. Single uncertain warning sign with no other symptoms
    patient_single_ws = PatientInput(
        age=45,
        symptoms=["mild fatigue"],
        warning_signs=[WarningSign.SEVERE_BREATHING_DIFFICULTY],
        uncertain_warning_signs=["severe_breathing_difficulty"],
        severity=4,
    )
    res_single = service.assess(patient_single_ws)

    tier_rank = TIER_URGENCY_RANK[TriageTier(res_single["tier"])]
    urgent_rank = TIER_URGENCY_RANK[TriageTier.URGENT_CARE_TODAY]
    assert tier_rank >= urgent_rank, f"Tier was {res_single['tier']}, expected at least urgent_care_today"
    assert res_single["tier"] != TriageTier.SELF_CARE.value
    assert res_single["tier"] != TriageTier.NO_RULE_MATCHED.value

    # Mandatory advisory message must be present in explanation
    assert "You were unsure about a serious warning sign. If it is present, call" in res_single["explanation"]

    # 2. Mild self-care symptoms combined with uncertain red flag
    patient_mixed = PatientInput(
        age=26,
        symptoms=["headache"],
        warning_signs=[WarningSign.CHEST_PAIN],
        uncertain_warning_signs=["chest_pain"],
        severity=3,
        duration_hours=12.0,
    )
    res_mixed = service.assess(patient_mixed)
    mixed_rank = TIER_URGENCY_RANK[TriageTier(res_mixed["tier"])]
    assert mixed_rank >= urgent_rank
    assert res_mixed["tier"] != TriageTier.SELF_CARE.value


def test_7d_certain_red_flag_still_returns_emergency():
    """Test 7d: A certain red flag still returns emergency via immediate override."""
    service = TriageService(confidence_threshold=0.35)

    patient = PatientInput(
        age=50,
        symptoms=["shortness of breath"],
        warning_signs=[WarningSign.SEVERE_BREATHING_DIFFICULTY],
        uncertain_warning_signs=[],
        severity=9,
        duration_hours=2.0,
    )
    res = service.assess(patient)
    assert res["tier"] == TriageTier.EMERGENCY.value
    assert res["certainty_score"] == 1.0


def test_7e_payload_with_none_of_new_fields_behaves_identically():
    """Test 7e: A payload with none of the new fields behaves exactly as before."""
    service = TriageService(confidence_threshold=0.35)

    # Standard default patient input
    patient = PatientInput(
        age=58,
        symptoms=["chest pain", "diaphoresis"],
        warning_signs=[WarningSign.CHEST_PAIN],
        severity=8,
        duration_hours=1.5,
    )
    assert patient.uncertain_symptoms == []
    assert patient.uncertain_warning_signs == []

    res = service.assess(patient)
    assert res["tier"] == TriageTier.EMERGENCY.value
    assert res["certainty_score"] == 1.0


def test_explanation_shows_premise_cfs_and_resulting_cf():
    """Test requirement 5: The response must show, per fired rule,

    the premise CFs used and the resulting CF in the explanation.
    """
    service = TriageService(confidence_threshold=0.35)

    patient = PatientInput(
        age=30,
        symptoms=["cough"],
        uncertain_symptoms=["cough"],
        severity=3,
        duration_hours=12.0,
    )
    res = service.assess(patient)
    fired_rules = res["fired_rules"]
    assert len(fired_rules) > 0

    first_rule = fired_rules[0]
    assert "premise_cfs" in first_rule
    assert any(cf == 0.5 for cf in first_rule["premise_cfs"].values())

    # Check rule_by_rule_explanation strings
    rule_expls = res["rule_by_rule_explanation"]
    assert len(rule_expls) > 0
    assert any("(CF: 0.50)" in exp and "resulting CF" in exp for exp in rule_expls)


def test_api_uncertain_payload_end_to_end():
    """Verify /api/triage endpoint accepts uncertain_symptoms and uncertain_warning_signs."""
    payload = {
        "age": 35,
        "symptoms": ["cough", "fever"],
        "warning_signs": ["severe_breathing_difficulty"],
        "uncertain_warning_signs": ["severe_breathing_difficulty"],
        "severity": 4,
        "region": "IN",
    }
    response = client.post("/api/triage", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["emergency_number"] == "112"
    assert data["tier"] in ["urgent_care_today", "emergency"]
    assert "You were unsure about a serious warning sign. If it is present, call 112 now." in data["explanation"]
