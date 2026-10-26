// Local Auth-only test server. Never replaces .env.local or Vercel settings.
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const settings = parseEnv(readFileSync(new URL("../.env.lens-check-auth-test.local", import.meta.url), "utf8"));
const branchId = settings.LENS_CHECK_AUTH_TEST_BRANCH_ID;
const authUrl = new URL(settings.NEON_AUTH_BASE_URL || "https://invalid.invalid");
if (branchId !== "br-late-scene-za1drn9y" ||
    authUrl.href !== "https://ep-dark-resonance-zarvaw2v.neonauth.c-2.eu-west-2.aws.neon.tech/neondb/auth" ||
    !(settings.NEON_AUTH_COOKIE_SECRET?.length >= 32) ||
    !settings.LENS_CHECK_AUTH_TEST_EMAILS?.trim() ||
    !(Date.parse(settings.LENS_CHECK_AUTH_TEST_EXPIRES_AT) > Date.now())) {
  throw new Error("The isolated Auth test configuration is missing, invalid or expired.");
}

const databaseUrl = settings.DATABASE_URL ? new URL(settings.DATABASE_URL) : null;
if (databaseUrl && (!/^ep-dark-resonance-zarvaw2v(-pooler)?\.c-2\.eu-west-2\.aws\.neon\.tech$/.test(databaseUrl.hostname) || databaseUrl.pathname !== "/neondb")) {
  throw new Error("The test database does not match the isolated Auth branch.");
}
// Explicit values stop Next's .env.local loading from filling these with
// production credentials. No fallback to the main database is permitted.
const env = {
  ...process.env,
  ...settings,
  DATABASE_URL: settings.DATABASE_URL || "",
  DATABASE_NEON_AUTH_BASE_URL: "",
  DATABASE_VITE_NEON_AUTH_URL: "",
  LENS_CHECK_AUTH_ENABLED: "true",
  LENS_CHECK_AUTH_PASSWORD_ENABLED: "true",
  // Google shared development credentials were verified on this test branch.
  // Microsoft stays hidden until its own credentials are configured and tested.
  LENS_CHECK_AUTH_SOCIAL_PROVIDERS: settings.LENS_CHECK_AUTH_SOCIAL_PROVIDERS || "google",
  LENS_CHECK_ACCOUNTS_ENABLED: databaseUrl ? "true" : "false",
  LENS_CHECK_EMAIL_MODE: "disabled",
  LENS_CHECK_REPORTING_COHORT: "test",
  RESEND_API_KEY: "",
  NEXT_TELEMETRY_DISABLED: "1",
};
const next = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
if (databaseUrl) {
  const cleanup = () => {
    // Use the same validated environment and startup CA configuration as Next.
    const source = "import { neon } from '@neondatabase/serverless'; const sql = neon(process.env.DATABASE_URL); await sql.query('DELETE FROM lens_check_journeys WHERE started_at < $1', [new Date(Date.now() - 90 * 86400000).toISOString()]);";
    const task = spawn(process.execPath, ["--input-type=module", "-e", source], { cwd: root, env, stdio: "ignore", windowsHide: true });
    task.on("error", () => console.warn("Progress retention maintenance could not start."));
    task.on("exit", code => { if (code) console.warn("Progress retention maintenance is unavailable; check the reporting migration."); });
  };
  void cleanup();
  setInterval(cleanup, 3600000).unref();
}
console.log("Starting isolated Mindset Test Auth test at http://localhost:3100/lens-check/account");
console.log(databaseUrl ? "Saved results use the isolated test database. Website emails are disabled." : "Website database access and website emails are disabled.");
const child = spawn(process.execPath, [next, "dev", "--hostname", "localhost", "--port", "3100"], {
  cwd: root, env, stdio: "inherit", windowsHide: true,
});
child.on("error", () => { console.error("Could not start the Auth test server."); process.exitCode = 1; });
child.on("exit", (code) => { process.exitCode = code ?? 1; });
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
