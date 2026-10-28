import { NextResponse } from "next/server";
import { serverSavedSources } from "@/lib/serverStore";

export async function GET() {
  return NextResponse.json(serverSavedSources);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const newId = serverSavedSources.length > 0 ? Math.max(...serverSavedSources.map((s) => s.id)) + 1 : 1;
    const source = {
      id: newId,
      ...data,
      created_at: new Date().toISOString(),
    };
    serverSavedSources.unshift(source);
    return NextResponse.json({ message: "Source saved successfully", id: newId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
