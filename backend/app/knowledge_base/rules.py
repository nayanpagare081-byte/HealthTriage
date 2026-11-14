
from dataclasses import dataclass
from typing import FrozenSet


@dataclass(frozen=True)
class ProductionRule:
    rule_id: str
    description: str
    conditions: FrozenSet[str]
    conclusion: str
    certainty_factor: float
    source: str
    priority: int


KNOWLEDGE_BASE = [

    ProductionRule(
        rule_id="R001",
        description="Emergency escalation for severe breathing difficulty",
        conditions=frozenset({"severe_breathing_difficulty"}),
        conclusion="emergency_escalation",
        certainty_factor=1.0,
        source="Clinical safety reference required",
        priority=100,
    ),

    ProductionRule(
        rule_id="R002",
        description="Emergency escalation for reported chest pain",
        conditions=frozenset({"chest_pain"}),
        conclusion="emergency_escalation",
        certainty_factor=1.0,
        source="Clinical safety reference required",
        priority=100,
    ),

    ProductionRule(
        rule_id="R003",
        description="Emergency escalation for unconsciousness",
        conditions=frozenset({"unconsciousness"}),
        conclusion="emergency_escalation",
        certainty_factor=1.0,
        source="Clinical safety reference required",
        priority=100,
    ),

    ProductionRule(
        rule_id="R004",
        description="Emergency escalation for new confusion",
        conditions=frozenset({"new_confusion"}),
        conclusion="emergency_escalation",
        certainty_factor=1.0,
        source="Clinical safety reference required",
        priority=100,
    ),

    ProductionRule(
        rule_id="R005",
        description="Emergency escalation for severe bleeding",
        conditions=frozenset({"severe_bleeding"}),
        conclusion="emergency_escalation",
        certainty_factor=1.0,
        source="Clinical safety reference required",
        priority=100,
    ),

    ProductionRule(
        rule_id="R006",
        description="Emergency escalation for stroke-like symptoms",
        conditions=frozenset({"stroke_like_symptoms"}),
        conclusion="emergency_escalation",
        certainty_factor=1.0,
        source="Clinical safety reference required",
        priority=100,
    ),

    ProductionRule(
        rule_id="R007",
        description="Emergency escalation for severe allergic reaction",
        conditions=frozenset({"severe_allergic_reaction"}),
        conclusion="emergency_escalation",
        certainty_factor=1.0,
        source="Clinical safety reference required",
        priority=100,
    ),

    ProductionRule(
        rule_id="R008",
        description="Emergency escalation for coughing blood",
        conditions=frozenset({"coughing_blood"}),
        conclusion="emergency_escalation",
        certainty_factor=1.0,
        source="Clinical safety reference required",
        priority=100,
    ),
]


def get_all_rules():
    """Return all production rules."""
    return KNOWLEDGE_BASE


def get_rule_by_id(rule_id: str):
    """Find a production rule using its ID."""
    for rule in KNOWLEDGE_BASE:
        if rule.rule_id == rule_id:
            return rule
    return None
