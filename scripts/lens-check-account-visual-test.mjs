// Uses synthetic server-rendered components inside the local page's real CSS.
// This checks presentation; it does not establish or bypass a server session.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const { chromium } = await import(process.env.LENS_CHECK_PLAYWRIGHT_MODULE || "playwright-core");
const browser = await chromium.launch({ channel: "msedge", headless: true });
try {
  const context = await browser.newContext();
  await context.route("**/*", (route) => new URL(route.request().url()).origin === "http://localhost:3100" ? route.continue() : route.abort());
  const page = await context.newPage();
  await page.goto("http://localhost:3100/lens-check/account", { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  for (const fixture of ["history", "empty-history", "account", "signed-out"]) {
    const html = await readFile(`output/lens-check-account-qa/${fixture}.html`, "utf8");
    await page.evaluate((markup) => { document.querySelector("main").innerHTML = markup; }, html);
    for (const width of [320, 375, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => document.fonts.ready);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${fixture} overflow at ${width}px`);
      for (const link of await page.locator("main a").all()) {
        const bounds = await link.boundingBox();
        if (bounds) assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width, `${fixture} link outside viewport at ${width}px`);
      }
      await page.screenshot({ path: `output/lens-check-account-qa/${fixture}-${width}.png`, fullPage: true });
    }
  }
  console.log("Passed: synthetic reading history, empty history, signed-in account and signed-out layouts at four widths. No real account or questionnaire data used.");
  await context.close();
} finally { await browser.close(); }
