"use client";

import React, { useState } from "react";
import { Download, Printer, Copy, Check, FileText } from "lucide-react";
import { TailoredResumeDocument } from "@/types/resume";

interface ResumeDocumentPreviewProps {
  documentData: TailoredResumeDocument;
}

export default function ResumeDocumentPreview({
  documentData,
}: ResumeDocumentPreviewProps) {
  const [copied, setCopied] = useState(false);

  // Compute dynamic filename: username_jobtitle.pdf
  const getSafeFileName = (ext: string = "pdf") => {
    const rawName = documentData.contact.name || "resume";
    const rawTitle = documentData.target_job_title || "job";

    const safeName = rawName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");

    const safeTitle = rawTitle
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");

    return `${safeName}_${safeTitle}.${ext}`;
  };

  const handlePrintPdf = () => {
    const previousTitle = document.title;
    // Browsers use the webpage document title as the default filename when printing to PDF!
    document.title = getSafeFileName("pdf");
    window.print();
    setTimeout(() => {
      document.title = previousTitle;
    }, 1000);
  };

  const generateFullText = () => {
    let text = `${documentData.contact.name.toUpperCase()}\n`;
    if (documentData.contact.title) text += `${documentData.contact.title}\n`;
    const contactParts = [
      documentData.contact.phone,
      documentData.contact.email,
      ...(documentData.contact.links || []),
    ].filter(Boolean);
    text += `${contactParts.join(" | ")}\n\n`;

    text += `SUMMARY\n${documentData.summary}\n\n`;

    text += `WORK EXPERIENCE\n`;
    documentData.experience.forEach((exp) => {
      text += `${exp.role} | ${exp.company}\t${exp.location || ""}\t${exp.dates || ""}\n`;
      exp.tailored_bullets.forEach((b) => {
        text += `• ${b}\n`;
      });
      text += `\n`;
    });

    if (documentData.projects && documentData.projects.length > 0) {
      text += `PROJECTS\n`;
      documentData.projects.forEach((proj) => {
        text += `${proj.name} ${proj.tech_stack ? `(${proj.tech_stack})` : ""}\n`;
        proj.bullets.forEach((b) => {
          text += `• ${b}\n`;
        });
        text += `\n`;
      });
    }

    if (documentData.skills_categories && documentData.skills_categories.length > 0) {
      text += `TECHNICAL SKILLS\n`;
      documentData.skills_categories.forEach((cat) => {
        text += `${cat.category}: ${cat.skills.join(", ")}\n`;
      });
      text += `\n`;
    }

    if (documentData.education && documentData.education.length > 0) {
      text += `EDUCATION\n`;
      documentData.education.forEach((edu) => {
        text += `${edu.institution}\t${edu.location || ""}\n${edu.degree}\t${edu.dates || ""}\n`;
        if (edu.details) text += `${edu.details}\n`;
      });
      text += `\n`;
    }

    if (documentData.achievements && documentData.achievements.length > 0) {
      text += `ACHIEVEMENTS & EXTRACURRICULAR ACTIVITIES\n`;
      documentData.achievements.forEach((ach) => {
        text += `• ${ach}\n`;
      });
    }

    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateFullText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([generateFullText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = getSafeFileName("txt");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const targetFilename = getSafeFileName("pdf");

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Generated Document
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white font-mono flex items-center gap-1.5 mt-0.5">
            <FileText className="w-4 h-4 text-blue-600" />
            {targetFilename}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadTxt}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.TXT</span>
          </button>

          <button
            type="button"
            onClick={handlePrintPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            title={`Downloads ${targetFilename}`}
          >
            <Printer className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Styled A4 Resume Sheet */}
      <div className="overflow-x-auto pb-4">
        <div className="resume-sheet mx-auto bg-white text-gray-900 p-8 sm:p-12 rounded-2xl shadow-lg border border-gray-200 max-w-4xl text-left font-sans text-xs leading-normal">
          {/* Header */}
          <div className="text-center pb-4 border-b border-gray-300">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-gray-900">
              {documentData.contact.name}
            </h1>
            {documentData.contact.title && (
              <p className="text-xs font-semibold text-gray-700 mt-0.5">
                {documentData.contact.title}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-gray-600 mt-1.5">
              {documentData.contact.phone && <span>{documentData.contact.phone}</span>}
              {documentData.contact.email && (
                <>
                  <span>|</span>
                  <a
                    href={`mailto:${documentData.contact.email}`}
                    className="hover:underline text-blue-700"
                  >
                    {documentData.contact.email}
                  </a>
                </>
              )}
              {documentData.contact.links &&
                documentData.contact.links.map((link, idx) => (
                  <React.Fragment key={idx}>
                    <span>|</span>
                    <span className="font-medium text-gray-800">{link}</span>
                  </React.Fragment>
                ))}
            </div>
          </div>

          {/* Section: Summary */}
          {documentData.summary && (
            <div className="mt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 mb-1.5">
                Summary
              </h2>
              <p className="text-[11.5px] text-gray-800 leading-relaxed text-justify">
                {documentData.summary}
              </p>
            </div>
          )}

          {/* Section: Work Experience */}
          {documentData.experience && documentData.experience.length > 0 && (
            <div className="mt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 mb-2">
                Work Experience
              </h2>
              <div className="space-y-3">
                {documentData.experience.map((exp, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline font-bold text-[11.5px] text-gray-900">
                      <span>
                        {exp.role} <span className="font-normal text-gray-700">| {exp.company}</span>
                      </span>
                      <span className="text-[11px] text-gray-600 font-normal">
                        {exp.location ? `${exp.location}  •  ` : ""}
                        {exp.dates}
                      </span>
                    </div>

                    <ul className="list-disc ml-4 mt-1 space-y-0.5 text-[11px] text-gray-800">
                      {exp.tailored_bullets.map((b, bIdx) => (
                        <li key={bIdx} className="leading-snug">
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Projects */}
          {documentData.projects && documentData.projects.length > 0 && (
            <div className="mt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 mb-2">
                Projects
              </h2>
              <div className="space-y-3">
                {documentData.projects.map((proj, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline font-bold text-[11.5px] text-gray-900">
                      <span>
                        {proj.name}
                        {proj.tech_stack && (
                          <span className="font-normal text-gray-600 text-[11px]">
                            {" "}
                            | {proj.tech_stack}
                          </span>
                        )}
                      </span>
                      {proj.link && (
                        <span className="text-[10.5px] font-medium text-blue-700">
                          {proj.link}
                        </span>
                      )}
                    </div>
                    <ul className="list-disc ml-4 mt-1 space-y-0.5 text-[11px] text-gray-800">
                      {proj.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="leading-snug">
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Technical Skills */}
          {documentData.skills_categories && documentData.skills_categories.length > 0 && (
            <div className="mt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 mb-1.5">
                Technical Skills
              </h2>
              <div className="space-y-1 text-[11px] text-gray-800">
                {documentData.skills_categories.map((cat, idx) => (
                  <div key={idx} className="flex flex-wrap">
                    <span className="font-bold w-32 shrink-0">{cat.category}:</span>
                    <span className="flex-1">{cat.skills.join(", ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Education */}
          {documentData.education && documentData.education.length > 0 && (
            <div className="mt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 mb-2">
                Education
              </h2>
              <div className="space-y-2">
                {documentData.education.map((edu, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline font-bold text-[11.5px] text-gray-900">
                      <span>{edu.institution}</span>
                      <span className="text-[11px] font-normal text-gray-600">{edu.location}</span>
                    </div>
                    <div className="flex justify-between items-baseline text-[11px] text-gray-800">
                      <span>{edu.degree} {edu.details ? `( ${edu.details} )` : ""}</span>
                      <span className="text-gray-600">{edu.dates}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Achievements */}
          {documentData.achievements && documentData.achievements.length > 0 && (
            <div className="mt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 mb-1.5">
                Achievements & Extracurricular Activities
              </h2>
              <ul className="list-disc ml-4 space-y-0.5 text-[11px] text-gray-800">
                {documentData.achievements.map((ach, idx) => (
                  <li key={idx} className="leading-snug">
                    {ach}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
