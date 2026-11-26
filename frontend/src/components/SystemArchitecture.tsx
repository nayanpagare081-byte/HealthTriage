"use client";

import {
  Cpu,
  ArrowRight,
  GitMerge,
  Target,
} from "lucide-react";

export default function SystemArchitecture() {
  const steps = [
    {
      num: "01",
      title: "Patient Data Collection",
      tech: "Structured Input",
      desc: "Collects structured clinical information: demographics, symptoms, duration, severity, risk factors, and vital signs.",
      badge: "Intake",
    },
    {
      num: "02",
      title: "Input Validation",
      tech: "Range & Type Checks",
      desc: "Enforces strict type safety and valid physiological ranges (e.g. SpO2 50–100%) on all submitted data.",
      badge: "Validation",
    },
    {
      num: "03",
      title: "Fact Base Extraction",
      tech: "Propositional Facts",
      desc: "Converts reported warning signs into discrete propositional facts for production rule matching.",
      badge: "Fact Set",
    },
    {
      num: "04",
      title: "Forward Chaining Engine",
      tech: "Data-Driven Inference",
      desc: "Iteratively evaluates production rules against known facts, firing matching rules to derive new conclusions.",
      badge: "Forward",
    },
    {
      num: "05",
      title: "Backward Chaining Engine",
      tech: "Goal-Driven Verification",
      desc: "Recursively proves the hypothesis 'emergency_escalation' by locating satisfying rules and verifying prerequisites.",
      badge: "Backward",
    },
    {
      num: "06",
      title: "Certainty Factor Calculation",
      tech: "Confidence Metric",
      desc: "Aggregates independent rule certainties using the standard combination formula: CF_comb = 1 - Π(1 - CF_i).",
      badge: "Certainty",
    },
    {
      num: "07",
      title: "Explainable Output",
      tech: "Reasoning Audit Trace",
      desc: "Emits the final outcome, certainty score, list of activated rules, and complete step-by-step reasoning traces.",
      badge: "Explainable",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 bg-[#F5F8FB] border-t border-slate-200 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-semibold text-[#10243A]">
            <Cpu className="h-3.5 w-3.5 text-[#247BA0]" />
            <span>AI REASONING METHODOLOGY</span>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#10243A] sm:text-4xl">
            How The Expert System Works
          </h2>
          <p className="mt-2 text-base text-[#718096]">
            A deterministic, fully auditable rule-based expert architecture modeled after
            classical clinical decision support systems.
          </p>
        </div>

        {/* 7-Step Pipeline Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {steps.map((step, index) => (
            <div
              key={step.num}
              className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-[#247BA0] hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-lg font-black text-[#10243A]">
                    {step.num}
                  </span>
                  <span className="rounded-md bg-[#EBF4F8] px-2 py-0.5 text-[10px] font-bold text-[#1A5C78]">
                    {step.badge}
                  </span>
                </div>
                <h3 className="mt-3 text-xs font-bold text-[#10243A] leading-tight">
                  {step.title}
                </h3>
                <p className="mt-1 text-[11px] font-mono text-[#247BA0]">
                  {step.tech}
                </p>
                <p className="mt-2 text-xs text-[#718096] leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white border border-slate-200 text-[#247BA0] shadow-xs">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Dual Engine Deep-Dive Comparison */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Forward Chaining Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EBF4F8] text-[#247BA0]">
                <GitMerge className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#10243A]">
                  Forward Chaining (Data-Driven Deduction)
                </h3>
                <p className="text-xs text-[#718096]">
                  Bottom-up inference from observations to conclusions
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-[#F5F8FB] p-4 font-mono text-xs text-[#243447] space-y-2 border border-slate-200/80">
              <div className="flex items-center gap-2 text-[#247BA0] font-bold">
                <span>Facts</span> &rarr; <span>Production Rules</span> &rarr; <span>Conclusions</span>
              </div>
              <p className="text-[11px] text-[#718096] font-sans">
                Takes the verified set of warning signs as initial premises, iterates through the 8
                production rules, and activates any rule whose preconditions match the fact set.
              </p>
            </div>

            <ul className="mt-4 space-y-2 text-xs text-[#243447]">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#247BA0]" />
                <span>Deterministic: Guaranteed reproducible result for any given fact set</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#247BA0]" />
                <span>Generates an explicit reasoning log for every rule activation</span>
              </li>
            </ul>
          </div>

          {/* Backward Chaining Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F8F6] text-[#1B9586]">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#10243A]">
                  Backward Chaining (Goal Verification)
                </h3>
                <p className="text-xs text-[#718096]">
                  Top-down diagnostic proof starting from a target hypothesis
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-[#F5F8FB] p-4 font-mono text-xs text-[#243447] space-y-2 border border-slate-200/80">
              <div className="flex items-center gap-2 text-[#1B9586] font-bold">
                <span>Hypothesis Goal</span> &rarr; <span>Search Rules</span> &rarr; <span>Verify Facts</span>
              </div>
              <p className="text-[11px] text-[#718096] font-sans">
                Formulates the goal <code>emergency_escalation</code> and recursively questions
                whether the clinical conditions necessary to establish this goal are confirmed.
              </p>
            </div>

            <ul className="mt-4 space-y-2 text-xs text-[#243447]">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#24B8A6]" />
                <span>Validates whether the escalation requirement is formally established</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#24B8A6]" />
                <span>Produces a verifiable proof path from goal down to active patient signs</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

