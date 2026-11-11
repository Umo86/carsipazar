import "server-only";
import { Pool, type PoolClient, type QueryResultRow } from "pg";

// One pool per server instance. In production DATABASE_URL is the Neon
// pooled connection string; locally it points at `npm run db`.
const globalForDb = globalThis as unknown as { pool?: Pool };

function makePool() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const local = url.includes("127.0.0.1") || url.includes("localhost");
  return new Pool({
    connectionString: url,
    max: local ? 1 : 5,
    ssl: local ? false : { rejectUnauthorized: true },
  });
}

export const pool = () => (globalForDb.pool ??= makePool());

export async function q<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const res = await pool().query<T>(text, params);
  return res.rows;
}

export async function one<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await q<T>(text, params);
  return rows[0] ?? null;
}

export async function tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool().connect();
  try {
    await client.query("begin");
    const out = await fn(client);
    await client.query("commit");
    return out;
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
}
