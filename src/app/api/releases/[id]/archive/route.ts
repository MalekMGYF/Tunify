import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { archiveRelease, getReleaseById, toAdminRelease } from "@/lib/db/releases";

type Params = { params: Promise<{ id: string }> };

/** POST /api/releases/:id/archive — admin only. Keeps the release and its file, just removes "current" status. */
export async function POST(_req: NextRequest, { params }: Params) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const existing = await getReleaseById(id);
  if (!existing) return NextResponse.json({ error: "Release not found" }, { status: 404 });

  const archived = await archiveRelease(id);
  return NextResponse.json({ release: toAdminRelease(archived) });
}
