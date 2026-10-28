import { NextResponse } from "next/server";
import { serverProjects, ServerProject } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const summaries = serverProjects.map((p) => ({
    id: p.id,
    title: p.title,
    mode: p.mode,
    status: p.status,
    target_journal: p.target_journal,
    citation_style: p.citation_style,
    created_at: p.created_at,
    has_document: p.has_document,
    doc_filename: p.doc_filename,
    total_issues: p.issues ? p.issues.length : 0,
    open_issues: p.issues ? p.issues.filter((i) => i.status === "open").length : 0,
    has_review: p.has_review,
  }));
  return NextResponse.json(summaries);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newProj: ServerProject = {
      id: serverProjects.length > 0 ? Math.max(...serverProjects.map((p) => p.id)) + 1 : 1,
      title: body.title || "Untitled Project",
      mode: body.mode || "citation_auditor",
      status: "active",
      target_journal: body.target_journal || undefined,
      citation_style: body.citation_style || "APA 7th",
      created_at: new Date().toISOString(),
      has_document: false,
      total_issues: 0,
      open_issues: 0,
      has_review: false,
      issues: [],
      saved_sources: [],
    };
    serverProjects.push(newProj);
    return NextResponse.json(newProj);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
