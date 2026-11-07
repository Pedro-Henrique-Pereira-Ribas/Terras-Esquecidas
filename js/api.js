/* ============================================================
   TERRA PERDIDA — cliente da API de contas e saves
   ============================================================ */
(function () {
  "use strict";
  const TP = (window.TP = window.TP || {});
  const TOKEN_KEY = "terraPerdida.cloud.token.v1";
  const ACCOUNT_KEY = "terraPerdida.cloud.account.v1";

  function storageGet(key) {
    try { return window.localStorage.getItem(key); } catch (err) { return null; }
  }
  function storageSet(key, value) {
    try {
      if (value == null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
    } catch (err) { /* modo privado ou armazenamento bloqueado */ }
  }
  function isLocalHost() {
    const host = String(window.location.hostname || "").toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "";
  }
  function resolveBase() {
    const config = window.TP_CONFIG || {};
    const explicit = String(config.apiBase || "").trim();
    const local = String(config.localApiBase || "http://localhost:3001").trim();
    let base = isLocalHost() ? (local || explicit) : explicit;
    base = base.replace(/\/+$/, "");
    if (base.endsWith("/api")) base = base.slice(0, -4);
    return base;
  }

  class ApiError extends Error {
    constructor(message, status, code) {
      super(message);
      this.name = "ApiError";
      this.status = Number(status) || 0;
      this.code = code || "request_error";
    }
  }

  const API = {
    base: resolveBase(),
    token: storageGet(TOKEN_KEY) || null,
    account: null,
    enabled: false,
    timeoutMs: Math.max(1000, Number((window.TP_CONFIG || {}).requestTimeoutMs) || 7000),
    ApiError: ApiError
  };
  TP.api = API;

  try {
    const cached = JSON.parse(storageGet(ACCOUNT_KEY) || "null");
    if (cached && typeof cached.name === "string") API.account = cached;
  } catch (err) { API.account = null; }

  API.enabled = !!API.base;

  API.isNetworkError = function (error) {
    return !!error && (!error.status || error.status === 0);
  };

  API.storeSession = function (token, account) {
    API.token = token || null;
    API.account = account || null;
    storageSet(TOKEN_KEY, API.token);
    storageSet(ACCOUNT_KEY, account ? JSON.stringify(account) : null);
  };

  API.clearSession = function () {
    API.token = null;
    API.account = null;
    storageSet(TOKEN_KEY, null);
    storageSet(ACCOUNT_KEY, null);
  };

  API.getCachedAccount = function () {
    return API.account ? Object.assign({}, API.account) : null;
  };

  async function request(path, options) {
    if (!API.base) {
      throw new ApiError("Servidor não configurado neste cliente.", 0, "offline");
    }
    const opts = options || {};
    const headers = { Accept: "application/json" };
    if (opts.body !== undefined) headers["Content-Type"] = "application/json";
    const authToken = opts.token || API.token;
    if (opts.auth !== false && authToken) headers.Authorization = "Bearer " + authToken;

    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, API.timeoutMs);
    try {
      const response = await fetch(API.base + path, {
        method: opts.method || "GET",
        headers: headers,
        body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
        signal: controller.signal,
        cache: "no-store",
        credentials: "omit",
        mode: "cors",
        keepalive: !!opts.keepalive
      });
      const text = await response.text();
      let data = null;
      if (text) {
        try { data = JSON.parse(text); } catch (err) { data = null; }
      }
      if (!response.ok) {
        const error = data && data.error ? data.error : null;
        throw new ApiError(
          (error && error.message) || "O servidor respondeu com erro (" + response.status + ").",
          response.status,
          (error && error.code) || "request_error"
        );
      }
      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error && error.name === "AbortError") {
        throw new ApiError("O servidor demorou para responder.", 0, "timeout");
      }
      throw new ApiError("Não foi possível falar com o servidor.", 0, "network");
    } finally {
      clearTimeout(timer);
    }
  }

  API.health = function () {
    return request("/api/health", { auth: false });
  };

  API.createAccount = async function (payload) {
    const data = await request("/api/accounts", {
      method: "POST",
      body: {
        name: payload.name,
        pin: payload.pin,
        server: payload.server,
        save: payload.save
      },
      auth: false
    });
    API.storeSession(data.token, data.account);
    return data;
  };

  API.login = async function (payload) {
    const data = await request("/api/accounts/login", {
      method: "POST",
      body: { name: payload.name, pin: payload.pin },
      auth: false
    });
    API.storeSession(data.token, data.account);
    return data;
  };

  API.logout = async function () {
    const token = API.token;
    API.clearSession();
    if (!API.base || !token) return;
    try {
      await request("/api/accounts/logout", { method: "POST", token: token });
    } catch (err) {
      // O token local já foi removido; a sessão remota expira sozinha.
    }
  };

  API.me = async function () {
    const data = await request("/api/me");
    if (data && data.account) API.storeSession(API.token, data.account);
    return data;
  };

  API.save = async function (save, options) {
    const data = await request("/api/me/save", {
      method: "PUT",
      body: { save: save },
      keepalive: !!(options && options.keepalive)
    });
    if (data && data.account) API.storeSession(API.token, data.account);
    return data;
  };
})();
