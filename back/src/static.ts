import fs from "node:fs";
import path from "node:path";
import express, { type Router } from "express";

/**
 * Resolve a pasta do frontend (site estático) a partir de diferentes
 * cenários de execução:
 *
 * - `tsx back/src/index.ts`      -> back/src  -> <repo>/front
 * - `node back/dist/index.js`    -> back/dist -> <repo>/front
 * - `cd back && node dist/...`   -> idem acima
 * - `cd <repo> && node back/dist/index.js` -> idem acima
 *
 * A variável de ambiente FRONT_DIR tem prioridade sobre tudo.
 */
export function resolveFrontDir(explicit?: string | null): string | null {
  const candidates: string[] = [];

  if (explicit && explicit.trim()) {
    candidates.push(path.resolve(explicit.trim()));
  }

  // back/dist -> back/src -> <repo>/front
  candidates.push(path.resolve(__dirname, "..", "..", "front"));
  // <repo>/front (processo iniciado na raiz do repositorio)
  candidates.push(path.resolve(process.cwd(), "front"));
  // <repo>/front (processo iniciado dentro de back/)
  candidates.push(path.resolve(process.cwd(), "..", "front"));

  for (const dir of candidates) {
    try {
      if (fs.existsSync(path.join(dir, "index.html"))) return dir;
    } catch {
      // Ignora candidate inacessivel e segue para o proximo.
    }
  }

  return null;
}

export interface StaticRouterOptions {
  frontDir: string;
  /** Cache maximo dos assets versionados, em segundos. */
  maxAgeSeconds?: number;
}

/** Caminhos que pertencem a API e nunca devem cair no fallback do frontend. */
export function isApiPath(urlPath: string): boolean {
  return urlPath === "/api" || urlPath.startsWith("/api/");
}

/**
 * Serve o frontend estatico e faz o fallback para o index.html
 * (single page app). Rotas /api continuam devolvendo JSON.
 */
export function createStaticRouter(options: StaticRouterOptions): Router {
  const router = express.Router();
  const frontDir = path.resolve(options.frontDir);
  const indexFile = path.join(frontDir, "index.html");
  const maxAgeSeconds = options.maxAgeSeconds ?? 3600;

  router.use(
    express.static(frontDir, {
      index: false,
      etag: true,
      lastModified: true,
      maxAge: maxAgeSeconds * 1000,
      fallthrough: true,
      setHeaders(res, filePath) {
        if (filePath.endsWith(".html")) {
          // O index nunca pode ficar preso em cache no navegador.
          res.setHeader("Cache-Control", "no-cache");
          return;
        }
        res.setHeader("Cache-Control", `public, max-age=${maxAgeSeconds}`);
      }
    })
  );

  // Fallback do jogo: qualquer rota que nao seja da API devolve o index.
  router.get("/{*splat}", (req, res, next) => {
    if (isApiPath(req.path)) {
      next();
      return;
    }
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(indexFile, (error) => {
      if (error) next(error);
    });
  });

  return router;
}
