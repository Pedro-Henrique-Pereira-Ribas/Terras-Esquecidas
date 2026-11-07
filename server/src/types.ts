export interface AccountPublic {
  id: string;
  name: string;
  server: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AccountRow {
  id: string;
  name: string;
  server: string;
  created_at: Date;
  last_login_at: Date | null;
}

export interface AccountWithHashRow extends AccountRow {
  pin_hash: string;
}

export interface SessionRow extends AccountRow {
  token_hash: string;
}
