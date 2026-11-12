import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { newDb } from "pg-mem";
import type { Pool } from "pg";
import { createApp } from "../src/app";
import type { AppConfig } from "../src/config";
import { SCHEMA_SQL } from "../src/schema";
import { isApiPath, resolveFrontDir } from "../src/static";

const config: AppConfig = {
  port: 0,
  host: "127.0.0.1",
  databaseUrl: "pg-mem",
  databaseSsl: false,
  corsOrigins: ["*"],
  sessionDays: 30,
  bcryptRounds: 4,
  autoMigrate: false,
  serveFront: true,
  frontDir: null,
  trustProxy: 0,
  logLevel: "silent"
};

function makeFrontDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tp-front-"));
  fs.writeFileSync(
    path.join(dir, "index.html"),
    "<!doctype html><html><head><title>Terra Perdida</title></head><body><div id=\"app\"></div></body></html>"
  );
  fs.mkdirSync(path.join(dir, "js"));
  fs.writeFileSync(path.join(dir, "js", "config.js"), "window.TP_CONFIG = {};");
  fs.mkdirSync(path.join(dir, "css"));
  fs.writeFileSync(path.join(dir, "css", "style.css"), "body { margin: 0; }");
  return dir;
}

function makeApp(frontDir: string | null) {
  const db = newDb();
  db.public.none(SCHEMA_SQL);
  const adapter = db.adapters.createPg();
  const pool = new adapter.Pool() as unknown as Pool;
  return { app: createApp({ pool, config, frontDir }), pool };
}

test("serve o index.html na raiz", async () => {
  const { app } = makeApp(makeFrontDir());
  const response = await request(app).get("/");
  assert.equal(response.status, 200);
  assert.match(String(response.headers["content-type"]), /text\/html/);
  assert.match(response.text, /Terra Perdida/);
  assert.equal(response.headers["cache-control"], "no-cache");
});

test("serve os assets do frontend com cache proprio", async () => {
  const { app } = makeApp(makeFrontDir());
  const response = await request(app).get("/js/config.js");
  assert.equal(response.status, 200);
  assert.match(String(response.headers["content-type"]), /javascript/);
  assert.match(response.text, /TP_CONFIG/);
  assert.match(String(response.headers["cache-control"]), /max-age=\d+/);
});

test("rotas desconhecidas caem no index do jogo", async () => {
  const { app } = makeApp(makeFrontDir());
  const response = await request(app).get("/qualquer/rota/do/jogo");
  assert.equal(response.status, 200);
  assert.match(response.text, /Terra Perdida/);
});

test("rotas da API continuam respondendo JSON em 404", async () => {
  const { app } = makeApp(makeFrontDir());
  const response = await request(app).get("/api/rota-que-nao-existe");
  assert.equal(response.status, 404);
  assert.equal(response.body.error.code, "not_found");
  assert.match(String(response.headers["content-type"]), /json/);
});

test("sem frontend a raiz devolve as informacoes do servico", async () => {
  const { app } = makeApp(null);
  const response = await request(app).get("/");
  assert.equal(response.status, 200);
  assert.equal(response.body.service, "terras-esquecidas-back");
  assert.equal(response.body.docs, "/api/health");
});

test("health de liveness responde sem consultar o banco", async () => {
  const { app } = makeApp(null);
  const response = await request(app).get("/health");
  assert.equal(response.status, 200);
  assert.equal(response.body.ok, true);
  assert.equal(response.body.database, undefined);
  assert.equal(typeof response.body.uptime, "number");
});

test("health de readiness confere o banco", async () => {
  const { app } = makeApp(null);
  const response = await request(app).get("/api/health");
  assert.equal(response.status, 200);
  assert.equal(response.body.database, "ok");
});

test("a raiz da API lista o serviço", async () => {
  const { app } = makeApp(null);
  const response = await request(app).get("/api");
  assert.equal(response.status, 200);
  assert.equal(response.body.service, "terras-esquecidas-back");
});

test("sem DATABASE_URL o serviço sobe e avisa no health", async () => {
  const db = newDb();
  db.public.none(SCHEMA_SQL);
  const adapter = db.adapters.createPg();
  const pool = new adapter.Pool() as unknown as Pool;
  const withoutDb = createApp({
    pool,
    config: { ...config, databaseUrl: "" },
    frontDir: null
  });

  const liveness = await request(withoutDb).get("/health");
  assert.equal(liveness.status, 200, "o serviço precisa responder mesmo sem banco");

  const readiness = await request(withoutDb).get("/api/health");
  assert.equal(readiness.status, 503);
  assert.equal(readiness.body.error.code, "database_unavailable");
});

test("encontrar a pasta front do repositorio", () => {
  const found = resolveFrontDir();
  assert.ok(found, "a pasta front/ deveria ser encontrada a partir de back/");
  assert.ok(fs.existsSync(path.join(found as string, "index.html")));
});

test("FRONT_DIR tem prioridade sobre a deteccao automatica", () => {
  const dir = makeFrontDir();
  assert.equal(resolveFrontDir(dir), dir);
});

test("identifica caminhos da API", () => {
  assert.equal(isApiPath("/api"), true);
  assert.equal(isApiPath("/api/health"), true);
  assert.equal(isApiPath("/api/"), true);
  assert.equal(isApiPath("/jogo/api"), false);
  assert.equal(isApiPath("/"), false);
});
