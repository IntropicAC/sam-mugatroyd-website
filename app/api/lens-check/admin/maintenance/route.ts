import { timingSafeEqual } from "node:crypto";
import { pruneJourneys } from "@/lib/lens-check/journeys";
import { auditReport, reportPrincipal } from "@/lib/lens-check/report-access";

export async function GET(request: Request) {
  const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" };
  const secret = process.env.CRON_SECRET;
  const supplied = request.headers.get("authorization") || "";
  const expected = secret ? `Bearer ${secret}` : "";
  const suppliedBytes = Buffer.from(supplied), expectedBytes = Buffer.from(expected);
  const scheduled = Boolean(expected && suppliedBytes.length === expectedBytes.length && timingSafeEqual(suppliedBytes, expectedBytes));
  const actor = scheduled ? null : await reportPrincipal().catch(() => null);
  if (!scheduled && actor?.role !== "admin") return new Response(null, { status: 403, headers });
  if (!scheduled && request.method !== "POST") return new Response(null, { status: 405, headers });
  if (!scheduled && request.headers.get("origin") !== new URL(request.url).origin) return new Response(null, { status: 403, headers });
  try { await pruneJourneys(); await auditReport(actor?.email || "scheduled-maintenance", "progress:retention"); return Response.json({ ok: true }, { headers }); }
  catch { return new Response(null, { status: 503, headers }); }
}
export const POST = GET;
