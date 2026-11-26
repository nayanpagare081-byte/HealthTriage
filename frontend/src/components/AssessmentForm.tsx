"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  HeartPulse,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Check,
  ShieldAlert,
  Plus,
  X,
  Loader2,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import {
  WarningSignId,
  VitalSigns,
  PatientInputPayload,
  AssessmentResult,
  NextQuestionResponse,
} from "../types/triage";
import { KNOWLEDGE_BASE_RULES } from "../data/rulesData";
import { DEMO_PRESETS } from "../data/demoPresets";

interface AssessmentFormProps {
  onAssessmentCompleted: (result: AssessmentResult) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  error: string;
  setError: (err: string) => void;
}

const COMMON_SYMPTOM_SUGGESTIONS = [
  "Shortness of breath",
  "Substernal chest pressure",
  "Headache",
  "High fever",
  "Dry cough",
  "Dizziness",
  "Severe nausea",
  "Generalized fatigue",
  "Sore throat",
  "Facial numbness",
  "Abdominal pain",
  "Joint pain",
];

const MEDICAL_HISTORY_OPTIONS = [
  "Hypertension",
  "Diabetes Type 2",
  "Asthma / COPD",
  "Coronary Artery Disease",
  "Heart Failure",
  "Prior Stroke / TIA",
  "Chronic Kidney Disease",
  "None",
];

const RISK_FACTOR_OPTIONS = [
  "Current Smoker",
  "Pregnancy",
  "Immunocompromised",
  "Recent Surgery / Trauma",
  "Obesity (BMI > 30)",
  "Advanced Age (> 65)",
  "None",
];

export default function AssessmentForm({
  onAssessmentCompleted,
  isLoading,
  setIsLoading,
  error,
  setError,
}: AssessmentFormProps) {
  // Uses NEXT_PUBLIC_API_URL when set (e.g. standalone dev), or relative URL in Vercel Services
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  // Flow Mode: "standard" full form or "adaptive" question-by-question backward chaining
  const [flowMode, setFlowMode] = useState<"standard" | "adaptive">("standard");

  // Form State
  const [region, setRegion] = useState<string>("IN");
  const [age, setAge] = useState<string>("58");
  const [symptomsInput, setSymptomsInput] = useState<string>(
    "Substernal chest pressure, Shortness of breath, Diaphoresis"
  );
  const [duration, setDuration] = useState<string>("1.5");
  const [severity, setSeverity] = useState<number>(8);

  const [medicalHistory, setMedicalHistory] = useState<string[]>(["Hypertension"]);
  const [riskFactors, setRiskFactors] = useState<string[]>(["Current Smoker"]);

  const [vitalsExpanded, setVitalsExpanded] = useState<boolean>(false);
  const [tempC, setTempC] = useState<string>("");
  const [heartRate, setHeartRate] = useState<string>("");
  const [respRate, setRespRate] = useState<string>("");
  const [systolicBP, setSystolicBP] = useState<string>("");
  const [diastolicBP, setDiastolicBP] = useState<string>("");
  const [o2Sat, setO2Sat] = useState<string>("");

  const [additionalNotes, setAdditionalNotes] = useState<string>("");
  const [warningSigns, setWarningSigns] = useState<WarningSignId[]>([
    "chest_pain",
    "severe_breathing_difficulty",
  ]);
  const [uncertainSymptoms, setUncertainSymptoms] = useState<string[]>([]);
  const [uncertainWarningSigns, setUncertainWarningSigns] = useState<WarningSignId[]>([]);

  // Adaptive Flow State
  const [adaptiveStep, setAdaptiveStep] = useState<"initial" | "asking" | "completed">("initial");
  const [currentQuestion, setCurrentQuestion] = useState<NextQuestionResponse | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, boolean>>({});
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<string[]>([]);
  const [isAskingQuestion, setIsAskingQuestion] = useState<boolean>(false);

  // Helpers
  const toggleWarningSign = (signKey: WarningSignId) => {
    setWarningSigns((current) => {
      const exists = current.includes(signKey);
      if (exists) {
        setUncertainWarningSigns((u) => u.filter((k) => k !== signKey));
        return current.filter((k) => k !== signKey);
      }
      return [...current, signKey];
    });
  };

  const toggleUncertainSymptom = (symp: string) => {
    const key = symp.trim().toLowerCase();
    setUncertainSymptoms((curr) =>
      curr.includes(key) ? curr.filter((s) => s !== key) : [...curr, key]
    );
  };

  const toggleUncertainWarningSign = (signKey: WarningSignId) => {
    setUncertainWarningSigns((curr) =>
      curr.includes(signKey) ? curr.filter((s) => s !== signKey) : [...curr, signKey]
    );
  };

  const toggleHistoryOption = (item: string) => {
    if (item === "None") {
      setMedicalHistory(["None"]);
      return;
    }
    setMedicalHistory((curr) => {
      const filtered = curr.filter((x) => x !== "None");
      return filtered.includes(item)
        ? filtered.filter((x) => x !== item)
        : [...filtered, item];
    });
  };

  const toggleRiskOption = (item: string) => {
    if (item === "None") {
      setRiskFactors(["None"]);
      return;
    }
    setRiskFactors((curr) => {
      const filtered = curr.filter((x) => x !== "None");
      return filtered.includes(item)
        ? filtered.filter((x) => x !== item)
        : [...filtered, item];
    });
  };

  const addSymptomChip = (symptom: string) => {
    const list = symptomsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!list.includes(symptom)) {
      list.push(symptom);
      setSymptomsInput(list.join(", "));
    }
  };

  const loadPreset = (presetId: string) => {
    const preset = DEMO_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setAge(String(preset.data.age));
    setSymptomsInput(preset.data.symptoms.join(", "));
    setDuration(preset.data.duration_hours ? String(preset.data.duration_hours) : "");
    setSeverity(preset.data.severity);
    setMedicalHistory(preset.data.medical_history);
    setRiskFactors(preset.data.risk_factors);
    setWarningSigns(preset.data.warning_signs);
    setAdditionalNotes(preset.data.additional_information || "");

    const vitals = preset.data.vital_signs;
    setTempC(vitals.temperature_c !== undefined && vitals.temperature_c !== null ? String(vitals.temperature_c) : "");
    setHeartRate(vitals.heart_rate_bpm !== undefined && vitals.heart_rate_bpm !== null ? String(vitals.heart_rate_bpm) : "");
    setRespRate(vitals.respiratory_rate !== undefined && vitals.respiratory_rate !== null ? String(vitals.respiratory_rate) : "");
    setSystolicBP(vitals.systolic_bp !== undefined && vitals.systolic_bp !== null ? String(vitals.systolic_bp) : "");
    setDiastolicBP(vitals.diastolic_bp !== undefined && vitals.diastolic_bp !== null ? String(vitals.diastolic_bp) : "");
    setO2Sat(vitals.oxygen_saturation !== undefined && vitals.oxygen_saturation !== null ? String(vitals.oxygen_saturation) : "");
    setError("");
  };

  const resetForm = () => {
    setAge("30");
    setRegion("IN");
    setSymptomsInput("");
    setDuration("");
    setSeverity(5);
    setMedicalHistory([]);
    setRiskFactors([]);
    setWarningSigns([]);
    setUncertainSymptoms([]);
    setUncertainWarningSigns([]);
    setTempC("");
    setHeartRate("");
    setRespRate("");
    setSystolicBP("");
    setDiastolicBP("");
    setO2Sat("");
    setAdditionalNotes("");
    setError("");
    setAdaptiveStep("initial");
    setCurrentQuestion(null);
    setAnsweredQuestions({});
    setAnsweredQuestionIds([]);
  };

  // Submit assessment payload
  const runAssessment = async (overridePayload?: Partial<PatientInputPayload>) => {
    setIsLoading(true);
    setError("");

    const parsedSymptoms = symptomsInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (parsedSymptoms.length === 0) {
      setError("Please provide at least one reported symptom.");
      setIsLoading(false);
      return;
    }

    const ageNum = parseFloat(age);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      setError("Please enter a valid age between 0 and 120.");
      setIsLoading(false);
      return;
    }

    const vitalSignsPayload: VitalSigns = {};
    if (tempC.trim()) vitalSignsPayload.temperature_c = parseFloat(tempC);
    if (heartRate.trim()) vitalSignsPayload.heart_rate_bpm = parseInt(heartRate, 10);
    if (respRate.trim()) vitalSignsPayload.respiratory_rate = parseInt(respRate, 10);
    if (systolicBP.trim()) vitalSignsPayload.systolic_bp = parseInt(systolicBP, 10);
    if (diastolicBP.trim()) vitalSignsPayload.diastolic_bp = parseInt(diastolicBP, 10);
    if (o2Sat.trim()) vitalSignsPayload.oxygen_saturation = parseFloat(o2Sat);

    const payload: PatientInputPayload = {
      age: ageNum,
      symptoms: parsedSymptoms,
      warning_signs: warningSigns,
      duration_hours: duration.trim() ? parseFloat(duration) : null,
      severity: severity,
      medical_history: medicalHistory.filter((item) => item !== "None"),
      risk_factors: riskFactors.filter((item) => item !== "None"),
      vital_signs: vitalSignsPayload,
      additional_information: additionalNotes.trim() ? additionalNotes.trim() : null,
      region: region,
      uncertain_symptoms: uncertainSymptoms,
      uncertain_warning_signs: uncertainWarningSigns,
      ...overridePayload,
    };

    try {
      const response = await fetch(`${API_URL}/api/triage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        let msg = "Triage evaluation failed.";
        if (data && data.detail) {
          if (Array.isArray(data.detail)) {
            msg = data.detail.map((d: { msg?: string }) => d.msg || JSON.stringify(d)).join("; ");
          } else if (typeof data.detail === "string") {
            msg = data.detail;
          }
        }
        throw new Error(msg);
      }

      onAssessmentCompleted(data);

      setTimeout(() => {
        const resultElem = document.getElementById("reasoning-result");
        if (resultElem) {
          resultElem.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(`Could not communicate with the backend API at ${API_URL}.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await runAssessment();
  };

  // Adaptive Question Flow Handlers
  const fetchNextAdaptiveQuestion = async (
    updatedAnswers: Record<string, boolean>,
    updatedIds: string[]
  ) => {
    setIsAskingQuestion(true);
    setError("");

    const parsedSymptoms = symptomsInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      age: parseFloat(age) || 30.0,
      symptoms: parsedSymptoms.length > 0 ? parsedSymptoms : ["fever"],
      warning_signs: warningSigns,
      duration_hours: duration.trim() ? parseFloat(duration) : null,
      severity: severity,
      risk_factors: riskFactors.filter((item) => item !== "None"),
      answered_questions: updatedAnswers,
      answered_question_ids: updatedIds,
    };

    try {
      const res = await fetch(`${API_URL}/api/triage/next-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to retrieve next question from backward chaining.");
      const qData: NextQuestionResponse = await res.json();

      if (qData.has_next_question && qData.question_id) {
        setCurrentQuestion(qData);
        setAdaptiveStep("asking");
      } else {
        // Questions completed or goal determined! Run assessment directly.
        setAdaptiveStep("completed");
        await runAssessment();
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to communicate with the next-question endpoint.");
    } finally {
      setIsAskingQuestion(false);
    }
  };

  const startAdaptiveFlow = () => {
    const parsedSymptoms = symptomsInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (parsedSymptoms.length === 0) {
      setError("Please enter at least one main symptom to begin adaptive questions.");
      return;
    }
    fetchNextAdaptiveQuestion(answeredQuestions, answeredQuestionIds);
  };

  const answerAdaptiveQuestion = (answer: boolean) => {
    if (!currentQuestion || !currentQuestion.target_fact) return;

    const newAnswers = {
      ...answeredQuestions,
      [currentQuestion.target_fact]: answer,
    };
    const newIds = [...answeredQuestionIds, currentQuestion.question_id || ""];

    // Also bridge answers into local state for visibility
    if (answer) {
      if (currentQuestion.target_fact === "risk:pregnancy") {
        setRiskFactors((curr) => Array.from(new Set([...curr, "Pregnancy"])));
      } else if (currentQuestion.target_fact === "risk:diabetes") {
        setRiskFactors((curr) => Array.from(new Set([...curr, "Diabetes Type 2"])));
      } else if (currentQuestion.target_fact === "risk:asthma_copd") {
        setRiskFactors((curr) => Array.from(new Set([...curr, "Asthma / COPD"])));
      } else if (currentQuestion.target_fact === "risk:immunocompromised") {
        setRiskFactors((curr) => Array.from(new Set([...curr, "Immunocompromised"])));
      } else if (currentQuestion.target_fact.startsWith("symptom:")) {
        const sympToken = currentQuestion.target_fact.split(":")[1];
        addSymptomChip(sympToken);
      }
    }

    setAnsweredQuestions(newAnswers);
    setAnsweredQuestionIds(newIds);
    fetchNextAdaptiveQuestion(newAnswers, newIds);
  };

  const getSeverityColor = (val: number) => {
    if (val <= 3) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (val <= 6) return "text-[#247BA0] bg-[#EBF4F8] border-blue-200";
    if (val <= 8) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getSeverityLabel = (val: number) => {
    if (val <= 3) return "Mild (Manageable)";
    if (val <= 6) return "Moderate (Distressing)";
    if (val <= 8) return "Severe (Incapacitating)";
    return "Critical (Excruciating)";
  };

  return (
    <section id="assessment" className="py-8 scroll-mt-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Pre-Form Clinical Safeguards & Disclaimer */}
        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50/90 p-5 text-amber-950 shadow-xs flex items-start gap-3.5">
          <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold uppercase tracking-wider text-amber-900">
              Important Clinical Safeguard & Academic Purpose
            </p>
            <p className="leading-relaxed text-amber-900/90">
              This rule-based health triage expert system is developed as an academic artificial
              intelligence coursework demonstration. It provides preliminary symptom reasoning
              using IF-THEN clinical production rules. It is <strong>NOT</strong> a medical diagnostic
              device or clinical clearance. Always seek the advice of a qualified doctor or emergency
              services if you are unwell or concerned.
            </p>
          </div>
        </div>

        {/* Section Header */}
        <div className="mb-6 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md bg-[#EBF4F8] px-3 py-1 text-xs font-semibold text-[#1A5C78]">
              <Stethoscope className="h-3.5 w-3.5 text-[#247BA0]" />
              <span>PRODUCTION-RULE EXPERT SYSTEM</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#10243A] sm:text-3xl">
              Patient Assessment
            </h2>
            <p className="mt-1 text-sm text-[#718096]">
              Evaluate preliminary urgency using clinical guidelines with forward and backward chaining.
            </p>
          </div>

          {/* Mode Toggle Bar */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFlowMode("standard")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                flowMode === "standard"
                  ? "bg-white text-[#10243A] shadow-xs"
                  : "text-slate-600 hover:text-[#10243A]"
              }`}
            >
              Standard Full Form
            </button>
            <button
              type="button"
              onClick={() => setFlowMode("adaptive")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                flowMode === "adaptive"
                  ? "bg-[#10243A] text-white shadow-xs"
                  : "text-slate-600 hover:text-[#10243A]"
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5 text-[#24B8A6]" />
              <span>Adaptive Guided Flow</span>
            </button>
          </div>
        </div>

        {/* Demo Preset Bar */}
        <div id="presets-bar" className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#24B8A6]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#10243A]">
                Sample Patient Cases
              </span>
            </div>
            <span className="text-xs text-[#718096]">
              Click a sample case to auto-fill the assessment form:
            </span>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {DEMO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => loadPreset(preset.id)}
                className="group flex flex-col items-start rounded-xl border border-slate-200/90 bg-[#F5F8FB] p-3 text-left transition-all hover:border-[#247BA0] hover:bg-white hover:shadow-xs active:scale-[0.98]"
              >
                <div className="flex w-full items-center justify-between">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      preset.expectedOutcome === "emergency"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {preset.badge}
                  </span>
                </div>
                <p className="mt-1.5 text-xs font-bold text-[#10243A] group-hover:text-[#247BA0]">
                  {preset.title}
                </p>
                <p className="text-[11px] text-[#718096] truncate w-full">
                  {preset.subtitle}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* ADAPTIVE QUESTIONING FLOW (Backward Chaining) */}
        {flowMode === "adaptive" && (
          <div className="mb-8 rounded-2xl border-2 border-[#247BA0] bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#247BA0] text-white">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#10243A]">
                    Adaptive Guided Questionnaire
                  </h3>
                  <p className="text-xs text-[#718096]">
                    Powered by backward-chaining goal derivation to identify missing clinical premises.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFlowMode("standard")}
                className="text-xs font-semibold text-[#247BA0] hover:underline"
              >
                Switch to Full Form →
              </button>
            </div>

            {adaptiveStep === "initial" && (
              <div className="space-y-5">
                <p className="text-xs text-[#243447] leading-relaxed">
                  Start by providing your age and initial symptom. The system will then ask focused
                  follow-up questions guided by clinical triage goals:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#10243A]">
                      Patient Age (Years)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#10243A]">
                      Primary Symptom
                    </label>
                    <input
                      type="text"
                      value={symptomsInput}
                      onChange={(e) => setSymptomsInput(e.target.value)}
                      placeholder="e.g. Fever, Cough, Headache, Abdominal pain"
                      className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={startAdaptiveFlow}
                  disabled={isAskingQuestion}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#10243A] px-6 py-3 text-xs font-bold text-white shadow-xs hover:bg-[#18375A] transition-all"
                >
                  {isAskingQuestion ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#24B8A6]" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-[#24B8A6]" />
                  )}
                  <span>Begin Guided Adaptive Questions</span>
                </button>
              </div>
            )}

            {adaptiveStep === "asking" && currentQuestion && (
              <div className="rounded-xl border border-blue-200 bg-[#EBF4F8]/60 p-6 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-[#1A5C78]">
                  <span>Active Goal Hypothesis: {currentQuestion.current_tier_goal?.toUpperCase() || "EVALUATION"}</span>
                  <span className="font-mono text-slate-500">Question ID: {currentQuestion.question_id}</span>
                </div>

                <h4 className="text-base font-bold text-[#10243A] leading-snug">
                  {currentQuestion.prompt}
                </h4>

                {currentQuestion.relevance && (
                  <p className="text-xs text-[#718096] bg-white p-3 rounded-lg border border-slate-200/80">
                    <strong>Clinical Relevance:</strong> {currentQuestion.relevance}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => answerAdaptiveQuestion(true)}
                    disabled={isAskingQuestion}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition-colors shadow-xs"
                  >
                    <Check className="h-4 w-4" />
                    <span>Yes / Present</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => answerAdaptiveQuestion(false)}
                    disabled={isAskingQuestion}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-6 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-300 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>No / Absent</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlowMode("standard")}
                    className="ml-auto text-xs text-slate-500 hover:text-slate-800 self-center"
                  >
                    Skip directly to full form
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STANDARD COMPREHENSIVE FORM */}
        <form onSubmit={handleStandardSubmit} className="space-y-8">
          {/* Section 1: Basic Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#10243A] text-white font-bold text-sm">
                01
              </div>
              <div>
                <h3 className="text-base font-bold text-[#10243A]">
                  Patient Information & Symptoms
                </h3>
                <p className="text-xs text-[#718096]">
                  Enter basic patient details and reported symptoms
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {/* Region input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#10243A]">
                  Region / Emergency Services
                </label>
                <div className="mt-2">
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    aria-label="Select Region"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-[#243447] focus:border-[#247BA0] focus:ring-2 focus:ring-[#247BA0]/20 focus:outline-none"
                  >
                    <option value="IN">India (112 / 108)</option>
                    <option value="GB">United Kingdom (999)</option>
                    <option value="US">United States (911)</option>
                    <option value="AU">Australia (000)</option>
                    <option value="CA">Canada (911)</option>
                  </select>
                </div>
                <p className="mt-1.5 text-[11px] text-[#718096]">
                  Sets localized emergency numbers
                </p>
              </div>

              {/* Age input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#10243A]">
                  Patient Age <span className="text-red-500">*</span>
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max="120"
                    step="0.1"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 45 (or 0.2 for 2-month infant)"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#243447] placeholder-slate-400 focus:border-[#247BA0] focus:ring-2 focus:ring-[#247BA0]/20 focus:outline-none"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-[#718096]">
                  Enter age in years (infants under 3 months can be entered as e.g. 0.2)
                </p>
              </div>

              {/* Symptom Duration */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#10243A]">
                  Duration of Symptoms (Hours)
                </label>
                <div className="mt-2">
                  <input
                    type="number"
                    min="0"
                    max="8760"
                    step="0.5"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 24 (or 120 for 5 days, 504 for 3 weeks)"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#243447] placeholder-slate-400 focus:border-[#247BA0] focus:ring-2 focus:ring-[#247BA0]/20 focus:outline-none"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-[#718096]">
                  Duration hours: 120h = 5 days; 168h = 7 days; 504h = 3 weeks
                </p>
              </div>

              {/* Symptoms Input */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#10243A]">
                    Reported Symptoms <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-[#718096]">
                    Separate distinct symptoms with commas
                  </span>
                </div>
                <textarea
                  required
                  rows={2}
                  value={symptomsInput}
                  onChange={(e) => setSymptomsInput(e.target.value)}
                  placeholder="e.g. Fever, cough, stiff neck, headache, diarrhoea, sore throat, chest pain"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#243447] placeholder-slate-400 focus:border-[#247BA0] focus:ring-2 focus:ring-[#247BA0]/20 focus:outline-none"
                />

                {/* Symptom Suggestions Chips */}
                <div className="mt-2.5">
                  <span className="text-[11px] font-medium text-slate-500 mr-2">
                    Quick add:
                  </span>
                  <div className="inline-flex flex-wrap gap-1.5 mt-1">
                    {COMMON_SYMPTOM_SUGGESTIONS.map((symp) => (
                      <button
                        key={symp}
                        type="button"
                        onClick={() => addSymptomChip(symp)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50/80 px-2 py-0.5 text-[11px] text-slate-600 hover:bg-slate-100 hover:text-[#10243A]"
                      >
                        <Plus className="h-2.5 w-2.5 text-[#247BA0]" />
                        {symp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Symptoms with "Not sure" Checkbox */}
                {symptomsInput.trim().length > 0 && (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        Active Symptoms Certainty:
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Check &quot;Not sure&quot; if reported with uncertainty (premise CF: 0.50)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {symptomsInput
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((symp) => {
                          const norm = symp.toLowerCase();
                          const isUncertain = uncertainSymptoms.includes(norm);
                          return (
                            <div
                              key={symp}
                              className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                                isUncertain
                                  ? "border-amber-300 bg-amber-50 text-amber-900 ring-1 ring-amber-300/40"
                                  : "border-slate-200 bg-white text-slate-800"
                              }`}
                            >
                              <span className="font-semibold">{symp}</span>
                              <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer pl-2 border-l border-slate-200 hover:text-amber-700">
                                <input
                                  type="checkbox"
                                  checked={isUncertain}
                                  onChange={() => toggleUncertainSymptom(norm)}
                                  className="h-3.5 w-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 accent-amber-600"
                                />
                                <span className={isUncertain ? "font-bold text-amber-800" : ""}>
                                  Not sure?
                                </span>
                              </label>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              {/* Severity Slider */}
              <div className="sm:col-span-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#10243A]">
                    Self-Reported Symptom Severity:
                  </label>
                  <div className={`flex items-center gap-2 rounded-lg px-2.5 py-1 border text-xs font-bold ${getSeverityColor(severity)}`}>
                    <span>Scale {severity} of 10</span>
                    <span>·</span>
                    <span>{getSeverityLabel(severity)}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={severity}
                    onChange={(e) => setSeverity(parseInt(e.target.value, 10))}
                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#247BA0]"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1 px-1 font-mono">
                    <span>1 (Mild)</span>
                    <span>3</span>
                    <span>5 (Moderate)</span>
                    <span>7</span>
                    <span>10 (Critical)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Context & Vital Signs */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#10243A] text-white font-bold text-sm">
                  02
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#10243A]">
                    Medical History & Vital Signs
                  </h3>
                  <p className="text-xs text-[#718096]">
                    Pre-existing conditions, risk factors, and vital signs
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {/* Medical History Badges */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#10243A]">
                  Pre-Existing Medical History
                </label>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {MEDICAL_HISTORY_OPTIONS.map((item) => {
                    const isSelected = medicalHistory.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleHistoryOption(item)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                          isSelected
                            ? "border-[#247BA0] bg-[#EBF4F8] text-[#10243A] font-semibold ring-1 ring-[#247BA0]/30"
                            : "border-slate-200 bg-slate-50/80 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-[#247BA0]" />}
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clinical Risk Factors */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#10243A]">
                  Clinical Risk Factors (Escalates Urgency Tiers)
                </label>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {RISK_FACTOR_OPTIONS.map((item) => {
                    const isSelected = riskFactors.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleRiskOption(item)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                          isSelected
                            ? "border-[#24B8A6] bg-[#E8F8F6] text-[#10243A] font-semibold ring-1 ring-[#24B8A6]/30"
                            : "border-slate-200 bg-slate-50/80 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-[#1B9586]" />}
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Vital Signs Accordion */}
              <div className="rounded-xl border border-slate-200 bg-[#F5F8FB] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setVitalsExpanded(!vitalsExpanded)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-[#10243A] hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <HeartPulse className="h-4 w-4 text-[#247BA0]" />
                    <span>Vital Signs (Optional)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-normal text-slate-500">
                      {vitalsExpanded ? "Collapse" : "Expand Fields"}
                    </span>
                    {vitalsExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                </button>

                {vitalsExpanded && (
                  <div className="p-4 bg-white border-t border-slate-200 space-y-4">
                    <p className="text-xs text-[#718096]">
                      Temperature &ge; 38°C automatically confirms fever facts. SpO2 &lt; 92% escalates respiratory status.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700">
                          Temperature (°C)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="25"
                          max="45"
                          value={tempC}
                          onChange={(e) => setTempC(e.target.value)}
                          placeholder="37.0"
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                        />
                        <span className="text-[10px] text-slate-400">Normal: 36.5–37.5</span>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700">
                          Oxygen Saturation (SpO2 %)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="50"
                          max="100"
                          value={o2Sat}
                          onChange={(e) => setO2Sat(e.target.value)}
                          placeholder="98.0"
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                        />
                        <span className="text-[10px] text-slate-400">&ge; 95% Normal</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: High-Priority Emergency Warning Signs */}
          <div className="rounded-2xl border-2 border-red-200 bg-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-red-500" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white font-bold text-sm">
                  03
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#10243A]">
                    Emergency Red Flags (Bypasses Certainty Math)
                  </h3>
                  <p className="text-xs text-[#718096]">
                    Select any warning signs that apply. These trigger immediate emergency escalation.
                  </p>
                </div>
              </div>

              {warningSigns.length > 0 && (
                <button
                  type="button"
                  onClick={() => setWarningSigns([])}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-red-600 transition-colors self-start sm:self-auto"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Clear All Red Flags</span>
                </button>
              )}
            </div>

            {/* Warning Sign Cards */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {KNOWLEDGE_BASE_RULES.map((rule) => {
                const isChecked = rule.sign_key ? warningSigns.includes(rule.sign_key) : false;
                return (
                  <label
                    key={rule.rule_id}
                    className={`relative flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-all ${
                      isChecked
                        ? "border-red-400 bg-red-50/50 shadow-xs ring-1 ring-red-400"
                        : "border-slate-200 bg-[#F5F8FB] hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => rule.sign_key && toggleWarningSign(rule.sign_key)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 accent-red-600 shrink-0"
                    />
                    <div className="space-y-1 w-full">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#10243A]">
                          {rule.name}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                            isChecked
                              ? "bg-red-600 text-white"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {rule.rule_id}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-[#718096]">
                        {rule.clinical_rationale}
                      </p>
                      {isChecked && rule.sign_key && (
                        <div className="pt-1.5">
                          <label
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 rounded-md bg-amber-100/90 border border-amber-300 px-2 py-0.5 text-[11px] text-amber-900 cursor-pointer hover:bg-amber-100"
                          >
                            <input
                              type="checkbox"
                              checked={uncertainWarningSigns.includes(rule.sign_key)}
                              onChange={() => toggleUncertainWarningSign(rule.sign_key!)}
                              className="h-3.5 w-3.5 rounded border-amber-400 text-amber-600 focus:ring-amber-500 accent-amber-600"
                            />
                            <span className="font-semibold">
                              Not sure if present (Premise CF: 0.50)
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Form Actions & Error */}
          <div className="space-y-4">
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-xs text-red-800">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Assessment Failed</p>
                  <p className="mt-1">{error}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={resetForm}
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-[#243447] hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4 text-slate-500" />
                <span>Reset Form</span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-xl bg-[#10243A] px-8 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#18375A] active:scale-[0.98] transition-all disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#24B8A6]" />
                    <span>Executing Reasoning Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 text-[#24B8A6]" />
                    <span>Run Clinical Triage Reasoning →</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
