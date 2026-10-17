import { Sparkles,  CheckCircle2, XCircle } from "lucide-react";

export default function Header() {
  const Backend = {
    status: 200
  };
  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Resume Tailor AI
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Full-Stack LLM
              </span>
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Align your resume to any Job Description in seconds
            </p>
          </div>
        </div>

        {Backend.status === 200 ?<div className="flex items-center space-x-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Backend Ready
          </span>
        </div>:
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-full border border-red-200 dark:border-red-800">
              <XCircle className="w-3.5 h-3.5" />
              Backend Not Ready
            </span>
          </div>
        }
      </div>
    </header>
  );
}
