import { RuleDefinition } from "../types/triage";

export const KNOWLEDGE_BASE_RULES: RuleDefinition[] = [
  {
    rule_id: "R001",
    sign_key: "severe_breathing_difficulty",
    name: "Severe Breathing Difficulty",
    description: "Emergency escalation for severe breathing difficulty",
    clinical_rationale:
      "Acute dyspnea or respiratory distress may indicate airway obstruction, pulmonary embolism, severe asthma exacerbation, or acute pulmonary edema requiring immediate stabilization.",
    certainty_factor: 1.0,
    priority: 100,
    source: "Clinical safety reference required",
    urgency_level: "Critical",
  },
  {
    rule_id: "R002",
    sign_key: "chest_pain",
    name: "Chest Pain / Discomfort",
    description: "Emergency escalation for reported chest pain",
    clinical_rationale:
      "Acute chest pain is a primary indicator of acute coronary syndrome (myocardial infarction), aortic dissection, or tension pneumothorax.",
    certainty_factor: 1.0,
    priority: 100,
    source: "Clinical safety reference required",
    urgency_level: "Critical",
  },
  {
    rule_id: "R003",
    sign_key: "unconsciousness",
    name: "Unconsciousness / Syncope",
    description: "Emergency escalation for unconsciousness",
    clinical_rationale:
      "Sudden loss of consciousness or prolonged unresponsiveness suggests severe cerebral hypoperfusion, cardiac arrest, major stroke, or traumatic brain injury.",
    certainty_factor: 1.0,
    priority: 100,
    source: "Clinical safety reference required",
    urgency_level: "Critical",
  },
  {
    rule_id: "R004",
    sign_key: "new_confusion",
    name: "New Confusion / Altered Mental State",
    description: "Emergency escalation for new confusion",
    clinical_rationale:
      "Acute delirium or sudden alteration in mental status is a hallmark warning sign for severe sepsis, acute intracranial hemorrhage, hypoxia, or severe metabolic collapse.",
    certainty_factor: 1.0,
    priority: 100,
    source: "Clinical safety reference required",
    urgency_level: "High",
  },
  {
    rule_id: "R005",
    sign_key: "severe_bleeding",
    name: "Severe Uncontrolled Bleeding",
    description: "Emergency escalation for severe bleeding",
    clinical_rationale:
      "Active arterial or profuse venous hemorrhage leads rapidly to hypovolemic shock, hemodynamic instability, and exsanguination without urgent surgical or hemostatic intervention.",
    certainty_factor: 1.0,
    priority: 100,
    source: "Clinical safety reference required",
    urgency_level: "Critical",
  },
  {
    rule_id: "R006",
    sign_key: "stroke_like_symptoms",
    name: "Stroke-Like Symptoms",
    description: "Emergency escalation for stroke-like symptoms",
    clinical_rationale:
      "Sudden unilateral facial drooping, arm weakness, or speech slurring (FAST protocol) indicate acute ischemic stroke or intracranial bleed where time-to-thrombolysis is vital.",
    certainty_factor: 1.0,
    priority: 100,
    source: "Clinical safety reference required",
    urgency_level: "Critical",
  },
  {
    rule_id: "R007",
    sign_key: "severe_allergic_reaction",
    name: "Severe Allergic Reaction (Anaphylaxis)",
    description: "Emergency escalation for severe allergic reaction",
    clinical_rationale:
      "Rapidly progressing angioedema, stridor, wheezing, diffuse urticaria, and hypotension indicate systemic anaphylaxis requiring immediate intramuscular epinephrine.",
    certainty_factor: 1.0,
    priority: 100,
    source: "Clinical safety reference required",
    urgency_level: "Critical",
  },
  {
    rule_id: "R008",
    sign_key: "coughing_blood",
    name: "Coughing Blood (Hemoptysis)",
    description: "Emergency escalation for coughing blood",
    clinical_rationale:
      "Acute hemoptysis can indicate pulmonary embolism, alveolar hemorrhage, ruptured bronchial vessels, or invasive malignant lesions with high risk of airway compromise.",
    certainty_factor: 1.0,
    priority: 100,
    source: "Clinical safety reference required",
    urgency_level: "High",
  },
];

