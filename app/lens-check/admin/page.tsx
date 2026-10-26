import ReportRefresh from "@/components/lens-check/admin/ReportRefresh";
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import InsightsDashboard from "@/components/lens-check/admin/InsightsDashboard";
import JourneyOverview from "@/components/lens-check/admin/JourneyOverview";
import ReportAccess from "@/components/lens-check/admin/ReportAccess";
import { auditReport, reportPrincipal } from "@/lib/lens-check/report-access";
import { activeQuestionnaire, getQuestionnaire, questionnaireVersions } from "@/lib/lens-check/content";
import { resultSummary, summarise } from "@/lib/lens-check/insights";
import { INSIGHTS_ROW_LIMIT, listResponsesForInsights } from "@/lib/lens-check/repository";
import { listJourneys } from "@/lib/lens-check/journeys";
import { reportRange } from "@/lib/lens-check/reporting";
import { getArticle } from "@/lib/journal";
import { getDb } from "@/lib/lens-check/db/client";
import { lensCheckReportAudit } from "@/lib/lens-check/db/schema";
import { desc } from "drizzle-orm";

export const metadata: Metadata = { title: "Reports & analysis | Perception 47", robots: { index: false, follow: false }, referrer: "no-referrer" };
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
async function Dashboard({ searchParams }: Props) {
  await connection();
  const actor = await reportPrincipal().catch(() => null);
  if (!actor) return <div className="space-y-4"><h1 className="font-heading text-3xl">Reports are restricted</h1><p>Sign in with an account that has report access. Your normal account only gives access to your own readings.</p><Link className="inline-block bg-green px-5 py-3 text-cream" href="/lens-check/account?returnTo=%2Flens-check%2Fadmin">Sign in to your account</Link></div>;
  const params = await searchParams;
  const content = getQuestionnaire(typeof params.version === "string" ? params.version : "") || activeQuestionnaire;
  const range = reportRange(params);
  const query = new URLSearchParams({ version: content.version, from: range.fromDay, to: range.toDay, cohort: range.cohort }).toString();
  try {
    await auditReport(actor.email, "reports:view", `${content.version}:${range.fromDay}:${range.toDay}:${range.cohort}`);
    const [rows, journeys] = await Promise.all([listResponsesForInsights(content.version, range), listJourneys(content.version, range.from, range.to, range.cohort)]);
    const recentAudit = actor.role === "admin" ? await getDb().select({ actor: lensCheckReportAudit.actor, action: lensCheckReportAudit.action, target: lensCheckReportAudit.target, createdAt: lensCheckReportAudit.createdAt }).from(lensCheckReportAudit).orderBy(desc(lensCheckReportAudit.createdAt)).limit(30) : [];
    const articleTitle = (slug: string) => slug === "home" ? "Homepage" : getArticle(slug)?.title || slug;
    return <div className="space-y-9">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-widest text-charcoal-muted">Perception 47 · Private reports</p><h1 className="mt-2 font-heading text-4xl">Reports &amp; analysis</h1><p className="mt-3 text-sm text-charcoal-mid">Signed in as {actor.email} · {actor.role === "admin" ? "Report admin" : "Report viewer"}</p></div><div className="flex items-center gap-4"><ReportRefresh /><Link className="underline" href="/lens-check/account">My account</Link></div></div>
      <form className="flex flex-wrap items-end gap-3 border border-border bg-cream-deep p-4" action="/lens-check/admin">
        <label className="grid gap-1 text-sm">Questionnaire version<select name="version" defaultValue={content.version} className="min-h-11 border border-border bg-cream px-3">{questionnaireVersions.map(version => <option key={version}>{version}</option>)}</select></label>
        <label className="grid gap-1 text-sm">From (London)<input type="date" name="from" defaultValue={range.fromDay} className="min-h-11 border border-border bg-cream px-3" /></label>
        <label className="grid gap-1 text-sm">To (London)<input type="date" name="to" defaultValue={range.toDay} className="min-h-11 border border-border bg-cream px-3" /></label>
        <label className="grid gap-1 text-sm">Data<select name="cohort" defaultValue={range.cohort} className="min-h-11 border border-border bg-cream px-3"><option value="all">All data</option><option value="live">Live</option><option value="test">Test</option><option value="unknown">Historical / unknown</option></select></label>
        <button className="min-h-11 bg-green px-5 text-cream">Apply filters</button>
      </form>
      <p className="text-xs text-charcoal-muted">Progress is filtered by attempt start date; answer analysis is filtered by completion date. Historical data is labelled unknown rather than guessed as live. {rows.length >= 20000 && "Completed-reading statistics are limited to the newest 20,000 rows; narrow the date range for complete reporting."} {journeys.length >= 20000 && "Progress is limited to the newest 20,000 attempts; narrow the date range for complete reporting."}</p>
      <div className="flex flex-wrap gap-3"><a className="border border-green px-4 py-3 text-sm text-green" href={`/api/lens-check/admin/export?type=journeys&${query}`}>Download progress CSV</a><a className="border border-green px-4 py-3 text-sm text-green" href={`/api/lens-check/admin/export?type=answers&${query}`}>Download answers CSV</a></div>
      <JourneyOverview rows={journeys} content={content} />
      <section className="space-y-4"><h2 className="font-heading text-3xl">Completed readings</h2><p className="text-sm text-charcoal-mid">{rows.length} completions · {rows.filter(row => row.ownerAccountId).length} saved to an account · {rows.filter(row => row.accountRequired && !row.ownerAccountId).length} awaiting sign-in. Account identities are not added to marketing/contact lists.</p>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr>{["Analysis ID", "Completed (London)", "Saved (London)", "Result", "Access", "Data", "Feedback"].map(label => <th className="p-2 font-normal text-charcoal-muted" key={label}>{label}</th>)}</tr></thead><tbody>{rows.slice(0, 200).map(row => <tr key={row.analysisId || row.token} className="border-t border-border-light"><td className="p-2 font-mono text-xs">{row.analysisId?.slice(0, 8) || "Historical"}</td><td className="p-2">{row.createdAt.toLocaleString("en-GB", { timeZone: "Europe/London" })}</td><td className="p-2">{row.claimedAt?.toLocaleString("en-GB", { timeZone: "Europe/London" }) || "—"}</td><td className="p-2">{resultSummary(content, row)}</td><td className="p-2">{row.ownerAccountId ? "Account saved" : row.accountRequired ? "Awaiting sign-in" : "Legacy"}</td><td className="p-2">{row.cohort}</td><td className="p-2">{row.helpfulRating || "—"}</td></tr>)}</tbody></table></div>
      </section>
      <details className="border-t border-border pt-5"><summary className="cursor-pointer font-heading text-2xl">Full answer and archetype analysis</summary><div className="mt-6"><InsightsDashboard summary={summarise(content, rows, { sourceLabel: articleTitle })} people={actor.role === "admin" ? rows.filter(row => row.email) : []} version={content.version} consentOnly={params.consent === "1"} rowLimitReached={rows.length >= INSIGHTS_ROW_LIMIT} sourceLabel={articleTitle} scaleLabels={content.responseScale.map(step => step.label)} resultLabel={row => resultSummary(content, row)} exportQuery={query} allowContactExport={actor.role === "admin"} /></div></details>
      {actor.role === "admin" && <><ReportAccess /><details className="border-t border-border pt-4"><summary className="cursor-pointer">Recent report access and exports</summary><ul className="mt-3 space-y-2 text-xs">{recentAudit.map((item, index) => <li key={index}>{item.createdAt.toLocaleString("en-GB", { timeZone: "Europe/London" })} · {item.actor} · {item.action}</li>)}</ul></details></>}
    </div>;
  } catch {
    return <div className="space-y-3"><h1 className="font-heading text-3xl">Reports are temporarily unavailable</h1><p>We couldn&apos;t load the report data. Please try again shortly.</p><p className="text-sm text-charcoal-muted">If this persists after an update, check that the reporting migration has been applied to this environment.</p></div>;
  }
}
export default function ReportsPage(props: Props) {
  return <section className="px-5 pb-20 pt-28 md:px-8 md:pt-36 lg:px-12" data-clarity-mask="true"><div className="mx-auto max-w-7xl"><Suspense fallback={<p role="status">Loading reports…</p>}><Dashboard {...props} /></Suspense></div></section>;
}
