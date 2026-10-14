"use client";

import React, { useState } from "react";
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Lightbulb,
  Check,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { TailoredResumeResponse } from "@/types/resume";
import ScoreCard from "./ScoreCard";
import ResumeDocumentPreview from "./ResumeDocumentPreview";

interface OutputDisplayProps {
  data: TailoredResumeResponse;
}

export default function OutputDisplay({ data }: OutputDisplayProps) {
  const [viewMode, setViewMode] = useState<"document" | "analytics">("document");
  const [activeTab, setActiveTab] = useState<"summary" | "skills" | "experience" | "tips">("summary");

  return (
    <div className="space-y-5">
      {/* 1. Score Card Header */}
      <div className="no-print">
        <ScoreCard
          score={data.match_score}
          analysis={data.score_analysis}
          matchedCount={data.matched_skills.length}
          missingCount={data.missing_keywords.length}
        />
      </div>

      {/* 2. Mode Selector Bar (Full Document vs Analytics) */}
      <div className="no-print flex items-center justify-between p-1.5 rounded-2xl bg-gray-200/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60">
        <button
          type="button"
          onClick={() => setViewMode("document")}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            viewMode === "document"
              ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Full Tailored Resume (Document View)</span>
          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            A4 Ready
          </span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode("analytics")}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            viewMode === "analytics"
              ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>ATS Keyword & Diff Analytics</span>
        </button>
      </div>

      {/* 3. Render Either the Full Document or the Analytics Tabs */}
      {viewMode === "document" ? (
        <ResumeDocumentPreview documentData={data.tailored_document} />
      ) : (
        <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
          {/* Sub-tabs */}
          <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center space-x-2 bg-gray-50/50 dark:bg-gray-800/40">
            <button
              type="button"
              onClick={() => setActiveTab("summary")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "summary"
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Summary
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("skills")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "skills"
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Skills
              <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900 text-[10px] flex items-center justify-center font-bold text-blue-700 dark:text-blue-300">
                {data.matched_skills.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("experience")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "experience"
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Experience
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                Diff View
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("tips")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "tips"
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Recommendations
            </button>
          </div>

          <div className="p-5">
            {/* SUMMARY TAB */}
            {activeTab === "summary" && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  Tailored Professional Summary
                </h4>
                <div className="p-4 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                  {data.tailored_document.summary}
                </div>
              </div>
            )}

            {/* SKILLS TAB */}
            {activeTab === "skills" && (
              <div className="space-y-5">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2.5 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Matched Skills ({data.matched_skills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.matched_skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      >
                        <Check className="w-3 h-3" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {data.missing_keywords.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2.5 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Missing Keywords to Consider ({data.missing_keywords.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {data.missing_keywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                        >
                          + {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* EXPERIENCE DIFF TAB */}
            {activeTab === "experience" && (
              <div className="space-y-5">
                {data.tailored_document.experience.map((exp, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-gray-50/30 dark:bg-gray-800/20 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-blue-600" />
                        {exp.role} {exp.company && <span className="text-gray-500 font-normal">at {exp.company}</span>}
                      </h4>
                      <span className="text-xs text-gray-500">{exp.dates}</span>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Tailored Bullets (ATS Optimized):
                      </span>
                      <ul className="mt-1.5 space-y-1.5">
                        {exp.tailored_bullets.map((b, bIdx) => (
                          <li
                            key={bIdx}
                            className="text-xs text-gray-800 dark:text-gray-200 flex items-start gap-2 bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/30"
                          >
                            <span className="text-emerald-600 font-bold shrink-0">✓</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {exp.original_bullets && exp.original_bullets.length > 0 && (
                      <details className="mt-2 text-xs text-gray-500">
                        <summary className="cursor-pointer font-medium hover:text-gray-700 dark:hover:text-gray-300">
                          View Original Bullets ({exp.original_bullets.length})
                        </summary>
                        <ul className="mt-2 space-y-1 pl-4 list-disc text-gray-400">
                          {exp.original_bullets.map((ob, obIdx) => (
                            <li key={obIdx}>{ob}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TIPS TAB */}
            {activeTab === "tips" && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Career Coach Recommendations
                </h4>
                <ul className="space-y-2">
                  {data.key_recommendations.map((tip, idx) => (
                    <li
                      key={idx}
                      className="p-3 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs text-gray-800 dark:text-gray-200 flex items-start gap-2"
                    >
                      <span className="font-bold text-indigo-600">{idx + 1}.</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

