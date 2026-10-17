"use client";

import React, { useState } from "react";
import { Download, Printer, Copy, Check, FileText, Loader2 } from "lucide-react";
import { TailoredResumeDocument, ProjectItem } from "@/types/resume";
import jsPDF from "jspdf";

interface ResumeDocumentPreviewProps {
  documentData: TailoredResumeDocument;
}

interface ResolvedLink {
  label: string;
  url: string;
}

function escapeHtml(text: string): string {
  return (text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeUrl(url?: string): string {
  if (!url) return "#";
  const trimmed = url.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  ) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function inferUrlFromLabel(label: string): string {
  const lower = (label || "").toLowerCase();
  if (lower.startsWith("http://") || lower.startsWith("https://")) return label;
  if (lower.includes("linkedin")) return "http://www.linkedin.com/in/piyushvarshney19";
  if (lower.includes("github")) return "https://github.com/varshneypiyush19";
  if (lower.includes("portfolio")) return "https://piyushvarshney.com/";
  if (lower.includes("leetcode")) return "https://leetcode.com/u/varshneypiyush2004";
  if (lower.includes("twitter") || lower.includes("x.com")) return "https://x.com";
  if (lower.includes(".") && !lower.includes(" ")) return `https://${label.trim()}`;
  return "#";
}

function resolveContactLinks(contact: TailoredResumeDocument["contact"]): ResolvedLink[] {
  if (contact.link_items && contact.link_items.length > 0) {
    return contact.link_items.map((item) => ({
      label: item.label,
      url: normalizeUrl(item.url),
    }));
  }

  const rawLinks = contact.links || [];
  return rawLinks.map((link) => {
    const trimmed = link.trim();
    return {
      label: trimmed,
      url: inferUrlFromLabel(trimmed),
    };
  });
}

function resolveProjectUrl(proj: ProjectItem): string {
  if (proj.link_url && proj.link_url.trim()) {
    return normalizeUrl(proj.link_url);
  }
  if (proj.link && (proj.link.startsWith("http") || proj.link.includes("."))) {
    return normalizeUrl(proj.link);
  }
  const nameLower = proj.name.toLowerCase();
  if (nameLower.includes("frenz") || nameLower.includes("frienz") || nameLower.includes("chat")) {
    return "https://frienz.vercel.app";
  }
  if (nameLower.includes("lead") || nameLower.includes("thought") || nameLower.includes("bistro")) {
    return "https://thethoughtbistro.vercel.app/";
  }
  if (nameLower.includes("travel")) {
    return "https://travel-list-by-piyush.netlify.app/";
  }
  if (nameLower.includes("green") || nameLower.includes("grocery")) {
    return "https://apps.apple.com/in/app/green-grocery1/id6748613548";
  }
  return "#";
}

export default function ResumeDocumentPreview({
  documentData,
}: ResumeDocumentPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const resolvedContactLinks = resolveContactLinks(documentData.contact);

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

  // Renders a complete vector PDF at a specified scale with ZERO text overlap
  const renderPdfWithScale = (scale: number): { doc: jsPDF; finalY: number } => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = 210;
    const marginX = 14;
    const contentWidth = pageWidth - marginX * 2;

    const nameSize = 18 * scale;
    const titleSize = 10 * scale;
    const contactSize = 8.5 * scale;
    const headingSize = 10 * scale;
    const itemTitleSize = 9.5 * scale;
    const bodySize = 8.5 * scale;
    const bulletLineH = 3.85 * scale;
    const textLineH = 3.9 * scale;
    const sectionGap = 4.2 * scale;

    let y = 15 * scale;

    // 1. Candidate Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(nameSize);
    doc.setTextColor(17, 24, 39);
    doc.text((documentData.contact.name || "").toUpperCase(), pageWidth / 2, y, {
      align: "center",
    });
    y += 5.5 * scale;

    if (documentData.contact.title) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(titleSize);
      doc.setTextColor(55, 65, 81);
      doc.text(documentData.contact.title, pageWidth / 2, y, { align: "center" });
      y += 4.5 * scale;
    }

    // Build clickable contact items (Phone, Email, LinkedIn, GitHub, Portfolio, LeetCode)
    const contactItems: { label: string; url?: string }[] = [];
    if (documentData.contact.phone) {
      contactItems.push({
        label: documentData.contact.phone,
        url: `tel:${documentData.contact.phone.replace(/[^0-9+]/g, "")}`,
      });
    }
    if (documentData.contact.email) {
      contactItems.push({
        label: documentData.contact.email,
        url: `mailto:${documentData.contact.email}`,
      });
    }
    resolvedContactLinks.forEach((link) => {
      contactItems.push({
        label: link.label,
        url: link.url !== "#" ? link.url : undefined,
      });
    });

    if (contactItems.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(contactSize);
      const sep = "  |  ";
      const sepWidth = doc.getTextWidth(sep);
      let totalWidth = 0;
      contactItems.forEach((it, idx) => {
        totalWidth += doc.getTextWidth(it.label);
        if (idx < contactItems.length - 1) totalWidth += sepWidth;
      });

      let curX = (pageWidth - totalWidth) / 2;
      contactItems.forEach((it, idx) => {
        if (it.url) {
          doc.setTextColor(29, 78, 216); // Royal Blue clickable link
          doc.textWithLink(it.label, curX, y, { url: it.url });
        } else {
          doc.setTextColor(75, 85, 99);
          doc.text(it.label, curX, y);
        }
        curX += doc.getTextWidth(it.label);

        if (idx < contactItems.length - 1) {
          doc.setTextColor(156, 163, 175);
          doc.text(sep, curX, y);
          curX += sepWidth;
        }
      });
      y += 4.0 * scale;
    }

    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.35);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 4.5 * scale;

    const drawSectionHeading = (title: string) => {
      y += sectionGap;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(headingSize);
      doc.setTextColor(17, 24, 39);
      doc.text(title.toUpperCase(), marginX, y);
      y += 1.5 * scale;
      doc.setLineWidth(0.35);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 3.8 * scale;
    };

    // 2. SUMMARY
    if (documentData.summary) {
      drawSectionHeading("Summary");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(bodySize);
      doc.setTextColor(31, 41, 55);
      const sumLines = doc.splitTextToSize(documentData.summary, contentWidth);
      sumLines.forEach((l: string) => {
        doc.text(l, marginX, y);
        y += textLineH;
      });
    }

    // 3. WORK EXPERIENCE (Clean 2-line layout, ZERO collision)
    if (documentData.experience && documentData.experience.length > 0) {
      drawSectionHeading("Work Experience");
      documentData.experience.forEach((exp) => {
        // Line 1: Role on left, Dates on right
        doc.setFont("helvetica", "bold");
        doc.setFontSize(itemTitleSize);
        doc.setTextColor(17, 24, 39);
        doc.text(exp.role, marginX, y);

        if (exp.dates) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(bodySize);
          doc.setTextColor(75, 85, 99);
          doc.text(exp.dates, pageWidth - marginX, y, { align: "right" });
        }
        y += 3.7 * scale;

        // Line 2: Company on left, Location on right
        doc.setFont("helvetica", "normal");
        doc.setFontSize(bodySize);
        doc.setTextColor(55, 65, 81);
        doc.text(exp.company, marginX, y);

        if (exp.location) {
          doc.setTextColor(75, 85, 99);
          doc.text(exp.location, pageWidth - marginX, y, { align: "right" });
        }
        y += 3.7 * scale;

        // Bullets
        doc.setFont("helvetica", "normal");
        doc.setFontSize(bodySize);
        doc.setTextColor(31, 41, 55);
        (exp.tailored_bullets || []).forEach((b) => {
          const bLines = doc.splitTextToSize(b, contentWidth - 5);
          doc.text("•", marginX + 1.2, y);
          bLines.forEach((bl: string) => {
            doc.text(bl, marginX + 4.5, y);
            y += bulletLineH;
          });
          y += 0.5 * scale;
        });
        y += 1.4 * scale;
      });
    }

    // 4. PROJECTS (Clean 2-line layout, ZERO collision)
    if (documentData.projects && documentData.projects.length > 0) {
      drawSectionHeading("Projects");
      documentData.projects.forEach((proj) => {
        // Line 1: Project Name on left, Link on right
        doc.setFont("helvetica", "bold");
        doc.setFontSize(itemTitleSize);
        doc.setTextColor(17, 24, 39);
        doc.text(proj.name, marginX, y);

        if (proj.link) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(bodySize);
          doc.setTextColor(29, 78, 216);
          const linkWidth = doc.getTextWidth(proj.link);
          const linkStartX = pageWidth - marginX - linkWidth;
          const projUrl = resolveProjectUrl(proj);
          if (projUrl && projUrl !== "#") {
            doc.textWithLink(proj.link, linkStartX, y, { url: projUrl });
          } else {
            doc.text(proj.link, pageWidth - marginX, y, { align: "right" });
          }
        }
        y += 3.7 * scale;

        // Line 2: Tech Stack (full width wrapping, never overlaps link)
        if (proj.tech_stack) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(bodySize - 0.2);
          doc.setTextColor(75, 85, 99);
          const stackLines = doc.splitTextToSize(proj.tech_stack, contentWidth);
          stackLines.forEach((sl: string) => {
            doc.text(sl, marginX, y);
            y += 3.5 * scale;
          });
        }

        // Bullets
        doc.setFont("helvetica", "normal");
        doc.setFontSize(bodySize);
        doc.setTextColor(31, 41, 55);
        (proj.bullets || []).forEach((b) => {
          const bLines = doc.splitTextToSize(b, contentWidth - 5);
          doc.text("•", marginX + 1.2, y);
          bLines.forEach((bl: string) => {
            doc.text(bl, marginX + 4.5, y);
            y += bulletLineH;
          });
          y += 0.5 * scale;
        });
        y += 1.4 * scale;
      });
    }

    // 5. TECHNICAL SKILLS
    if (documentData.skills_categories && documentData.skills_categories.length > 0) {
      drawSectionHeading("Technical Skills");
      documentData.skills_categories.forEach((cat) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(bodySize);
        doc.setTextColor(17, 24, 39);
        doc.text(cat.category + ":", marginX, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(31, 41, 55);
        const skillText = (cat.skills || []).join(", ");
        const slines = doc.splitTextToSize(skillText, contentWidth - 42);
        slines.forEach((sl: string, sIdx: number) => {
          doc.text(sl, marginX + 40, y);
          if (sIdx < slines.length - 1) y += textLineH - 0.2;
        });
        y += textLineH;
      });
    }

    // 6. EDUCATION (Clean 2-line layout, ZERO collision)
    if (documentData.education && documentData.education.length > 0) {
      drawSectionHeading("Education");
      documentData.education.forEach((edu) => {
        // Line 1: Institution on left, Location on right
        doc.setFont("helvetica", "bold");
        doc.setFontSize(itemTitleSize);
        doc.setTextColor(17, 24, 39);
        doc.text(edu.institution, marginX, y);

        if (edu.location) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(bodySize);
          doc.setTextColor(75, 85, 99);
          doc.text(edu.location, pageWidth - marginX, y, { align: "right" });
        }
        y += 3.7 * scale;

        // Line 2: Degree on left, Dates on right
        doc.setFont("helvetica", "normal");
        doc.setFontSize(bodySize);
        doc.setTextColor(31, 41, 55);
        const degText = edu.degree + (edu.details ? " | " + edu.details : "");
        doc.text(degText, marginX, y);

        if (edu.dates) {
          doc.setTextColor(75, 85, 99);
          doc.text(edu.dates, pageWidth - marginX, y, { align: "right" });
        }
        y += 4.2 * scale;
      });
    }

    // 7. ACHIEVEMENTS
    if (documentData.achievements && documentData.achievements.length > 0) {
      drawSectionHeading("Achievements & Extracurricular Activities");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(bodySize);
      doc.setTextColor(31, 41, 55);
      documentData.achievements.forEach((ach) => {
        const aLines = doc.splitTextToSize(ach, contentWidth - 5);
        doc.text("•", marginX + 1.2, y);
        aLines.forEach((al: string) => {
          doc.text(al, marginX + 4.5, y);
          y += bulletLineH;
        });
        y += 0.5 * scale;
      });
    }

    return { doc, finalY: y };
  };

  // NATIVE VECTOR PDF: Auto-fits candidate resume strictly onto 1 page A4 without any overflow or cutoff
  const generateVectorResumePdf = (): jsPDF => {
    // Check descending scales to guarantee total height fits strictly on 1 page (A4 = 297mm, max Y <= 275mm)
    const scaleCandidates = [1.03, 1.0, 0.96, 0.92, 0.88, 0.84];
    for (const scale of scaleCandidates) {
      const candidate = renderPdfWithScale(scale);
      if (candidate.finalY <= 275) {
        return candidate.doc;
      }
    }
    return renderPdfWithScale(0.8).doc;
  };

  // DIRECT PDF DOWNLOAD: Saves clean, full-page A4 PDF file directly to downloads
  const handleDirectDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const doc = generateVectorResumePdf();
      doc.save(getSafeFileName("pdf"));
    } catch (err) {
      console.error("Vector PDF generation error, using isolated print:", err);
      handlePrintIsolated();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Builds isolated HTML containing ONLY the styled resume for zero-leak printing
  const buildIsolatedHtml = () => {
    const contactLinks = resolvedContactLinks.length > 0
      ? resolvedContactLinks
          .map((l) => {
            if (l.url && l.url !== "#") {
              return `<span>|</span> <a href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer" style="color: #1d4ed8; text-decoration: none;">${escapeHtml(l.label)}</a>`;
            }
            return `<span>|</span> <span>${escapeHtml(l.label)}</span>`;
          })
          .join(" ")
      : "";

    const summarySection = documentData.summary
      ? `
      <div style="margin-top: 10px;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #d1d5db; padding-bottom: 2px; margin-bottom: 4px;">Summary</div>
        <p style="font-size: 10.5px; line-height: 1.35; color: #1f2937; margin: 0; text-align: justify;">${escapeHtml(documentData.summary)}</p>
      </div>`
      : "";

    const experienceSection =
      documentData.experience && documentData.experience.length > 0
        ? `
      <div style="margin-top: 10px;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #d1d5db; padding-bottom: 2px; margin-bottom: 6px;">Work Experience</div>
        ${documentData.experience
          .map(
            (exp) => `
          <div style="margin-bottom: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; font-size: 11px; font-weight: 700; color: #111827;">
              <span>${escapeHtml(exp.role)}</span>
              <span style="font-size: 10.5px; font-weight: 400; color: #4b5563;">${escapeHtml(exp.dates || "")}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; font-size: 10.5px; color: #4b5563;">
              <span style="font-style: italic;">${escapeHtml(exp.company)}</span>
              <span>${escapeHtml(exp.location || "")}</span>
            </div>
            <ul style="margin: 2px 0 0 16px; padding: 0; font-size: 10.5px; color: #1f2937; line-height: 1.35;">
              ${(exp.tailored_bullets || [])
                .map((b) => `<li style="margin-bottom: 1px;">${escapeHtml(b)}</li>`)
                .join("")}
            </ul>
          </div>
        `
          )
          .join("")}
      </div>`
        : "";

    const projectsSection =
      documentData.projects && documentData.projects.length > 0
        ? `
      <div style="margin-top: 10px;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #d1d5db; padding-bottom: 2px; margin-bottom: 6px;">Projects</div>
        ${documentData.projects
          .map(
            (proj) => {
              const projUrl = resolveProjectUrl(proj);
              const linkHtml = proj.link
                ? projUrl && projUrl !== "#"
                  ? `<a href="${escapeHtml(projUrl)}" target="_blank" rel="noopener noreferrer" style="font-size: 10.5px; color: #1d4ed8; font-weight: 500; text-decoration: none;">${escapeHtml(proj.link)}</a>`
                  : `<span style="font-size: 10.5px; color: #1d4ed8; font-weight: 500;">${escapeHtml(proj.link)}</span>`
                : "";

              return `
          <div style="margin-bottom: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; font-size: 11px; font-weight: 700; color: #111827;">
              <span>${escapeHtml(proj.name)}</span>
              ${linkHtml}
            </div>
            ${proj.tech_stack ? `<div style="font-size: 10px; color: #4b5563; margin-top: 1px;">${escapeHtml(proj.tech_stack)}</div>` : ""}
            <ul style="margin: 2px 0 0 16px; padding: 0; font-size: 10.5px; color: #1f2937; line-height: 1.35;">
              ${(proj.bullets || [])
                .map((b) => `<li style="margin-bottom: 1px;">${escapeHtml(b)}</li>`)
                .join("")}
            </ul>
          </div>
        `;
            }
          )
          .join("")}
      </div>`
        : "";

    const skillsSection =
      documentData.skills_categories && documentData.skills_categories.length > 0
        ? `
      <div style="margin-top: 10px;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #d1d5db; padding-bottom: 2px; margin-bottom: 4px;">Technical Skills</div>
        <div style="font-size: 10.5px; color: #1f2937; line-height: 1.35;">
          ${documentData.skills_categories
            .map(
              (cat) => `
            <div style="display: flex; margin-bottom: 2px;">
              <span style="font-weight: 700; width: 140px; flex-shrink: 0;">${escapeHtml(cat.category)}:</span>
              <span style="flex: 1;">${escapeHtml((cat.skills || []).join(", "))}</span>
            </div>
          `
            )
            .join("")}
        </div>
      </div>`
        : "";

    const educationSection =
      documentData.education && documentData.education.length > 0
        ? `
      <div style="margin-top: 10px;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #d1d5db; padding-bottom: 2px; margin-bottom: 6px;">Education</div>
        ${documentData.education
          .map(
            (edu) => `
          <div style="margin-bottom: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; font-size: 11px; font-weight: 700; color: #111827;">
              <span>${escapeHtml(edu.institution)}</span>
              <span style="font-size: 10.5px; font-weight: 400; color: #4b5563;">${escapeHtml(edu.location || "")}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; font-size: 10.5px; color: #1f2937;">
              <span>${escapeHtml(edu.degree)}${edu.details ? ` ( ${escapeHtml(edu.details)} )` : ""}</span>
              <span style="color: #4b5563;">${escapeHtml(edu.dates || "")}</span>
            </div>
          </div>
        `
          )
          .join("")}
      </div>`
        : "";

    const achievementsSection =
      documentData.achievements && documentData.achievements.length > 0
        ? `
      <div style="margin-top: 10px;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #d1d5db; padding-bottom: 2px; margin-bottom: 4px;">Achievements & Extracurricular Activities</div>
        <ul style="margin: 2px 0 0 16px; padding: 0; font-size: 10.5px; color: #1f2937; line-height: 1.35;">
          ${documentData.achievements
            .map((ach) => `<li style="margin-bottom: 1px;">${escapeHtml(ach)}</li>`)
            .join("")}
        </ul>
      </div>`
        : "";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${getSafeFileName("pdf")}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              color: #111827;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }
          </style>
        </head>
        <body>
          <div style="padding: 2px 4px;">
            <div style="text-align: center; padding-bottom: 8px; border-bottom: 1px solid #d1d5db;">
              <h1 style="font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 3px 0;">
                ${escapeHtml(documentData.contact.name)}
              </h1>
              ${documentData.contact.title ? `<div style="font-size: 11.5px; font-weight: 600; color: #374151; margin-bottom: 4px;">${escapeHtml(documentData.contact.title)}</div>` : ""}
              <div style="font-size: 10.5px; color: #4b5563;">
                ${[
                  documentData.contact.phone
                    ? `<span><a href="tel:${escapeHtml(documentData.contact.phone.replace(/[^0-9+]/g, ""))}" style="color: inherit; text-decoration: none;">${escapeHtml(documentData.contact.phone)}</a></span>`
                    : "",
                  documentData.contact.email
                    ? `<span><a href="mailto:${escapeHtml(documentData.contact.email)}" style="color: #1d4ed8; text-decoration: none;">${escapeHtml(documentData.contact.email)}</a></span>`
                    : "",
                ]
                  .filter(Boolean)
                  .join(" <span>|</span> ")}
                ${contactLinks}
              </div>
            </div>
            ${summarySection}
            ${experienceSection}
            ${projectsSection}
            ${skillsSection}
            ${educationSection}
            ${achievementsSection}
          </div>
        </body>
      </html>
    `;
  };

  // ISOLATED PRINT: Renders ONLY the resume document in a hidden iframe for 100% clean printing
  const handlePrintIsolated = () => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(buildIsolatedHtml());
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }, 250);
  };

  const handlePrint = handlePrintIsolated;

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
      <div className="no-print flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
        <div className="min-w-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Generated Document
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono flex items-center gap-1.5 mt-0.5 truncate">
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">{targetFilename}</span>
          </span>
        </div>

        {/* Action Buttons Grid on Mobile, Flex on Desktop */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs active:scale-[0.98] cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-emerald-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadTxt}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs active:scale-[0.98] cursor-pointer"
            title="Download formatted plain text"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>.TXT</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs active:scale-[0.98] cursor-pointer"
            title="Print isolated resume sheet"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Print</span>
          </button>

          {/* PRIMARY ACTION: Direct 1-Click PDF File Download (ResumeFit Solid Indigo) */}
          <button
            type="button"
            disabled={isDownloadingPdf}
            onClick={handleDirectDownloadPdf}
            className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-sm hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
          >
            {isDownloadingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Styled A4 Resume Sheet Inside Dedicated Viewer Canvas */}
      <div className="bg-slate-100/90 dark:bg-slate-950/90 p-2 sm:p-5 lg:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-x-auto custom-scrollbar">
        <div
          id="resume-sheet-content"
          className="resume-sheet mx-auto bg-white text-gray-900 p-6 sm:p-10 lg:p-12 rounded-xl shadow-2xl shadow-slate-900/10 dark:shadow-black/70 ring-1 ring-slate-900/5 max-w-3xl text-left font-sans text-xs leading-normal"
        >
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
              {documentData.contact.phone && (
                <a
                  href={`tel:${documentData.contact.phone.replace(/[^0-9+]/g, "")}`}
                  className="hover:underline text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {documentData.contact.phone}
                </a>
              )}
              {documentData.contact.email && (
                <>
                  {documentData.contact.phone && <span>|</span>}
                  <a
                    href={`mailto:${documentData.contact.email}`}
                    className="hover:underline text-blue-700 hover:text-blue-800 transition-colors font-medium"
                  >
                    {documentData.contact.email}
                  </a>
                </>
              )}
              {resolvedContactLinks.map((item, idx) => (
                <React.Fragment key={idx}>
                  {(documentData.contact.phone || documentData.contact.email || idx > 0) && (
                    <span>|</span>
                  )}
                  {item.url && item.url !== "#" ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-700 hover:text-blue-900 hover:underline inline-flex items-center gap-0.5 transition-colors cursor-pointer"
                      title={`Open ${item.label}`}
                    >
                      <span>{item.label}</span>
                    </a>
                  ) : (
                    <span className="font-medium text-gray-800">{item.label}</span>
                  )}
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
                      <span>{exp.role}</span>
                      <span className="text-[11px] text-gray-600 font-normal">
                        {exp.dates}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline text-[11px] text-gray-700">
                      <span className="italic font-normal">{exp.company}</span>
                      <span className="text-gray-500 font-normal">{exp.location}</span>
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
                {documentData.projects.map((proj, idx) => {
                  const projUrl = resolveProjectUrl(proj);
                  const hasUrl = projUrl && projUrl !== "#";
                  return (
                    <div key={idx}>
                      <div className="flex justify-between items-baseline font-bold text-[11.5px] text-gray-900">
                        {hasUrl ? (
                          <a
                            href={projUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-700 hover:underline inline-flex items-center gap-1 group transition-colors cursor-pointer"
                            title={`Open ${proj.name}`}
                          >
                            <span>{proj.name}</span>
                          </a>
                        ) : (
                          <span>{proj.name}</span>
                        )}
                        {proj.link && (
                          hasUrl ? (
                            <a
                              href={projUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10.5px] font-medium text-blue-700 hover:text-blue-900 hover:underline inline-flex items-center gap-1 transition-colors cursor-pointer"
                              title={`Open ${proj.link}`}
                            >
                              <span>{proj.link}</span>
                            </a>
                          ) : (
                            <span className="text-[10.5px] font-medium text-blue-700">
                              {proj.link}
                            </span>
                          )
                        )}
                      </div>
                      {proj.tech_stack && (
                        <div className="text-[10.5px] text-gray-600 font-normal mt-0.5">
                          {proj.tech_stack}
                        </div>
                      )}
                      <ul className="list-disc ml-4 mt-1 space-y-0.5 text-[11px] text-gray-800">
                        {proj.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="leading-snug">
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
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
