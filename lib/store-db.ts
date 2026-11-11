import { Pool } from "pg";

const globalForStoreDb = globalThis as typeof globalThis & {
  storePool?: Pool;
};

export function getStoreDb(): Pool {
  if (globalForStoreDb.storePool) {
    return globalForStoreDb.storePool;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: true }
        : undefined,
  });

  globalForStoreDb.storePool = pool;
  return pool;
}
