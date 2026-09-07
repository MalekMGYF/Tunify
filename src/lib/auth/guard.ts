import { NextResponse } from "next/server";
import { getSession, type SessionPayload } from "./session";

/**
 * Verifies the caller has a valid admin session. Use this at the top
 * of every admin-only API route handler — middleware also blocks
 * unauthenticated requests, but every protected operation re-checks
 * here too, since frontend/middleware checks alone are not sufficient.
 */
export async function requireAdmin(): Promise<
  { ok: true; session: SessionPayload } | { ok: false; response: NextResponse }
> {
  const session = await getSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
    };
  }
  return { ok: true, session };
}
