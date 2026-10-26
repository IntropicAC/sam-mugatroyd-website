import { describe, expect, it } from "vitest";
import { credentialPayload, validNewPassword } from "./password-policy";

describe("password request boundary", () => {
  it("requires 15 characters including Unicode counting, bounds size and permits passphrases", () => {
    expect(validNewPassword("a useful long passphrase")).toBe(true);
    expect(validNewPassword("x".repeat(128))).toBe(true);
    expect(validNewPassword("x".repeat(129))).toBe(false);
    expect(validNewPassword("short")).toBe(false);
    expect(validNewPassword("😀".repeat(8))).toBe(false);
    expect(validNewPassword(" ".repeat(15))).toBe(false);
  });
  it("preserves the exact password including spaces and normalizes only the email", () => {
    const password = "  exact passphrase  ";
    expect(credentialPayload("sign-up/email", { email: " Tester@sample.org ", password, role: "admin", emailVerified: true }))
      .toEqual({ email: "tester@sample.org", password, name: "Mindset Test reader" });
    expect(credentialPayload("sign-in/email", { email: "tester@sample.org", password: "older-password" })?.password).toBe("older-password");
  });
  it("requires the OTP and a valid new password together for reset and drops identity overrides", () => {
    const body = { email: "tester@sample.org", otp: "123456", password: "synthetic passphrase", userId: "other", emailVerified: true };
    expect(credentialPayload("email-otp/reset-password", body)).toEqual({ email: body.email, otp: body.otp, password: body.password });
    expect(credentialPayload("email-otp/reset-password", { ...body, otp: "" })).toBeNull();
    expect(credentialPayload("email-otp/reset-password", { ...body, password: "short" })).toBeNull();
    expect(credentialPayload("email-otp/verify-email", body)).toEqual({ email: body.email, otp: body.otp });
  });
});
