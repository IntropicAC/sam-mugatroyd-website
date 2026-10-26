import { afterEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ actor: null as { email: string; role: string } | null, record: vi.fn(), withdraw: vi.fn(), query: vi.fn(), audit: vi.fn(), prune: vi.fn() }));
vi.mock("next/server", () => ({ connection: async () => {} }));
vi.mock("./report-access", () => ({ reportPrincipal: async () => state.actor, auditReport: state.audit, reportOwners: () => ["owner@example.invalid"], normaliseEmail: (v: string) => v?.trim().toLowerCase() || "" }));
vi.mock("./journeys", () => ({ recordJourney: state.record, withdrawJourney: state.withdraw, listJourneys: state.query, pruneJourneys: state.prune }));
vi.mock("./repository", () => ({ listResponsesForInsights: state.query }));
import { POST as progress } from "@/app/api/lens-check/progress/route";
import { GET as download } from "@/app/api/lens-check/admin/export/route";
import { POST as access } from "@/app/api/lens-check/admin/access/route";
import { GET as maintenance, POST as manualMaintenance } from "@/app/api/lens-check/admin/maintenance/route";
import { activeQuestionnaire } from "./content";
afterEach(() => { state.actor = null; vi.resetAllMocks(); vi.unstubAllEnvs(); });
const request = (body: object, origin = "https://site.example.invalid") => new Request("https://site.example.invalid/api/lens-check/progress", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify(body) });
describe("reporting route boundaries", () => {
  it("rejects cross-origin writes and missing consent before storing anything", async () => {
    expect((await progress(request({}, "https://other.invalid"))).status).toBe(403);
    expect((await progress(request({}))).status).toBe(400);
    expect(state.record).not.toHaveBeenCalled();
  });
  it("bounds body size even without a Content-Length header", async () => {
    expect((await progress(request({ extra: "a".repeat(5000) }))).status).toBe(413);
  });
  it("stores only validated first-party checkpoints and sanitised campaign labels", async () => {
    const packet = { consent: true, secret: crypto.randomUUID(), noticeVersion: "progress-v1", version: activeQuestionnaire.version, stage: "map", device: "phone", questionId: null, questionNumber: 0, furthestQuestion: 0, totalQuestions: 50, processedCount: 0, answeredCount: 0, skippedCount: 0, notApplicableCount: 0, activeSeconds: 0, errorCount: 0, sequence: 1, source: { utm: { utm_source: "private@example.invalid", utm_campaign: "pilot" } }, answers: { Q01: 4 } };
    expect((await progress(request(packet))).status).toBe(204);
    expect(state.record.mock.calls[0][0]).not.toHaveProperty("answers");
    expect(state.record.mock.calls[0][1]).toEqual({ utm: { utm_campaign: "pilot" } });
  });
  it("requires account permission for exports; an old shared password is insufficient", async () => {
    const response = await download(new Request("https://site.example.invalid/api/lens-check/admin/export?type=answers", { headers: { Authorization: "Basic c2FtOnBhc3M=" } }));
    expect(response.status).toBe(401); expect(state.query).not.toHaveBeenCalled();
  });
  it("keeps contact exports and permission changes restricted to admins", async () => {
    state.actor = { email: "viewer@example.invalid", role: "viewer" };
    expect((await download(new Request("https://site.example.invalid/api/lens-check/admin/export?type=leads"))).status).toBe(403);
    expect((await access(request({ email: "other@example.invalid", role: "admin" })))).toHaveProperty("status", 403);
    expect(state.query).not.toHaveBeenCalled();
  });
  it("audits approved exports and uses no-store headers", async () => {
    state.actor = { email: "owner@example.invalid", role: "admin" }; state.query.mockResolvedValue([]);
    const response = await download(new Request("https://site.example.invalid/api/lens-check/admin/export?type=journeys"));
    expect(response.status).toBe(200); expect(response.headers.get("cache-control")).toContain("no-store");
    expect(state.audit).toHaveBeenCalledWith("owner@example.invalid", "export:journeys", expect.any(String));
  });
  it("requires the scheduled secret for retention and never deletes on an ordinary GET", async () => {
    vi.stubEnv("CRON_SECRET", "scheduled-secret-with-at-least-32-characters");
    expect((await maintenance(new Request("https://site.example.invalid/api/lens-check/admin/maintenance"))).status).toBe(403);
    expect(state.prune).not.toHaveBeenCalled();
    const response = await maintenance(new Request("https://site.example.invalid/api/lens-check/admin/maintenance", { headers: { Authorization: "Bearer scheduled-secret-with-at-least-32-characters" } }));
    expect(response.status).toBe(200); expect(state.prune).toHaveBeenCalledTimes(1);
    state.actor = { email: "owner@example.invalid", role: "admin" };
    expect((await maintenance(new Request("https://site.example.invalid/api/lens-check/admin/maintenance"))).status).toBe(405);
    expect((await manualMaintenance(request({}))).status).toBe(200);
  });
});
