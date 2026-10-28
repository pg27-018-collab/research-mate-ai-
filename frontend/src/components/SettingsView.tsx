"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Key,
  Database,
  BookOpen,
  Check,
  ShieldCheck,
  Sparkles,
  Info
} from "lucide-react";

export const SettingsView: React.FC = () => {
  const [llmProvider, setLlmProvider] = useState("gemini");
  const [apiKey, setApiKey] = useState("");
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [defaultCitationStyle, setDefaultCitationStyle] = useState("APA 7th");
  const [openAlexEmail, setOpenAlexEmail] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    // Load local storage preferences if available
    const saved = localStorage.getItem("researchmate_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.llmProvider) setLlmProvider(parsed.llmProvider);
        if (parsed.apiKey) setApiKey(parsed.apiKey);
        if (parsed.ollamaUrl) setOllamaUrl(parsed.ollamaUrl);
        if (parsed.defaultCitationStyle) setDefaultCitationStyle(parsed.defaultCitationStyle);
        if (parsed.openAlexEmail) setOpenAlexEmail(parsed.openAlexEmail);
      } catch (e) {}
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(
      "researchmate_settings",
      JSON.stringify({
        llmProvider,
        apiKey,
        ollamaUrl,
        defaultCitationStyle,
        openAlexEmail,
      })
    );
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Application Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure AI reasoning providers, scholarly registry connectors, and default academic formatting.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* AI Integration Settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">AI Synthesizer & LLM Provider</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Select AI Engine</label>
              <select
                value={llmProvider}
                onChange={(e) => setLlmProvider(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="gemini">Google Gemini (Recommended - Fast & Scholarly)</option>
                <option value="openai">OpenAI GPT-4o / GPT-4</option>
                <option value="ollama">Local Ollama Endpoint (Offline & Private)</option>
                <option value="heuristic">Built-in Academic Deterministic Engine (No Key Needed)</option>
              </select>
            </div>

            {llmProvider !== "heuristic" && llmProvider !== "ollama" && (
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  API Key ({llmProvider.toUpperCase()})
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-... or AIza..."
                  className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Stored securely in your local environment. Never shared or hardcoded into client bundles.
                </p>
              </div>
            )}

            {llmProvider === "ollama" && (
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ollama Base URL</label>
                <input
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            )}
          </div>
        </div>

        {/* Scholarly Providers Settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Database className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Scholarly Data Registries</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                OpenAlex Polite Pool Email (Optional)
              </label>
              <input
                type="email"
                value={openAlexEmail}
                onChange={(e) => setOpenAlexEmail(e.target.value)}
                placeholder="your.email@university.edu"
                className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                OpenAlex provides a dedicated high-throughput polite queue for registered academic emails.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-[11px] text-slate-600">
                <p className="font-semibold text-slate-800">Connected Free Providers:</p>
                <p>• <strong>OpenAlex API</strong>: Works, authors, affiliations, citations & 2yr mean citedness.</p>
                <p>• <strong>Crossref API</strong>: Official bibliographic DOI resolution & publisher metadata.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Default Academic Preferences */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Academic Formatting Defaults</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Default Citation Style
              </label>
              <select
                value={defaultCitationStyle}
                onChange={(e) => setDefaultCitationStyle(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="APA 7th">APA 7th Edition</option>
                <option value="IEEE">IEEE (Numbered)</option>
                <option value="Harvard">Harvard (Author-Date)</option>
                <option value="MLA 9th">MLA 9th Edition</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200 flex items-center space-x-1">
              <Check className="w-3.5 h-3.5" />
              <span>Settings saved successfully!</span>
            </span>
          )}
          <button
            type="submit"
            className="ml-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
