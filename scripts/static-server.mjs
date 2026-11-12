/* ============================================================
   TERRA PERDIDA — servidor estatico do frontend
   Serve a pasta front/ sem depender do npm `serve` nem de rede.
   ============================================================ */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8"
};

function send(res, status, body, contentType) {
  res.writeHead(status, {
    "Content-Type": contentType || "text/plain; charset=utf-8",
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff"
  });
  res.end(body);
}

/**
 * Sobe um servidor estatico para a pasta informada.
 * Qualquer rota que nao exista cai no index.html, como no jogo.
 */
export function startStaticServer(rootDir, port, host = "127.0.0.1") {
  const root = path.resolve(rootDir);
  const indexFile = path.join(root, "index.html");

  const server = http.createServer((req, res) => {
    let requestPath = "/";
    try {
      requestPath = decodeURIComponent((req.url || "/").split("?")[0]);
    } catch {
      send(res, 400, "400");
      return;
    }

    let filePath = path.join(root, requestPath);
    const relative = path.relative(root, filePath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      send(res, 403, "403");
      return;
    }

    try {
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        filePath = indexFile;
      }
      const body = fs.readFileSync(filePath);
      const type = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
      send(res, 200, body, type);
    } catch {
      send(res, 500, "500");
    }
  });

  server.listen(port, host, () => {
    console.log(`[front] site em http://localhost:${port} (pasta ${root})`);
  });

  return server;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const root = process.argv[2] || "front";
  const port = Number(process.argv[3]) || 4173;
  startStaticServer(root, port);
}
