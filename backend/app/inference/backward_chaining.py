
from typing import Set, List

from app.knowledge_base.rules import get_all_rules


class BackwardChainingEngine:

    def __init__(self):
        self.rules = get_all_rules()

    def verify(self, goal: str, known_facts: Set[str]):
        """
        Verify whether a goal can be established
        from the available facts using backward chaining.
        """

        activated_rules: List[str] = []
        reasoning_trace: List[str] = []

        def prove(current_goal: str) -> bool:

            # Goal is already a known fact
            if current_goal in known_facts:
                reasoning_trace.append(
                    f"{current_goal} is already a known fact."
                )
                return True

            # Find rules that can establish this goal
            matching_rules = [
                rule for rule in self.rules
                if rule.conclusion == current_goal
            ]

            for rule in matching_rules:

                reasoning_trace.append(
                    f"Checking rule {rule.rule_id}: {rule.description}"
                )

                # All conditions must be known
                if rule.conditions.issubset(known_facts):

                    activated_rules.append(rule.rule_id)

                    reasoning_trace.append(
                        f"Goal '{current_goal}' established by {rule.rule_id}."
                    )

                    return True

            reasoning_trace.append(
                f"Goal '{current_goal}' could not be established."
            )
            return False

        established = prove(goal)

        return {
            "goal": goal,
            "established": established,
            "activated_rules": activated_rules,
            "reasoning_trace": reasoning_trace,
        }
