import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import {
  deleteReleaseRecord,
  getReleaseById,
  toAdminRelease,
  toPublicRelease,
  updateReleaseMeta,
} from "@/lib/db/releases";
import { getStorageProvider } from "@/lib/storage";
import { updateReleaseMetaSchema } from "@/lib/validation/schemas";

type Params = { params: Promise<{ id: string }> };

/** GET /api/releases/:id — public if published/archived, admin-only if still a draft. */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const release = await getReleaseById(id);
  if (!release) {
    return NextResponse.json({ error: "Release not found" }, { status: 404 });
  }

  if (release.status === "DRAFT") {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ error: "Release not found" }, { status: 404 });
    return NextResponse.json({ release: toAdminRelease(release) });
  }

  return NextResponse.json({ release: toPublicRelease(release) });
}

/** PUT /api/releases/:id — admin only. Updates metadata; never touches the stored file. */
export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const existing = await getReleaseById(id);
  if (!existing) return NextResponse.json({ error: "Release not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = updateReleaseMetaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid release data" }, { status: 400 });
  }

  const updated = await updateReleaseMeta(id, parsed.data);
  return NextResponse.json({ release: toAdminRelease(updated) });
}

/**
 * DELETE /api/releases/:id — admin only.
 * Refuses to delete a release that is currently the live/current one,
 * to avoid accidentally pulling the rug out from under public downloads.
 * Archive (or publish something else first) before deleting.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const existing = await getReleaseById(id);
  if (!existing) return NextResponse.json({ error: "Release not found" }, { status: 404 });

  if (existing.isCurrent) {
    return NextResponse.json(
      { error: "This is the current published release. Archive it or publish another release first, then delete." },
      { status: 409 }
    );
  }

  if (existing.storagePath) {
    const storage = getStorageProvider();
    try {
      await storage.delete(existing.storagePath);
    } catch {
      // If the file is already gone, proceed with deleting the record anyway.
    }
  }

  await deleteReleaseRecord(id);
  return NextResponse.json({ ok: true });
}
