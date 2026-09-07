import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { getReleaseById, publishRelease, toAdminRelease } from "@/lib/db/releases";
import { getStorageProvider } from "@/lib/storage";

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/releases/:id/publish — admin only.
 * Refuses to publish if no file was ever uploaded, or if the uploaded
 * file has gone missing from storage.
 */
export async function POST(_req: NextRequest, { params }: Params) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const release = await getReleaseById(id);
  if (!release) return NextResponse.json({ error: "Release not found" }, { status: 404 });

  if (!release.storagePath || !release.fileName) {
    return NextResponse.json(
      { error: "Upload a release file before publishing." },
      { status: 422 }
    );
  }

  const storage = getStorageProvider();
  const fileExists = await storage.exists(release.storagePath);
  if (!fileExists) {
    return NextResponse.json(
      { error: "The uploaded file could not be found in storage. Re-upload before publishing." },
      { status: 422 }
    );
  }

  const published = await publishRelease(id);
  return NextResponse.json({ release: toAdminRelease(published) });
}
