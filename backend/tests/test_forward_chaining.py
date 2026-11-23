"""Unit tests for Forward Chaining Engine."""

from app.inference.forward_chaining import ForwardChainingEngine


def test_forward_chaining_empty_facts():
    engine = ForwardChainingEngine()
    result = engine.run(set())
    assert len(result.activated_rules) == 0
    assert len(result.conclusions) == 0


def test_forward_chaining_single_warning_sign():
    engine = ForwardChainingEngine()
    result = engine.run({"chest_pain"})
    assert "R002" in result.activated_rules
    assert "emergency_escalation" in result.conclusions
    assert len(result.reasoning_trace) >= 1


def test_forward_chaining_multiple_warning_signs():
    engine = ForwardChainingEngine()
    result = engine.run({"chest_pain", "severe_breathing_difficulty"})
    assert "R001" in result.activated_rules
    assert "R002" in result.activated_rules
    assert "emergency_escalation" in result.conclusions


def test_forward_chaining_irrelevant_facts():
    engine = ForwardChainingEngine()
    result = engine.run({"mild_sneezing", "minor_scratch"})
    assert len(result.activated_rules) == 0
    assert len(result.conclusions) == 0


def test_forward_chaining_graded_rule_fever_5_days():
    engine = ForwardChainingEngine()
    result = engine.run({"symptom:fever", "duration:over_5_days"})
    assert "R011" in result.activated_rules
    assert "see_doctor_soon" in result.conclusions


def test_forward_chaining_self_care_blocked_by_guard():
    """Verify that a self-care rule (R023 tension headache) does not fire if high-risk age fact is present."""
    engine = ForwardChainingEngine()
    # R023 requires symptom:headache and severity:mild_le_4
    # But with age:elderly_65_plus present, the self-care guard blocks it!
    result = engine.run({
        "symptom:headache",
        "severity:mild_le_4",
        "age:elderly_65_plus",
    })
    assert "R023" not in result.activated_rules
    assert "self_care" not in result.conclusions
