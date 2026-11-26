"""Forward Chaining Production Inference Engine.

Iterates to a fixed point from patient facts, evaluating production rules,
recording execution traces, enforcing self-care safety guards, and propagating
MYCIN certainty factors.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set

from app.inference.certainty_factor import CertaintyFactorEngine
from app.knowledge_base.rules import (
    ProductionRule,
    TriageTier,
    get_all_rules,
)


@dataclass
class FiredRuleDetail:
    rule_id: str
    name: str
    tier: str
    certainty_factor: float
    source: str
    matched_conditions: List[str]
    explanation: str
    override: bool = False
    premise_cfs: Dict[str, float] = field(default_factory=dict)


@dataclass
class InferenceResult:
    facts: Set[str] = field(default_factory=set)
    conclusions: Set[str] = field(default_factory=set)
    activated_rules: List[str] = field(default_factory=list)
    reasoning_trace: List[str] = field(default_factory=list)
    fired_rule_details: List[FiredRuleDetail] = field(default_factory=list)


class ForwardChainingEngine:
    """Forward chaining inference engine with fixed-point iteration."""

    def __init__(self, rules: Optional[List[ProductionRule]] = None):
        self.rules: List[ProductionRule] = rules if rules is not None else get_all_rules()

    def run(
        self,
        initial_facts: Set[str],
        fact_cfs: Optional[Dict[str, float]] = None,
        patient: Optional[Any] = None,
    ) -> InferenceResult:
        """
        Execute forward chaining to a fixed point:
        1. Initialize with verified patient facts.
        2. Evaluate production rules against known facts.
        3. Enforce eligibility guards (e.g. self-care restrictions).
        4. Derive new tier conclusions and propagate certainty factors.
        5. Repeat until no additional rules match (fixed point reached).
        """
        result = InferenceResult(facts=set(initial_facts))
        cfs: Dict[str, float] = dict(fact_cfs or {})

        # Extract patient metadata for eligibility guarding
        age: Optional[float] = getattr(patient, "age", None) if patient else None
        warning_signs: Optional[List[Any]] = getattr(patient, "warning_signs", None) if patient else None
        risk_factors: Optional[List[str]] = getattr(patient, "risk_factors", None) if patient else None

        changed = True

        while changed:
            changed = False

            for rule in self.rules:
                # Skip rules that have already fired
                if rule.rule_id in result.activated_rules:
                    continue

                # Enforce safety guard: self-care tier rules must not fire if red flags,
                # vulnerable age bands, or risk factors are present.
                if not rule.is_eligible(
                    age=age,
                    warning_signs=warning_signs,
                    risk_factors=risk_factors,
                    known_facts=result.facts,
                ):
                    continue

                # Check condition satisfaction
                if rule.conditions.issubset(result.facts):
                    # Identify matched premises
                    matched_premises = [
                        p for p in (rule.conditions.required_facts or rule.conditions)
                        if p in result.facts
                    ] or list(rule.conditions)

                    # Capture individual premise CFs
                    matched_premise_cfs = {
                        p: cfs.get(p, 1.0) for p in matched_premises
                    }
                    min_premise = (
                        min(matched_premise_cfs.values())
                        if matched_premise_cfs
                        else 1.0
                    )

                    # Compute conclusion CF using MYCIN rule
                    rule_cf = CertaintyFactorEngine.evaluate_rule_cf(
                        rule.certainty_factor,
                        matched_premises,
                        cfs,
                    )

                    # For red-flag override rules (R001-R008):
                    # - If premises are certain (CF 1.0), override is enabled with emergency tier.
                    # - If any premise is uncertain (CF < 1.0), override is disabled and tier is urgent_care_today.
                    if rule.override:
                        if min_premise >= 1.0:
                            effective_override = True
                            tier_value = rule.tier.value
                        else:
                            effective_override = False
                            tier_value = TriageTier.URGENT_CARE_TODAY.value
                    else:
                        effective_override = False
                        tier_value = rule.tier.value

                    result.activated_rules.append(rule.rule_id)

                    explanation = rule.explanation_template or rule.name
                    reasoning_entry = (
                        f"{rule.rule_id}: {rule.name} -> concluded {tier_value} "
                        f"(CF: {rule_cf:.2f}, Source: {rule.source})"
                    )
                    result.reasoning_trace.append(reasoning_entry)

                    result.fired_rule_details.append(
                        FiredRuleDetail(
                            rule_id=rule.rule_id,
                            name=rule.name,
                            tier=tier_value,
                            certainty_factor=rule_cf,
                            source=rule.source,
                            matched_conditions=matched_premises,
                            explanation=explanation,
                            override=effective_override,
                            premise_cfs=matched_premise_cfs,
                        )
                    )

                    # Add conclusions to derived facts
                    conclusion_str = tier_value
                    if conclusion_str not in result.facts:
                        result.facts.add(conclusion_str)
                        result.conclusions.add(conclusion_str)
                        changed = True

                    # Preserve backward compatibility for emergency conclusion alias
                    if tier_value == TriageTier.EMERGENCY.value:
                        result.facts.add("emergency_escalation")
                        result.conclusions.add("emergency_escalation")

        return result
