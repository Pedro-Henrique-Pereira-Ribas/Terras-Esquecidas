import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { newDb } from "pg-mem";
import type { Pool } from "pg";
import { createApp } from "../src/app";
import type { AppConfig } from "../src/config";
import { SCHEMA_SQL } from "../src/schema";
import { emptySave } from "../src/validation";

const config: AppConfig = {
  port: 0,
  host: "127.0.0.1",
  databaseUrl: "pg-mem",
  databaseSsl: false,
  corsOrigins: ["*"],
  sessionDays: 30,
  bcryptRounds: 4,
  autoMigrate: false,
  serveFront: false,
  frontDir: null,
  trustProxy: 0,
  logLevel: "silent"
};

function makeApp() {
  const db = newDb();
  db.public.none(SCHEMA_SQL);
  const adapter = db.adapters.createPg();
  const pool = new adapter.Pool() as unknown as Pool;
  return { app: createApp({ pool, config, frontDir: null }), pool };
}

function fullSave() {
  const save = emptySave();
  save.wallet.guerreiro = 1250;
  save.wardrobe.owned["guerreiro:imperial"] = true;
  save.wardrobe.equipped.guerreiro = "imperial";
  save.armory.guerreiro = {
    cls: "espada",
    tier: 2,
    owned: { "espada:0": true, "espada:1": true, "espada:2": true }
  };
  save.enchantments.guerreiro = {
    owned: { lamina_vidro: true },
    enabled: true
  };
  save.progress = { lastLevel: "ruinas", memories: 3 };
  return save;
}

test("health responde com o banco disponível", async () => {
  const { app } = makeApp();
  const response = await request(app).get("/api/health");
  assert.equal(response.status, 200);
  assert.equal(response.body.ok, true);
  assert.equal(response.body.database, "ok");
});

test("cria conta, restaura sessão e salva o estado completo", async () => {
  const { app } = makeApp();
  const save = fullSave();

  const created = await request(app)
    .post("/api/accounts")
    .send({ name: "Pedro", pin: "1234", server: "Reino Sem Nome", save });
  assert.equal(created.status, 201);
  assert.equal(created.body.account.name, "Pedro");
  assert.equal(created.body.account.server, "Reino Sem Nome");
  assert.equal(created.body.save.wallet.guerreiro, 1250);
  assert.ok(created.body.token);

  const me = await request(app)
    .get("/api/me")
    .set("Authorization", `Bearer ${created.body.token}`);
  assert.equal(me.status, 200);
  assert.equal(me.body.account.name, "Pedro");
  assert.equal(me.body.save.wardrobe.equipped.guerreiro, "imperial");
  assert.equal(me.body.save.armory.guerreiro.tier, 2);
  assert.equal(me.body.save.enchantments.guerreiro.owned.lamina_vidro, true);

  const updatedSave = fullSave();
  updatedSave.wallet.guerreiro = 9999;
  updatedSave.progress = { lastLevel: "templo", memories: 7 };
  const updated = await request(app)
    .put("/api/me/save")
    .set("Authorization", `Bearer ${created.body.token}`)
    .send({ save: updatedSave });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.save.wallet.guerreiro, 9999);
  assert.ok(updated.body.updatedAt);

  const restored = await request(app)
    .get("/api/me/save")
    .set("Authorization", `Bearer ${created.body.token}`);
  assert.equal(restored.status, 200);
  assert.equal(restored.body.save.progress.lastLevel, "templo");
});

test("login aceita a chave correta e devolve o save persistido", async () => {
  const { app } = makeApp();
  const save = fullSave();
  await request(app)
    .post("/api/accounts")
    .send({ name: "  Pedro   Ribas ", pin: "4321", server: "Terras Esquecidas", save });

  const wrong = await request(app)
    .post("/api/accounts/login")
    .send({ name: "pedro ribas", pin: "0000" });
  assert.equal(wrong.status, 401);

  const login = await request(app)
    .post("/api/accounts/login")
    .send({ name: "PEDRO RIBAS", pin: "4321" });
  assert.equal(login.status, 200);
  assert.equal(login.body.account.name, "Pedro Ribas");
  assert.equal(login.body.account.server, "Terras Esquecidas");
  assert.equal(login.body.save.wallet.guerreiro, 1250);
});

test("não permite nomes duplicados, ignorando caixa e espaços", async () => {
  const { app } = makeApp();
  const first = await request(app)
    .post("/api/accounts")
    .send({ name: "Viajante", pin: "1234", server: "Reino Sem Nome" });
  assert.equal(first.status, 201);

  const duplicate = await request(app)
    .post("/api/accounts")
    .send({ name: "  viajante ", pin: "9999", server: "Outro Reino" });
  assert.equal(duplicate.status, 409);
  assert.equal(duplicate.body.error.code, "account_exists");
});

test("logout invalida o token e exige nova sessão", async () => {
  const { app } = makeApp();
  const created = await request(app)
    .post("/api/accounts")
    .send({ name: "Maga", pin: "1234", server: "Reino Sem Nome" });
  const token = created.body.token;

  const logout = await request(app)
    .post("/api/accounts/logout")
    .set("Authorization", `Bearer ${token}`);
  assert.equal(logout.status, 204);

  const me = await request(app)
    .get("/api/me")
    .set("Authorization", `Bearer ${token}`);
  assert.equal(me.status, 401);
});

test("valida payloads antes de tocar no banco", async () => {
  const { app } = makeApp();
  const badPin = await request(app)
    .post("/api/accounts")
    .send({ name: "Valido", pin: "12", server: "Reino Sem Nome" });
  assert.equal(badPin.status, 400);
  assert.equal(badPin.body.error.code, "invalid_payload");

  const badSave = await request(app)
    .post("/api/accounts")
    .send({ name: "Valido", pin: "1234", server: "Reino Sem Nome", save: { wallet: { guerreiro: -1 } } });
  assert.equal(badSave.status, 400);

  const unauthorized = await request(app).get("/api/me");
  assert.equal(unauthorized.status, 401);
});
