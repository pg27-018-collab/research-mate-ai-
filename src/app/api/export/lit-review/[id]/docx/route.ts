import { NextResponse } from "next/server";
import { serverProjects } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const projectId = parseInt(params.id, 10);
  const project = serverProjects.find((p) => p.id === projectId) || serverProjects[0];
  const review = project?.review || {
    title: project?.title || "Literature Review",
    domain: "Informetrics",
    citation_style: "APA 7th",
    sections: [],
    references: []
  };

  const content = `# ${review.title}
Domain: ${review.domain || "Informetrics"}
Citation Style: ${review.citation_style || "APA 7th"}
Target Journal: ${project?.target_journal || "Journal of Informetrics"}

---

${(review.sections || []).map((s: any) => `## ${s.section_number || ""}. ${s.title}\n\n${s.content}\n`).join("\n")}

## References
${(review.references || []).map((r: string, idx: number) => `[${idx + 1}] ${r}`).join("\n")}
`;

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="Literature_Review_${projectId}.md"`,
    },
  });
}
