import { NextRequest, NextResponse } from "next/server";
import { getAdminByEmail } from "@/lib/db/admins";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { checkLoginRateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation/schemas";

function getClientKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: NextRequest) {
  const clientKey = getClientKey(req);
  const rateLimit = checkLoginRateLimit(clientKey);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds ?? 900) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password" }, { status: 400 });
  }

  const { email, password } = parsed.data;

  // Same generic error whether the email doesn't exist or the password
  // is wrong — never reveal which one it was.
  const genericError = () => NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  const admin = await getAdminByEmail(email.toLowerCase());
  if (!admin) return genericError();

  const validPassword = await verifyPassword(password, admin.passwordHash);
  if (!validPassword) return genericError();

  await createSession({ adminId: admin.id, email: admin.email });

  return NextResponse.json({ ok: true, email: admin.email });
}
