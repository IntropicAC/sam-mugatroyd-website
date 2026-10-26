import { afterEach, describe, expect, it, vi } from "vitest";
import { sendResultEmail } from "./email";
import { getEmailConfig } from "./email-config";

const setup = {
  LENS_CHECK_EMAIL_MODE: "test",
  RESEND_API_KEY: "test-key",
  LENS_CHECK_FROM_EMAIL: "Mindset Test <reading@mail.sample.org>",
  LENS_CHECK_REPLY_TO_EMAIL: "support@sample.org",
  LENS_CHECK_EMAIL_TEST_RECIPIENTS: "tester@sample.org",
};
const message = {
  to: "tester@sample.org", firstName: null, status: "unclear" as const,
  archetypeTitles: [], oneLiner: null, resultUrl: "https://sample.org/reading",
  bookingUrl: "https://sample.org/book", followUpConsent: false,
};

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("email setup safety", () => {
  it("disables email by default, with placeholders, or with an unapproved recipient", () => {
    expect(getEmailConfig(message.to, {})).toBeNull();
    expect(getEmailConfig(message.to, { ...setup, LENS_CHECK_EMAIL_MODE: "disabled" })).toBeNull();
    expect(getEmailConfig(message.to, { ...setup, LENS_CHECK_FROM_EMAIL: "Mindset Test <reading@example.invalid>" })).toBeNull();
    expect(getEmailConfig(message.to, { ...setup, LENS_CHECK_REPLY_TO_EMAIL: "sam@example.com" })).toBeNull();
    expect(getEmailConfig("customer@sample.org", setup)).toBeNull();
    expect(getEmailConfig(message.to, setup)).not.toBeNull();
  });
  it("makes no network request while disabled, even with credentials present", async () => {
    Object.entries({ ...setup, LENS_CHECK_EMAIL_MODE: "disabled" }).forEach(([key, value]) => vi.stubEnv(key, value));
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await sendResultEmail(message)).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("uses the configured reply mailbox for approved test delivery", async () => {
    Object.entries(setup).forEach(([key, value]) => vi.stubEnv(key, value));
    const fetch = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetch);
    expect(await sendResultEmail(message)).toBe(true);
    const payload = JSON.parse(fetch.mock.calls[0][1].body);
    expect(payload.reply_to).toBe(setup.LENS_CHECK_REPLY_TO_EMAIL);
    expect(payload.to).toEqual([message.to]);
  });
  it("does not log provider bodies or network errors containing private data", async () => {
    Object.entries(setup).forEach(([key, value]) => vi.stubEnv(key, value));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("private recipient and token", { status: 429 })));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await sendResultEmail(message)).toBe(false);
    expect(JSON.stringify(log.mock.calls)).not.toContain("private recipient");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("secret key")));
    expect(await sendResultEmail(message)).toBe(false);
    expect(JSON.stringify(log.mock.calls)).not.toContain("secret key");
  });
});
