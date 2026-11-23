"use client";

import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Activity,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  PlusCircle,
  FileCode,
  Network,
} from "lucide-react";

interface NavbarProps {
  onNewAssessment?: () => void;
}

export default function Navbar({ onNewAssessment }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"checking" | "connected" | "offline">("checking");
  const [isChecking, setIsChecking] = useState(false);

  const checkBackendHealth = async () => {
    setIsChecking(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    try {
      const res = await fetch(`${apiUrl}/health`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (res.ok) {
        setBackendStatus("connected");
      } else {
        setBackendStatus("offline");
      }
    } catch {
      setBackendStatus("offline");
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
        {/* Brand identity */}
        <a href="#overview" className="flex items-center gap-3.5 group">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[#10243A] text-white shadow-sm ring-1 ring-slate-900/10 transition-transform group-hover:scale-105">
            <div className="relative">
              <ShieldAlert className="h-6 w-6 text-[#24B8A6]" />
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#247BA0] ring-2 ring-[#10243A]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-[#10243A]">
                Health<span className="text-[#247BA0]">Triage</span>
              </span>
              <span className="hidden rounded-full border border-teal-200 bg-[#E8F8F6] px-2 py-0.5 text-[11px] font-semibold text-[#1B9586] sm:inline-block">
                AI Expert System
              </span>
            </div>
            <p className="text-xs font-medium text-[#718096]">
              Symptom Reasoning System
            </p>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <a
            href="#overview"
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-[#243447] hover:bg-slate-50 hover:text-[#247BA0] transition-colors"
          >
            Overview
          </a>
          <a
            href="#assessment"
            onClick={onNewAssessment}
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-[#243447] hover:bg-slate-50 hover:text-[#247BA0] transition-colors"
          >
            New Assessment
          </a>
          <a
            href="#how-it-works"
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-[#243447] hover:bg-slate-50 hover:text-[#247BA0] transition-colors"
          >
            How It Works
          </a>
          <a
            href="#knowledge-base"
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-[#243447] hover:bg-slate-50 hover:text-[#247BA0] transition-colors"
          >
            Knowledge Base
          </a>
        </nav>

        {/* Right side status & action */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Live Backend Indicator */}
          <div
            title={
              backendStatus === "connected"
                ? "Backend server is active"
                : backendStatus === "checking"
                ? "Verifying connection..."
                : "Backend server is unreachable"
            }
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs text-[#243447]"
          >
            {backendStatus === "connected" ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="font-semibold text-slate-700">API Online</span>
              </>
            ) : backendStatus === "checking" ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin text-amber-500" />
                <span className="text-slate-600">Connecting...</span>
              </>
            ) : (
              <button
                onClick={checkBackendHealth}
                className="flex items-center gap-1.5 text-red-600 hover:text-red-700 font-medium"
              >
                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                <span>API Offline</span>
                <RefreshCw className={`h-3 w-3 ml-0.5 ${isChecking ? "animate-spin" : ""}`} />
              </button>
            )}
          </div>

          {/* Quick CTA */}
          <a
            href="#assessment"
            onClick={onNewAssessment}
            className="flex items-center gap-2 rounded-xl bg-[#10243A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#18375A] active:scale-[0.98] transition-all"
          >
            <PlusCircle className="h-4 w-4 text-[#24B8A6]" />
            <span>Assessment</span>
          </a>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              backendStatus === "connected"
                ? "bg-emerald-500"
                : backendStatus === "checking"
                ? "bg-amber-400 animate-pulse"
                : "bg-red-500"
            }`}
            title={`Backend: ${backendStatus}`}
          />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 pt-2 pb-6 md:hidden shadow-lg animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-2">
            <a
              href="#overview"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-base font-medium text-[#243447] hover:bg-slate-50"
            >
              <Activity className="h-5 w-5 text-[#247BA0]" />
              Overview
            </a>
            <a
              href="#assessment"
              onClick={() => {
                setMobileMenuOpen(false);
                onNewAssessment?.();
              }}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-base font-medium text-[#243447] hover:bg-slate-50"
            >
              <PlusCircle className="h-5 w-5 text-[#24B8A6]" />
              New Assessment
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-base font-medium text-[#243447] hover:bg-slate-50"
            >
              <Network className="h-5 w-5 text-[#247BA0]" />
              How It Works
            </a>
            <a
              href="#knowledge-base"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-base font-medium text-[#243447] hover:bg-slate-50"
            >
              <FileCode className="h-5 w-5 text-[#247BA0]" />
              Knowledge Base
            </a>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                {backendStatus === "connected" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Backend Connected</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span>Backend Offline</span>
                  </>
                )}
              </span>
              <button
                onClick={checkBackendHealth}
                className="text-xs font-semibold text-[#247BA0] hover:underline"
              >
                Refresh Status
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

