import test from "node:test";
import assert from "node:assert/strict";
import { buildApprovedEmail, buildRequestEmail, sendEmail } from "../src/email";

function fakeFetch(ok: boolean, status = 200) {
  const calls: { url: string; init: RequestInit }[] = [];
  const impl = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return {
      ok,
      status,
      json: async () => ({ id: "email-123" })
    } as unknown as Response;
  }) as unknown as typeof fetch;
  return { impl, calls };
}

test("sem chave de API o envio e ignorado sem erro", async () => {
  const result = await sendEmail(
    { to: "dono@reino.test", subject: "oi", text: "oi" },
    { apiKey: null, from: "Terra <nao-responda@exemplo.com>" }
  );
  assert.equal(result.sent, false);
  assert.equal(result.reason, "email_desativado");
});

test("manda a mensagem para o provedor com a chave da API", async () => {
  const { impl, calls } = fakeFetch(true);
  const result = await sendEmail(
    { to: "dono@reino.test", subject: "Pedido", text: "Alguem pediu" },
    { apiKey: "re_123", from: "Terra <nao-responda@exemplo.com>" },
    impl
  );

  assert.equal(result.sent, true);
  assert.equal(result.id, "email-123");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.resend.com/emails");
  const headers = calls[0].init.headers as Record<string, string>;
  assert.equal(headers.Authorization, "Bearer re_123");
  const body = JSON.parse(String(calls[0].init.body));
  assert.deepEqual(body.to, ["dono@reino.test"]);
  assert.equal(body.subject, "Pedido");
  assert.equal(body.from, "Terra <nao-responda@exemplo.com>");
});

test("provedor que recusa nao derruba o pedido", async () => {
  const { impl } = fakeFetch(false, 422);
  const result = await sendEmail(
    { to: "dono@reino.test", subject: "Pedido", text: "texto" },
    { apiKey: "re_123", from: "Terra <nao-responda@exemplo.com>" },
    impl
  );
  assert.equal(result.sent, false);
  assert.equal(result.reason, "provedor_recusou");
});

test("rede quebrada tambem nao derruba o pedido", async () => {
  const impl = (async () => {
    throw new Error("rede fora");
  }) as unknown as typeof fetch;
  const result = await sendEmail(
    { to: "dono@reino.test", subject: "Pedido", text: "texto" },
    { apiKey: "re_123", from: "Terra <nao-responda@exemplo.com>" },
    impl
  );
  assert.equal(result.sent, false);
  assert.equal(result.reason, "falha_no_envio");
});

test("o aviso do dono leva os dados do pedido", () => {
  const message = buildRequestEmail({
    ownerEmail: "dono@reino.test",
    name: "Ana",
    server: "Terras Esquecidas",
    email: "ana@exemplo.com",
    note: "Por favor"
  });
  assert.equal(message.to, "dono@reino.test");
  assert.match(message.subject, /Ana/);
  assert.match(message.text, /Ana/);
  assert.match(message.text, /Terras Esquecidas/);
  assert.match(message.text, /ana@exemplo\.com/);
  assert.match(message.text, /Por favor/);
});

test("o aviso de aprovacao vai para a pessoa", () => {
  const message = buildApprovedEmail({
    email: "ana@exemplo.com",
    name: "Ana",
    server: "Reino Sem Nome"
  });
  assert.equal(message.to, "ana@exemplo.com");
  assert.match(message.text, /Ana/);
  assert.match(message.text, /aprovado/);
});
