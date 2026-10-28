"use client";

import React, { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Search,
  ExternalLink,
  BookOpen,
  Filter,
  Check,
  X,
  Sparkles,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  BookmarkPlus
} from "lucide-react";
import {
  ProjectSummary,
  CitationIssue,
  TocSection,
  fetchProjects,
  createProject,
  fetchProjectDetails,
  uploadDocument,
  updateIssue,
  searchScholarly,
  saveSource
} from "../lib/api";

interface CitationAuditorViewProps {
  initialProjectId?: number | null;
  onNavigateToLitReview?: (title?: string) => void;
}

export const CitationAuditorView: React.FC<CitationAuditorViewProps> = ({
  initialProjectId,
  onNavigateToLitReview,
}) => {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(initialProjectId || null);
  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selection & Navigation
  const [selectedIssueIndex, setSelectedIssueIndex] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Edit issue state
  const [editingText, setEditingText] = useState<string>("");
  const [editingCorrection, setEditingCorrection] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  // Scholarly search modal for missing source
  const [scholarlySearchQuery, setScholarlySearchQuery] = useState("");
  const [scholarlyResults, setScholarlyResults] = useState<any[]>([]);
  const [isSearchingScholarly, setIsSearchingScholarly] = useState(false);
  const [showScholarlyModal, setShowScholarlyModal] = useState(false);

  // New Project modal state
  const [newTitle, setNewTitle] = useState("");
  const [newStyle, setNewStyle] = useState("APA 7th");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadProjectsList();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadProject(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadProjectsList = async () => {
    try {
      const list = await fetchProjects();
      setProjects(list);
      if (!selectedProjectId && list.length > 0) {
        setSelectedProjectId(list[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadProject = async (id: number) => {
    setLoading(true);
    try {
      const data = await fetchProjectDetails(id);
      setProjectData(data);
      setSelectedIssueIndex(0);
      setCurrentPage(1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const proj = await createProject({
        title: newTitle,
        mode: "citation_auditor",
        citation_style: newStyle,
      });
      setShowCreateModal(false);
      setNewTitle("");
      await loadProjectsList();
      setSelectedProjectId(proj.id);
    } catch (err: any) {
      alert(err.message || "Failed to create project");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let targetProjId = selectedProjectId;
    if (!targetProjId) {
      const proj = await createProject({
        title: file.name.replace(/\.[^/.]+$/, ""),
        mode: "citation_auditor",
      });
      targetProjId = proj.id;
      setSelectedProjectId(proj.id);
      await loadProjectsList();
    }

    if (!targetProjId) return;

    setUploading(true);
    setUploadError(null);
    try {
      await uploadDocument(targetProjId, file);
      await loadProject(targetProjId);
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Filter issues
  const allIssues: CitationIssue[] = projectData?.issues || [];
  const filteredIssues = allIssues.filter((issue) => {
    if (categoryFilter !== "all" && issue.category !== categoryFilter) return false;
    if (severityFilter !== "all" && issue.severity !== severityFilter) return false;
    if (statusFilter !== "all" && issue.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = (issue.cited_text || "").toLowerCase();
      const matchExpl = (issue.explanation || "").toLowerCase();
      const matchAuth = (issue.author || "").toLowerCase();
      if (!matchText.includes(q) && !matchExpl.includes(q) && !matchAuth.includes(q)) return false;
    }
    return true;
  });

  const activeIssue = filteredIssues[selectedIssueIndex] || null;

  // Sync page view when active issue changes
  useEffect(() => {
    if (activeIssue && activeIssue.page) {
      setCurrentPage(activeIssue.page);
      setEditingText(activeIssue.cited_text || "");
      setEditingCorrection(activeIssue.suggested_correction || "");
      setIsEditing(false);
    }
  }, [activeIssue]);

  const handleUpdateStatus = async (issueId: number, newStatus: string) => {
    try {
      await updateIssue(issueId, { status: newStatus });
      setProjectData((prev: any) => ({
        ...prev,
        issues: prev.issues.map((i: CitationIssue) =>
          i.id === issueId ? { ...i, status: newStatus } : i
        ),
      }));
    } catch (err) {
      alert("Failed to update issue status");
    }
  };

  const handleSaveCorrection = async () => {
    if (!activeIssue) return;
    try {
      await updateIssue(activeIssue.id, {
        status: "resolved",
        cited_text: editingText,
        suggested_correction: editingCorrection,
      });
      setProjectData((prev: any) => ({
        ...prev,
        issues: prev.issues.map((i: CitationIssue) =>
          i.id === activeIssue.id
            ? { ...i, status: "resolved", cited_text: editingText, suggested_correction: editingCorrection }
            : i
        ),
      }));
      setIsEditing(false);
    } catch (e) {
      alert("Failed to save correction");
    }
  };

  const handleFindSource = async (author?: string, year?: string) => {
    const query = `${author || ""} ${year || ""} academic`.trim();
    setScholarlySearchQuery(query);
    setShowScholarlyModal(true);
    setIsSearchingScholarly(true);
    try {
      const res = await searchScholarly(query);
      setScholarlyResults(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingScholarly(false);
    }
  };

  const handleSaveFoundSource = async (source: any) => {
    try {
      await saveSource({
        project_id: selectedProjectId,
        title: source.title,
        authors: source.authors,
        year: source.year,
        journal: source.journal,
        doi: source.doi,
        url: source.url,
        citation_count: source.citation_count,
        citation_source: source.citation_source,
        abstract: source.abstract,
        verification_status: source.verification_status,
        quartile: source.quartile,
      });
      alert(`Source '${source.title.slice(0, 40)}...' saved to project library!`);
    } catch (e) {
      alert("Failed to save source");
    }
  };

  const toc: TocSection[] = projectData?.document?.structure || [];
  const totalPages = projectData?.document?.page_count || 1;

  // Get current page text
  const fullText = projectData?.document?.full_text || "";
  const pageSegments = fullText.split("\n\n\n");
  const currentPageText = pageSegments[currentPage - 1] || fullText.slice((currentPage - 1) * 1200, currentPage * 1200);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-100 overflow-hidden">
      {/* Top Action Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Project:</span>
            <select
              value={selectedProjectId || ""}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              className="text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.has_document ? "Audited" : "Draft"})
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200 transition"
            >
              + New Project
            </button>
          </div>

          {projectData?.document && (
            <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-500 border-l border-slate-200 pl-3">
              <span className="font-medium text-slate-700">{projectData.document.filename}</span>
              <span>•</span>
              <span>{projectData.document.page_count} Pages</span>
              <span>•</span>
              <span>{projectData.document.word_count.toLocaleString()} Words</span>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex items-center space-x-2">
          <label className="cursor-pointer flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium shadow-xs transition">
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? "Analyzing Paper..." : "Upload PDF / DOCX"}</span>
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {uploadError && (
        <div className="bg-red-50 text-red-700 px-4 py-2 text-xs flex items-center justify-between border-b border-red-200">
          <span>{uploadError}</span>
          <button onClick={() => setUploadError(null)} className="text-red-900 font-bold">×</button>
        </div>
      )}

      {/* Main 3-Panel Split Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* ===================== LEFT PANEL: TOC & ISSUES LIST ===================== */}
        <div className="w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0">
          {/* Section A: Table of Contents / Academic Headings */}
          {toc.length > 0 && (
            <div className="border-b border-slate-200 p-3 bg-slate-50/70">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Academic Structure ({toc.length} Sections)
                </span>
                <span className="text-[10px] text-blue-600 font-medium">Click to navigate</span>
              </div>
              <div className="flex overflow-x-auto space-x-1.5 pb-1 scrollbar-thin">
                {toc.map((sec, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(sec.page)}
                    className={`whitespace-nowrap px-2 py-1 rounded text-xs font-medium border transition ${
                      currentPage === sec.page
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-slate-400 mr-1">{sec.number}.</span>
                    {sec.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section B: Search & Issue Filters */}
          <div className="p-3 border-b border-slate-200 space-y-2 bg-white">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search citation errors or authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-1 text-[11px]">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setSelectedIssueIndex(0);
                }}
                className="bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-slate-700 font-medium truncate"
              >
                <option value="all">All Categories</option>
                <option value="category_1_missing_ref">Missing Reference</option>
                <option value="category_2_missing_in_text">Uncited Reference</option>
                <option value="category_3_inconsistent">Inconsistent / Typo</option>
                <option value="unsupported_claim">Unsupported Claim</option>
              </select>

              <select
                value={severityFilter}
                onChange={(e) => {
                  setSeverityFilter(e.target.value);
                  setSelectedIssueIndex(0);
                }}
                className="bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-slate-700 font-medium truncate"
              >
                <option value="all">All Severities</option>
                <option value="error">Errors</option>
                <option value="warning">Warnings</option>
                <option value="info">Info</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setSelectedIssueIndex(0);
                }}
                className="bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-slate-700 font-medium truncate"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="reviewing">Reviewing</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
          </div>

          {/* Section C: Issue List Header & Count */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">
              Audit Findings ({filteredIssues.length})
            </span>
            <div className="flex items-center space-x-2 text-[11px]">
              <span className="text-red-600 font-semibold">
                {allIssues.filter((i) => i.severity === "error" && i.status === "open").length} Errors
              </span>
              <span>•</span>
              <span className="text-amber-600 font-semibold">
                {allIssues.filter((i) => i.severity === "warning" && i.status === "open").length} Warnings
              </span>
            </div>
          </div>

          {/* Section D: Scrollable List of Issues */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredIssues.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <ShieldCheck className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-80" />
                <p className="text-xs font-semibold text-slate-700">No issues found</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Upload a paper or adjust your filters to view citation analysis.
                </p>
              </div>
            ) : (
              filteredIssues.map((issue, idx) => {
                const isSelected = idx === selectedIssueIndex;
                const isError = issue.severity === "error";
                const isWarning = issue.severity === "warning";

                return (
                  <div
                    key={issue.id}
                    onClick={() => setSelectedIssueIndex(idx)}
                    className={`p-3 cursor-pointer transition text-xs border-l-4 ${
                      isSelected
                        ? "bg-blue-50/80 border-blue-600 shadow-2xs"
                        : isError
                        ? "border-red-500 hover:bg-slate-50"
                        : isWarning
                        ? "border-amber-500 hover:bg-slate-50"
                        : "border-sky-500 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-tight ${
                          issue.category === "category_1_missing_ref"
                            ? "bg-red-100 text-red-800"
                            : issue.category === "category_2_missing_in_text"
                            ? "bg-amber-100 text-amber-800"
                            : issue.category === "category_3_inconsistent"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-sky-100 text-sky-800"
                        }`}
                      >
                        {issue.category.replace(/category_\d+_/, "").replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Page {issue.page}
                      </span>
                    </div>

                    <div className="font-semibold text-slate-900 line-clamp-1 mb-1">
                      {issue.cited_text}
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {issue.explanation}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span
                        className={`px-1.5 py-0.5 rounded font-medium ${
                          issue.status === "resolved"
                            ? "bg-emerald-100 text-emerald-800"
                            : issue.status === "dismissed"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {issue.status.toUpperCase()}
                      </span>
                      <span className="text-slate-400">
                        {Math.round(issue.confidence * 100)}% match confidence
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ===================== CENTER PANEL: DOCUMENT VIEWER ===================== */}
        <div className="flex-1 flex flex-col bg-slate-200/80 overflow-hidden">
          {/* Viewer Toolbar */}
          <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs shadow-2xs">
            <div className="flex items-center space-x-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4 text-slate-700" />
              </button>
              <span className="font-semibold text-slate-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4 text-slate-700" />
              </button>
            </div>

            {/* Issue Jump Controls */}
            {filteredIssues.length > 0 && (
              <div className="flex items-center space-x-2 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                <button
                  disabled={selectedIssueIndex <= 0}
                  onClick={() => setSelectedIssueIndex((i) => Math.max(0, i - 1))}
                  className="text-slate-600 hover:text-slate-900 disabled:opacity-30"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-medium text-slate-600">
                  Issue {selectedIssueIndex + 1} of {filteredIssues.length}
                </span>
                <button
                  disabled={selectedIssueIndex >= filteredIssues.length - 1}
                  onClick={() => setSelectedIssueIndex((i) => Math.min(filteredIssues.length - 1, i + 1))}
                  className="text-slate-600 hover:text-slate-900 disabled:opacity-30"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-medium text-slate-600 w-10 text-center">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Document Canvas / Page Preview */}
          <div className="flex-1 overflow-auto p-6 flex justify-center">
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
              className="w-[720px] min-h-[900px] bg-white shadow-md border border-slate-300 rounded p-12 transition-transform duration-150 flex flex-col justify-between"
            >
              <div>
                {/* Page header */}
                <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-100 text-[10px] text-slate-400 font-serif">
                  <span>RESEARCH MANUSCRIPT AUDIT PREVIEW</span>
                  <span>PAGE {currentPage}</span>
                </div>

                {/* Render page text with highlighted spans */}
                {currentPageText ? (
                  <div className="text-slate-800 font-serif text-[13px] leading-relaxed whitespace-pre-wrap selection:bg-blue-100">
                    {activeIssue && activeIssue.page === currentPage ? (
                      <div>
                        {/* Highlight active issue text */}
                        {(() => {
                          const target = activeIssue.cited_text;
                          const parts = currentPageText.split(target);
                          if (parts.length > 1) {
                            return (
                              <>
                                <span>{parts[0]}</span>
                                <span className="bg-amber-200 text-amber-950 font-bold px-1 py-0.5 rounded shadow-xs border border-amber-300 animate-pulse">
                                  {target}
                                </span>
                                <span>{parts.slice(1).join(target)}</span>
                              </>
                            );
                          }
                          return <span>{currentPageText}</span>;
                        })()}
                      </div>
                    ) : (
                      <span>{currentPageText}</span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                    <FileText className="w-12 h-12 mb-3 opacity-40 text-blue-600" />
                    <p className="text-sm font-semibold text-slate-700">No Document Loaded</p>
                    <p className="text-xs text-slate-500 mt-1">Upload a PDF or DOCX file to begin the citation audit.</p>
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between font-serif">
                <span>ResearchMate AI Academic Verification Engine</span>
                <span>Page {currentPage} of {totalPages}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== RIGHT PANEL: ISSUE INSPECTOR & RESOLUTION ===================== */}
        <div className="w-80 lg:w-96 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto">
          {activeIssue ? (
            <div className="p-4 space-y-4">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    activeIssue.severity === "error"
                      ? "bg-red-100 text-red-800 border border-red-200"
                      : activeIssue.severity === "warning"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-sky-100 text-sky-800 border border-sky-200"
                  }`}
                >
                  {activeIssue.severity.toUpperCase()}: {activeIssue.category.replace(/category_\d+_/, "").replace(/_/g, " ")}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Page {activeIssue.page}, Para {activeIssue.paragraph}
                </span>
              </div>

              {/* Cited Text Card */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  In-Text Cited Fragment
                </span>
                <p className="text-xs font-serif font-bold text-slate-900 bg-white p-2 rounded border border-slate-200 shadow-2xs">
                  "{activeIssue.cited_text}"
                </p>
              </div>

              {/* Confidence Meter */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-600">Deterministic Match Confidence:</span>
                  <span className="font-bold text-blue-700">{Math.round(activeIssue.confidence * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${Math.round(activeIssue.confidence * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Academic Rationale & Explanation */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span>Audit Explanation</span>
                </span>
                <p className="text-xs text-slate-600 leading-relaxed bg-blue-50/50 p-2.5 rounded-md border border-blue-100">
                  {activeIssue.explanation}
                </p>
              </div>

              {/* Verified Source Metadata if available */}
              {activeIssue.verified_source && (
                <div className="space-y-1 bg-emerald-50/60 p-3 rounded-lg border border-emerald-200 text-xs">
                  <div className="flex items-center space-x-1 text-emerald-800 font-bold mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Cross-Referenced Source Match</span>
                  </div>
                  <p className="font-semibold text-slate-800">{activeIssue.verified_source.title}</p>
                  {activeIssue.verified_source.year && (
                    <p className="text-slate-600">Year: {activeIssue.verified_source.year}</p>
                  )}
                  {activeIssue.verified_source.doi && (
                    <a
                      href={`https://doi.org/${activeIssue.verified_source.doi}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-700 hover:underline flex items-center space-x-1 text-[11px] mt-1"
                    >
                      <span>DOI: {activeIssue.verified_source.doi}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Suggested Correction */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Suggested Correction</span>
                </span>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={editingCorrection}
                    onChange={(e) => setEditingCorrection(e.target.value)}
                    className="w-full text-xs p-2 border border-blue-400 rounded-md focus:outline-hidden"
                  />
                ) : (
                  <p className="text-xs text-slate-700 bg-amber-50/60 p-2.5 rounded-md border border-amber-200 leading-relaxed">
                    {activeIssue.suggested_correction || "No automatic correction available."}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                {isEditing ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveCorrection}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center justify-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save & Resolve</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        handleUpdateStatus(activeIssue.id, "resolved");
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-xs flex items-center justify-center space-x-1.5 transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Issue as Resolved</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-medium border border-slate-200 transition"
                      >
                        Edit Citation
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(activeIssue.id, "dismissed")}
                        className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-medium border border-slate-200 transition"
                      >
                        Dismiss False Positive
                      </button>
                    </div>

                    <button
                      onClick={() => handleFindSource(activeIssue.author, activeIssue.year)}
                      className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-xs font-semibold border border-blue-200 flex items-center justify-center space-x-1.5 transition"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Find Source in OpenAlex / Crossref</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 my-auto">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-medium">Select an issue from the list to inspect details</p>
            </div>
          )}
        </div>
      </div>

      {/* Scholarly Discovery Modal */}
      {showScholarlyModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Scholarly Source Discovery</h3>
              </div>
              <button
                onClick={() => setShowScholarlyModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 flex space-x-2">
              <input
                type="text"
                value={scholarlySearchQuery}
                onChange={(e) => setScholarlySearchQuery(e.target.value)}
                placeholder="Search paper title, author, or keywords..."
                className="flex-1 text-xs border border-slate-300 rounded px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={async () => {
                  setIsSearchingScholarly(true);
                  try {
                    const res = await searchScholarly(scholarlySearchQuery);
                    setScholarlyResults(res);
                  } finally {
                    setIsSearchingScholarly(false);
                  }
                }}
                disabled={isSearchingScholarly}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
              >
                {isSearchingScholarly ? "Searching..." : "Search"}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {scholarlyResults.map((item, idx) => (
                <div key={idx} className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 space-y-1.5 text-xs">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-slate-900 text-xs flex-1 mr-2">{item.title}</h4>
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">
                      {item.quartile || "Q1"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {item.authors} ({item.year || "n.d."}) — <span className="italic">{item.journal}</span>
                  </p>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-500 font-medium">
                      Citations: {item.citation_count} ({item.citation_source})
                    </span>
                    <div className="flex space-x-2">
                      {item.doi && (
                        <a
                          href={`https://doi.org/${item.doi}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center space-x-1"
                        >
                          <span>DOI</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <button
                        onClick={() => handleSaveFoundSource(item)}
                        className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-semibold flex items-center space-x-1"
                      >
                        <BookmarkPlus className="w-3 h-3" />
                        <span>Save to Project</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-4">Create New Research Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Project / Paper Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Empirical Study of Automated Citation Auditing"
                  className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Citation Style</label>
                <select
                  value={newStyle}
                  onChange={(e) => setNewStyle(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2"
                >
                  <option value="APA 7th">APA 7th Edition</option>
                  <option value="IEEE">IEEE (Numbered)</option>
                  <option value="Harvard">Harvard (Author-Date)</option>
                  <option value="MLA 9th">MLA 9th Edition</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
