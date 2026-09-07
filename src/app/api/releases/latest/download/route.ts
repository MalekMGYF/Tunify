export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentRelease, incrementDownloadCount } from "@/lib/db/releases";
import { getStorageProvider } from "@/lib/storage";

/**
 * GET /api/releases/latest/download?platform=Windows
 * The one URL the public "Download Tunify" button always points to —
 * never hardcoded to a specific release ID. Always resolves to
 * whichever release is currently marked isCurrent for the platform.
 */
export async function GET(req: NextRequest) {
  const platform = req.nextUrl.searchParams.get("platform") || undefined;
  const release = await getCurrentRelease(platform);

  if (!release) {
    return NextResponse.json({ error: "No release is currently available for download" }, { status: 404 });
  }

  if (!release.storagePath || !release.fileName) {
    return NextResponse.json({ error: "No file is attached to the current release" }, { status: 404 });
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
