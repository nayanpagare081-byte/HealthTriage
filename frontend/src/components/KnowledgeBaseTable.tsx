"use client";

import { useState, useEffect } from "react";
import { BookOpen, Search, ShieldAlert, ExternalLink, Filter } from "lucide-react";
import { KNOWLEDGE_BASE_RULES } from "../data/rulesData";

interface RuleItem {
  rule_id: string;
  name: string;
  description: string;
  cluster?: string;
  conditions: string[];
  tier?: string;
  conclusion: string;
  certainty_factor: number;
  override?: boolean;
  source: string;
  explanation_template?: string;
  priority: number;
}

export default function KnowledgeBaseTable() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const [rules, setRules] = useState<RuleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("all");

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await fetch(`${API_URL}/api/rules`);
        if (res.ok) {
          const data = await res.json();
          setRules(data);
          return;
        }
      } catch {
        // Fallback to static rules
      }
      // Fallback
      setRules(
        KNOWLEDGE_BASE_RULES.map((r) => ({
          rule_id: r.rule_id,
          name: r.name,
          description: r.description,
          cluster: "emergency",
          conditions: [r.sign_key || ""],
          tier: "emergency",
          conclusion: "emergency_escalation",
          certainty_factor: r.certainty_factor,
          override: true,
          source: r.source,
          explanation_template: r.clinical_rationale,
          priority: r.priority,
        }))
      );
    };
    fetchRules();
  }, [API_URL]);

  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      rule.rule_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rule.explanation_template || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.conditions.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTier =
      tierFilter === "all" ||
      (rule.tier && rule.tier.toLowerCase() === tierFilter.toLowerCase());

    return matchesSearch && matchesTier;
  });

  const getTierBadge = (t?: string) => {
    switch (t) {
      case "emergency":
        return "bg-red-100 text-red-700 border-red-200";
      case "urgent_care_today":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "see_doctor_soon":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "see_doctor_routine":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "self_care":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <section id="knowledge-base" className="py-16 bg-white border-t border-slate-200 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-[#F5F8FB] px-3.5 py-1 text-xs font-semibold text-[#10243A]">
              <BookOpen className="h-3.5 w-3.5 text-[#247BA0]" />
              <span>CLINICAL PRODUCTION RULES KNOWLEDGE BASE</span>
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#10243A]">
              Knowledge Base Rules ({rules.length} Rules)
            </h2>
            <p className="mt-2 text-sm text-[#718096] max-w-2xl">
              Production rules codified from published clinical guidelines (NHS, NICE, WHO, RCOG)
              with MYCIN certainty factors, tier gradings, and self-care guards.
            </p>
          </div>

          {/* Search & Tier Filter */}
          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto shrink-0">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-[#F5F8FB] px-3 py-2.5 text-xs text-[#243447] focus:border-[#247BA0] focus:bg-white focus:outline-none"
            >
              <option value="all">All Tiers ({rules.length})</option>
              <option value="emergency">Emergency</option>
              <option value="urgent_care_today">Urgent Care Today</option>
              <option value="see_doctor_soon">See Doctor Soon</option>
              <option value="see_doctor_routine">See Doctor Routine</option>
              <option value="self_care">Self-Care</option>
            </select>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rule ID, symptoms, tier..."
                className="w-full rounded-xl border border-slate-300 bg-[#F5F8FB] pl-10 pr-4 py-2.5 text-xs text-[#243447] focus:border-[#247BA0] focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Rules Table */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#10243A] text-white uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th scope="col" className="px-5 py-4">Rule ID</th>
                  <th scope="col" className="px-5 py-4">Rule Name</th>
                  <th scope="col" className="px-5 py-4">Tier</th>
                  <th scope="col" className="px-5 py-4">Required Conditions (IF)</th>
                  <th scope="col" className="px-5 py-4 text-center">CF</th>
                  <th scope="col" className="px-5 py-4">Guideline Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredRules.length > 0 ? (
                  filteredRules.map((rule, idx) => {
                    const isUnverified = rule.source.includes("UNVERIFIED");
                    return (
                      <tr
                        key={rule.rule_id}
                        className={`hover:bg-[#F5F8FB] transition-colors ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                        }`}
                      >
                        <td className="px-5 py-4 font-mono font-bold text-[#10243A]">
                          <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5">
                            {rule.rule_id}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-[#10243A] max-w-xs">
                          {rule.name}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getTierBadge(rule.tier)}`}>
                            {rule.tier || "emergency"}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono text-[11px] text-slate-600 max-w-xs">
                          {rule.conditions.join(", ")}
                        </td>
                        <td className="px-5 py-4 text-center font-mono font-bold text-[#247BA0]">
                          {rule.certainty_factor.toFixed(2)}
                        </td>
                        <td className="px-5 py-4 text-[#718096] max-w-md leading-relaxed text-[11px]">
                          <div className="flex items-start gap-1.5">
                            {isUnverified ? (
                              <span className="shrink-0 rounded bg-amber-100 border border-amber-200 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">
                                UNVERIFIED
                              </span>
                            ) : (
                              <span className="shrink-0 rounded bg-emerald-100 border border-emerald-200 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                                VERIFIED
                              </span>
                            )}
                            <span className="truncate">{rule.source}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No matching production rules found for "{searchQuery}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Note */}
        <div className="mt-4 flex items-center justify-between text-xs text-[#718096]">
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <span>
              All rules cite published guidelines from the NHS, NICE, WHO, and RCOG. Unverified rules are logged in docs/UNVERIFIED_RULES.md.
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}
