"""Clinical Fact Extraction and Proposition Normalization.

Transforms patient input models into normalized clinical facts for rule-based
forward and backward chaining.
"""

from typing import Any, Dict, List, Optional, Set, Tuple


def normalize_token(token: str) -> str:
    """Normalize a symptom, warning sign, or risk factor string."""
    clean = token.strip().lower()
    for char in ["-", " ", "/", "\\", "(", ")", ","]:
        clean = clean.replace(char, "_")
    while "__" in clean:
        clean = clean.replace("__", "_")
    return clean.strip("_")


def extract_patient_facts(
    patient: Any,
    answered_facts: Optional[Dict[str, bool]] = None,
) -> Tuple[Set[str], Dict[str, float]]:
    """
    Extract propositional facts and associated premise certainty factors
    from a PatientInput object and any interactive question responses.
    """
    facts: Set[str] = set()
    fact_cfs: Dict[str, float] = {}

    def add_fact(fact_key: str, cf: float = 1.0):
        facts.add(fact_key)
        fact_cfs[fact_key] = cf

    RED_FLAG_TOKENS = {
        "severe_breathing_difficulty",
        "chest_pain",
        "unconsciousness",
        "new_confusion",
        "severe_bleeding",
        "stroke_like_symptoms",
        "severe_allergic_reaction",
        "coughing_blood",
    }

    # 1. Warning Signs (Red Flags)
    warning_signs = getattr(patient, "warning_signs", []) or []
    for sign in warning_signs:
        val = sign.value if hasattr(sign, "value") else str(sign)
        token = normalize_token(val)
        add_fact(token, 1.0)
        add_fact(f"warning_sign:{token}", 1.0)

    # 2. Symptoms
    symptoms = getattr(patient, "symptoms", []) or []
    for symptom in symptoms:
        token = normalize_token(str(symptom))
        add_fact(f"symptom:{token}", 1.0)
        if token not in RED_FLAG_TOKENS:
            add_fact(token, 1.0)
        # Aliases / Sub-mappings
        if "stiff_neck" in token or "neck_stiffness" in token:
            add_fact("symptom:stiff_neck", 1.0)
            add_fact("stiff_neck", 1.0)
        if "fever" in token or "temperature" in token or "pyrexia" in token:
            add_fact("symptom:fever", 1.0)
            add_fact("fever", 1.0)
        if "cough" in token:
            add_fact("symptom:cough", 1.0)
            add_fact("cough", 1.0)
        if "headache" in token:
            add_fact("symptom:headache", 1.0)
            add_fact("headache", 1.0)
        if "throbbing" in token:
            add_fact("symptom:throbbing_headache", 1.0)
        if "scalp" in token or "scalp_tenderness" in token:
            add_fact("symptom:scalp_tenderness", 1.0)
        if "abdomen" in token or "abdominal" in token or "stomach" in token or "belly" in token:
            add_fact("symptom:abdominal_pain", 1.0)
            add_fact("abdominal_pain", 1.0)
        if "right_lower" in token or "rlq" in token or "appendicitis" in token:
            add_fact("symptom:right_lower_quadrant_pain", 1.0)
        if "diarrhoea" in token or "diarrhea" in token:
            add_fact("symptom:diarrhoea", 1.0)
            add_fact("diarrhoea", 1.0)
        if "dehydration" in token or "no_urine" in token or "dizziness" in token:
            add_fact("symptom:severe_dehydration", 1.0)
        if "sore_throat" in token or "pharyngitis" in token or "tonsillitis" in token:
            add_fact("symptom:sore_throat", 1.0)
            add_fact("sore_throat", 1.0)
        if "swallow" in token or "drooling" in token or "stridor" in token:
            add_fact("symptom:inability_to_swallow", 1.0)
        if "chest_pain" in token or "chest_discomfort" in token or "chest_pressure" in token:
            add_fact("symptom:chest_pain", 1.0)
        if "pleuritic" in token or "inspiration" in token:
            add_fact("symptom:pleuritic_chest_pain", 1.0)
        if "reflux" in token or "heartburn" in token:
            add_fact("symptom:acid_reflux", 1.0)
        if "tenderness" in token or "wall" in token:
            add_fact("symptom:chest_wall_tenderness", 1.0)
        if "nausea" in token or "vomit" in token:
            add_fact("symptom:nausea", 1.0)

    # 3. Age Bands
    age = getattr(patient, "age", None)
    if age is not None:
        age_val = float(age)
        if age_val < 0.25:  # Under 3 months
            add_fact("age:infant_under_3m", 1.0)
        elif age_val <= 0.5:  # 3 to 6 months
            add_fact("age:infant_3_to_6m", 1.0)

        if age_val < 1.0:  # Under 1 year
            add_fact("age:infant_under_1y", 1.0)
        if age_val < 5.0:  # Under 5 years
            add_fact("age:child_under_5y", 1.0)
        if age_val < 12.0:  # Child
            add_fact("age:child", 1.0)
        elif age_val < 65.0:  # Adult
            add_fact("age:adult", 1.0)

        if age_val >= 50.0:  # Over 50
            add_fact("age:over_50", 1.0)
        if age_val >= 65.0:  # Elderly 65+
            add_fact("age:elderly_65_plus", 1.0)

    # 4. Duration Bands
    duration = getattr(patient, "duration_hours", None)
    if duration is not None:
        dur = float(duration)
        if dur < 48.0:
            add_fact("duration:under_48h", 1.0)
        if dur < 72.0:
            add_fact("duration:under_72h", 1.0)
        if dur >= 72.0:
            add_fact("duration:over_72h", 1.0)
        if dur >= 120.0:  # 5 days
            add_fact("duration:over_5_days", 1.0)
        if dur >= 168.0:  # 7 days
            add_fact("duration:over_7_days", 1.0)
        if dur >= 240.0:  # 10 days
            add_fact("duration:over_10_days", 1.0)
        if dur >= 336.0:  # 14 days (2 weeks)
            add_fact("duration:over_2_weeks", 1.0)
        if dur >= 504.0:  # 21 days (3 weeks)
            add_fact("duration:over_3_weeks", 1.0)

    # 5. Severity Bands
    severity = getattr(patient, "severity", None)
    if severity is not None:
        sev = int(severity)
        if sev <= 4:
            add_fact("severity:mild_le_4", 1.0)
        if sev <= 5:
            add_fact("severity:mild_le_5", 1.0)
        if sev >= 6:
            add_fact("severity:moderate_ge_6", 1.0)
        if sev >= 7:
            add_fact("severity:high_ge_7", 1.0)
        if sev >= 8:
            add_fact("severity:severe_ge_8", 1.0)

    # 6. Risk Factors
    risk_factors = getattr(patient, "risk_factors", []) or []
    for rf in risk_factors:
        token = normalize_token(str(rf))
        add_fact(f"risk:{token}", 1.0)
        add_fact(token, 1.0)
        if "pregnant" in token or "pregnancy" in token:
            add_fact("risk:pregnancy", 1.0)
        if "immun" in token or "chemo" in token or "steroid" in token or "cancer" in token:
            add_fact("risk:immunocompromised", 1.0)
        if "asthma" in token or "copd" in token or "lung" in token:
            add_fact("risk:asthma_copd", 1.0)
        if "diabet" in token:
            add_fact("risk:diabetes", 1.0)
        if "heart" in token or "cardiac" in token or "infarction" in token:
            add_fact("risk:heart_disease", 1.0)

    # 7. Medical History
    history = getattr(patient, "medical_history", []) or []
    for hist in history:
        token = normalize_token(str(hist))
        add_fact(f"history:{token}", 1.0)
        # Auto-bridge relevant chronic illnesses into risk factors
        if "asthma" in token or "copd" in token:
            add_fact("risk:asthma_copd", 1.0)
        if "diabet" in token:
            add_fact("risk:diabetes", 1.0)
        if "heart" in token:
            add_fact("risk:heart_disease", 1.0)
        if "migraine" in token:
            add_fact("symptom:throbbing_headache", 0.9)

    # 8. Vital Signs
    vitals = getattr(patient, "vital_signs", None)
    if vitals:
        temp = getattr(vitals, "temperature_c", None)
        if temp is not None:
            if temp >= 38.0:
                add_fact("symptom:fever", 1.0)
                add_fact("fever", 1.0)
                add_fact("vital:fever_ge_38", 1.0)
            if temp >= 39.0:
                add_fact("vital:high_fever_ge_39", 1.0)

        spo2 = getattr(vitals, "oxygen_saturation", None)
        if spo2 is not None and spo2 < 92.0:
            add_fact("warning_sign:severe_breathing_difficulty", 1.0)
            add_fact("severe_breathing_difficulty", 1.0)

    # 9. Additional Interactive Answers
    if answered_facts:
        for f_key, val in answered_facts.items():
            if val is True:
                add_fact(f_key, 1.0)
            elif isinstance(val, (int, float)) and val > 0:
                add_fact(f_key, float(val))

    return facts, fact_cfs
