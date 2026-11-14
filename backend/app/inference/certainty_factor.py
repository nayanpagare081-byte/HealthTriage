
from typing import List


class CertaintyFactorEngine:

    @staticmethod
    def calculate(rule_certainty: float, match_strength: float = 1.0) -> float:
        """Calculate a rule-match strength score."""

        if not 0.0 <= rule_certainty <= 1.0:
            raise ValueError("Rule certainty must be between 0 and 1.")

        if not 0.0 <= match_strength <= 1.0:
            raise ValueError("Match strength must be between 0 and 1.")

        return round(rule_certainty * match_strength, 3)

    @staticmethod
    def calculate_combined(scores: List[float]) -> float:
        """Combine independent positive evidence scores."""

        if not scores:
            return 0.0

        if any(score < 0.0 or score > 1.0 for score in scores):
            raise ValueError("All scores must be between 0 and 1.")

        combined = 1.0

        for score in scores:
            combined *= (1.0 - score)

        return round(1.0 - combined, 3)
