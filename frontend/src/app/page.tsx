
"use client";

import { useState } from "react";

const WARNING_SIGNS = [
  { value: "severe_breathing_difficulty", label: "Severe breathing difficulty" },
  { value: "chest_pain", label: "Chest pain" },
  { value: "unconsciousness", label: "Unconsciousness" },
  { value: "new_confusion", label: "New confusion" },
  { value: "severe_bleeding", label: "Severe bleeding" },
  { value: "stroke_like_symptoms", label: "Stroke-like symptoms" },
  { value: "severe_allergic_reaction", label: "Severe allergic reaction" },
  { value: "coughing_blood", label: "Coughing blood" },
];

type AssessmentResult = {
  outcome: string;
  certainty_score: number;
  activated_rules: string[];
  explanation: string;
  disclaimer: string;
  forward_chaining: {
    conclusions: string[];
    reasoning_trace: string[];
  };
  backward_chaining: {
    established: boolean;
    reasoning_trace: string[];
  };
};

export default function Home() {
  const [age, setAge] = useState("25");
  const [symptoms, setSymptoms] = useState("");
  const [severity, setSeverity] = useState("5");
  const [duration, setDuration] = useState("");
  const [warningSigns, setWarningSigns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AssessmentResult | null>(null);

  function toggleWarningSign(value: string) {
    setWarningSigns((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const patientData = {
      age: Number(age),
      symptoms: symptoms.split(",").map((item) => item.trim()).filter(Boolean),
      warning_signs: warningSigns,
      duration_hours: duration === "" ? null : Number(duration),
      severity: Number(severity),
      medical_history: [],
      risk_factors: [],
      vital_signs: {},
      additional_information: null,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/triage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail?.map((item: { msg: string }) => item.msg).join(", ") ||
          "Unable to process the request."
        );
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not connect to the backend. Check that FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xl font-bold tracking-tight">
              Health<span className="text-cyan-400">Triage</span>
            </p>
            <p className="mt-1 text-xs text-slate-400">
              AI EXPERT SYSTEM · ACADEMIC PROTOTYPE
            </p>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
            ● Assessment System
          </span>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_340px]">
        <section>
          <div className="mb-8">
            <p className="text-sm font-medium text-cyan-400">
              RULE-BASED ARTIFICIAL INTELLIGENCE
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Patient Assessment
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Enter reported symptoms and warning signs to demonstrate
              rule-based reasoning, forward chaining and backward chaining.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-lg font-semibold">01. Patient Information</h2>
              <p className="mt-1 text-sm text-slate-400">
                Enter basic patient details.
              </p>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="text-sm text-slate-300">
                  Patient age
                  <input
                    type="number"
                    min="0"
                    max="120"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  />
                </label>

                <label className="text-sm text-slate-300">
                  Symptom severity (1–10)
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-lg font-semibold">02. Symptoms</h2>
              <p className="mt-1 text-sm text-slate-400">
                Enter symptoms separated by commas.
              </p>

              <label className="mt-5 block text-sm text-slate-300">
                Reported symptoms
                <textarea
                  required
                  rows={3}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Example: headache, fever, cough"
                  className="mt-2 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />
              </label>

              <label className="mt-5 block text-sm text-slate-300">
                Symptom duration (hours)
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Example: 2"
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />
              </label>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-slate-900 p-6">
              <h2 className="text-lg font-semibold">
                03. Warning Signs
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Select any warning signs reported by the patient.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {WARNING_SIGNS.map((sign) => (
                  <label
                    key={sign.value}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300 hover:border-amber-400"
                  >
                    <input
                      type="checkbox"
                      checked={warningSigns.includes(sign.value)}
                      onChange={() => toggleWarningSign(sign.value)}
                      className="h-4 w-4 accent-cyan-400"
                    />
                    {sign.label}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-cyan-500 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Processing Assessment..." : "Run AI Reasoning →"}
            </button>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                <strong>Request failed:</strong> {error}
              </div>
            )}
          </form>

          {result && (
            <section className="mt-8 rounded-2xl border border-slate-700 bg-slate-900 p-6">
              <p className="text-sm font-medium text-cyan-400">
                REASONING RESULT
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                {result.outcome.replaceAll("_", " ").toUpperCase()}
              </h2>

              <p className="mt-3 text-sm text-slate-300">
                {result.explanation}
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-950 p-4">
                  <p className="text-xs text-slate-400">Rule score</p>
                  <p className="mt-2 text-2xl font-bold text-cyan-400">
                    {result.certainty_score}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-950 p-4">
                  <p className="text-xs text-slate-400">Backward chaining</p>
                  <p className="mt-2 text-lg font-semibold">
                    {result.backward_chaining.established
                      ? "Goal established"
                      : "Goal not established"}
                  </p>
                </div>
              </div>

              <h3 className="mt-6 font-semibold">Activated Rules</h3>
              <p className="mt-2 text-sm text-slate-300">
                {result.activated_rules.length
                  ? result.activated_rules.join(", ")
                  : "No configured rules activated."}
              </p>

              <h3 className="mt-6 font-semibold">Reasoning Trace</h3>
              <ul className="mt-3 space-y-2">
                {result.forward_chaining.reasoning_trace.map((item, index) => (
                  <li
                    key={index}
                    className="rounded-lg bg-slate-950 p-3 text-sm text-slate-300"
                  >
                    {item}
                  </li>
                ))}
              </ul>

              <p className="mt-6 border-t border-slate-700 pt-4 text-xs leading-5 text-slate-400">
                {result.disclaimer}
                {" "}A result without a matched rule does not establish that
                a person is safe.
              </p>
            </section>
          )}
        </section>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="font-semibold">System Architecture</h2>
            <div className="mt-5 space-y-3 text-sm">
              {[
                "Patient Input",
                "Pydantic Validation",
                "Knowledge Base",
                "Forward Chaining",
                "Backward Chaining",
                "Certainty Factors",
                "Explainable Output",
              ].map((item, index) => (
                <div key={item}>
                  <div className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-slate-300">
                    <span className="mr-2 text-cyan-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </div>
                  {index !== 6 && (
                    <div className="py-1 text-center text-cyan-500">↓</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
            <h2 className="font-semibold text-amber-300">
              Important Safety Notice
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              This is an academic AI prototype, not a medical diagnosis
              or a substitute for professional medical assessment.
              Serious or worsening symptoms require immediate professional
              attention. Do not delay emergency care to use this system.
            </p>
          </div>
        </aside>
      </div>

      <footer className="border-t border-slate-800 px-6 py-6 text-center text-xs text-slate-500">
        Health Triage & Symptom Reasoning System · Academic Project
      </footer>
    </main>
  );
}
