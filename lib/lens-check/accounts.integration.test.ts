import { randomBytes, randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { and, eq, inArray } from "drizzle-orm";
const state = vi.hoisted(() => ({ subject: null as string | null, proof: null as string | null, verified: true }));
vi.mock("./auth", () => ({ getLensCheckAuth: () => ({ getSession: async () => ({ error: null, data: state.subject ? { user: { id: state.subject, email: "synthetic@fixture.invalid", emailVerified: state.verified } } : null }) }) }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => state.proof ? { value: state.proof } : undefined }) }));
import { getDb } from "./db/client";
import { lensCheckAccounts, lensCheckResponses } from "./db/schema";
import { claimAccountResponse, findAccount, listAccountResults, verifiedPrincipal } from "./accounts";
import { claimResponse, createResponse, getResponseByToken, saveFeedback } from "./repository";
import { activeQuestionnaire } from "./content";
import { neutralAnswers } from "./test-helpers";
import { isFinal, scoreQuestionnaire } from "./scoring";

const run = randomUUID();
const issuer = `https://account-fixture.invalid/${run}`;
const a = { issuer, subject: `synthetic-a-${run}` };
const b = { issuer, subject: `synthetic-b-${run}` };
const proof = randomBytes(32).toString("base64url");
const tokens = new Set<string>();

async function create(options: { proof?: string; id?: string; legacy?: boolean; value?: 1 | 2 } = {}) {
  const answers = neutralAnswers(activeQuestionnaire, options.value ?? 2);
  const result = scoreQuestionnaire(activeQuestionnaire, answers);
  if (!isFinal(result)) throw new Error("Fixture must produce a final result");
  const saved = await createResponse({ questionnaireVersion: activeQuestionnaire.version, answers, missingReasons: {}, result,
    source: { utm: { utm_source: "account-integration" } },
    account: options.legacy ? undefined : { browserProof: options.proof ?? proof, submissionId: options.id ?? randomUUID() },
  });
  tokens.add(saved.token);
  return saved.token;
}

describe.runIf(process.env.LENS_CHECK_ACCOUNT_INTEGRATION === "true")("isolated PostgreSQL account ownership", () => {
  beforeEach(() => {
    vi.stubEnv("NEON_AUTH_BASE_URL", issuer); vi.stubEnv("LENS_CHECK_AUTH_ENABLED", "true");
    vi.stubEnv("NEON_AUTH_COOKIE_SECRET", "s".repeat(32)); vi.stubEnv("LENS_CHECK_AUTH_TEST_EMAILS", "synthetic@fixture.invalid");
    state.subject = null; state.proof = null; state.verified = true;
  });
  afterAll(async () => {
    // Only rows created by this exact synthetic run, on the guarded test branch.
    if (tokens.size) await getDb().delete(lensCheckResponses).where(inArray(lensCheckResponses.token, [...tokens]));
    await getDb().delete(lensCheckAccounts).where(eq(lensCheckAccounts.authIssuer, issuer));
    vi.unstubAllEnvs();
  });
  it("saves one completion across retries and rejects changed payloads", async () => {
    const id = randomUUID();
    const first = await create({ id });
    expect(await create({ id })).toBe(first);
    await expect(create({ id, value: 1 })).rejects.toThrow("SUBMISSION_CONFLICT");
  });
  it("keeps pending results restricted to the original browser", async () => {
    const token = await create();
    expect(await getResponseByToken(token)).toBeNull();
    state.proof = proof;
    expect((await getResponseByToken(token))?.access).toBe("pending");
    expect(await saveFeedback(token, "yes")).toBe(false);
    expect(await claimAccountResponse(token, b, randomBytes(32).toString("base64url"))).toBe("not_found");
  });
  it("binds a result to a stable identity and denies other accounts, even with its old proof", async () => {
    const token = await create();
    expect(await claimAccountResponse(token, a, proof)).toBe("owned");
    expect(await claimAccountResponse(token, a, null)).toBe("owned");
    expect(await claimAccountResponse(token, b, proof)).toBe("not_found");
    state.subject = b.subject; state.proof = proof;
    expect(await getResponseByToken(token)).toBeNull();
    expect(await saveFeedback(token, "no")).toBe(false);
    state.subject = a.subject; state.proof = null;
    expect((await getResponseByToken(token))?.access).toBe("owner");
    expect(await saveFeedback(token, "yes")).toBe(true);
    state.subject = null;
    expect(await getResponseByToken(token)).toBeNull();
  });
  it("never transfers ownership under competing claims", async () => {
    const token = await create();
    const outcomes = await Promise.all([claimAccountResponse(token, a, proof), claimAccountResponse(token, b, proof)]);
    expect(outcomes.filter((value) => value === "owned")).toHaveLength(1);
    const ownerA = await findAccount(a);
    const [row] = await getDb().select().from(lensCheckResponses).where(eq(lensCheckResponses.token, token));
    const loser = row.ownerAccountId === ownerA ? b : a;
    expect(await claimAccountResponse(token, loser, proof)).toBe("not_found");
  });
  it("rejects expired claims and email-only claiming of account results", async () => {
    const token = await create();
    await getDb().update(lensCheckResponses).set({ claimExpiresAt: new Date(0) }).where(eq(lensCheckResponses.token, token));
    expect(await claimAccountResponse(token, a, proof)).toBe("not_found");
    expect(await claimResponse(token, { email: "synthetic@fixture.invalid", firstName: null, followUpConsent: false })).toBe("account_required");
    state.proof = proof;
    expect(await getResponseByToken(token)).toBeNull();
  });
  it("does not attach legacy results and returns only each account's history", async () => {
    const legacy = await create({ legacy: true });
    expect(await claimAccountResponse(legacy, a, proof)).toBe("not_found");
    const tokenA = await create(); const tokenB = await create();
    await claimAccountResponse(tokenA, a, proof); await claimAccountResponse(tokenB, b, proof);
    const historyA = await listAccountResults(a); const historyB = await listAccountResults(b);
    expect(historyA.map((result) => result.token)).toContain(tokenA);
    expect(historyA.map((result) => result.token)).not.toContain(tokenB);
    expect(historyB.map((result) => result.token)).not.toContain(tokenA);
    expect(historyA.some((result) => result.token === legacy)).toBe(false);
    expect(Object.keys(historyA[0])).not.toContain("answers");
    const accountId = await findAccount(a);
    expect(await getDb().select({ id: lensCheckResponses.id }).from(lensCheckResponses)
      .where(and(eq(lensCheckResponses.ownerAccountId, accountId!), eq(lensCheckResponses.token, tokenA)))).toHaveLength(1);
  });
  it("does not accept unverified or absent provider sessions", async () => {
    state.subject = a.subject; state.verified = false;
    expect(await verifiedPrincipal()).toBeNull();
    state.verified = true;
    expect(await verifiedPrincipal()).toEqual(a);
    state.subject = null;
    expect(await verifiedPrincipal()).toBeNull();
  });
});
