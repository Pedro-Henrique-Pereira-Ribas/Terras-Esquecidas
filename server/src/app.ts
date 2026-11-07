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
  createAccountWithSession,
  createSession,
  findAccountByNameKey,
  findSession,
  getSave,
  revokeSession,
  touchLogin,
  upsertSave
} from "./repository";
import { DUMMY_PIN_HASH, hashPin, normalizeName, verifyPin } from "./security";
import type { AccountPublic } from "./types";
import {
  createAccountSchema,
  emptySave,
  firstIssue,
  loginSchema,
  updateSaveSchema
} from "./validation";

interface AuthContext {
  account: AccountPublic;
  tokenHash: string;
}

type AuthedRequest = Request & { auth?: AuthContext };

interface CreateAppOptions {
  pool: Pool;
  config: AppConfig;
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

export function createApp(options: CreateAppOptions) {
  const { pool, config } = options;
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);

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

  const authIpLimit = rateLimit(20, 60_000);
  const saveLimit = rateLimit(180, 60_000);
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

  const health = asyncHandler(async (_req, res) => {
    try {
      await ping(pool);
      res.json({ ok: true, service: "terra-perdida-api", database: "ok", time: new Date().toISOString() });
    } catch {
      sendError(res, 503, "Banco de dados indisponível.", "database_unavailable");
    }
  });

  app.get("/", (_req, res) => {
    res.json({ service: "terra-perdida-api", status: "ok", docs: "/api/health" });
  });
  app.get("/health", health);
  app.get("/api/health", health);

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

  app.use((_req, res) => {
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
