from app.knowledge_base.rules import get_all_rules, get_rule_by_id


def test_knowledge_base_rule_count():
    rules = get_all_rules()
    assert len(rules) == 8


def test_rule_ids_r001_to_r008():
    rules = get_all_rules()
    rule_ids = {r.rule_id for r in rules}
    expected_ids = {f"R00{i}" for i in range(1, 9)}
    assert rule_ids == expected_ids


def test_get_rule_by_id_found():
    rule = get_rule_by_id("R001")
    assert rule is not None
    assert rule.rule_id == "R001"
    assert "severe_breathing_difficulty" in rule.conditions
    assert rule.conclusion == "emergency_escalation"
    assert rule.certainty_factor == 1.0


def test_get_rule_by_id_not_found():
    rule = get_rule_by_id("R999")
    assert rule is None
