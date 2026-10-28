import { NextResponse } from "next/server";
import { serverProjects } from "@/lib/serverStore";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const issueId = parseInt(params.id);
  const data = await req.json();

  for (const proj of serverProjects) {
    if (proj.issues) {
      const issue = proj.issues.find((i) => i.id === issueId);
      if (issue) {
        if (data.status) issue.status = data.status;
        if (data.cited_text) issue.cited_text = data.cited_text;
        if (data.suggested_correction) issue.suggested_correction = data.suggested_correction;
        return NextResponse.json({ message: "Issue updated successfully", status: issue.status });
      }
    }
  }

  return NextResponse.json({ detail: "Issue not found" }, { status: 404 });
}
