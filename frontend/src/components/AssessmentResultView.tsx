"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Printer,
  RotateCcw,
  GitBranch,
  Target,
  ShieldAlert,
  Percent,
  Layers,
  ChevronRight,
  Info,
  PhoneCall,
  ArrowRight,
} from "lucide-react";
import { AssessmentResult } from "../types/triage";
import { KNOWLEDGE_BASE_RULES } from "../data/rulesData";

interface AssessmentResultViewProps {
  result: AssessmentResult;
  onNewAssessment: () => void;
}

export default function AssessmentResultView({
  result,
  onNewAssessment,
}: AssessmentResultViewProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "forward" | "backward" | "rules">("summary");

  const isEmergency = result.outcome === "emergency_escalation";

  // Find rule objects for triggered rules
  const triggeredRuleObjs = KNOWLEDGE_BASE_RULES.filter((r) =>
    result.activated_rules.includes(r.rule_id)
  );

  return (
    <section id="reasoning-result" className="py-8 scroll-mt-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Container with distinct border depending on state */}
        <div
          className={`overflow-hidden rounded-2xl border-2 bg-white shadow-lg transition-all ${
            isEmergency
              ? "border-red-400 ring-1 ring-red-400/40"
              : "border-amber-400 ring-1 ring-amber-400/40"
          }`}
        >
          {/* Top Result Banner */}
          <div
            className={`p-6 sm:p-8 ${
              isEmergency
                ? "bg-gradient-to-r from-red-600 to-red-700 text-white"
                : "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                    isEmergency
                      ? "bg-white/20 text-white"
                      : "bg-white/20 text-white"
                  }`}
                >
                  {isEmergency ? (
                    <AlertTriangle className="h-7 w-7 text-white" />
                  ) : (
                    <Info className="h-7 w-7 text-white" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-black/25 px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase">
                      Reasoning Outcome
                    </span>
                  </div>
                  <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                    {isEmergency
                      ? "EMERGENCY ESCALATION RECOMMENDED"
                      : "INSUFFICIENT INFORMATION FOR EMERGENCY"}
                  </h2>
                  <p className="mt-1.5 text-sm text-white/90 max-w-2xl leading-relaxed">
                    {result.explanation}
                  </p>
                </div>
              </div>

              {/* Action Buttons in Banner */}
              <div className="flex sm:flex-col gap-2 shrink-0 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-xs hover:bg-white/25 transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Summary</span>
                </button>
                <button
                  type="button"
                  onClick={onNewAssessment}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-[#10243A] hover:bg-slate-100 transition-colors shadow-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-[#247BA0]" />
                  <span>New Assessment</span>
                </button>
              </div>
            </div>
          </div>

          {/* Urgent Clinical Action Callout if Emergency */}
          {isEmergency && (
            <div className="bg-red-50 border-b border-red-200 p-4 sm:px-8 flex items-center gap-3 text-red-900">
              <PhoneCall className="h-5 w-5 text-red-600 shrink-0" />
              <p className="text-xs font-medium leading-relaxed">
                <strong>Urgent Medical Action Required:</strong> One or more critical warning
                signs have triggered emergency production rules. Seek emergency medical
                attention immediately (dial local emergency services e.g., 911 / 112 / 999).
              </p>
            </div>
          )}

          {/* Important Guidance Callout if Insufficient Information */}
          {!isEmergency && (
            <div className="bg-amber-50 border-b border-amber-200 p-4 sm:px-8 flex items-start gap-3 text-amber-900">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs font-medium leading-relaxed">
                <strong>Not a Safety Clearance:</strong> No configured emergency rules were matched
                in this evaluation. However, this does <em>not</em> mean the patient is free of
                risk or clinically healthy. Please consult a qualified medical professional if
                symptoms cause distress or worsen.
              </p>
            </div>
          )}

          {/* Core Reasoning Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border-b border-slate-200 bg-white">
            {/* Metric 1: Certainty Factor */}
            <div className="p-6">
              <div className="flex items-center justify-between text-xs text-[#718096]">
                <span className="font-semibold uppercase tracking-wider">
                  Certainty Score (CF)
                </span>
                <Percent className="h-4 w-4 text-[#247BA0]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#10243A]">
                  {result.certainty_score.toFixed(3)}
                </span>
                <span className="text-xs font-medium text-slate-500">/ 1.000</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isEmergency ? "bg-red-600" : "bg-amber-500"
                  }`}
                  style={{ width: `${Math.max(result.certainty_score * 100, 3)}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-[#718096]">
                Combined rule confidence score
              </p>
            </div>

            {/* Metric 2: Activated Rules */}
            <div className="p-6">
              <div className="flex items-center justify-between text-xs text-[#718096]">
                <span className="font-semibold uppercase tracking-wider">
                  Activated Rules
                </span>
                <Layers className="h-4 w-4 text-[#247BA0]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#10243A]">
                  {result.activated_rules.length}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  of 8 rules fired
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {result.activated_rules.length > 0 ? (
                  result.activated_rules.map((ruleId) => (
                    <span
                      key={ruleId}
                      className="rounded bg-red-100 px-2 py-0.5 text-xs font-mono font-bold text-red-700"
                    >
                      {ruleId}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">
                    None triggered
                  </span>
                )}
              </div>
              <p className="mt-2 text-[11px] text-[#718096]">
                Rules matched against reported warning signs
              </p>
            </div>

            {/* Metric 3: Backward Chaining */}
            <div className="p-6">
              <div className="flex items-center justify-between text-xs text-[#718096]">
                <span className="font-semibold uppercase tracking-wider">
                  Backward Chaining Goal
                </span>
                <Target className="h-4 w-4 text-[#247BA0]" />
              </div>
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                      result.backward_chaining.established
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {result.backward_chaining.established ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-red-600" />
                    ) : (
                      <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
                    )}
                    {result.backward_chaining.established
                      ? "Goal Established"
                      : "Goal Unproven"}
                  </span>
                </div>
              </div>
              <p className="mt-2 font-mono text-[11px] text-slate-600 truncate">
                Goal: {result.backward_chaining.goal}
              </p>
              <p className="mt-1 text-[11px] text-[#718096]">
                Emergency hypothesis verification
              </p>
            </div>
          </div>

          {/* Explainability Tab Navigation */}
          <div className="border-b border-slate-200 bg-slate-50/70 px-6 sm:px-8">
            <div className="flex overflow-x-auto space-x-6 text-sm font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("summary")}
                className={`py-3.5 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "summary"
                    ? "border-[#247BA0] text-[#10243A]"
                    : "border-transparent text-[#718096] hover:text-[#243447]"
                }`}
              >
                Clinical Summary
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("forward")}
                className={`flex items-center gap-2 py-3.5 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "forward"
                    ? "border-[#247BA0] text-[#10243A]"
                    : "border-transparent text-[#718096] hover:text-[#243447]"
                }`}
              >
                <span>Forward Chaining Trace</span>
                <span className="rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] font-mono">
                  {result.forward_chaining.reasoning_trace.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("backward")}
                className={`flex items-center gap-2 py-3.5 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "backward"
                    ? "border-[#247BA0] text-[#10243A]"
                    : "border-transparent text-[#718096] hover:text-[#243447]"
                }`}
              >
                <span>Backward Chaining Proof</span>
                <span className="rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] font-mono">
                  {result.backward_chaining.reasoning_trace.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("rules")}
                className={`flex items-center gap-2 py-3.5 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "rules"
                    ? "border-[#247BA0] text-[#10243A]"
                    : "border-transparent text-[#718096] hover:text-[#243447]"
                }`}
              >
                <span>Activated Rules Details</span>
                <span className="rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] font-mono">
                  {result.activated_rules.length}
                </span>
              </button>
            </div>
          </div>

          {/* Tab Contents */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* TAB 1: Summary */}
            {activeTab === "summary" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#10243A]">
                    Summary
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#243447]">
                    {result.explanation}
                  </p>
                </div>

                {/* Conclusions reached */}
                <div className="rounded-xl border border-slate-200 bg-[#F5F8FB] p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#10243A]">
                    Conclusions Reached
                  </h4>
                  {result.forward_chaining.conclusions.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {result.forward_chaining.conclusions.map((conc) => (
                        <span
                          key={conc}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 border border-red-200 px-3 py-1.5 text-xs font-mono font-bold text-red-800"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-red-600" />
                          {conc}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-[#718096] italic">
                      No terminal emergency conclusions derived from the presented warning signs.
                    </p>
                  )}
                </div>

                {/* Triggered rules preview */}
                {triggeredRuleObjs.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#10243A] mb-3">
                      Rules Contributing to Emergency Escalation
                    </h4>
                    <div className="space-y-2.5">
                      {triggeredRuleObjs.map((rule) => (
                        <div
                          key={rule.rule_id}
                          className="rounded-xl border border-red-200 bg-red-50/40 p-4 flex items-start gap-3.5"
                        >
                          <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-mono font-bold text-white shrink-0 mt-0.5">
                            {rule.rule_id}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-[#10243A]">
                              {rule.name}
                            </p>
                            <p className="mt-1 text-xs text-[#718096] leading-relaxed">
                              {rule.clinical_rationale}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Forward Chaining Trace */}
            {activeTab === "forward" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#10243A]">
                    Forward Chaining Step-By-Step Deduction Trace
                  </h3>
                  <p className="text-xs text-[#718096]">
                    Data-driven reasoning path: Starting from initial facts to derive conclusions.
                  </p>
                </div>

                {result.forward_chaining.reasoning_trace.length > 0 ? (
                  <ol className="space-y-2.5 pt-2">
                    {result.forward_chaining.reasoning_trace.map((step, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 rounded-xl border border-slate-200 bg-[#F5F8FB] p-3.5 text-xs font-mono text-[#243447]"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#10243A] text-white font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                    No forward-chaining rules fired because no emergency warning signs were provided.
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Backward Chaining Trace */}
            {activeTab === "backward" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#10243A]">
                    Backward Chaining Verification Trace
                  </h3>
                  <p className="text-xs text-[#718096]">
                    Goal-driven reasoning path: Testing hypothesis '{result.backward_chaining.goal}'.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-[#F5F8FB] p-3.5 flex items-center justify-between text-xs">
                  <span className="text-[#10243A] font-semibold">
                    Target Hypothesis: <code className="font-mono text-red-600">{result.backward_chaining.goal}</code>
                  </span>
                  <span
                    className={`font-bold ${
                      result.backward_chaining.established
                        ? "text-red-600"
                        : "text-slate-500"
                    }`}
                  >
                    Status: {result.backward_chaining.established ? "PROVEN" : "UNPROVEN"}
                  </span>
                </div>

                <ol className="space-y-2.5 pt-2">
                  {result.backward_chaining.reasoning_trace.map((step, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-xs font-mono text-[#243447] shadow-xs"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#247BA0] text-white font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* TAB 4: Activated Rules */}
            {activeTab === "rules" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#10243A]">
                    Triggered Production Rules in Knowledge Base
                  </h3>
                  <p className="text-xs text-[#718096]">
                    Formal rule definitions and clinical justification from the expert knowledge base.
                  </p>
                </div>

                {triggeredRuleObjs.length > 0 ? (
                  <div className="space-y-3.5">
                    {triggeredRuleObjs.map((rule) => (
                      <div
                        key={rule.rule_id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-mono font-bold text-white">
                              {rule.rule_id}
                            </span>
                            <span className="text-sm font-bold text-[#10243A]">
                              {rule.name}
                            </span>
                          </div>
                          <span className="rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-[10px] font-bold text-red-700">
                            Priority: {rule.priority}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-[#718096] font-semibold">IF Condition:</span>
                            <p className="mt-0.5 font-mono bg-slate-50 p-2 rounded border border-slate-100 text-[#10243A]">
                              warning_signs contains '{rule.sign_key}'
                            </p>
                          </div>
                          <div>
                            <span className="text-[#718096] font-semibold">THEN Conclusion:</span>
                            <p className="mt-0.5 font-mono bg-slate-50 p-2 rounded border border-slate-100 text-red-700 font-bold">
                              outcome = emergency_escalation (CF: {rule.certainty_factor.toFixed(1)})
                            </p>
                          </div>
                        </div>

                        <div>
                          <span className="text-xs text-[#718096] font-semibold">
                            Clinical Rationale:
                          </span>
                          <p className="mt-1 text-xs leading-relaxed text-[#243447]">
                            {rule.clinical_rationale}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                    No production rules were activated for this assessment.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Legal / Clinical Disclaimer Footer */}
          <div className="border-t border-slate-200 bg-slate-50/90 px-6 py-4 sm:px-8 flex items-start gap-3">
            <ShieldAlert className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-slate-600">
              <strong>Disclaimer:</strong> {result.disclaimer}{" "}
              This system is for academic demonstration only and does not constitute medical
              advice, diagnosis, treatment, or clinical clearance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

