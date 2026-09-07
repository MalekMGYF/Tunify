export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { createRelease, listAllReleasesForAdmin, listPublishedReleases, toAdminRelease, toPublicRelease } from "@/lib/db/releases";
import { createReleaseMetaSchema } from "@/lib/validation/schemas";

/**
 * GET /api/releases
 * Public: returns only published releases, safe fields only.
 * Admin (authenticated): pass ?all=1 to see every release including drafts/archived.
 */
export async function GET(req: NextRequest) {
  const wantsAll = req.nextUrl.searchParams.get("all") === "1";

  if (wantsAll) {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;
    const releases = await listAllReleasesForAdmin();
    return NextResponse.json({ releases: releases.map(toAdminRelease) });
  }

  const releases = await listPublishedReleases();
  return NextResponse.json({ releases: releases.map(toPublicRelease) });
}

/**
 * POST /api/releases
 * Admin only. Creates a release record as a DRAFT with no file attached
 * yet — attach the binary afterwards via POST /api/releases/:id/upload.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = createReleaseMetaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid release data" }, { status: 400 });
  }

  const release = await createRelease({
    ...parsed.data,
    fileName: "",
    storagePath: "",
    fileSize: 0,
    mimeType: "",
  });

  return NextResponse.json({ release: toAdminRelease(release) }, { status: 201 });
}
