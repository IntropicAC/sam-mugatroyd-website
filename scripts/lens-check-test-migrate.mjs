import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { parseEnv } from "node:util";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

const settings = parseEnv(readFileSync(".env.lens-check-auth-test.local", "utf8"));
const url = new URL(settings.DATABASE_URL || "https://invalid.invalid");
if (settings.LENS_CHECK_AUTH_TEST_BRANCH_ID !== "br-late-scene-za1drn9y" ||
    !/^ep-dark-resonance-zarvaw2v(-pooler)?\.c-2\.eu-west-2\.aws\.neon\.tech$/.test(url.hostname) ||
    !(Date.parse(settings.LENS_CHECK_AUTH_TEST_EXPIRES_AT) > Date.now())) throw new Error("Invalid/expired test database configuration");
const sql = neon(settings.DATABASE_URL);
const ledger = await sql`SELECT count(*)::int AS count FROM drizzle.__drizzle_migrations`;
if (!ledger[0].count) {
  // Schema-only branching retains DDL but empties Drizzle's ledger. Establish
  // its existing baseline only after checking the exact baseline column types
  // and that both application tables have no rows. Never applies to production.
  const snapshot = JSON.parse(readFileSync("drizzle/meta/0002_snapshot.json", "utf8"));
  const actual = await sql`SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name IN ('lens_check_leads', 'lens_check_responses') ORDER BY table_name, ordinal_position`;
  const normalize = (type) => type.replace("timestamp with time zone", "timestamptz");
  const expected = Object.values(snapshot.tables).flatMap((table) => Object.values(table.columns).map((column) => `${table.name}.${column.name}:${normalize(column.type)}`)).sort();
  const observed = actual.map((column) => `${column.table_name}.${column.column_name}:${normalize(column.data_type)}`).sort();
  const [counts] = await sql`SELECT (SELECT count(*) FROM public.lens_check_responses)::int AS responses, (SELECT count(*) FROM public.lens_check_leads)::int AS leads`;
  if (JSON.stringify(expected) !== JSON.stringify(observed) || counts.responses || counts.leads) throw new Error("Schema-only baseline did not match; no migration ledger changed");
  const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8"));
  await sql.transaction(journal.entries.filter((entry) => entry.idx < 3).map((entry) => {
    const hash = createHash("sha256").update(readFileSync(`drizzle/${entry.tag}.sql`, "utf8")).digest("hex");
    return sql`INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES (${hash}, ${entry.when})`;
  }));
  console.log("Established the verified schema-only Drizzle baseline.");
}
await migrate(drizzle({ client: sql }), { migrationsFolder: "./drizzle" });
console.log("Drizzle migrations applied to the isolated test branch only.");
