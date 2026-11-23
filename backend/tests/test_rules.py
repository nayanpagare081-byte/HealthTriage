"""Unit tests for the clinical knowledge base rules and self-care guards."""

import pytest
from app.knowledge_base.rules import (
    TriageTier,
    get_all_rules,
    get_rule_by_id,
)


def test_knowledge_base_rule_count():
    """Knowledge base must contain exactly 41 clinical production rules."""
    rules = get_all_rules()
    assert len(rules) == 41


def test_rule_ids_r001_to_r041():
    """All rule IDs from R001 to R041 must be uniquely registered."""
    rules = get_all_rules()
    rule_ids = {r.rule_id for r in rules}
    expected_ids = {f"R0{i:02d}" for i in range(1, 42)}
    assert rule_ids == expected_ids


def test_get_rule_by_id_found():
    """Verify lookup and properties of red-flag rule R001."""
    rule = get_rule_by_id("R001")
    assert rule is not None
    assert rule.rule_id == "R001"
    assert "severe_breathing_difficulty" in rule.conditions
    assert rule.conclusion == "emergency_escalation"
    assert rule.certainty_factor == 1.0
    assert rule.override is True
    assert rule.tier == TriageTier.EMERGENCY


def test_get_rule_by_id_not_found():
    """Invalid rule ID must return None."""
    rule = get_rule_by_id("R999")
    assert rule is None


def test_red_flags_r001_to_r008_are_overrides():
    """All 8 emergency red flags must have override=True and tier=EMERGENCY."""
    for i in range(1, 9):
        rule = get_rule_by_id(f"R0{i:02d}")
        assert rule is not None
        assert rule.override is True
        assert rule.tier == TriageTier.EMERGENCY
        assert rule.certainty_factor == 1.0


def test_self_care_rules_cannot_fire_with_red_flag_warning_signs():
    """
    CRITICAL SAFETY GUARD:
    Every self-care tier rule must be blocked from firing if ANY red-flag warning sign is present.
    """
    rules = get_all_rules()
    self_care_rules = [r for r in rules if r.tier == TriageTier.SELF_CARE]
    assert len(self_care_rules) == 6  # R014, R018, R023, R028, R032, R036 (R040 removed per chest safety)

    for rule in self_care_rules:
        # With warning sign passed as warning_signs list
        assert not rule.is_eligible(
            age=30.0,
            warning_signs=["severe_breathing_difficulty"],
            risk_factors=[],
            known_facts={"symptom:fever", "warning_sign:severe_breathing_difficulty"},
        ), f"Rule {rule.rule_id} allowed firing despite warning sign"

        # With warning sign token in known_facts
        assert not rule.is_eligible(
            age=30.0,
            warning_signs=[],
            risk_factors=[],
            known_facts={"chest_pain"},
        ), f"Rule {rule.rule_id} allowed firing despite chest_pain token in facts"


def test_self_care_rules_cannot_fire_for_high_risk_age_bands():
    """
    CRITICAL SAFETY GUARD:
    Self-care tier rules must NEVER fire for vulnerable age bands:
    - Infants (<3 months or <1 year)
    - Young children (<5 years)
    - Elderly adults (>=65 years)
    """
    self_care_rules = [r for r in get_all_rules() if r.tier == TriageTier.SELF_CARE]

    for rule in self_care_rules:
        # 1. Infant < 3 months (age 0.1)
        assert not rule.is_eligible(age=0.1, warning_signs=[], risk_factors=[]), (
            f"Rule {rule.rule_id} allowed firing for infant under 3 months"
        )
        # 2. Infant under 1 year (age 0.8)
        assert not rule.is_eligible(age=0.8, warning_signs=[], risk_factors=[]), (
            f"Rule {rule.rule_id} allowed firing for infant under 1 year"
        )
        # 3. Child under 5 years (age 3.0)
        assert not rule.is_eligible(age=3.0, warning_signs=[], risk_factors=[]), (
            f"Rule {rule.rule_id} allowed firing for child under 5 years"
        )
        # 4. Elderly adult >= 65 years (age 72.0)
        assert not rule.is_eligible(age=72.0, warning_signs=[], risk_factors=[]), (
            f"Rule {rule.rule_id} allowed firing for elderly adult >= 65 years"
        )


def test_self_care_rules_cannot_fire_with_clinical_risk_factors():
    """
    CRITICAL SAFETY GUARD:
    Self-care tier rules must NEVER fire if ANY chronic risk factor is present
    (e.g., pregnancy, diabetes, asthma/COPD, heart disease, immunocompromise).
    """
    self_care_rules = [r for r in get_all_rules() if r.tier == TriageTier.SELF_CARE]
    test_risks = [
        ["pregnancy"],
        ["diabetes"],
        ["asthma_copd"],
        ["heart_disease"],
        ["immunocompromised"],
    ]

    for rule in self_care_rules:
        for rf in test_risks:
            assert not rule.is_eligible(
                age=30.0,
                warning_signs=[],
                risk_factors=rf,
                known_facts={f"risk:{rf[0]}"},
            ), f"Rule {rule.rule_id} allowed firing despite risk factor {rf[0]}"


def test_self_care_rules_eligible_for_standard_healthy_adult():
    """
    Self-care rules ARE eligible for standard healthy adults (e.g. age 25-50)
    with no red flags and no risk factors.
    """
    self_care_rules = [r for r in get_all_rules() if r.tier == TriageTier.SELF_CARE]

    for rule in self_care_rules:
        assert rule.is_eligible(
            age=30.0,
            warning_signs=[],
            risk_factors=[],
            known_facts=set(),
        ), f"Rule {rule.rule_id} unexpectedly blocked for healthy standard adult"


def test_r040_chest_wall_tenderness_cannot_return_self_care():
    """
    SAFETY REQUIREMENT:
    R040: remove self_care tier. Any chest-related symptom must have a minimum tier of see_doctor_soon.
    A 50-year-old with chest-wall tenderness and no risk factors must NOT return self_care.
    """
    from app.models.patient import PatientInput
    from app.services.triage_service import TriageService

    service = TriageService()
    patient = PatientInput(
        age=50,
        symptoms=["chest pain", "chest_wall_tenderness"],
        severity=3,
        duration_hours=24.0,
        risk_factors=[],
        warning_signs=[],
    )
    result = service.assess(patient)
    assert result["tier"] != "self_care", f"Expected not to return self_care, got '{result['tier']}'"
    assert result["tier"] == "see_doctor_soon", f"Expected 'see_doctor_soon', got '{result['tier']}'"
    assert "R040" in result["activated_rules"], f"Expected R040 to fire, but got {result['activated_rules']}"


def test_low_cf_self_care_fallback_never_returns_self_care():
    """
    CRITICAL OVER-ESCALATION REQUIREMENT:
    Never return self_care when no tier passed the confidence threshold.
    If the fallback picks self_care, return see_doctor_routine instead.
    """
    from app.models.patient import PatientInput
    from app.services.triage_service import TriageService

    # R023 (mild tension headache) fires with CF=0.80. Setting confidence_threshold=0.85
    # ensures R023 does not pass the threshold in the main tier selection loop.
    service = TriageService(confidence_threshold=0.85)
    patient = PatientInput(
        age=25,
        symptoms=["headache"],
        severity=3,
        duration_hours=12.0,
        risk_factors=[],
        warning_signs=[],
    )
    result = service.assess(patient)
    assert result["tier"] != "self_care", "Low-CF self-care fallback must NEVER return self_care"
    assert result["tier"] == "see_doctor_routine", f"Expected see_doctor_routine, got '{result['tier']}'"
    assert "R023" in result["activated_rules"]


def test_chest_pain_severity_9_age_60_no_checkbox():
    """
    CHEST-PAIN GAP REQUIREMENT:
    If symptom:chest_pain is present without the chest_pain warning sign,
    and severity >= 7 OR (age >= 50 AND any risk factor),
    the result must be at least urgent_care_today.
    Case 1: symptom chest pain, severity 9, age 60, no warning checkbox.
    """
    from app.models.patient import PatientInput
    from app.services.triage_service import TriageService

    service = TriageService()
    patient = PatientInput(
        age=60,
        symptoms=["chest pain"],
        severity=9,
        duration_hours=4.0,
        risk_factors=[],
        warning_signs=[],
    )
    result = service.assess(patient)
    assert result["tier"] in ["urgent_care_today", "emergency"], (
        f"Expected at least urgent_care_today, got '{result['tier']}'"
    )
    assert "R039" in result["activated_rules"]


def test_chest_pain_severity_3_age_25_must_not_be_emergency():
    """
    CHEST-PAIN GAP REQUIREMENT:
    Case 2: symptom chest pain, severity 3, age 25, no warning checkbox.
    Must NOT be emergency.
    """
    from app.models.patient import PatientInput
    from app.services.triage_service import TriageService

    service = TriageService()
    patient = PatientInput(
        age=25,
        symptoms=["chest pain"],
        severity=3,
        duration_hours=4.0,
        risk_factors=[],
        warning_signs=[],
    )
    result = service.assess(patient)
    assert result["tier"] != "emergency", f"Mild chest pain without red flag must NOT be emergency, got '{result['tier']}'"


def test_urgent_rule_low_cf_plus_self_care_rule_high_cf_returns_urgent():
    """
    OVER-ESCALATION REQUIREMENT:
    Select the highest-urgency tier among all fired non-override rules regardless
    of the confidence threshold.
    Test: urgent rule CF 0.30 plus self_care rule CF 0.80 must return the urgent tier.
    """
    from unittest.mock import MagicMock
    from app.inference.forward_chaining import FiredRuleDetail, InferenceResult
    from app.models.patient import PatientInput
    from app.services.triage_service import TriageService

    service = TriageService(confidence_threshold=0.35)

    # Mock forward chaining engine to simulate firing an urgent rule (CF 0.30)
    # and a self-care rule (CF 0.80)
    mock_forward_result = InferenceResult(
        facts={"symptom:chest_pain", "symptom:headache", "urgent_care_today", "self_care"},
        conclusions={"urgent_care_today", "self_care"},
        activated_rules=["R_MOCK_URGENT", "R_MOCK_SELF_CARE"],
        reasoning_trace=["urgent fired with 0.30", "self_care fired with 0.80"],
        fired_rule_details=[
            FiredRuleDetail(
                rule_id="R_MOCK_URGENT",
                name="Mock Urgent Rule",
                tier="urgent_care_today",
                certainty_factor=0.30,
                source="Clinical guideline",
                matched_conditions=["symptom:chest_pain"],
                explanation="Urgent condition",
                override=False,
            ),
            FiredRuleDetail(
                rule_id="R_MOCK_SELF_CARE",
                name="Mock Self-Care Rule",
                tier="self_care",
                certainty_factor=0.80,
                source="Home care guideline",
                matched_conditions=["symptom:headache"],
                explanation="Mild condition",
                override=False,
            ),
        ],
    )

    service.forward_engine.run = MagicMock(return_value=mock_forward_result)

    patient = PatientInput(
        age=30,
        symptoms=["chest pain", "headache"],
        severity=5,
        duration_hours=12.0,
    )
    result = service.assess(patient)
    assert result["tier"] == "urgent_care_today", (
        f"Expected urgent_care_today regardless of CF 0.30 vs 0.80, got '{result['tier']}'"
    )


def test_40_year_old_diabetic_with_chest_discomfort_returns_urgent_care():
    """
    R041 RESTORATION REQUIREMENT:
    A 40-year-old with diabetes and chest discomfort must return at least urgent_care_today.
    """
    from app.models.patient import PatientInput
    from app.services.triage_service import TriageService

    service = TriageService()
    patient = PatientInput(
        age=40,
        symptoms=["chest discomfort"],
        risk_factors=["diabetes"],
        severity=4,
        duration_hours=6.0,
        warning_signs=[],
    )
    result = service.assess(patient)
    assert result["tier"] in ["urgent_care_today", "emergency"], (
        f"Expected at least urgent_care_today, got '{result['tier']}'"
    )
    assert "R041" in result["activated_rules"], f"Expected R041 to fire, got {result['activated_rules']}"



