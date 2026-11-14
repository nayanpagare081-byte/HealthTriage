
from app.inference.forward_chaining import ForwardChainingEngine
from app.inference.backward_chaining import BackwardChainingEngine
from app.inference.certainty_factor import CertaintyFactorEngine
from app.knowledge_base.rules import get_all_rules


class TriageService:

    def __init__(self):
        self.forward_engine = ForwardChainingEngine()
        self.backward_engine = BackwardChainingEngine()
        self.cf_engine = CertaintyFactorEngine()

    def assess(self, patient):
        """
        Run the academic rule-based reasoning pipeline.
        This is not a clinical diagnosis or a safety clearance.
        """

        # Convert reported warning signs into reasoning facts
        initial_facts = {
            sign.value for sign in patient.warning_signs
        }

        # Forward chaining
        forward_result = self.forward_engine.run(initial_facts)

        # Backward chaining
        backward_result = self.backward_engine.verify(
            "emergency_escalation",
            initial_facts
        )

        # Calculate scores for activated rules
        rule_lookup = {
            rule.rule_id: rule for rule in get_all_rules()
        }

        rule_scores = [
            self.cf_engine.calculate(
                rule_lookup[rule_id].certainty_factor
            )
            for rule_id in forward_result.activated_rules
        ]

        combined_score = self.cf_engine.calculate_combined(
            rule_scores
        )

        # Determine the prototype's rule outcome
        if "emergency_escalation" in forward_result.conclusions:
            outcome = "emergency_escalation"
        else:
            outcome = "insufficient_information"

        return {
            "outcome": outcome,
            "certainty_score": combined_score,
            "activated_rules": forward_result.activated_rules,
            "forward_chaining": {
                "conclusions": list(forward_result.conclusions),
                "reasoning_trace": forward_result.reasoning_trace,
            },
            "backward_chaining": backward_result,
            "explanation": (
                "A configured warning-sign rule was matched. "
                "This prototype does not provide a medical diagnosis."
                if outcome == "emergency_escalation"
                else
                "No configured emergency rule was matched. "
                "This does not establish that the person is safe. "
                "Seek professional medical advice when concerned."
            ),
            "disclaimer": (
                "Academic prototype only. Not a medical diagnosis "
                "or a substitute for professional medical assessment."
            ),
        }
