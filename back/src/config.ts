import "dotenv/config";

export type LogLevel = "silent" | "info" | "debug";

export interface AppConfig {
  port: number;
  host: string;
  databaseUrl: string;
  databaseSsl: boolean;
  corsOrigins: string[];
  sessionDays: number;
  bcryptRounds: number;
  autoMigrate: boolean;
  /** Serve o frontend estatico a partir da mesma porta da API. */
  serveFront: boolean;
  /** Caminho absoluto ou relativo da pasta do frontend. Vazio = deteccao automatica. */
  frontDir: string | null;
  /** Quantidade de proxies confiaveis (Render usa 1). */
  trustProxy: number;
  /** Nivel de log das requisicoes HTTP. */
  logLevel: LogLevel;
}

function intEnv(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(parsed)));
}

function boolEnv(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value === "") return fallback;
  return /^(1|true|yes|on)$/i.test(value);
}

function logLevelEnv(value: string | undefined, fallback: LogLevel): LogLevel {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "silent" || normalized === "info" || normalized === "debug") {
    return normalized;
  }
  return fallback;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const databaseUrl = String(env.DATABASE_URL || "").trim();
  if (!databaseUrl) {
    // A API sobe mesmo sem banco: o site e o /health continuam respondendo
    // e o /api/health avisa que o banco esta indisponivel. Sem isso, o
    // processo morre no boot e o servico inteiro fica fora do ar.
    console.warn(
      "[api] DATABASE_URL nao configurada: as rotas de conta e save vao falhar " +
        "enquanto o Postgres nao for configurado."
    );
  }

  const corsOrigins = String(env.CORS_ORIGIN || "*")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const frontDir = String(env.FRONT_DIR || "").trim() || null;

  return {
    port: intEnv(env.PORT, 3001, 1, 65535),
    host: String(env.HOST || "0.0.0.0").trim() || "0.0.0.0",
    databaseUrl,
    databaseSsl: boolEnv(env.DATABASE_SSL, false),
    corsOrigins: corsOrigins.length ? corsOrigins : ["*"],
    sessionDays: intEnv(env.SESSION_DAYS, 30, 1, 365),
    bcryptRounds: intEnv(env.BCRYPT_ROUNDS, 12, 4, 15),
    autoMigrate: boolEnv(env.AUTO_MIGRATE, true),
    serveFront: boolEnv(env.SERVE_FRONT, true),
    frontDir,
    trustProxy: intEnv(env.TRUST_PROXY, 1, 0, 10),
    logLevel: logLevelEnv(env.LOG_LEVEL, "info")
  };
}

let cached: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (!cached) cached = loadConfig();
  return cached;
}
