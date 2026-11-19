"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  HeartPulse,
  Clock,
  User,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Check,
  ShieldAlert,
  Thermometer,
  Gauge,
  Wind,
  Plus,
  X,
  Send,
  Loader2,
} from "lucide-react";
import { WarningSignId, VitalSigns, PatientInputPayload, AssessmentResult } from "../types/triage";
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
  // Form State
  const [age, setAge] = useState<string>("58");
  const [symptomsInput, setSymptomsInput] = useState<string>("Substernal chest pressure, Shortness of breath, Diaphoresis");
  const [duration, setDuration] = useState<string>("1.5");
  const [severity, setSeverity] = useState<number>(8);

  const [medicalHistory, setMedicalHistory] = useState<string[]>(["Hypertension"]);
  const [riskFactors, setRiskFactors] = useState<string[]>(["Current Smoker"]);

  const [vitalsExpanded, setVitalsExpanded] = useState<boolean>(true);
  const [tempC, setTempC] = useState<string>("37.1");
  const [heartRate, setHeartRate] = useState<string>("102");
  const [respRate, setRespRate] = useState<string>("22");
  const [systolicBP, setSystolicBP] = useState<string>("154");
  const [diastolicBP, setDiastolicBP] = useState<string>("94");
  const [o2Sat, setO2Sat] = useState<string>("94.0");

  const [additionalNotes, setAdditionalNotes] = useState<string>(
    "Pain radiates toward left shoulder and jaw. Mild diaphoretic presentation."
  );

  const [warningSigns, setWarningSigns] = useState<WarningSignId[]>([
    "chest_pain",
    "severe_breathing_difficulty",
  ]);

  // Helpers
  const toggleWarningSign = (signKey: WarningSignId) => {
    setWarningSigns((current) =>
      current.includes(signKey)
        ? current.filter((k) => k !== signKey)
        : [...current, signKey]
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
    setSymptomsInput("");
    setDuration("");
    setSeverity(5);
    setMedicalHistory([]);
    setRiskFactors([]);
    setWarningSigns([]);
    setTempC("");
    setHeartRate("");
    setRespRate("");
    setSystolicBP("");
    setDiastolicBP("");
    setO2Sat("");
    setAdditionalNotes("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      setError("Please enter a valid age between 0 and 120.");
      setIsLoading(false);
      return;
    }

    // Prepare vital signs payload (only include valid numbers)
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
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/triage", {
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
            msg = data.detail.map((d: { msg?: string; loc?: string[] }) => d.msg || JSON.stringify(d)).join("; ");
          } else if (typeof data.detail === "string") {
            msg = data.detail;
          }
        }
        throw new Error(msg);
      }

      onAssessmentCompleted(data);

      // Smooth scroll to the result section
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
        setError("Could not communicate with the backend API. Please ensure FastAPI is running on http://127.0.0.1:8000.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Severity color helper
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
        {/* Section Header */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-md bg-[#EBF4F8] px-3 py-1 text-xs font-semibold text-[#1A5C78]">
            <Stethoscope className="h-3.5 w-3.5 text-[#247BA0]" />
            <span>TRIAGE ASSESSMENT</span>
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#10243A] sm:text-3xl">
            Patient Assessment
          </h2>
          <p className="mt-1 text-sm text-[#718096] max-w-3xl">
            Enter patient details, reported symptoms, and check any warning signs to evaluate emergency status.
          </p>
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

        {/* Assessment Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
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

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 45"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#243447] placeholder-slate-400 focus:border-[#247BA0] focus:ring-2 focus:ring-[#247BA0]/20 focus:outline-none"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-[#718096]">
                  Enter patient's age in years
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
                    placeholder="e.g. 2.5"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#243447] placeholder-slate-400 focus:border-[#247BA0] focus:ring-2 focus:ring-[#247BA0]/20 focus:outline-none"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-[#718096]">
                  Optional — hours elapsed since symptoms began
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
                  placeholder="e.g. Substernal chest pressure, shortness of breath, dizziness"
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
                  Clinical Risk Factors
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
                      Enter any available vital sign measurements. All fields are optional.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {/* Temperature */}
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
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-[#243447] focus:border-[#247BA0] focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400">Normal: 36.5–37.5</span>
                      </div>

                      {/* Heart Rate */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700">
                          Heart Rate (BPM)
                        </label>
                        <input
                          type="number"
                          min="20"
                          max="250"
                          value={heartRate}
                          onChange={(e) => setHeartRate(e.target.value)}
                          placeholder="75"
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-[#243447] focus:border-[#247BA0] focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400">Normal: 60–100</span>
                      </div>

                      {/* Respiratory Rate */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700">
                          Respiratory Rate (/min)
                        </label>
                        <input
                          type="number"
                          min="4"
                          max="80"
                          value={respRate}
                          onChange={(e) => setRespRate(e.target.value)}
                          placeholder="16"
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-[#243447] focus:border-[#247BA0] focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400">Normal: 12–20</span>
                      </div>

                      {/* Systolic BP */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700">
                          Systolic BP (mmHg)
                        </label>
                        <input
                          type="number"
                          min="40"
                          max="300"
                          value={systolicBP}
                          onChange={(e) => setSystolicBP(e.target.value)}
                          placeholder="120"
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-[#243447] focus:border-[#247BA0] focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400">Normal: 90–120</span>
                      </div>

                      {/* Diastolic BP */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700">
                          Diastolic BP (mmHg)
                        </label>
                        <input
                          type="number"
                          min="20"
                          max="200"
                          value={diastolicBP}
                          onChange={(e) => setDiastolicBP(e.target.value)}
                          placeholder="80"
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-[#243447] focus:border-[#247BA0] focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400">Normal: 60–80</span>
                      </div>

                      {/* SpO2 */}
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
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-[#243447] focus:border-[#247BA0] focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400">Normal: 95–100%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Notes */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#10243A]">
                    Additional Notes
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {additionalNotes.length}/1000
                  </span>
                </div>
                <textarea
                  rows={2}
                  maxLength={1000}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Optional: Observed physical signs, precipitating events, or additional nuances..."
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-[#243447] placeholder-slate-400 focus:border-[#247BA0] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: High-Priority Emergency Warning Signs */}
          <div className="rounded-2xl border-2 border-red-200 bg-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
            {/* Subtle top indicator bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white font-bold text-sm">
                  03
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#10243A]">
                    Emergency Warning Signs
                  </h3>
                  <p className="text-xs text-[#718096]">
                    Select any warning signs that apply to the patient.
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
                  <span>Clear All Warning Signs</span>
                </button>
              )}
            </div>

            {/* Warning Sign Cards */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {KNOWLEDGE_BASE_RULES.map((rule) => {
                const isChecked = warningSigns.includes(rule.sign_key);
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
                      onChange={() => toggleWarningSign(rule.sign_key)}
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
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Status summary of selected warning signs */}
            <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 flex items-center gap-2 text-xs">
              <AlertTriangle
                className={`h-4 w-4 shrink-0 ${
                  warningSigns.length > 0 ? "text-red-500" : "text-slate-400"
                }`}
              />
              <span className="text-slate-700">
                {warningSigns.length > 0 ? (
                  <>
                    <strong className="text-red-700">{warningSigns.length}</strong> warning{" "}
                    {warningSigns.length === 1 ? "sign" : "signs"} selected — triggers emergency escalation.
                  </>
                ) : (
                  "No emergency warning signs selected."
                )}
              </span>
            </div>
          </div>

          {/* Form Submission Actions & Error State */}
          <div className="space-y-4">
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-xs text-red-800">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Assessment Request Failed</p>
                  <p className="mt-1">{error}</p>
                  <p className="mt-2 text-[11px] text-red-600">
                    Please ensure the backend server is running and try again.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={resetForm}
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-[#243447] hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-50"
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
                    <span>Processing Assessment...</span>
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 text-[#24B8A6]" />
                    <span>Run Assessment →</span>
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

