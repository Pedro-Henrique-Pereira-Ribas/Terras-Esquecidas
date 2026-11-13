export interface AccountPublic {
  id: string;
  name: string;
  server: string;
  createdAt: string;
  lastLoginAt: string | null;
  /** Verdadeiro quando a conta pode usar o painel de administracao. */
  isAdmin: boolean;
}

export interface AccountRow {
  id: string;
  name: string;
  server: string;
  created_at: Date;
  last_login_at: Date | null;
  is_admin: boolean;
}

export interface AccountWithHashRow extends AccountRow {
  name_key: string;
  pin_hash: string;
  email: string | null;
  email_key: string | null;
}

export interface SessionRow extends AccountRow {
  token_hash: string;
}

/** Conta com os dados de administracao, usada no painel. */
export interface AdminAccountRow extends AccountRow {
  email: string | null;
  has_save: boolean;
  has_session: boolean;
}
