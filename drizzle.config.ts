import { defineConfig } from "drizzle-kit";

// drizzle-kit doesn't read Next's env files, so load .env.local when present.
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local; rely on the shell environment.
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/lens-check/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
