import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it, vi } from "vitest";
import { eq, inArray } from "drizzle-orm";
const identity = vi.hoisted(() => ({ user: null as { id: string; email: string; emailVerified: boolean } | null }));
vi.mock("./auth", () => ({ getLensCheckAuth: () => ({ getSession: async () => ({ data: { user: identity.user } }) }) }));
import { getDb } from "./db/client";
import { lensCheckJourneys, lensCheckReportAccess, lensCheckReportAudit, lensCheckResponses } from "./db/schema";
import { hashProof } from "./account-policy";
import { completeJourney, listJourneys, recordJourney, withdrawJourney } from "./journeys";
import { reportPrincipal, auditReport } from "./report-access";
import { parseJourney } from "./journey-policy";
import { activeQuestionnaire as content } from "./content";
import { createResponse } from "./repository";
import { neutralAnswers } from "./test-helpers";
import { isFinal, scoreQuestionnaire } from "./scoring";
import { POST as grantAccess } from "@/app/api/lens-check/admin/access/route";

const run = randomUUID();
const secrets: string[] = [];
const tokens: string[] = [];
const email = `reports-${run}@fixture.invalid`;
const owner = `owner-${run}@fixture.invalid`;
const packet = (secret: string, sequence: number, number = 1) => parseJourney({ consent: true, noticeVersion: "progress-v1", secret,
  version: content.version, stage: "question", device: "phone", questionId: content.parts.flatMap(part => part.questionIds)[number - 1],
  questionNumber: number, furthestQuestion: number, totalQuestions: 50, processedCount: number - 1, answeredCount: number - 1,
  skippedCount: 0, notApplicableCount: 0, activeSeconds: 5, errorCount: 0, sequence }, content)!;
async function own(secret: string) { return (await getDb().select().from(lensCheckJourneys).where(eq(lensCheckJourneys.secretHash, hashProof(secret))))[0]; }

describe.runIf(process.env.LENS_CHECK_ACCOUNT_INTEGRATION === "true")("isolated PostgreSQL reports", () => {
  afterAll(async () => {
    if (secrets.length) await getDb().delete(lensCheckJourneys).where(inArray(lensCheckJourneys.secretHash, secrets.map(hashProof)));
    if (tokens.length) await getDb().delete(lensCheckResponses).where(inArray(lensCheckResponses.token, tokens));
    await getDb().delete(lensCheckReportAccess).where(eq(lensCheckReportAccess.email, email));
    await getDb().delete(lensCheckReportAudit).where(eq(lensCheckReportAudit.actor, email));
    await getDb().delete(lensCheckReportAudit).where(eq(lensCheckReportAudit.actor, owner));
    vi.unstubAllEnvs();
  });
  it("records start and exact last question once, ignores old requests, and retains the furthest position", async () => {
    const secret = randomUUID(); secrets.push(secret);
    const seq = Date.now() * 1000;
    await recordJourney(packet(secret, seq), { from: "home" });
    const initial = await own(secret);
    await recordJourney(packet(secret, seq + 2, 17), null);
    await recordJourney(packet(secret, seq + 1, 2), null);
    const seen = await own(secret);
    expect(seen.id).toBe(initial.id); expect(seen.questionNumber).toBe(17); expect(seen.sequence).toBe(seq + 2);
    await recordJourney(packet(secret, seq + 3, 4), null);
    expect((await own(secret)).furthestQuestion).toBe(17);
  });
  it("marks completion only from a saved server response and retains it through late heartbeats", async () => {
    const secret = randomUUID(); secrets.push(secret); const seq = Date.now() * 1000;
    await recordJourney(packet(secret, seq), null);
    const answers = neutralAnswers(content); const result = scoreQuestionnaire(content, answers);
    if (!isFinal(result)) throw new Error("Expected final fixture");
    const saved = await createResponse({ questionnaireVersion: content.version, answers, missingReasons: {}, result, source: null }); tokens.push(saved.token);
    await completeJourney(secret, saved.token, content.version);
    await recordJourney(packet(secret, seq + 1), null);
    expect((await own(secret)).completedAt).not.toBeNull();
    expect((await own(secret)).responseId).not.toBeNull();
  });
  it("erases optional measurements on withdrawal and blocks stale in-flight writes", async () => {
    const secret = randomUUID(); secrets.push(secret); const seq = Date.now() * 1000;
    await recordJourney(packet(secret, seq, 17), { from: "home" });
    await withdrawJourney(secret);
    await recordJourney(packet(secret, seq + 1, 2), null);
    const erased = await own(secret);
    expect(erased.withdrawnAt).not.toBeNull(); expect(erased.questionId).toBeNull(); expect(erased.source).toBeNull(); expect(erased.activeSeconds).toBe(0);
    const visible = await listJourneys(content.version, new Date(Date.now() - 86400000), new Date(Date.now() + 86400000), "all");
    expect(visible.some(row => row.id === erased.id)).toBe(false);
    expect(erased.questionnaireVersion).toBe("withdrawn"); expect(erased.totalQuestions).toBe(0);
    await recordJourney(packet(secret, Date.now() * 1000 + 2000, 2), { from: "return" });
    const renewed = await own(secret);
    expect(renewed.withdrawnAt).toBeNull(); expect(renewed.questionnaireVersion).toBe(content.version);
    expect(renewed.source).toEqual({ from: "return" }); expect(renewed.furthestQuestion).toBe(2);
  });
  it("grants and revokes a second verified reporting account using real database roles", async () => {
    vi.stubEnv("LENS_CHECK_REPORT_ADMIN_EMAILS", "owner@fixture.invalid");
    identity.user = { id: run, email, emailVerified: true };
    expect(await reportPrincipal()).toBeNull();
    await getDb().insert(lensCheckReportAccess).values({ email, role: "viewer", grantedBy: "owner@fixture.invalid" });
    await auditReport(email, "test:grant");
    expect((await reportPrincipal())?.role).toBe("viewer");
    identity.user.emailVerified = false; expect(await reportPrincipal()).toBeNull();
    identity.user.emailVerified = true;
    await getDb().delete(lensCheckReportAccess).where(eq(lensCheckReportAccess.email, email));
    expect(await reportPrincipal()).toBeNull();
  });
  it("adds and removes a future reporting account through the actual admin endpoint, with an audit trail", async () => {
    vi.stubEnv("LENS_CHECK_REPORT_ADMIN_EMAILS", owner);
    identity.user = { id: run, email: owner, emailVerified: true };
    const request = (target: string, role: string) => new Request("https://site.fixture.invalid/api/lens-check/admin/access", { method: "POST", headers: { Origin: "https://site.fixture.invalid", "Content-Type": "application/json" }, body: JSON.stringify({ email: target, role }) });
    expect((await grantAccess(request(owner, "remove"))).status).toBe(400);
    expect((await grantAccess(request(email, "viewer"))).status).toBe(200);
    const [grant] = await getDb().select().from(lensCheckReportAccess).where(eq(lensCheckReportAccess.email, email));
    expect(grant).toMatchObject({ role: "viewer", grantedBy: owner });
    expect((await grantAccess(request(email, "remove"))).status).toBe(200);
    const logs = await getDb().select({ action: lensCheckReportAudit.action }).from(lensCheckReportAudit).where(eq(lensCheckReportAudit.actor, owner));
    expect(logs.map(row => row.action)).toEqual(expect.arrayContaining(["access:viewer", "access:remove"]));
  });
});
