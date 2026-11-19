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
