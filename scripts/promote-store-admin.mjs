import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import pg from "pg";

const { Pool } = pg;
const { loadEnvConfig } = nextEnv;
const scriptDirectory = dirname(fileURLToPath(import.meta.url));

loadEnvConfig(join(scriptDirectory, ".."));

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const connectionString = process.env.DATABASE_URL;

if (!email || !connectionString) {
  throw new Error("ADMIN_EMAIL and DATABASE_URL are required.");
}

const pool = new Pool({ connectionString, max: 1 });

try {
  const result = await pool.query(
    `UPDATE store_users
     SET role = 'admin',
         is_primary_admin = NOT EXISTS (
           SELECT 1 FROM store_users WHERE is_primary_admin = TRUE
         ),
         updated_at = NOW()
     WHERE email = $1 AND is_active = TRUE
     RETURNING email`,
    [email],
  );

  if (result.rowCount !== 1) {
    throw new Error(
      "No active account was found for ADMIN_EMAIL. Sign up with that address first, then retry.",
    );
  }

  console.log(`Promoted ${email} to store administrator.`);
} finally {
  await pool.end();
}
