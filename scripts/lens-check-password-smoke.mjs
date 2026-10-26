// Isolated provider contract checks with an impossible-to-deliver synthetic
// address and invalid OTP. No email sends, signup, real login or password reset.
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
const settings = parseEnv(readFileSync(".env.lens-check-auth-test.local", "utf8"));
const base = settings.NEON_AUTH_BASE_URL;
assert.equal(settings.LENS_CHECK_AUTH_TEST_BRANCH_ID, "br-late-scene-za1drn9y");
assert.equal(base, "https://ep-dark-resonance-zarvaw2v.neonauth.c-2.eu-west-2.aws.neon.tech/neondb/auth");
assert.ok(Date.parse(settings.LENS_CHECK_AUTH_TEST_EXPIRES_AT) > Date.now());
for (const path of ["email-otp/verify-email", "email-otp/reset-password"]) {
  const response = await fetch(`${base}/${path}`, { method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:3100" },
    body: JSON.stringify({ email: "password-contract@fixture.invalid", otp: "000000", ...(path.endsWith("reset-password") ? { password: randomBytes(32).toString("base64url") } : {}) }) });
  assert.equal(response.status, 400, `${path} must reject the invalid OTP through its supported endpoint`);
  console.log(`${path}: supported endpoint rejected invalid OTP (400). No real identity or credential changed.`);
}
