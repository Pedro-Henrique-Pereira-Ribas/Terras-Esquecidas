import test from "node:test";
import assert from "node:assert/strict";
import { newDb } from "pg-mem";
import type { Pool } from "pg";
import { createApp } from "../src/app";
import type { AppConfig } from "../src/config";
import { SCHEMA_SQL, MIGRATIONS_SQL } from "../src/schema";

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
  logLevel: "silent",
  ownerEmail: "dono@reino.test"
};

function makeApp() {
  const db = newDb();
  db.public.none(SCHEMA_SQL);
  db.public.none(MIGRATIONS_SQL);
  const adapter = db.adapters.createPg();
  const pool = new adapter.Pool() as unknown as Pool;
  return { app: createApp({ pool, config, frontDir: null }), pool };
}

/** Cria um admin e devolve o token de sessao dele. */
async function makeAdmin(
  app: ReturnType<typeof makeApp>["app"],
  pool: Pool,
  email = "chefia@reino.test",
  name = "Chefia"
) {
  const created = await request(app).post("/api/accounts").send({
    name,
    pin: "1234",
    server: "Reino Sem Nome"
  });
  const token = created.body.token;
  // O primeiro admin e promovido direto no banco: pela API so quem ja e
  // admin pode promover alguem.
  await pool.query(
    "UPDATE accounts SET email = $1, email_key = $2, is_admin = true WHERE name_key = $3",
    [email, email.toLowerCase(), name.toLowerCase()]
  );
  return { token, email };
}

import request from "supertest";

test("quem pede conta entra na fila do dono do Reino", async () => {
  const { app } = makeApp();

  const pedido = await request(app)
    .post("/api/admin/request")
    .send({ name: "Quem Pede", pin: "2468", server: "Terras Esquecidas", note: "Por favor" });
  assert.equal(pedido.status, 201);
  assert.equal(pedido.body.request.name, "Quem Pede");
  assert.equal(pedido.body.request.status, "pending");

  // Pedido repetido com o mesmo nome nao entra duas vezes.
  const repetido = await request(app)
    .post("/api/admin/request")
    .send({ name: "quem pede", pin: "2468", server: "Terras Esquecidas" });
  assert.equal(repetido.status, 409);
});

test("so o dono do Reino ve e aprova os pedidos", async () => {
  const { app, pool } = makeApp();
  const { token } = await makeAdmin(app, pool, "dono@reino.test", "Dono");

  await request(app)
    .post("/api/admin/request")
    .send({ name: "Novo Viajante", pin: "2468", server: "Reino Sem Nome" });

  const fila = await request(app)
    .get("/api/admin/requests")
    .set("Authorization", `Bearer ${token}`);
  assert.equal(fila.status, 200);
  assert.equal(fila.body.requests.length, 1);
  const pedido = fila.body.requests[0];
  assert.equal(pedido.name, "Novo Viajante");
  assert.equal(pedido.status, "pending");

  // Aprovar transforma o pedido em conta, e ela entra no jogo.
  const aprovar = await request(app)
    .post(`/api/admin/requests/${pedido.id}/approve`)
    .set("Authorization", `Bearer ${token}`);
  assert.equal(aprovar.status, 201);
  assert.equal(aprovar.body.account.name, "Novo Viajante");
  assert.equal(aprovar.body.account.isAdmin, true);

  const login = await request(app)
    .post("/api/accounts/login")
    .send({ name: "Novo Viajante", pin: "2468" });
  assert.equal(login.status, 200);

  // O pedido ja decidido nao volta.
  const segunda = await request(app)
    .post(`/api/admin/requests/${pedido.id}/approve`)
    .set("Authorization", `Bearer ${token}`);
  assert.equal(segunda.status, 409);
});

test("admin que nao e o dono nao ve os pedidos", async () => {
  const { app, pool } = makeApp();
  const dono = await makeAdmin(app, pool, "dono@reino.test", "Dono");
  const outro = await makeAdmin(app, pool, "outro@reino.test", "Outro");

  const fila = await request(app)
    .get("/api/admin/requests")
    .set("Authorization", `Bearer ${outro.token}`);
  assert.equal(fila.status, 403);

  await request(app)
    .post("/api/admin/request")
    .send({ name: "Alguem", pin: "1357", server: "Reino Sem Nome" });

  const pedido = await request(app)
    .post("/api/admin/requests/qualquer/approve")
    .set("Authorization", `Bearer ${outro.token}`);
  assert.equal(pedido.status, 403);
  assert.equal(dono.token.length > 0, true);
});

test("quem nao e admin nao ve os pedidos", async () => {
  const { app } = makeApp();
  const criado = await request(app).post("/api/accounts").send({
    name: "Jogador",
    pin: "1234",
    server: "Reino Sem Nome"
  });
  const fila = await request(app)
    .get("/api/admin/requests")
    .set("Authorization", `Bearer ${criado.body.token}`);
  assert.equal(fila.status, 403);
});

test("o login do jogo avisa se a conta e admin", async () => {
  const { app, pool } = makeApp();
  await makeAdmin(app, pool);
  await request(app).post("/api/accounts").send({
    name: "Jogador",
    pin: "1234",
    server: "Reino Sem Nome"
  });

  const admin = await request(app).post("/api/accounts/login").send({ name: "Chefia", pin: "1234" });
  assert.equal(admin.status, 200);
  assert.equal(admin.body.account.isAdmin, true);

  const comum = await request(app).post("/api/accounts/login").send({ name: "Jogador", pin: "1234" });
  assert.equal(comum.status, 200);
  assert.equal(comum.body.account.isAdmin, false);
});

test("admin entra no painel com e-mail autorizado e chave correta", async () => {
  const { app, pool } = makeApp();
  const { email } = await makeAdmin(app, pool);

  const login = await request(app)
    .post("/api/admin/login")
    .send({ email, pin: "1234" });
  assert.equal(login.status, 200);
  assert.ok(login.body.token);
  assert.equal(login.body.account.email, email);
  assert.equal(login.body.account.isAdmin, true);
});

test("e-mail cadastrado mas nao autorizado nao entra", async () => {
  const { app, pool } = makeApp();
  const created = await request(app).post("/api/accounts").send({
    name: "Comum",
    pin: "1234",
    server: "Reino Sem Nome"
  });
  const token = created.body.token;
  // A conta tem e-mail cadastrado, mas nao esta autorizada.
  await pool.query(
    "UPDATE accounts SET email = $1, email_key = $2 WHERE name_key = 'comum'",
    ["comum@reino.test", "comum@reino.test"]
  );

  const login = await request(app)
    .post("/api/admin/login")
    .send({ email: "comum@reino.test", pin: "1234" });
  assert.equal(login.status, 403);
  assert.equal(login.body.error.code, "forbidden");
});

test("e-mail desconhecido ou chave errada nao entra", async () => {
  const { app, pool } = makeApp();
  await makeAdmin(app, pool);

  const semConta = await request(app)
    .post("/api/admin/login")
    .send({ email: "ninguem@reino.test", pin: "1234" });
  assert.equal(semConta.status, 401);

  const chaveErrada = await request(app)
    .post("/api/admin/login")
    .send({ email: "chefia@reino.test", pin: "0000" });
  assert.equal(chaveErrada.status, 401);
});

test("quem nao e admin nao lista nem cadastra contas", async () => {
  const { app } = makeApp();
  const created = await request(app).post("/api/accounts").send({
    name: "Jogador",
    pin: "1234",
    server: "Reino Sem Nome"
  });
  const token = created.body.token;

  const lista = await request(app)
    .get("/api/admin/accounts")
    .set("Authorization", `Bearer ${token}`);
  assert.equal(lista.status, 403);

  const cadastro = await request(app)
    .post("/api/admin/accounts")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Outro", pin: "1111", server: "Reino Sem Nome" });
  assert.equal(cadastro.status, 403);

  const semToken = await request(app).get("/api/admin/accounts");
  assert.equal(semToken.status, 401);
});

test("admin cadastra conta para outra pessoa e pode liberar o e-mail", async () => {
  const { app, pool } = makeApp();
  const { token } = await makeAdmin(app, pool);

  const cadastro = await request(app)
    .post("/api/admin/accounts")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Visitante Novo",
      pin: "5678",
      server: "Terras Esquecidas",
      email: "Visitante@Reino.Test",
      isAdmin: false
    });
  assert.equal(cadastro.status, 201);
  assert.equal(cadastro.body.account.name, "Visitante Novo");
  assert.equal(cadastro.body.account.email, "Visitante@Reino.Test");

  // A pessoa recem-criada ja entra no jogo com nome e chave.
  const login = await request(app)
    .post("/api/accounts/login")
    .send({ name: "Visitante Novo", pin: "5678" });
  assert.equal(login.status, 200);

  // O mesmo e-mail pode valer para varias contas: e ele que libera o painel.
  const repetido = await request(app)
    .post("/api/admin/accounts")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Outro Nome",
      pin: "1111",
      server: "Reino Sem Nome",
      email: "visitante@reino.test"
    });
  assert.equal(repetido.status, 201);
});

test("o mesmo e-mail libera varias contas, e a chave decide qual entra", async () => {
  const { app, pool } = makeApp();
  const { token, email } = await makeAdmin(app, pool);

  const outra = await request(app)
    .post("/api/admin/accounts")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Liberada", pin: "2222", server: "Reino Sem Nome", email, isAdmin: true });
  assert.equal(outra.status, 201);

  // Cada conta entra no painel com o e-mail compartilhado e a sua chave.
  const primeira = await request(app)
    .post("/api/admin/login")
    .send({ email, pin: "1234" });
  assert.equal(primeira.status, 200);
  assert.equal(primeira.body.account.name, "Chefia");

  const segunda = await request(app)
    .post("/api/admin/login")
    .send({ email, pin: "2222" });
  assert.equal(segunda.status, 200);
  assert.equal(segunda.body.account.name, "Liberada");

  // Chave que nao e de nenhuma das duas nao entra.
  const errada = await request(app)
    .post("/api/admin/login")
    .send({ email, pin: "9999" });
  assert.equal(errada.status, 401);
});

test("admin troca a chave e promove outra conta", async () => {
  const { app, pool } = makeApp();
  const { token } = await makeAdmin(app, pool);

  await request(app)
    .post("/api/admin/accounts")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Membro", pin: "1111", server: "Reino Sem Nome" });

  const atualiza = await request(app)
    .put("/api/admin/accounts/membro")
    .set("Authorization", `Bearer ${token}`)
    .send({ pin: "9999", email: "membro@reino.test", isAdmin: true });
  assert.equal(atualiza.status, 200);
  assert.equal(atualiza.body.account.isAdmin, true);

  const login = await request(app)
    .post("/api/accounts/login")
    .send({ name: "Membro", pin: "9999" });
  assert.equal(login.status, 200);

  const painel = await request(app)
    .post("/api/admin/login")
    .send({ email: "membro@reino.test", pin: "9999" });
  assert.equal(painel.status, 200);
});

test("admin apaga contas, mas nao a propria", async () => {
  const { app, pool } = makeApp();
  const { token } = await makeAdmin(app, pool);

  await request(app)
    .post("/api/admin/accounts")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Temporaria", pin: "1111", server: "Reino Sem Nome" });

  const propria = await request(app)
    .delete("/api/admin/accounts/chefia")
    .set("Authorization", `Bearer ${token}`);
  assert.equal(propria.status, 400);
  assert.equal(propria.body.error.code, "self_delete");

  const apaga = await request(app)
    .delete("/api/admin/accounts/temporaria")
    .set("Authorization", `Bearer ${token}`);
  assert.equal(apaga.status, 204);

  const lista = await request(app)
    .get("/api/admin/accounts")
    .set("Authorization", `Bearer ${token}`);
  const nomes = lista.body.accounts.map((a: { name: string }) => a.name);
  assert.equal(nomes.includes("Temporaria"), false);
  assert.equal(nomes.includes("Chefia"), true);
});
