"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import AssessmentForm from "../components/AssessmentForm";
import AssessmentResultView from "../components/AssessmentResultView";
import SystemArchitecture from "../components/SystemArchitecture";
import KnowledgeBaseTable from "../components/KnowledgeBaseTable";
import Footer from "../components/Footer";
import { AssessmentResult } from "../types/triage";

export default function Home() {
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAssessmentCompleted = (data: AssessmentResult) => {
    setResult(data);
  };

  const handleNewAssessment = () => {
    setResult(null);
    setError("");
    const formElem = document.getElementById("assessment");
    if (formElem) {
      formElem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F8FB] text-[#243447]">
      {/* Top Navigation */}
      <Navbar onNewAssessment={handleNewAssessment} />

      {/* Main Content Areas */}
      <main className="flex-1">
        {/* Landing / Overview Section */}
        <HeroSection />

        {/* Patient Assessment Form */}
        <AssessmentForm
          onAssessmentCompleted={handleAssessmentCompleted}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          error={error}
          setError={setError}
        />

        {/* Dynamic Explainable AI Results View */}
        {result && (
          <AssessmentResultView
            result={result}
            onNewAssessment={handleNewAssessment}
          />
        )}

        {/* System Architecture & Explainability Section */}
        <SystemArchitecture />

        {/* Production Rules Knowledge Base Reference */}
        <KnowledgeBaseTable />
      </main>

      {/* Institutional Footer */}
      <Footer />
    </div>
  );
}
