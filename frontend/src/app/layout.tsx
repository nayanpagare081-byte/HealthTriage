import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Health Triage & Symptom Reasoning System | Clinical Expert AI",
  description:
    "An explainable rule-based clinical decision support prototype demonstrating production rules, forward chaining, backward chaining, and certainty factor calculations.",
  keywords: [
    "Health Triage",
    "Clinical Expert System",
    "Forward Chaining",
    "Backward Chaining",
    "Certainty Factors",
    "Medical AI Prototype",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F5F8FB] text-[#243447]">
        {children}
      </body>
    </html>
  );
}
