"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  BookmarkCheck,
  Search,
  ExternalLink,
  Trash2,
  Copy,
  Check,
  ShieldCheck,
  BookOpen
} from "lucide-react";
import { fetchSavedSources, deleteSource } from "../lib/api";

interface SavedSourcesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateCount?: (count: number) => void;
}

export const SavedSourcesDrawer: React.FC<SavedSourcesDrawerProps> = ({
  isOpen,
  onClose,
  onUpdateCount,
}) => {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSources();
    }
  }, [isOpen]);

  const loadSources = async () => {
    setLoading(true);
    try {
      const data = await fetchSavedSources();
      setSources(data);
      if (onUpdateCount) onUpdateCount(data.length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSource(id);
      const updated = sources.filter((s) => s.id !== id);
      setSources(updated);
      if (onUpdateCount) onUpdateCount(updated.length);
    } catch (e) {
      alert("Failed to delete source");
    }
  };

  const handleCopyBibtex = (s: any) => {
    const authors = s.authors || "Author";
    const surname = authors.split(",")[0].split(" ").pop()?.toLowerCase() || "ref";
    const cleanSurname = surname.replace(/[^a-z]/g, "");
    const year = s.year || 2023;
    const bibtex = `@article{${cleanSurname}${year}_${s.id},\n  title = {${s.title}},\n  author = {${s.authors}},\n  journal = {${s.journal || "Scholarly Venue"}},\n  year = {${year}},\n  doi = {${s.doi || ""}}\n}`;

    navigator.clipboard.writeText(bibtex);
    setCopiedId(s.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  const filtered = sources.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (s.title || "").toLowerCase().includes(q) ||
      (s.authors || "").toLowerCase().includes(q) ||
      (s.journal || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <BookmarkCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Saved Sources Library</h2>
              <p className="text-[11px] text-slate-500">{sources.length} bookmarked peer-reviewed works</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search saved sources or authors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading saved sources...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No saved sources yet</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Bookmark papers from AI Search, Literature Review, or Advisor to view them here.
              </p>
            </div>
          ) : (
            filtered.map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{s.title}</h4>
                  {s.quartile && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                      {s.quartile}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600">
                  {s.authors} ({s.year}) — <em>{s.journal}</em>
                </p>
                {s.citation_count !== undefined && (
                  <p className="text-[10px] text-slate-500 font-medium">
                    Citations: <strong className="text-slate-800">{s.citation_count}</strong> ({s.citation_source || "OpenAlex Verified"})
                  </p>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                  <div className="flex items-center space-x-2">
                    {s.url && (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      >
                        <span>DOI Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <button
                      onClick={() => handleCopyBibtex(s)}
                      className="text-slate-600 hover:text-slate-900 flex items-center space-x-1"
                    >
                      {copiedId === s.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>BibTeX</span>
                        </>
                      )}
                    </button>
                  </div>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-slate-400 hover:text-rose-600 transition p-1"
                    title="Delete source"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
