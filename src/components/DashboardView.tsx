"use client";

import React, { useState, useEffect } from "react";
import {
  FileSearch,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  FolderKanban,
  BookmarkCheck,
  Search,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { DashboardStats, fetchDashboardStats, inspectJournalScopus } from "../lib/api";

interface DashboardViewProps {
  onNavigate: (tab: string, projectId?: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Scopus quick check
  const [journalQuery, setJournalQuery] = useState("");
  const [journalResult, setJournalResult] = useState<any>(null);
  const [checkingJournal, setCheckingJournal] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleJournalCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalQuery.trim()) return;
    setCheckingJournal(true);
    try {
      const res = await inspectJournalScopus(journalQuery);
      setJournalResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingJournal(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-200 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>ResearchMate AI Academic Verification Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Academic Referencing Integrity & Literature Review Platform
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Audit existing research manuscripts for citation defects, missing references, and inconsistent formatting.
            Synthesize traceable, post-2020 literature reviews with verified OpenAlex & Crossref bibliographic provenance.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate("auditor")}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center space-x-2"
            >
              <FileSearch className="w-4 h-4" />
              <span>Launch Citation Auditor</span>
            </button>
            <button
              onClick={() => onNavigate("review")}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold backdrop-blur-md border border-white/20 transition flex items-center space-x-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Generate Literature Review</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Research Projects</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.total_projects || 0}</h3>
            <span className="text-[11px] text-blue-600 font-medium">Active workspaces</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Citation Issues Found</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.citation_issues_detected || 0}</h3>
            <span className="text-[11px] text-amber-600 font-medium">Across uploaded papers</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Issues Resolved</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.issues_resolved || 0}</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Verified & corrected</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Literature Reviews</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.literature_reviews_generated || 0}</h3>
            <span className="text-[11px] text-purple-600 font-medium">Traceable syntheses</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Center 2-Column: Scopus Inspector & Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scopus Inspector Widget (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Scopus & CiteScore Journal Inspector</h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Verify journal indexing, official ISSNs, CiteScore quartiles (Q1-Q4), and publisher telemetry directly via OpenAlex & Crossref registries.
          </p>

          <form onSubmit={handleJournalCheck} className="flex gap-2">
            <input
              type="text"
              value={journalQuery}
              onChange={(e) => setJournalQuery(e.target.value)}
              placeholder="e.g. Nature Machine Intelligence or 2522-5839"
              className="flex-1 text-xs border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={checkingJournal}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold"
            >
              {checkingJournal ? "Checking..." : "Inspect"}
            </button>
          </form>

          {journalResult && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <span className="font-bold text-slate-900 text-xs">{journalResult.display_name}</span>
                <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-extrabold">
                  {journalResult.citescore_quartile}
                </span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Publisher: <strong>{journalResult.publisher}</strong> | ISSN: <strong>{journalResult.issn_l || "Verified"}</strong>
              </p>
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
                <p>Status: {journalResult.scopus_coverage}</p>
                <p>Mean 2yr Citations per Work: {journalResult.two_year_mean_citedness}</p>
                <p className="text-[10px] text-slate-400 italic">{journalResult.note}</p>
              </div>
            </div>
          )}
        </div>

        {/* Recent Projects & Activity (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Recent Research Projects</h2>
            <button
              onClick={() => onNavigate("projects")}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {stats?.recent_projects && stats.recent_projects.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {stats.recent_projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => onNavigate(proj.mode === "citation_auditor" ? "auditor" : "review", proj.id)}
                  className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 px-2 rounded-lg transition"
                >
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-slate-900">{proj.title}</h4>
                    <p className="text-[11px] text-slate-500">
                      Mode: <span className="capitalize">{proj.mode.replace("_", " ")}</span> • Style: {proj.citation_style}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        proj.status === "audited" || proj.status === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {proj.status.toUpperCase()}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              <FolderKanban className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium">No projects yet</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Upload a research paper or generate a literature review to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
