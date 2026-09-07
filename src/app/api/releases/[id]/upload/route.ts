export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { getReleaseById, replaceReleaseFile } from "@/lib/db/releases";
import { generateStorageKey, getStorageProvider } from "@/lib/storage";
import { isAllowedReleaseFile, parseMaxUploadSizeBytes } from "@/lib/validation/schemas";

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/releases/:id/upload — admin only, multipart/form-data with a "file" field.
 * Attaches (or replaces) the application binary for a release.
 *
 * Order of operations matters here: the new file is validated and
 * fully stored *before* we touch the release record or delete any
 * previous file, so a failed upload never leaves a release pointing
 * at nothing, and a replacement never destroys the old file until the
 * new one is confirmed safely stored.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const release = await getReleaseById(id);
  if (!release) {
    return NextResponse.json({ error: "Release not found" }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload — expected multipart form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was provided" }, { status: 400 });
  }

  const maxBytes = parseMaxUploadSizeBytes();
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: `File is too large. Maximum allowed size is ${Math.round(maxBytes / (1024 * 1024))} MB.` },
      { status: 413 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "The uploaded file is empty" }, { status: 400 });
  }

  // Never trust the client-supplied filename beyond reading its extension.
  const originalName = file.name || "upload.bin";
  const validation = isAllowedReleaseFile(originalName, file.type);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.reason }, { status: 400 });
  }

  const storage = getStorageProvider();
  const key = generateStorageKey(originalName);

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await storage.upload(key, buffer, file.type || "application/octet-stream");
  } catch {
    return NextResponse.json({ error: "Failed to store the uploaded file. Please try again." }, { status: 500 });
  }

  // Confirm the file actually landed before we touch the DB or drop the old one.
  const stored = await storage.exists(key);
  if (!stored) {
    return NextResponse.json({ error: "Upload could not be verified. Please try again." }, { status: 500 });
  }

  const previousStoragePath = release.storagePath;

  const updated = await replaceReleaseFile(id, {
    fileName: originalName,
    storagePath: key,
    fileSize: file.size,
    mimeType: file.type || "application/octet-stream",
  });

  // Only now, after the new file is confirmed stored and the record
  // updated, remove the previous file (if this was a replacement).
  if (previousStoragePath && previousStoragePath !== key) {
    try {
      await storage.delete(previousStoragePath);
    } catch {
      // Non-fatal — an orphaned old file is better than losing the new one.
    }
  }

  return NextResponse.json({
    release: {
      id: updated.id,
      fileName: updated.fileName,
      fileSize: updated.fileSize,
      mimeType: updated.mimeType,
    },
  });
}
