import type { StorageProvider } from "./types";
import { LocalStorageProvider } from "./local-provider";
import { S3StorageProvider } from "./s3-provider";

let cached: StorageProvider | null = null;

/**
 * Returns the configured storage provider. Nothing outside this file
 * (and the two provider implementations) should know or care whether
 * files live on disk or in S3.
 */
export function getStorageProvider(): StorageProvider {
  if (cached) return cached;

  const provider = (process.env.STORAGE_PROVIDER || "local").toLowerCase();

  if (provider === "s3") {
    cached = new S3StorageProvider();
  } else {
    cached = new LocalStorageProvider();
  }

  return cached;
}

export function generateStorageKey(originalFileName: string): string {
  // Never trust the uploaded filename for the internal storage path —
  // generate an opaque, collision-resistant name and keep only a safe
  // extension derived from an allow-list (validated in lib/validation).
  const ext = originalFileName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `releases/${id}.${ext}`;
}
