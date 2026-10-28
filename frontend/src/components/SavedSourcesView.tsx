"use client";

import React, { useState, useEffect } from "react";
import {
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

export const SavedSourcesView: React.FC = () => {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    try {
      const data = await fetchSavedSources();
      setSources(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSource(id);
      setSources((prev) => prev.filter((s) => s.id !== id));
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Saved Scholarly Sources</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified academic publications, DOIs, and citation counts bookmarked during literature discovery.
          </p>
        </div>

        <div className="w-full sm:w-72 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search saved sources or authors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          <BookmarkCheck className="w-12 h-12 mx-auto mb-3 opacity-40 text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-700">No Saved Sources Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Discover and bookmark scholarly works from OpenAlex and Crossref in the Literature Review Generator.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-extrabold uppercase tracking-wide">
                      {s.quartile || "Q1"}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {s.citation_count} Citations ({s.citation_source})
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{s.title}</h3>
                  <p className="text-xs text-slate-600">
                    {s.authors} ({s.year || "n.d."}) — <span className="italic">{s.journal}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleCopyBibtex(s)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center space-x-1 transition"
                  >
                    {copiedId === s.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>BibTeX</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100"
                    title="Delete source"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {s.abstract && (
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 font-serif">
                  {s.abstract}
                </p>
              )}

              {s.doi && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <a
                    href={`https://doi.org/${s.doi}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 hover:underline flex items-center space-x-1 font-medium"
                  >
                    <span>DOI: {s.doi}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-slate-400 text-[10px]">
                    Added {new Date(s.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
