import { connection } from "next/server";
import { auditReport, reportPrincipal } from "@/lib/lens-check/report-access";
import { getResultUrl } from "@/lib/lens-check/api";
import { activeQuestionnaire, getQuestionnaire } from "@/lib/lens-check/content";
import { listJourneys } from "@/lib/lens-check/journeys";
import { journeysCsv, reportRange } from "@/lib/lens-check/reporting";
import { answersCsv, leadsCsv, type InsightRow } from "@/lib/lens-check/insights";
import { listResponsesForInsights } from "@/lib/lens-check/repository";
import { getArticle } from "@/lib/journal";

const NO_STORE = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };

// Excel-ready downloads for Sam: ?type=leads (people who unlocked a reading,
// with emails), ?type=answers (no contact details), or ?type=journeys (opt-in progress).
export async function GET(request: Request) {
  await connection();

  const actor = await reportPrincipal().catch(() => null);
  if (!actor) {
    return new Response("Not authorised.", { status: 401, headers: NO_STORE });
  }

  const params = new URL(request.url).searchParams;
  const type = params.get("type");
  if (type !== "leads" && type !== "answers" && type !== "journeys") {
    return new Response("Choose type=leads, type=answers or type=journeys.", { status: 400, headers: NO_STORE });
  }

  const content = getQuestionnaire(params.get("version") || "") || activeQuestionnaire;
  const range = reportRange(Object.fromEntries(params));
  if (type === "leads" && actor.role !== "admin") return new Response("Contact exports require report admin access.", { status: 403, headers: NO_STORE });
  let rows: InsightRow[];
  let progressCsv: string | null = null;
  try {
    await auditReport(actor.email, `export:${type}`, `${content.version}:${range.fromDay}:${range.toDay}:${range.cohort}`);
    if (type === "journeys") { progressCsv = journeysCsv(await listJourneys(content.version, range.from, range.to, range.cohort), content.version); rows = []; }
    else rows = await listResponsesForInsights(content.version, range);
  } catch (error) {
    console.error("Mindset Test export failed");
    return new Response("Couldn't read the results database. Check DATABASE_URL.", { status: 500, headers: NO_STORE });
  }

  const sourceLabel = (slug: string) => getArticle(slug)?.title ?? slug;
  const csv = progressCsv ?? (type === "leads"
      ? leadsCsv(content, rows, (token) => getResultUrl(request, token), sourceLabel)
      : answersCsv(content, rows));
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      ...NO_STORE,
      "Content-Disposition": `attachment; filename="mindset-test-${type === "leads" ? "people" : type}-${date}.csv"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
