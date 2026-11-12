import test from "node:test";
import assert from "node:assert/strict";
import { newDb } from "pg-mem";
import type { Pool } from "pg";
import { MIGRATIONS_SQL, SCHEMA_SQL } from "../src/schema";

const OLD_ACCOUNTS = `
  CREATE TABLE accounts (
    id uuid PRIMARY KEY,
    name text NOT NULL,
    name_key text NOT NULL UNIQUE,
    pin_hash text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    last_login_at timestamptz
  );
`;

function makePool(): Pool {
  const db = newDb();
  const adapter = db.adapters.createPg();
  return new adapter.Pool() as unknown as Pool;
}

/**
 * Bancos criados antes da coluna `server` existir precisam ser migrados sem
 * perder as contas. CREATE TABLE IF NOT EXISTS nao altera tabelas existentes,
 * entao a coluna nova vem de um ALTER TABLE.
 */
test("adiciona a coluna server em tabelas que ja existiam", async () => {
  const db = newDb();
  db.public.none(OLD_ACCOUNTS);
  db.public.none(`
    CREATE TABLE sessions (
      token_hash text PRIMARY KEY,
      account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      created_at timestamptz NOT NULL DEFAULT now(),
      expires_at timestamptz NOT NULL
    );
  `);
  db.public.none(`
    CREATE TABLE player_saves (
      account_id uuid PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
      data jsonb NOT NULL DEFAULT '{}'::jsonb,
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  const adapter = db.adapters.createPg();
  const pool = new adapter.Pool() as unknown as Pool;

  // A conta antiga continua existindo depois da migracao.
  await pool.query(
    `INSERT INTO accounts (id, name, name_key, pin_hash)
     VALUES ('11111111-1111-1111-1111-111111111111', 'Antigo', 'antigo', 'hash')`
  );

  await pool.query(MIGRATIONS_SQL);

  // Se a coluna nao existisse, o SELECT abaixo falharia.
  const saved = await pool.query("SELECT name, server FROM accounts WHERE name_key = 'antigo'");
  assert.equal(saved.rows[0].name, "Antigo");
  assert.equal(
    saved.rows[0].server,
    "Reino Sem Nome",
    "contas antigas recebem o servidor padrao"
  );

  await pool.end();
});

test("a migracao da coluna server pode rodar varias vezes", async () => {
  const db = newDb();
  db.public.none(OLD_ACCOUNTS);
  const adapter = db.adapters.createPg();
  const pool = new adapter.Pool() as unknown as Pool;

  await pool.query(MIGRATIONS_SQL);
  await pool.query(MIGRATIONS_SQL);
  await pool.query(MIGRATIONS_SQL);

  const rows = await pool.query("SELECT server FROM accounts");
  assert.equal(rows.rows.length, 0);

  await pool.end();
});

test("o schema cria as tres tabelas do jogo", async () => {
  const pool = makePool();
  await pool.query(SCHEMA_SQL);
  await pool.query(MIGRATIONS_SQL);

  const accounts = await pool.query("SELECT server FROM accounts");
  const sessions = await pool.query("SELECT token_hash FROM sessions");
  const saves = await pool.query("SELECT account_id FROM player_saves");

  assert.equal(accounts.rows.length, 0);
  assert.equal(sessions.rows.length, 0);
  assert.equal(saves.rows.length, 0);

  await pool.end();
});
