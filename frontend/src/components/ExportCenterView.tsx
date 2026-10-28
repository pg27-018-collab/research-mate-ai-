"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  FileText,
  FileCheck,
  BookOpen,
  Code2,
  ExternalLink,
  ShieldAlert
} from "lucide-react";
import { ProjectSummary, fetchProjects, getExportUrl } from "../lib/api";

export const ExportCenterView: React.FC = () => {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const list = await fetchProjects();
      setProjects(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Export Center</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Download formatted DOCX manuscripts, formal Citation Audit Reports, and BibTeX reference databases.
        </p>
      </div>

      {/* Academic Submission Disclaimer Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-amber-950">Academic Integrity Verification Mandatory</h4>
          <p className="text-amber-900 leading-relaxed">
            All generated literature reviews and automated citation audits must be carefully inspected and validated
            by the corresponding academic authors before submission to peer-reviewed conferences or Scopus/WoS-indexed journals.
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          <Download className="w-12 h-12 mx-auto mb-3 opacity-40 text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-700">No Exportable Projects</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Upload a manuscript or generate a literature review to export documents here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
          {projects.map((proj) => (
            <div key={proj.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      proj.mode === "citation_auditor"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {proj.mode.replace("_", " ")}
                  </span>
                  <span className="text-xs text-slate-400">
                    Created {new Date(proj.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{proj.title}</h3>
                <p className="text-xs text-slate-500">
                  Citation Style: <span className="font-semibold text-slate-700">{proj.citation_style}</span>
                  {proj.total_issues > 0 && ` • ${proj.total_issues} issues identified`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {proj.has_review && (
                  <a
                    href={getExportUrl("lit-review", proj.id)}
                    download
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Download Literature Review (.docx)</span>
                  </a>
                )}

                {proj.has_document && (
                  <a
                    href={getExportUrl("audit-report", proj.id)}
                    download
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-semibold border border-slate-200 flex items-center space-x-1.5 transition"
                  >
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Download Audit Report (.docx)</span>
                  </a>
                )}

                <a
                  href={getExportUrl("bibtex", proj.id)}
                  download
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium border border-slate-200 flex items-center space-x-1 transition"
                >
                  <Code2 className="w-4 h-4" />
                  <span>BibTeX (.bib)</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
