/**
 * Applies schema.sql to the database configured by DATABASE_URL.
 * Run with: npm run db:migrate
 */
try {
  process.loadEnvFile?.(".env");
} catch {
  // No .env file — fine when DATABASE_URL is already set in the environment
  // (e.g. inside Docker Compose).
}

import { readFileSync } from "node:fs";
import path from "node:path";
import { Pool } from "pg";

async function main() {
  const sql = readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log("Applying schema...");
    await pool.query(sql);
    console.log("✓ Database schema is up to date.");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
