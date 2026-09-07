export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentRelease, toPublicRelease } from "@/lib/db/releases";

/** GET /api/releases/latest?platform=Windows — public. */
export async function GET(req: NextRequest) {
  const platform = req.nextUrl.searchParams.get("platform") || undefined;
  const release = await getCurrentRelease(platform);

  if (!release) {
    return NextResponse.json({ release: null }, { status: 200 });
  }

  return NextResponse.json({ release: toPublicRelease(release) });
}
