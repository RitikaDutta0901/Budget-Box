// backend/src/db/connect.ts
import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

let pool: Pool | null = null;

export async function initDb() {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
  }
  pool = new Pool({ connectionString });
  // quick smoke test
  await pool.query("SELECT 1");
  console.log("Postgres pool initialized");
  return pool;
}

export function getPool() {
  if (!pool) throw new Error("Pool not initialized. Call initDb() first.");
  return pool;
}
