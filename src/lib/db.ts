// Server-side only. Never import from a Client Component.
import { Pool } from "pg";

/**
 * Minimal query interface. Production uses a `pg` Pool; tests inject PGlite,
 * which exposes the same `query(text, params)` shape.
 */
export type Db = {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<{ rows: T[] }>;
};

let pool: Pool | undefined;

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("DATABASE_URL is not set");
  }
}

export function getDb(): Db {
  if (!process.env.DATABASE_URL) throw new DatabaseNotConfiguredError();
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.DATABASE_POOL_MAX ?? 5),
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 30_000,
      ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: process.env.DATABASE_SSL !== "no-verify" },
    });
  }
  return pool as unknown as Db;
}
