import { NextResponse } from "next/server";
import { serverSavedSources } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const index = serverSavedSources.findIndex((s) => s.id === id);
    if (index !== -1) {
      serverSavedSources.splice(index, 1);
    }
    return NextResponse.json({ message: "Source deleted successfully" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to delete source" }, { status: 400 });
  }
}
