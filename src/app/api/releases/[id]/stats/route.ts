import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { getReleaseById } from "@/lib/db/releases";

type Params = { params: Promise<{ id: string }> };

/** GET /api/releases/:id/stats — admin only. */
export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const release = await getReleaseById(id);
  if (!release) return NextResponse.json({ error: "Release not found" }, { status: 404 });

  return NextResponse.json({
    id: release.id,
    version: release.version,
    platform: release.platform,
    status: release.status,
    downloadCount: release.downloadCount,
    publishedAt: release.publishedAt,
  });
}
