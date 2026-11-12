import { Pool } from "pg";
import { getConfig } from "./config";
import { MIGRATIONS_SQL, SCHEMA_SQL } from "./schema";

let sharedPool: Pool | null = null;

export function createPool(): Pool {
  const config = getConfig();
  const pool = new Pool({
    connectionString: config.databaseUrl || undefined,
    ssl: config.databaseSsl ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000
  });
  pool.on("error", (error) => {
    console.error("[db] erro inesperado no pool do Postgres:", error);
  });
  return pool;
}

export function getPool(): Pool {
  if (!sharedPool) sharedPool = createPool();
  return sharedPool;
}

/** Verdadeiro quando existe uma connection string configurada. */
export function hasDatabase(): boolean {
  return Boolean(getConfig().databaseUrl);
}

/** Aplica o schema e as migracoes. Devolve false quando nao ha banco configurado. */
export async function ensureSchema(pool: Pool = getPool()): Promise<boolean> {
  if (!hasDatabase()) {
    console.warn("[api] schema nao aplicado: DATABASE_URL nao configurada.");
    return false;
  }
  await pool.query(SCHEMA_SQL);
  await pool.query(MIGRATIONS_SQL);
  return true;
}

export async function checkDatabase(pool: Pool = getPool()): Promise<void> {
  await pool.query("SELECT 1");
}

export async function closePool(): Promise<void> {
  if (!sharedPool) return;
  const pool = sharedPool;
  sharedPool = null;
  await pool.end();
}
