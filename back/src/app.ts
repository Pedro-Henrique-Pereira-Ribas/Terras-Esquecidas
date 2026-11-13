import express, {
  type ErrorRequestHandler,
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response
} from "express";
import cors, { type CorsOptions } from "cors";
import { z, ZodError, type ZodTypeAny } from "zod";
import type { Pool } from "pg";
import type { AppConfig } from "./config";
import { ping } from "./repository";
import {
  activeSessionsByAccount,
  createAccountWithSession,
  createAccountOnly,
  createSession,
  deleteAccount,
  findAccountByEmailKey,
  findAccountByNameKey,
  findAccountPinHash,
  findSession,
  getSave,
  listAccounts,
  revokeSession,
  setAccountPin,
  touchLogin,
  updateAccountAccess,
  updatePin,
  upsertSave
} from "./repository";
import { DUMMY_PIN_HASH, hashPin, normalizeEmail, normalizeName, verifyPin } from "./security";
import { createStaticRouter, isApiPath, resolveFrontDir } from "./static";
import type { AccountPublic } from "./types";
import type { LogLevel } from "./config";
import {
  adminCreateAccountSchema,
  adminLoginSchema,
  adminUpdateAccountSchema,
  changePinSchema,
  createAccountSchema,
  emptySave,
  firstIssue,
  loginSchema,
  updateSaveSchema
} from "./validation";

export const SERVICE_NAME = "terras-esquecidas-back";
export const SERVICE_VERSION = "1.0.0";

interface AuthContext {
  account: AccountPublic;
  tokenHash: string;
}

type AuthedRequest = Request & { auth?: AuthContext };

interface CreateAppOptions {
  pool: Pool;
  config: AppConfig;
  /**
   * Pasta do frontend a servir. Quando omitida, a API procura a pasta
   * `front/` automaticamente. Use `null` para rodar apenas a API.
   */
  frontDir?: string | null;
}

const MAX_LOGIN_FAILURES = 8;
const LOGIN_FAILURE_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_BLOCK_MS = 15 * 60 * 1000;

function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown> | unknown
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function sendError(
  res: Response,
  status: number,
  message: string,
  code = "request_error"
): Response {
  return res.status(status).json({ error: { code, message } });
}

function parseBody<S extends ZodTypeAny>(schema: S, req: Request, res: Response): z.output<S> | null {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    sendError(res, 400, firstIssue(result.error), "invalid_payload");
    return null;
  }
  return result.data;
}

function bearerToken(req: Request): string | null {
  const header = req.header("authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : null;
}

function rateLimit(max: number, windowMs: number): RequestHandler {
  const buckets = new Map<string, { count: number; resetAt: number }>();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const current = buckets.get(key);
    if (!current || current.resetAt <= now) {
      if (buckets.size > 5000) {
        for (const [bucketKey, bucket] of buckets) {
          if (bucket.resetAt <= now) buckets.delete(bucketKey);
        }
      }
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }
    if (current.count >= max) {
      res.setHeader("Retry-After", String(Math.ceil((current.resetAt - now) / 1000)));
      sendError(res, 429, "Muitas tentativas. Aguarde um pouco e tente de novo.", "rate_limited");
      return;
    }
    current.count += 1;
    next();
  };
}

interface LoginFailure {
  count: number;
  firstAt: number;
  blockedUntil: number;
}

function loginFailureKey(req: Request, nameKey: string): string {
  return `${req.ip || req.socket.remoteAddress || "unknown"}|${nameKey}`;
}

/** Log de uma linha por requisicao, com status e duracao. */
function requestLogger(level: LogLevel): RequestHandler {
  if (level === "silent") {
    return (_req, _res, next) => next();
  }
  return (req, res, next) => {
    const startedAt = process.hrtime.bigint();
    res.on("finish", () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      console.log(
        `[api] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(1)}ms`
      );
    });
    next();
  };
}

export function createApp(options: CreateAppOptions) {
  const { pool, config } = options;
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", config.trustProxy);

  const frontDir =
    options.frontDir === undefined
      ? config.serveFront
        ? resolveFrontDir(config.frontDir)
        : null
      : options.frontDir;

  const corsOptions: CorsOptions = {
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (config.corsOrigins.includes("*") || config.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400
  };

  app.use(cors(corsOptions));
  app.use(express.json({ limit: "256kb" }));
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  app.use(requestLogger(config.logLevel));

  const authIpLimit = rateLimit(20, 60_000);
  const saveLimit = rateLimit(180, 60_000);
  const pinLimit = rateLimit(10, 15 * 60_000);
  const adminLimit = rateLimit(60, 60_000);
  const loginFailures = new Map<string, LoginFailure>();

  const requireAuth = asyncHandler(async (req, res, next) => {
    const token = bearerToken(req);
    if (!token) {
      sendError(res, 401, "Sessão ausente. Entre novamente.", "unauthorized");
      return;
    }
    const session = await findSession(pool, token);
    if (!session) {
      sendError(res, 401, "Sessão expirada. Entre novamente.", "unauthorized");
      return;
    }
    (req as AuthedRequest).auth = session;
    next();
  });

  // Liveness: nao toca no banco, para o Render nao derrubar o servico
  // quando o Postgres estiver apenas hibernando.
  const liveness = (_req: Request, res: Response) => {
    res.json({
      ok: true,
      service: SERVICE_NAME,
      version: SERVICE_VERSION,
      uptime: Math.round(process.uptime()),
      time: new Date().toISOString()
    });
  };

  // Readiness: testa o banco de verdade.
  const readiness = asyncHandler(async (_req, res) => {
    if (!config.databaseUrl) {
      sendError(
        res,
        503,
        "Banco de dados não configurado: defina DATABASE_URL no ambiente do serviço.",
        "database_unavailable"
      );
      return;
    }
    try {
      await ping(pool);
      res.json({
        ok: true,
        service: SERVICE_NAME,
        version: SERVICE_VERSION,
        database: "ok",
        uptime: Math.round(process.uptime()),
        time: new Date().toISOString()
      });
    } catch {
      sendError(res, 503, "Banco de dados indisponível.", "database_unavailable");
    }
  });

  app.get("/health", liveness);
  app.get("/api/health", readiness);
  app.get("/api", (_req, res) => {
    res.json({
      service: SERVICE_NAME,
      version: SERVICE_VERSION,
      status: "ok",
      docs: "/api/health"
    });
  });

  if (!frontDir) {
    // Sem frontend: a raiz continua devolvendo as informacoes do servico.
    app.get("/", (_req, res) => {
      res.json({ service: SERVICE_NAME, version: SERVICE_VERSION, status: "ok", docs: "/api/health" });
    });
  }

  app.post(
    "/api/accounts",
    authIpLimit,
    asyncHandler(async (req, res) => {
      const body = parseBody(createAccountSchema, req, res);
      if (!body) return;

      const nameKey = normalizeName(body.name);
      const existing = await findAccountByNameKey(pool, nameKey);
      if (existing) {
        sendError(res, 409, "Já existe uma conta com esse nome. Use a aba ENTRAR.", "account_exists");
        return;
      }

      const pinHash = await hashPin(body.pin, config.bcryptRounds);
      const created = await createAccountWithSession(pool, {
        name: body.name,
        nameKey,
        server: body.server,
        pinHash,
        save: body.save || emptySave(),
        sessionDays: config.sessionDays
      });

      res.status(201).json({
        token: created.token,
        account: created.account,
        save: created.save
      });
    })
  );

  app.post(
    "/api/accounts/login",
    authIpLimit,
    asyncHandler(async (req, res) => {
      const body = parseBody(loginSchema, req, res);
      if (!body) return;

      const nameKey = normalizeName(body.name);
      const failureKey = loginFailureKey(req, nameKey);
      const now = Date.now();
      const failure = loginFailures.get(failureKey);
      if (failure && failure.blockedUntil > now) {
        const minutes = Math.ceil((failure.blockedUntil - now) / 60000);
        sendError(
          res,
          429,
          `Muitas tentativas para este nome. Tente novamente em ${minutes} minuto(s).`,
          "login_blocked"
        );
        return;
      }

      const account = await findAccountByNameKey(pool, nameKey);
      if (!account) {
        await verifyPin(body.pin, DUMMY_PIN_HASH);
        recordLoginFailure(loginFailures, failureKey, now);
        sendError(res, 401, "Nome ou chave de acesso incorretos.", "invalid_credentials");
        return;
      }

      const valid = await verifyPin(body.pin, account.pin_hash);
      if (!valid) {
        recordLoginFailure(loginFailures, failureKey, now);
        sendError(res, 401, "Nome ou chave de acesso incorretos.", "invalid_credentials");
        return;
      }

      loginFailures.delete(failureKey);
      await touchLogin(pool, account.id);
      const session = await createSession(pool, account.id, config.sessionDays);
      const stored = await getSave(pool, account.id);
      res.json({
        token: session.token,
        account: {
          id: account.id,
          name: account.name,
          server: account.server,
          createdAt: new Date(account.created_at).toISOString(),
          lastLoginAt: new Date().toISOString()
        },
        save: stored.save,
        saveUpdatedAt: stored.updatedAt
      });
    })
  );

  app.post(
    "/api/accounts/logout",
    requireAuth,
    asyncHandler(async (req, res) => {
      const auth = (req as AuthedRequest).auth!;
      await revokeSession(pool, auth.tokenHash);
      res.status(204).end();
    })
  );

  app.get(
    "/api/me",
    requireAuth,
    asyncHandler(async (req, res) => {
      const auth = (req as AuthedRequest).auth!;
      const stored = await getSave(pool, auth.account.id);
      res.json({ account: auth.account, save: stored.save, saveUpdatedAt: stored.updatedAt });
    })
  );

  app.get(
    "/api/me/save",
    requireAuth,
    asyncHandler(async (req, res) => {
      const auth = (req as AuthedRequest).auth!;
      const stored = await getSave(pool, auth.account.id);
      res.json({ save: stored.save, updatedAt: stored.updatedAt });
    })
  );

  app.put(
    "/api/me/save",
    requireAuth,
    saveLimit,
    asyncHandler(async (req, res) => {
      const body = parseBody(updateSaveSchema, req, res);
      if (!body) return;
      const auth = (req as AuthedRequest).auth!;
      const stored = await upsertSave(pool, auth.account.id, body.save);
      res.json({ save: stored.save, updatedAt: stored.updatedAt });
    })
  );

  // Troca da chave de acesso da conta. Exige a chave atual, para que uma
  // sessao roubada nao consiga mudar a senha sozinha.
  app.put(
    "/api/accounts/password",
    requireAuth,
    pinLimit,
    asyncHandler(async (req, res) => {
      const body = parseBody(changePinSchema, req, res);
      if (!body) return;
      const auth = (req as AuthedRequest).auth!;

      const currentHash = await findAccountPinHash(pool, auth.account.id);
      if (!currentHash) {
        sendError(res, 404, "Conta não encontrada.", "account_not_found");
        return;
      }

      const valid = await verifyPin(body.currentPin, currentHash);
      if (!valid) {
        sendError(res, 401, "Chave de acesso atual incorreta.", "invalid_credentials");
        return;
      }

      if (body.currentPin === body.newPin) {
        sendError(res, 400, "A nova chave precisa ser diferente da atual.", "same_pin");
        return;
      }

      const pinHash = await hashPin(body.newPin, config.bcryptRounds);
      await updatePin(pool, auth.account.id, pinHash, auth.tokenHash);
      res.json({ ok: true, message: "Chave de acesso alterada." });
    })
  );

  /* ============================================================
     PAINEL DE ADMINISTRACAO
     Só entra quem tem e-mail cadastrado e autorizado (is_admin).
     ============================================================ */
  const requireAdmin = asyncHandler(async (req, res, next) => {
    const auth = (req as AuthedRequest).auth;
    if (!auth || !auth.account.isAdmin) {
      sendError(res, 403, "Acesso restrito ao painel de administração.", "forbidden");
      return;
    }
    next();
  });

  // Entrada do painel: e-mail + chave da conta.
  app.post(
    "/api/admin/login",
    authIpLimit,
    asyncHandler(async (req, res) => {
      const body = parseBody(adminLoginSchema, req, res);
      if (!body) return;

      const emailKey = normalizeEmail(body.email);
      const account = await findAccountByEmailKey(pool, emailKey);
      if (!account) {
        // Mesma mensagem e mesmo custo de verificacao dos e-mails inexistentes.
        await verifyPin(body.pin, DUMMY_PIN_HASH);
        sendError(res, 401, "E-mail ou chave de acesso incorretos.", "invalid_credentials");
        return;
      }

      const valid = await verifyPin(body.pin, account.pin_hash);
      if (!valid) {
        sendError(res, 401, "E-mail ou chave de acesso incorretos.", "invalid_credentials");
        return;
      }

      if (!account.is_admin) {
        sendError(res, 403, "Este e-mail não está autorizado no painel.", "forbidden");
        return;
      }

      await touchLogin(pool, account.id);
      const session = await createSession(pool, account.id, config.sessionDays);
      res.json({
        token: session.token,
        account: {
          id: account.id,
          name: account.name,
          server: account.server,
          email: account.email,
          isAdmin: true,
          createdAt: new Date(account.created_at).toISOString(),
          lastLoginAt: new Date().toISOString()
        }
      });
    })
  );

  // Lista de contas.
  app.get(
    "/api/admin/accounts",
    requireAuth,
    requireAdmin,
    asyncHandler(async (_req, res) => {
      const accounts = await listAccounts(pool);
      const sessions = await activeSessionsByAccount(pool);
      res.json({
        accounts: accounts.map((row) => ({
          ...adminAccountView(row),
          hasSave: Boolean(row.has_save),
          hasSession: (sessions.get(row.id) || 0) > 0
        }))
      });
    })
  );

  // Cadastra uma conta para outra pessoa.
  app.post(
    "/api/admin/accounts",
    requireAuth,
    requireAdmin,
    adminLimit,
    asyncHandler(async (req, res) => {
      const body = parseBody(adminCreateAccountSchema, req, res);
      if (!body) return;

      const nameKey = normalizeName(body.name);
      const existing = await findAccountByNameKey(pool, nameKey);
      if (existing) {
        sendError(res, 409, "Já existe uma conta com esse nome.", "account_exists");
        return;
      }

      const emailKey = body.email ? normalizeEmail(body.email) : null;
      if (emailKey) {
        const emailOwner = await findAccountByEmailKey(pool, emailKey);
        if (emailOwner) {
          sendError(res, 409, "Esse e-mail já está cadastrado.", "email_exists");
          return;
        }
      }

      const pinHash = await hashPin(body.pin, config.bcryptRounds);
      const account = await createAccountOnly(pool, {
        name: body.name,
        nameKey,
        server: body.server,
        pinHash,
        save: emptySave(),
        sessionDays: config.sessionDays,
        email: body.email ?? null,
        emailKey,
        isAdmin: Boolean(body.isAdmin)
      });

      res.status(201).json({ account: adminAccountView({ ...account, email: body.email ?? null }) });
    })
  );

  // Atualiza chave, e-mail ou permissao de admin. O :nameKey e o nome
  // normalizado (minusculas e sem espacos duplicados).
  app.put(
    "/api/admin/accounts/:nameKey",
    requireAuth,
    requireAdmin,
    adminLimit,
    asyncHandler(async (req, res) => {
      const body = parseBody(adminUpdateAccountSchema, req, res);
      if (!body) return;

      const nameKey = normalizeName(String(req.params.nameKey || ""));
      const account = await findAccountByNameKey(pool, nameKey);
      if (!account) {
        sendError(res, 404, "Conta não encontrada.", "account_not_found");
        return;
      }

      if (body.pin) {
        await setAccountPin(pool, nameKey, await hashPin(body.pin, config.bcryptRounds));
      }

      // Junta tudo em uma atualizacao so: usar os valores antigos aqui
      // apagaria o e-mail que acabou de ser trocado.
      const newEmail = body.email !== undefined ? body.email ?? null : account.email;
      let newEmailKey = body.email !== undefined
        ? body.email
          ? normalizeEmail(body.email)
          : null
        : account.email_key;
      if (newEmailKey) {
        const owner = await findAccountByEmailKey(pool, newEmailKey);
        if (owner && owner.name_key !== nameKey) {
          sendError(res, 409, "Esse e-mail já está cadastrado.", "email_exists");
          return;
        }
      }
      const newIsAdmin =
        body.isAdmin !== undefined ? Boolean(body.isAdmin) : Boolean(account.is_admin);

      await updateAccountAccess(pool, nameKey, newEmail, newEmailKey, newIsAdmin);

      const updated = await findAccountByNameKey(pool, nameKey);
      res.json({ account: updated ? adminAccountView(updated) : null });
    })
  );

  // Apaga a conta (save e sessoes vao em cascata).
  app.delete(
    "/api/admin/accounts/:nameKey",
    requireAuth,
    requireAdmin,
    adminLimit,
    asyncHandler(async (req, res) => {
      const auth = (req as AuthedRequest).auth!;
      const nameKey = normalizeName(String(req.params.nameKey || ""));
      if (nameKey === normalizeName(auth.account.name)) {
        sendError(res, 400, "Você não pode apagar a própria conta de admin.", "self_delete");
        return;
      }
      const removed = await deleteAccount(pool, nameKey);
      if (!removed) {
        sendError(res, 404, "Conta não encontrada.", "account_not_found");
        return;
      }
      res.status(204).end();
    })
  );

  // O frontend estatico so e servido depois de todas as rotas da API, para que
  // /api/* nunca caia no index.html do jogo.
  if (frontDir) {
    app.use(createStaticRouter({ frontDir }));
  }

  app.use((req, res) => {
    if (frontDir && !isApiPath(req.path)) {
      //Deve ser inalcancavel: o router estatico ja devolveu o index.html.
      res.status(404).type("html").send("<h1>404</h1>");
      return;
    }
    sendError(res, 404, "Rota não encontrada.", "not_found");
  });

  const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    if (res.headersSent) return;
    if (error instanceof ZodError) {
      sendError(res, 400, firstIssue(error), "invalid_payload");
      return;
    }
    if (error && typeof error === "object" && (error as { type?: string }).type === "entity.parse.failed") {
      sendError(res, 400, "JSON inválido no corpo da requisição.", "invalid_json");
      return;
    }
    if (error && typeof error === "object" && (error as { code?: string }).code === "23505") {
      sendError(res, 409, "Já existe uma conta com esse nome. Use a aba ENTRAR.", "account_exists");
      return;
    }
    console.error("[api] erro não tratado:", error);
    sendError(res, 500, "Erro interno do servidor.", "internal_error");
  };
  app.use(errorHandler);

  return app;
}

function recordLoginFailure(
  failures: Map<string, LoginFailure>,
  key: string,
  now: number
): void {
  const current = failures.get(key);
  if (!current || now - current.firstAt > LOGIN_FAILURE_WINDOW_MS) {
    failures.set(key, { count: 1, firstAt: now, blockedUntil: 0 });
    return;
  }
  current.count += 1;
  if (current.count >= MAX_LOGIN_FAILURES) {
    current.blockedUntil = now + LOGIN_BLOCK_MS;
    current.count = 0;
    current.firstAt = now;
  }
}

/** Visao de conta usada no painel: inclui o e-mail e a permissao. */
function adminAccountView(row: {
  id: string;
  name: string;
  email?: string | null;
  server: string;
  is_admin?: boolean;
  createdAt?: string;
  created_at?: Date | string;
  lastLoginAt?: string | null;
  last_login_at?: Date | string | null;
}) {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? null,
    server: row.server,
    isAdmin: Boolean(row.is_admin),
    createdAt: isoDate(row.createdAt ?? row.created_at),
    lastLoginAt: isoDate(row.lastLoginAt ?? row.last_login_at)
  };
}

/** Data em ISO, aceitando Date, string ou vazio. */
function isoDate(value: Date | string | null | undefined): string | null {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
