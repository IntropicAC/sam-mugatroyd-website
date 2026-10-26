import { eq } from "drizzle-orm";
import { getDb } from "@/lib/lens-check/db/client";
import { lensCheckReportAccess, lensCheckReportAudit } from "@/lib/lens-check/db/schema";
import { normaliseEmail, reportOwners, reportPrincipal } from "@/lib/lens-check/report-access";

const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex", "Referrer-Policy": "no-referrer" };
export async function GET() {
  const actor = await reportPrincipal().catch(() => null);
  if (!actor) return new Response(null, { status: 403, headers });
  if (actor.role !== "admin") return Response.json({ role: actor.role }, { headers });
  try {
    const members = await getDb().select({ email: lensCheckReportAccess.email, role: lensCheckReportAccess.role }).from(lensCheckReportAccess);
    const owners = reportOwners();
    return Response.json({ role: actor.role, members: [...owners.map(email => ({ email, role: "admin", owner: true })), ...members.filter(m => !owners.includes(m.email))] }, { headers });
  } catch { return new Response(null, { status: 503, headers }); }
}
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return new Response(null, { status: 403, headers });
  const actor = await reportPrincipal().catch(() => null);
  if (actor?.role !== "admin") return new Response(null, { status: 403, headers });
  const text = await request.text();
  if (text.length > 1024) return new Response(null, { status: 413, headers });
  let body;
  try { body = JSON.parse(text); } catch { return new Response(null, { status: 400, headers }); }
  const email = normaliseEmail(body?.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
      !["viewer", "admin", "remove"].includes(body?.role) || reportOwners().includes(email) || email === actor.email) {
    return Response.json({ error: "Choose another valid email and access level. The owner and your own access are protected." }, { status: 400, headers });
  }
  try {
    const db = getDb();
    const change = body.role === "remove"
      ? db.delete(lensCheckReportAccess).where(eq(lensCheckReportAccess.email, email))
      : db.insert(lensCheckReportAccess).values({ email, role: body.role, grantedBy: actor.email })
        .onConflictDoUpdate({ target: lensCheckReportAccess.email, set: { role: body.role, grantedBy: actor.email } });
    await db.batch([change, db.insert(lensCheckReportAudit).values({ actor: actor.email, action: `access:${body.role}`, target: email })]);
    return Response.json({ ok: true }, { headers });
  } catch { return Response.json({ error: "Couldn't update report access. Try again." }, { status: 503, headers }); }
}
