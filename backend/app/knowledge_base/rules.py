"""Production Rules Knowledge Base for Health Triage Reasoning.

Defines structured clinical production rules following clinical guidelines from
the NHS, NICE, WHO, and RCOG. Supports multi-tier triage classification,
certainty factors (MYCIN-style), safety override red flags, and strict clinical
guards protecting self-care recommendations.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, FrozenSet, List, Optional, Set


class TriageTier(str, Enum):
    """Urgency tiers for clinical triage reasoning."""
    EMERGENCY = "emergency"
    URGENT_CARE_TODAY = "urgent_care_today"
    SEE_DOCTOR_SOON = "see_doctor_soon"
    SEE_DOCTOR_ROUTINE = "see_doctor_routine"
    SELF_CARE = "self_care"
    NO_RULE_MATCHED = "no_rule_matched"


# Urgency ranking for conflict resolution and over-escalation fail-safe.
# Higher rank = higher clinical priority.
TIER_URGENCY_RANK: Dict[TriageTier, int] = {
    TriageTier.EMERGENCY: 5,
    TriageTier.URGENT_CARE_TODAY: 4,
    TriageTier.SEE_DOCTOR_SOON: 3,
    TriageTier.SEE_DOCTOR_ROUTINE: 2,
    TriageTier.SELF_CARE: 1,
    TriageTier.NO_RULE_MATCHED: 0,
}


@dataclass(frozen=True)
class RuleConditions:
    """Structured conditions required for a production rule to fire."""
    symptoms: FrozenSet[str] = field(default_factory=frozenset)
    warning_signs: FrozenSet[str] = field(default_factory=frozenset)
    risk_factors: FrozenSet[str] = field(default_factory=frozenset)
    age_band: Optional[str] = None  # e.g., "infant_under_3m", "child_under_5y", "adult", "elderly_65_plus", "over_50"
    min_age: Optional[float] = None
    max_age: Optional[float] = None
    min_duration_hours: Optional[float] = None
    max_duration_hours: Optional[float] = None
    min_severity: Optional[int] = None
    max_severity: Optional[int] = None
    required_facts: FrozenSet[str] = field(default_factory=frozenset)

    def __contains__(self, item: str) -> bool:
        """Allow membership testing for conditions ('x' in rule.conditions)."""
        return (
            item in self.symptoms
            or item in self.warning_signs
            or item in self.risk_factors
            or item in self.required_facts
        )

    def issubset(self, facts: Set[str]) -> bool:
        """Allow subset testing against active facts."""
        if self.required_facts:
            return self.required_facts.issubset(facts)
        combined = self.symptoms | self.warning_signs | self.risk_factors
        return combined.issubset(facts) if combined else False

    def __iter__(self):
        """Iterate over condition tokens."""
        combined = set(self.required_facts) | set(self.symptoms) | set(self.warning_signs) | set(self.risk_factors)
        return iter(combined)


@dataclass
class ProductionRule:
    """Production rule entity for expert system inference."""
    rule_id: str
    name: str
    cluster: str
    conditions: RuleConditions
    tier: TriageTier
    certainty_factor: float
    source: str
    override: bool = False
    explanation_template: str = ""
    priority: int = 10

    @property
    def description(self) -> str:
        """Backward compatible alias for name/description."""
        return self.name

    @property
    def conclusion(self) -> str:
        """Backward compatible conclusion property."""
        if self.tier == TriageTier.EMERGENCY:
            return "emergency_escalation"
        return self.tier.value

    def is_eligible(
        self,
        age: Optional[float] = None,
        warning_signs: Optional[List[Any]] = None,
        risk_factors: Optional[List[str]] = None,
        known_facts: Optional[Set[str]] = None,
    ) -> bool:
        """
        Safety guard check.
        Ensures self-care tier rules NEVER fire when any red-flag warning signs,
        high-risk vulnerable age bands (<5 years or >=65 years), or clinical
        risk factors (diabetes, pregnancy, heart disease, asthma/COPD,
        immunocompromised) are present.
        """
        if self.tier == TriageTier.SELF_CARE:
            # 1. Block if ANY red-flag warning sign is present
            if warning_signs and len(warning_signs) > 0:
                return False
            if known_facts:
                if any(f.startswith("warning_sign:") for f in known_facts):
                    return False
                # Also check literal warning sign tokens in facts
                raw_warning_tokens = {
                    "severe_breathing_difficulty",
                    "chest_pain",
                    "unconsciousness",
                    "new_confusion",
                    "severe_bleeding",
                    "stroke_like_symptoms",
                    "severe_allergic_reaction",
                    "coughing_blood",
                }
                if not known_facts.isdisjoint(raw_warning_tokens):
                    return False

            # 2. Block if ANY high-risk age band is present (<5 years or >=65 years)
            if age is not None:
                if age < 5.0 or age >= 65.0:
                    return False
            if known_facts:
                high_risk_age_facts = {
                    "age:infant_under_3m",
                    "age:infant_3_to_6m",
                    "age:infant_under_1y",
                    "age:child_under_5y",
                    "age:elderly_65_plus",
                }
                if not known_facts.isdisjoint(high_risk_age_facts):
                    return False

            # 3. Block if ANY clinical risk factor is present
            if risk_factors and len(risk_factors) > 0:
                return False
            if known_facts:
                if any(f.startswith("risk:") for f in known_facts):
                    return False

        return True


# ============================================================================
# KNOWLEDGE BASE: 40 CLINICAL PRODUCTION RULES
# ============================================================================

KNOWLEDGE_BASE: List[ProductionRule] = [
    # ------------------------------------------------------------------------
    # CLUSTER 1: RED FLAGS (R001 - R008)
    # Status: Verified by agent against NHS 999 Emergency Services Guidelines
    # ------------------------------------------------------------------------
    ProductionRule(
        rule_id="R001",
        name="Emergency escalation for severe breathing difficulty",
        cluster="emergency",
        conditions=RuleConditions(
            warning_signs=frozenset({"severe_breathing_difficulty"}),
            required_facts=frozenset({"severe_breathing_difficulty"}),
        ),
        tier=TriageTier.EMERGENCY,
        certainty_factor=1.0,
        override=True,
        priority=100,
        source="NHS Emergency 999 Guidelines | URL: https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-call-999/ | Section: Signs of a medical emergency | Date accessed: 2026-11-23 | Threshold: Difficulty breathing, such as breathing very fast, gasping, or feeling like you cannot catch your breath -> Call 999 immediately",
        explanation_template="Severe breathing difficulty is a critical red flag requiring immediate emergency evaluation.",
    ),
    ProductionRule(
        rule_id="R002",
        name="Emergency escalation for reported central chest pain",
        cluster="emergency",
        conditions=RuleConditions(
            warning_signs=frozenset({"chest_pain"}),
            required_facts=frozenset({"chest_pain"}),
        ),
        tier=TriageTier.EMERGENCY,
        certainty_factor=1.0,
        override=True,
        priority=100,
        source="NHS Emergency 999 Guidelines | URL: https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-call-999/ | Section: Signs of a medical emergency | Date accessed: 2026-11-23 | Threshold: Chest pain, pressure, heaviness, tightness or squeezing across the chest (suspected acute coronary syndrome) -> Call 999 immediately",
        explanation_template="Acute central crushing chest pain or pressure requires immediate emergency intervention for potential acute coronary syndrome.",
    ),
    ProductionRule(
        rule_id="R003",
        name="Emergency escalation for unconsciousness or collapse",
        cluster="emergency",
        conditions=RuleConditions(
            warning_signs=frozenset({"unconsciousness"}),
            required_facts=frozenset({"unconsciousness"}),
        ),
        tier=TriageTier.EMERGENCY,
        certainty_factor=1.0,
        override=True,
        priority=100,
        source="NHS Emergency 999 Guidelines | URL: https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-call-999/ | Section: Signs of a medical emergency | Date accessed: 2026-11-23 | Threshold: Loss of consciousness, collapse or fainting (passing out) and not waking up -> Call 999 immediately",
        explanation_template="Unconsciousness or unresponsiveness is an immediate life-threatening emergency.",
    ),
    ProductionRule(
        rule_id="R004",
        name="Emergency escalation for sudden new confusion or delirium",
        cluster="emergency",
        conditions=RuleConditions(
            warning_signs=frozenset({"new_confusion"}),
            required_facts=frozenset({"new_confusion"}),
        ),
        tier=TriageTier.EMERGENCY,
        certainty_factor=1.0,
        override=True,
        priority=100,
        source="NHS Emergency 999 Guidelines | URL: https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-call-999/ | Section: Signs of a medical emergency | Date accessed: 2026-11-23 | Threshold: Sudden, severe confusion or delirium, inability to talk or be understood -> Call 999 immediately",
        explanation_template="Sudden onset of confusion or altered mental state can indicate stroke, severe sepsis, or acute cerebral hypoperfusion.",
    ),
    ProductionRule(
        rule_id="R005",
        name="Emergency escalation for severe uncontrolled bleeding",
        cluster="emergency",
        conditions=RuleConditions(
            warning_signs=frozenset({"severe_bleeding"}),
            required_facts=frozenset({"severe_bleeding"}),
        ),
        tier=TriageTier.EMERGENCY,
        certainty_factor=1.0,
        override=True,
        priority=100,
        source="NHS Emergency 999 Guidelines | URL: https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-call-999/ | Section: Signs of a medical emergency | Date accessed: 2026-11-23 | Threshold: Heavy bleeding that won't stop with direct, firm pressure -> Call 999 immediately",
        explanation_template="Severe hemorrhage that cannot be stemmed by direct pressure requires immediate trauma/emergency care.",
    ),
    ProductionRule(
        rule_id="R006",
        name="Emergency escalation for stroke-like symptoms (FAST)",
        cluster="emergency",
        conditions=RuleConditions(
            warning_signs=frozenset({"stroke_like_symptoms"}),
            required_facts=frozenset({"stroke_like_symptoms"}),
        ),
        tier=TriageTier.EMERGENCY,
        certainty_factor=1.0,
        override=True,
        priority=100,
        source="NHS Emergency 999 Guidelines | URL: https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-call-999/ | Section: Signs of a medical emergency | Date accessed: 2026-11-23 | Threshold: Signs of a stroke (FAST): facial weakness/droop, arm weakness or numbness, speech difficulty -> Call 999 immediately",
        explanation_template="Facial droop, arm weakness, or speech difficulty indicate suspected acute stroke requiring urgent thrombolysis pathway.",
    ),
    ProductionRule(
        rule_id="R007",
        name="Emergency escalation for severe allergic reaction (anaphylaxis)",
        cluster="emergency",
        conditions=RuleConditions(
            warning_signs=frozenset({"severe_allergic_reaction"}),
            required_facts=frozenset({"severe_allergic_reaction"}),
        ),
        tier=TriageTier.EMERGENCY,
        certainty_factor=1.0,
        override=True,
        priority=100,
        source="NHS Emergency 999 Guidelines | URL: https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-call-999/ | Section: Signs of a medical emergency | Date accessed: 2026-11-23 | Threshold: Severe allergic reaction (anaphylaxis) with throat swelling, respiratory distress, or cyanosis -> Call 999 immediately",
        explanation_template="Rapidly progressing swelling of the airway, tongue, or lips with respiratory distress indicates anaphylaxis.",
    ),
    ProductionRule(
        rule_id="R008",
        name="Emergency escalation for coughing blood (haemoptysis)",
        cluster="emergency",
        conditions=RuleConditions(
            warning_signs=frozenset({"coughing_blood"}),
            required_facts=frozenset({"coughing_blood"}),
        ),
        tier=TriageTier.EMERGENCY,
        certainty_factor=1.0,
        override=True,
        priority=100,
        source="NHS Emergency 999 Guidelines | URL: https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-call-999/ | Section: Signs of a medical emergency | Date accessed: 2026-11-23 | Threshold: Coughing up significant frank blood (haemoptysis) -> Call 999 immediately",
        explanation_template="Coughing up frank blood is a red-flag sign of serious pulmonary hemorrhage, vascular lesion, or pulmonary embolism.",
    ),

    # ------------------------------------------------------------------------
    # CLUSTER 2: FEVER (R009 - R014)
    # ------------------------------------------------------------------------
    ProductionRule(
        rule_id="R009",
        name="Fever in young infant under 3 months",
        cluster="fever",
        conditions=RuleConditions(
            symptoms=frozenset({"fever"}),
            age_band="infant_under_3m",
            max_age=0.25,
            required_facts=frozenset({"symptom:fever", "age:infant_under_3m"}),
        ),
        tier=TriageTier.EMERGENCY,
        certainty_factor=0.95,
        override=False,
        priority=80,
        source="NICE Guideline NG143 | URL: https://www.nice.org.uk/guidance/ng143/chapter/Recommendations | Section: 1.2 Table 1 (Red category) | Date accessed: 2026-11-23 | Threshold: Age <3 months with temperature >=38.0°C is Red flag requiring immediate hospital pediatric referral",
        explanation_template="Infant under 3 months with fever is a Red flag indicator for invasive bacterial infection requiring immediate hospital pediatric evaluation.",
    ),
    ProductionRule(
        rule_id="R010",
        name="High fever in infant aged 3 to 6 months",
        cluster="fever",
        conditions=RuleConditions(
            symptoms=frozenset({"fever"}),
            age_band="infant_3_to_6m",
            min_age=0.25,
            max_age=0.5,
            min_severity=6,
            required_facts=frozenset({"symptom:fever", "age:infant_3_to_6m"}),
        ),
        tier=TriageTier.URGENT_CARE_TODAY,
        certainty_factor=0.85,
        override=False,
        priority=70,
        source="NICE Guideline NG143 | URL: https://www.nice.org.uk/guidance/ng143/chapter/Recommendations | Section: 1.2 Table 1 (Amber category) | Date accessed: 2026-11-23 | Threshold: Age 3-6 months with temperature >=39.0°C is Amber flag requiring same-day clinical assessment",
        explanation_template="High fever in an infant aged 3-6 months is an Amber flag requiring same-day face-to-face clinical review.",
    ),
    ProductionRule(
        rule_id="R011",
        name="Prolonged fever lasting 5 or more days",
        cluster="fever",
        conditions=RuleConditions(
            symptoms=frozenset({"fever"}),
            min_duration_hours=120.0,
            required_facts=frozenset({"symptom:fever", "duration:over_5_days"}),
        ),
        tier=TriageTier.SEE_DOCTOR_SOON,
        certainty_factor=0.80,
        override=False,
        priority=60,
        source="NICE Guideline NG143 | URL: https://www.nice.org.uk/guidance/ng143/chapter/Recommendations | Section: 1.2 Table 1 (Amber category) | Date accessed: 2026-11-23 | Threshold: Fever for >=5 days (120+ hours) is Amber flag requiring face-to-face clinical review",
        explanation_template="Fever persisting for 5 or more days (120+ hours) requires medical assessment to exclude atypical or systemic infections.",
    ),
    ProductionRule(
        rule_id="R012",
        name="Fever in immunocompromised patient",
        cluster="fever",
        conditions=RuleConditions(
            symptoms=frozenset({"fever"}),
            risk_factors=frozenset({"immunocompromised"}),
            required_facts=frozenset({"symptom:fever", "risk:immunocompromised"}),
        ),
        tier=TriageTier.URGENT_CARE_TODAY,
        certainty_factor=0.90,
        override=False,
        priority=75,
        source="UNVERIFIED - needs team review (CG151 specifically applies to cancer chemotherapy patients; generalized to all immunocompromised patients without direct guideline threshold)",
        explanation_template="Fever in an immunocompromised individual carries high risk of rapid neutropenic sepsis and demands urgent clinical evaluation today.",
    ),
    ProductionRule(
        rule_id="R013",
        name="Fever accompanied by meningeal irritation signs",
        cluster="fever",
        conditions=RuleConditions(
            symptoms=frozenset({"fever", "stiff_neck"}),
            required_facts=frozenset({"symptom:fever", "symptom:stiff_neck"}),
        ),
        tier=TriageTier.EMERGENCY,
        certainty_factor=0.95,
        override=False,
        priority=90,
        source="UNVERIFIED - needs team review (Full NICE NG240 text was not read in session; combination of fever + neck stiffness as rule requires clinical committee review)",
        explanation_template="Fever coupled with neck stiffness or photophobia is a hallmark sign of suspected acute meningitis.",
    ),
    ProductionRule(
        rule_id="R014",
        name="Mild short-duration viral fever without warning signs",
        cluster="fever",
        conditions=RuleConditions(
            symptoms=frozenset({"fever"}),
            max_duration_hours=72.0,
            max_severity=5,
            required_facts=frozenset({"symptom:fever", "duration:under_72h"}),
        ),
        tier=TriageTier.SELF_CARE,
        certainty_factor=0.70,
        override=False,
        priority=30,
        source="UNVERIFIED - needs team review (NHS recommends 3-4 days home management for viral fever, but exact numerical cutoff <72h and severity <=5 is an engineering heuristic)",
        explanation_template="Short-duration mild fever (<72 hours) without red flags is typically viral and suitable for home hydration and rest.",
    ),

    # ------------------------------------------------------------------------
    # CLUSTER 3: COUGH / RESPIRATORY (R015 - R018)
    # ------------------------------------------------------------------------
    ProductionRule(
        rule_id="R015",
        name="Acute cough with underlying asthma or COPD",
        cluster="respiratory",
        conditions=RuleConditions(
            symptoms=frozenset({"cough"}),
            risk_factors=frozenset({"asthma_copd"}),
            min_severity=6,
            required_facts=frozenset({"symptom:cough", "risk:asthma_copd"}),
        ),
        tier=TriageTier.URGENT_CARE_TODAY,
        certainty_factor=0.85,
        override=False,
        priority=70,
        source="UNVERIFIED - needs team review (NICE NG115 covers COPD exacerbation, but 1-10 severity >=6 threshold is an app heuristic not in guideline)",
        explanation_template="Moderate-to-severe respiratory symptoms in a patient with asthma or COPD indicate acute exacerbation requiring same-day care.",
    ),
    ProductionRule(
        rule_id="R016",
        name="Persistent chronic cough exceeding 3 weeks",
        cluster="respiratory",
        conditions=RuleConditions(
            symptoms=frozenset({"cough"}),
            min_duration_hours=504.0,  # 21 days
            required_facts=frozenset({"symptom:cough", "duration:over_3_weeks"}),
        ),
        tier=TriageTier.SEE_DOCTOR_ROUTINE,
        certainty_factor=0.80,
        override=False,
        priority=50,
        source="NICE Guideline NG12 & NHS Cough Guidance | URL: https://www.nice.org.uk/guidance/ng12/chapter/Recommendations-organised-by-site-of-cancer | Section: 1.2.1 | Date accessed: 2026-11-23 | Threshold: Unexplained persistent cough for >3 weeks (>504 hours) warrants primary care referral and chest radiography",
        explanation_template="Unexplained cough lasting longer than 3 weeks warrants routine primary care review and chest radiography.",
    ),
    ProductionRule(
        rule_id="R017",
        name="Productive cough with fever in elderly patient (65+)",
        cluster="respiratory",
        conditions=RuleConditions(
            symptoms=frozenset({"cough", "fever"}),
            age_band="elderly_65_plus",
            min_age=65.0,
            required_facts=frozenset({"symptom:cough", "symptom:fever", "age:elderly_65_plus"}),
        ),
        tier=TriageTier.URGENT_CARE_TODAY,
        certainty_factor=0.85,
        override=False,
        priority=75,
        source="UNVERIFIED - needs team review (NICE QS110 requires clinical lung examination findings or CRB65 score; age >=65 with cough and fever is an unverified generalization)",
        explanation_template="Fever combined with new cough in an adult aged 65+ raises high suspicion of community-acquired pneumonia requiring urgent assessment.",
    ),
    ProductionRule(
        rule_id="R018",
        name="Mild acute viral cough without breathlessness",
        cluster="respiratory",
        conditions=RuleConditions(
            symptoms=frozenset({"cough"}),
            max_duration_hours=504.0,
            max_severity=5,
            required_facts=frozenset({"symptom:cough", "severity:mild_le_5"}),
        ),
        tier=TriageTier.SELF_CARE,
        certainty_factor=0.75,
        override=False,
        priority=30,
        source="UNVERIFIED - needs team review (NICE NG120 states cough lasts 3-4 weeks without antibiotics, but severity <=5 cutoff is an engineering heuristic)",
        explanation_template="Acute uncomplicated viral cough without dyspnoea generally resolves spontaneously within 3 to 4 weeks with home fluids.",
    ),

    # ------------------------------------------------------------------------
    # CLUSTER 4: HEADACHE (R019 - R023)
    # ------------------------------------------------------------------------
    ProductionRule(
        rule_id="R019",
        name="Thunderclap sudden severe headache reaching peak intensity rapidly",
        cluster="headache",
        conditions=RuleConditions(
            symptoms=frozenset({"headache"}),
            min_severity=8,
            max_duration_hours=24.0,
            required_facts=frozenset({"symptom:headache", "severity:severe_ge_8"}),
        ),
        tier=TriageTier.EMERGENCY,
        certainty_factor=0.90,
        override=False,
        priority=85,
        source="UNVERIFIED - needs team review (NICE CG150 specifies sudden onset peaking within 5 minutes; severity >=8 is an app approximation)",
        explanation_template="Sudden-onset severe headache (thunderclap headache) requires emergency imaging to exclude subarachnoid haemorrhage.",
    ),
    ProductionRule(
        rule_id="R020",
        name="New headache with scalp tenderness in adult aged over 50",
        cluster="headache",
        conditions=RuleConditions(
            symptoms=frozenset({"headache", "scalp_tenderness"}),
            age_band="over_50",
            min_age=50.0,
            required_facts=frozenset({"symptom:headache", "symptom:scalp_tenderness", "age:over_50"}),
        ),
        tier=TriageTier.URGENT_CARE_TODAY,
        certainty_factor=0.85,
        override=False,
        priority=75,
        source="UNVERIFIED - needs team review (NICE CKS Giant Cell Arteritis primary page not opened in session; requires clinical team review)",
        explanation_template="New headache with scalp tenderness in an adult over 50 suggests giant cell arteritis, requiring same-day review to prevent permanent sight loss.",
    ),
    ProductionRule(
        rule_id="R021",
        name="Progressive worsening headache with nausea and vomiting",
        cluster="headache",
        conditions=RuleConditions(
            symptoms=frozenset({"headache", "nausea"}),
            min_duration_hours=72.0,
            min_severity=6,
            required_facts=frozenset({"symptom:headache", "symptom:nausea", "duration:over_72h"}),
        ),
        tier=TriageTier.SEE_DOCTOR_SOON,
        certainty_factor=0.80,
        override=False,
        priority=60,
        source="UNVERIFIED - needs team review (Duration >=72h and severity >=6 are engineering heuristics not specified in NICE CG150)",
        explanation_template="Persistent progressive headache with recurrent nausea or vomiting requires doctor assessment to investigate intracranial pressure.",
    ),
    ProductionRule(
        rule_id="R022",
        name="Episodic throbbing unilateral migraine headache",
        cluster="headache",
        conditions=RuleConditions(
            symptoms=frozenset({"headache", "throbbing_headache"}),
            min_severity=4,
            max_severity=8,
            max_duration_hours=72.0,
            required_facts=frozenset({"symptom:headache", "symptom:throbbing_headache"}),
        ),
        tier=TriageTier.SEE_DOCTOR_ROUTINE,
        certainty_factor=0.75,
        override=False,
        priority=40,
        source="UNVERIFIED - needs team review (Simplified questionnaire proxy for multi-criteria NICE CG150 migraine diagnostic criteria)",
        explanation_template="Episodic throbbing unilateral headache characteristic of migraine is best managed through routine GP review for targeted therapy.",
    ),
    ProductionRule(
        rule_id="R023",
        name="Mild tension-type headache responsive to rest",
        cluster="headache",
        conditions=RuleConditions(
            symptoms=frozenset({"headache"}),
            max_duration_hours=48.0,
            max_severity=4,
            required_facts=frozenset({"symptom:headache", "severity:mild_le_4"}),
        ),
        tier=TriageTier.SELF_CARE,
        certainty_factor=0.80,
        override=False,
        priority=30,
        source="UNVERIFIED - needs team review (NHS tension headache self-care advice exists, but severity <=4 and duration <48h are engineering heuristics)",
        explanation_template="Mild band-like headache without focal signs or red flags responds well to hydration, rest, and simple over-the-counter analgesics.",
    ),

    # ------------------------------------------------------------------------
    # CLUSTER 5: ABDOMINAL PAIN (R024 - R028)
    # ------------------------------------------------------------------------
    ProductionRule(
        rule_id="R024",
        name="Acute agonizing severe abdominal pain (peritonism)",
        cluster="abdominal",
        conditions=RuleConditions(
            symptoms=frozenset({"abdominal_pain"}),
            min_severity=8,
            required_facts=frozenset({"symptom:abdominal_pain", "severity:severe_ge_8"}),
        ),
        tier=TriageTier.EMERGENCY,
        certainty_factor=0.90,
        override=False,
        priority=85,
        source="UNVERIFIED - needs team review (NHS advises emergency care for severe stomach pain, but numerical score >=8 is an app heuristic)",
        explanation_template="Severe excruciating abdominal pain (severity >= 8) can indicate acute peritonitis, perforation, or mesenteric ischaemia.",
    ),
    ProductionRule(
        rule_id="R025",
        name="Abdominal or pelvic pain in pregnancy",
        cluster="abdominal",
        conditions=RuleConditions(
            symptoms=frozenset({"abdominal_pain"}),
            risk_factors=frozenset({"pregnancy"}),
            required_facts=frozenset({"symptom:abdominal_pain", "risk:pregnancy"}),
        ),
        tier=TriageTier.URGENT_CARE_TODAY,
        certainty_factor=0.90,
        override=False,
        priority=75,
        source="NHS & RCOG Clinical Guidance | URL: https://www.nhs.uk/pregnancy/related-conditions/common-symptoms/stomach-pain/ | Section: When to get urgent medical advice | Date accessed: 2026-11-23 | Threshold: Any unexplained abdominal pain or cramping in pregnancy requires urgent same-day obstetric/maternity assessment",
        explanation_template="Abdominal pain during pregnancy requires urgent same-day obstetric evaluation to exclude ectopic pregnancy or placental complications.",
    ),
    ProductionRule(
        rule_id="R026",
        name="Acute right lower quadrant pain (suspected appendicitis)",
        cluster="abdominal",
        conditions=RuleConditions(
            symptoms=frozenset({"abdominal_pain", "right_lower_quadrant_pain"}),
            min_severity=6,
            required_facts=frozenset({"symptom:abdominal_pain", "symptom:right_lower_quadrant_pain"}),
        ),
        tier=TriageTier.URGENT_CARE_TODAY,
        certainty_factor=0.85,
        override=False,
        priority=75,
        source="UNVERIFIED - needs team review (NICE CKS Appendicitis page not opened in session; severity >=6 cutoff is an engineering heuristic)",
        explanation_template="Pain localizing to the right lower abdomen with nausea or fever indicates suspected appendicitis requiring same-day surgical assessment.",
    ),
    ProductionRule(
        rule_id="R027",
        name="Persistent unexplained abdominal pain over 2 weeks in older adult (50+)",
        cluster="abdominal",
        conditions=RuleConditions(
            symptoms=frozenset({"abdominal_pain"}),
            age_band="over_50",
            min_age=50.0,
            min_duration_hours=336.0,  # 14 days
            required_facts=frozenset({"symptom:abdominal_pain", "age:over_50", "duration:over_2_weeks"}),
        ),
        tier=TriageTier.SEE_DOCTOR_SOON,
        certainty_factor=0.75,
        override=False,
        priority=55,
        source="UNVERIFIED - needs team review (NICE NG12 covers unexplained abdominal pain in >=50y, but 2-week duration cutoff is an app heuristic)",
        explanation_template="Persistent unexplained abdominal pain lasting over 2 weeks in adults aged 50+ warrants prompt evaluation.",
    ),
    ProductionRule(
        rule_id="R028",
        name="Mild transient cramping abdominal discomfort",
        cluster="abdominal",
        conditions=RuleConditions(
            symptoms=frozenset({"abdominal_pain"}),
            max_duration_hours=48.0,
            max_severity=4,
            required_facts=frozenset({"symptom:abdominal_pain", "severity:mild_le_4"}),
        ),
        tier=TriageTier.SELF_CARE,
        certainty_factor=0.75,
        override=False,
        priority=30,
        source="UNVERIFIED - needs team review (Mild cramping self-care cutoff <48h and severity <=4 is an engineering heuristic)",
        explanation_template="Mild transient abdominal cramps without fever, vomiting, or rectal bleeding typically resolve with fluid intake and rest.",
    ),

    # ------------------------------------------------------------------------
    # CLUSTER 6: DIARRHOEA & DEHYDRATION (R029 - R032)
    # ------------------------------------------------------------------------
    ProductionRule(
        rule_id="R029",
        name="Diarrhoea with signs of severe dehydration or anuria",
        cluster="gastrointestinal",
        conditions=RuleConditions(
            symptoms=frozenset({"diarrhoea", "severe_dehydration"}),
            required_facts=frozenset({"symptom:diarrhoea", "symptom:severe_dehydration"}),
        ),
        tier=TriageTier.URGENT_CARE_TODAY,
        certainty_factor=0.90,
        override=False,
        priority=75,
        source="NHS Health A to Z: Dehydration | URL: https://www.nhs.uk/conditions/dehydration/ | Section: Ask for an urgent GP appointment or get help from NHS 111 | Date accessed: 2026-11-23 | Threshold: Signs of severe dehydration including not urinating for >=12 hours or persistent postural dizziness require same-day urgent clinical care",
        explanation_template="Diarrhoea with severe dehydration signs (such as no urination for >12 hours or postural syncope) requires urgent fluid replacement.",
    ),
    ProductionRule(
        rule_id="R030",
        name="Prolonged diarrhoea exceeding 7 days or presence of visible blood",
        cluster="gastrointestinal",
        conditions=RuleConditions(
            symptoms=frozenset({"diarrhoea"}),
            min_duration_hours=168.0,  # 7 days
            required_facts=frozenset({"symptom:diarrhoea", "duration:over_7_days"}),
        ),
        tier=TriageTier.SEE_DOCTOR_SOON,
        certainty_factor=0.85,
        override=False,
        priority=60,
        source="NHS Health A to Z: Diarrhoea and vomiting | URL: https://www.nhs.uk/conditions/diarrhoea-and-vomiting/ | Section: When to get medical advice | Date accessed: 2026-11-23 | Threshold: Diarrhoea lasting >7 days (>168 hours) or presence of visible blood in stool requires prompt doctor evaluation",
        explanation_template="Diarrhoea persisting longer than 7 days requires stool microbiological examination and clinical review.",
    ),
    ProductionRule(
        rule_id="R031",
        name="Diarrhoea and vomiting in infant under 1 year",
        cluster="gastrointestinal",
        conditions=RuleConditions(
            symptoms=frozenset({"diarrhoea"}),
            age_band="infant_under_1y",
            max_age=1.0,
            required_facts=frozenset({"symptom:diarrhoea", "age:infant_under_1y"}),
        ),
        tier=TriageTier.URGENT_CARE_TODAY,
        certainty_factor=0.85,
        override=False,
        priority=70,
        source="UNVERIFIED - needs team review (NICE CG84 page not opened in session; requires clinical team review)",
        explanation_template="Infants under 12 months with diarrhoea dehydrate rapidly and require same-day medical assessment.",
    ),
    ProductionRule(
        rule_id="R032",
        name="Mild acute self-limiting diarrhoea",
        cluster="gastrointestinal",
        conditions=RuleConditions(
            symptoms=frozenset({"diarrhoea"}),
            max_duration_hours=48.0,
            max_severity=4,
            required_facts=frozenset({"symptom:diarrhoea", "severity:mild_le_4"}),
        ),
        tier=TriageTier.SELF_CARE,
        certainty_factor=0.80,
        override=False,
        priority=30,
        source="UNVERIFIED - needs team review (WHO/NHS support oral rehydration, but exact duration <48h and severity <=4 are engineering heuristics)",
        explanation_template="Mild acute diarrhoea with oral fluid tolerance is safely managed with oral rehydration solution and rest.",
    ),

    # ------------------------------------------------------------------------
    # CLUSTER 7: SORE THROAT (R033 - R036)
    # ------------------------------------------------------------------------
    ProductionRule(
        rule_id="R033",
        name="Sore throat with airway compromise, stridor, or inability to swallow",
        cluster="sore_throat",
        conditions=RuleConditions(
            symptoms=frozenset({"sore_throat", "inability_to_swallow"}),
            required_facts=frozenset({"symptom:sore_throat", "symptom:inability_to_swallow"}),
        ),
        tier=TriageTier.EMERGENCY,
        certainty_factor=0.95,
        override=False,
        priority=90,
        source="NHS Health A to Z: Sore throat | URL: https://www.nhs.uk/conditions/sore-throat/ | Section: When to call 999 or go to A&E | Date accessed: 2026-11-23 | Threshold: Sore throat with difficulty breathing, inability to swallow saliva, or high-pitched sound (stridor) is an immediate emergency -> Call 999",
        explanation_template="Sore throat with inability to swallow secretions or stridor indicates acute epiglottitis or deep neck space infection.",
    ),
    ProductionRule(
        rule_id="R034",
        name="Severe acute sore throat with high fever (FeverPAIN criteria)",
        cluster="sore_throat",
        conditions=RuleConditions(
            symptoms=frozenset({"sore_throat", "fever"}),
            min_severity=7,
            required_facts=frozenset({"symptom:sore_throat", "symptom:fever", "severity:high_ge_7"}),
        ),
        tier=TriageTier.SEE_DOCTOR_SOON,
        certainty_factor=0.80,
        override=False,
        priority=60,
        source="UNVERIFIED - needs team review (Generalizes NICE NG84 FeverPAIN criteria using a severity >=7 proxy without full 5-item scoring)",
        explanation_template="Severe acute sore throat with high fever and absent cough suggests bacterial streptococcal pharyngitis needing medical review.",
    ),
    ProductionRule(
        rule_id="R035",
        name="Persistent sore throat exceeding 10 days",
        cluster="sore_throat",
        conditions=RuleConditions(
            symptoms=frozenset({"sore_throat"}),
            min_duration_hours=240.0,  # 10 days
            required_facts=frozenset({"symptom:sore_throat", "duration:over_10_days"}),
        ),
        tier=TriageTier.SEE_DOCTOR_ROUTINE,
        certainty_factor=0.75,
        override=False,
        priority=40,
        source="UNVERIFIED - needs team review (NHS recommends GP review if sore throat lasts >7 days; 10-day cutoff is an app heuristic)",
        explanation_template="A sore throat that does not improve after 10 days warrants a routine doctor appointment to rule out persistent infection.",
    ),
    ProductionRule(
        rule_id="R036",
        name="Mild viral sore throat accompanying common cold",
        cluster="sore_throat",
        conditions=RuleConditions(
            symptoms=frozenset({"sore_throat"}),
            max_duration_hours=120.0,
            max_severity=4,
            required_facts=frozenset({"symptom:sore_throat", "severity:mild_le_4"}),
        ),
        tier=TriageTier.SELF_CARE,
        certainty_factor=0.80,
        override=False,
        priority=30,
        source="UNVERIFIED - needs team review (Mild viral sore throat self-care cutoff <120h and severity <=4 is an engineering heuristic)",
        explanation_template="Mild sore throat associated with upper respiratory symptoms responds to rest, warm drinks, and lozenges.",
    ),

    # ------------------------------------------------------------------------
    # CLUSTER 8: CHEST PAIN VARIANTS (NON-RED-FLAG) (R037 - R040)
    # ------------------------------------------------------------------------
    ProductionRule(
        rule_id="R037",
        name="Sharp pleuritic chest pain on inspiration",
        cluster="chest_pain",
        conditions=RuleConditions(
            symptoms=frozenset({"chest_pain", "pleuritic_chest_pain"}),
            required_facts=frozenset({"symptom:chest_pain", "symptom:pleuritic_chest_pain"}),
        ),
        tier=TriageTier.SEE_DOCTOR_SOON,
        certainty_factor=0.75,
        override=False,
        priority=60,
        source="UNVERIFIED - needs team review (NICE CKS Chest pain page not opened in session; pleuritic pain triage categorization needs team review)",
        explanation_template="Sharp chest pain worsening on deep inspiration requires clinical evaluation to rule out pleurisy, pericarditis, or infection.",
    ),
    ProductionRule(
        rule_id="R038",
        name="Postprandial retrosternal burning discomfort (acid reflux)",
        cluster="chest_pain",
        conditions=RuleConditions(
            symptoms=frozenset({"chest_pain", "acid_reflux"}),
            required_facts=frozenset({"symptom:chest_pain", "symptom:acid_reflux"}),
        ),
        tier=TriageTier.SEE_DOCTOR_ROUTINE,
        certainty_factor=0.75,
        override=False,
        priority=40,
        source="UNVERIFIED - needs team review (Attributing chest discomfort to acid reflux without clinical evaluation carries cardiac risk; needs clinical review)",
        explanation_template="Burning retrosternal discomfort related to meals or posture is characteristic of gastro-oesophageal reflux.",
    ),
    ProductionRule(
        rule_id="R039",
        name="Atypical chest discomfort in diabetic or elderly patient",
        cluster="chest_pain",
        conditions=RuleConditions(
            symptoms=frozenset({"chest_pain"}),
            risk_factors=frozenset({"diabetes"}),
            min_severity=4,
            required_facts=frozenset({"symptom:chest_pain", "risk:diabetes"}),
        ),
        tier=TriageTier.URGENT_CARE_TODAY,
        certainty_factor=0.85,
        override=False,
        priority=75,
        source="UNVERIFIED - needs team review (NICE CG95 notes atypical cardiac symptoms in diabetes, but rule formulation and severity cutoff >=4 is an app synthesis)",
        explanation_template="Diabetic patients frequently experience atypical or blunted cardiac ischaemic symptoms and require urgent same-day evaluation.",
    ),
    ProductionRule(
        rule_id="R040",
        name="Localized musculoskeletal chest wall tenderness",
        cluster="chest_pain",
        conditions=RuleConditions(
            symptoms=frozenset({"chest_pain", "chest_wall_tenderness"}),
            max_severity=4,
            required_facts=frozenset({"symptom:chest_pain", "symptom:chest_wall_tenderness"}),
        ),
        tier=TriageTier.SELF_CARE,
        certainty_factor=0.75,
        override=False,
        priority=30,
        source="UNVERIFIED - needs team review (Self-care classification for chest pain without ECG/examination carries cardiac hazard; cutoff <=4 is an engineering heuristic)",
        explanation_template="Chest pain reproduced on localized palpation of the chest wall is characteristic of costochondritis or muscular strain.",
    ),
]


def get_all_rules() -> List[ProductionRule]:
    """Return all production rules from the knowledge base."""
    return KNOWLEDGE_BASE


def get_rule_by_id(rule_id: str) -> Optional[ProductionRule]:
    """Find a production rule using its ID."""
    for rule in KNOWLEDGE_BASE:
        if rule.rule_id == rule_id:
            return rule
    return None
