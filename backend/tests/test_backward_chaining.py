"""Unit tests for Backward Chaining Engine."""

from app.inference.backward_chaining import BackwardChainingEngine


def test_backward_chaining_goal_established():
    engine = BackwardChainingEngine()
    result = engine.verify("emergency_escalation", {"chest_pain"})
    assert result["established"] is True
    assert result["goal"] == "emergency_escalation"
    assert "R002" in result["activated_rules"]
    assert any("established by rule R002" in step for step in result["reasoning_trace"])


def test_backward_chaining_goal_not_established():
    engine = BackwardChainingEngine()
    result = engine.verify("emergency_escalation", set())
    assert result["established"] is False
    assert len(result["activated_rules"]) == 0
    assert any("could not be established" in step for step in result["reasoning_trace"])


def test_backward_chaining_goal_already_known():
    engine = BackwardChainingEngine()
    result = engine.verify("emergency_escalation", {"emergency_escalation"})
    assert result["established"] is True
    assert any("already known" in step for step in result["reasoning_trace"])


def test_find_next_question_derivation():
    """Verify that find_next_question returns the next clinical missing question."""
    engine = BackwardChainingEngine()
    # If patient has symptom:fever, backward chaining looks for fever-associated red/amber flags
    question = engine.find_next_question(
        known_facts={"symptom:fever"},
        answered_question_ids=set(),
    )
    assert question is not None
    assert question.question_id is not None
    assert len(question.prompt) > 10
