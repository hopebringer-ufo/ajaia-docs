#!/usr/bin/env node
/**
 * Applies SQL migrations from supabase/migrations/ once per file.
 *
 * Netlify: set SUPABASE_DATABASE_URL to the Session pooler URI (IPv4).
 * Direct db.*.supabase.co hosts often resolve to IPv6 only and fail on Netlify
 * with ENETUNREACH.
 *
 * Local: skipped if SUPABASE_DATABASE_URL is unset.
 */
import { setDefaultResultOrder, lookup } from "node:dns/promises";
import fs from "node:fs/promises";
import path from "node:path";
import { URL } from "node:url";
import pg from "pg";

// Prefer A (IPv4) records — Netlify build agents often cannot reach IPv6-only hosts.
setDefaultResultOrder("ipv4first");

const { Client } = pg;

const MIGRATIONS_DIR = path.join(process.cwd(), "supabase/migrations");
const TRACKING_TABLE = "public._ajaia_schema_migrations";

function getDatabaseUrl() {
  return (
    process.env.SUPABASE_DATABASE_URL?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    ""
  );
}

function isDirectSupabaseHost(hostname) {
  return /^db\.[a-z0-9]+\.supabase\.co$/i.test(hostname);
}

function poolerHint() {
  return (
    "Use the Session pooler URI (IPv4), not Direct connection:\n" +
    "  Supabase → Project Settings → Database → Connection string\n" +
    "  Method: Session pooler → copy URI\n" +
    "  Example: postgresql://postgres.PROJECTREF:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres\n" +
    "Set that value as SUPABASE_DATABASE_URL on Netlify, then redeploy.\n"
  );
}

/**
 * Resolve host to IPv4 and return a connection config that avoids IPv6-only routes.
 */
async function buildClientConfig(databaseUrl) {
  const parsed = new URL(databaseUrl);
  const hostname = parsed.hostname;

  if (isDirectSupabaseHost(hostname)) {
    process.stderr.write(
      "Warning: SUPABASE_DATABASE_URL looks like a Direct connection (db.*.supabase.co).\n" +
        "Netlify often cannot reach these hosts (IPv6 ENETUNREACH). Prefer Session pooler.\n",
    );
  }

  let host = hostname;
  try {
    const { address, family } = await lookup(hostname, { family: 4 });
    host = address;
    process.stdout.write(
      `Resolved ${hostname} → ${address} (IPv${family})\n`,
    );
  } catch {
    process.stderr.write(
      `Could not resolve IPv4 for ${hostname}. Trying default DNS (may fail on Netlify).\n`,
    );
  }

  const port = parsed.port ? Number(parsed.port) : 5432;
  const database = decodeURIComponent(
    (parsed.pathname || "/postgres").replace(/^\//, "") || "postgres",
  );
  const user = decodeURIComponent(parsed.username);
  const password = decodeURIComponent(parsed.password);

  return {
    host,
    port,
    database,
    user,
    password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 20_000,
  };
}

async function ensureTrackingTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${TRACKING_TABLE} (
      filename text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    );
  `);
}

async function listApplied(client) {
  const result = await client.query(
    `SELECT filename FROM ${TRACKING_TABLE}`,
  );
  return new Set(result.rows.map((row) => row.filename));
}

async function main() {
  const databaseUrl = getDatabaseUrl();
  const onNetlify = Boolean(process.env.NETLIFY);

  if (!databaseUrl) {
    if (onNetlify) {
      process.stderr.write(
        "SUPABASE_DATABASE_URL is required on Netlify to run migrations.\n" +
          poolerHint(),
      );
      process.exit(1);
    }
    process.stdout.write(
      "Skipping migrations (SUPABASE_DATABASE_URL not set). OK for local dev.\n",
    );
    return;
  }

  const config = await buildClientConfig(databaseUrl);
  const client = new Client(config);

  try {
    await client.connect();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Migration failed: ${message}\n`);
    if (
      /ENETUNREACH|ENOTFOUND|ETIMEDOUT|ECONNREFUSED|IPv6|getaddrinfo/i.test(
        message,
      )
    ) {
      process.stderr.write("\n" + poolerHint());
    }
    process.exit(1);
  }

  process.stdout.write("Connected to database for migrations.\n");

  try {
    await ensureTrackingTable(client);
    const applied = await listApplied(client);

    const entries = await fs.readdir(MIGRATIONS_DIR);
    const files = entries.filter((name) => name.endsWith(".sql")).sort();

    if (files.length === 0) {
      process.stdout.write("No migration files found.\n");
      return;
    }

    for (const filename of files) {
      if (applied.has(filename)) {
        process.stdout.write(`Migration already applied: ${filename}\n`);
        continue;
      }

      const filePath = path.join(MIGRATIONS_DIR, filename);
      const sql = await fs.readFile(filePath, "utf8");
      process.stdout.write(`Applying migration: ${filename}\n`);

      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          `INSERT INTO ${TRACKING_TABLE} (filename) VALUES ($1)`,
          [filename],
        );
        await client.query("COMMIT");
        process.stdout.write(`Applied: ${filename}\n`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    process.stdout.write("Migrations complete.\n");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  process.stderr.write(
    `Migration failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.stderr.write("\n" + poolerHint());
  process.exit(1);
});
