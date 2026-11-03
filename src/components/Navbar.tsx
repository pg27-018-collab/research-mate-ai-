"use client";

import React from "react";
import {
  FileSearch,
  BookOpen,
  GraduationCap,
  Search,
  BookmarkCheck,
  ShieldCheck,
  Layers,
  Compass
} from "lucide-react";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  savedSourcesCount?: number;
  onOpenSavedSources?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  savedSourcesCount = 0,
  onOpenSavedSources,
}) => {
  // Navigation tabs with clean, meaningful icons (no sparkles)
  const navItems = [
    {
      id: "review",
      label: "Literature Review",
      shortLabel: "Lit Review",
      icon: BookOpen,
      badge: "Mode B",
      color: "from-blue-600 to-indigo-600",
    },
    {
      id: "auditor",
      label: "Citation Auditor",
      shortLabel: "Auditor",
      icon: FileSearch,
      badge: "Mode A",
      color: "from-indigo-600 to-purple-600",
    },
    {
      id: "search",
      label: "AI Research Search",
      shortLabel: "AI Search",
      icon: Search,
      badge: "Scholarly",
      color: "from-blue-600 to-cyan-600",
    },
    {
      id: "advisor",
      label: "Publishability AI",
      shortLabel: "Advisor",
      icon: Compass,
      badge: "Blueprint",
      color: "from-emerald-600 to-teal-600",
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none group"
            onClick={() => setCurrentTab("review")}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Research<span className="text-indigo-600">Mate</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 rounded-full border border-indigo-200/60 uppercase tracking-wider">
                  AI Core
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Informetrics &amp; Scholarly Verification Suite
              </p>
            </div>
          </div>

          {/* Segmented Pill Navigation - Clean, Modern & De-cluttered */}
          <nav className="hidden lg:flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/70 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-white text-indigo-700 shadow-sm border border-slate-200/80 font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 transition-colors ${
                      isActive ? "text-indigo-600" : "text-slate-500"
                    }`}
                  />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                        isActive
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-slate-200/70 text-slate-600"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Elements: Saved Sources & Live Telemetry */}
          <div className="flex items-center space-x-2.5">
            {/* Saved Sources Quick Drawer Button */}
            {onOpenSavedSources && (
              <button
                onClick={onOpenSavedSources}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
                title="View Saved Sources Library"
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Saved Sources</span>
                {savedSourcesCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 text-[10px] font-extrabold">
                    {savedSourcesCount}
                  </span>
                )}
              </button>
            )}

            {/* Live OpenAlex & Crossref Registry Status */}
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200/80 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>OpenAlex &amp; Crossref Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Subnav */}
      <div className="lg:hidden flex overflow-x-auto px-4 py-2 border-t border-slate-100 space-x-2 bg-slate-50/80">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 whitespace-nowrap rounded-lg text-xs font-semibold transition ${
                isActive
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.shortLabel}</span>
              {item.badge && (
                <span
                  className={`text-[9px] px-1 rounded ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
