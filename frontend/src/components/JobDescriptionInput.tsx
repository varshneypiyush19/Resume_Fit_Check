"use client";

import React from "react";
import { Sparkles, Trash2, AlertCircle } from "lucide-react";

interface JobDescriptionInputProps {
  value: string;
  onChange: (val: string) => void;
  error?: string | null;
}

const SAMPLE_JD = `Role: Senior Full Stack Developer
Company: TechFlow Innovations
Requirements:
- 3+ years experience with Next.js, React, and modern TypeScript.
- Strong Python backend experience with FastAPI or Flask building scalable REST APIs.
- Experience with AI/LLM integrations, prompt engineering, and structured outputs.
- Familiarity with cloud deployments (Vercel, Render, AWS, Docker).
- Excellent problem-solving skills, automated testing, and ATS optimization focus.`;

export default function JobDescriptionInput({
  value,
  onChange,
  error,
}: JobDescriptionInputProps) {
  const charCount = value.trim().length;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          2. Target Job Description <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={() => onChange(SAMPLE_JD)}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
        >
          <Sparkles className="w-3 h-3" />
          Load Sample JD
        </button>
      </div>

      <div className="relative">
        <textarea
          rows={7}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste the complete job description here (e.g., responsibilities, qualifications, tech stack requirements)..."
          className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/70 p-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all resize-y"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Clear text"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mt-1.5 px-1">
        {error ? (
          <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </p>
        ) : (
          <span className="text-xs text-slate-400">Minimum 30 characters</span>
        )}

        <span
          className={`text-xs ${
            charCount > 0 && charCount < 30
              ? "text-amber-500 font-medium"
              : "text-slate-400"
          }`}
        >
          {charCount} characters
        </span>
      </div>
    </div>
  );
}
