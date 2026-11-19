"use client";

import { ShieldAlert, ArrowUp, Activity, Terminal } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-slate-200 bg-white pt-12 pb-8 text-xs text-[#718096]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-100">
          {/* Col 1: Brand & Purpose */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10243A] text-[#24B8A6]">
                <Activity className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-[#10243A]">
                Health<span className="text-[#247BA0]">Triage</span> & Symptom Reasoning System
              </span>
            </div>
            <p className="text-xs leading-relaxed max-w-md text-[#718096]">
              An academic rule-based artificial intelligence expert system demonstrating
              knowledge representation, production rules, forward chaining deduction,
              backward chaining goal verification, and certainty factor propagation.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-3 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#10243A]">
              Quick Navigation
            </p>
            <ul className="space-y-1.5 pt-1">
              <li>
                <a href="#overview" className="hover:text-[#247BA0] transition-colors">
                  Overview & Abstract
                </a>
              </li>
              <li>
                <a href="#assessment" className="hover:text-[#247BA0] transition-colors">
                  Patient Assessment Form
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#247BA0] transition-colors">
                  System Architecture & Inference
                </a>
              </li>
              <li>
                <a href="#knowledge-base" className="hover:text-[#247BA0] transition-colors">
                  Rule Knowledge Base (R001–R008)
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Clinical Safety Notice */}
          <div className="md:col-span-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#10243A]">
              Academic Safety Mandate
            </p>
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-[11px] leading-relaxed text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                <span>Strict Prototype Disclaimer</span>
              </div>
              <p>
                This software is created solely for computer science coursework and educational
                demonstration. It is <strong>NOT</strong> an FDA/CE-cleared medical device,
                provides no clinical diagnosis, and must never be used to defer professional medical care.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#718096]">
          <p>
            &copy; 2026 Health Triage & Symptom Reasoning System. Academic Capstone Project.
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 font-medium hover:text-[#10243A] transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
