"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import ResumeUploader from "@/components/ResumeUploader";
import JobDescriptionInput from "@/components/JobDescriptionInput";
import OutputDisplay from "@/components/OutputDisplay";
import { tailorResume } from "@/lib/api";
import { TailoredResumeResponse } from "@/types/resume";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  FileSearch,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TailoredResumeResponse | null>(null);

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
    setLoadingStage("Parsing resume document...");

    // Simulated progress steps for great UX
    const stage1 = setTimeout(() => {
      setLoadingStage("Analyzing Job Description keywords...");
    }, 1500);

    const stage2 = setTimeout(() => {
      setLoadingStage("AI Tailoring summary, skills, and experience bullets...");
    }, 3200);

    try {
      const responseData = await tailorResume(file, jobDescription);
      setResult(responseData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      clearTimeout(stage1);
      clearTimeout(stage2);
      setIsLoading(false);
      setLoadingStage("");
    }
  };

  const handleReset = () => {
    setFile(null);
    setJobDescription("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intro Banner */}
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Tailor Candidate Resumes to Any Job
          </h2>
          <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
            Upload a resume in PDF or DOCX format, paste the target Job Description, and let our LLM rewrite the summary, highlight matching skills, and optimize experience bullets.
          </p>
        </div>

        {/* Global Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">
                Customization Error
              </h4>
              <p className="text-xs text-red-700 dark:text-red-400 mt-0.5 leading-relaxed">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Main 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Inputs (5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handleSubmit} className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm space-y-6">
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

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !file || jobDescription.trim().length < 30}
                  className={`w-full py-3.5 px-6 rounded-2xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md ${
                    isLoading || !file || jobDescription.trim().length < 30
                      ? "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed shadow-none"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
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
                    className="w-full mt-2.5 py-2 px-4 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset & Upload Another
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: Results / Preview (7 cols on desktop) */}
          <div className="lg:col-span-7">
            {isLoading ? (
              /* Loading State Card */
              <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm text-center py-20 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center animate-pulse">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Analyzing & Tailoring Resume...
                  </h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                    {loadingStage || "Communicating with AI..."}
                  </p>
                </div>
                <div className="max-w-xs mx-auto w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-2/3 animate-[pulse_1.5s_infinite]"></div>
                </div>
              </div>
            ) : result ? (
              /* Output Display with Scores & Tabs */
              <OutputDisplay data={result} />
            ) : (
              /* Idle Empty State */
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-8 sm:p-12 text-center bg-white/40 dark:bg-gray-900/30">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 mx-auto flex items-center justify-center mb-4">
                  <FileSearch className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  No Tailored Resume Yet
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  Upload your resume on the left and paste a job description. The AI will generate a tailored version here.
                </p>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-xs">
                    <span className="text-[10px] font-bold text-blue-600 uppercase">Feature 1</span>
                    <h5 className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1">ATS Match Score</h5>
                    <p className="text-[11px] text-gray-500 mt-0.5">Calculates keyword alignment percentage</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-xs">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">Feature 2</span>
                    <h5 className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1">Diff View</h5>
                    <p className="text-[11px] text-gray-500 mt-0.5">Compares original vs tailored bullets</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-xs">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Feature 3</span>
                    <h5 className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1">Instant Export</h5>
                    <p className="text-[11px] text-gray-500 mt-0.5">Copy, export to text, or print to PDF</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

