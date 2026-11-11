import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import pg from "pg";

const { Pool } = pg;
const { loadEnvConfig } = nextEnv;
const scriptDirectory = dirname(fileURLToPath(import.meta.url));

loadEnvConfig(join(scriptDirectory, ".."));
const connectionString =
  process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL is required to run store migrations.");
}

const pool = new Pool({ connectionString, max: 1 });
const client = await pool.connect();

try {
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(7419202601)");
  await client.query(`
    CREATE TABLE IF NOT EXISTS store_schema_migrations (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const migrationNames = [
    "0001_store",
    "0002_neon_auth",
    "0003_production_media",
    "0004_customer_profile",
    "0005_admin_storefront",
    "0006_admin_message_read_state",
  ];
  for (const migrationName of migrationNames) {
    const alreadyApplied = await client.query(
      "SELECT 1 FROM store_schema_migrations WHERE name = $1",
      [migrationName],
    );

    if (alreadyApplied.rowCount > 0) {
      continue;
    }

    const migrationSql = await readFile(
      join(scriptDirectory, "..", "prisma", "migrations", `${migrationName}.sql`),
      "utf8",
    );
    await client.query(migrationSql);
    await client.query(
      "INSERT INTO store_schema_migrations (id, name) VALUES ($1, $2)",
      [randomUUID(), migrationName],
    );
    console.log(`Applied ${migrationName}.`);
  }
  const productionSeed = await readFile(
    join(scriptDirectory, "..", "prisma", "seed-production.sql"),
    "utf8",
  );
  await client.query(productionSeed);
  console.log("Application database is up to date.");

  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}
