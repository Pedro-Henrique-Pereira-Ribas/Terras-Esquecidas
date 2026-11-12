import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "js", "api.js"),
  "utf8"
);

function loadClient(fetchStub, options = {}) {
  const store = new Map();
  const win = {
    TP_CONFIG: {
      apiBase: options.apiBase === undefined ? "" : options.apiBase,
      localApiBase: options.localApiBase || "",
      apiEnabled: options.apiEnabled !== false,
      requestTimeoutMs: 2000
    },
    location: { hostname: options.hostname || "terras-esquecidas.onrender.com" },
    localStorage: {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key)
    }
  };
  win.window = win;
  const factory = new Function("window", "fetch", SOURCE);
  factory(win, fetchStub);
  return win.TP.api;
}

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => (name === "content-type" ? "application/json" : null) },
    text: async () => JSON.stringify(body)
  };
}

function emptyResponse(status) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => null },
    text: async () => ""
  };
}

test("apiBase vazio usa a mesma origem do jogo", async () => {
  const urls = [];
  const api = loadClient(async (url) => {
    urls.push(url);
    return jsonResponse(200, { ok: true });
  });

  assert.equal(api.base, "");
  assert.equal(api.enabled, true);
  await api.health();
  assert.equal(urls[0], "/api/health", "a chamada deve ser relativa, sem host");
});

test("apiBase preenchido usa a URL da API", async () => {
  const urls = [];
  const api = loadClient(
    async (url) => {
      urls.push(url);
      return jsonResponse(200, { ok: true });
    },
    { apiBase: "https://terras-esquecidas-back.onrender.com" }
  );

  assert.equal(api.base, "https://terras-esquecidas-back.onrender.com");
  await api.health();
  assert.equal(urls[0], "https://terras-esquecidas-back.onrender.com/api/health");
});

test("resposta sem JSON e tratada como servidor indisponivel", async () => {
  const api = loadClient(async () => emptyResponse(200));

  await assert.rejects(
    () => api.health(),
    (error) => {
      assert.equal(error.code, "invalid_response");
      assert.equal(api.isUnavailable(error), true);
      return true;
    }
  );
});

test("login que devolve corpo vazio nao quebra em silencio", async () => {
  const api = loadClient(async () => emptyResponse(200));

  await assert.rejects(
    () => api.login({ name: "Pedro", pin: "1234" }),
    (error) => {
      assert.equal(error.code, "invalid_response");
      assert.equal(api.isUnavailable(error), true);
      return true;
    }
  );
});

test("404 do host sem API conta como indisponivel", async () => {
  const api = loadClient(async () => emptyResponse(404));

  await assert.rejects(
    () => api.health(),
    (error) => {
      assert.equal(error.status, 404);
      assert.equal(api.isUnavailable(error), true);
      return true;
    }
  );
});

test("resposta valida da API e usada normalmente", async () => {
  const api = loadClient(async () =>
    jsonResponse(200, { token: "abc", account: { id: "1", name: "Pedro" }, save: { version: 1 } })
  );

  const data = await api.login({ name: "Pedro", pin: "1234" });
  assert.equal(data.token, "abc");
  // Erro com status de recusa do servidor nao e indisponibilidade.
  assert.equal(api.isUnavailable({ status: 401, code: "invalid_credentials" }), false);
});

test("logout aceita resposta 204 sem corpo", async () => {
  const api = loadClient(async () => emptyResponse(204));
  api.storeSession("token", { id: "1", name: "Pedro" });
  await api.logout();
  assert.equal(api.token, null);
});

test("apiEnabled false desliga a integracao", async () => {
  const api = loadClient(async () => jsonResponse(200, {}), { apiEnabled: false });
  assert.equal(api.enabled, false);
  await assert.rejects(() => api.health(), (error) => error.code === "offline");
});

test("changePassword envia a chave atual e a nova", async () => {
  let captured = null;
  const api = loadClient(async (url, options) => {
    captured = { url, method: options.method, body: JSON.parse(options.body) };
    return jsonResponse(200, { ok: true, message: "Chave de acesso alterada." });
  });

  const result = await api.changePassword("1234", "5678");
  assert.equal(captured.url, "/api/accounts/password");
  assert.equal(captured.method, "PUT");
  assert.equal(captured.body.currentPin, "1234");
  assert.equal(captured.body.newPin, "5678");
  assert.equal(result.ok, true);
});

test("changePassword propaga o erro de chave incorreta", async () => {
  const api = loadClient(async () =>
    jsonResponse(401, { error: { code: "invalid_credentials", message: "Chave de acesso atual incorreta." } })
  );

  await assert.rejects(
    () => api.changePassword("0000", "5678"),
    (error) => {
      assert.equal(error.status, 401);
      assert.equal(error.code, "invalid_credentials");
      assert.equal(error.message, "Chave de acesso atual incorreta.");
      return true;
    }
  );
});
