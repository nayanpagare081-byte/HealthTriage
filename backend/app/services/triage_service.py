"""Triage Service coordinating rule evaluation, certainty math, and explanations."""

from typing import Any, Dict, List, Optional, Set

from app.inference.backward_chaining import BackwardChainingEngine, QuestionItem
from app.inference.certainty_factor import CertaintyFactorEngine
from app.inference.fact_extraction import extract_patient_facts
from app.inference.forward_chaining import ForwardChainingEngine
from app.knowledge_base.rules import (
    TIER_URGENCY_RANK,
    ProductionRule,
    TriageTier,
    get_all_rules,
)
from app.models.patient import NextQuestionRequest, NextQuestionResponse, PatientInput


class TriageService:
    """Core domain service for clinical triage reasoning."""

    def __init__(self, confidence_threshold: float = 0.35):
        self.forward_engine = ForwardChainingEngine()
        self.backward_engine = BackwardChainingEngine()
        self.cf_engine = CertaintyFactorEngine()
        self.confidence_threshold = confidence_threshold

    def assess(self, patient: PatientInput) -> Dict[str, Any]:
        """
        Execute full academic production-rule triage pipeline:
        1. Extract and normalize propositional facts from patient parameters.
        2. Run forward chaining to fixed point.
        3. Enforce red-flag override (bypasses CF math directly to emergency).
        4. Group non-override rules by tier and combine CFs (MYCIN model).
        5. Select tier applying over-escalation fail-safe.
        6. Generate transparent rule-by-rule clinical explanations.
        """
        # 1. Fact extraction
        facts, fact_cfs = extract_patient_facts(patient)

        # 2. Forward chaining
        forward_result = self.forward_engine.run(
            initial_facts=facts,
            fact_cfs=fact_cfs,
            patient=patient,
        )

        # 3. Backward chaining verification for emergency
        backward_result = self.backward_engine.verify(
            "emergency_escalation",
            forward_result.facts,
        )

        # 4. Check for Override Rules (R001 - R008 red flags bypass CF math)
        override_fired = [
            detail for detail in forward_result.fired_rule_details
            if detail.override
        ]

        # 5. Group fired rules by tier and compute MYCIN combined CF
        tier_groups: Dict[str, List[Any]] = {}
        for detail in forward_result.fired_rule_details:
            tier_groups.setdefault(detail.tier, []).append(detail)

        tier_cfs: Dict[str, float] = {}
        for tier_name, rules_in_tier in tier_groups.items():
            scores = [r.certainty_factor for r in rules_in_tier]
            tier_cfs[tier_name] = self.cf_engine.calculate_combined(scores)

        # 6. Tier Selection with Over-Escalation Bias
        urgency_ranked_tiers = sorted(
            [t for t in TriageTier if t != TriageTier.NO_RULE_MATCHED],
            key=lambda t: TIER_URGENCY_RANK[t],
            reverse=True,  # Most urgent first
        )

        selected_tier: str
        selected_cf: float

        if override_fired:
            # Immediate emergency override
            selected_tier = TriageTier.EMERGENCY.value
            selected_cf = 1.0
        elif not forward_result.fired_rule_details:
            # No rules fired
            selected_tier = TriageTier.NO_RULE_MATCHED.value
            selected_cf = 0.0
        else:
            # Select the highest-urgency tier whose combined CF passes threshold.
            # Fail towards over-escalation if multiple tiers or low confidence.
            chosen = None
            for tier in urgency_ranked_tiers:
                t_val = tier.value
                if t_val in tier_cfs and tier_cfs[t_val] >= self.confidence_threshold:
                    chosen = (t_val, tier_cfs[t_val])
                    break

            if chosen:
                selected_tier, selected_cf = chosen
            else:
                # If no tier passed the threshold, pick the highest urgency tier among fired rules
                # (fail toward over-escalation)
                highest_tier = max(
                    tier_groups.keys(),
                    key=lambda t: TIER_URGENCY_RANK.get(TriageTier(t), 0),
                )
                selected_tier = highest_tier
                selected_cf = tier_cfs.get(highest_tier, 0.5)

        # Backward compatible outcome string
        if selected_tier == TriageTier.EMERGENCY.value:
            outcome = "emergency_escalation"
        elif selected_tier == TriageTier.NO_RULE_MATCHED.value:
            outcome = "insufficient_information"
        else:
            outcome = selected_tier

        # 7. Generate transparent rule-by-rule explanations
        rule_by_rule_explanations: List[str] = []
        for r in forward_result.fired_rule_details:
            conds_str = ", ".join(r.matched_conditions) if r.matched_conditions else "clinical criteria"
            expl = (
                f"Rule {r.rule_id} fired because {conds_str}, giving tier '{r.tier}' "
                f"with certainty {r.certainty_factor:.2f}. Source: {r.source}"
            )
            rule_by_rule_explanations.append(expl)

        # High-level clinical narrative summary
        if selected_tier == TriageTier.EMERGENCY.value:
            explanation = (
                "EMERGENCY: One or more life-threatening warning signs or critical red flags were identified. "
                "Immediate emergency services (such as 999 or nearest emergency department) are required."
            )
        elif selected_tier == TriageTier.URGENT_CARE_TODAY.value:
            explanation = (
                "URGENT CARE: Significant acute symptoms or high-risk clinical factors were detected. "
                "Same-day clinical evaluation (urgent treatment centre, NHS 111, or same-day GP) is strongly recommended."
            )
        elif selected_tier == TriageTier.SEE_DOCTOR_SOON.value:
            explanation = (
                "SEE DOCTOR SOON: Subacute or persistent symptoms require timely medical evaluation within the next 24 to 48 hours."
            )
        elif selected_tier == TriageTier.SEE_DOCTOR_ROUTINE.value:
            explanation = (
                "ROUTINE DOCTOR REVIEW: Symptoms suggest a non-urgent chronic or subacute condition suitable for routine primary care appointment."
            )
        elif selected_tier == TriageTier.SELF_CARE.value:
            explanation = (
                "SELF-CARE: Current symptoms are consistent with mild, self-limiting viral illness without red flags or vulnerable risk factors. "
                "Manage symptoms with rest, hydration, and over-the-counter remedies. Re-seek medical care if symptoms worsen or fail to improve."
            )
        else:
            explanation = (
                "NO SPECIFIC RULE MATCHED: No configured clinical triage rule matched your exact symptom pattern. "
                "This is NOT an all-clear or confirmation of safety. Please consult a qualified doctor if symptoms continue, worsen, or cause you concern."
            )

        disclaimer = (
            "Academic prototype only. This expert system provides preliminary symptom reasoning and is NOT a diagnostic tool "
            "or medical device. It does not replace clinical judgment. Always consult a qualified doctor for medical advice or diagnosis."
        )

        fired_rules_payload = [
            {
                "rule_id": d.rule_id,
                "name": d.name,
                "tier": d.tier,
                "certainty_factor": d.certainty_factor,
                "source": d.source,
                "matched_conditions": d.matched_conditions,
                "explanation": d.explanation,
                "override": d.override,
            }
            for d in forward_result.fired_rule_details
        ]

        return {
            "tier": selected_tier,
            "outcome": outcome,
            "certainty_score": selected_cf,
            "fired_rules": fired_rules_payload,
            "activated_rules": forward_result.activated_rules,
            "forward_chaining": {
                "conclusions": list(forward_result.conclusions),
                "reasoning_trace": forward_result.reasoning_trace,
            },
            "forward_chaining_trace": forward_result.reasoning_trace,
            "backward_chaining": backward_result,
            "backward_chaining_result": backward_result,
            "explanation": explanation,
            "rule_by_rule_explanation": rule_by_rule_explanations,
            "disclaimer": disclaimer,
        }

    def get_next_question(self, req: NextQuestionRequest) -> Dict[str, Any]:
        """
        Derive the next adaptive clinical question using backward chaining.
        Takes partial patient facts and answered questions, checks if active goal
        is resolved or finds the next missing premise.
        """
        # Convert request parameters into dummy patient for fact extraction
        patient_dummy = PatientInput(
            age=req.age if req.age is not None else 30.0,
            symptoms=req.symptoms if req.symptoms else ["general_symptom"],
            warning_signs=[
                ws for ws in req.warning_signs
                if ws in [w.value for w in PatientInput.__annotations__["warning_signs"].__args__[0].__members__.values()]
            ] if req.warning_signs else [],
            duration_hours=req.duration_hours,
            severity=req.severity if req.severity is not None else 5,
            risk_factors=req.risk_factors or [],
        )

        facts, _ = extract_patient_facts(
            patient_dummy,
            answered_facts=req.answered_questions,
        )

        answered_ids = set(req.answered_question_ids or [])
        if req.answered_questions:
            for qid in req.answered_questions.keys():
                answered_ids.add(qid)

        # Proactively check if emergency override is already established
        for sign in req.warning_signs:
            if sign:
                # Goal already decided!
                return {
                    "has_next_question": False,
                    "question_id": None,
                    "prompt": None,
                    "target_fact": None,
                    "input_type": None,
                    "options": [],
                    "relevance": "Emergency warning sign reported. Assessment is decided.",
                    "current_tier_goal": "emergency",
                }

        next_q: Optional[QuestionItem] = self.backward_engine.find_next_question(
            known_facts=facts,
            answered_question_ids=answered_ids,
            patient=patient_dummy,
        )

        if next_q:
            return {
                "has_next_question": True,
                "question_id": next_q.question_id,
                "prompt": next_q.prompt,
                "target_fact": next_q.target_fact,
                "input_type": next_q.input_type,
                "options": next_q.options,
                "relevance": next_q.relevance,
                "current_tier_goal": next_q.current_tier_goal,
            }

        return {
            "has_next_question": False,
            "question_id": None,
            "prompt": None,
            "target_fact": None,
            "input_type": None,
            "options": [],
            "relevance": "All clinical triage questions have been answered.",
            "current_tier_goal": None,
        }
