export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/releases/latest/download?platform=Windows
 * The one URL the public "Download Tunify" button always points to.
 *
 * Always resolves to the newest GitHub Release's APK asset — publish a
 * new release on GitHub and this link updates itself automatically,
 * no code changes needed.
 */
const GITHUB_API_URL = "https://api.github.com/repos/MalekMGYF/Tunify/releases/latest";

// Fallback used only if the GitHub API call fails for some reason.
const FALLBACK_APK_URL = "https://github.com/MalekMGYF/Tunify/releases/download/V1.0.0/Tunify.apk";

export async function GET(_req: NextRequest) {
  try {
    const res = await fetch(GITHUB_API_URL, {
      headers: { Accept: "application/vnd.github+json" },
      // Don't cache for long — a fresh release should show up quickly.
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const release = await res.json();
      const asset = release.assets?.find((a: { name: string }) =>
        a.name.toLowerCase().endsWith(".apk")
      );
      if (asset?.browser_download_url) {
        return NextResponse.redirect(asset.browser_download_url, { status: 302 });
      }
    }
  } catch {
    // fall through to the fallback URL below
  }

  return NextResponse.redirect(FALLBACK_APK_URL, { status: 302 });
}
