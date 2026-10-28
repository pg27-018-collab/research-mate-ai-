"use client";

import React, { useState } from "react";
import {
  Search,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BookmarkPlus,
  ArrowRight,
  HelpCircle,
  TrendingUp,
  FileText,
  ShieldCheck,
  Send,
  Zap,
  Lightbulb
} from "lucide-react";
import { saveSource } from "../lib/api";

interface ResearchSearchViewProps {
  onNavigate?: (tab: string, projectId?: number) => void;
}

export const ResearchSearchView: React.FC<ResearchSearchViewProps> = ({ onNavigate }) => {
  const [query, setQuery] = useState(
    "Kya is topic pr research work hai: Offline UPI payments using NFC and soundboxes in rural areas"
  );
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);

  // Follow-up interaction
  const [followUpInput, setFollowUpInput] = useState("");
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  const handleSearch = async (customQuery?: string) => {
    const q = (customQuery || query).trim();
    if (!q) return;

    setLoading(true);
    setChatHistory([]);
    try {
      const res = await fetch("/api/scholarly/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResult(data);
      }
    } catch (e) {
      alert("Failed to search scholarly records");
    } finally {
      setLoading(false);
    }
  };

  const handleAskFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpInput.trim() || !searchResult) return;
    const currentQuestion = followUpInput.trim();
    setFollowUpInput("");
    setFollowUpLoading(true);

    try {
      const res = await fetch("/api/advisor/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: searchResult.cleaned_topic,
          follow_up_query: currentQuestion,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.follow_up) {
          setChatHistory((prev) => [...prev, data.follow_up]);
        }
      }
    } catch (e) {
      alert("Failed to resolve follow-up query");
    } finally {
      setFollowUpLoading(false);
    }
  };

  const handleBookmark = async (paper: any) => {
    try {
      await saveSource({
        title: paper.title,
        authors: paper.authors,
        year: paper.year,
        journal: paper.journal,
        doi: paper.doi,
        url: paper.url,
        citation_count: paper.citation_count,
        citation_source: paper.citation_source,
        verification_status: "verified",
        quartile: paper.quartile,
      });
      alert(`Paper '${paper.title.slice(0, 35)}...' saved to project sources!`);
    } catch (e) {
      alert("Failed to save source");
    }
  };

  const sampleQueries = [
    "Kya is topic pr research work hai: Offline UPI payments via NFC in rural India?",
    "Has anyone researched battery degradation in EVs using Physics-Informed Neural Networks?",
    "Can I publish a paper correlating monthwise UPI velocity with retail inflation?",
    "What are the unresolved research gaps in explainable AI for cancer radiology?",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Hero Search Box */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 sm:p-10 text-white shadow-lg space-y-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-blue-300" />
          <span>AI Academic Discovery Engine (OpenAlex &amp; Crossref Grounded)</span>
        </div>

        <div className="space-y-2 max-w-3xl">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Ask Any Research Problem or Topic Idea
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Puchhiye: <em>"Kya is topic par research work already hua hai?"</em>, <em>"Kya is problem par paper publish ho sakta hai?"</em> ya <em>"Existing literature me kya gaps hain?"</em>.
            Hamara AI real peer-reviewed papers aur citations ke sath solid source ke sath answer dega.
          </p>
        </div>

        {/* Big Search Input */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Ask anything (e.g. Kya is topic pr research work hai: ...)"
              className="w-full pl-12 pr-4 py-3.5 bg-white text-slate-900 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-3 focus:ring-blue-400 shadow-inner"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-md transition flex items-center justify-center space-x-2 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? "Searching 250M+ Records..." : "Search Research"}</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold flex items-center space-x-1">
            <Lightbulb className="w-3 h-3 text-amber-300" />
            <span>Try Asking:</span>
          </span>
          {sampleQueries.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(sq);
                handleSearch(sq);
              }}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 text-[11px] font-medium transition"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Results View */}
      {searchResult ? (
        <div className="space-y-6">
          {/* Status & Direct Answer Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-blue-100 text-blue-900 border border-blue-200">
                  {searchResult.literature_status}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Topic: <strong className="text-slate-800">"{searchResult.cleaned_topic}"</strong>
                </span>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <span className="font-semibold text-slate-600">
                  Indexed Works: <strong className="text-blue-700">{searchResult.total_indexed_works}+</strong>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Novelty Score: {searchResult.novelty_score}%
                </span>
              </div>
            </div>

            {/* Direct AI Answer Box */}
            <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/60 p-5 rounded-xl border border-blue-200 space-y-2">
              <div className="flex items-center space-x-2 text-blue-950 font-bold text-sm">
                <Zap className="w-4 h-4 text-blue-600" />
                <span>AI Academic Advisor's Direct Answer:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                {searchResult.direct_answer}
              </p>
            </div>
          </div>

          {/* Two-Column Comparison: What Has Been Done vs What Is Missing (Research Gaps) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: What Existing Research Established */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  What Existing Literature Has Already Done (Existing Baselines)
                </h3>
              </div>
              <ul className="space-y-3">
                {searchResult.existing_knowledge?.map((item: string, idx: number) => (
                  <li
                    key={idx}
                    className="flex items-start space-x-2.5 text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: The Research Gaps (Where You Can Publish) */}
            <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-emerald-100 pb-3">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-emerald-950">
                  Unresolved Research Gaps (Kahan Aap Paper Publish Kar Sakte Ho)
                </h3>
              </div>
              <ul className="space-y-3">
                {searchResult.unresolved_gaps?.map((gap: string, idx: number) => (
                  <li
                    key={idx}
                    className="flex items-start space-x-2.5 text-xs text-slate-700 leading-relaxed bg-emerald-50/60 p-3 rounded-xl border border-emerald-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
                    <span className="font-medium text-emerald-950">{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Publishing Angles */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Recommended Angles for Scopus Q1 Journal Publication</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {searchResult.recommended_angles_for_publication?.map((angle: string, idx: number) => (
                <div key={idx} className="p-3.5 bg-blue-50/40 rounded-xl border border-blue-100 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-blue-900 block mb-1">Strategy {idx + 1}:</span>
                  {angle}
                </div>
              ))}
            </div>
          </div>

          {/* Verified Peer-Reviewed Papers Found (Real DOIs & Citations) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Existing Peer-Reviewed Literature Found (OpenAlex &amp; Crossref Grounded)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Direct evidence answering your query with real DOIs and citation statistics
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                100% Verifiable Papers
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResult.verified_papers?.map((paper: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800">
                        {paper.quartile || "Q1"}
                      </span>
                      <span className="text-[11px] font-bold text-slate-600">
                        {paper.citation_count} Citations ({paper.citation_source})
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {paper.title}
                    </h4>

                    <p className="text-[11px] text-slate-600">
                      {paper.authors} ({paper.year}) — <span className="italic">{paper.journal}</span>
                    </p>

                    <p className="text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                      {paper.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    {paper.url ? (
                      <a
                        href={paper.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-700 hover:underline flex items-center space-x-1 font-semibold text-[11px]"
                      >
                        <span>DOI: {paper.doi || "View Landing Page"}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400">Indexed Record</span>
                    )}

                    <button
                      onClick={() => handleBookmark(paper)}
                      className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded text-[10px] font-semibold border border-slate-200 flex items-center space-x-1"
                    >
                      <BookmarkPlus className="w-3 h-3 text-blue-600" />
                      <span>Bookmark</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Navigation Bridges */}
          {onNavigate && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-indigo-950">Synthesize 3-Section Literature Review</h4>
                  <p className="text-[11px] text-indigo-800">Generate full academic review with verified papers.</p>
                </div>
                <button
                  onClick={() => onNavigate("review")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition flex items-center space-x-1 shrink-0"
                >
                  <span>Open Mode B</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-purple-950">Audit Existing Manuscript Citations</h4>
                  <p className="text-[11px] text-purple-800">Audit your manuscript for missing or uncited references.</p>
                </div>
                <button
                  onClick={() => onNavigate("auditor")}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition flex items-center space-x-1 shrink-0"
                >
                  <span>Open Mode A</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Interactive Follow-up Query Console */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Ask Follow-up Questions About This Problem
                </h3>
                <p className="text-xs text-slate-500">
                  Ask questions like "What methodology is best?", "What datasets should I use?", or "Which journals fit this topic?"
                </p>
              </div>
            </div>

            {/* Conversation History */}
            {chatHistory.length > 0 && (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {chatHistory.map((c, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="font-bold text-slate-900 flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      <span>Q: {c.question}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-sans whitespace-pre-wrap pl-4 border-l-2 border-blue-400">
                      {c.answer}
                    </p>
                    {c.supporting_doi && (
                      <div className="pl-4 pt-1 text-[11px]">
                        <a
                          href={`https://doi.org/${c.supporting_doi}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-700 hover:underline flex items-center space-x-1 font-semibold"
                        >
                          <span>Grounded in: {c.supporting_paper}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Follow-up Question Input */}
            <form onSubmit={handleAskFollowUp} className="flex gap-2">
              <input
                type="text"
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                placeholder="Ask follow-up query (e.g. What baseline should I compare against?)..."
                className="flex-1 text-xs border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={followUpLoading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition"
              >
                <span>{followUpLoading ? "Thinking..." : "Ask"}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
          <Search className="w-12 h-12 mx-auto text-blue-500 opacity-40" />
          <h3 className="text-sm font-semibold text-slate-700">Enter Your Problem or Topic Above</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Type any research question, problem statement, or proposed idea and click "Search Research"
            to discover if prior works exist, what gaps remain, and whether it is publishable.
          </p>
        </div>
      )}
    </div>
  );
};
