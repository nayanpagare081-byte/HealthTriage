"use client";

import {
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  FileCheck2,
  HeartPulse,
  GitCommit,
  Check,
} from "lucide-react";

export default function HeroSection() {
  return (
    <section id="overview" className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Subtle ambient background glow */}
      <div className="absolute top-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-[#E8F8F6]/60 blur-3xl" />
      <div className="absolute top-1/3 left-10 -z-10 h-72 w-72 rounded-full bg-[#EBF4F8]/70 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Heading and CTAs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Academic Prototype Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#10243A] shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-[#24B8A6]" />
              <span>Rule-Based Expert System</span>
              <span className="text-slate-300">|</span>
              <span className="text-[#718096]">Academic Prototype</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-[#10243A] sm:text-5xl lg:text-[3.25rem] lg:leading-[1.15]">
              Understand Warning Signs.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#247BA0] to-[#24B8A6]">
                Get Clearer Guidance.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="max-w-2xl text-lg leading-relaxed text-[#718096]">
              An explainable, rule-based system that evaluates selected health warning
              signs and shows the reasoning behind its result.
            </p>

            {/* Primary & Secondary Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#assessment"
                className="inline-flex items-center gap-2.5 rounded-xl bg-[#10243A] px-6 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-[#18375A] active:scale-[0.98] transition-all"
              >
                <span>Start Assessment</span>
                <ArrowRight className="h-4 w-4 text-[#24B8A6]" />
              </a>

              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-[#243447] hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] transition-all"
              >
                <HelpCircle className="h-4 w-4 text-[#247BA0]" />
                <span>How It Works</span>
              </a>
            </div>

            {/* Small Disclaimer */}
            <div className="flex items-center gap-2 pt-2 text-xs text-[#718096]">
              <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Academic prototype — not a medical diagnosis tool.</span>
            </div>

            {/* Key Value Propositions */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80">
              <div className="space-y-1">
                <p className="text-xl font-bold text-[#10243A]">8 Rules</p>
                <p className="text-xs text-[#718096]">Formal Warning Signs</p>
              </div>
              <div className="space-y-1">
                <p className="text-xl font-bold text-[#247BA0]">Dual-Engine</p>
                <p className="text-xs text-[#718096]">Forward & Backward Chaining</p>
              </div>
              <div className="space-y-1">
                <p className="text-xl font-bold text-[#24B8A6]">100% Traceable</p>
                <p className="text-xs text-[#718096]">Auditable Reasoning Paths</p>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Healthcare Medical Interface Visual */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Card Container */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xl shadow-slate-200/40 relative">
                {/* Header of the visual card */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F8F6] text-[#1B9586]">
                      <HeartPulse className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#10243A]">
                        Reasoning Pipeline
                      </p>
                      <p className="text-[11px] text-[#718096]">
                        Rule Execution State: Active
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Rule-Based AI
                  </span>
                </div>

                {/* SVG Medical Telemetry EKG wave */}
                <div className="py-3">
                  <div className="relative h-14 w-full overflow-hidden rounded-lg bg-slate-50 border border-slate-100 p-2 flex items-center">
                    <svg
                      viewBox="0 0 500 80"
                      className="h-full w-full stroke-[#247BA0] fill-none"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M 0 40 L 80 40 L 95 20 L 110 65 L 125 10 L 140 50 L 155 40 L 260 40 L 275 25 L 290 60 L 305 15 L 320 48 L 335 40 L 500 40"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                  </div>
                </div>

                {/* Pipeline Steps in the Visual */}
                <div className="space-y-2.5 text-xs">
                  {/* Step 1 */}
                  <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-[#F5F8FB] p-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white text-[#247BA0] font-bold text-[10px] shadow-xs">
                        1
                      </div>
                      <span className="font-medium text-[#243447]">Patient Warning Signs</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#718096] bg-white px-2 py-0.5 rounded border border-slate-200">
                      8 Predefined Rules
                    </span>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-[#F5F8FB] p-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white text-[#247BA0] font-bold text-[10px] shadow-xs">
                        2
                      </div>
                      <span className="font-medium text-[#243447]">Forward Chaining</span>
                    </div>
                    <span className="flex items-center gap-1 font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      <Check className="h-3 w-3" />
                      Active
                    </span>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-[#F5F8FB] p-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white text-[#247BA0] font-bold text-[10px] shadow-xs">
                        3
                      </div>
                      <span className="font-medium text-[#243447]">Backward Chaining</span>
                    </div>
                    <span className="flex items-center gap-1 font-semibold text-[#247BA0] bg-[#EBF4F8] px-2 py-0.5 rounded border border-blue-100">
                      <GitCommit className="h-3 w-3" />
                      Goal Check
                    </span>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-center justify-between rounded-lg border border-teal-100 bg-[#E8F8F6]/60 p-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#24B8A6] text-white font-bold text-[10px]">
                        4
                      </div>
                      <span className="font-semibold text-[#10243A]">Certainty Factor (CF)</span>
                    </div>
                    <span className="font-semibold text-[#1B9586]">
                      Confidence Score
                    </span>
                  </div>
                </div>

                {/* Footer preview note */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#718096]">
                  <span className="flex items-center gap-1">
                    <FileCheck2 className="h-3.5 w-3.5 text-[#247BA0]" />
                    Explainable Reasoning Trace
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

