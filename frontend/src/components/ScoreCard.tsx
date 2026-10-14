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
        bg: "bg-emerald-50 dark:bg-emerald-950/40",
        border: "border-emerald-200 dark:border-emerald-800",
        label: "Strong Match",
      };
    }
    if (val >= 60) {
      return {
        text: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-950/40",
        border: "border-amber-200 dark:border-amber-800",
        label: "Moderate Match",
      };
    }
    return {
      text: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/40",
      border: "border-rose-200 dark:border-rose-800",
      label: "Needs Improvement",
    };
  };

  const theme = getScoreTheme(score);

  return (
    <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Score Ring / Badge */}
        <div className="flex items-center gap-4">
          <div
            className={`w-18 h-18 rounded-2xl ${theme.bg} ${theme.border} border-2 flex flex-col items-center justify-center p-2`}
          >
            <span className={`text-2xl font-black ${theme.text}`}>
              {score}%
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Match
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${theme.bg} ${theme.text}`}
              >
                {theme.label}
              </span>
              <span className="text-xs text-gray-400">ATS Assessment</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-md leading-relaxed">
              {analysis}
            </p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{matchedCount} Matched</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{missingCount} Missing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
