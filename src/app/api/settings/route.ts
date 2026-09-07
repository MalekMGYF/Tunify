export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { getSettings, toPublicSettings, updateSettings } from "@/lib/db/settings";
import { settingsSchema } from "@/lib/validation/schemas";

/** GET /api/settings — public. Returns only the fields meant to be public. */
export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({ settings: toPublicSettings(settings) });
}

/** PUT /api/settings — admin only. */
export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid settings" }, { status: 400 });
  }

  const updated = await updateSettings(parsed.data);
  return NextResponse.json({ settings: toPublicSettings(updated) });
}
