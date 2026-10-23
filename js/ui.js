/* ============================================================
   TERRA PERDIDA — interface DOM
   ============================================================ */
(function () {
  "use strict";
  const TP = (window.TP = window.TP || {});
  const art = TP.art;

  const UI = {
    el: {},
    selectedChar: null,
    selectedDiff: null,
    charsBuilt: false,
    diffsBuilt: false,
    dlg: null,
    camp: null,
    campTab: "forge",
    shopClass: null,
    shopTier: 0,
    levelCardTimer: null,
    lastHud: "",
    lastProgress: -1,
    lastGateLevel: -1,
    account: null,
    accounts: [],
    accountTab: "create",
    serverChoice: "Reino Sem Nome",
    serverCustom: ""
  };
  TP.ui = UI;

  const SCREEN_IDS = ["screen-account", "screen-title", "screen-characters", "screen-difficulty", "screen-how",
    "screen-camp", "screen-pause", "screen-journal", "screen-gameover", "screen-ending"];
  const ACCOUNT_KEY = "terraPerdida.accounts.v1";
  const SESSION_KEY = "terraPerdida.session.v1";
  const DEFAULT_SERVER = "Reino Sem Nome";

  function q(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function gradeClass(grade) {
    const g = (grade || "").toLowerCase();
    if (g.indexOf("raro") >= 0) return "raro";
    if (g.indexOf("pico") >= 0) return "epico";
    if (g.indexOf("lend") >= 0) return "lendario";
    if (g.indexOf("tico") >= 0) return "mitico";
    return "comum";
  }
  function rarLabel(w) {
    const r = w && TP.DATA.RARITIES[w.rarity];
    return r ? r.label : "Rara";
  }

  UI.init = function () {
    UI.el = {
      hud: q("hud"), hudPortrait: q("hud-portrait"), hudName: q("hud-hero-name"),
      hudGrade: q("hud-hero-grade"), hpFill: q("hud-hp-fill"), hpText: q("hud-hp-text"),
      weaponName: q("hud-weapon-name"), weaponRarity: q("hud-weapon-rarity"),
      phase: q("hud-phase"), memories: q("hud-memories"), coins: q("hud-coins"),
      progressFill: q("hud-progress-fill"), progressGate: q("hud-progress-gate"),
      bossBar: q("boss-bar"), bossName: q("boss-name"), bossTitle: q("boss-title"),
      bossFill: q("boss-fill"), dialogue: q("dialogue"), dialogueText: q("dialogue-text"),
      dialogueNext: q("btn-dialogue-next"), toastLayer: q("toast-layer"),
      levelCard: q("level-card"), levelNumeral: q("level-card-numeral"),
      levelName: q("level-card-name"), levelSubtitle: q("level-card-subtitle"),
      fade: q("fade"), charGrid: q("char-grid"), diffGrid: q("diff-grid"),
      charNext: q("btn-char-next"), charNote: q("char-selected-note"),
      diffStart: q("btn-diff-start"), diffHeroNote: q("diff-hero-note"),
      campScreen: q("screen-camp"), campTitle: q("camp-title"), campKicker: q("camp-kicker"),
      campCoins: q("camp-coins"), campSpeech: q("camp-speech"), campHint: q("camp-hint"),
      forgeClass: q("forge-weapon-class"), forgeCurrent: q("forge-current"),
      weaponPath: q("weapon-path"), forgeNext: q("forge-next"), forgeAction: q("forge-action"),
      campTabs: q("camp-tabs"), campForgePanel: q("camp-forge-panel"),
      campShopPanel: q("camp-shop-panel"), shopClassTabs: q("shop-class-tabs"),
      shopCurrent: q("shop-current"), shopGrid: q("shop-grid"),
      shopDetail: q("shop-detail"), shopAction: q("shop-action"),
      campContinue: q("btn-camp-continue"),
      endingChoiceView: q("ending-choice-view"), endingResultView: q("ending-result-view"),
      endingMemories: q("ending-memories"), endingCoins: q("ending-coins"), endingCls: q("ending-cls"),
      endingTrue: q("btn-ending-true"), trueNote: q("true-choice-note"),
      endingResultKicker: q("ending-result-kicker"), endingResultTitle: q("ending-result-title"),
      endingResultText: q("ending-result-text"), endingResultNote: q("ending-result-note"),
      journalGrid: q("journal-grid"), journalCount: q("journal-count"), journalNote: q("journal-note"),
      touch: q("touch-controls"),
      accountSigned: q("account-signed"), accountAuth: q("account-auth"),
      accountAvatar: q("account-avatar"), accountWelcomeName: q("account-welcome-name"),
      accountWelcomeServer: q("account-welcome-server"), accountCreated: q("account-created"),
      accountBrandServer: q("account-brand-server"), accountFormTitle: q("account-form-title"),
      accountFormSub: q("account-form-sub"), accountForm: q("account-form"),
      accountName: q("account-name"), accountPin: q("account-pin"),
      accountServerGroup: q("account-server-group"), accountServerOptions: q("account-server-options"),
      accountServerCustom: q("account-server-custom"), accountError: q("account-error"),
      accountCreate: q("btn-account-create"), accountTabs: q("account-tabs"),
      accountSkip: q("btn-account-skip"),
      titleAccount: q("title-account"), titleAccountName: q("title-account-name"),
      titleAccountServer: q("title-account-server"), titleAccountAvatar: q("title-account-avatar"),
      titleAccountButton: q("btn-title-account"), pauseAccount: q("pause-account"),
      accountScreen: q("screen-account")
    };

    // Retratos de Pedro via data URL gerada pelo canvas.
    const pedro = art.makePedro();
    document.querySelectorAll(".pedro-portrait").forEach(function (el) {
      el.style.backgroundImage = "url('" + pedro + "')";
    });

    bindButtons();
    buildCharacterCards();
    buildDifficultyCards();
    loadAccountStore();
    updateSoundLabels();

    const touchButtons = Array.from(document.querySelectorAll("#touch-controls [data-action]"));
    if (TP.input && TP.input.bindTouch) TP.input.bindTouch(touchButtons);
    if (TP.input && TP.input.hasTouch) UI.el.touch.classList.remove("hidden");
  };

  /* ============================================================
     BOTÕES
     ============================================================ */
  function call(name) {
    if (!TP.game || typeof TP.game[name] !== "function") return;
    const args = Array.prototype.slice.call(arguments, 1);
    return TP.game[name].apply(TP.game, args);
  }

  function bindButtons() {
    q("btn-start").addEventListener("click", function () { TP.audio.sfx("click"); call("showCharacters"); });
    q("btn-how").addEventListener("click", function () { TP.audio.sfx("click"); call("showHow"); });
    q("btn-how-close").addEventListener("click", function () { TP.audio.sfx("click"); call("showTitle"); });
    q("btn-how-back").addEventListener("click", function () { TP.audio.sfx("click"); call("showTitle"); });
    q("btn-char-back").addEventListener("click", function () { TP.audio.sfx("click"); call("showTitle"); });
    q("btn-diff-back").addEventListener("click", function () { TP.audio.sfx("click"); call("showCharacters"); });
    q("btn-char-next").addEventListener("click", function () { TP.audio.sfx("click"); call("showDifficulty"); });
    q("btn-diff-start").addEventListener("click", function () { TP.audio.sfx("click"); call("beginJourney"); });

    q("btn-title-sound").addEventListener("click", function () { toggleSound(); });
    q("btn-sound").addEventListener("click", function () { toggleSound(); });
    q("btn-pause-sound").addEventListener("click", function () { toggleSound(); });

    q("btn-title-account").addEventListener("click", function () { TP.audio.sfx("click"); call("showAccountGate"); });
    q("btn-account-play").addEventListener("click", function () { TP.audio.sfx("click"); call("showTitle"); });
    q("btn-account-switch").addEventListener("click", function () { TP.audio.sfx("click"); switchAccount(); });
    if (UI.el.accountSkip) UI.el.accountSkip.addEventListener("click", function () { TP.audio.sfx("click"); call("showTitle"); });

    UI.el.accountTabs.addEventListener("click", function (e) {
      const tab = e.target.closest("[data-account-tab]");
      if (!tab) return;
      TP.audio.sfx("click");
      setAccountTab(tab.getAttribute("data-account-tab"));
    });
    UI.el.accountServerOptions.addEventListener("click", function (e) {
      const option = e.target.closest("[data-server]");
      if (!option) return;
      TP.audio.sfx("click");
      selectServer(option.getAttribute("data-server"));
    });
    UI.el.accountForm.addEventListener("submit", function (e) {
      e.preventDefault();
      submitAccountForm();
    });
    [UI.el.accountName, UI.el.accountPin].forEach(function (input) {
      input.addEventListener("input", function () { setAccountError(""); });
    });
    UI.el.accountServerCustom.addEventListener("input", function () {
      UI.serverCustom = UI.el.accountServerCustom.value;
      setAccountError("");
    });

    q("btn-pause").addEventListener("click", function () { call("togglePause"); });
    q("btn-resume").addEventListener("click", function () { call("togglePause", false); });
    q("btn-journal").addEventListener("click", function () { TP.audio.sfx("click"); call("openJournal"); });
    q("btn-journal-back").addEventListener("click", function () { TP.audio.sfx("click"); UI.showScreen("screen-pause"); });
    q("btn-journal-resume").addEventListener("click", function () { TP.audio.sfx("click"); call("togglePause"); });
    q("btn-restart-phase").addEventListener("click", function () { TP.audio.sfx("click"); call("restartPhase"); });
    q("btn-quit").addEventListener("click", function () { TP.audio.sfx("click"); call("returnToTitle"); });

    q("btn-continue-checkpoint").addEventListener("click", function () { TP.audio.sfx("click"); call("continueFromCheckpoint"); });
    q("btn-gameover-restart").addEventListener("click", function () { TP.audio.sfx("click"); call("restartPhase"); });
    q("btn-gameover-quit").addEventListener("click", function () { TP.audio.sfx("click"); call("returnToTitle"); });

    q("btn-dialogue-next").addEventListener("click", function () { UI.advanceDialogue(); });

    q("btn-camp-continue").addEventListener("click", function () { TP.audio.sfx("click"); call("campContinue"); });

    q("btn-ending-crown").addEventListener("click", function () { TP.audio.sfx("click"); call("chooseEnding", "crown"); });
    q("btn-ending-break").addEventListener("click", function () { TP.audio.sfx("click"); call("chooseEnding", "break"); });
    q("btn-ending-true").addEventListener("click", function () { TP.audio.sfx("click"); call("chooseEnding", "true"); });
    q("btn-ending-title").addEventListener("click", function () { TP.audio.sfx("click"); call("returnToTitle"); });

    // Delegação para os cartões de personagem/dificuldade/forja.
    UI.el.charGrid.addEventListener("click", function (e) {
      const card = e.target.closest("[data-char]");
      if (!card) return;
      TP.audio.sfx("click");
      call("selectCharacter", card.getAttribute("data-char"));
    });
    UI.el.diffGrid.addEventListener("click", function (e) {
      const card = e.target.closest("[data-diff]");
      if (!card) return;
      TP.audio.sfx("click");
      call("selectDifficulty", card.getAttribute("data-diff"));
    });
    UI.el.forgeAction.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-buy-tier]");
      if (!btn) return;
      TP.audio.sfx("click");
      call("buyUpgrade");
    });
    UI.el.weaponPath.addEventListener("click", function (e) {
      const card = e.target.closest("[data-buy-tier]");
      if (!card) return;
      TP.audio.sfx("click");
      call("buyUpgrade");
    });
    UI.el.campTabs.addEventListener("click", function (e) {
      const tab = e.target.closest("[data-camp-tab]");
      if (!tab) return;
      UI.campTab = tab.getAttribute("data-camp-tab");
      TP.audio.sfx("click");
      UI.refreshCamp();
    });
    UI.el.shopClassTabs.addEventListener("click", function (e) {
      const tab = e.target.closest("[data-shop-class]");
      if (!tab) return;
      const cls = tab.getAttribute("data-shop-class");
      if (!TP.DATA.WEAPONS[cls]) return;
      UI.shopClass = cls;
      UI.shopTier = UI.camp && UI.camp.weaponClass === cls ? UI.camp.tier : 0;
      TP.audio.sfx("click");
      UI.refreshCamp();
    });
    UI.el.shopGrid.addEventListener("click", function (e) {
      const card = e.target.closest("[data-shop-tier]");
      if (!card) return;
      UI.shopTier = Number(card.getAttribute("data-shop-tier"));
      TP.audio.sfx("click");
      UI.refreshCamp();
    });
    UI.el.shopAction.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-shop-act]");
      if (!btn) return;
      const cls = btn.getAttribute("data-shop-class");
      const tier = Number(btn.getAttribute("data-shop-tier"));
      TP.audio.sfx("click");
      if (btn.getAttribute("data-shop-act") === "buy") call("buyWeapon", cls, tier);
      else call("equipWeapon", cls, tier);
    });
  }

  function toggleSound() {
    TP.audio.init();
    const on = TP.audio.toggle();
    updateSoundLabels();
    TP.audio.sfx("click");
    if (!on) UI.toast("Som desligado. O Reino fica em silêncio.", "danger", 1800);
    else UI.toast("Som ligado. A brasa voltou a crepitar.", "coin", 1800);
  }

  UI.updateSoundLabels = updateSoundLabels;
  function updateSoundLabels() {
    const on = TP.audio && TP.audio.enabled;
    const title = q("btn-title-sound");
    if (title) title.textContent = "SOM: " + (on ? "LIGADO" : "MUDO");
    const hud = q("btn-sound");
    if (hud) { hud.textContent = on ? "♪" : "×"; hud.title = on ? "Silenciar" : "Ligar som"; }
    const pause = q("btn-pause-sound");
    if (pause) pause.textContent = "SOM: " + (on ? "LIGADO" : "MUDO");
  }

  /* ============================================================
     CONTA LOCAL / SERVIDOR
     ============================================================ */
  function accountStorageGet(key) {
    try { return window.localStorage.getItem(key); } catch (err) { return null; }
  }
  function accountStorageSet(key, value) {
    try {
      if (value == null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
    } catch (err) { /* modo privado ou armazenamento bloqueado */ }
  }
  function normalizeAccountName(name) {
    return String(name || "").trim().replace(/\s+/g, " ").toLowerCase();
  }
  function hashPin(pin) {
    let h = 5381;
    const text = String(pin || "");
    for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
    return h.toString(36);
  }
  function accountInitial(name) {
    const clean = String(name || "V").trim();
    return (clean.charAt(0) || "V").toUpperCase();
  }
  function accountCreatedLabel(iso) {
    if (!iso) return "Conta local";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "Conta local";
    return "Desde " + d.toLocaleDateString("pt-BR");
  }
  function loadAccountStore() {
    let list = [];
    try {
      const parsed = JSON.parse(accountStorageGet(ACCOUNT_KEY) || "[]");
      if (Array.isArray(parsed)) list = parsed;
    } catch (err) { list = []; }
    UI.accounts = list.filter(function (a) {
      return a && typeof a.name === "string" && typeof a.server === "string";
    });
    const session = accountStorageGet(SESSION_KEY);
    UI.account = session
      ? UI.accounts.find(function (a) { return normalizeAccountName(a.name) === session; }) || null
      : null;
    UI.accountTab = UI.account ? "create" : UI.accounts.length ? "login" : "create";
  }
  function saveAccountStore() {
    accountStorageSet(ACCOUNT_KEY, JSON.stringify(UI.accounts));
  }
  function setAccountSession(account) {
    if (!account) accountStorageSet(SESSION_KEY, null);
    else accountStorageSet(SESSION_KEY, normalizeAccountName(account.name));
  }
  function setAccountError(message) {
    if (!UI.el.accountError) return;
    UI.el.accountError.textContent = message || "";
    UI.el.accountError.classList.toggle("visible", !!message);
  }
  function setAccountTab(tab) {
    UI.accountTab = tab === "login" ? "login" : "create";
    const isLogin = UI.accountTab === "login";
    UI.el.accountTabs.querySelectorAll("[data-account-tab]").forEach(function (btn) {
      const on = btn.getAttribute("data-account-tab") === UI.accountTab;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    UI.el.accountFormTitle.textContent = isLogin ? "Bem-vindo de volta" : "Escolha seu nome";
    UI.el.accountFormSub.textContent = isLogin
      ? "Entre com o nome do viajante e a chave criada neste navegador."
      : "Ele aparecerá no título e nos registros da jornada.";
    UI.el.accountServerGroup.classList.toggle("hidden", isLogin);
    UI.el.accountCreate.innerHTML = (isLogin ? "ENTRAR NO REINO" : "CRIAR CONTA") + " <span>›</span>";
    UI.el.accountPin.setAttribute("autocomplete", isLogin ? "current-password" : "new-password");
    setAccountError("");
  }
  function selectServer(value) {
    UI.serverChoice = value || DEFAULT_SERVER;
    UI.el.accountServerOptions.querySelectorAll("[data-server]").forEach(function (btn) {
      const on = btn.getAttribute("data-server") === UI.serverChoice;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    const custom = UI.serverChoice === "__custom";
    UI.el.accountServerCustom.classList.toggle("hidden", !custom);
    if (custom) {
      UI.el.accountServerCustom.focus();
      UI.el.accountBrandServer.textContent = UI.serverCustom.trim() || "Servidor personalizado";
    } else {
      UI.el.accountBrandServer.textContent = UI.serverChoice;
    }
    setAccountError("");
  }
  function chosenServer() {
    return UI.serverChoice === "__custom" ? UI.serverCustom.trim() : UI.serverChoice;
  }
  function loginAccount(account) {
    if (!account) return;
    account.lastLogin = new Date().toISOString();
    saveAccountStore();
    setAccountSession(account);
    UI.account = account;
    setAccountError("");
    UI.refreshAccountGate();
  }
  function switchAccount() {
    setAccountSession(null);
    UI.account = null;
    UI.accountTab = UI.accounts.length ? "login" : "create";
    if (UI.el.accountPin) UI.el.accountPin.value = "";
    UI.refreshAccountGate();
  }
  function submitAccountForm() {
    const name = UI.el.accountName.value.trim().replace(/\s+/g, " ");
    const pin = UI.el.accountPin.value.trim();
    if (!/^[^\u0000-\u001f<>]{3,18}$/.test(name)) {
      setAccountError("O nome precisa ter entre 3 e 18 caracteres.");
      UI.el.accountName.focus();
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      setAccountError("A chave de acesso precisa ter exatamente 4 números.");
      UI.el.accountPin.focus();
      return;
    }

    if (UI.accountTab === "login") {
      const account = UI.accounts.find(function (a) { return normalizeAccountName(a.name) === normalizeAccountName(name); });
      if (!account) {
        setAccountError("Nenhuma conta com esse nome neste dispositivo.");
        return;
      }
      if (account.pin !== hashPin(pin)) {
        setAccountError("Chave de acesso incorreta.");
        UI.el.accountPin.select();
        return;
      }
      loginAccount(account);
      return;
    }

    if (UI.accounts.some(function (a) { return normalizeAccountName(a.name) === normalizeAccountName(name); })) {
      setAccountError("Já existe uma conta com esse nome. Use a aba ENTRAR.");
      return;
    }
    const server = chosenServer();
    if (!/^[^\u0000-\u001f<>]{3,24}$/.test(server)) {
      setAccountError("Escolha um servidor ou digite um nome com 3 a 24 caracteres.");
      return;
    }
    const account = {
      name: name,
      pin: hashPin(pin),
      server: server,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    UI.accounts.push(account);
    saveAccountStore();
    setAccountSession(account);
    UI.account = account;
    UI.el.accountPin.value = "";
    setAccountError("");
    UI.refreshAccountGate();
  }

  UI.refreshAccountGate = function () {
    if (!UI.el.accountSigned) return;
    const signed = !!UI.account;
    UI.el.accountSigned.classList.toggle("hidden", !signed);
    UI.el.accountAuth.classList.toggle("hidden", signed);
    if (signed) {
      const a = UI.account;
      UI.el.accountAvatar.textContent = accountInitial(a.name);
      UI.el.accountWelcomeName.textContent = a.name;
      UI.el.accountWelcomeServer.textContent = a.server;
      UI.el.accountCreated.textContent = accountCreatedLabel(a.createdAt);
      UI.el.accountBrandServer.textContent = a.server;
      UI.el.accountCreated.title = "Conta guardada apenas neste navegador";
    } else {
      setAccountTab(UI.accountTab);
      UI.el.accountBrandServer.textContent = chosenServer() || DEFAULT_SERVER;
      if (!UI.el.accountName.value && UI.accounts.length === 1) {
        UI.el.accountName.value = UI.accounts[0].name;
      }
    }
    UI.renderAccountBadge();
  };

  UI.renderAccountBadge = function () {
    const a = UI.account;
    const name = a ? a.name : "Visitante";
    const server = a ? a.server : "Jogando sem conta";
    if (UI.el.titleAccount) UI.el.titleAccount.classList.toggle("guest", !a);
    if (UI.el.titleAccountName) UI.el.titleAccountName.textContent = name;
    if (UI.el.titleAccountServer) UI.el.titleAccountServer.textContent = server;
    if (UI.el.titleAccountAvatar) UI.el.titleAccountAvatar.textContent = accountInitial(name);
    if (UI.el.titleAccountButton) {
      UI.el.titleAccountButton.textContent = a ? "CONTA" : "ENTRAR";
      UI.el.titleAccountButton.setAttribute("aria-label", a ? "Abrir conta" : "Criar conta ou entrar");
    }
    if (UI.el.pauseAccount) UI.el.pauseAccount.textContent = a
      ? a.name + "  ·  Servidor " + a.server
      : "Visitante  ·  Jogando sem conta";
  };

  /* ============================================================
     TELAS
     ============================================================ */
  UI.showScreen = function (id) {
    SCREEN_IDS.forEach(function (sid) {
      const el = q(sid);
      if (el) el.classList.toggle("active", sid === id);
    });
    document.body.classList.toggle("camp-mode", id === "screen-camp");
    UI.clearToasts();
  };
  UI.hideScreens = function () {
    SCREEN_IDS.forEach(function (sid) {
      const el = q(sid);
      if (el) el.classList.remove("active");
    });
    document.body.classList.remove("camp-mode");
    UI.clearToasts();
  };
  UI.showHUD = function (show) { UI.el.hud.classList.toggle("hidden", !show); };
  UI.showTouch = function (show) {
    if (!TP.input || !TP.input.hasTouch) return;
    UI.el.touch.classList.toggle("hidden", !show);
  };

  UI.setHUD = function (data) {
    const p = data.player, run = data.run, level = data.level;
    if (!p || !run || !level) return;

    // A barra de progresso anda a cada quadro; o resto do HUD só é reescrito quando muda.
    const progress = Math.max(0, Math.min(1, (p.x + p.w / 2) / level.width));
    const progressPct = Math.round(progress * 200) / 2;
    if (progressPct !== UI.lastProgress) {
      UI.lastProgress = progressPct;
      if (UI.el.progressFill) UI.el.progressFill.style.width = progressPct + "%";
    }
    if (UI.el.progressGate && UI.lastGateLevel !== level.index) {
      UI.lastGateLevel = level.index;
      UI.el.progressGate.style.left = (level.arena.start / level.width * 100).toFixed(2) + "%";
    }

    const key = p.char.id + ":" + p.hp + ":" + p.weapon.cls + ":" + p.weapon.tier + ":" + run.coins + ":" + run.memories + ":" +
      level.index + ":" + (level.bossActive ? 1 : 0) + ":" + (level.boss ? Math.ceil(level.boss.hp) : 0);
    if (key === UI.lastHud) return;
    UI.lastHud = key;

    UI.el.hudName.textContent = p.char.name;
    UI.el.hudGrade.textContent = "Grau " + p.char.grade;
    UI.el.hudPortrait.style.backgroundImage = "url('" + art.makePortrait(p.char) + "')";
    const pct = Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100));
    UI.el.hpFill.style.width = pct + "%";
    UI.el.hpFill.classList.toggle("low", pct <= 30);
    UI.el.hpText.textContent = Math.max(0, Math.ceil(p.hp)) + " / " + p.maxHp;
    UI.el.weaponName.textContent = p.weapon.name;
    UI.el.weaponRarity.textContent = p.weapon.rarityLabel;
    UI.el.weaponRarity.className = "rarity-text " + p.weapon.rarity;
    UI.el.phase.textContent = level.def.numeral + " · " + level.def.name;
    UI.el.memories.textContent = run.memories + " / 15 memórias";
    UI.el.coins.textContent = run.coins;

    const showBoss = !!(level.bossActive && level.boss && !level.bossDefeated);
    UI.el.bossBar.classList.toggle("hidden", !showBoss);
    if (showBoss) {
      const b = level.boss;
      UI.el.bossName.textContent = b.cfg.name;
      UI.el.bossTitle.textContent = b.cfg.title;
      UI.el.bossFill.style.width = Math.max(0, Math.min(100, (b.hp / b.maxHp) * 100)) + "%";
      UI.el.bossBar.classList.toggle("final", !!b.cfg.final);
    }
  };

  UI.invalidateHUD = function () {
    UI.lastHud = "";
    UI.lastProgress = -1;
    UI.lastGateLevel = -1;
  };

  /* ============================================================
     PERSONAGENS
     ============================================================ */
  function buildCharacterCards() {
    if (UI.charsBuilt) return;
    const chars = TP.DATA.CHARACTERS;
    UI.el.charGrid.innerHTML = chars.map(function (c) {
      const w = TP.DATA.WEAPONS[c.weaponClass][0];
      const wc = TP.DATA.WEAPON_CLASSES[c.weaponClass];
      const g = gradeClass(c.grade);
      const speed = Math.max(1, Math.min(5, Math.round((c.speed / 2.5) * 5)));
      const weight = Math.max(1, Math.min(5, Math.round((c.weight / 8) * 5)));
      return '<button class="char-card" type="button" role="listitem" data-char="' + c.id + '">' +
        '<div class="card-portrait" style="background-image:url(\'' + art.makePortrait(c) + '\')"></div>' +
        '<div class="card-body">' +
          '<div class="char-name">' + esc(c.name) + '</div>' +
          '<div class="char-epithet">' + esc(c.epithet) + '</div>' +
          '<div class="card-meta"><span class="char-grade ' + g + '">GRAU ' + esc(c.grade) + '</span><span>100 VIDA</span></div>' +
          '<div class="char-stats">' +
            '<div class="stat-line"><span>Passo</span><span class="stat-track"><i style="width:' + (speed * 20) + '%"></i></span></div>' +
            '<div class="stat-line"><span>Peso</span><span class="stat-track"><i style="width:' + (weight * 20) + '%"></i></span></div>' +
          '</div>' +
          '<div class="char-weapon"><b>' + esc(w.name) + '</b>Rara · ' + w.dmg + ' dano · ' + esc(w.speed) + ' · alcance ' + esc((wc.rangeLabel || "curto").toLowerCase()) + '</div>' +
          '<div class="char-passive"><strong>' + esc(c.passive) + '</strong> ' + esc(c.passiveText) + '</div>' +
          '<p class="char-blurb">' + esc(c.blurb) + '</p>' +
          '<p class="char-quote">' + esc(c.quote) + '</p>' +
        '</div>' +
        '<span class="char-sigil" style="background-image:url(\'' + art.makeWeaponIcon(c.weaponClass, 0) + '\')" aria-hidden="true"></span>' +
      '</button>';
    }).join("");
    UI.charsBuilt = true;
  }

  UI.showCharacters = function () {
    UI.showScreen("screen-characters");
    UI.updateCharacterSelection(UI.selectedChar);
  };

  UI.updateCharacterSelection = function (id) {
    UI.selectedChar = id || null;
    UI.el.charGrid.querySelectorAll("[data-char]").forEach(function (el) {
      el.classList.toggle("selected", el.getAttribute("data-char") === id);
    });
    const c = TP.DATA.CHARACTERS.find(function (x) { return x.id === id; });
    UI.el.charNext.disabled = !c;
    if (!c) {
      UI.el.charNote.textContent = "Escolha um herói para ver seus detalhes.";
      return;
    }
    const w = TP.DATA.WEAPONS[c.weaponClass][0];
    UI.el.charNote.innerHTML = '<strong>' + esc(c.name) + '</strong> · ' + esc(c.classLabel) +
      ' · 100 de vida · arma inicial <strong>' + esc(w.name) + '</strong> (' + esc(rarLabel(w)) + '). ' +
      esc(c.passive) + ': ' + esc(c.passiveText);
  };

  /* ============================================================
     DIFICULDADES
     ============================================================ */
  function buildDifficultyCards() {
    if (UI.diffsBuilt) return;
    UI.el.diffGrid.innerHTML = TP.DATA.DIFFICULTIES.map(function (d) {
      const bars = function (value) {
        let out = "";
        for (let i = 0; i < 5; i++) out += '<i class="' + (i < value ? "" : "off") + '"></i>';
        return out;
      };
      const dmg = Math.max(1, Math.min(5, Math.round(d.dmgMul * 3.3)));
      const hp = Math.max(1, Math.min(5, Math.round(d.hpMul * 3.3)));
      const spd = Math.max(1, Math.min(5, Math.round(d.speedMul * 3.2)));
      const mul = function (n) { return "×" + n.toFixed(2).replace(".", ","); };
      return '<button class="diff-card ' + d.id + '" type="button" role="listitem" data-diff="' + d.id + '">' +
        '<div class="diff-top"><h3>' + esc(d.name) + ' <span class="diff-dash">—</span> ' + esc(d.label) + '</h3></div>' +
        '<p class="diff-tagline">' + esc(d.tagline) + '</p>' +
        '<p class="diff-desc">' + esc(d.desc) + '</p>' +
        '<p class="diff-quote">' + esc(d.quote || "") + '</p>' +
        '<div class="diff-numbers">' +
          '<span class="diff-number"><span>Dano</span><b>' + mul(d.dmgMul) + '</b></span>' +
          '<span class="diff-number"><span>Vida</span><b>' + mul(d.hpMul) + '</b></span>' +
          '<span class="diff-number"><span>Velocidade</span><b>' + mul(d.speedMul) + '</b></span>' +
          '<span class="diff-number"><span>Cura</span><b>' + mul(d.healMul) + '</b></span>' +
        '</div>' +
        '<div class="diff-modifiers">' +
          '<div class="mod-line"><span>Dano recebido</span><span class="mod-bar">' + bars(dmg) + '</span></div>' +
          '<div class="mod-line"><span>Vida inimiga</span><span class="mod-bar">' + bars(hp) + '</span></div>' +
          '<div class="mod-line"><span>Agressividade</span><span class="mod-bar">' + bars(spd) + '</span></div>' +
        '</div>' +
        '<span class="diff-sigil">' + (d.id === "raiz" ? "⌁" : d.id === "selva" ? "⌘" : "✶") + '</span>' +
      '</button>';
    }).join("");
    UI.diffsBuilt = true;
  }

  UI.showDifficulty = function () {
    UI.showScreen("screen-difficulty");
    UI.updateDifficultySelection(UI.selectedDiff);
    UI.updateDiffHeroNote();
  };

  UI.updateDifficultySelection = function (id) {
    UI.selectedDiff = id || null;
    UI.el.diffGrid.querySelectorAll("[data-diff]").forEach(function (el) {
      el.classList.toggle("selected", el.getAttribute("data-diff") === id);
    });
    UI.el.diffStart.disabled = !id;
  };

  UI.updateDiffHeroNote = function () {
    const c = TP.DATA.CHARACTERS.find(function (x) { return x.id === UI.selectedChar; });
    if (!c) { UI.el.diffHeroNote.textContent = ""; return; }
    const d = TP.DATA.DIFFICULTIES.find(function (x) { return x.id === UI.selectedDiff; });
    UI.el.diffHeroNote.innerHTML = "Herói: <strong>" + esc(c.name) + "</strong> · " +
      esc(TP.DATA.WEAPON_CLASSES[c.weaponClass].name) +
      " rara · 100 de vida." + (d ? " Dificuldade: <strong>" + esc(d.name + " — " + d.label) + "</strong>." : " Escolha a dificuldade.");
  };

  /* ============================================================
     DIÁLOGO
     ============================================================ */
  UI.showDialogue = function (lines, onDone) {
    if (!lines || !lines.length) { if (onDone) onDone(); return; }
    UI.el.dialogue.classList.remove("hidden");
    UI.dlg = { lines: lines.slice(), i: 0, typing: false, char: 0, timer: null, done: onDone || function () {} };
    startLine();
  };

  function startLine() {
    const d = UI.dlg;
    if (!d) return;
    const text = d.lines[d.i] || "";
    d.char = 0;
    d.typing = true;
    UI.el.dialogueText.textContent = "";
    UI.el.dialogueNext.innerHTML = "CONTINUAR <span>›</span>";
    clearInterval(d.timer);
    d.timer = setInterval(function () {
      if (!UI.dlg) return;
      d.char += 1;
      UI.el.dialogueText.textContent = text.slice(0, d.char);
      if (d.char % 5 === 0 && TP.audio) TP.audio.sfx("talk");
      if (d.char >= text.length) finishLine();
    }, 18);
  }

  function finishLine() {
    const d = UI.dlg;
    if (!d) return;
    clearInterval(d.timer);
    d.timer = null;
    d.typing = false;
    UI.el.dialogueText.textContent = d.lines[d.i] || "";
    const last = d.i >= d.lines.length - 1;
    UI.el.dialogueNext.innerHTML = (last ? "FECHAR" : "CONTINUAR") + " <span>›</span>";
  }

  UI.advanceDialogue = function () {
    const d = UI.dlg;
    if (!d) return;
    if (d.typing) { finishLine(); return; }
    if (d.i < d.lines.length - 1) {
      d.i += 1;
      startLine();
      return;
    }
    UI.hideDialogue(true);
  };

  UI.hideDialogue = function (callDone) {
    const d = UI.dlg;
    if (!d) { UI.el.dialogue.classList.add("hidden"); return; }
    clearInterval(d.timer);
    UI.dlg = null;
    UI.el.dialogue.classList.add("hidden");
    if (callDone) d.done();
  };

  /* ============================================================
     CARTÃO DE FASE
     ============================================================ */
  UI.showLevelCard = function (level, done) {
    UI.el.levelNumeral.textContent = "FASE " + level.def.numeral;
    UI.el.levelName.textContent = level.def.name;
    UI.el.levelSubtitle.textContent = level.def.subtitle;
    UI.el.levelCard.classList.remove("hidden", "out");
    clearTimeout(UI.levelCardTimer);
    UI.levelCardTimer = setTimeout(function () {
      UI.el.levelCard.classList.add("out");
      UI.levelCardTimer = setTimeout(function () {
        UI.el.levelCard.classList.add("hidden");
        UI.el.levelCard.classList.remove("out");
        if (done) done();
      }, 500);
    }, 1350);
  };
  UI.hideLevelCard = function () {
    clearTimeout(UI.levelCardTimer);
    UI.el.levelCard.classList.add("hidden");
    UI.el.levelCard.classList.remove("out");
  };

  /* ============================================================
     ACAMPAMENTO / FORJA
     ============================================================ */
  UI.showCamp = function (data) {
    UI.camp = data;
    UI.campTab = "forge";
    UI.shopClass = data.weaponClass || data.char.weaponClass;
    UI.shopTier = data.tier || 0;
    UI.clearToasts();
    UI.showScreen("screen-camp");
    UI.showHUD(false);
    UI.showTouch(false);
    UI.refreshCamp();
  };

  function ownedIn(d, cls, tier) {
    return !!(d && d.owned && d.owned[cls + ":" + tier]);
  }

  function effectLabel(effect) {
    if (effect === "burn") return "Incendeia o alvo por alguns segundos.";
    if (effect === "lifesteal") return "Rouba um pouco de vida a cada acerto.";
    if (effect === "spirit") return "Libera uma onda espiritual no golpe.";
    return "Sem efeito elemental — só aço e intenção.";
  }

  UI.refreshCamp = function () {
    const d = UI.camp;
    if (!d) return;
    const char = d.char;
    const cls = d.weaponClass || char.weaponClass;
    const weapons = TP.DATA.WEAPONS[cls];
    const tier = d.tier;
    const cur = weapons[tier];
    const next = tier < 3 ? weapons[tier + 1] : null;
    UI.el.campKicker.textContent = d.kicker || "ACAMPAMENTO";
    UI.el.campTitle.textContent = d.title || "A Forja de Pedro";
    UI.el.campCoins.textContent = d.coins;
    UI.el.campSpeech.textContent = d.speech;
    UI.el.campHint.textContent = d.hint || "";
    UI.el.forgeClass.textContent = TP.DATA.WEAPON_CLASSES[cls].name + " · " + char.name;
    UI.el.forgeCurrent.textContent = rarLabel(cur);

    const shopOpen = UI.campTab === "shop";
    UI.el.campForgePanel.classList.toggle("hidden", shopOpen);
    UI.el.campShopPanel.classList.toggle("hidden", !shopOpen);
    UI.el.campTabs.querySelectorAll("[data-camp-tab]").forEach(function (tab) {
      const active = tab.getAttribute("data-camp-tab") === UI.campTab;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });

    UI.el.weaponPath.innerHTML = weapons.map(function (w, i) {
      let cardCls = "wp-card";
      if (i === tier) cardCls += " owned";
      else if (i === tier + 1) cardCls += " next";
      else if (i > tier + 1) cardCls += " locked";
      const badge = i === tier ? '<span class="wp-badge">ATUAL</span>' : i === tier + 1 ? '<span class="wp-badge">PRÓXIMA</span>' : "";
      const buy = i === tier + 1 ? ' data-buy-tier="' + i + '"' : "";
      return '<button class="' + cardCls + '" type="button"' + buy + '>' + badge +
        '<img src="' + art.makeWeaponIcon(cls, i) + '" alt="' + esc(w.name) + '">' +
        '<div class="wp-rarity rarity-text ' + w.rarity + '">' + esc(rarLabel(w)) + '</div>' +
        '<div class="wp-name">' + esc(w.name) + '</div>' +
        '<div class="wp-stat">' + w.dmg + ' dano · ' + esc(w.speed) + '</div>' +
      '</button>';
    }).join("");

    if (next) {
      const missing = Math.max(0, next.upgrade - d.coins);
      const can = d.coins >= next.upgrade;
      UI.el.forgeNext.innerHTML =
        'Próximo degrau: <b>' + esc(next.name) + '</b> · ' + esc(rarLabel(next)) +
        ' · <b>' + next.dmg + ' dano</b> · ' + esc(next.speed) + '.<br>' + esc(next.desc) +
        '<div class="forge-diff"><span>Efeito: ' + esc(effectLabel(next.effect)) + '</span><span>Peso: ' + next.weight + '</span></div>';
      if (can) {
        UI.el.forgeAction.innerHTML = '<span class="forge-price">CUSTO: ' + formatCoins(next.upgrade) + '</span>' +
          '<button class="btn btn-primary" type="button" data-buy-tier="' + (tier + 1) + '">FORJAR ' + esc(rarLabel(next).toUpperCase()) + ' <span>›</span></button>';
      } else {
        UI.el.forgeAction.innerHTML = '<span class="forge-price missing">FALTAM ' + formatCoins(missing) + ' MOEDAS</span>' +
          '<button class="btn" type="button" disabled>FORJA INDISPONÍVEL</button>';
      }
    } else {
      UI.el.forgeNext.innerHTML = '<b>' + esc(cur.name) + '</b> é o último degrau da sua classe. A lâmina já não pede mais nada a Pedro — só a você.';
      UI.el.forgeAction.innerHTML = '<span class="forge-price">ARMA MÍTICA · ' + cur.dmg + ' DANO</span>';
    }

    refreshShop(d);

    UI.el.campContinue.textContent = d.continueLabel || "SEGUIR VIAGEM";
    UI.el.campContinue.innerHTML = esc(d.continueLabel || "SEGUIR VIAGEM") + ' <span>›</span>';
    UI.updateSoundLabels();
  };

  function refreshShop(d) {
    const classes = Object.keys(TP.DATA.WEAPONS);
    let shopClass = UI.shopClass;
    if (!TP.DATA.WEAPONS[shopClass]) shopClass = d.weaponClass;
    UI.shopClass = shopClass;
    const weapons = TP.DATA.WEAPONS[shopClass];
    const classDef = TP.DATA.WEAPON_CLASSES[shopClass];
    const equippedClass = d.weaponClass || d.char.weaponClass;
    const equippedWeapon = TP.DATA.WEAPONS[equippedClass][d.tier];
    if (UI.shopTier == null || UI.shopTier < 0 || UI.shopTier > 3) UI.shopTier = 0;

    UI.el.shopClassTabs.innerHTML = classes.map(function (c) {
      const ownedCount = TP.DATA.WEAPONS[c].filter(function (_, i) { return ownedIn(d, c, i); }).length;
      return '<button class="shop-class-tab' + (c === shopClass ? " active" : "") + '" type="button"' +
        ' data-shop-class="' + c + '" role="tab" aria-selected="' + (c === shopClass ? "true" : "false") + '">' +
        '<img src="' + art.makeWeaponIcon(c, 0) + '" alt="">' +
        '<span>' + esc(TP.DATA.WEAPON_CLASSES[c].name) + '</span>' +
        '<small>' + ownedCount + '/4</small>' +
      '</button>';
    }).join("");
    UI.el.shopCurrent.textContent = TP.DATA.WEAPON_CLASSES[equippedClass].name + " · " + rarLabel(equippedWeapon);

    UI.el.shopGrid.innerHTML = weapons.map(function (w, i) {
      const owned = ownedIn(d, shopClass, i);
      const equipped = equippedClass === shopClass && d.tier === i;
      const locked = !owned && i > 0 && !ownedIn(d, shopClass, i - 1);
      let cardCls = "wp-card shop-card";
      if (owned) cardCls += " owned";
      if (equipped) cardCls += " equipped";
      if (locked) cardCls += " locked";
      if (UI.shopTier === i) cardCls += " selected";
      const badge = equipped ? "EM USO" : owned ? "SUA" : locked ? "BLOQUEADA" : "À VENDA";
      return '<button class="' + cardCls + '" type="button" data-shop-tier="' + i + '" aria-pressed="' + (UI.shopTier === i ? "true" : "false") + '">' +
        '<span class="wp-badge">' + badge + '</span>' +
        '<img src="' + art.makeWeaponIcon(shopClass, i) + '" alt="' + esc(w.name) + '">' +
        '<div class="wp-rarity rarity-text ' + w.rarity + '">' + esc(rarLabel(w)) + '</div>' +
        '<div class="wp-name">' + esc(w.name) + '</div>' +
        '<div class="wp-stat">' + w.dmg + ' dano · ' + esc(w.speed) + '</div>' +
        (owned ? '' : '<div class="wp-price">' + (locked ? 'domine a anterior' : formatCoins(w.shopPrice) + ' moedas') + '</div>') +
      '</button>';
    }).join("");

    const selected = weapons[UI.shopTier];
    const owned = ownedIn(d, shopClass, UI.shopTier);
    const equipped = equippedClass === shopClass && d.tier === UI.shopTier;
    const unlocked = UI.shopTier === 0 || ownedIn(d, shopClass, UI.shopTier - 1);
    const price = selected.shopPrice;
    const range = (classDef.rangeLabel || "curto").toLowerCase();
    UI.el.shopDetail.innerHTML =
      '<b>' + esc(selected.name) + '</b> · ' + esc(rarLabel(selected)) +
      ' · <b>' + selected.dmg + ' dano</b> · ' + esc(selected.speed) + ' · alcance ' + esc(range) + '.<br>' + esc(selected.desc) +
      '<div class="forge-diff"><span>Efeito: ' + esc(effectLabel(selected.effect)) + '</span>' +
      '<span>Peso: ' + selected.weight + '</span>' +
      '<span>' + (owned ? 'Já está na sua mochila' : 'Preço: ' + formatCoins(price) + ' moedas') + '</span></div>';

    const attrs = ' data-shop-class="' + shopClass + '" data-shop-tier="' + UI.shopTier + '"';
    if (equipped) {
      UI.el.shopAction.innerHTML = '<span class="forge-price">EQUIPADA AGORA</span>' +
        '<button class="btn" type="button" disabled>EM USO</button>';
    } else if (owned) {
      UI.el.shopAction.innerHTML = '<span class="forge-price">JÁ COMPRADA</span>' +
        '<button class="btn btn-primary" type="button" data-shop-act="equip"' + attrs + '>EQUIPAR <span>›</span></button>';
    } else if (!unlocked) {
      UI.el.shopAction.innerHTML = '<span class="forge-price missing">REQUER ' + esc(TP.DATA.WEAPONS[shopClass][UI.shopTier - 1].name.toUpperCase()) + '</span>' +
        '<button class="btn" type="button" disabled>BLOQUEADA</button>';
    } else if (d.coins >= price) {
      UI.el.shopAction.innerHTML = '<span class="forge-price">CUSTO: ' + formatCoins(price) + '</span>' +
        '<button class="btn btn-primary" type="button" data-shop-act="buy"' + attrs + '>COMPRAR E EQUIPAR <span>›</span></button>';
    } else {
      UI.el.shopAction.innerHTML = '<span class="forge-price missing">FALTAM ' + formatCoins(price - d.coins) + ' MOEDAS</span>' +
        '<button class="btn" type="button" disabled>SEM MOEDAS</button>';
    }
  }

  UI.updateCampCoins = function (coins) {
    if (UI.camp) UI.camp.coins = coins;
    UI.refreshCamp();
  };

  function formatCoins(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }

  /* ============================================================
     DIÁRIO DE MEMÓRIAS
     ============================================================ */
  UI.showJournal = function (run) {
    if (!run) return;
    const ids = run.memoryIds || [];
    let foundTotal = 0;
    UI.el.journalGrid.innerHTML = TP.DATA.LEVELS.map(function (level, li) {
      const memories = TP.DATA.MEMORIES.slice(li * 3, li * 3 + 3);
      let foundInLevel = 0;
      const cards = memories.map(function (m) {
        const found = ids.indexOf(m.id) >= 0;
        if (found) foundInLevel++;
        if (found) {
          return '<article class="journal-memory found" role="listitem">' +
            '<span class="jm-mark">✦</span>' +
            '<div><h4>' + esc(m.name) + '</h4><p>' + esc(m.text) + '</p></div>' +
          '</article>';
        }
        return '<article class="journal-memory locked" role="listitem">' +
          '<span class="jm-mark">?</span>' +
          '<div><h4>Memória ainda perdida</h4>' +
          '<p>Volte a ' + esc(level.name) + ' e escute onde a luz não faz sentido.</p></div>' +
        '</article>';
      }).join("");
      foundTotal += foundInLevel;
      return '<section class="journal-group">' +
        '<header class="journal-group-head">' +
          '<span class="jg-numeral">' + esc(level.numeral) + '</span>' +
          '<h3>' + esc(level.name) + '</h3>' +
          '<span class="jg-count">' + foundInLevel + ' / 3</span>' +
        '</header>' +
        '<div class="journal-list">' + cards + '</div>' +
      '</section>';
    }).join("");

    UI.el.journalCount.textContent = foundTotal + " / 15 memórias encontradas";
    UI.el.journalNote.textContent = foundTotal >= 15
      ? "Pedro não precisa mais procurar. A história está inteira."
      : foundTotal === 0
        ? "Nenhuma memória ainda. A terra guarda o que você ainda não sabe."
        : "As memórias não aumentam seu poder. Elas mudam o que você pode dizer no fim.";
    UI.clearToasts();
    UI.showScreen("screen-journal");
    UI.updateSoundLabels();
  };

  /* ============================================================
     PAUSA, MORTE, FINAIS
     ============================================================ */
  UI.showPause = function (show) {
    UI.showScreen(show ? "screen-pause" : "screen-title");
    // A tela ativa do jogo é restaurada pelo game; aqui só escondemos a pausa.
    if (!show) {
      const pause = q("screen-pause");
      if (pause) pause.classList.remove("active");
    }
    UI.updateSoundLabels();
  };

  UI.showGameOver = function (show) {
    q("screen-gameover").classList.toggle("active", !!show);
    if (show) { UI.clearToasts(); UI.showHUD(false); UI.showTouch(false); }
  };

  UI.showEndingChoice = function (run) {
    UI.showScreen("screen-ending");
    UI.showHUD(false);
    UI.showTouch(false);
    UI.el.endingChoiceView.classList.remove("hidden");
    UI.el.endingResultView.classList.add("hidden");
    UI.el.endingMemories.textContent = run.memories;
    UI.el.endingCoins.textContent = run.coins;
    UI.el.endingCls.textContent = run.char.name + " · " + run.diff.name;
    const all = run.memories >= 15;
    UI.el.endingTrue.disabled = !all;
    UI.el.trueNote.textContent = all
      ? "Todas as 15 memórias estão com você. O nome pode ser dito."
      : "Requer as 15 memórias. Você tem " + run.memories + ".";
    UI.el.endingResultKicker.textContent = "FINAL";
  };

  UI.showEndingResult = function (key, ending, run, note, tone) {
    UI.el.endingChoiceView.classList.add("hidden");
    UI.el.endingResultView.classList.remove("hidden");
    UI.el.endingResultKicker.textContent = tone === "gold" ? "FINAL VERDADEIRO" : "FINAL";
    UI.el.endingResultTitle.textContent = ending.title;
    UI.el.endingResultText.innerHTML = ending.text.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join(" ");
    UI.el.endingResultNote.innerHTML = note || "";
    void key;
  };

  UI.resetEnding = function () {
    UI.el.endingChoiceView.classList.remove("hidden");
    UI.el.endingResultView.classList.add("hidden");
  };

  /* ============================================================
     TOASTS / FADE
     ============================================================ */
  UI.clearToasts = function () {
    if (UI.el.toastLayer) UI.el.toastLayer.innerHTML = "";
  };

  UI.toast = function (html, type, ms) {
    if (!UI.el.toastLayer) return;
    const el = document.createElement("div");
    el.className = "toast " + (type || "");
    el.innerHTML = html;
    UI.el.toastLayer.appendChild(el);
    while (UI.el.toastLayer.children.length > 3) {
      UI.el.toastLayer.removeChild(UI.el.toastLayer.firstChild);
    }
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 320);
    }, ms || 2600);
  };

  UI.fade = function (on, cb) {
    UI.el.fade.classList.toggle("on", !!on);
    if (cb) setTimeout(cb, 460);
  };

  UI.updateSoundLabels = updateSoundLabels;
})();
