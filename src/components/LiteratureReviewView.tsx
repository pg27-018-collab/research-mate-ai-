"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Search,
  Sparkles,
  Download,
  ShieldCheck,
  FileText,
  ExternalLink,
  ArrowRight,
  BookmarkPlus,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info
} from "lucide-react";
import {
  ScholarlyWork,
  LiteratureReviewData,
  searchScholarly,
  generateLiteratureReview,
  bridgeReviewToAuditor,
  inspectJournalScopus,
  getExportUrl,
  saveSource
} from "../lib/api";

interface LiteratureReviewViewProps {
  onNavigateToAuditor?: (projectId: number) => void;
}

export const LiteratureReviewView: React.FC<LiteratureReviewViewProps> = ({
  onNavigateToAuditor,
}) => {
  // Form State
  const [title, setTitle] = useState("Empirical Evaluation of Automated Citation Auditing and Scholarly Verification");
  const [domain, setDomain] = useState("Computer Science & Informetrics");
  const [researchQuestions, setResearchQuestions] = useState(
    "How do automated citation verification engines compare against manual bibliometric auditing in terms of precision, recall, and false positive rates?"
  );
  const [targetJournal, setTargetJournal] = useState("Journal of Informetrics");
  const [startYear, setStartYear] = useState(2021);
  const [endYear, setEndYear] = useState(2026);
  const [desiredSources, setDesiredSources] = useState(6);
  const [minSections, setMinSections] = useState(3);
  const [citationStyle, setCitationStyle] = useState("APA 7th");

  // Journal Inspection State
  const [journalInfo, setJournalInfo] = useState<any>(null);
  const [inspectingJournal, setInspectingJournal] = useState(false);

  // Discovery & Generation State
  const [discoveredSources, setDiscoveredSources] = useState<ScholarlyWork[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReview, setGeneratedReview] = useState<LiteratureReviewData | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const handleInspectJournal = async () => {
    if (!targetJournal.trim()) return;
    setInspectingJournal(true);
    try {
      const res = await inspectJournalScopus(targetJournal);
      setJournalInfo(res);
    } catch (e) {
      console.error(e);
    } finally {
      setInspectingJournal(false);
    }
  };

  const handleDiscoverSources = async () => {
    if (!title.trim()) return;
    setIsDiscovering(true);
    setStatusMessage("Querying OpenAlex and Crossref registries...");
    try {
      const query = `${title} ${domain}`.trim();
      const results = await searchScholarly(query, startYear, endYear, desiredSources);
      setDiscoveredSources(results);
      setStatusMessage(`Discovered ${results.length} verified publications with citation telemetry.`);
    } catch (err: any) {
      alert("Failed to discover scholarly literature");
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleGenerateReview = async () => {
    if (!title.trim()) return;
    setIsGenerating(true);
    setStatusMessage("Synthesizing multi-section literature review with traceable in-text citations...");
    try {
      const payload = {
        title,
        domain,
        research_questions: researchQuestions,
        target_journal: targetJournal,
        citation_style: citationStyle,
        desired_sources_count: desiredSources,
        min_thematic_sections: minSections,
        sources: discoveredSources.length > 0 ? discoveredSources : undefined,
      };

      const res = await generateLiteratureReview(payload);
      setGeneratedReview(res.review);
      setCreatedProjectId(res.project_id);
      if (res.sources_used && res.sources_used.length > 0) {
        setDiscoveredSources(res.sources_used);
      }
      setStatusMessage("Literature review successfully synthesized!");
    } catch (err: any) {
      alert(err.message || "Failed to generate review");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBridgeToAuditor = async () => {
    if (!createdProjectId) return;
    try {
      await bridgeReviewToAuditor(createdProjectId);
      if (onNavigateToAuditor) {
        onNavigateToAuditor(createdProjectId);
      }
    } catch (e: any) {
      alert(e.message || "Failed to transfer review to auditor");
    }
  };

  const handleSaveToProject = async (src: ScholarlyWork) => {
    try {
      await saveSource({
        project_id: createdProjectId,
        title: src.title,
        authors: src.authors,
        year: src.year,
        journal: src.journal,
        doi: src.doi,
        url: src.url,
        citation_count: src.citation_count,
        citation_source: src.citation_source,
        abstract: src.abstract,
        verification_status: src.verification_status,
        quartile: src.quartile,
      });
      alert(`Source '${src.title.slice(0, 30)}...' saved to project library!`);
    } catch (e) {
      alert("Failed to save source");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Title & Intro */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Mode B: Literature Review Generator
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
              AI Synthesizer & Crossref Grounded
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Discover contemporary scholarly research (post-2020), evaluate citation metrics, verify bibliographic provenance,
            and generate a traceable, thematic literature review with identified research gaps.
          </p>
        </div>

        {createdProjectId && generatedReview && (
          <div className="flex items-center space-x-2">
            <a
              href={getExportUrl("lit-review", createdProjectId)}
              download
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 transition"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Export DOCX</span>
            </a>

            <button
              onClick={handleBridgeToAuditor}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <span>Audit in Citation Auditor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Input Form & Discovery Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ===================== FORM COLUMN (5 cols) ===================== */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Research Requirements</span>
              <span className="text-[11px] text-slate-400 font-normal">* Required fields</span>
            </h2>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Proposed Research Title *
              </label>
              <textarea
                rows={2}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Impact of Transformer Architecture on Academic Referencing Accuracy"
                className="w-full text-xs p-2.5 rounded-md border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            {/* Domain & Scope */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Research Domain
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Citation Style
                </label>
                <select
                  value={citationStyle}
                  onChange={(e) => setCitationStyle(e.target.value)}
                  className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="APA 7th">APA 7th Edition</option>
                  <option value="IEEE">IEEE (Numbered)</option>
                  <option value="Harvard">Harvard (Author-Date)</option>
                  <option value="MLA 9th">MLA 9th Edition</option>
                </select>
              </div>
            </div>

            {/* Target Journal & Scopus Inspector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Target Journal</label>
                <button
                  type="button"
                  onClick={handleInspectJournal}
                  disabled={inspectingJournal || !targetJournal.trim()}
                  className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center space-x-1"
                >
                  <span>{inspectingJournal ? "Checking Scopus..." : "Check Scopus & CiteScore"}</span>
                </button>
              </div>
              <input
                type="text"
                value={targetJournal}
                onChange={(e) => setTargetJournal(e.target.value)}
                placeholder="e.g. Journal of Informetrics or ISSN"
                className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />

              {/* Scopus Inspector Result Badge */}
              {journalInfo && (
                <div className="mt-2 p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{journalInfo.display_name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-600 text-white">
                      {journalInfo.citescore_quartile}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Publisher: <span className="font-medium">{journalInfo.publisher}</span> | ISSN:{" "}
                    {journalInfo.issn_l || "Registered"}
                  </p>
                  <p className="text-[10px] text-blue-800 font-medium">
                    {journalInfo.scopus_coverage} • Mean 2yr Citations: {journalInfo.two_year_mean_citedness}
                  </p>
                </div>
              )}
            </div>

            {/* Research Questions / Objectives */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Research Questions / Objectives (Optional)
              </label>
              <textarea
                rows={2}
                value={researchQuestions}
                onChange={(e) => setResearchQuestions(e.target.value)}
                placeholder="Specific hypotheses or inquiries to focus thematic synthesis..."
                className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-hidden"
              />
            </div>

            {/* Parameters */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Desired Sources ({desiredSources})
                </label>
                <input
                  type="range"
                  min={3}
                  max={12}
                  value={desiredSources}
                  onChange={(e) => setDesiredSources(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Min. Thematic Sections ({minSections})
                </label>
                <input
                  type="range"
                  min={3}
                  max={5}
                  value={minSections}
                  onChange={(e) => setMinSections(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleDiscoverSources}
                disabled={isDiscovering || isGenerating}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-semibold border border-slate-200 flex items-center justify-center space-x-1.5 transition"
              >
                <Search className="w-3.5 h-3.5 text-slate-600" />
                <span>{isDiscovering ? "Searching OpenAlex..." : "1. Discover Literature"}</span>
              </button>

              <button
                type="button"
                onClick={handleGenerateReview}
                disabled={isGenerating || isDiscovering}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs flex items-center justify-center space-x-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGenerating ? "Synthesizing Review..." : "2. Generate Review"}</span>
              </button>
            </div>

            {statusMessage && (
              <p className="text-[11px] text-blue-700 bg-blue-50 p-2 rounded border border-blue-100 text-center font-medium animate-pulse">
                {statusMessage}
              </p>
            )}
          </div>

          {/* Discovered Scholarly Sources Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Verified Scholarly Publications ({discoveredSources.length})
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Post-2020 Prioritized</span>
            </div>

            {discoveredSources.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                <Search className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
                <span>Click "1. Discover Literature" to retrieve verified papers from OpenAlex and Crossref.</span>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {discoveredSources.map((src, idx) => (
                  <div
                    key={idx}
                    className="p-3 border border-slate-200 rounded-lg bg-slate-50/60 hover:bg-slate-50 text-xs space-y-1.5 transition"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-slate-900 flex-1 mr-2 leading-tight">
                        {src.title}
                      </h4>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-800 shrink-0">
                        {src.quartile || "Q1"}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600">
                      {src.authors} ({src.year}) — <span className="italic">{src.journal}</span>
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                      <span className="font-medium text-emerald-700 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{src.citation_count} Citations ({src.citation_source})</span>
                      </span>

                      <div className="flex items-center space-x-2">
                        {src.doi && (
                          <a
                            href={`https://doi.org/${src.doi}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline flex items-center space-x-0.5"
                          >
                            <span>DOI</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleSaveToProject(src)}
                          className="text-slate-600 hover:text-slate-900"
                          title="Save to project library"
                        >
                          <BookmarkPlus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===================== REVIEW OUTPUT COLUMN (7 cols) ===================== */}
        <div className="lg:col-span-7 space-y-4">
          {generatedReview ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-8 space-y-8 font-serif">
              {/* Review Header */}
              <div className="border-b border-slate-200 pb-6 space-y-2">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Synthesized Academic Literature Review
                </span>
                <h2 className="text-xl font-bold text-slate-900 leading-snug">
                  {generatedReview.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs font-sans text-slate-500 pt-1">
                  <span>Domain: <strong>{generatedReview.domain}</strong></span>
                  <span>•</span>
                  <span>Style: <strong>{generatedReview.citation_style}</strong></span>
                  <span>•</span>
                  <span>Length: <strong>{generatedReview.word_count} words</strong></span>
                  <span>•</span>
                  <span>Sections: <strong>{generatedReview.sections.length}</strong></span>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs font-sans text-slate-500 italic">
                {generatedReview.disclaimer}
              </div>

              {/* Thematic Sections */}
              <div className="space-y-6">
                {generatedReview.sections.map((section, idx) => (
                  <div key={idx} className="space-y-3">
                    <h3 className="text-base font-bold text-slate-900 font-serif border-b border-slate-100 pb-1">
                      {idx + 1}. {section.title}
                    </h3>
                    <div className="text-slate-800 text-[13px] leading-relaxed whitespace-pre-wrap">
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Research Gaps Section */}
              {generatedReview.research_gaps && generatedReview.research_gaps.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 space-y-4 font-sans">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <h3 className="text-sm font-bold text-amber-950">
                      Identified Research Gaps & Empirical Limitations
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {generatedReview.research_gaps.map((gap, gIdx) => (
                      <div key={gIdx} className="bg-white p-3 rounded-lg border border-amber-200 shadow-2xs space-y-1 text-xs">
                        <span className="font-bold text-slate-900 block">
                          Gap {gIdx + 1}: {gap.gap_title}
                        </span>
                        <p className="text-slate-600 leading-relaxed">{gap.description}</p>
                        <p className="text-[11px] text-amber-800 font-medium italic">
                          Grounding: {gap.supporting_evidence}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reference List */}
              <div className="border-t border-slate-200 pt-6 space-y-3">
                <h3 className="text-base font-bold text-slate-900 font-serif">References</h3>
                <div className="space-y-2 text-xs font-serif leading-relaxed text-slate-800">
                  {generatedReview.references.map((refStr, rIdx) => (
                    <div key={rIdx} className="pl-6 -indent-6">
                      {refStr}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cross-Mode Bridge Call to Action */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 font-sans bg-blue-50/60 p-4 rounded-xl border border-blue-200">
                <div>
                  <h4 className="text-xs font-bold text-blue-950">Audit this generated review</h4>
                  <p className="text-[11px] text-blue-800">
                    Verify all extracted citations and references inside Citation Auditor (Mode A).
                  </p>
                </div>
                <button
                  onClick={handleBridgeToAuditor}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition"
                >
                  <span>Launch in Auditor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-12 text-center text-slate-400 space-y-3">
              <FileText className="w-12 h-12 mx-auto text-blue-500 opacity-40" />
              <h3 className="text-sm font-semibold text-slate-700">No Review Generated Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Fill in your research title and parameters on the left, click "1. Discover Literature",
                then "2. Generate Review" to synthesize a complete literature review.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
