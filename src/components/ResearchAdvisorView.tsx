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
  ArrowRight,
  Database,
  BarChart3,
  Layers,
  FileText,
  Clock,
  Target
} from "lucide-react";
import { saveSource } from "../lib/api";

interface ResearchAdvisorViewProps {
  onNavigate?: (tab: string, projectId?: number) => void;
}

export const ResearchAdvisorView: React.FC<ResearchAdvisorViewProps> = ({ onNavigate }) => {
  // Mode selection: 'dataset' (Example 3), 'topic' (Example 2), 'auditor' (Example 1)
  const [activeMode, setActiveMode] = useState<"dataset" | "topic" | "auditor">("dataset");

  // Query states
  const [datasetQuery, setDatasetQuery] = useState(
    "I have monthwise data on UPI from April 2020 till Sep 2026. Suggest techniques for playing with the data, correlation parameters, and paper blueprints for journal publication."
  );
  const [topicQuery, setTopicQuery] = useState(
    "Automated Citation Auditing and Scholarly Verification in Academic Manuscripts Using Large Language Models"
  );

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Follow up questions
  const [queryInput, setQueryInput] = useState("");
  const [queryLoading, setQueryLoading] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);

  // Trigger evaluation
  const handleEvaluate = async (customQuery?: string, customType?: "dataset_blueprint" | "topic_evaluation") => {
    const isDataset = (customType ? customType === "dataset_blueprint" : activeMode === "dataset");
    const query = customQuery || (isDataset ? datasetQuery : topicQuery);
    if (!query.trim()) return;

    setLoading(true);
    setConversations([]);
    try {
      const res = await fetch("/api/advisor/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: query,
          analysis_type: isDataset ? "dataset_blueprint" : "topic_evaluation",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (e) {
      alert("Failed to evaluate research query");
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
        body: JSON.stringify({
          topic: result.topic,
          analysis_type: result.analysis_type || (activeMode === "dataset" ? "dataset_blueprint" : "topic_evaluation"),
          follow_up_query: currentQ,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.follow_up) {
          setConversations((prev) => [...prev, data.follow_up]);
        }
      }
    } catch (e) {
      alert("Failed to resolve follow-up query");
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md space-y-5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-blue-300" />
          <span>Research Advisor & Scopus Q1 Publication Blueprint</span>
        </div>

        <div className="space-y-2 max-w-4xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Academic Research Advisor: Publishability & Rigorous Methodology
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Resolve academic research queries with strong, verifiable sources (real DOIs, Scopus CiteScores & OpenAlex citation counts) — zero vague advice. Select one of the three core research workflows below:
          </p>
        </div>

        {/* 3 Query Mode Switchers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {/* Example 3: Dataset to Paper */}
          <button
            onClick={() => {
              setActiveMode("dataset");
              setResult(null);
            }}
            className={`p-3.5 rounded-xl text-left border transition flex flex-col justify-between space-y-2 ${
              activeMode === "dataset"
                ? "bg-blue-600/30 border-blue-400 ring-2 ring-blue-400 text-white"
                : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Example 3 Workflow
              </span>
              <Database className="w-4 h-4 text-blue-300" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Empirical Dataset to Paper Blueprint</h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Monthwise time-series data (e.g. UPI 2020–2026) -> Techniques, correlations & blueprints.
              </p>
            </div>
          </button>

          {/* Example 2: Lit Review & Topic */}
          <button
            onClick={() => {
              setActiveMode("topic");
              setResult(null);
            }}
            className={`p-3.5 rounded-xl text-left border transition flex flex-col justify-between space-y-2 ${
              activeMode === "topic"
                ? "bg-indigo-600/30 border-indigo-400 ring-2 ring-indigo-400 text-white"
                : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Example 2 Workflow
              </span>
              <BookOpen className="w-4 h-4 text-indigo-300" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Scopus Lit Review & Publishability</h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Propose title for Scopus A journal -> &ge; 3 sections, post-2020 verifiable works.
              </p>
            </div>
          </button>

          {/* Example 1: Citation Discrepancy Auditor */}
          <button
            onClick={() => {
              setActiveMode("auditor");
              setResult(null);
            }}
            className={`p-3.5 rounded-xl text-left border transition flex flex-col justify-between space-y-2 ${
              activeMode === "auditor"
                ? "bg-purple-600/30 border-purple-400 ring-2 ring-purple-400 text-white"
                : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-400/30">
                Example 1 Workflow
              </span>
              <ShieldAlert className="w-4 h-4 text-purple-300" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Citation Discrepancy Auditor</h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                1) Cited not in ref 2) Ref not cited 3) Inconsistent/incorrect in-text citation format.
              </p>
            </div>
          </button>
        </div>

        {/* Input Controls Based on Active Mode */}
        {activeMode === "dataset" && (
          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>Describe your empirical dataset and target objective:</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <textarea
                rows={2}
                value={datasetQuery}
                onChange={(e) => setDatasetQuery(e.target.value)}
                placeholder="E.g., I have monthwise data on UPI from April 2020 till Sep 2026. Suggest techniques for playing with the data and parameters for correlation..."
                className="flex-1 p-3 bg-white text-slate-900 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-400 font-medium resize-none"
              />
              <button
                onClick={() => handleEvaluate(datasetQuery, "dataset_blueprint")}
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition flex items-center justify-center space-x-2 shrink-0 self-end sm:self-auto h-full"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? "Generating Blueprint..." : "Generate Blueprint"}</span>
              </button>
            </div>

            {/* Quick Presets for Example 3 */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 text-[11px] font-medium">Quick Example Datasets:</span>
              <button
                onClick={() => {
                  const q = "I have monthwise data on UPI from April 2020 till Sep 2026 of UPI. Do suggest me what can I do with it to prepare for a journal paper publication. a) Suggest techniques for playing with the data b) suggest parameters on which I can draw correlation with this set of data";
                  setDatasetQuery(q);
                  handleEvaluate(q, "dataset_blueprint");
                }}
                className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-400/30 text-[11px] font-semibold transition"
              >
                Monthwise UPI Data (Apr 2020 - Sep 2026)
              </button>
              <button
                onClick={() => {
                  const q = "I have quarterly ESG disclosure scores and corporate bond spread volatility data for 500 firms from 2020 to 2025. Suggest empirical modeling techniques and macroeconomic correlation parameters for a Scopus Q1 paper.";
                  setDatasetQuery(q);
                  handleEvaluate(q, "dataset_blueprint");
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 text-[11px] font-medium transition"
              >
                Quarterly ESG & Bond Spreads (2020–2025)
              </button>
            </div>
          </div>
        )}

        {activeMode === "topic" && (
          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Enter Proposed Paper Title for Scopus A Evaluation &amp; Literature Review:</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={topicQuery}
                onChange={(e) => setTopicQuery(e.target.value)}
                placeholder="Enter proposed title for Scopus A-indexed journal..."
                className="flex-1 px-4 py-2.5 bg-white text-slate-900 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-400 font-medium"
              />
              <button
                onClick={() => handleEvaluate(topicQuery, "topic_evaluation")}
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition flex items-center justify-center space-x-2 shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? "Analyzing..." : "Evaluate Title"}</span>
              </button>
            </div>

            {/* Bridge to Literature Review generator */}
            {onNavigate && (
              <div className="flex items-center justify-between bg-white/10 p-2.5 rounded-xl border border-white/10 text-xs">
                <span className="text-slate-300">
                  Want to synthesize full 3-section literature review with post-2020 OpenAlex papers immediately?
                </span>
                <button
                  onClick={() => onNavigate("review")}
                  className="px-3 py-1 bg-white text-slate-900 font-bold rounded-lg text-xs hover:bg-slate-100 flex items-center space-x-1 shrink-0"
                >
                  <span>Open Literature Review Generator</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}

        {activeMode === "auditor" && (
          <div className="space-y-4 pt-2 bg-white/10 p-5 rounded-xl border border-white/15">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-purple-300" />
                <span>Citation Discrepancy & Reference Integrity Auditor (Mode A)</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                This workflow specifically resolves your 3 manuscript citation verification queries:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-1">
                <span className="font-extrabold text-purple-300 block">Query 1: Missing in References</span>
                <p className="text-slate-300 text-[11px]">
                  Detects all in-text citations (e.g. <em>(Vaswani et al., 2017)</em>) that fail to appear in the bibliography list.
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-1">
                <span className="font-extrabold text-purple-300 block">Query 2: Uncited References</span>
                <p className="text-slate-300 text-[11px]">
                  Detects reference entries present in the bibliography that are never cited in the body of the manuscript.
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-1">
                <span className="font-extrabold text-purple-300 block">Query 3: Incorrectly Represented</span>
                <p className="text-slate-300 text-[11px]">
                  Flags author name misspellings, publication year mismatches, broken DOIs, and improper "et al." usage.
                </p>
              </div>
            </div>

            {onNavigate && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => onNavigate("auditor", 1)}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Launch Citation Auditor on Preloaded Manuscript</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Results Display */}
      {result ? (
        <div className="space-y-6">
          {/* Verdict Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {result.analysis_type === "dataset_blueprint" ? "Empirical Publication Feasibility" : "Publishability Verdict"}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Evaluation: <strong className="text-slate-800">{result.is_publishable ? "Highly Publishable" : "Needs Revision"}</strong>
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  Scopus Q1 / CiteScore &gt; 3.0 Standard
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
            <div className="shrink-0 p-5 bg-gradient-to-b from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-200 flex flex-col items-center justify-center text-center w-full md:w-52 shadow-2xs">
              <span className="text-3xl font-black text-blue-700">
                {result.publishability_score}%
              </span>
              <span className="text-xs font-bold text-slate-700 mt-0.5">Scopus Acceptance Index</span>
              <span className="text-[10px] text-slate-500 mt-1 font-medium">Peer-Review Readiness</span>
            </div>
          </div>

          {/* IF RESULT HAS DATA TECHNIQUES (Example 3 Results) */}
          {result.data_techniques && (
            <div className="space-y-6">
              {/* Part A: Techniques for Playing With The Data */}
              <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        (a) Techniques for Playing With &amp; Modeling The Data (Econometric &amp; ML)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Rigorous statistical techniques required by Scopus Q1 reviewers for longitudinal time-series data
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-blue-100 text-blue-800">
                    4 Core Methodologies
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.data_techniques.map((tech: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 hover:bg-slate-50 transition"
                    >
                      <h4 className="text-xs font-bold text-blue-950 flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                        <span>{tech.technique_name}</span>
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed font-sans">
                        {tech.description}
                      </p>
                      <div className="pt-2 border-t border-slate-200/80">
                        <p className="text-[11px] text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100 font-medium">
                          <strong>Scopus Reviewer Value:</strong> {tech.reviewer_value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Part B: Parameters for Drawing Correlation */}
              <div className="bg-white rounded-2xl border border-indigo-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        (b) Parameters &amp; Exogenous Variables to Draw Correlation
                      </h3>
                      <p className="text-xs text-slate-500">
                        External macro datasets and verifiable testable academic hypotheses
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-indigo-100 text-indigo-800">
                    Empirical Grounding
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {result.correlation_parameters.map((param: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 bg-indigo-50/30 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-100 text-indigo-800 inline-block">
                          Category {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">
                          {param.parameter_category}
                        </h4>
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                            Correlation Variables:
                          </span>
                          <ul className="space-y-1">
                            {param.variables.map((v: string, vIdx: number) => (
                              <li key={vIdx} className="text-[11px] text-slate-700 flex items-center space-x-1.5 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                                <span>{v}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 space-y-1.5">
                        <p className="text-[11px] text-slate-600">
                          <strong>Source:</strong> {param.data_source}
                        </p>
                        <p className="text-[11px] text-indigo-900 bg-indigo-50 p-2 rounded-lg border border-indigo-100 italic">
                          {param.hypothesis}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Part C: 3 Ready-to-Publish Scopus Q1 Paper Blueprints */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        (c) 3 Ready-to-Publish Scopus Q1 Journal Paper Blueprints
                      </h3>
                      <p className="text-xs text-slate-500">
                        Complete publishable manuscripts structured for immediate execution
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">
                    Scopus A / Q1 Targets
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {result.manuscript_blueprints.map((paper: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-600 text-white">
                            Paper Blueprint {idx + 1}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">
                          {paper.paper_title}
                        </h4>
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                          <p className="text-[11px] font-semibold text-blue-900">
                            <strong>Target Journal:</strong> {paper.target_journal}
                          </p>
                        </div>
                        <div className="text-[11px] text-slate-700">
                          <strong>Methodology Flow:</strong>
                          <p className="mt-0.5 font-mono text-[10px] bg-slate-100 p-2 rounded text-slate-800">
                            {paper.methodology_summary}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-[11px] text-slate-600">
                          <strong>Key Academic Contribution:</strong> {paper.contribution}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Saturated Pitfalls vs Novel Hooks (If Topic Evaluation Query) */}
          {result.saturated_pitfalls && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Red: What Reviewers Reject */}
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
          )}

          {/* Strong Verifiable Scholarly Sources (Real DOIs & Citations) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Strong Verifiable Scholarly Sources (Ground Your Research Here)
                  </h3>
                  <p className="text-xs text-slate-500">
                    High-citation post-2020 peer-reviewed papers indexed with real DOIs
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                100% Real DOIs &amp; Citations
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.verified_sources?.map((paper: any, idx: number) => (
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

          {/* Interactive Follow-up Query Console */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Ask Specific Follow-up Research Queries
                </h3>
                <p className="text-xs text-slate-500">
                  Ask about handling stationarity, structural breaks, reviewer objections, or baseline comparison
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
          <h3 className="text-sm font-semibold text-slate-700">Select a Mode and Click Generate / Evaluate Above</h3>
          <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
            Choose <strong>Example 3</strong> for Empirical Datasets (such as UPI 2020–2026), <strong>Example 2</strong> for Scopus A Literature Reviews, or <strong>Example 1</strong> for Citation Discrepancy Auditing.
          </p>
        </div>
      )}
    </div>
  );
};
