// Real local UI/SDK, synthetic Auth responses. Never sends mail or changes a
// real person's password, account or sessions.
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const { chromium } = await import(process.env.LENS_CHECK_PLAYWRIGHT_MODULE || "playwright-core");
const browser = await chromium.launch({ channel: "msedge", headless: true });
const origin = "http://localhost:3100";
const user = { id: "password-ui-fixture", name: "Fixture", email: "password-ui@example.invalid", emailVerified: true };
const originalPassword = "An original synthetic passphrase";
const replacementPassword = "A replacement synthetic passphrase";
let password = originalPassword;
let state = "anonymous";
let revokeCalls = 0;
let failRevocation = false;
const requests = [];
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin !== origin) return route.abort();
    if (!url.pathname.startsWith("/api/auth/")) return route.continue();
    const path = url.pathname.slice("/api/auth/".length);
    const data = request.method() === "POST" ? request.postDataJSON() : {};
    requests.push({ path, type: data.type });
    const ok = (json) => route.fulfill({ json });
    const fail = () => route.fulfill({ status: 400, json: { code: "SYNTHETIC_INVALID_CREDENTIAL", message: "Fixture rejection" } });
    if (path === "get-session") return ok(state === "verified" ? { user, session: { id: "fixture", userId: user.id, expiresAt: new Date(Date.now() + 3600_000).toISOString() } } : null);
    if (path === "sign-up/email") { password = data.password; state = "unverified"; return ok({ user: { ...user, emailVerified: false }, token: "synthetic-only" }); }
    if (path === "email-otp/send-verification-otp") return ok({ success: true });
    if (path === "email-otp/verify-email") {
      if (data.otp !== "123456") return fail();
      state = "verified"; return ok({ user, status: true, token: "synthetic-only" });
    }
    if (path === "sign-in/email") {
      if (data.password !== password) return fail();
      state = "verified"; return ok({ user, token: "synthetic-only" });
    }
    if (path === "email-otp/reset-password") {
      if (data.otp !== "123456") return fail();
      password = data.password; return ok({ success: true });
    }
    if (path === "revoke-other-sessions") { assert.equal(state, "verified"); revokeCalls++; return failRevocation ? fail() : ok({ status: true }); }
    if (path === "sign-out") { state = "anonymous"; return ok({ success: true }); }
    throw new Error(`Unexpected synthetic Auth route: ${path}`);
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${origin}/lens-check/account`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Welcome back", exact: true }).waitFor();
  await page.addStyleTag({ content: "nextjs-portal {display:none !important;}" });
  await mkdir("output/lens-check-account-qa", { recursive: true });
  for (const [width, height] of [[320, 568], [375, 667], [390, 844], [768, 768], [1280, 720], [1440, 900], [844, 390]]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => window.scrollTo(0, 0));
    const card = await page.locator(".lc-account-panel").boundingBox();
    assert.ok(Math.abs(card.x + card.width / 2 - width / 2) < 2, `Login card not centred at ${width}px`);
    const header = await page.locator("header").boundingBox();
    const footer = await page.locator(".lc-account-footer").boundingBox();
    assert.ok(card.y >= header.y + header.height, `Login hidden behind navigation at ${width}x${height}`);
    if (height >= 568) assert.ok(footer.y + footer.height <= height, `Login controls/links below viewport at ${width}x${height}`);
    else {
      await page.locator(".lc-account-footer").scrollIntoViewIfNeeded();
      const reachable = await page.locator(".lc-account-footer").boundingBox();
      assert.ok(reachable.y >= 0 && reachable.y + reachable.height <= height, "Short screens must scroll to all links");
    }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `output/lens-check-account-qa/simple-login-${width}x${height}.png` });
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByRole("button", { name: "Create an account", exact: true }).click();
  await page.getByLabel("Email address", { exact: true }).fill(user.email);
  await page.getByLabel("New password", { exact: true }).fill(originalPassword);
  await page.getByRole("button", { name: "Show password", exact: true }).click();
  assert.equal(await page.getByLabel("New password", { exact: true }).getAttribute("type"), "text");
  await page.getByRole("button", { name: "Hide password", exact: true }).click();
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await page.getByRole("heading", { name: "Verify your email", exact: true }).waitFor();
  await page.getByLabel("Email code", { exact: true }).fill("000000");
  await page.getByRole("button", { name: "Verify email", exact: true }).click();
  await page.locator(".lc-account-form").getByRole("alert").waitFor();
  assert.equal(new URL(page.url()).pathname, "/lens-check/account", "Unverified signup must not open history");
  assert.ok(requests.some(({ path, type }) => path === "email-otp/send-verification-otp" && type === "email-verification"));
  assert.ok(!requests.some(({ path }) => path === "sign-in/email-otp"), "Signup must preserve its password with email verification");
  await page.getByLabel("Email code", { exact: true }).fill("123456");
  await page.getByRole("button", { name: "Verify email", exact: true }).click();
  await page.waitForURL(`${origin}/lens-check/my-results`);
  const stored = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }));
  assert.ok(!stored.includes(originalPassword), "Password must not be persisted in browser storage");
  await page.locator("header").getByRole("button", { name: "Sign out", exact: true }).click();
  await page.waitForURL(`${origin}/lens-check/account?status=signed-out`);
  await page.getByLabel("Email address", { exact: true }).fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill("A deliberately wrong fixture password");
  await page.locator("main").getByRole("button", { name: "Sign in", exact: true }).click();
  await page.locator(".lc-account-form").getByRole("alert").waitFor();
  assert.equal(await page.getByLabel("Password", { exact: true }).inputValue(), "");
  await page.getByLabel("Password", { exact: true }).fill(originalPassword);
  await page.locator("main").getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(`${origin}/lens-check/my-results`);
  await page.locator("header").getByRole("button", { name: "Sign out", exact: true }).click();
  await page.waitForURL(`${origin}/lens-check/account?status=signed-out`);
  await page.getByRole("button", { name: "Forgot or set a password?", exact: true }).click();
  await page.getByLabel("Email address", { exact: true }).fill(user.email);
  await page.getByRole("button", { name: "Email a password code", exact: true }).click();
  await page.getByRole("heading", { name: "Choose your password", exact: true }).waitFor();
  await page.getByLabel("Email code", { exact: true }).fill("000000");
  await page.getByLabel("New password", { exact: true }).fill(replacementPassword);
  await page.getByRole("button", { name: "Save password", exact: true }).click();
  await page.locator(".lc-account-form").getByRole("alert").waitFor();
  assert.equal(password, originalPassword, "Rejected reset must not change the credential");
  await page.getByLabel("Email code", { exact: true }).fill("123456");
  await page.getByLabel("New password", { exact: true }).fill(replacementPassword);
  await page.getByRole("button", { name: "Save password", exact: true }).click();
  await page.waitForURL(`${origin}/lens-check/my-results`);
  assert.equal(password, replacementPassword);
  assert.equal(revokeCalls, 1);
  assert.ok(requests.some(({ path, type }) => path === "email-otp/send-verification-otp" && type === "forget-password"));
  state = "anonymous";
  failRevocation = true;
  await page.goto(`${origin}/lens-check/account`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Forgot or set a password?", exact: true }).click();
  await page.getByLabel("Email address", { exact: true }).fill(user.email);
  await page.getByRole("button", { name: "Email a password code", exact: true }).click();
  await page.getByLabel("Email code", { exact: true }).fill("123456");
  await page.getByLabel("New password", { exact: true }).fill(originalPassword);
  await page.getByRole("button", { name: "Save password", exact: true }).click();
  await page.getByText("Your password was saved, but we couldn't sign out your other devices.", { exact: false }).waitFor();
  assert.equal(await page.getByLabel("Password", { exact: true }).inputValue(), "");
  assert.equal(await page.getByLabel("Email code", { exact: true }).count(), 0, "Successful reset must not ask for the consumed OTP again");
  assert.deepEqual(errors, []);
  console.log("Passed: viewport fit at six desktop/phone sizes, reachable landscape controls, signup email verification, invalid-code protection, password visibility, password sign-in/failure, OTP reset, other-session revocation and no password in browser storage. All identities/responses were synthetic; no email sent or real credential changed.");
  await context.close();
} finally { await browser.close(); }
