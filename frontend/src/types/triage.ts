export type WarningSignId =
  | "severe_breathing_difficulty"
  | "chest_pain"
  | "unconsciousness"
  | "new_confusion"
  | "severe_bleeding"
  | "stroke_like_symptoms"
  | "severe_allergic_reaction"
  | "coughing_blood";

export type TriageTierId =
  | "emergency"
  | "urgent_care_today"
  | "see_doctor_soon"
  | "see_doctor_routine"
  | "self_care"
  | "no_rule_matched";

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
  region?: string;
  uncertain_symptoms?: string[];
  uncertain_warning_signs?: string[];
}

export interface FiredRuleInfo {
  rule_id: string;
  name: string;
  tier: string;
  certainty_factor: number;
  source: string;
  matched_conditions: string[];
  explanation: string;
  override?: boolean;
}

export interface AssessmentResult {
  tier: string;
  outcome: "emergency_escalation" | "insufficient_information" | string;
  certainty_score: number;
  emergency_number?: string;
  region?: string;
  fired_rules?: FiredRuleInfo[];
  activated_rules: string[];
  forward_chaining: {
    conclusions: string[];
    reasoning_trace: string[];
  };
  forward_chaining_trace?: string[];
  backward_chaining: {
    goal: string;
    established: boolean;
    activated_rules: string[];
    reasoning_trace: string[];
  };
  backward_chaining_result?: {
    goal: string;
    established: boolean;
    activated_rules: string[];
    reasoning_trace: string[];
  };
  explanation: string;
  rule_by_rule_explanation?: string[];
  disclaimer: string;
}

export interface RuleDefinition {
  rule_id: string;
  sign_key?: WarningSignId;
  name: string;
  description: string;
  clinical_rationale?: string;
  certainty_factor: number;
  priority: number;
  source: string;
  tier?: string;
  override?: boolean;
  urgency_level?: "Critical" | "High" | string;
}

export interface DemoPreset {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  expectedOutcome: "emergency" | "insufficient" | string;
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

export interface NextQuestionResponse {
  has_next_question: boolean;
  question_id?: string | null;
  prompt?: string | null;
  target_fact?: string | null;
  input_type?: string | null;
  options?: string[];
  relevance?: string | null;
  current_tier_goal?: string | null;
}
