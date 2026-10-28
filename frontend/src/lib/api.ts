const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface ProjectSummary {
  id: number;
  title: string;
  mode: string;
  status: string;
  target_journal?: string;
  citation_style: string;
  created_at: string;
  has_document: boolean;
  doc_filename?: string;
  total_issues: number;
  open_issues: number;
  has_review: boolean;
}

export interface CitationIssue {
  id: number;
  category: string;
  severity: string;
  status: string;
  cited_text: string;
  author?: string;
  year?: string;
  page: number;
  paragraph: number;
  confidence: number;
  explanation: string;
  suggested_correction?: string;
  verified_source?: any;
  created_at: string;
}

export interface TocSection {
  number: string;
  name: string;
  heading: string;
  page: number;
  bbox?: number[];
}

export interface DocumentData {
  id: number;
  filename: string;
  file_type: string;
  page_count: number;
  word_count: number;
  structure: TocSection[];
  full_text: string;
}

export interface ThematicSection {
  section_number: number;
  title: string;
  content: string;
  sources_cited: string[];
}

export interface ResearchGap {
  gap_title: string;
  description: string;
  supporting_evidence: string;
}

export interface LiteratureReviewData {
  id?: number;
  title: string;
  domain?: string;
  target_journal?: string;
  citation_style: string;
  sections: ThematicSection[];
  research_gaps: ResearchGap[];
  references: string[];
  word_count: number;
  created_at?: string;
  disclaimer?: string;
}

export interface ScholarlyWork {
  title: string;
  authors: string;
  year?: number;
  journal?: string;
  doi?: string;
  url?: string;
  citation_count: number;
  citation_source: string;
  abstract?: string;
  verification_status: string;
  relevance_score: number;
  quartile?: string;
  open_access?: boolean;
  composite_ranking?: number;
}

export interface DashboardStats {
  total_projects: number;
  citation_issues_detected: number;
  issues_resolved: number;
  literature_reviews_generated: number;
  saved_sources_count: number;
  recent_projects: ProjectSummary[];
  recent_activity: { id: number; action_type: string; description: string; created_at: string }[];
}

// API methods
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
  if (!res.ok) throw new Error("Failed to load dashboard stats");
  return res.json();
}

export async function fetchProjects(): Promise<ProjectSummary[]> {
  const res = await fetch(`${API_BASE_URL}/api/projects`);
  if (!res.ok) throw new Error("Failed to load projects");
  return res.json();
}

export async function createProject(data: { title: string; mode?: string; target_journal?: string; citation_style?: string }) {
  const res = await fetch(`${API_BASE_URL}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}

export async function fetchProjectDetails(id: number) {
  const res = await fetch(`${API_BASE_URL}/api/projects/${id}`);
  if (!res.ok) throw new Error("Failed to fetch project details");
  return res.json();
}

export async function deleteProject(id: number) {
  const res = await fetch(`${API_BASE_URL}/api/projects/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete project");
  return res.json();
}

export async function uploadDocument(projectId: number, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export async function updateIssue(issueId: number, data: { status?: string; cited_text?: string; suggested_correction?: string }) {
  const res = await fetch(`${API_BASE_URL}/api/issues/${issueId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update issue");
  return res.json();
}

export async function searchScholarly(query: string, startYear = 2020, endYear = 2026, limit = 15): Promise<ScholarlyWork[]> {
  const res = await fetch(`${API_BASE_URL}/api/scholarly/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, start_year: startYear, end_year: endYear, limit }),
  });
  if (!res.ok) throw new Error("Scholarly search failed");
  const data = await res.json();
  return data.results || [];
}

export async function inspectJournalScopus(journalName: string) {
  const res = await fetch(`${API_BASE_URL}/api/scholarly/inspect-journal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ journal_name: journalName }),
  });
  if (!res.ok) throw new Error("Journal inspection failed");
  return res.json();
}

export async function generateLiteratureReview(payload: {
  project_id?: number;
  title: string;
  domain?: string;
  research_questions?: string;
  target_journal?: string;
  citation_style: string;
  desired_sources_count?: number;
  min_thematic_sections?: number;
  sources?: ScholarlyWork[];
}) {
  const res = await fetch(`${API_BASE_URL}/api/lit-review/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Literature review generation failed");
  return res.json();
}

export async function bridgeReviewToAuditor(projectId: number) {
  const res = await fetch(`${API_BASE_URL}/api/lit-review/${projectId}/audit-to-project`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to bridge review to citation auditor");
  return res.json();
}

export async function fetchSavedSources() {
  const res = await fetch(`${API_BASE_URL}/api/sources`);
  if (!res.ok) throw new Error("Failed to fetch saved sources");
  return res.json();
}

export async function saveSource(source: any) {
  const res = await fetch(`${API_BASE_URL}/api/sources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(source),
  });
  if (!res.ok) throw new Error("Failed to save source");
  return res.json();
}

export async function deleteSource(id: number) {
  const res = await fetch(`${API_BASE_URL}/api/sources/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete source");
  return res.json();
}

export function getExportUrl(type: "lit-review" | "audit-report" | "bibtex", projectId: number) {
  if (type === "lit-review") return `${API_BASE_URL}/api/export/lit-review/${projectId}/docx`;
  if (type === "audit-report") return `${API_BASE_URL}/api/export/audit-report/${projectId}/docx`;
  return `${API_BASE_URL}/api/export/sources/${projectId}/bibtex`;
}
