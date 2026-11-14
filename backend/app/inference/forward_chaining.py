
from dataclasses import dataclass, field
from typing import Set, List

from app.knowledge_base.rules import get_all_rules


@dataclass
class InferenceResult:
    facts: Set[str] = field(default_factory=set)
    conclusions: Set[str] = field(default_factory=set)
    activated_rules: List[str] = field(default_factory=list)
    reasoning_trace: List[str] = field(default_factory=list)


class ForwardChainingEngine:

    def __init__(self):
        self.rules = get_all_rules()

    def run(self, initial_facts: Set[str]) -> InferenceResult:
        """
        Apply forward chaining:
        1. Start with known facts.
        2. Find rules whose conditions match.
        3. Derive new conclusions.
        4. Repeat until no new facts are derived.
        """

        result = InferenceResult(facts=set(initial_facts))

        changed = True

        while changed:
            changed = False

            for rule in self.rules:

                # Skip rules that have already fired
                if rule.rule_id in result.activated_rules:
                    continue

                # Check whether all rule conditions are known
                if rule.conditions.issubset(result.facts):

                    result.activated_rules.append(rule.rule_id)

                    result.reasoning_trace.append(
                        f"{rule.rule_id}: {rule.description}"
                    )

                    conclusion = rule.conclusion

                    if conclusion not in result.facts:
                        result.facts.add(conclusion)
                        result.conclusions.add(conclusion)
                        changed = True

        return result
