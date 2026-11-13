/* ============================================================
   TERRA PERDIDA — painel de administração
   ============================================================ */
(function () {
  "use strict";
  const TP = (window.TP = window.TP || {});
  const TOKEN_KEY = "terraPerdida.admin.token.v1";
  // E-mail que libera as contas no painel. Pode ser trocado aqui.
  let adminEmailFallback = "p.ribas2301@gmail.com";

  const el = {
    viewRequest: document.getElementById("view-request"),
    viewLogin: document.getElementById("view-login"),
    panel: document.getElementById("panel"),
    requestForm: document.getElementById("request-form"),
    requestError: document.getElementById("request-error"),
    requestOk: document.getElementById("request-ok"),
    loginForm: document.getElementById("login-form"),
    loginError: document.getElementById("login-error"),
    createForm: document.getElementById("create-form"),
    createError: document.getElementById("create-error"),
    listError: document.getElementById("list-error"),
    listEmpty: document.getElementById("list-empty"),
    rows: document.getElementById("rows"),
    requestsList: document.getElementById("requests-list"),
    requestsEmpty: document.getElementById("requests-empty"),
    requestsError: document.getElementById("requests-error"),
    who: document.getElementById("who"),
    logout: document.getElementById("btn-logout"),
    newName: document.getElementById("new-name"),
    newPin: document.getElementById("new-pin"),
    newEmail: document.getElementById("new-email"),
    newServer: document.getElementById("new-server"),
    newAdmin: document.getElementById("new-admin")
  };

  function readToken() {
    try {
      return sessionStorage.getItem(TOKEN_KEY) || "";
    } catch (err) {
      return "";
    }
  }

  function writeToken(token) {
    try {
      if (token) sessionStorage.setItem(TOKEN_KEY, token);
      else sessionStorage.removeItem(TOKEN_KEY);
    } catch (err) {
      /* modo privado: o token so vive nesta aba */
    }
  }

  function setMessage(node, message, kind) {
    if (!node) return;
    node.textContent = message || "";
    node.classList.toggle("visible", !!message);
    node.classList.toggle("ok", kind === "ok");
  }

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
  }

  function showTab(tab) {
    const login = tab === "login";
    el.viewRequest.classList.toggle("hidden", login);
    el.viewLogin.classList.toggle("hidden", !login);
    document.querySelectorAll("[data-tab]").forEach(function (button) {
      const on = button.getAttribute("data-tab") === tab;
      button.classList.toggle("active", on);
      button.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function showLogin() {
    el.panel.classList.add("hidden");
    showTab("login");
  }

  function showPanel(account) {
    el.panel.classList.remove("hidden");
    showTab("login");
    if (account && account.name) {
      el.who.textContent = "Conectado como " + account.name;
    }
  }

  /* ---------- pedido de conta ---------- */
  el.requestForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const name = document.getElementById("req-name").value.trim().replace(/\s+/g, " ");
    const pin = document.getElementById("req-pin").value.trim();
    const email = document.getElementById("req-email").value.trim();
    const note = document.getElementById("req-note").value.trim();

    if (!/^[^\u0000-\u001f<>]{3,18}$/.test(name)) {
      setMessage(el.requestError, "O nome precisa ter entre 3 e 18 caracteres.");
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      setMessage(el.requestError, "A chave precisa ter exatamente 4 números.");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage(el.requestError, "Informe um e-mail válido.");
      return;
    }

    setMessage(el.requestError, "");
    setMessage(el.requestOk, "");
    const button = el.requestForm.querySelector("button[type=submit]");
    button.disabled = true;
    try {
      const data = await TP.api.adminRequestAccount({
        name: name,
        pin: pin,
        server: document.getElementById("req-server").value,
        email: email,
        note: note
      });
      el.requestForm.reset();
      setMessage(
        el.requestOk,
        data && data.notified
          ? "Pedido enviado por e-mail para " +
            adminEmail() +
            ", que libera o acesso."
          : "Pedido enviado. Ele foi direto para o dono do Reino, " +
            adminEmail() +
            ", que libera o acesso.",
        "ok"
      );
    } catch (error) {
      setMessage(
        el.requestError,
        error && error.message ? error.message : "Não foi possível enviar o pedido."
      );
    } finally {
      button.disabled = false;
    }
  });

  /* ---------- fila de pedidos ---------- */
  async function loadRequests() {
    setMessage(el.requestsError, "");
    try {
      const requests = await TP.api.adminRequests();
      renderRequests(requests);
      el.requestsEmpty.classList.toggle("hidden", requests.length > 0);
    } catch (error) {
      if (error && error.status === 401) {
        writeToken("");
        showLogin();
        setMessage(el.loginError, "Sessão encerrada. Entre de novo.");
        return;
      }
      if (error && error.status === 403) {
        setMessage(el.requestsError, "Só o dono do Reino vê os pedidos.");
        el.requestsList.textContent = "";
        el.requestsEmpty.classList.remove("hidden");
        return;
      }
      setMessage(el.requestsError, error && error.message ? error.message : "Não foi possível carregar os pedidos.");
    }
  }

  function renderRequests(requests) {
    el.requestsList.textContent = "";
    requests.forEach(function (item) {
      const row = document.createElement("div");
      row.className = "request" + (item.status === "pending" ? " pending" : " " + item.status);

      const info = document.createElement("div");
      info.className = "request-info";
      const title = document.createElement("strong");
      title.textContent = item.name;
      const detail = document.createElement("small");
      const partes = [item.server, item.email || "sem e-mail", formatDate(item.createdAt)];
      if (item.note) partes.push('"' + item.note + '"');
      detail.textContent = partes.join(" · ");
      info.appendChild(title);
      info.appendChild(detail);
      row.appendChild(info);

      const actions = document.createElement("div");
      actions.className = "request-actions";
      if (item.status === "pending") {
        const approve = actionButton("aprovar", "Aprovar e criar a conta");
        approve.classList.add("good");
        approve.addEventListener("click", function () {
          decideRequest(item, "approve");
        });
        actions.appendChild(approve);

        const reject = actionButton("recusar", "Recusar o pedido");
        reject.classList.add("danger");
        reject.addEventListener("click", function () {
          decideRequest(item, "reject");
        });
        actions.appendChild(reject);
      } else {
        const state = document.createElement("span");
        state.className = "request-state";
        state.textContent = item.status === "approved" ? "aprovado" : "recusado";
        actions.appendChild(state);
      }
      row.appendChild(actions);
      el.requestsList.appendChild(row);
    });
  }

  async function decideRequest(item, action) {
    setMessage(el.requestsError, "");
    try {
      if (action === "approve") {
        const data = await TP.api.adminApproveRequest(item.id);
        const avisou = data && data.notified ? " A pessoa foi avisada por e-mail." : "";
        setMessage(el.requestsError, "Conta de " + item.name + " liberada." + avisou, "ok");
      } else {
        await TP.api.adminRejectRequest(item.id);
        setMessage(el.requestsError, "Pedido de " + item.name + " recusado.", "ok");
      }
      loadRequests();
      loadAccounts();
    } catch (error) {
      setMessage(el.requestsError, error && error.message ? error.message : "Não foi possível decidir o pedido.");
    }
  }

  /* ---------- lista de contas ---------- */
  async function loadAccounts() {
    setMessage(el.listError, "");
    try {
      const accounts = await TP.api.adminAccounts();
      renderRows(accounts);
      el.listEmpty.classList.toggle("hidden", accounts.length > 0);
    } catch (error) {
      if (error && error.status === 401) {
        writeToken("");
        showLogin();
        setMessage(el.loginError, "Sessão encerrada. Entre de novo.");
        return;
      }
      setMessage(el.listError, error && error.message ? error.message : "Não foi possível carregar as contas.");
    }
  }

  function renderRows(accounts) {
    el.rows.textContent = "";
    accounts.forEach(function (account) {
      const tr = document.createElement("tr");
      if (account.isAdmin) tr.classList.add("is-admin");

      tr.appendChild(cell(account.name));
      tr.appendChild(cell(account.email || "—"));
      tr.appendChild(cell(account.server));

      const created = document.createElement("td");
      created.textContent = formatDate(account.createdAt);
      tr.appendChild(created);

      const last = document.createElement("td");
      last.textContent = formatDate(account.lastLoginAt);
      tr.appendChild(last);

      const actions = document.createElement("td");
      actions.className = "col-actions";

      const keyBtn = actionButton("trocar chave", "Chave");
      keyBtn.addEventListener("click", function () {
        changePin(account);
      });
      actions.appendChild(keyBtn);

      const releaseBtn = actionButton("liberar", "Libera o acesso ao painel com o e-mail do administrador");
      releaseBtn.addEventListener("click", function () {
        releaseAccount(account);
      });
      actions.appendChild(releaseBtn);

      const adminBtn = actionButton(account.isAdmin ? "remover admin" : "promover", "Admin");
      adminBtn.addEventListener("click", function () {
        toggleAdmin(account);
      });
      actions.appendChild(adminBtn);

      const delBtn = actionButton("apagar", "Apagar");
      delBtn.classList.add("danger");
      delBtn.addEventListener("click", function () {
        removeAccount(account);
      });
      actions.appendChild(delBtn);

      tr.appendChild(actions);
      el.rows.appendChild(tr);
    });
  }

  function cell(text) {
    const td = document.createElement("td");
    td.textContent = text;
    return td;
  }

  function actionButton(label, title) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mini";
    button.textContent = label;
    button.title = title || label;
    return button;
  }

  /* ---------- ações ---------- */
  async function changePin(account) {
    const pin = window.prompt("Nova chave de acesso para " + account.name + " (4 dígitos):");
    if (pin === null) return;
    if (!/^\d{4}$/.test(pin.trim())) {
      setMessage(el.listError, "A chave precisa ter exatamente 4 números.");
      return;
    }
    setMessage(el.listError, "");
    try {
      await TP.api.adminUpdateAccount(account.name, { pin: pin.trim() });
      setMessage(el.listError, "Chave de " + account.name + " trocada.", "ok");
      loadAccounts();
    } catch (error) {
      setMessage(el.listError, error && error.message ? error.message : "Não foi possível trocar a chave.");
    }
  }

  /**
   * Libera o acesso ao painel: a conta passa a usar o mesmo e-mail autorizado
   * do dono do Reino e ganha a permissao de admin.
   */
  async function releaseAccount(account) {
    const email = adminEmail();
    if (!email) {
      setMessage(el.listError, "Seu e-mail de administrador não está definido.");
      return;
    }
    const ok = window.confirm(
      "Liberar " + account.name + " no painel com o e-mail " + email + "?"
    );
    if (!ok) return;
    setMessage(el.listError, "");
    try {
      await TP.api.adminUpdateAccount(account.name, { email: email, isAdmin: true });
      setMessage(el.listError, account.name + " liberada no painel.", "ok");
      loadAccounts();
    } catch (error) {
      setMessage(el.listError, error && error.message ? error.message : "Não foi possível liberar a conta.");
    }
  }

  async function toggleAdmin(account) {
    setMessage(el.listError, "");
    try {
      await TP.api.adminUpdateAccount(account.name, { isAdmin: !account.isAdmin });
      setMessage(
        el.listError,
        account.isAdmin
          ? account.name + " não administra mais o painel."
          : account.name + " agora administra o painel.",
        "ok"
      );
      loadAccounts();
    } catch (error) {
      setMessage(el.listError, error && error.message ? error.message : "Não foi possível mudar a permissão.");
    }
  }

  async function removeAccount(account) {
    const ok = window.confirm(
      "Apagar a conta " + account.name + "? O save e as sessões dela vão junto."
    );
    if (!ok) return;
    setMessage(el.listError, "");
    try {
      await TP.api.adminDeleteAccount(account.name);
      setMessage(el.listError, "Conta " + account.name + " apagada.", "ok");
      loadAccounts();
    } catch (error) {
      setMessage(el.listError, error && error.message ? error.message : "Não foi possível apagar a conta.");
    }
  }

  /** E-mail do administrador conectado: e ele que libera as contas. */
  function adminEmail() {
    return (TP.api && TP.api.account && TP.api.account.email) || adminEmailFallback;
  }

  /* ---------- eventos ---------- */
  document.querySelectorAll("[data-tab]").forEach(function (button) {
    button.addEventListener("click", function () {
      showTab(button.getAttribute("data-tab"));
    });
  });

  el.loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const email = document.getElementById("admin-email").value.trim();
    const pin = document.getElementById("admin-pin").value.trim();
    if (!email) {
      setMessage(el.loginError, "Informe o e-mail cadastrado.");
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      setMessage(el.loginError, "A chave precisa ter exatamente 4 números.");
      return;
    }
    setMessage(el.loginError, "");
    const button = el.loginForm.querySelector("button[type=submit]");
    button.disabled = true;
    try {
      const data = await TP.api.adminLogin(email, pin);
      writeToken(data.token);
      showPanel(data.account);
      loadRequests();
      loadAccounts();
    } catch (error) {
      setMessage(
        el.loginError,
        error && error.message ? error.message : "Não foi possível entrar no painel."
      );
    } finally {
      button.disabled = false;
    }
  });

  el.createForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const name = el.newName.value.trim().replace(/\s+/g, " ");
    const pin = el.newPin.value.trim();
    const email = el.newEmail.value.trim();

    if (!/^[^\u0000-\u001f<>]{3,18}$/.test(name)) {
      setMessage(el.createError, "O nome precisa ter entre 3 e 18 caracteres.");
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      setMessage(el.createError, "A chave precisa ter exatamente 4 números.");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage(el.createError, "Informe um e-mail válido.");
      return;
    }

    setMessage(el.createError, "");
    const button = el.createForm.querySelector("button[type=submit]");
    button.disabled = true;
    try {
      await TP.api.adminCreateAccount({
        name: name,
        pin: pin,
        server: el.newServer.value,
        email: email,
        isAdmin: el.newAdmin.checked
      });
      el.newName.value = "";
      el.newPin.value = "";
      el.newEmail.value = "";
      el.newAdmin.checked = false;
      setMessage(el.createError, "Conta " + name + " cadastrada.", "ok");
      loadAccounts();
    } catch (error) {
      setMessage(
        el.createError,
        error && error.message ? error.message : "Não foi possível cadastrar a conta."
      );
    } finally {
      button.disabled = false;
    }
  });

  el.logout.addEventListener("click", function () {
    writeToken("");
    TP.api.clearSession();
    showLogin();
    setMessage(el.loginError, "");
  });

  /* ---------- início ---------- */
  if (readToken()) {
    TP.api.token = readToken();
    showPanel(null);
    loadRequests();
    loadAccounts();
  } else {
    showTab("request");
  }
})();
