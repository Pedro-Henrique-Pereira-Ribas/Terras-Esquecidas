import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { generateToken, hashToken, sessionExpiry } from "./security";
import type { AccountPublic, AccountRow, AccountWithHashRow, SessionRow } from "./types";
import { emptySave, saveSchema, type SaveData } from "./validation";

function toPublicAccount(row: AccountRow): AccountPublic {
  return {
    id: row.id,
    name: row.name,
    server: row.server,
    createdAt: new Date(row.created_at).toISOString(),
    lastLoginAt: row.last_login_at ? new Date(row.last_login_at).toISOString() : null
  };
}

export async function ping(pool: Pool): Promise<void> {
  await pool.query("SELECT 1");
}

export async function findAccountByNameKey(
  pool: Pool,
  nameKey: string
): Promise<AccountWithHashRow | null> {
  const result = await pool.query<AccountWithHashRow>(
    `SELECT id, name, server, pin_hash, created_at, last_login_at
       FROM accounts
      WHERE name_key = $1
      LIMIT 1`,
    [nameKey]
  );
  return result.rows[0] || null;
}

export interface CreateAccountInput {
  name: string;
  nameKey: string;
  server: string;
  pinHash: string;
  save: SaveData;
  sessionDays: number;
}

export interface CreatedAccount {
  token: string;
  account: AccountPublic;
  save: SaveData;
}

export async function createAccountWithSession(
  pool: Pool,
  input: CreateAccountInput
): Promise<CreatedAccount> {
  const client = await pool.connect();
  const id = randomUUID();
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = sessionExpiry(input.sessionDays);
  try {
    await client.query("BEGIN");
    const accountResult = await client.query<AccountRow>(
      `INSERT INTO accounts (id, name, name_key, server, pin_hash, last_login_at)
       VALUES ($1, $2, $3, $4, $5, now())
       RETURNING id, name, server, created_at, last_login_at`,
      [id, input.name, input.nameKey, input.server, input.pinHash]
    );
    await client.query(
      `INSERT INTO player_saves (account_id, data)
       VALUES ($1, $2::jsonb)`,
      [id, JSON.stringify(input.save)]
    );
    await client.query(
      `INSERT INTO sessions (token_hash, account_id, expires_at)
       VALUES ($1, $2, $3)`,
      [tokenHash, id, expiresAt]
    );
    await client.query("COMMIT");
    return {
      token,
      account: toPublicAccount(accountResult.rows[0]),
      save: input.save
    };
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Ignora falha de rollback; o erro original é mais útil.
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function createSession(
  pool: Pool,
  accountId: string,
  sessionDays: number
): Promise<{ token: string; tokenHash: string }> {
  const token = generateToken();
  const tokenHash = hashToken(token);
  await pool.query(
    `INSERT INTO sessions (token_hash, account_id, expires_at)
     VALUES ($1, $2, $3)`,
    [tokenHash, accountId, sessionExpiry(sessionDays)]
  );
  return { token, tokenHash };
}

export async function findSession(
  pool: Pool,
  token: string
): Promise<{ account: AccountPublic; tokenHash: string } | null> {
  const tokenHash = hashToken(token);
  const result = await pool.query<SessionRow>(
    `SELECT a.id, a.name, a.server, a.created_at, a.last_login_at, s.token_hash
       FROM sessions s
       JOIN accounts a ON a.id = s.account_id
      WHERE s.token_hash = $1
        AND s.expires_at > $2
      LIMIT 1`,
    [tokenHash, new Date()]
  );
  const row = result.rows[0];
  if (!row) return null;
  return { account: toPublicAccount(row), tokenHash };
}

export async function revokeSession(pool: Pool, tokenHash: string): Promise<void> {
  await pool.query("DELETE FROM sessions WHERE token_hash = $1", [tokenHash]);
}

export async function touchLogin(pool: Pool, accountId: string): Promise<void> {
  await pool.query("UPDATE accounts SET last_login_at = now() WHERE id = $1", [accountId]);
}

/** Hash da chave de acesso de uma conta, para conferir a chave atual. */
export async function findAccountPinHash(pool: Pool, accountId: string): Promise<string | null> {
  const result = await pool.query<{ pin_hash: string }>(
    "SELECT pin_hash FROM accounts WHERE id = $1 LIMIT 1",
    [accountId]
  );
  const row = result.rows[0];
  return row ? row.pin_hash : null;
}

/**
 * Troca a chave de acesso da conta e encerra as outras sessoes: quem
 * tivesse roubado uma sessao perde o acesso depois da troca.
 * A sessao que fez a troca (keepTokenHash) continua valendo.
 */
export async function updatePin(
  pool: Pool,
  accountId: string,
  pinHash: string,
  keepTokenHash?: string
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("UPDATE accounts SET pin_hash = $1 WHERE id = $2", [pinHash, accountId]);
    if (keepTokenHash) {
      await client.query("DELETE FROM sessions WHERE account_id = $1 AND token_hash <> $2", [
        accountId,
        keepTokenHash
      ]);
    } else {
      await client.query("DELETE FROM sessions WHERE account_id = $1", [accountId]);
    }
    await client.query("COMMIT");
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Ignora falha de rollback; o erro original é mais útil.
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function getSave(
  pool: Pool,
  accountId: string
): Promise<{ save: SaveData; updatedAt: string | null }> {
  const result = await pool.query<{ data: unknown; updated_at: Date }>(
    `SELECT data, updated_at
       FROM player_saves
      WHERE account_id = $1
      LIMIT 1`,
    [accountId]
  );
  const row = result.rows[0];
  if (!row) return { save: emptySave(), updatedAt: null };
  const parsed = saveSchema.safeParse(row.data);
  return {
    save: parsed.success ? parsed.data : emptySave(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null
  };
}

export async function upsertSave(
  pool: Pool,
  accountId: string,
  save: SaveData
): Promise<{ save: SaveData; updatedAt: string }> {
  const result = await pool.query<{ data: SaveData; updated_at: Date }>(
    `INSERT INTO player_saves (account_id, data, updated_at)
     VALUES ($1, $2::jsonb, now())
     ON CONFLICT (account_id)
     DO UPDATE SET data = EXCLUDED.data, updated_at = now()
     RETURNING data, updated_at`,
    [accountId, JSON.stringify(save)]
  );
  const row = result.rows[0];
  return {
    save: saveSchema.parse(row.data),
    updatedAt: new Date(row.updated_at).toISOString()
  };
}
