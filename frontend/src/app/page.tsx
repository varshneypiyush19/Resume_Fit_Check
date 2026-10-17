"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import ResumeUploader from "@/components/ResumeUploader";
import JobDescriptionInput from "@/components/JobDescriptionInput";
import OutputDisplay from "@/components/OutputDisplay";
import { tailorResumeStream } from "@/lib/api";
import { TailoredResumeResponse } from "@/types/resume";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  FileSearch,
  RefreshCw,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  Globe,
  Code2,
  Check,
} from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>("");
  const [liveStreamPreview, setLiveStreamPreview] = useState<string>("");
  const [streamedTokenCount, setStreamedTokenCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TailoredResumeResponse | null>(null);
  const [mobileTab, setMobileTab] = useState<"inputs" | "results">("inputs");

  const scrollToWorkspace = () => {
    const el = document.getElementById("workspace");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!file) {
      setError("Please upload a resume (PDF or DOCX).");
      return;
    }

    if (!jobDescription.trim() || jobDescription.trim().length < 30) {
      setError("Please paste a complete job description (minimum 30 characters).");
      return;
    }

    setIsLoading(true);
    setLoadingStage("Parsing resume document & hyperlinks...");
    setLiveStreamPreview("");
    setStreamedTokenCount(0);
    setMobileTab("results");

    try {
      const responseData = await tailorResumeStream(
        file,
        jobDescription,
        (stage) => {
          setLoadingStage(stage);
        },
        (chunk) => {
          setStreamedTokenCount((prev) => prev + 1);
          setLiveStreamPreview((prev) => (prev + chunk).slice(-260));
        }
      );
      setResult(responseData);
      setMobileTab("results");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setMobileTab("inputs");
    } finally {
      setIsLoading(false);
      setLoadingStage("");
      setLiveStreamPreview("");
      setStreamedTokenCount(0);
    }
  };

  const handleReset = () => {
    setFile(null);
    setJobDescription("");
    setResult(null);
    setError(null);
    setMobileTab("inputs");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-12">
        {/* Modern Landing Page Hero Section */}
        <section className="no-print pt-6 pb-12 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/70 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span>AI-Powered ATS Resume Strategist</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
                Resume<span className="text-indigo-600 dark:text-indigo-400">Fit</span>: Optimize Your Resume in Seconds
              </h1>

              <p className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-200">
                Get Instant Feedback & Land More Interviews
              </p>

              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                ResumeFit analyzes your resume against target job requirements, computes ATS match alignment, and rewrites your summary and bullet points to highlight quantifiable impact and active verbs.
              </p>

              {/* Action Buttons: Check Button Scrolls Directly to Workspace */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <button
                  type="button"
                  onClick={scrollToWorkspace}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <span>Check My Resume Now</span>
                  <ArrowDown className="w-4 h-4 animate-bounce" />
                </button>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">✓ 100% Free</span>
                  <span>•</span>
                  <span>Single-Page Vector PDF</span>
                </div>
              </div>

              {/* Feature Checkmarks */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Workday, Lever & Greenhouse ATS Ready
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Preserved Vector Hyperlinks
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Real-time Diff Analysis
                </span>
              </div>
            </div>

            {/* Right Interactive Mockup Card Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl p-5 bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-900/5 dark:shadow-black/50">
                {/* Floating Score Badge */}
                <div className="absolute -top-3 -right-2 sm:-right-4 bg-white dark:bg-slate-900 rounded-2xl p-2.5 border border-slate-200 dark:border-slate-800 shadow-lg flex items-center gap-2.5 z-10">
                  <div className="w-12 h-12 rounded-full border-[3px] border-emerald-500 flex flex-col items-center justify-center bg-emerald-50/50 dark:bg-emerald-950/40">
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400 leading-none">94</span>
                    <span className="text-[8px] text-slate-400 font-bold">/100</span>
                  </div>
                  <div className="text-left pr-2">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Strong Match</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white">ATS Compatible</span>
                  </div>
                </div>

                {/* Candidate Snippet */}
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800 text-left">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">Live Optimization Preview</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Piyush Varshney</h4>
                  <p className="text-[11px] text-slate-500">Full Stack & AI Engineer • varshneypiyush19@gmail.com</p>
                </div>

                {/* AI Suggestion Highlight */}
                <div className="my-3 p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/60 text-left">
                  <div className="flex items-center justify-between text-[11px] font-bold text-indigo-700 dark:text-indigo-300 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      Quantified Impact Suggestion
                    </span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.2 rounded font-bold">+8 pts</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    Adding measurable business impact (40% API latency cut, 99.9% uptime) aligns with senior target JD requirements.
                  </p>
                </div>

                {/* Sample Optimized Bullets */}
                <div className="space-y-2 text-left text-[11px]">
                  <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-slate-700 dark:text-slate-200 flex items-start gap-2">
                    <span className="text-emerald-600 font-bold shrink-0">✓</span>
                    <span>Engineered high-throughput FastAPI microservice reducing cold-start latency by 45%.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-slate-700 dark:text-slate-200 flex items-start gap-2">
                    <span className="text-emerald-600 font-bold shrink-0">✓</span>
                    <span>Implemented Next.js 16 SSR & automated CI/CD pipeline achieving 99.98% production reliability.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global Error Alert */}
        {error && (
          <div className="no-print p-4 rounded-3xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-3 shadow-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-red-800 dark:text-red-300">
                Customization Error
              </h4>
              <p className="text-xs text-red-700 dark:text-red-400 mt-0.5 leading-relaxed">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Main 2-Column Responsive Workspace */}
        <section id="workspace" className="pt-4 scroll-mt-20">
          <div className="no-print mb-6 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 mb-2">
              <span>Interactive Workspace</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Resume Tailor & ATS Analysis
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Upload your candidate resume on the left and paste the target job description to run real-time AI optimization.
            </p>
          </div>

          {/* Responsive Mobile View Mode Selector (Shown on mobile when result is present) */}
          {result && !isLoading && (
            <div className="lg:hidden no-print mb-5 p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 flex items-center justify-between border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <button
                type="button"
                onClick={() => setMobileTab("inputs")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  mobileTab === "inputs"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Edit Inputs & JD
              </button>
              <button
                type="button"
                onClick={() => setMobileTab("results")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mobileTab === "results"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <span>View Resume</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {result.match_score}% Match
                </span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Inputs (5 cols on desktop, sticky sidebar) */}
            <div
              className={`no-print lg:col-span-5 space-y-6 lg:sticky lg:top-24 lg:self-start ${
                result && !isLoading && mobileTab === "results" ? "hidden lg:block" : "block"
              }`}
            >
              <form onSubmit={handleSubmit} className="border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
                <ResumeUploader
                  file={file}
                  onFileSelect={(f) => {
                    setFile(f);
                    if (error) setError(null);
                  }}
                />

                <JobDescriptionInput
                  value={jobDescription}
                  onChange={(val) => {
                    setJobDescription(val);
                    if (error) setError(null);
                  }}
                />

                {/* Submit Button (ResumeFit Solid Indigo) */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || !file || jobDescription.trim().length < 30}
                    className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                      isLoading || !file || jobDescription.trim().length < 30
                        ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>{loadingStage || "Tailoring Resume..."}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Tailor Resume with AI</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>

                  {result && !isLoading && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full mt-2.5 py-2 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Reset & Upload Another
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* RIGHT COLUMN: Results / Preview (7 cols on desktop) */}
            <div
              className={`lg:col-span-7 ${
                result && !isLoading && mobileTab === "inputs" ? "hidden lg:block" : "block"
              }`}
            >
              {isLoading ? (
                /* Loading State Card with Real-time SSE Token Streaming */
                <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center animate-pulse">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Analyzing & Tailoring Resume...
                    </h3>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                      {loadingStage || "Communicating with AI..."}
                    </p>
                  </div>
                  <div className="max-w-xs mx-auto w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full w-2/3 animate-[pulse_1.5s_infinite]"></div>
                  </div>

                  {/* Real-time SSE Token Stream Visualizer */}
                  {liveStreamPreview && (
                    <div className="mt-5 p-4 rounded-2xl bg-slate-950 text-left font-mono text-[11px] border border-slate-800 shadow-inner max-w-lg mx-auto overflow-hidden transition-all">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          Live SSE Token Stream
                        </span>
                        <span className="text-slate-500">{streamedTokenCount} chunks received</span>
                      </div>
                      <div className="line-clamp-4 break-all text-slate-300 leading-relaxed">
                        {liveStreamPreview}
                        <span className="inline-block w-1.5 h-3.5 bg-indigo-400 animate-pulse ml-0.5 align-middle" />
                      </div>
                    </div>
                  )}
                </div>
              ) : result ? (
                /* Output Display with Scores & Tabs */
                <OutputDisplay data={result} />
              ) : (
                /* Idle Empty State */
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center bg-white/50 dark:bg-slate-900/40">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-4">
                    <FileSearch className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    No Tailored Resume Yet
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    Upload your candidate resume on the left and paste the target job description. The AI will optimize it to industry ATS standards.
                  </p>

                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60 shadow-2xs">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase">Step 1</span>
                      <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">ATS Match Score</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">Calculates keyword alignment percentage</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60 shadow-2xs">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase">Step 2</span>
                      <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">Action-Verb Bullets</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">Rewrites bullets with high-impact metrics</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60 shadow-2xs">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase">Step 3</span>
                      <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">1-Page Vector PDF</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">Direct 1-click download with preserved links</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Why You Should Use ResumeFit Section */}
        <section className="no-print pt-10 border-t border-slate-200/80 dark:border-slate-800/80 text-center">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Why You Should Use ResumeFit
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Most resumes are filtered out by ATS before a human recruiter ever sees them. ResumeFit helps you optimize for both ATS parsers and hiring managers.
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <span className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 block mb-1">
                99%
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">ATS-Friendly Layout</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Single-column hierarchy guaranteed parseable by Workday, Greenhouse & Lever.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <span className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 block mb-1">
                70%+
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Higher Keyword Match</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Bullet points tailored with strong action verbs and quantified impact metrics.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <span className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 block mb-1">
                100%
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Direct Vector PDF</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Clean 1-click download of selectable, crisp 1-page A4 PDF with clickable URLs.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer with Made By & Piyush Varshney's Social Links */}
      <footer className="no-print border-t border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0b0e14]/90 py-8 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span>Made with ❤️ by</span>
            <span className="font-bold text-slate-900 dark:text-white">Piyush Varshney</span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2.5">
            <a
              href="https://piyushvarshney.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-800 transition-colors shadow-2xs"
              title="Portfolio Website"
            >
              <Globe className="w-4 h-4" />
            </a>

            <a
              href="https://github.com/varshneypiyush19"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-800 transition-colors shadow-2xs"
              title="GitHub Profile"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>

            <a
              href="http://www.linkedin.com/in/piyushvarshney19"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-800 transition-colors shadow-2xs"
              title="LinkedIn Profile"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>

            <a
              href="https://leetcode.com/u/varshneypiyush2004"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-800 transition-colors shadow-2xs"
              title="LeetCode Profile"
            >
              <Code2 className="w-4 h-4" />
            </a>
          </div>

          <div className="text-xs text-slate-400 dark:text-slate-500">
            ResumeFit • Next.js & FastAPI • All rights reserved
          </div>
        </div>
      </footer>
    </div>
  );
}
