import test from "node:test";
import assert from "node:assert/strict";
import {
  generateToken,
  hashPin,
  hashToken,
  normalizeName,
  sessionExpiry,
  verifyPin
} from "../src/security";

test("normaliza nomes para comparação", () => {
  assert.equal(normalizeName("  Pedro   Ribas "), "pedro ribas");
  assert.equal(normalizeName("VIAJANTE"), "viajante");
});

test("hash de PIN confere e rejeita a chave errada", async () => {
  const hash = await hashPin("1234", 4);
  assert.notEqual(hash, "1234");
  assert.equal(await verifyPin("1234", hash), true);
  assert.equal(await verifyPin("0000", hash), false);
});

test("tokens são aleatórios e guardados como hash", () => {
  const first = generateToken();
  const second = generateToken();
  assert.notEqual(first, second);
  assert.equal(hashToken(first).length, 64);
  assert.equal(hashToken(first), hashToken(first));
  assert.notEqual(hashToken(first), hashToken(second));
});

test("expiração da sessão respeita os dias configurados", () => {
  const before = Date.now();
  const expiry = sessionExpiry(2).getTime();
  const after = Date.now();
  assert.ok(expiry >= before + 2 * 86400000 - 1000);
  assert.ok(expiry <= after + 2 * 86400000 + 1000);
});
