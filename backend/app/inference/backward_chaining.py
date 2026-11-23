"""Backward Chaining Goal-Directed Prover and Interactive Questionnaire.

Verifies whether a clinical triage goal can be established from current patient
facts, and identifies the next most discriminative missing premise to query.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set

from app.knowledge_base.rules import (
    ProductionRule,
    TIER_URGENCY_RANK,
    TriageTier,
    get_all_rules,
)


@dataclass
class QuestionItem:
    question_id: str
    prompt: str
    target_fact: str
    input_type: str  # "boolean", "choice", "number"
    options: List[str] = field(default_factory=list)
    relevance: str = ""
    current_tier_goal: str = ""


# Mapping of clinical premise facts to patient-friendly question prompts
CLINICAL_QUESTIONS_REGISTRY: Dict[str, Dict[str, Any]] = {
    "severe_breathing_difficulty": {
        "question_id": "Q_BREATHING",
        "prompt": "Are you experiencing severe breathing difficulty, such as gasping, rapid breathing, or being unable to speak in full sentences?",
        "input_type": "boolean",
        "relevance": "Screens for critical airway and respiratory compromise requiring 999 emergency services.",
    },
    "chest_pain": {
        "question_id": "Q_CHEST_PAIN",
        "prompt": "Do you have severe central chest pain, heaviness, tightness, or squeezing across your chest?",
        "input_type": "boolean",
        "relevance": "Screens for acute coronary syndrome requiring immediate emergency medical evaluation.",
    },
    "unconsciousness": {
        "question_id": "Q_CONSCIOUSNESS",
        "prompt": "Has the person collapsed, fainted, or lost consciousness?",
        "input_type": "boolean",
        "relevance": "Assesses for neurological or haemodynamic collapse requiring immediate emergency care.",
    },
    "new_confusion": {
        "question_id": "Q_CONFUSION",
        "prompt": "Is there sudden new confusion, disorientation, difficulty speaking, or altered mental state?",
        "input_type": "boolean",
        "relevance": "Screens for acute intracranial pathology, stroke, or severe sepsis.",
    },
    "severe_bleeding": {
        "question_id": "Q_BLEEDING",
        "prompt": "Is there severe, heavy bleeding that does not stop after applying firm direct pressure?",
        "input_type": "boolean",
        "relevance": "Screens for uncontrolled hemorrhage requiring emergency trauma intervention.",
    },
    "stroke_like_symptoms": {
        "question_id": "Q_STROKE",
        "prompt": "Are there sudden signs of stroke: facial drooping, arm weakness, or slurred speech (FAST)?",
        "input_type": "boolean",
        "relevance": "Immediate time-critical emergency referral for suspected acute stroke.",
    },
    "severe_allergic_reaction": {
        "question_id": "Q_ANAPHYLAXIS",
        "prompt": "Is there sudden swelling of the lips, tongue, or throat, or wheezing with a widespread rash?",
        "input_type": "boolean",
        "relevance": "Screens for anaphylaxis requiring immediate emergency intramuscular adrenaline.",
    },
    "coughing_blood": {
        "question_id": "Q_COUGHING_BLOOD",
        "prompt": "Are you coughing up noticeable amounts of frank red blood?",
        "input_type": "boolean",
        "relevance": "Assesses for pulmonary hemorrhage or pulmonary embolism.",
    },
    "symptom:stiff_neck": {
        "question_id": "Q_STIFF_NECK",
        "prompt": "Do you have a stiff neck, an aversion to bright lights (photophobia), or a rash that does not fade when pressed with a glass?",
        "input_type": "boolean",
        "relevance": "Screens for meningococcal meningitis in the presence of fever.",
    },
    "symptom:inability_to_swallow": {
        "question_id": "Q_SWALLOW_STRIDOR",
        "prompt": "Are you having difficulty swallowing your own saliva, drooling, or making a high-pitched noise when breathing (stridor)?",
        "input_type": "boolean",
        "relevance": "Identifies upper airway obstruction or acute epiglottitis.",
    },
    "risk:pregnancy": {
        "question_id": "Q_PREGNANCY",
        "prompt": "Are you currently pregnant (or could you possibly be pregnant)?",
        "input_type": "boolean",
        "relevance": "Abdominal or pelvic pain in pregnancy warrants urgent obstetric evaluation.",
    },
    "risk:immunocompromised": {
        "question_id": "Q_IMMUNOCOMPROMISED",
        "prompt": "Are you immunocompromised (e.g. undergoing chemotherapy, taking immunosuppressive medication, or having an immune disorder)?",
        "input_type": "boolean",
        "relevance": "Screens for high risk of neutropenic sepsis during febrile illness.",
    },
    "risk:asthma_copd": {
        "question_id": "Q_ASTHMA_COPD",
        "prompt": "Do you have a diagnosed chronic respiratory condition such as asthma or COPD?",
        "input_type": "boolean",
        "relevance": "Respiratory symptoms in asthma or COPD require lower threshold for urgent assessment.",
    },
    "risk:diabetes": {
        "question_id": "Q_DIABETES",
        "prompt": "Do you have diabetes?",
        "input_type": "boolean",
        "relevance": "Diabetic individuals can experience atypical or silent myocardial ischaemia.",
    },
    "symptom:severe_dehydration": {
        "question_id": "Q_DEHYDRATION",
        "prompt": "Have you noticed signs of severe dehydration, such as not passing urine for 8–12 hours, extreme dry mouth, or severe dizziness when standing?",
        "input_type": "boolean",
        "relevance": "Determines whether gastrointestinal fluid losses require urgent medical rehydration.",
    },
    "symptom:right_lower_quadrant_pain": {
        "question_id": "Q_RLQ_PAIN",
        "prompt": "Is your abdominal pain located mainly in the right lower side of your abdomen, especially when moving or coughing?",
        "input_type": "boolean",
        "relevance": "Screens for acute appendicitis requiring urgent surgical evaluation.",
    },
    "duration:over_5_days": {
        "question_id": "Q_DUR_5D",
        "prompt": "Has your fever or primary illness lasted for 5 days or longer?",
        "input_type": "boolean",
        "relevance": "Fever persisting >=5 days is a NICE intermediate risk amber flag requiring clinical review.",
    },
    "duration:over_7_days": {
        "question_id": "Q_DUR_7D",
        "prompt": "Has your diarrhoea lasted for more than 7 days, or have you seen blood in your stool?",
        "input_type": "boolean",
        "relevance": "Prolonged diarrhoea or hematochezia requires clinical stool culture and medical evaluation.",
    },
    "duration:over_3_weeks": {
        "question_id": "Q_DUR_3W",
        "prompt": "Has your cough persisted for longer than 3 weeks?",
        "input_type": "boolean",
        "relevance": "Cough lasting >3 weeks warrants primary care evaluation and chest radiography per NICE NG12.",
    },
    "duration:over_10_days": {
        "question_id": "Q_DUR_10D",
        "prompt": "Has your sore throat lasted for more than 10 days?",
        "input_type": "boolean",
        "relevance": "Screens for non-resolving upper respiratory tract infection.",
    },
    "symptom:scalp_tenderness": {
        "question_id": "Q_SCALP_TENDER",
        "prompt": "Do you have tenderness when brushing your hair or touching your temples, or sudden visual disturbances?",
        "input_type": "boolean",
        "relevance": "Screens for giant cell arteritis in older adults with new headache.",
    },
    "symptom:pleuritic_chest_pain": {
        "question_id": "Q_PLEURITIC",
        "prompt": "Does your chest pain feel sharp and get distinctly worse when you breathe in deeply or cough?",
        "input_type": "boolean",
        "relevance": "Screens for pleurisy, pericarditis, or lower respiratory inflammation.",
    },
    "symptom:acid_reflux": {
        "question_id": "Q_REFLUX",
        "prompt": "Is the discomfort primarily a burning sensation behind the breastbone that comes on after meals or when bending over?",
        "input_type": "boolean",
        "relevance": "Distinguishes dyspeptic / gastro-oesophageal reflux discomfort.",
    },
    "symptom:chest_wall_tenderness": {
        "question_id": "Q_CHEST_WALL",
        "prompt": "Is the soreness clearly reproduced when you press your finger directly on the ribs or chest wall?",
        "input_type": "boolean",
        "relevance": "Screens for benign musculoskeletal chest wall pain or costochondritis.",
    },
}


class BackwardChainingEngine:
    """Backward chaining verification and question-selection engine."""

    def __init__(self, rules: Optional[List[ProductionRule]] = None):
        self.rules: List[ProductionRule] = rules if rules is not None else get_all_rules()

    def verify(self, goal: str, known_facts: Set[str]) -> Dict[str, Any]:
        """
        Verify whether a goal (e.g. 'emergency' or 'emergency_escalation')
        can be established from known facts using backward chaining.
        """
        activated_rules: List[str] = []
        reasoning_trace: List[str] = []
        visited_goals: Set[str] = set()

        def prove(current_goal: str) -> bool:
            if current_goal in known_facts:
                reasoning_trace.append(f"Fact '{current_goal}' is already known.")
                return True

            if current_goal in visited_goals:
                return False
            visited_goals.add(current_goal)

            # Match rules by conclusion
            matching_rules = [
                r for r in self.rules
                if r.tier.value == current_goal
                or (current_goal == "emergency_escalation" and r.tier == TriageTier.EMERGENCY)
            ]

            for rule in matching_rules:
                reasoning_trace.append(
                    f"Evaluating rule {rule.rule_id} ({rule.name}) for goal '{current_goal}'"
                )
                conditions = rule.conditions.required_facts or rule.conditions
                if rule.conditions.issubset(known_facts):
                    activated_rules.append(rule.rule_id)
                    reasoning_trace.append(
                        f"Goal '{current_goal}' established by rule {rule.rule_id}."
                    )
                    return True

            reasoning_trace.append(f"Goal '{current_goal}' could not be established.")
            return False

        established = prove(goal)

        return {
            "goal": goal,
            "established": established,
            "activated_rules": activated_rules,
            "reasoning_trace": reasoning_trace,
        }

    def find_next_question(
        self,
        known_facts: Set[str],
        answered_question_ids: Optional[Set[str]] = None,
        patient: Optional[Any] = None,
    ) -> Optional[QuestionItem]:
        """
        Derives the next most clinically important question to ask.
        Evaluates triage tiers in order of decreasing clinical urgency:
        emergency -> urgent_care_today -> see_doctor_soon -> see_doctor_routine -> self_care.
        """
        answered = answered_question_ids or set()
        urgency_order = [
            TriageTier.EMERGENCY,
            TriageTier.URGENT_CARE_TODAY,
            TriageTier.SEE_DOCTOR_SOON,
            TriageTier.SEE_DOCTOR_ROUTINE,
            TriageTier.SELF_CARE,
        ]

        # Extract patient metadata for eligibility check
        age: Optional[float] = getattr(patient, "age", None) if patient else None
        warning_signs: Optional[List[Any]] = getattr(patient, "warning_signs", None) if patient else None
        risk_factors: Optional[List[str]] = getattr(patient, "risk_factors", None) if patient else None

        for tier in urgency_order:
            candidate_rules = [r for r in self.rules if r.tier == tier]

            for rule in candidate_rules:
                # Check eligibility guard
                if not rule.is_eligible(
                    age=age,
                    warning_signs=warning_signs,
                    risk_factors=risk_factors,
                    known_facts=known_facts,
                ):
                    continue

                # Identify required premise facts
                required = set(rule.conditions.required_facts) or set(rule.conditions)
                missing = [p for p in required if p not in known_facts]

                # If all conditions satisfied, this tier is already provable!
                if not missing and required:
                    # Current tier is established; no need to query further for this tier
                    continue

                # For candidate rules with missing premises, find the first unasked question
                for premise in missing:
                    # Strip premise prefix for lookup
                    lookup_keys = [premise]
                    if ":" in premise:
                        lookup_keys.append(premise.split(":", 1)[1])

                    for key in lookup_keys:
                        if key in CLINICAL_QUESTIONS_REGISTRY:
                            q_data = CLINICAL_QUESTIONS_REGISTRY[key]
                            if q_data["question_id"] not in answered:
                                return QuestionItem(
                                    question_id=q_data["question_id"],
                                    prompt=q_data["prompt"],
                                    target_fact=premise,
                                    input_type=q_data.get("input_type", "boolean"),
                                    options=q_data.get("options", []),
                                    relevance=q_data.get("relevance", ""),
                                    current_tier_goal=tier.value,
                                )

        return None
