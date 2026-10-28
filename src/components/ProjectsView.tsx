"use client";

import React, { useState, useEffect } from "react";
import {
  FolderKanban,
  FileSearch,
  BookOpen,
  Trash2,
  Download,
  ArrowRight,
  ExternalLink,
  Plus
} from "lucide-react";
import { ProjectSummary, fetchProjects, deleteProject, createProject, getExportUrl } from "../lib/api";

interface ProjectsViewProps {
  onOpenProject: (tab: string, projectId: number) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onOpenProject }) => {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState("all");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newMode, setNewMode] = useState("citation_auditor");
  const [newStyle, setNewStyle] = useState("APA 7th");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete project "${title}"?`)) return;
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert("Failed to delete project");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const proj = await createProject({
        title: newTitle,
        mode: newMode,
        citation_style: newStyle,
      });
      setShowCreateModal(false);
      setNewTitle("");
      await loadProjects();
      onOpenProject(newMode === "citation_auditor" ? "auditor" : "review", proj.id);
    } catch (e: any) {
      alert(e.message || "Failed to create project");
    }
  };

  const filtered = projects.filter((p) => {
    if (filterMode === "all") return true;
    return p.mode === filterMode;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Research Projects</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your audited academic manuscripts and generated literature reviews.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-700 font-medium"
          >
            <option value="all">All Modes ({projects.length})</option>
            <option value="citation_auditor">Citation Auditor</option>
            <option value="literature_review">Literature Review</option>
          </select>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-40 text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-700">No Projects Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Create a project or upload a manuscript to begin auditing citations and literature.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((proj) => (
            <div
              key={proj.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      proj.mode === "citation_auditor"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {proj.mode.replace("_", " ")}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(proj.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                  {proj.title}
                </h3>

                <div className="text-xs text-slate-500 space-y-1 pt-1">
                  <p>Style: <span className="font-semibold text-slate-700">{proj.citation_style}</span></p>
                  {proj.doc_filename && (
                    <p className="truncate">Document: <span className="font-medium text-slate-700">{proj.doc_filename}</span></p>
                  )}
                  {proj.total_issues > 0 && (
                    <p className="text-amber-700 font-medium">
                      {proj.total_issues} Issues ({proj.open_issues} open)
                    </p>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() =>
                    onOpenProject(proj.mode === "citation_auditor" ? "auditor" : "review", proj.id)
                  }
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-semibold flex items-center space-x-1 transition"
                >
                  <span>Open Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center space-x-1">
                  {proj.has_review && (
                    <a
                      href={getExportUrl("lit-review", proj.id)}
                      download
                      title="Download Literature Review DOCX"
                      className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(proj.id, proj.title)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-4">Create New Research Project</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Meta-Analysis of LLM Reasoning Capabilities"
                  className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Operating Mode</label>
                <select
                  value={newMode}
                  onChange={(e) => setNewMode(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2"
                >
                  <option value="citation_auditor">Mode A: Citation Auditor (Upload Paper)</option>
                  <option value="literature_review">Mode B: Literature Review Generator</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Citation Style</label>
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
