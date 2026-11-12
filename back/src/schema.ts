/**
 * Schema do Terra Perdida.
 *
 * SCHEMA_SQL cria as tabelas e MIGRATIONS_SQL ajusta as que ja existem.
 * CREATE TABLE IF NOT EXISTS nao altera tabelas ja criadas, entao toda
 * coluna nova vem no bloco de migracoes: assim o schema evolui sem perder
 * as contas ja gravadas.
 */
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  name_key text NOT NULL UNIQUE,
  server text NOT NULL,
  pin_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash text PRIMARY KEY,
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_account_id_idx ON sessions (account_id);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions (expires_at);

CREATE TABLE IF NOT EXISTS player_saves (
  account_id uuid PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
`;

export const MIGRATIONS_SQL = `
-- Coluna do servidor do Reino. Em bancos criados antes dela existir, o
-- primeiro passo adiciona a coluna; o segundo preenche as contas antigas que
-- ficaram sem servidor; os dois ultimos fixam o padrao e a obrigatoriedade.
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS server text;
UPDATE accounts SET server = 'Reino Sem Nome' WHERE server IS NULL;
ALTER TABLE accounts ALTER COLUMN server SET DEFAULT 'Reino Sem Nome';
ALTER TABLE accounts ALTER COLUMN server SET NOT NULL;
`;
