import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { spawnSync } from "node:child_process";
const settings = parseEnv(readFileSync(".env.lens-check-auth-test.local", "utf8"));
const url = new URL(settings.DATABASE_URL || "https://invalid.invalid");
if (settings.LENS_CHECK_AUTH_TEST_BRANCH_ID !== "br-late-scene-za1drn9y" ||
    !/^ep-dark-resonance-zarvaw2v(-pooler)?\.c-2\.eu-west-2\.aws\.neon\.tech$/.test(url.hostname) ||
    !(Date.parse(settings.LENS_CHECK_AUTH_TEST_EXPIRES_AT) > Date.now())) throw new Error("Invalid/expired isolated database");
const files = process.argv.slice(2);
const result = spawnSync(process.execPath, ["node_modules/vitest/vitest.mjs", "run", ...(files.length ? files : ["lib/lens-check/accounts.integration.test.ts"])], {
  env: { ...process.env, DATABASE_URL: settings.DATABASE_URL, LENS_CHECK_ACCOUNT_INTEGRATION: "true", LENS_CHECK_ACCOUNT_HTTP: "true" },
  stdio: "inherit", windowsHide: true,
});
process.exitCode = result.status ?? 1;
