export type WarningSignId =
  | "severe_breathing_difficulty"
  | "chest_pain"
  | "unconsciousness"
  | "new_confusion"
  | "severe_bleeding"
  | "stroke_like_symptoms"
  | "severe_allergic_reaction"
  | "coughing_blood";

export interface VitalSigns {
  temperature_c?: number | null;
  heart_rate_bpm?: number | null;
  respiratory_rate?: number | null;
  systolic_bp?: number | null;
  diastolic_bp?: number | null;
  oxygen_saturation?: number | null;
}

export interface PatientInputPayload {
  age: number;
  symptoms: string[];
  warning_signs: WarningSignId[];
  duration_hours?: number | null;
  severity: number;
  medical_history: string[];
  risk_factors: string[];
  vital_signs: VitalSigns;
  additional_information?: string | null;
}

export interface AssessmentResult {
  outcome: "emergency_escalation" | "insufficient_information" | string;
  certainty_score: number;
  activated_rules: string[];
  forward_chaining: {
    conclusions: string[];
    reasoning_trace: string[];
  };
  backward_chaining: {
    goal: string;
    established: boolean;
    activated_rules: string[];
    reasoning_trace: string[];
  };
  explanation: string;
  disclaimer: string;
}

export interface RuleDefinition {
  rule_id: string;
  sign_key: WarningSignId;
  name: string;
  description: string;
  clinical_rationale: string;
  certainty_factor: number;
  priority: number;
  source: string;
  urgency_level: "Critical" | "High";
}

export interface DemoPreset {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  expectedOutcome: "emergency" | "insufficient";
  data: {
    age: number;
    symptoms: string[];
    warning_signs: WarningSignId[];
    duration_hours: number;
    severity: number;
    medical_history: string[];
    risk_factors: string[];
    vital_signs: VitalSigns;
    additional_information: string;
  };
}

