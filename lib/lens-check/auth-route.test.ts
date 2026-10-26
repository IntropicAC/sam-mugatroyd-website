import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const upstream = vi.hoisted(() => ({ GET: vi.fn(), POST: vi.fn(), getSession: vi.fn() }));
vi.mock("./auth", () => ({ getLensCheckAuth: () => ({ handler: () => upstream, getSession: upstream.getSession }) }));
import { GET, POST } from "@/app/api/auth/[...path]/route";

function request(path: string, body: unknown = {}, origin = "https://site.sample.org") {
  return new NextRequest(`https://site.sample.org/api/auth/${path}`, {
    method: "POST", headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(body),
  });
}
const context = (path: string) => ({ params: Promise.resolve({ path: path.split("/") }) });

beforeEach(() => {
  vi.stubEnv("LENS_CHECK_AUTH_ENABLED", "true");
  vi.stubEnv("NEON_AUTH_BASE_URL", "https://isolated.neon.example/auth");
  vi.stubEnv("NEON_AUTH_COOKIE_SECRET", "s".repeat(32));
  vi.stubEnv("LENS_CHECK_AUTH_TEST_EMAILS", "tester@sample.org");
  vi.stubEnv("LENS_CHECK_AUTH_SOCIAL_PROVIDERS", "google");
  vi.stubEnv("LENS_CHECK_AUTH_PASSWORD_ENABLED", "false");
  upstream.GET.mockImplementation(async () => new Response("{}"));
  upstream.POST.mockImplementation(async () => new Response("{}"));
  upstream.getSession.mockResolvedValue({ data: null, error: null });
});
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

describe("Auth proxy access", () => {
  it("fails closed when disabled without forwarding a request", async () => {
    vi.stubEnv("LENS_CHECK_AUTH_ENABLED", "false");
    const result = await POST(request("sign-in/email-otp"), context("sign-in/email-otp"));
    expect(result.status).toBe(503);
    expect(upstream.POST).not.toHaveBeenCalled();
  });
  it("rejects cross-origin mutations", async () => {
    const result = await POST(request("sign-out", {}, "https://other.sample.org"), context("sign-out"));
    expect(result.status).toBe(403);
    expect(upstream.POST).not.toHaveBeenCalled();
  });
  it("rejects other recipients and non-sign-in email requests", async () => {
    const path = "email-otp/send-verification-otp";
    for (const body of [{ email: "customer@sample.org", type: "sign-in" },
      { email: "tester@sample.org", type: "email-verification" }, null]) {
      expect((await POST(request(path, body), context(path))).status).toBe(403);
    }
    expect(upstream.POST).not.toHaveBeenCalled();
  });
  it("does not expose admin, password signup or other provider APIs", async () => {
    for (const path of ["admin/list-users", "sign-up/email", "delete-user", "update-user"]) {
      expect((await POST(request(path), context(path))).status).toBe(404);
    }
    expect(upstream.POST).not.toHaveBeenCalled();
  });
  it("preserves provider cookies and disables caching on forwarded responses", async () => {
    upstream.POST.mockResolvedValue(new Response("{}", { headers: { "Set-Cookie": "session=test; HttpOnly; Secure" } }));
    const path = "sign-in/email-otp";
    const result = await POST(request(path, { email: "tester@sample.org", otp: "123456" }), context(path));
    expect(result.status).toBe(200);
    expect(result.headers.get("cache-control")).toBe("private, no-store");
    expect(result.headers.get("set-cookie")).toContain("HttpOnly");
  });
  it("only permits get-session reads and returns safe upstream failure messages", async () => {
    expect((await GET(new NextRequest("https://site.sample.org/api/auth/admin/list-users"), context("admin/list-users"))).status).toBe(404);
    upstream.GET.mockRejectedValue(new Error("private upstream details"));
    const result = await GET(new NextRequest("https://site.sample.org/api/auth/get-session"), context("get-session"));
    expect(result.status).toBe(502);
    expect(await result.text()).not.toContain("private upstream details");
  });
  it("validates social provider redirects before forwarding and preserves the SDK challenge cookie", async () => {
    const path = "sign-in/social";
    const callbackURL = "https://site.sample.org/lens-check/auth/callback";
    expect((await POST(request(path, { provider: "microsoft", callbackURL }), context(path))).status).toBe(400);
    expect((await POST(request(path, { provider: "google", callbackURL: "https://other.sample.org" }), context(path))).status).toBe(400);
    expect(upstream.POST).not.toHaveBeenCalled();
    upstream.POST.mockResolvedValue(Response.json({ url: "https://accounts.google.com/" }, { headers: { "Set-Cookie": "challenge=synthetic; HttpOnly; Secure" } }));
    const response = await POST(request(path, { provider: "google", callbackURL, idToken: "untrusted" }), context(path));
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("challenge=");
    const forwarded = await upstream.POST.mock.calls[0][0].json();
    expect(forwarded).not.toHaveProperty("idToken");
    expect(forwarded.callbackURL).toBe(`${callbackURL}?returnTo=%2Flens-check%2Fmy-results`);
  });
  it("does not expose sessions from other verified provider emails", async () => {
    const path = "get-session";
    upstream.GET.mockResolvedValue(Response.json({ user: { id: "other", email: "other@sample.org", emailVerified: true } }));
    const response = await GET(new NextRequest(`https://site.sample.org/api/auth/${path}`), context(path));
    expect(await response.json()).toBeNull();
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
  it("gates new password endpoints and OTP purposes behind the explicit feature flag", async () => {
    for (const path of ["sign-in/email", "sign-up/email", "email-otp/verify-email", "email-otp/reset-password", "revoke-other-sessions"]) {
      expect((await POST(request(path), context(path))).status).toBe(404);
    }
    vi.stubEnv("LENS_CHECK_AUTH_PASSWORD_ENABLED", "true");
    const path = "email-otp/send-verification-otp";
    for (const type of ["email-verification", "forget-password"]) {
      expect((await POST(request(path, { email: "tester@sample.org", type }), context(path))).status).toBe(200);
    }
    expect((await POST(request(path, { email: "other@sample.org", type: "forget-password" }), context(path))).status).toBe(403);
  });
  it("validates passwords and strips signup privilege flags, callbacks and reset overrides", async () => {
    vi.stubEnv("LENS_CHECK_AUTH_PASSWORD_ENABLED", "true");
    const path = "sign-up/email";
    expect((await POST(request(path, { email: "tester@sample.org", password: "short" }), context(path))).status).toBe(400);
    expect(upstream.POST).not.toHaveBeenCalled();
    const password = "A synthetic test passphrase";
    expect((await POST(request(path, { email: "tester@sample.org", password, emailVerified: true, role: "admin", callbackURL: "https://other.sample.org" }), context(path))).status).toBe(200);
    expect(await upstream.POST.mock.calls[0][0].json()).toEqual({ email: "tester@sample.org", password, name: "Mindset Test reader" });
    const reset = "email-otp/reset-password";
    expect((await POST(request(reset, { email: "tester@sample.org", password, otp: "invalid" }), context(reset))).status).toBe(400);
  });
  it("never treats an unverified password session as a verified application session", async () => {
    upstream.GET.mockResolvedValue(Response.json({ user: { id: "unverified", email: "tester@sample.org", emailVerified: false } }));
    const response = await GET(new NextRequest("https://site.sample.org/api/auth/get-session"), context("get-session"));
    expect(await response.json()).toBeNull();
  });
  it("requires a fresh approved session before revoking other sessions and never forwards a target user ID", async () => {
    vi.stubEnv("LENS_CHECK_AUTH_PASSWORD_ENABLED", "true");
    const path = "revoke-other-sessions";
    expect((await POST(request(path), context(path))).status).toBe(401);
    expect(upstream.POST).not.toHaveBeenCalled();
    upstream.getSession.mockResolvedValue({ data: { user: { id: "approved", email: "tester@sample.org", emailVerified: true } } });
    expect((await POST(request(path, { userId: "someone-else" }), context(path))).status).toBe(200);
    expect(upstream.getSession).toHaveBeenLastCalledWith({ query: { disableCookieCache: "true" } });
    expect(await upstream.POST.mock.calls[0][0].json()).toEqual({});
  });
});
