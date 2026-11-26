"""Data models for patient input, adaptive questioning, and triage responses."""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict


class WarningSign(str, Enum):
    SEVERE_BREATHING_DIFFICULTY = "severe_breathing_difficulty"
    CHEST_PAIN = "chest_pain"
    UNCONSCIOUSNESS = "unconsciousness"
    NEW_CONFUSION = "new_confusion"
    SEVERE_BLEEDING = "severe_bleeding"
    STROKE_LIKE_SYMPTOMS = "stroke_like_symptoms"
    SEVERE_ALLERGIC_REACTION = "severe_allergic_reaction"
    COUGHING_BLOOD = "coughing_blood"


class VitalSigns(BaseModel):
    model_config = ConfigDict(extra="forbid")

    temperature_c: Optional[float] = Field(default=None, ge=25, le=45)
    heart_rate_bpm: Optional[int] = Field(default=None, ge=20, le=250)
    respiratory_rate: Optional[int] = Field(default=None, ge=4, le=80)
    systolic_bp: Optional[int] = Field(default=None, ge=40, le=300)
    diastolic_bp: Optional[int] = Field(default=None, ge=20, le=200)
    oxygen_saturation: Optional[float] = Field(default=None, ge=50, le=100)


class PatientInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    age: float = Field(ge=0, le=120)
    symptoms: list[str] = Field(min_length=1, max_length=30)
    warning_signs: list[WarningSign] = Field(default_factory=list)

    duration_hours: Optional[float] = Field(default=None, ge=0, le=8760)
    severity: int = Field(ge=1, le=10)

    medical_history: list[str] = Field(default_factory=list)
    risk_factors: list[str] = Field(default_factory=list)

    vital_signs: VitalSigns = Field(default_factory=VitalSigns)

    additional_information: Optional[str] = Field(
        default=None, max_length=1000
    )
    region: Optional[str] = Field(default="IN", max_length=50)
    uncertain_symptoms: list[str] = Field(default_factory=list)
    uncertain_warning_signs: list[str] = Field(default_factory=list)


class NextQuestionRequest(BaseModel):
    """Payload for requesting the next adaptive triage question."""
    age: Optional[float] = Field(default=None, ge=0, le=120)
    symptoms: list[str] = Field(default_factory=list)
    warning_signs: list[str] = Field(default_factory=list)
    duration_hours: Optional[float] = Field(default=None, ge=0, le=8760)
    severity: Optional[int] = Field(default=5, ge=1, le=10)
    risk_factors: list[str] = Field(default_factory=list)
    answered_questions: Dict[str, Any] = Field(default_factory=dict)
    answered_question_ids: list[str] = Field(default_factory=list)


class NextQuestionResponse(BaseModel):
    """Adaptive question response generated via backward chaining."""
    has_next_question: bool
    question_id: Optional[str] = None
    prompt: Optional[str] = None
    target_fact: Optional[str] = None
    input_type: Optional[str] = "boolean"
    options: list[str] = Field(default_factory=list)
    relevance: Optional[str] = None
    current_tier_goal: Optional[str] = None


class FiredRuleItem(BaseModel):
    rule_id: str
    name: str
    tier: str
    certainty_factor: float
    source: str
    matched_conditions: list[str] = Field(default_factory=list)
    premise_cfs: dict[str, float] = Field(default_factory=dict)
    explanation: str
    override: bool = False


class AssessmentResponse(BaseModel):
    """Comprehensive triage evaluation response."""
    tier: str
    outcome: str
    certainty_score: float
    emergency_number: str = "112"
    region: str = "IN"
    fired_rules: list[FiredRuleItem] = Field(default_factory=list)
    forward_chaining_trace: list[str] = Field(default_factory=list)
    backward_chaining_result: dict[str, Any] = Field(default_factory=dict)
    explanation: str
    rule_by_rule_explanation: list[str] = Field(default_factory=list)
    disclaimer: str
    activated_rules: list[str] = Field(default_factory=list)
