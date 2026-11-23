"""Certainty Factor Engine implementing MYCIN-style evidence combination."""

from typing import Dict, List, Optional


class CertaintyFactorEngine:
    """Computes and combines certainty factors (CF) based on the MYCIN model."""

    @staticmethod
    def calculate(rule_certainty: float, match_strength: float = 1.0) -> float:
        """
        Calculate rule conclusion certainty factor:
        CF(h, e) = CF(rule) * min(CF(premises))
        """
        if not 0.0 <= rule_certainty <= 1.0:
            raise ValueError("Rule certainty must be between 0 and 1.")

        if not 0.0 <= match_strength <= 1.0:
            raise ValueError("Match strength must be between 0 and 1.")

        return round(rule_certainty * match_strength, 3)

    @staticmethod
    def calculate_combined(scores: List[float]) -> float:
        """
        Combine multiple positive evidence scores supporting the same hypothesis:
        CF_comb(CF1, CF2) = CF1 + CF2 * (1 - CF1)

        For N independent scores:
        1 - prod(1 - CF_i)
        """
        if not scores:
            return 0.0

        if any(score < 0.0 or score > 1.0 for score in scores):
            raise ValueError("All scores must be between 0 and 1.")

        combined = 1.0
        for score in scores:
            combined *= (1.0 - score)

        return round(1.0 - combined, 3)

    @staticmethod
    def evaluate_rule_cf(
        rule_cf: float,
        premise_facts: List[str],
        fact_cfs: Optional[Dict[str, float]] = None,
    ) -> float:
        """
        Compute conclusion CF given rule CF and individual premise CFs.
        If premise CF is not explicitly provided, defaults to 1.0 (certain).
        """
        if not premise_facts:
            return rule_cf

        if fact_cfs is None:
            min_premise = 1.0
        else:
            min_premise = min(fact_cfs.get(fact, 1.0) for fact in premise_facts)

        return CertaintyFactorEngine.calculate(rule_cf, min_premise)
