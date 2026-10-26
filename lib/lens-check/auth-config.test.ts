import { describe, expect, it } from "vitest";
import { getAuthConfig, getSocialProviders, isAllowedAuthUser, isAuthTestEmail } from "./auth-config";

const setup = {
  LENS_CHECK_AUTH_ENABLED: "true",
  DATABASE_NEON_AUTH_BASE_URL: "https://existing.neonauth.example/neondb/auth",
  NEON_AUTH_COOKIE_SECRET: "a".repeat(32),
  LENS_CHECK_AUTH_TEST_EMAILS: " Tester@sample.org ",
};

describe("Auth setup boundary", () => {
  it("stays disabled by default and without an explicit test recipient", () => {
    expect(getAuthConfig({})).toBeNull();
    expect(getAuthConfig({ ...setup, LENS_CHECK_AUTH_ENABLED: "false" })).toBeNull();
    expect(getAuthConfig({ ...setup, LENS_CHECK_AUTH_TEST_EMAILS: "" })).toBeNull();
    expect(getAuthConfig({ ...setup, NEON_AUTH_COOKIE_SECRET: "short" })).toBeNull();
  });
  it("reuses the marketplace variable and permits an isolated branch override", () => {
    expect(getAuthConfig(setup)?.baseUrl).toBe(setup.DATABASE_NEON_AUTH_BASE_URL);
    expect(getAuthConfig({ ...setup, NEON_AUTH_BASE_URL: "https://test.neonauth.example/auth" })?.baseUrl)
      .toBe("https://test.neonauth.example/auth");
  });
  it("rejects insecure or credential-bearing endpoints", () => {
    for (const baseUrl of ["http://neon.example/auth", "https://user:password@neon.example/auth", "not-a-url"]) {
      expect(getAuthConfig({ ...setup, NEON_AUTH_BASE_URL: baseUrl })).toBeNull();
    }
  });
  it("allows exact test addresses only", () => {
    const config = getAuthConfig(setup)!;
    expect(isAuthTestEmail("TESTER@sample.org", config)).toBe(true);
    expect(isAuthTestEmail("tester+other@sample.org", config)).toBe(false);
    expect(isAuthTestEmail(null, config)).toBe(false);
  });
  it("only offers explicitly configured supported social providers", () => {
    expect(getSocialProviders({})).toEqual([]);
    expect(getSocialProviders({ LENS_CHECK_AUTH_SOCIAL_PROVIDERS: "google,microsoft,google,unknown" })).toEqual(["google", "microsoft"]);
  });
  it("requires the approved verified identity after social sign-in as well as email sign-in", () => {
    const config = getAuthConfig(setup)!;
    expect(isAllowedAuthUser({ id: "subject", email: "tester@sample.org", emailVerified: true }, config)).toBe(true);
    expect(isAllowedAuthUser({ id: "subject", email: "someone@sample.org", emailVerified: true }, config)).toBe(false);
    expect(isAllowedAuthUser({ id: "subject", email: "tester@sample.org", emailVerified: false }, config)).toBe(false);
    expect(isAllowedAuthUser(null, config)).toBe(false);
  });
});
