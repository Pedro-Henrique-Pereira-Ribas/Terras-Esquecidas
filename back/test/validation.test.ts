import test from "node:test";
import assert from "node:assert/strict";
import {
  createAccountSchema,
  emptySave,
  loginSchema,
  saveSchema,
  updateSaveSchema
} from "../src/validation";

test("save vazio recebe todos os campos padrão", () => {
  const save = emptySave();
  assert.equal(save.version, 1);
  assert.deepEqual(save.wallet, {});
  assert.deepEqual(save.wardrobe, { owned: {}, equipped: {} });
  assert.deepEqual(save.armory, {});
  assert.deepEqual(save.enchantments, {});
  assert.deepEqual(save.progress, {});
});

test("save completo é aceito", () => {
  const parsed = saveSchema.parse({
    version: 1,
    wallet: { guerreiro: 500 },
    wardrobe: { owned: { "guerreiro:imperial": true }, equipped: { guerreiro: "imperial" } },
    armory: {
      guerreiro: { cls: "espada", tier: 2, owned: { "espada:0": true, "espada:2": true } }
    },
    enchantments: { guerreiro: { owned: { lamina_vidro: true }, enabled: false } },
    progress: { memories: 10 }
  });
  assert.equal(parsed.wallet.guerreiro, 500);
  assert.equal(parsed.armory.guerreiro.tier, 2);
  assert.equal(parsed.enchantments.guerreiro.enabled, false);
});

test("save rejeita valores negativos e tiers inválidos", () => {
  assert.throws(() => saveSchema.parse({ wallet: { guerreiro: -1 } }));
  assert.throws(() => saveSchema.parse({ armory: { guerreiro: { cls: "espada", tier: -1 } } }));
  assert.throws(() => saveSchema.parse({ armory: { guerreiro: { cls: "espada", tier: 1.5 } } }));
});

test("cadastro e login validam nome, chave e servidor", () => {
  assert.throws(() => createAccountSchema.parse({ name: "ab", pin: "1234", server: "Reino Sem Nome" }));
  assert.throws(() => createAccountSchema.parse({ name: "Pedro", pin: "123", server: "Reino Sem Nome" }));
  assert.throws(() => createAccountSchema.parse({ name: "Pedro", pin: "abcd", server: "Reino Sem Nome" }));
  assert.throws(() => createAccountSchema.parse({ name: "Pedro", pin: "1234", server: "ab" }));
  assert.throws(() => loginSchema.parse({ name: "Pedro", pin: "1234", extra: true }));
  assert.throws(() => updateSaveSchema.parse({ save: { wallet: { guerreiro: -5 } } }));
});
