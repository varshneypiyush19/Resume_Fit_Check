"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Sun, Moon } from "lucide-react";
import { checkBackendHealth } from "@/lib/api";

export default function Header() {
  const [isBackendReady, setIsBackendReady] = useState<boolean>(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Sync initial theme
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    const checkHealth = async () => {
      const ready = await checkBackendHealth();
      setIsBackendReady(ready);
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const scrollToWorkspace = () => {
    const el = document.getElementById("workspace");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0b0e14]/95 backdrop-blur-md sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* ResumeFit Brand Logo & Name */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0 font-black text-base">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 stroke-current stroke-[2.5]" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Resume<span className="text-indigo-600 dark:text-indigo-400 font-extrabold">Fit</span>
              </span>
              <span className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60">
                ATS Optimizer
              </span>
            </div>
          </div>
        </div>

        {/* Right Controls: Scroll to Test, Theme Switcher & Status */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
          {/* Scroll to Workspace CTA */}
          <button
            type="button"
            onClick={scrollToWorkspace}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100/80 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Check Resume</span>
          </button>

          {/* Status Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800">
            <span className={`w-2 h-2 rounded-full ${isBackendReady ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
            <span className="text-[11px] font-medium">{isBackendReady ? "AI Engine Ready" : "Offline"}</span>
          </div>

          {/* Clean Theme Toggle Button (Light / Dark) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-all text-xs font-medium cursor-pointer shadow-2xs"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            aria-label="Toggle dark/light theme"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden xs:inline">Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
