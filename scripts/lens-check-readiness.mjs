// Read-only infrastructure check. Prints metadata, never credentials or customer data.
// Usage: node scripts/lens-check-readiness.mjs
import { neon } from "@neondatabase/serverless";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

try {
  process.loadEnvFile(".env.local");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const connection = process.env.DATABASE_URL;
if (!connection) {
  console.log(JSON.stringify({ database: "not_configured" }));
  process.exit(1);
}

let endpoint;
try {
  endpoint = new URL(connection);
} catch {
  console.log(JSON.stringify({ database: "invalid_connection_url" }));
  process.exit(1);
}

console.log(JSON.stringify({
  connection: {
    provider: endpoint.hostname.endsWith(".neon.tech") ? "Neon" : "other",
    endpoint: endpoint.hostname,
    pooled: endpoint.hostname.includes("-pooler"),
    sslmode: endpoint.searchParams.get("sslmode"),
  },
  configuration: Object.fromEntries([
    "DATABASE_URL", "DATABASE_NEON_AUTH_BASE_URL", "NEON_AUTH_BASE_URL", "NEON_AUTH_COOKIE_SECRET",
    "LENS_CHECK_AUTH_ENABLED", "LENS_CHECK_AUTH_TEST_EMAILS",
    "RESEND_API_KEY", "LENS_CHECK_FROM_EMAIL", "LENS_CHECK_REPLY_TO_EMAIL",
    "LENS_CHECK_EMAIL_MODE", "LENS_CHECK_EMAIL_TEST_RECIPIENTS",
  ].map((key) => [key, Boolean(process.env[key]?.trim())])),
}));

const sql = neon(connection);
try {
  const [identity, schemas, tables, columns, migrationRows, role] = await sql.transaction([
    sql`select current_database() as database, current_user as role, current_setting('server_version') as postgres_version`,
    sql`select schema_name from information_schema.schemata where schema_name in ('public', 'neon_auth', 'auth', 'drizzle') order by schema_name`,
    sql`select table_schema, table_name from information_schema.tables where table_schema in ('neon_auth', 'auth', 'drizzle') or (table_schema = 'public' and table_name like 'lens_check_%') order by table_schema, table_name`,
    sql`select table_name, column_name, data_type, is_nullable from information_schema.columns where table_schema = 'public' and table_name in ('lens_check_responses', 'lens_check_leads') order by table_name, ordinal_position`,
    sql`select to_regclass('drizzle.__drizzle_migrations') is not null as migration_table_exists`,
    sql`select rolname, rolsuper, rolcreaterole, rolcreatedb, rolbypassrls from pg_roles where rolname = current_user`,
  ], { readOnly: true, fetchOptions: { signal: AbortSignal.timeout(15000) } });

  const metadata = { identity, schemas, tables, columns, role };
  if (migrationRows[0]?.migration_table_exists) {
    const [appliedMigrations] = await sql.transaction([
      sql`select id, hash, created_at from drizzle.__drizzle_migrations order by id`,
    ], { readOnly: true, fetchOptions: { signal: AbortSignal.timeout(15000) } });
    metadata.appliedMigrations = appliedMigrations;
    const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8"));
    metadata.localMigrationComparison = journal.entries.map((entry) => {
      const file = readFileSync(`drizzle/${entry.tag}.sql`, "utf8");
      const expectedHash = createHash("sha256").update(file).digest("hex");
      const applied = appliedMigrations.find((migration) => String(migration.created_at) === String(entry.when));
      return { migration: entry.tag, applied: Boolean(applied), sqlHashMatches: applied?.hash === expectedHash };
    });
  }

  console.log(JSON.stringify({ database: "reachable", metadata }, null, 2));
} catch (error) {
  // Provider/network messages can contain connection details; output only safe codes.
  console.log(JSON.stringify({
    database: "check_failed",
    errorType: error.name,
    errorCode: error.code ?? null,
    networkCode: error.sourceError?.cause?.code ?? error.cause?.code ?? null,
  }));
  process.exitCode = 1;
}
