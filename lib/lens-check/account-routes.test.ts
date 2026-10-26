import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const auth = vi.hoisted(() => ({ principal: vi.fn(), proof: vi.fn(), claim: vi.fn(), list: vi.fn() }));
vi.mock("./accounts", () => ({ verifiedPrincipal: auth.principal, browserProof: auth.proof, claimAccountResponse: auth.claim, listAccountResults: auth.list }));
vi.mock("./repository", () => ({ RESULT_TOKEN_PATTERN: /^[A-Za-z0-9_-]{43}$/ }));
import { GET } from "@/app/api/lens-check/my-results/route";
import { POST } from "@/app/api/lens-check/responses/[token]/account/route";

const token = "a".repeat(43);
const context = { params: Promise.resolve({ token }) };
const request = (origin = "https://site.sample.org") => new Request(`https://site.sample.org/api/lens-check/responses/${token}/account`, { method: "POST", headers: { Origin: origin } });
beforeEach(() => {
  vi.stubEnv("LENS_CHECK_ACCOUNTS_ENABLED", "true");
  auth.principal.mockResolvedValue({ issuer: "test", subject: "account-a" });
  auth.proof.mockResolvedValue("browser-proof");
  auth.claim.mockResolvedValue("owned");
  auth.list.mockResolvedValue([]);
});
afterEach(() => { vi.unstubAllEnvs(); vi.resetAllMocks(); });

describe("private results routes", () => {
  it("requires a verified session for both history and claims", async () => {
    auth.principal.mockResolvedValue(null);
    expect((await GET()).status).toBe(401);
    expect((await POST(request(), context)).status).toBe(401);
    expect(auth.list).not.toHaveBeenCalled();
    expect(auth.claim).not.toHaveBeenCalled();
  });
  it("rejects cross-origin claims before any database operation", async () => {
    expect((await POST(request("https://other.sample.org"), context)).status).toBe(403);
    expect(auth.claim).not.toHaveBeenCalled();
  });
  it("uses the server principal and browser proof, ignoring user-supplied owner details", async () => {
    const response = await POST(new Request(request(), { body: JSON.stringify({ email: "someone-else@sample.org", ownerAccountId: "other" }) }), context);
    expect(response.status).toBe(200);
    expect(auth.claim).toHaveBeenCalledWith(token, { issuer: "test", subject: "account-a" }, "browser-proof");
  });
  it("returns private no-store responses, including access failures", async () => {
    const response = await GET();
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    auth.claim.mockResolvedValue("not_found");
    expect((await POST(request(), context)).status).toBe(404);
  });
  it("fails closed for disabled accounts and provider outages", async () => {
    auth.principal.mockRejectedValue(new Error("private provider details"));
    const failed = await GET();
    expect(failed.status).toBe(503);
    expect(await failed.text()).not.toContain("private provider details");
    vi.stubEnv("LENS_CHECK_ACCOUNTS_ENABLED", "false");
    expect((await GET()).status).toBe(503);
    expect((await POST(request(), context)).status).toBe(503);
  });
});
