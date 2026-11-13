import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { generateToken, hashToken, sessionExpiry } from "./security";
import type {
  AccountPublic,
  AccountRequestRow,
  AccountRow,
  AccountWithHashRow,
  AdminAccountRow,
  SessionRow
} from "./types";
import { emptySave, saveSchema, type SaveData } from "./validation";

function toPublicAccount(row: AccountRow): AccountPublic {
  return {
    id: row.id,
    name: row.name,
    server: row.server,
    createdAt: new Date(row.created_at).toISOString(),
    lastLoginAt: row.last_login_at ? new Date(row.last_login_at).toISOString() : null,
    isAdmin: Boolean(row.is_admin)
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
    `SELECT id, name, name_key, server, pin_hash, created_at, last_login_at, is_admin,
            email, email_key
       FROM accounts
      WHERE name_key = $1
      LIMIT 1`,
    [nameKey]
  );
  return result.rows[0] || null;
}

/**
 * Contas com o mesmo e-mail. O e-mail nao e unico: ele e o que libera o
 * acesso ao painel, e varias contas podem compartilhar o mesmo.
 */
export async function findAccountsByEmailKey(
  pool: Pool,
  emailKey: string
): Promise<AccountWithHashRow[]> {
  const result = await pool.query<AccountWithHashRow>(
    `SELECT id, name, name_key, server, pin_hash, created_at, last_login_at, is_admin,
            email, email_key
       FROM accounts
      WHERE email_key = $1
      ORDER BY created_at
      LIMIT 10`,
    [emailKey]
  );
  return result.rows;
}

/** Conta pelo id, com o e-mail e o que define o dono do Reino. */
export async function findAccountById(
  pool: Pool,
  id: string
): Promise<{ id: string; name: string; email: string | null; email_key: string | null; is_admin: boolean } | null> {
  const result = await pool.query<{
    id: string;
    name: string;
    email: string | null;
    email_key: string | null;
    is_admin: boolean;
  }>(
    `SELECT id, name, email, email_key, is_admin
       FROM accounts
      WHERE id = $1
      LIMIT 1`,
    [id]
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
  email?: string | null;
  emailKey?: string | null;
  isAdmin?: boolean;
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
      `INSERT INTO accounts (id, name, name_key, server, pin_hash, email, email_key, is_admin, last_login_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
       RETURNING id, name, server, created_at, last_login_at, is_admin`,
      [
        id,
        input.name,
        input.nameKey,
        input.server,
        input.pinHash,
        input.email ?? null,
        input.emailKey ?? null,
        Boolean(input.isAdmin)
      ]
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

/**
 * Cria a conta sem abrir sessao: usado pelo painel de admin, que cadastra
 * outra pessoa e nao entra no lugar dela.
 */
export async function createAccountOnly(
  pool: Pool,
  input: CreateAccountInput
): Promise<AccountPublic> {
  const client = await pool.connect();
  const id = randomUUID();
  try {
    await client.query("BEGIN");
    const accountResult = await client.query<AccountRow>(
      `INSERT INTO accounts (id, name, name_key, server, pin_hash, email, email_key, is_admin, last_login_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
       RETURNING id, name, server, created_at, last_login_at, is_admin`,
      [
        id,
        input.name,
        input.nameKey,
        input.server,
        input.pinHash,
        input.email ?? null,
        input.emailKey ?? null,
        Boolean(input.isAdmin)
      ]
    );
    await client.query(
      `INSERT INTO player_saves (account_id, data)
       VALUES ($1, $2::jsonb)`,
      [id, JSON.stringify(input.save)]
    );
    await client.query("COMMIT");
    return toPublicAccount(accountResult.rows[0]);
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

/** Lista de contas para o painel de admin. */
export async function listAccounts(pool: Pool): Promise<AdminAccountRow[]> {
  const result = await pool.query<AdminAccountRow>(
    `SELECT a.id, a.name, a.server, a.created_at, a.last_login_at, a.is_admin, a.email,
            (ps.account_id IS NOT NULL) AS has_save
       FROM accounts a
       LEFT JOIN player_saves ps ON ps.account_id = a.id
      ORDER BY a.created_at DESC`
  );
  return result.rows;
}

/** Contas que tem sessao valida agora, indexadas por conta. */
export async function activeSessionsByAccount(pool: Pool): Promise<Map<string, number>> {
  const result = await pool.query<{ account_id: string; total: number }>(
    `SELECT account_id, count(*) AS total
       FROM sessions
      WHERE expires_at > now()
      GROUP BY account_id`
  );
  const map = new Map<string, number>();
  for (const row of result.rows) map.set(row.account_id, Number(row.total));
  return map;
}

/** Troca a chave de acesso de uma conta, sem mexer nas sessoes. */
export async function setAccountPin(
  pool: Pool,
  nameKey: string,
  pinHash: string
): Promise<boolean> {
  const result = await pool.query(
    "UPDATE accounts SET pin_hash = $1 WHERE name_key = $2",
    [pinHash, nameKey]
  );
  return (result.rowCount || 0) > 0;
}

/** Atualiza e-mail e permissao de admin de uma conta. */
export async function updateAccountAccess(
  pool: Pool,
  nameKey: string,
  email: string | null,
  emailKey: string | null,
  isAdmin: boolean
): Promise<boolean> {
  const result = await pool.query(
    "UPDATE accounts SET email = $1, email_key = $2, is_admin = $3 WHERE name_key = $4",
    [email, emailKey, isAdmin, nameKey]
  );
  return (result.rowCount || 0) > 0;
}

/** Apaga uma conta (com save e sessoes em cascata). */
export async function deleteAccount(pool: Pool, nameKey: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM accounts WHERE name_key = $1", [nameKey]);
  return (result.rowCount || 0) > 0;
}

/* ============================================================
   PEDIDOS DE CONTA
   ============================================================ */

export interface CreateRequestInput {
  name: string;
  nameKey: string;
  server: string;
  pinHash: string;
  email: string | null;
  emailKey: string | null;
  note: string | null;
  ownerEmail: string;
}

/** Pedido na fila de um dono. */
export async function createAccountRequest(
  pool: Pool,
  input: CreateRequestInput
): Promise<AccountRequestRow> {
  const result = await pool.query<AccountRequestRow>(
    `INSERT INTO account_requests
       (id, name, name_key, server, pin_hash, email, email_key, note, owner_email, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
     RETURNING id, name, server, email, note, owner_email, status, created_at, decided_at`,
    [
      randomUUID(),
      input.name,
      input.nameKey,
      input.server,
      input.pinHash,
      input.email,
      input.emailKey,
      input.note,
      input.ownerEmail
    ]
  );
  return result.rows[0];
}

/** Pedidos de um dono, os pendentes primeiro. */
export async function listAccountRequests(
  pool: Pool,
  ownerEmail: string,
  status?: string
): Promise<AccountRequestRow[]> {
  const result = await pool.query<AccountRequestRow>(
    `SELECT id, name, server, email, note, owner_email, status, created_at, decided_at
       FROM account_requests
      WHERE owner_email = $1
        AND ($2::text IS NULL OR status = $2)
      ORDER BY (status = 'pending') DESC, created_at DESC`,
    [ownerEmail, status ?? null]
  );
  return result.rows;
}

/** Marca um pedido como decidido e devolve a linha. */
export async function decideAccountRequest(
  pool: Pool,
  id: string,
  status: "approved" | "rejected"
): Promise<AccountRequestRow | null> {
  const result = await pool.query<AccountRequestRow>(
    `UPDATE account_requests
        SET status = $2, decided_at = now()
      WHERE id = $1 AND status = 'pending'
      RETURNING id, name, server, email, note, owner_email, status, created_at, decided_at`,
    [id, status]
  );
  return result.rows[0] || null;
}

/** Pega o pedido com o hash da chave, para transformar em conta. */
export async function findAccountRequest(
  pool: Pool,
  id: string
): Promise<(AccountRequestRow & { pin_hash: string; email_key: string | null }) | null> {
  const result = await pool.query(
    `SELECT id, name, name_key, server, pin_hash, email, email_key, note, owner_email,
            status, created_at, decided_at
       FROM account_requests
      WHERE id = $1
      LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
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
    `SELECT a.id, a.name, a.server, a.created_at, a.last_login_at, a.is_admin, s.token_hash
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
