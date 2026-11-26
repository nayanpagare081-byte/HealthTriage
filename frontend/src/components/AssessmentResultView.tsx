"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Printer,
  RotateCcw,
  ShieldAlert,
  Percent,
  Layers,
  Info,
  PhoneCall,
  ExternalLink,
  Clock,
  HeartPulse,
} from "lucide-react";
import { AssessmentResult } from "../types/triage";

interface AssessmentResultViewProps {
  result: AssessmentResult;
  onNewAssessment: () => void;
}

export default function AssessmentResultView({
  result,
  onNewAssessment,
}: AssessmentResultViewProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "rules" | "forward" | "backward">("summary");

  const tier = (result.tier || result.outcome || "").toLowerCase();
  const emergencyNumber = result.emergency_number || "112";

  // Tier Styling Configurations
  const getTierConfig = (tierName: string) => {
    switch (tierName) {
      case "emergency":
      case "emergency_escalation":
        return {
          title: "EMERGENCY ESCALATION",
          badge: "Tier 1: Emergency Services",
          bgGradient: "bg-gradient-to-r from-red-600 via-rose-600 to-red-700",
          border: "border-red-400 ring-1 ring-red-400/40",
          icon: <AlertTriangle className="h-7 w-7 text-white" />,
          accentBg: "bg-red-50 border-red-200 text-red-900",
          barColor: "bg-red-600",
          calloutIcon: <PhoneCall className="h-5 w-5 text-red-600 shrink-0" />,
          callout: (
            <div>
              <span>
                <strong>Immediate Emergency Action Required:</strong> Critical life-threatening
                warning signs detected. Call emergency services immediately (dial {emergencyNumber})
                or attend the nearest emergency department.
              </span>
              <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-xs">
                <PhoneCall className="h-3.5 w-3.5" />
                <span>Call Emergency: {emergencyNumber}</span>
              </div>
            </div>
          ),
        };
      case "urgent_care_today":
        return {
          title: "URGENT CARE TODAY",
          badge: "Tier 2: Same-Day Clinical Care",
          bgGradient: "bg-gradient-to-r from-orange-600 to-amber-600",
          border: "border-orange-400 ring-1 ring-orange-400/40",
          icon: <AlertTriangle className="h-7 w-7 text-white" />,
          accentBg: "bg-orange-50 border-orange-200 text-orange-950",
          barColor: "bg-orange-500",
          calloutIcon: <Clock className="h-5 w-5 text-orange-600 shrink-0" />,
          callout: (
            <div>
              <span>
                <strong>Same-Day Care Recommended:</strong> Acute symptoms or high-risk factors
                require same-day clinical assessment (visit an urgent care clinic or same-day primary care doctor).
              </span>
              <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-3 py-1 text-xs font-semibold text-white shadow-xs">
                <PhoneCall className="h-3.5 w-3.5" />
                <span>If condition deteriorates rapidly, call {emergencyNumber} immediately</span>
              </div>
            </div>
          ),
        };
      case "see_doctor_soon":
        return {
          title: "SEE DOCTOR SOON (24–48h)",
          badge: "Tier 3: Prompt Primary Care",
          bgGradient: "bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600",
          border: "border-amber-400 ring-1 ring-amber-400/40",
          icon: <Info className="h-7 w-7 text-white" />,
          accentBg: "bg-amber-50 border-amber-200 text-amber-950",
          barColor: "bg-amber-500",
          calloutIcon: <HeartPulse className="h-5 w-5 text-amber-600 shrink-0" />,
          callout: (
            <span>
              <strong>Prompt Doctor Review:</strong> Symptoms are persistent or worsening.
              Schedule a medical appointment with your GP or primary care physician within
              24 to 48 hours.
            </span>
          ),
        };
      case "see_doctor_routine":
        return {
          title: "ROUTINE DOCTOR REVIEW",
          badge: "Tier 4: Routine Consultation",
          bgGradient: "bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600",
          border: "border-blue-400 ring-1 ring-blue-400/40",
          icon: <Info className="h-7 w-7 text-white" />,
          accentBg: "bg-blue-50 border-blue-200 text-blue-950",
          barColor: "bg-blue-500",
          calloutIcon: <Info className="h-5 w-5 text-blue-600 shrink-0" />,
          callout: (
            <span>
              <strong>Routine Appointment:</strong> Symptoms suggest a chronic or mild subacute
              pattern suitable for a standard GP visit. Book a routine check-up.
            </span>
          ),
        };
      case "self_care":
        return {
          title: "SUPPORTIVE SELF-CARE",
          badge: "Tier 5: Home Self-Management",
          bgGradient: "bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700",
          border: "border-emerald-400 ring-1 ring-emerald-400/40",
          icon: <CheckCircle2 className="h-7 w-7 text-white" />,
          accentBg: "bg-emerald-50 border-emerald-200 text-emerald-950",
          barColor: "bg-emerald-500",
          calloutIcon: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />,
          callout: (
            <span>
              <strong>Self-Care Suitable:</strong> Current symptoms align with a mild, self-limiting
              illness without red flags or vulnerable risk factors. Maintain hydration and rest.
              Seek medical advice if symptoms worsen.
            </span>
          ),
        };
      default:
        return {
          title: "NO SPECIFIC RULE MATCHED",
          badge: "Non-Categorized Presentation",
          bgGradient: "bg-gradient-to-r from-slate-600 to-slate-700",
          border: "border-slate-300 ring-1 ring-slate-300/40",
          icon: <HelpCircle className="h-7 w-7 text-white" />,
          accentBg: "bg-slate-50 border-slate-200 text-slate-800",
          barColor: "bg-slate-400",
          calloutIcon: <ShieldAlert className="h-5 w-5 text-slate-600 shrink-0" />,
          callout: (
            <span>
              <strong>Not a Confirmation of Safety:</strong> No configured clinical rule matched
              your exact symptom combination. This is <em>not</em> an all-clear. Consult a qualified
              doctor if symptoms persist, worsen, or cause concern.
            </span>
          ),
        };
    }
  };

  const cfg = getTierConfig(tier);

  // Extract URL from rule source if present
  const parseSource = (sourceStr: string) => {
    const isUnverified = sourceStr.includes("UNVERIFIED");
    const urlMatch = sourceStr.match(/https?:\/\/[^\s|)]+/);
    const url = urlMatch ? urlMatch[0] : null;
    return { isUnverified, url, raw: sourceStr };
  };

  return (
    <section id="reasoning-result" className="py-8 scroll-mt-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Safety Disclaimer Banner Before Result */}
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 shadow-xs flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Important Clinical Safeguard:</strong> This system is a rule-based AI course
            demonstration for preliminary symptom reasoning. It is <strong>NOT</strong> a medical
            diagnostic tool, cannot rule out serious conditions, and must not replace evaluation
            by a licensed doctor.
          </p>
        </div>

        {/* Container */}
        <div className={`overflow-hidden rounded-2xl border-2 bg-white shadow-lg transition-all ${cfg.border}`}>
          {/* Top Result Banner */}
          <div className={`p-6 sm:p-8 text-white ${cfg.bgGradient}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white">
                  {cfg.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-black/25 px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase">
                      {cfg.badge}
                    </span>
                  </div>
                  <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                    {cfg.title}
                  </h2>
                  <p className="mt-1.5 text-sm text-white/95 max-w-2xl leading-relaxed">
                    {result.explanation}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
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

          {/* Clinical Action Callout */}
          <div className={`border-b p-4 sm:px-8 flex items-center gap-3 text-xs leading-relaxed ${cfg.accentBg}`}>
            {cfg.calloutIcon}
            <div>{cfg.callout}</div>
          </div>

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
                  className={`h-full rounded-full transition-all duration-500 ${cfg.barColor}`}
                  style={{ width: `${Math.max(result.certainty_score * 100, 4)}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-[#718096]">
                MYCIN-combined positive evidence score
              </p>
            </div>

            {/* Metric 2: Fired Rules */}
            <div className="p-6">
              <div className="flex items-center justify-between text-xs text-[#718096]">
                <span className="font-semibold uppercase tracking-wider">
                  Fired Production Rules
                </span>
                <Layers className="h-4 w-4 text-[#247BA0]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#10243A]">
                  {result.fired_rules?.length ?? result.activated_rules.length}
                </span>
                <span className="text-xs font-medium text-slate-500">rules fired</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {result.fired_rules && result.fired_rules.length > 0 ? (
                  result.fired_rules.map((r) => (
                    <span
                      key={r.rule_id}
                      className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs font-mono font-bold text-[#10243A]"
                    >
                      {r.rule_id}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">None matched</span>
                )}
              </div>
              <p className="mt-2 text-[11px] text-[#718096]">
                Multi-factorial clinical conditions satisfied
              </p>
            </div>

            {/* Metric 3: Backward Chaining */}
            <div className="p-6">
              <div className="flex items-center justify-between text-xs text-[#718096]">
                <span className="font-semibold uppercase tracking-wider">
                  Backward Chaining Goal
                </span>
                <HelpCircle className="h-4 w-4 text-[#247BA0]" />
              </div>
              <div className="mt-2">
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
                  {result.backward_chaining.established ? "Goal Established" : "Goal Unproven"}
                </span>
              </div>
              <p className="mt-2 font-mono text-[11px] text-slate-600 truncate">
                Goal: {result.backward_chaining.goal}
              </p>
              <p className="mt-1 text-[11px] text-[#718096]">
                Target hypothesis verification trace
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
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
                onClick={() => setActiveTab("rules")}
                className={`flex items-center gap-2 py-3.5 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "rules"
                    ? "border-[#247BA0] text-[#10243A]"
                    : "border-transparent text-[#718096] hover:text-[#243447]"
                }`}
              >
                <span>Rule-by-Rule Explanation</span>
                <span className="rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] font-mono">
                  {result.fired_rules?.length ?? result.activated_rules.length}
                </span>
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
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Tab 1: Summary */}
            {activeTab === "summary" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#10243A]">
                    Triage Decision Rationale
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#243447]">
                    {result.explanation}
                  </p>
                </div>

                {/* Narrative bulleted explanations */}
                {result.rule_by_rule_explanation && result.rule_by_rule_explanation.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-[#F5F8FB] p-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#10243A] mb-2.5">
                      Fired Rule Traces
                    </h4>
                    <ul className="space-y-2 text-xs text-[#243447]">
                      {result.rule_by_rule_explanation.map((exp, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#247BA0] mt-1.5 shrink-0" />
                          <span>{exp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Rule-by-Rule Details with Sources */}
            {activeTab === "rules" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#10243A]">
                    Detailed Rule Deductions & Clinical Sources
                  </h3>
                  <p className="text-xs text-[#718096]">
                    Every fired rule provides its clinical guideline citation, premise certainty,
                    and verification status.
                  </p>
                </div>

                {result.fired_rules && result.fired_rules.length > 0 ? (
                  <div className="space-y-4">
                    {result.fired_rules.map((rule) => {
                      const src = parseSource(rule.source);
                      return (
                        <div
                          key={rule.rule_id}
                          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="rounded-md bg-[#10243A] px-2.5 py-1 text-xs font-mono font-bold text-white">
                                {rule.rule_id}
                              </span>
                              <span className="text-sm font-bold text-[#10243A]">
                                {rule.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                                Tier: <strong className="uppercase">{rule.tier}</strong>
                              </span>
                              <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-mono font-bold text-[#247BA0]">
                                CF: {rule.certainty_factor.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <div className="text-xs space-y-1.5">
                            <p className="text-[#243447]">
                              <strong>Clinical Explanation:</strong> {rule.explanation}
                            </p>
                            {rule.matched_conditions && rule.matched_conditions.length > 0 && (
                              <div className="text-[#718096] pt-1">
                                <strong>Matched Premises &amp; Premise Certainty:</strong>{" "}
                                <div className="mt-1.5 flex flex-wrap gap-1.5">
                                  {rule.matched_conditions.map((prem) => {
                                    const cf = rule.premise_cfs ? rule.premise_cfs[prem] : undefined;
                                    const isUncertain = cf !== undefined && cf < 1.0;
                                    return (
                                      <span
                                        key={prem}
                                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-mono font-medium border ${
                                          isUncertain
                                            ? "bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-300/30"
                                            : "bg-slate-100 text-slate-800 border-slate-200"
                                        }`}
                                      >
                                        <span>{prem}</span>
                                        {cf !== undefined && (
                                          <span className={`font-bold ${isUncertain ? "text-amber-700" : "text-[#247BA0]"}`}>
                                            (CF: {cf.toFixed(2)})
                                          </span>
                                        )}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Source Citation & Link */}
                          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="text-slate-700 truncate">
                              <strong>Clinical Source:</strong> {rule.source}
                            </div>
                            <div className="shrink-0 flex items-center gap-2">
                              {src.isUnverified ? (
                                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                                  UNVERIFIED - needs team review
                                </span>
                              ) : (
                                <>
                                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                                    Verified Clinical Source
                                  </span>
                                  {src.url && (
                                    <a
                                      href={src.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#247BA0] hover:underline"
                                    >
                                      <span>View Guideline</span>
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                    No production rules were activated for this assessment.
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Forward Chaining Trace */}
            {activeTab === "forward" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#10243A]">
                    Forward Chaining Step-By-Step Deduction Trace
                  </h3>
                  <p className="text-xs text-[#718096]">
                    Execution trace iterating to a fixed point from patient facts.
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
                    No forward-chaining rules fired.
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Backward Chaining Trace */}
            {activeTab === "backward" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#10243A]">
                    Backward Chaining Goal Verification
                  </h3>
                  <p className="text-xs text-[#718096]">
                    Goal-driven prover evaluating hypothesis &apos;{result.backward_chaining.goal}&apos;.
                  </p>
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
          </div>

          {/* Legal / Clinical Disclaimer Footer */}
          <div className="border-t border-slate-200 bg-slate-50/90 px-6 py-4 sm:px-8 flex items-start gap-3">
            <ShieldAlert className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-slate-600">
              <strong>Mandatory Academic Disclaimer:</strong> {result.disclaimer}{" "}
              This system does not constitute medical advice, diagnosis, treatment, or clinical
              clearance. If in doubt or in an emergency, contact emergency medical services or consult
              a qualified doctor immediately.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
