import { afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ user: null as { id: string; email: string; emailVerified: boolean } | null, grant: null as { role: string } | null, reads: vi.fn() }));
vi.mock("./auth", () => ({ getLensCheckAuth: () => ({ getSession: async () => ({ data: { user: mocks.user } }) }) }));
vi.mock("./db/client", () => ({ getDb: () => ({ select: () => ({ from: () => ({ where: () => ({ limit: async () => { mocks.reads(); return mocks.grant ? [mocks.grant] : []; } }) }) }) }) }));
import { permittedTestEmail, reportPrincipal } from "./report-access";
afterEach(() => { vi.unstubAllEnvs(); mocks.user = null; mocks.grant = null; vi.clearAllMocks(); });
describe("account-based report roles", () => {
  it("allows only a freshly verified configured owner, never client roles", async () => {
    vi.stubEnv("LENS_CHECK_REPORT_ADMIN_EMAILS", "owner@example.invalid");
    mocks.user = { id: "owner", email: "OWNER@example.invalid", emailVerified: false };
    expect(await reportPrincipal()).toBeNull();
    mocks.user.emailVerified = true;
    expect(await reportPrincipal()).toEqual({ email: "owner@example.invalid", role: "admin" });
    expect(mocks.reads).not.toHaveBeenCalled();
  });
  it("requires a server grant for another verified account and revokes immediately", async () => {
    vi.stubEnv("LENS_CHECK_REPORT_ADMIN_EMAILS", "owner@example.invalid");
    mocks.user = { id: "sam", email: "sam@example.invalid", emailVerified: true };
    expect(await reportPrincipal()).toBeNull();
    mocks.grant = { role: "viewer" };
    expect((await reportPrincipal())?.role).toBe("viewer");
    mocks.grant = null;
    expect(await reportPrincipal()).toBeNull();
  });
  it("lets an explicitly granted reporter sign in without opening signup to everyone", async () => {
    vi.stubEnv("LENS_CHECK_REPORT_ADMIN_EMAILS", "owner@example.invalid");
    const config = { baseUrl: "https://auth.example.invalid", secret: "s".repeat(32), testEmails: [], socialProviders: [], passwordEnabled: true };
    expect(await permittedTestEmail("stranger@example.invalid", config)).toBe(false);
    mocks.grant = { role: "viewer" };
    expect(await permittedTestEmail("sam@example.invalid", config)).toBe(true);
  });
});
