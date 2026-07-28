#!/usr/bin/env node
/**
 * Applies SQL migrations from supabase/migrations/ once per file.
 * Requires direct Postgres URL (not the Supabase REST URL).
 *
 * Netlify: set SUPABASE_DATABASE_URL in site environment variables.
 * Local: optional — skipped if unset.
 */
import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";

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
          "Supabase → Project Settings → Database → Connection string (URI).\n" +
          "Use the Session pooler or Direct connection with the database password.\n",
      );
      process.exit(1);
    }
    process.stdout.write(
      "Skipping migrations (SUPABASE_DATABASE_URL not set). OK for local dev.\n",
    );
    return;
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
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
  process.exit(1);
});
