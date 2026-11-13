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
  email text,
  email_key text,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);

CREATE INDEX IF NOT EXISTS accounts_email_key_lookup ON accounts (email_key);

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

-- Pedidos de conta. Quem pede nao precisa ter conta: o pedido fica na
-- fila do dono do Reino (OWNER_EMAIL) e ele e que libera.
CREATE TABLE IF NOT EXISTS account_requests (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  name_key text NOT NULL,
  server text NOT NULL,
  pin_hash text NOT NULL,
  email text,
  email_key text,
  note text,
  owner_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz
);

CREATE INDEX IF NOT EXISTS account_requests_status_idx ON account_requests (status);
CREATE INDEX IF NOT EXISTS account_requests_owner_idx ON account_requests (owner_email);
`;

export const MIGRATIONS_SQL = `
-- Coluna do servidor do Reino. Em bancos criados antes dela existir, o
-- primeiro passo adiciona a coluna; o segundo preenche as contas antigas que
-- ficaram sem servidor; os dois ultimos fixam o padrao e a obrigatoriedade.
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS server text;
UPDATE accounts SET server = 'Reino Sem Nome' WHERE server IS NULL;
ALTER TABLE accounts ALTER COLUMN server SET DEFAULT 'Reino Sem Nome';
ALTER TABLE accounts ALTER COLUMN server SET NOT NULL;

-- E-mail das contas. Quem nao tem e-mail nao entra no painel de admin.
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS email_key text;

-- Administradores autorizados. O padrao e falso: ninguem vira admin sozinho.
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- O indice do e-mail vem depois das colunas: em um banco antigo a tabela
-- ja existe e o CREATE TABLE nao a recria, entao o indice so pode ser
-- criado depois do ALTER.
--
-- O e-mail NAO e unico: o mesmo e-mail autorizado pode valer para varias
-- contas, e e ele que libera o acesso ao painel. O indice antigo, unico,
-- sai de cena para nao impedir isso.
DROP INDEX IF EXISTS accounts_email_key_idx;
CREATE INDEX IF NOT EXISTS accounts_email_key_lookup ON accounts (email_key);
`;
