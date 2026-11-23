"""Unit tests for the clinical knowledge base rules and self-care guards."""

import pytest
from app.knowledge_base.rules import (
    TriageTier,
    get_all_rules,
    get_rule_by_id,
)


def test_knowledge_base_rule_count():
    """Knowledge base must contain exactly 40 clinical production rules."""
    rules = get_all_rules()
    assert len(rules) == 40


def test_rule_ids_r001_to_r040():
    """All rule IDs from R001 to R040 must be uniquely registered."""
    rules = get_all_rules()
    rule_ids = {r.rule_id for r in rules}
    expected_ids = {f"R0{i:02d}" for i in range(1, 41)}
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
    assert len(self_care_rules) == 7  # R014, R018, R023, R028, R032, R036, R040

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
