import { NextResponse } from "next/server";
import { serverProjects, serverSavedSources } from "@/lib/serverStore";

export async function GET() {
  const totalProjects = serverProjects.length;
  let totalIssues = 0;
  let resolvedIssues = 0;
  let totalReviews = 0;

  for (const p of serverProjects) {
    if (p.issues) {
      totalIssues += p.issues.length;
      resolvedIssues += p.issues.filter((i) => i.status === "resolved").length;
    }
    if (p.has_review) {
      totalReviews += 1;
    }
  }

  const recentProjects = serverProjects.slice(-5).reverse();
  const recentActivity = [
    {
      id: 1,
      action_type: "audit_completed",
      description: "Audited 'sample_academic_paper.pdf' with 6 detected citation discrepancies.",
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 2,
      action_type: "review_generated",
      description: "Synthesized 3 thematic sections on Retrieval-Augmented Generation.",
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  return NextResponse.json({
    total_projects: totalProjects,
    citation_issues_detected: totalIssues,
    issues_resolved: resolvedIssues,
    literature_reviews_generated: totalReviews,
    saved_sources_count: serverSavedSources.length,
    recent_projects: recentProjects,
    recent_activity: recentActivity,
  });
}
