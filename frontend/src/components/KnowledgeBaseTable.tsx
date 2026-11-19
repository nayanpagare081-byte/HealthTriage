"use client";

import { useState } from "react";
import { BookOpen, Search, ShieldAlert, ArrowUpRight, Check, Filter } from "lucide-react";
import { KNOWLEDGE_BASE_RULES } from "../data/rulesData";

export default function KnowledgeBaseTable() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRules = KNOWLEDGE_BASE_RULES.filter(
    (rule) =>
      rule.rule_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.clinical_rationale.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.sign_key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="knowledge-base" className="py-16 bg-white border-t border-slate-200 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-[#F5F8FB] px-3.5 py-1 text-xs font-semibold text-[#10243A]">
              <BookOpen className="h-3.5 w-3.5 text-[#247BA0]" />
              <span>FORMAL KNOWLEDGE BASE</span>
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#10243A]">
              Active Production Rules (R001 – R008)
            </h2>
            <p className="mt-2 text-sm text-[#718096] max-w-2xl">
              The expert system evaluates patient warning signs against eight configured
              deterministic production rules stored in the knowledge base.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rules or symptoms..."
              className="w-full rounded-xl border border-slate-300 bg-[#F5F8FB] pl-10 pr-4 py-2.5 text-xs text-[#243447] focus:border-[#247BA0] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Rules Table */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#10243A] text-white uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th scope="col" className="px-5 py-4">Rule ID</th>
                  <th scope="col" className="px-5 py-4">Warning Sign</th>
                  <th scope="col" className="px-5 py-4">Condition (IF)</th>
                  <th scope="col" className="px-5 py-4">Conclusion (THEN)</th>
                  <th scope="col" className="px-5 py-4 text-center">CF Score</th>
                  <th scope="col" className="px-5 py-4 text-center">Priority</th>
                  <th scope="col" className="px-5 py-4">Clinical Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredRules.length > 0 ? (
                  filteredRules.map((rule, idx) => (
                    <tr
                      key={rule.rule_id}
                      className={`hover:bg-[#F5F8FB] transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                      }`}
                    >
                      {/* Rule ID */}
                      <td className="px-5 py-4 font-mono font-bold text-red-600">
                        <span className="rounded bg-red-50 border border-red-200 px-2 py-0.5">
                          {rule.rule_id}
                        </span>
                      </td>

                      {/* Rule Name */}
                      <td className="px-5 py-4 font-bold text-[#10243A] whitespace-nowrap">
                        {rule.name}
                      </td>

                      {/* Condition */}
                      <td className="px-5 py-4 font-mono text-[11px] text-slate-600">
                        <code>{rule.sign_key}</code>
                      </td>

                      {/* Conclusion */}
                      <td className="px-5 py-4 font-mono text-[11px] font-semibold text-red-700 whitespace-nowrap">
                        emergency_escalation
                      </td>

                      {/* Certainty Factor */}
                      <td className="px-5 py-4 text-center font-mono font-bold text-[#247BA0]">
                        {rule.certainty_factor.toFixed(1)}
                      </td>

                      {/* Priority */}
                      <td className="px-5 py-4 text-center font-mono text-slate-600">
                        {rule.priority}
                      </td>

                      {/* Clinical Rationale */}
                      <td className="px-5 py-4 text-[#718096] max-w-md leading-relaxed">
                        {rule.clinical_rationale}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      No matching production rules found for "{searchQuery}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Knowledge Base Note */}
        <div className="mt-4 flex items-center justify-between text-xs text-[#718096]">
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <span>Rules are deterministic prototype representations, not clinical diagnostic standards.</span>
          </span>
        </div>
      </div>
    </section>
  );
}

