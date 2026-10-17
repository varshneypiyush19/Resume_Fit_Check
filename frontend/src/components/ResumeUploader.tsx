"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, FileText, X, AlertCircle } from "lucide-react";

interface ResumeUploaderProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  error?: string | null;
}

export default function ResumeUploader({
  file,
  onFileSelect,
  error,
}: ResumeUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const selectedFile = files[0];
    const extension = selectedFile.name.toLowerCase();

    if (!extension.endsWith(".pdf") && !extension.endsWith(".docx")) {
      setLocalError("Unsupported format. Only PDF (.pdf) and Word (.docx) documents are supported.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setLocalError("File size exceeds 5MB limit. Please upload a smaller document.");
      return;
    }

    setLocalError(null);
    onFileSelect(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
        1. Upload Candidate Resume <span className="text-red-500">*</span>
      </label>

      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[0.99]"
              : "border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/60 dark:bg-slate-900/40"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <div className="w-12 h-12 rounded-xl bg-indigo-100/80 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>

          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Click to upload or drag & drop
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Supports PDF or DOCX (Max 5MB)
          </p>
        </div>
      ) : (
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {file.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {formatFileSize(file.size)}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {file.name.split(".").pop()}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setLocalError(null);
              onFileSelect(null);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
            title="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {(error || localError) && (
        <div className="mt-2.5 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          <span className="text-xs text-red-700 dark:text-red-300 font-medium">
            {error || localError}
          </span>
        </div>
      )}
    </div>
  );
}
