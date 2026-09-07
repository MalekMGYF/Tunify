export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getReleaseById, incrementDownloadCount } from "@/lib/db/releases";
import { getStorageProvider } from "@/lib/storage";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/releases/:id/download
 * Downloads a specific release's file — used by release-history cards
 * so users can grab an older version. Drafts are never downloadable.
 * Streams the file; never buffers the whole thing into memory.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const release = await getReleaseById(id);

  if (!release || release.status === "DRAFT") {
    return NextResponse.json({ error: "Release not found" }, { status: 404 });
  }

  if (!release.storagePath || !release.fileName) {
    return NextResponse.json({ error: "No file is attached to this release" }, { status: 404 });
  }

  const storage = getStorageProvider();
  const exists = await storage.exists(release.storagePath);
  if (!exists) {
    return NextResponse.json({ error: "The release file is currently unavailable" }, { status: 404 });
  }

  let stream: ReadableStream;
  try {
    stream = await storage.download(release.storagePath);
  } catch {
    return NextResponse.json({ error: "Failed to read the release file" }, { status: 500 });
  }

  // Count the download only once we know the file exists and streaming
  // has actually started — never on a page view or metadata fetch.
  await incrementDownloadCount(release.id);

  const safeFileName = release.fileName.replace(/[^a-zA-Z0-9._-]/g, "_") || "Tunify";

  return new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${safeFileName}"`,
      "Content-Length": String(release.fileSize),
      "Cache-Control": "no-store",
    },
  });
}
