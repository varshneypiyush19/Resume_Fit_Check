"use client";

import React from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface ScoreCardProps {
  score: number;
  analysis: string;
  matchedCount: number;
  missingCount: number;
}

export default function ScoreCard({
  score,
  analysis,
  matchedCount,
  missingCount,
}: ScoreCardProps) {
  // Determine color theme based on score
  const getScoreTheme = (val: number) => {
    if (val >= 80) {
      return {
        text: "text-emerald-600 dark:text-emerald-400",
        ring: "border-emerald-500 dark:border-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-950/40",
        border: "border-emerald-200 dark:border-emerald-800",
        label: "Strong Match",
      };
    }
    if (val >= 60) {
      return {
        text: "text-amber-600 dark:text-amber-400",
        ring: "border-amber-500 dark:border-amber-400",
        bg: "bg-amber-50 dark:bg-amber-950/40",
        border: "border-amber-200 dark:border-amber-800",
        label: "Moderate Match",
      };
    }
    return {
      text: "text-rose-600 dark:text-rose-400",
      ring: "border-rose-500 dark:border-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/40",
      border: "border-rose-200 dark:border-rose-800",
      label: "Needs Improvement",
    };
  };

  const theme = getScoreTheme(score);

  return (
    <div className="border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        {/* Left: Cake-style Circular Score Gauge + Assessment Summary */}
        <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
          {/* Circular Score Gauge (Cake style) */}
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full ${theme.ring} border-[3.5px] bg-slate-50/50 dark:bg-slate-950/40 flex flex-col items-center justify-center p-1 shrink-0 shadow-2xs`}
          >
            <span className={`text-xl sm:text-2xl font-black tracking-tight leading-none ${theme.text}`}>
              {score}
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              / 100
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={`text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border ${theme.bg} ${theme.border} ${theme.text}`}
              >
                {theme.label}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">ATS Match Score</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              {analysis}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Tip: Resumes with a score of 75+ are significantly more likely to pass recruiter screening.
            </p>
          </div>
        </div>

        {/* Right: Quick Stats Pills */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 text-xs font-semibold shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{matchedCount} Matched</span>
          </div>

          <div className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60 text-xs font-semibold shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{missingCount} Missing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
