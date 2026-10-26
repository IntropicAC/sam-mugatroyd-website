import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { accountsEnabled, CLAIM_COOKIE, CLAIM_LIFETIME_SECONDS, SECRET_PATTERN } from "@/lib/lens-check/account-policy";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "private, no-store" };
  if (!accountsEnabled()) return Response.json({ error: "Accounts are not available." }, { status: 503, headers });
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return Response.json({ error: "Forbidden" }, { status: 403, headers });
  }
  const jar = await cookies();
  const current = jar.get(CLAIM_COOKIE)?.value;
  jar.set(CLAIM_COOKIE, current && SECRET_PATTERN.test(current) ? current : randomBytes(32).toString("base64url"), {
    httpOnly: true, sameSite: "lax", secure: new URL(request.url).protocol === "https:",
    path: "/", maxAge: CLAIM_LIFETIME_SECONDS,
  });
  return Response.json({ ok: true }, { headers });
}
