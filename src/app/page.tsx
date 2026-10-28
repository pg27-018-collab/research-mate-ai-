"use client";

import React, { useState } from "react";
import { Navbar } from "../components/Navbar";
import { DashboardView } from "../components/DashboardView";
import { CitationAuditorView } from "../components/CitationAuditorView";
import { LiteratureReviewView } from "../components/LiteratureReviewView";
import { ResearchAdvisorView } from "../components/ResearchAdvisorView";
import { ProjectsView } from "../components/ProjectsView";
import { SavedSourcesView } from "../components/SavedSourcesView";
import { ExportCenterView } from "../components/ExportCenterView";
import { SettingsView } from "../components/SettingsView";

export default function Home() {
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);

  const handleNavigate = (tab: string, projectId?: number) => {
    if (projectId !== undefined) {
      setActiveProjectId(projectId);
    }
    setCurrentTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 overflow-auto">
        {currentTab === "dashboard" && (
          <DashboardView onNavigate={handleNavigate} />
        )}

        {currentTab === "auditor" && (
          <CitationAuditorView
            initialProjectId={activeProjectId}
            onNavigateToLitReview={(title) => setCurrentTab("review")}
          />
        )}

        {currentTab === "review" && (
          <LiteratureReviewView
            onNavigateToAuditor={(projId) => {
              setActiveProjectId(projId);
              setCurrentTab("auditor");
            }}
          />
        )}

        {currentTab === "advisor" && (
          <ResearchAdvisorView onNavigate={handleNavigate} />
        )}

        {currentTab === "projects" && (
          <ProjectsView onOpenProject={handleNavigate} />
        )}

        {currentTab === "sources" && <SavedSourcesView />}

        {currentTab === "export" && <ExportCenterView />}

        {currentTab === "settings" && <SettingsView />}
      </main>
    </div>
  );
}
