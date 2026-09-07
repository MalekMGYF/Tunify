import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const releaseStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const createReleaseMetaSchema = z.object({
  version: z
    .string()
    .trim()
    .regex(/^\d+(\.\d+){0,2}$/, "Use a version like 1.2.0"),
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(4000).default(""),
  changelog: z.string().trim().max(8000).default(""),
  platform: z.string().trim().min(1, "Platform is required").max(60),
});

export const updateReleaseMetaSchema = createReleaseMetaSchema.partial();

export const settingsSchema = z.object({
  appName: z.string().trim().min(1).max(60),
  description: z.string().trim().max(500),
  websiteTitle: z.string().trim().min(1).max(120),
  supportedPlatforms: z.array(z.string().trim().min(1)).min(1, "List at least one platform"),
  socialTwitter: z.string().trim().max(300),
  socialGithub: z.string().trim().max(300),
  socialDiscord: z.string().trim().max(300),
  contactEmail: z.string().trim().max(200),
});

/**
 * Allow-listed file types for the Tunify application binary. This
 * intentionally does not allow arbitrary executables — only the
 * formats Tunify is actually distributed as.
 */
export const ALLOWED_RELEASE_EXTENSIONS = ["exe", "dmg", "appimage", "zip"] as const;

export const ALLOWED_RELEASE_MIME_TYPES = [
  "application/x-msdownload",
  "application/x-msdos-program",
  "application/octet-stream", // many browsers/OSes report installers generically
  "application/x-apple-diskimage",
  "application/zip",
  "application/x-zip-compressed",
] as const;

export function parseMaxUploadSizeBytes(): number {
  const raw = process.env.MAX_UPLOAD_SIZE || "500MB";
  const match = raw.trim().match(/^(\d+)\s*(MB|GB)?$/i);
  if (!match) return 500 * 1024 * 1024;
  const value = Number(match[1]);
  const unit = (match[2] || "MB").toUpperCase();
  return unit === "GB" ? value * 1024 * 1024 * 1024 : value * 1024 * 1024;
}

export function isAllowedReleaseFile(fileName: string, mimeType: string): { ok: boolean; reason?: string } {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_RELEASE_EXTENSIONS.includes(ext as (typeof ALLOWED_RELEASE_EXTENSIONS)[number])) {
    return { ok: false, reason: `.${ext || "unknown"} files are not allowed. Allowed types: ${ALLOWED_RELEASE_EXTENSIONS.join(", ")}` };
  }
  // MIME type is validated where the browser/OS reliably supplies one, but
  // is not the sole gate — it's easily spoofed, so the extension allow-list
  // above is the primary control.
  if (mimeType && !ALLOWED_RELEASE_MIME_TYPES.includes(mimeType as (typeof ALLOWED_RELEASE_MIME_TYPES)[number])) {
    return { ok: false, reason: `Unexpected file type "${mimeType}" for a .${ext} file.` };
  }
  return { ok: true };
}
