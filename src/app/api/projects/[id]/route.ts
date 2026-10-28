import { NextResponse } from "next/server";
import { serverProjects } from "@/lib/serverStore";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const project = serverProjects.find((p) => p.id === id);
  if (!project) {
    return NextResponse.json({ detail: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: project.id,
    title: project.title,
    mode: project.mode,
    status: project.status,
    target_journal: project.target_journal,
    citation_style: project.citation_style,
    created_at: project.created_at,
    document: project.document || null,
    issues: project.issues || [],
    review: project.review || null,
    saved_sources: project.saved_sources || [],
  });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const index = serverProjects.findIndex((p) => p.id === id);
  if (index === -1) {
    return NextResponse.json({ detail: "Project not found" }, { status: 404 });
  }
  serverProjects.splice(index, 1);
  return NextResponse.json({ message: "Project deleted successfully" });
}
