"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  BookOpen,
  Send,
  HelpCircle,
  TrendingUp,
  BookmarkPlus,
  Compass,
  FileCheck,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import { saveSource } from "../lib/api";

export const ResearchAdvisorView: React.FC = () => {
  const [topic, setTopic] = useState("Automated Citation Auditing and Scholarly Verification Using Large Language Models");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Follow up questions
  const [queryInput, setQueryInput] = useState("");
  const [queryLoading, setQueryLoading] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);

  const handleEvaluate = async (searchTopic?: string) => {
    const targetTopic = searchTopic || topic;
    if (!targetTopic.trim()) return;
    setLoading(true);
    setConversations([]);
    try {
      const res = await fetch("/api/advisor/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: targetTopic }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (e) {
      alert("Failed to evaluate topic");
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim() || !result) return;
    const currentQ = queryInput;
    setQueryInput("");
    setQueryLoading(true);

    try {
      const res = await fetch("/api/advisor/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: result.topic, follow_up_query: currentQ }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.follow_up) {
          setConversations((prev) => [...prev, data.follow_up]);
        }
      }
    } catch (e) {
      alert("Failed to resolve query");
    } finally {
      setQueryLoading(false);
    }
  };

  const handleSaveVerifiedPaper = async (paper: any) => {
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

  const presets = [
    "Explainable AI for Early Clinical Cancer Detection",
    "Transformer Models in Bibliometrics & Citation Anomaly Auditing",
    "Zero-Knowledge Proofs in Decentralized Supply Chains",
    "Federated Learning in Edge IoT Devices Under Packet Loss",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-blue-300" />
          <span>Academic Publishing Feasibility & Research Gap Engine</span>
        </div>

        <div className="space-y-2 max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            AI Research Advisor: Should You Publish This Paper?
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Enter your proposed research topic to evaluate publishability, identify saturated traps that get desk-rejected,
            discover high-impact novel hooks, and receive verifiable peer-reviewed literature (with DOIs & Q1 metrics) — not vague advice.
          </p>
        </div>

        {/* Search Bar */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your proposed research topic or paper title..."
              className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-400 font-medium"
            />
          </div>
          <button
            onClick={() => handleEvaluate()}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition flex items-center justify-center space-x-2 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? "Analyzing..." : "Evaluate Topic"}</span>
          </button>
        </div>

        {/* Preset Badges */}
        <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px] font-medium">Trending Topics:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTopic(p);
                handleEvaluate(p);
              }}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 text-[11px] font-medium transition"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Main Results View */}
      {result ? (
        <div className="space-y-6">
          {/* Verdict Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Publishability Verdict
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Saturation: <strong className="text-slate-800">{result.saturation_level}</strong>
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {result.recent_literature_volume}
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 leading-snug">
                {result.verdict_title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                {result.verdict_recommendation}
              </p>
            </div>

            {/* Score Gauge */}
            <div className="shrink-0 p-5 bg-gradient-to-b from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-200 flex flex-col items-center justify-center text-center w-full md:w-48 shadow-2xs">
              <span className="text-3xl font-black text-blue-700">
                {result.publishability_score}%
              </span>
              <span className="text-xs font-bold text-slate-700 mt-0.5">Novelty & Acceptance Index</span>
              <span className="text-[10px] text-slate-500 mt-1 font-medium">Scopus Q1/Q2 Threshold</span>
            </div>
          </div>

          {/* Saturated Pitfalls vs Novel Angles (2 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Red: What to Avoid */}
            <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-rose-100 pb-3">
                <XCircle className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold text-rose-950">
                  What Reviewers Reject (Saturated Pitfalls to Avoid)
                </h3>
              </div>
              <ul className="space-y-3">
                {result.saturated_pitfalls.map((pitfall: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-700 leading-relaxed bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                    <span>{pitfall}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Green: Novel Angles */}
            <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-emerald-100 pb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-emerald-950">
                  Novel Hooks to Pursue (High Acceptance Probability)
                </h3>
              </div>
              <ul className="space-y-3">
                {result.novel_hooks_to_pursue.map((hook: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-700 leading-relaxed bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                    <span>{hook}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Strong Verifiable Sources (Non-Vague Academic Literature) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Strong Verifiable Scholarly Sources (Ground Your Submission Here)
                </h3>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                100% Real DOIs & Citations
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.verified_sources.map((paper: any, idx: number) => (
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

                    <p className="text-[11px] text-blue-900 bg-blue-50/70 p-2 rounded-lg border border-blue-100 font-medium">
                      🎯 {paper.relevance_reason}
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
                      onClick={() => handleSaveVerifiedPaper(paper)}
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

          {/* Recommended Target Journals (Q1/Q2) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Recommended Scopus & WoS Target Journals (Q1 Indexing)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.target_journals.map((j: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-extrabold">
                      {j.quartile}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600">CiteScore: {j.citescore}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{j.name}</h4>
                  <p className="text-[11px] text-slate-500">Publisher: {j.publisher}</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">Typical Turnaround: {j.review_time}</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed pt-1 border-t border-slate-200">
                    {j.fit_reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Follow-up Query Console */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Ask Specific Research Queries About This Topic
                </h3>
                <p className="text-xs text-slate-500">
                  Ask questions like "What baseline models should I compare?", "What dataset is best?", or "How to defend my methodology?"
                </p>
              </div>
            </div>

            {/* Conversation History */}
            {conversations.length > 0 && (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {conversations.map((c, idx) => (
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

            {/* Question Input */}
            <form onSubmit={handleAskQuery} className="flex gap-2">
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Ask specific question about methodology, datasets, or reviewer expectations..."
                className="flex-1 text-xs border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={queryLoading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition"
              >
                <span>{queryLoading ? "Resolving..." : "Ask Advisor"}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
          <Compass className="w-12 h-12 mx-auto text-blue-500 opacity-40" />
          <h3 className="text-sm font-semibold text-slate-700">Enter a Research Topic Above</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Type any proposed paper title or research idea above and click "Evaluate Topic" to receive
            an in-depth publishability verdict, saturated reviewer traps, and real peer-reviewed Q1 literature.
          </p>
        </div>
      )}
    </div>
  );
};
