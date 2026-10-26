import { afterAll, describe, expect, it, vi } from "vitest";
import { renderToReadableStream } from "react-dom/server";
import { mkdir, writeFile } from "node:fs/promises";
const state = vi.hoisted(() => ({ actor: null as { email: string; role: string } | null, rows: [] as unknown[], journeys: [] as unknown[] }));
vi.mock("next/server", () => ({ connection: async () => {} }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh() {} }) }));
vi.mock("./report-access", () => ({ reportPrincipal: async () => state.actor, auditReport: async () => {} }));
vi.mock("./repository", () => ({ listResponsesForInsights: async () => state.rows, INSIGHTS_ROW_LIMIT: 20000 }));
vi.mock("./journeys", () => ({ listJourneys: async () => state.journeys }));
vi.mock("./db/client", () => ({ getDb: () => ({ select: () => ({ from: () => ({ orderBy: () => ({ limit: async () => [] }) }) }) }) }));
import ReportsPage from "@/app/lens-check/admin/page";
import { activeQuestionnaire as content } from "./content";
import { scoreQuestionnaire } from "./scoring";
import { neutralAnswers } from "./test-helpers";

let snapshot = "";
async function render() {
  const stream = await renderToReadableStream(<ReportsPage searchParams={Promise.resolve({})} />);
  await stream.allReady;
  return new Response(stream).text();
}
describe("private reports presentation", () => {
  it("does not expose data or shared-password prompts to an unapproved account", async () => {
    state.actor = null;
    const html = await render();
    expect(html).toContain("Reports are restricted"); expect(html).not.toContain("Attempt activity"); expect(html).not.toContain("Who can view reports?");
  });
  it("shows measured drop-off separately from all completions and provides access management", async () => {
    state.actor = { email: "owner@example.invalid", role: "admin" };
    const answers = neutralAnswers(content), result = scoreQuestionnaire(content, answers);
    const now = new Date();
    state.rows = [{ analysisId: "report-fixture-completion", token: "private-fixture-token", questionnaireVersion: content.version, cohort: "test", createdAt: now, claimedAt: now, answers, missingReasons: {}, scoring: result, resultKind: result.status, archetypeId: null, secondaryArchetypeId: null, source: { from: "home" }, helpfulRating: "yes", email: null, firstName: null, followUpConsent: false, accountRequired: true, ownerAccountId: "fixture-owner" }];
    state.journeys = [
      { id: "fixture-stopped-17", startedAt: new Date(now.getTime() - 3600000), lastSeenAt: new Date(now.getTime() - 2400000), completedAt: null, claimedAt: null, stage: "question", questionId: content.questions[16].id, questionNumber: 17, furthestQuestion: 17, totalQuestions: 50, processedCount: 16, answeredCount: 14, skippedCount: 1, notApplicableCount: 1, activeSeconds: 156, errorCount: 0, device: "phone", cohort: "test", source: { from: "home" } },
      { id: "fixture-completed", startedAt: new Date(now.getTime() - 1800000), lastSeenAt: now, completedAt: now, claimedAt: now, stage: "completed", questionId: "Q50", questionNumber: 50, furthestQuestion: 50, totalQuestions: 50, processedCount: 50, answeredCount: 50, skippedCount: 0, notApplicableCount: 0, activeSeconds: 480, errorCount: 0, device: "desktop", cohort: "test", source: null },
    ];
    const html = await render(); snapshot = html;
    expect(html).toContain("Question 17"); expect(html).toContain("Inactive · may return"); expect(html).toContain("Who can view reports?");
    expect(html).toContain("Full answer and archetype analysis"); expect(html).not.toContain("private-fixture-token");
  });
  it("does not display legacy contact information or permission controls to report viewers", async () => {
    state.actor = { email: "viewer@example.invalid", role: "viewer" };
    const html = await render(); expect(html).not.toContain("Who can view reports?"); expect(html).not.toContain("Download people (Excel)");
  });
});
afterAll(async () => { if (process.env.LENS_CHECK_UI_SNAPSHOTS === "true") { await mkdir("output/lens-check-account-qa", { recursive: true }); await writeFile("output/lens-check-account-qa/reports.html", snapshot); } });
