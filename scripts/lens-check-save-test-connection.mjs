// Accept the isolated branch connection on stdin; never print it or modify .env.local.
import { readFileSync, writeFileSync } from "node:fs";
import { parseEnv } from "node:util";
if (process.stdin.isTTY) process.stdin.setRawMode(true);
console.log("Ready for test-connection JSON on stdin (input is hidden).");
const input = await new Promise((resolve, reject) => {
  let buffer = "";
  process.stdin.on("data", (chunk) => {
    buffer += chunk.toString("utf8");
    if (buffer.includes("\n") || buffer.includes("\r")) {
      if (process.stdin.isTTY) process.stdin.setRawMode(false);
      process.stdin.pause();
      resolve(buffer.trim());
    }
  });
  process.stdin.on("end", () => reject(new Error("No connection input received")));
  process.stdin.resume();
});
const { connection } = JSON.parse(input);
if (typeof connection !== "string" || /[\r\n]/.test(connection)) throw new Error("Invalid connection input");
const url = new URL(connection);
if (!/^ep-dark-resonance-zarvaw2v(-pooler)?\.c-2\.eu-west-2\.aws\.neon\.tech$/.test(url.hostname) || url.pathname !== "/neondb" || url.searchParams.get("sslmode") !== "require") throw new Error("Unexpected test database endpoint");
const path = ".env.lens-check-auth-test.local";
const settings = parseEnv(readFileSync(path, "utf8"));
if (settings.LENS_CHECK_AUTH_TEST_BRANCH_ID !== "br-late-scene-za1drn9y") throw new Error("Unexpected test branch");
if (settings.DATABASE_URL) throw new Error("Test DATABASE_URL already exists; refusing to overwrite it");
writeFileSync(path, readFileSync(path, "utf8") + `DATABASE_URL=${connection}\n`, { mode: 0o600 });
console.log("Added the isolated branch connection to the ignored test configuration; no credentials printed.");
