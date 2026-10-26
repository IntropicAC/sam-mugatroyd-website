import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { inArray } from "drizzle-orm";
import { getDb } from "./db/client";
import { lensCheckResponses } from "./db/schema";
import { activeQuestionnaire } from "./content";
import { answersFitting, neutralAnswers } from "./test-helpers";
import { splitDescription } from "./description";
import type { Answers } from "./types";

const base = "http://localhost:3100";
const tokens = new Set<string>();
async function post(path: string, body: unknown, cookie = "") {
  return fetch(base + path, { method: "POST", headers: { Origin: base, "Content-Type": "application/json", Cookie: cookie }, body: JSON.stringify(body) });
}
async function attempt() {
  const response = await post("/api/lens-check/attempt", {});
  expect(response.status).toBe(200);
  const header = response.headers.get("set-cookie")!;
  expect(header).toContain("HttpOnly");
  expect(header).toContain("SameSite=lax");
  return header.split(";")[0];
}
function submission(answers: Answers = neutralAnswers(activeQuestionnaire)) {
  return { version: activeQuestionnaire.version, answers, missing: {}, submissionId: randomUUID(), ageBand: "18+", source: { utm: { utm_source: "account-http-test" } } };
}
async function save(cookie: string, body: ReturnType<typeof submission>) {
  const response = await post("/api/lens-check/responses", body, cookie);
  expect(response.status).toBe(201);
  const result = await response.json();
  tokens.add(result.token);
  return result.token as string;
}

describe.runIf(process.env.LENS_CHECK_ACCOUNT_HTTP === "true")("local saved-results HTTP journey", () => {
  afterAll(async () => {
    if (tokens.size) await getDb().delete(lensCheckResponses).where(inArray(lensCheckResponses.token, [...tokens]));
  });
  it("preserves one saved attempt across real HTTP retries", async () => {
    const cookie = await attempt();
    const body = submission();
    const first = await save(cookie, body);
    expect(await save(cookie, body)).toBe(first);
    expect((await post("/api/lens-check/responses", { ...body, answers: neutralAnswers(activeQuestionnaire, 1) }, cookie)).status).toBe(409);
  }, 30000);
  it("does not include the full reading in pending or other-browser HTML", async () => {
    const cookie = await attempt();
    const archetype = activeQuestionnaire.archetypes[0];
    const token = await save(cookie, submission(answersFitting(activeQuestionnaire, [archetype.id])));
    const response = await fetch(`${base}/lens-check/result?t=${token}`, { headers: { Cookie: cookie } });
    const html = await response.text();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(html).toContain("Sign in and save my reading");
    expect(html).not.toContain(splitDescription(archetype.descriptionMarkdown).body[0]);
    expect(html).not.toContain('class="lc-r-section lc-description"');
    const foreign = await fetch(`${base}/lens-check/result?t=${token}`);
    const foreignHtml = await foreign.text();
    expect(foreignHtml).toContain("Sign in to view your saved reading");
    expect(foreignHtml).not.toContain(archetype.title);
    expect((await post(`/api/lens-check/responses/${token}/account`, {}, cookie)).status).toBe(401);
    expect((await post(`/api/lens-check/responses/${token}/feedback`, { rating: "yes" }, cookie)).status).toBe(404);
    expect((await post(`/api/lens-check/responses/${token}/claim`, { email: "unverified@fixture.invalid" }, cookie)).status).toBe(403);
  }, 30000);
  it("blocks under-13/missing-eligibility and missing-browser submissions", async () => {
    const cookie = await attempt();
    const body = submission();
    expect((await post("/api/lens-check/responses", { ...body, ageBand: "under13" }, cookie)).status).toBe(400);
    expect((await post("/api/lens-check/responses", { ...body, ageBand: null }, cookie)).status).toBe(400);
    expect((await post("/api/lens-check/responses", body)).status).toBe(400);
    const history = await fetch(base + "/api/lens-check/my-results");
    expect(history.status).toBe(401);
    expect(history.headers.get("cache-control")).toBe("private, no-store");
  }, 30000);
});
