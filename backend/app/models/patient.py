
from enum import Enum
from typing import Optional

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

    age: int = Field(ge=0, le=120)
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
