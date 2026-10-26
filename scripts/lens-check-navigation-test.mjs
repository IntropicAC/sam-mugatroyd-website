// Browser regression checks against the isolated local server. No database
// writes, email sends or real sessions: the browser's Auth requests are mocked.
// Supply playwright-core via LENS_CHECK_PLAYWRIGHT_MODULE if installed outside
// this repository, and use the locally installed Microsoft Edge browser.
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const { chromium } = await import(process.env.LENS_CHECK_PLAYWRIGHT_MODULE || "playwright-core");
console.log("Starting isolated navigation checks in Edge.");
const browser = await chromium.launch({ channel: "msedge", headless: true });
const origin = "http://localhost:3100";
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
let signedIn = false;
let hasSavedResults = false;
let archetypeId = "navigator";
let resultKind = "matched";
let failResults = false;
let resultsRequests = 0;
let failSignOut = false;
let signOutRequests = 0;
let codeRequests = 0;
let signInRequests = 0;
let socialRequests = 0;
const sessionRequests = [];
const user = { id: "synthetic", email: "navigation@example.invalid", emailVerified: true, name: "Navigation test" };
try {
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) return route.abort();
    if (url.pathname === "/api/lens-check/my-results") {
      resultsRequests++;
      assert.ok(signedIn, "Signed-out visitors must not request saved results");
      return route.fulfill({ status: failResults ? 503 : 200, json: failResults
        ? { error: "Synthetic outage" }
        : { results: hasSavedResults ? [{ token: "synthetic-reading", archetypeId, resultKind }, { token: "older-reading", archetypeId: "alchemist", resultKind: "matched" }] : [] } });
    }
    if (url.pathname === "/api/auth/get-session") {
      sessionRequests.push(signedIn);
      return route.fulfill({ json: signedIn ? {
        session: { id: "navigation-test", userId: "synthetic", expiresAt: new Date(Date.now() + 3600_000).toISOString() },
        user,
      } : null });
    }
    if (url.pathname === "/api/auth/sign-out") {
      signOutRequests++;
      if (failSignOut) return route.fulfill({ status: 500, json: { message: "Test failure" } });
      signedIn = false;
      return route.fulfill({ json: { success: true } });
    }
    if (url.pathname === "/api/auth/email-otp/send-verification-otp") {
      codeRequests++;
      return route.fulfill({ json: { success: true } });
    }
    if (url.pathname === "/api/auth/sign-in/email-otp") {
      signInRequests++;
      signedIn = true;
      return route.fulfill({ json: { user, token: "synthetic-navigation-test-only" } });
    }
    if (url.pathname === "/api/auth/sign-in/social") {
      socialRequests++;
      return route.fulfill({ status: 503, json: { message: "Synthetic provider outage" } });
    }
    if (url.pathname.startsWith("/api/auth/")) throw new Error("Unexpected Auth mutation in navigation test");
    return route.continue();
  });
  await context.addInitScript(() => {
    sessionStorage.setItem("navigation-test-documents", String(Number(sessionStorage.getItem("navigation-test-documents") || 0) + 1));
    localStorage.setItem("p47-cookie-consent", "accepted");
    // Reproduce globals surviving/injected on a private document. They must
    // never cause an initial private page to reload itself.
    window.__p47GaInitialized = true;
    window.clarity = () => {};
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20_000);
  page.setDefaultNavigationTimeout(30_000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${origin}/lens-check`, { waitUntil: "domcontentloaded" });
  console.log("Loaded private page.");
  const header = page.locator("header");
  await header.getByRole("link", { name: "Sign in", exact: true }).waitFor();
  assert.equal(await header.getByRole("link", { name: "My results", exact: true }).count(), 0);
  assert.equal(resultsRequests, 0);
  await page.waitForTimeout(2500);
  assert.equal(await page.evaluate(() => sessionStorage.getItem("navigation-test-documents")), "1", "Initial private page must stay on one document");
  assert.equal(await page.locator("script[src*='clarity.ms'], script[src*='googletagmanager.com']").count(), 0);

  for (const width of [320, 375, 768, 1024, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const visibleControls = await header.locator("a, button").evaluateAll((nodes) => nodes
      .map((node) => ({ text: node.textContent?.trim(), rect: node.getBoundingClientRect() }))
      .filter(({ rect }) => rect.width > 0 && rect.height > 0)
      .map(({ text, rect }) => ({ text, left: rect.left, right: rect.right })));
    for (const control of visibleControls) {
      assert.ok(control.left >= 0 && control.right <= width, `Header control outside ${width}px viewport: ${control.text}`);
    }
    for (let index = 1; index < visibleControls.length; index++) {
      assert.ok(visibleControls[index].left >= visibleControls[index - 1].right, `Header controls overlap at ${width}px`);
    }
  }
  await page.setViewportSize({ width: 375, height: 900 });
  await header.getByRole("button", { name: "Open navigation menu" }).click();
  const mobile = page.getByRole("navigation", { name: "Mobile navigation" });
  assert.equal(await mobile.getByRole("link", { name: "My results", exact: true }).count(), 0);
  await mobile.getByRole("link", { name: "Sign in", exact: true }).waitFor();
  await mobile.getByRole("button", { name: "Close menu" }).click();
  await page.setViewportSize({ width: 1280, height: 900 });

  // Public-to-private navigation may replace the document once to remove
  // analytics. Subsequent private navigations and refreshes must stay stable.
  await page.goto(origin, { waitUntil: "networkidle" });
  const beforeEntry = await page.evaluate(() => Number(sessionStorage.getItem("navigation-test-documents")));
  await header.getByRole("link", { name: "Mindset Test", exact: true }).click();
  await page.waitForURL(`${origin}/lens-check`);
  await page.waitForTimeout(3000);
  assert.equal(await page.evaluate(() => Number(sessionStorage.getItem("navigation-test-documents"))), beforeEntry + 1);

  signedIn = true;
  await page.reload({ waitUntil: "networkidle" });
  await header.getByRole("button", { name: "Sign out", exact: true }).waitFor();
  assert.equal(await header.getByRole("link", { name: "My results", exact: true }).count(), 0, "Empty accounts must not show My results");
  assert.equal(await header.getByRole("link", { name: "My account", exact: true }).locator("img").count(), 0);
  hasSavedResults = true;
  await page.evaluate(() => window.dispatchEvent(new Event("lens-check:results-updated")));
  await header.getByRole("link", { name: "My results", exact: true }).waitFor();
  const accountAvatar = header.getByRole("link", { name: "My account", exact: true }).locator("img");
  await accountAvatar.waitFor();
  assert.ok((await accountAvatar.getAttribute("src")).endsWith("/navigator.webp"));
  archetypeId = "lighthouse";
  await page.evaluate(() => window.dispatchEvent(new Event("lens-check:results-updated")));
  await page.waitForFunction(() => document.querySelector('header a[aria-label="My account"] img')?.getAttribute("src")?.endsWith("/lighthouse.webp"));
  resultKind = "mixed";
  await page.evaluate(() => window.dispatchEvent(new Event("lens-check:results-updated")));
  await accountAvatar.waitFor({ state: "detached" });
  archetypeId = "unknown-archetype";
  resultKind = "matched";
  await page.evaluate(() => window.dispatchEvent(new Event("lens-check:results-updated")));
  await page.waitForTimeout(250);
  assert.equal(await accountAvatar.count(), 0, "Unknown and mixed latest results must not display an older archetype");
  archetypeId = "navigator";
  failResults = true;
  await page.evaluate(() => window.dispatchEvent(new Event("lens-check:results-updated")));
  await header.getByRole("link", { name: "My results", exact: true }).waitFor({ state: "detached" });
  assert.equal(await accountAvatar.count(), 0);
  failResults = false;
  await page.evaluate(() => window.dispatchEvent(new Event("lens-check:results-updated")));
  await header.getByRole("link", { name: "My results", exact: true }).waitFor();
  for (const name of ["My results", "Sign out"]) {
    const size = await header.getByRole(name === "Sign out" ? "button" : "link", { name, exact: true }).evaluate((node) => getComputedStyle(node).fontSize);
    assert.equal(size, await header.getByRole("link", { name: "Home", exact: true }).evaluate((node) => getComputedStyle(node).fontSize));
  }
  assert.equal((await header.getByRole("link", { name: "Mindset Test", exact: true }).boundingBox()).height, 40);
  const beforePrivateNavigation = await page.evaluate(() => Number(sessionStorage.getItem("navigation-test-documents")));
  await header.getByRole("link", { name: "My results", exact: true }).click();
  await page.waitForURL(`${origin}/lens-check/my-results`);
  await page.waitForTimeout(1000);
  assert.equal(await page.evaluate(() => Number(sessionStorage.getItem("navigation-test-documents"))), beforePrivateNavigation);

  signedIn = true;
  await page.reload({ waitUntil: "networkidle" });
  await header.getByRole("button", { name: "Sign out", exact: true }).waitFor().catch(async (error) => {
    console.log({ header: await header.innerText(), errors, sessionRequests });
    throw error;
  });
  failSignOut = true;
  await header.getByRole("button", { name: "Sign out", exact: true }).click();
  await header.getByRole("alert").waitFor();
  assert.equal(await header.getByRole("button", { name: "Sign out", exact: true }).count(), 1);
  failSignOut = false;
  await header.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.waitForURL(`${origin}/lens-check/account?status=signed-out`);
  await header.getByRole("link", { name: "Sign in", exact: true }).waitFor();
  assert.equal(await header.getByRole("link", { name: "My results", exact: true }).count(), 0);
  assert.equal(signOutRequests, 2);
  const beforeSignIn = await page.evaluate(() => sessionStorage.getItem("navigation-test-documents"));
  await header.getByRole("link", { name: "Sign in", exact: true }).click();
  await page.getByRole("button", { name: "Continue with Google", exact: true }).click();
  await page.locator(".lc-account-form").getByRole("alert").waitFor();
  assert.equal(socialRequests, 1);
  assert.equal(await page.getByRole("button", { name: "Continue with Microsoft", exact: true }).count(), 0, "Unconfigured providers must not appear");
  await mkdir("output/lens-check-account-qa", { recursive: true });
  for (const width of [320, 375, 768, 1024, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `Account overflow at ${width}px`);
    await page.screenshot({ path: `output/lens-check-account-qa/sign-in-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByRole("button", { name: "Use an email code instead", exact: true }).click();
  await page.getByLabel("Email address", { exact: true }).fill(user.email);
  await page.getByRole("button", { name: "Email me a code", exact: true }).click();
  await page.getByLabel("Email code", { exact: true }).fill("123456");
  await page.getByRole("button", { name: "Verify and sign in", exact: true }).click();
  await header.getByRole("button", { name: "Sign out", exact: true }).waitFor();
  await page.waitForURL(`${origin}/lens-check/my-results`);
  assert.equal(await page.evaluate(() => sessionStorage.getItem("navigation-test-documents")), beforeSignIn, "Signing in must update the header without a document reload");
  assert.equal(codeRequests, 1);
  assert.equal(signInRequests, 1);
  for (const width of [320, 375, 768, 1024, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const positions = await header.locator("a, button").evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect()).filter((rect) => rect.width && rect.height).map((rect) => ({ left: rect.left, right: rect.right })));
    positions.forEach((rect, index) => {
      assert.ok(rect.left >= 0 && rect.right <= width, `Signed-in header outside ${width}px viewport`);
      if (index) assert.ok(rect.left >= positions[index - 1].right, `Signed-in header overlap at ${width}px`);
    });
  }
  await page.setViewportSize({ width: 375, height: 900 });
  await header.getByRole("button", { name: "Open navigation menu" }).click();
  await mobile.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.waitForURL(`${origin}/lens-check/account?status=signed-out`);
  await header.getByRole("link", { name: "Sign in", exact: true }).waitFor();
  assert.equal(signOutRequests, 3);
  assert.deepEqual(errors, []);
  console.log("Passed: stable private documents, one public/private boundary reload, private navigation, five header widths, mobile account links, immediate sign-in/out updates and failed-sign-out recovery. Auth responses were mocked; no email was sent.");
} finally {
  await context.close();
  await browser.close();
}
