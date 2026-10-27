// Applies db/schema.sql to DATABASE_URL. Idempotent.
// Usage: npm run db:migrate
import { readFileSync } from "node:fs";
import path from "node:path";
import { Client } from "pg";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: process.env.DATABASE_SSL !== "no-verify" },
  });
  await client.connect();
  try {
    await client.query(readFileSync(path.join(process.cwd(), "db", "schema.sql"), "utf8"));
    console.log("Schema applied.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
