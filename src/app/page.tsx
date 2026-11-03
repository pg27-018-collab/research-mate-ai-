"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { ResearchSearchView } from "../components/ResearchSearchView";
import { CitationAuditorView } from "../components/CitationAuditorView";
import { LiteratureReviewView } from "../components/LiteratureReviewView";
import { ResearchAdvisorView } from "../components/ResearchAdvisorView";
import { SavedSourcesDrawer } from "../components/SavedSourcesDrawer";
import { fetchSavedSources } from "../lib/api";

export default function Home() {
  // Default to Literature Review (Research Requirements) - the main platform centerpiece
  const [currentTab, setCurrentTab] = useState<"search" | "auditor" | "review" | "advisor">("review");
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [showSavedDrawer, setShowSavedDrawer] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    // Initial fetch of saved sources count
    fetchSavedSources()
      .then((data) => setSavedCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setSavedCount(0));
  }, []);

  const handleNavigate = (tab: string, projectId?: number) => {
    if (projectId !== undefined) {
      setActiveProjectId(projectId);
    }
    if (tab === "search" || tab === "auditor" || tab === "review" || tab === "advisor") {
      setCurrentTab(tab);
    } else {
      // Fallback any legacy links to search or auditor
      setCurrentTab("search");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Sleek, Modern Glassmorphism Navbar with Only the 4 Essential Workflows */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => handleNavigate(tab)}
        savedSourcesCount={savedCount}
        onOpenSavedSources={() => setShowSavedDrawer(true)}
      />

      {/* Main Focus Area */}
      <main className="flex-1 overflow-auto">
        {/* 1. AI Research Search Engine (Ask AI) */}
        {currentTab === "search" && (
          <ResearchSearchView onNavigate={handleNavigate} />
        )}

        {/* 2. Citation Auditor (Mode A) */}
        {currentTab === "auditor" && (
          <CitationAuditorView
            initialProjectId={activeProjectId}
            onNavigateToLitReview={() => handleNavigate("review")}
          />
        )}

        {/* 3. Literature Review Generator (Mode B) */}
        {currentTab === "review" && (
          <LiteratureReviewView
            initialProjectId={activeProjectId}
            onNavigateToAuditor={(projId) => {
              setActiveProjectId(projId);
              handleNavigate("auditor");
            }}
          />
        )}

        {/* 4. Research Advisor & Blueprints (Example 3 & Publishability) */}
        {currentTab === "advisor" && (
          <ResearchAdvisorView onNavigate={handleNavigate} />
        )}
      </main>

      {/* Slide-over Drawer for Saved Sources (Accessible without taking up a full navbar tab) */}
      <SavedSourcesDrawer
        isOpen={showSavedDrawer}
        onClose={() => setShowSavedDrawer(false)}
        onUpdateCount={(count) => setSavedCount(count)}
      />
    </div>
  );
}
