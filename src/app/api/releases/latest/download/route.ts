export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/releases/latest/download?platform=Windows
 * The one URL the public "Download Tunify" button always points to.
 *
 * Temporary simple setup: redirects straight to the APK attached to
 * the GitHub Release, instead of resolving through the database +
 * storage provider. This sidesteps the upload/storage system entirely
 * while that's being set up properly — just update the URL below
 * whenever a new APK version is published.
 */
const GITHUB_RELEASE_APK_URL =
  "https://github.com/MalekMGYF/Tunify/releases/download/V1.0.0/Tunify.apk";

export async function GET(_req: NextRequest) {
  return NextResponse.redirect(GITHUB_RELEASE_APK_URL, { status: 302 });
}
