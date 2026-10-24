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
    wardrobe: { owned: {}, equipped: {} },
    wardrobeChar: null,
    wardrobeSelected: null,
    armory: {},
    wallet: {},
    interactNpc: null,
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
  const WARDROBE_KEY = "terraPerdida.wardrobe.v1";
  const ARMORY_KEY = "terraPerdida.armory.v1";
  const WALLET_KEY = "terraPerdida.wallet.v1";
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
      dialogueName: q("dialogue-name"), dialoguePortrait: q("dialogue-portrait"),
      dialogueNext: q("btn-dialogue-next"), toastLayer: q("toast-layer"),
      hudQuest: q("hud-quest"), interactPrompt: q("interact-prompt"),
      interactText: q("interact-text"), touchInteract: q("touch-interact"),
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
      campWardrobePanel: q("camp-wardrobe-panel"), wardrobeCharTabs: q("wardrobe-char-tabs"),
      wardrobeCurrent: q("wardrobe-current"), wardrobeGrid: q("wardrobe-grid"),
      wardrobeDetail: q("wardrobe-detail"), wardrobeAction: q("wardrobe-action"),
      campContinue: q("btn-camp-continue"),
      endingChoiceView: q("ending-choice-view"), endingResultView: q("ending-result-view"),
      endingMemories: q("ending-memories"), endingCoins: q("ending-coins"), endingCls: q("ending-cls"),
      endingTrue: q("btn-ending-true"), trueNote: q("true-choice-note"),
      endingResultKicker: q("ending-result-kicker"), endingResultTitle: q("ending-result-title"),
      endingResultText: q("ending-result-text"), endingResultNote: q("ending-result-note"),
      endingAct2: q("btn-ending-act2"),
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
    loadWardrobe();
    loadArmory();
    loadWallet();
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
    q("btn-ending-act2").addEventListener("click", function () { TP.audio.sfx("click"); call("continueToAct2"); });
    q("btn-ending-new").addEventListener("click", function () { TP.audio.sfx("click"); call("newJourney"); });
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
    UI.el.campTabs.addEventListener("click", function (e) {
      const tab = e.target.closest("[data-camp-tab]");
      if (!tab) return;
      UI.campTab = tab.getAttribute("data-camp-tab");
      TP.audio.sfx("click");
      UI.refreshCamp();
    });
    UI.el.wardrobeCharTabs.addEventListener("click", function (e) {
      const tab = e.target.closest("[data-wardrobe-char]");
      if (!tab) return;
      const charId = tab.getAttribute("data-wardrobe-char");
      if (!TP.DATA.OUTFITS[charId]) return;
      UI.wardrobeChar = charId;
      UI.wardrobeSelected = UI.equippedOutfitId(charId);
      TP.audio.sfx("click");
      UI.refreshCamp();
    });
    UI.el.wardrobeGrid.addEventListener("click", function (e) {
      const card = e.target.closest("[data-wardrobe-outfit]");
      if (!card) return;
      UI.wardrobeSelected = card.getAttribute("data-wardrobe-outfit");
      TP.audio.sfx("click");
      UI.refreshCamp();
    });
    UI.el.wardrobeAction.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-wardrobe-act]");
      if (!btn) return;
      const charId = btn.getAttribute("data-wardrobe-char");
      const outfitId = btn.getAttribute("data-wardrobe-outfit");
      TP.audio.sfx("click");
      if (btn.getAttribute("data-wardrobe-act") === "buy") call("buyOutfit", charId, outfitId);
      else call("equipOutfit", charId, outfitId);
    });
    UI.el.weaponPath.addEventListener("click", function (e) {
      const card = e.target.closest("[data-equip-tier]");
      if (!card) return;
      TP.audio.sfx("click");
      call("equipWeapon", Number(card.getAttribute("data-equip-tier")));
    });
    UI.el.weaponPath.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      const card = e.target.closest("[data-equip-tier]");
      if (!card) return;
      e.preventDefault();
      TP.audio.sfx("click");
      call("equipWeapon", Number(card.getAttribute("data-equip-tier")));
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
     VESTIÁRIO / ROUPAS
     ============================================================ */
  function outfitKey(charId, outfitId) { return charId + ":" + outfitId; }

  function outfitList(charId) {
    return TP.DATA.OUTFITS[charId] || [];
  }

  function outfitDef(charId, outfitId) {
    const list = outfitList(charId);
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === outfitId) return list[i];
    }
    return null;
  }

  function outfitOwned(charId, outfitId) {
    const def = outfitDef(charId, outfitId);
    if (!def) return false;
    if (def.price <= 0) return true;
    return !!UI.wardrobe.owned[outfitKey(charId, outfitId)];
  }

  function equippedOutfitId(charId) {
    const wanted = UI.wardrobe.equipped[charId];
    return outfitDef(charId, wanted) ? wanted : "base";
  }

  function withOutfit(char, outfitId) {
    const def = outfitDef(char.id, outfitId || equippedOutfitId(char.id)) || outfitList(char.id)[0] || null;
    const clothed = {};
    Object.keys(char).forEach(function (key) { clothed[key] = char[key]; });
    const palette = {};
    Object.keys(char.palette || {}).forEach(function (key) { palette[key] = char.palette[key]; });
    if (def && def.colors) {
      Object.keys(def.colors).forEach(function (key) { palette[key] = def.colors[key]; });
    }
    const bonus = def && def.bonus ? def.bonus : null;
    clothed.palette = palette;
    clothed.outfitId = def ? def.id : "base";
    clothed.outfitName = def ? def.name : "Traje de Estrada";
    clothed.outfitBonus = bonus;
    clothed.outfitFx = def ? (def.fx || null) : null;
    clothed.outfitFinal = !!(def && def.final);
    clothed.outfitDesc = def ? def.desc : "";
    clothed.outfitPrice = def ? def.price : 0;
    clothed.maxHp = def && def.maxHp ? def.maxHp : (char.hp || 100);
    clothed.hp = clothed.maxHp;
    clothed.damageMul = (char.damageMul || 1) * (1 + (bonus && bonus.damage ? bonus.damage : 0));
    clothed.damageTaken = (char.damageTaken || 1) * (1 - (bonus && bonus.defense ? bonus.defense : 0));
    clothed.speed = (char.speed || 0) * (1 + (bonus && bonus.speed ? bonus.speed : 0));
    return clothed;
  }

  function saveWardrobe() {
    accountStorageSet(WARDROBE_KEY, JSON.stringify(UI.wardrobe));
  }

  function loadWardrobe() {
    let stored = null;
    try {
      stored = JSON.parse(accountStorageGet(WARDROBE_KEY) || "null");
    } catch (err) {
      stored = null;
    }
    const owned = stored && stored.owned && typeof stored.owned === "object" ? stored.owned : {};
    const equipped = stored && stored.equipped && typeof stored.equipped === "object" ? stored.equipped : {};
    UI.wardrobe = { owned: {}, equipped: {} };
    TP.DATA.CHARACTERS.forEach(function (char) {
      outfitList(char.id).forEach(function (outfit) {
        if (outfit.price <= 0 || owned[outfitKey(char.id, outfit.id)]) {
          UI.wardrobe.owned[outfitKey(char.id, outfit.id)] = true;
        }
      });
      const wanted = equipped[char.id];
      if (wanted && outfitOwned(char.id, wanted)) {
        UI.wardrobe.equipped[char.id] = wanted;
      }
    });
  }

  function outfitBonusLabel(def) {
    if (!def) return "Sem bônus de combate.";
    if (def.final || def.maxHp) return "250 de vida máxima. Sem outro bônus.";
    const b = def.bonus;
    if (!b) return "Sem bônus de combate.";
    const parts = [];
    if (b.damage) parts.push("+" + Math.round(b.damage * 100) + "% de dano");
    if (b.speed) parts.push("+" + Math.round(b.speed * 100) + "% de velocidade");
    if (b.defense) parts.push("+" + Math.round(b.defense * 100) + "% de defesa");
    return parts.length ? parts.join(" · ") : "Sem bônus de combate.";
  }

  /* ============================================================
     ARSENAL PERSISTENTE POR HERÓI
     ============================================================ */
  function armoryDefault(char) {
    const cls = char.weaponClass;
    const owned = {};
    owned[cls + ":0"] = true;
    return { cls: cls, tier: 0, owned: owned };
  }

  function normalizeArmory(char, raw) {
    const cls = char.weaponClass;
    const list = TP.DATA.WEAPONS[cls] || [];
    const owned = {};
    owned[cls + ":0"] = true;
    if (raw && raw.owned && typeof raw.owned === "object") {
      Object.keys(raw.owned).forEach(function (key) {
        if (!raw.owned[key]) return;
        const parts = key.split(":");
        if (parts[0] !== cls) return;
        const tier = Number(parts[1]);
        if (Number.isInteger(tier) && tier >= 0 && tier < list.length) owned[key] = true;
      });
    }
    let tier = raw && Number.isInteger(raw.tier) ? raw.tier : 0;
    if (!owned[cls + ":" + tier]) tier = 0;
    return { cls: cls, tier: tier, owned: owned };
  }

  function loadArmory() {
    let stored = null;
    try {
      stored = JSON.parse(accountStorageGet(ARMORY_KEY) || "null");
    } catch (err) {
      stored = null;
    }
    UI.armory = {};
    TP.DATA.CHARACTERS.forEach(function (char) {
      UI.armory[char.id] = normalizeArmory(char, stored && stored[char.id]);
    });
  }

  function saveArmoryStore() {
    accountStorageSet(ARMORY_KEY, JSON.stringify(UI.armory));
  }

  UI.armoryFor = function (charId) {
    const char = TP.DATA.CHARACTERS.find(function (c) { return c.id === charId; });
    if (!char) return null;
    if (!UI.armory[charId]) UI.armory[charId] = armoryDefault(char);
    return UI.armory[charId];
  };

  UI.saveArmoryFor = function (charId, owned, cls, tier) {
    const char = TP.DATA.CHARACTERS.find(function (c) { return c.id === charId; });
    if (!char) return false;
    UI.armory[charId] = normalizeArmory(char, { owned: owned, cls: cls, tier: tier });
    saveArmoryStore();
    return true;
  };

  /* ============================================================
     CARTEIRA PERSISTENTE POR HERÓI
     ============================================================ */
  function loadWallet() {
    let stored = null;
    try {
      stored = JSON.parse(accountStorageGet(WALLET_KEY) || "null");
    } catch (err) {
      stored = null;
    }
    UI.wallet = {};
    TP.DATA.CHARACTERS.forEach(function (char) {
      const value = stored && Number(stored[char.id]);
      UI.wallet[char.id] = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
    });
  }

  function saveWalletStore() {
    accountStorageSet(WALLET_KEY, JSON.stringify(UI.wallet));
  }

  UI.walletFor = function (charId) {
    return Math.max(0, Math.floor(Number(UI.wallet[charId]) || 0));
  };

  UI.setWalletFor = function (charId, value) {
    if (!TP.DATA.CHARACTERS.some(function (c) { return c.id === charId; })) return false;
    UI.wallet[charId] = Math.max(0, Math.floor(Number(value) || 0));
    saveWalletStore();
    return true;
  };
  UI.saveWalletFor = UI.setWalletFor;

  function rebuildCharacterCards() {
    if (!UI.el.charGrid) return;
    UI.charsBuilt = false;
    buildCharacterCards();
    if (UI.selectedChar) UI.updateCharacterSelection(UI.selectedChar);
  }

  UI.outfitList = outfitList;
  UI.getOutfit = outfitDef;
  UI.outfitOwned = outfitOwned;
  UI.equippedOutfitId = equippedOutfitId;
  UI.characterWithOutfit = withOutfit;
  UI.outfitBonusLabel = outfitBonusLabel;
  UI.outfitCount = function (charId) {
    return outfitList(charId).filter(function (outfit) {
      return outfitOwned(charId, outfit.id);
    }).length;
  };
  UI.heroLoadout = function (charId) {
    const base = TP.DATA.CHARACTERS.find(function (c) { return c.id === charId; });
    if (!base) return null;
    const char = withOutfit(base);
    const armory = UI.armoryFor(charId);
    const weapon = TP.DATA.WEAPONS[char.weaponClass][armory.tier] || TP.DATA.WEAPONS[char.weaponClass][0];
    return { base: base, char: char, armory: armory, weapon: weapon, wallet: UI.walletFor(charId) };
  };
  UI.refreshCharacterCards = rebuildCharacterCards;

  UI.markOutfitOwned = function (charId, outfitId) {
    if (!outfitDef(charId, outfitId)) return false;
    UI.wardrobe.owned[outfitKey(charId, outfitId)] = true;
    UI.wardrobe.equipped[charId] = outfitId;
    saveWardrobe();
    rebuildCharacterCards();
    return true;
  };

  UI.setOutfitEquipped = function (charId, outfitId) {
    if (!outfitOwned(charId, outfitId)) return false;
    UI.wardrobe.equipped[charId] = outfitId;
    saveWardrobe();
    rebuildCharacterCards();
    return true;
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
    UI.hideInteractPrompt();
    UI.clearToasts();
  };
  UI.showHUD = function (show) {
    UI.el.hud.classList.toggle("hidden", !show);
    if (!show) UI.hideInteractPrompt();
  };
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

    const quest = TP.DATA.QUESTS.find(function (q) { return q.id === level.def.quest; });
    const questState = quest && run.quests ? run.quests[quest.id] : null;
    const questKey = questState ? (questState.complete ? 2 : questState.accepted ? 1 : 0) : 0;
    const key = p.char.id + ":" + p.hp + ":" + p.maxHp + ":" + p.weapon.cls + ":" + p.weapon.tier + ":" + run.coins + ":" + run.memories + ":" +
      level.index + ":" + (level.bossActive ? 1 : 0) + ":" + (level.boss ? Math.ceil(level.boss.hp) : 0) + ":" + questKey;
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
    UI.el.memories.textContent = run.memories + " / " + (run.memoryGoal || (run.act === 2 ? 30 : 15)) + " memórias";
    UI.el.coins.textContent = formatCoins(run.coins);
    if (UI.el.hudQuest) {
      if (quest) {
        UI.el.hudQuest.classList.remove("hidden");
        if (questState && questState.complete) {
          UI.el.hudQuest.innerHTML = '<span class="hud-quest-mark">✦</span> Tarefa concluída · +' + formatCoins(quest.reward) + ' moedas';
          UI.el.hudQuest.className = "hud-quest done";
        } else if (questState && questState.accepted) {
          UI.el.hudQuest.innerHTML = '<span class="hud-quest-mark">!</span> Derrotar ' + esc(quest.target.name);
          UI.el.hudQuest.className = "hud-quest active";
        } else {
          UI.el.hudQuest.innerHTML = '<span class="hud-quest-mark">!</span> Falar com ' + esc(quest.npc.name);
          UI.el.hudQuest.className = "hud-quest";
        }
      } else {
        UI.el.hudQuest.classList.add("hidden");
      }
    }

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
    UI.el.charGrid.innerHTML = chars.map(function (base) {
      const loadout = UI.heroLoadout(base.id);
      const c = loadout.char;
      const armory = loadout.armory;
      const w = loadout.weapon;
      const wc = TP.DATA.WEAPON_CLASSES[c.weaponClass];
      const g = gradeClass(c.grade);
      const speed = Math.max(1, Math.min(5, Math.round((c.speed / 2.5) * 5)));
      const weight = Math.max(1, Math.min(5, Math.round((c.weight / 8) * 5)));
      const fxStyle = c.outfitFx ? ' style="--fx-color:' + c.outfitFx.color + ';--fx-glow:' + c.outfitFx.glow + '"' : "";
      return '<button class="char-card' + (c.outfitFinal ? " final-outfit" : "") + '" type="button" role="listitem" data-char="' + c.id + '"' + fxStyle + '>' +
        '<div class="card-portrait" style="background-image:url(\'' + art.makePortrait(c) + '\')"></div>' +
        '<div class="card-body">' +
          '<div class="char-name">' + esc(c.name) + '</div>' +
          '<div class="char-epithet">' + esc(c.epithet) + '</div>' +
          '<div class="card-meta"><span class="char-grade ' + g + '">GRAU ' + esc(c.grade) + '</span><span>' + c.maxHp + ' VIDA</span>' +
            '<span class="char-wallet" title="Carteira de ' + esc(c.name) + '"><i class="coin-dot"></i>' + formatCoins(loadout.wallet) + '</span></div>' +
          '<div class="char-outfit">TRAJE · <b>' + esc(c.outfitName) + '</b></div>' +
          '<div class="char-stats">' +
            '<div class="stat-line"><span>Passo</span><span class="stat-track"><i style="width:' + (speed * 20) + '%"></i></span></div>' +
            '<div class="stat-line"><span>Peso</span><span class="stat-track"><i style="width:' + (weight * 20) + '%"></i></span></div>' +
          '</div>' +
          '<div class="char-weapon"><b>' + esc(w.name) + '</b>' + esc(rarLabel(w)) + ' · ' + w.dmg + ' dano · ' + esc(w.speed) + ' · alcance ' + esc((wc.rangeLabel || "curto").toLowerCase()) + '</div>' +
          '<div class="char-passive"><strong>' + esc(c.passive) + '</strong> ' + esc(c.passiveText) + '</div>' +
          '<p class="char-blurb">' + esc(c.blurb) + '</p>' +
          '<p class="char-quote">' + esc(c.quote) + '</p>' +
        '</div>' +
        '<span class="char-sigil" style="background-image:url(\'' + art.makeWeaponIcon(c.weaponClass, armory.tier) + '\')" aria-hidden="true"></span>' +
      '</button>';
    }).join("");
    UI.charsBuilt = true;
  }

  UI.showCharacters = function () {
    buildCharacterCards();
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
    const loadout = UI.heroLoadout(c.id);
    const cc = loadout.char;
    const w = loadout.weapon;
    const outfit = UI.getOutfit(c.id, equippedOutfitId(c.id));
    UI.el.charNote.innerHTML = '<strong>' + esc(c.name) + '</strong> · ' + esc(c.classLabel) +
      ' · <strong>' + cc.maxHp + ' de vida</strong> · arma <strong>' + esc(w.name) + '</strong> (' + esc(rarLabel(w)) + ') · traje <strong>' +
      esc(outfit ? outfit.name : "Traje de Estrada") + '</strong> · <strong>' + formatCoins(loadout.wallet) + ' moedas</strong>. ' +
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
    const loadout = UI.heroLoadout(c.id);
    const d = TP.DATA.DIFFICULTIES.find(function (x) { return x.id === UI.selectedDiff; });
    UI.el.diffHeroNote.innerHTML = "Herói: <strong>" + esc(c.name) + "</strong> · " +
      esc(TP.DATA.WEAPON_CLASSES[c.weaponClass].name) + " <strong>" + esc(rarLabel(loadout.weapon)) + "</strong> · " +
      "<strong>" + loadout.char.maxHp + " de vida</strong> · traje <strong>" + esc(loadout.char.outfitName) + "</strong> · " +
      formatCoins(loadout.wallet) + " moedas." +
      (d ? " Dificuldade: <strong>" + esc(d.name + " — " + d.label) + "</strong>." : " Escolha a dificuldade.");
  };

  /* ============================================================
     DIÁLOGO
     ============================================================ */
  UI.showDialogue = function (lines, onDone, speaker) {
    if (!lines || !lines.length) { if (onDone) onDone(); return; }
    const sp = speaker || { name: "Pedro", role: "narrador e ferreiro" };
    const portrait = sp.portrait || art.makePedro();
    UI.el.dialogueName.innerHTML = esc(sp.name) + (sp.role ? ' <span>' + esc(sp.role) + '</span>' : "");
    UI.el.dialoguePortrait.style.backgroundImage = "url('" + portrait + "')";
    UI.el.dialogue.setAttribute("aria-label", sp.name + (sp.role ? ", " + sp.role : ""));
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
     INTERAÇÃO COM NPCS
     ============================================================ */
  UI.showInteractPrompt = function (npc) {
    if (!npc) { UI.hideInteractPrompt(); return; }
    if (UI.interactNpc && UI.interactNpc.id === npc.id) return;
    UI.interactNpc = npc;
    if (UI.el.interactText) UI.el.interactText.textContent = "FALAR COM " + String(npc.name || "NPC").toUpperCase();
    if (UI.el.interactPrompt) UI.el.interactPrompt.classList.remove("hidden");
    if (UI.el.touchInteract) {
      UI.el.touchInteract.classList.toggle("hidden", !(TP.input && TP.input.hasTouch));
    }
  };

  UI.hideInteractPrompt = function () {
    UI.interactNpc = null;
    if (UI.el.interactPrompt) UI.el.interactPrompt.classList.add("hidden");
    if (UI.el.touchInteract) UI.el.touchInteract.classList.add("hidden");
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
    UI.wardrobeChar = data.char.id;
    UI.wardrobeSelected = UI.equippedOutfitId(data.char.id);
    UI.clearToasts();
    UI.showScreen("screen-camp");
    UI.showHUD(false);
    UI.showTouch(false);
    UI.refreshCamp();
  };

  function effectLabel(effect) {
    if (effect === "burn") return "Incendeia o alvo por alguns segundos.";
    if (effect === "lifesteal") return "Rouba um pouco de vida a cada acerto.";
    if (effect === "spirit") return "Libera uma onda espiritual no golpe.";
    if (effect === "eternal") return "Incendeia o alvo e devolve vida a cada acerto.";
    return "Sem efeito elemental — só aço e intenção.";
  }

  function bossForDropTier(tier) {
    const levels = TP.DATA.LEVELS;
    for (let i = 0; i < levels.length; i++) {
      const boss = TP.DATA.BOSSES[levels[i].bossKey];
      if (boss && boss.dropTier === tier) return { boss: boss, level: levels[i] };
    }
    return null;
  }

  UI.refreshCamp = function () {
    const d = UI.camp;
    if (!d) return;
    const char = d.char;
    const cls = d.weaponClass || char.weaponClass;
    const weapons = TP.DATA.WEAPONS[cls];
    const tier = d.tier;
    const cur = weapons[tier];
    let highestOwned = 0;
    weapons.forEach(function (w, i) {
      if (d.owned && d.owned[cls + ":" + i]) highestOwned = i;
    });
    const nextTier = highestOwned + 1;
    const next = nextTier < weapons.length ? weapons[nextTier] : null;
    const ownedCount = weapons.filter(function (w, i) {
      return !!(d.owned && d.owned[cls + ":" + i]);
    }).length;
    UI.el.campKicker.textContent = d.kicker || "ACAMPAMENTO";
    UI.el.campTitle.textContent = d.title || "A Forja de Pedro";
    UI.el.campCoins.textContent = formatCoins(d.coins);
    UI.el.campSpeech.textContent = d.speech;
    UI.el.campHint.textContent = d.hint || "";
    UI.el.forgeClass.textContent = TP.DATA.WEAPON_CLASSES[cls].name + " · " + char.name;
    UI.el.forgeCurrent.textContent = rarLabel(cur);

    const wardrobeOpen = UI.campTab === "wardrobe";
    UI.el.campForgePanel.classList.toggle("hidden", wardrobeOpen);
    UI.el.campWardrobePanel.classList.toggle("hidden", !wardrobeOpen);
    UI.el.campTabs.querySelectorAll("[data-camp-tab]").forEach(function (tab) {
      const active = tab.getAttribute("data-camp-tab") === UI.campTab;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });

    UI.el.weaponPath.innerHTML = weapons.map(function (w, i) {
      const owned = !!(d.owned && d.owned[cls + ":" + i]);
      const canEquip = owned && i !== tier;
      let cardCls = "wp-card";
      if (i === tier) cardCls += " owned current";
      else if (owned) cardCls += " owned";
      else if (i === nextTier) cardCls += " next";
      else cardCls += " locked";
      if (canEquip) cardCls += " equippable";
      const badge = i === tier ? '<span class="wp-badge">ATUAL</span>' : owned ? '<span class="wp-badge">OBTIDA</span>' : i === nextTier ? '<span class="wp-badge">CHEFE</span>' : "";
      const equipHint = canEquip ? '<span class="wp-equip">EQUIPAR</span>' : "";
      const attrs = canEquip ? ' data-equip-tier="' + i + '" role="button" tabindex="0"' : "";
      return '<div class="' + cardCls + '"' + attrs + '>' + badge +
        '<img src="' + art.makeWeaponIcon(cls, i) + '" alt="' + esc(w.name) + '">' +
        '<div class="wp-rarity rarity-text ' + w.rarity + '">' + esc(rarLabel(w)) + '</div>' +
        '<div class="wp-name">' + esc(w.name) + '</div>' +
        '<div class="wp-stat">' + w.dmg + ' dano · ' + esc(w.speed) + '</div>' +
        equipHint +
      '</div>';
    }).join("");

    const nextBoss = next ? bossForDropTier(nextTier) : null;
    let forgeBody = "";
    if (d.weaponDrop) {
      forgeBody += '<div class="camp-loot"><span>ARMA DO CHEFE</span><b>' + esc(d.weaponDrop.name) + '</b> · ' +
        esc(d.weaponDrop.rarityLabel || rarLabel(d.weaponDrop)) + ' · equipada automaticamente.</div>';
    }
    if (next) {
      forgeBody +=
        'Próximo drop: <b>' + esc(next.name) + '</b> · ' + esc(rarLabel(next)) +
        ' · <b>' + next.dmg + ' dano</b> · ' + esc(next.speed) + '.<br>' + esc(next.desc) +
        '<div class="forge-diff"><span>Efeito: ' + esc(effectLabel(next.effect)) + '</span><span>Peso: ' + next.weight + '</span></div>' +
        (nextBoss ? '<div class="forge-drop-source">O <b>' + esc(nextBoss.boss.name) + '</b> deixa esta arma na Fase ' +
          esc(nextBoss.level.numeral) + '. Nenhuma moeda é necessária.</div>' : '');
    } else {
      forgeBody += '<b>' + esc(weapons[highestOwned].name) + '</b> é o último degrau da sua classe. ' +
        'Ela já não pede mais nada a Pedro — só a você.';
      if (tier !== highestOwned) forgeBody += '<br>Equipada agora: <b>' + esc(cur.name) + '</b>.';
    }
    UI.el.forgeNext.innerHTML = forgeBody;

    let action = "";
    if (next) {
      action += '<span class="forge-price">ARMA DE CHEFE · SEM CUSTO</span>' +
        (nextBoss ? '<span class="forge-price">PRÓXIMO: ' + esc(nextBoss.boss.name.toUpperCase()) + '</span>' : "");
    } else {
      action += '<span class="forge-price">' + esc(rarLabel(weapons[highestOwned]).toUpperCase()) + ' · ' + weapons[highestOwned].dmg + ' DANO</span>';
    }
    if (ownedCount > 1) action += '<span class="forge-price">CLIQUE EM UMA ARMA OBTIDA PARA EQUIPAR</span>';
    UI.el.forgeAction.innerHTML = action;

    refreshWardrobe(d);

    UI.el.campContinue.textContent = d.continueLabel || "SEGUIR VIAGEM";
    UI.el.campContinue.innerHTML = esc(d.continueLabel || "SEGUIR VIAGEM") + ' <span>›</span>';
    UI.updateSoundLabels();
  };

  function refreshWardrobe(d) {
    const chars = TP.DATA.CHARACTERS;
    let charId = UI.wardrobeChar;
    if (!TP.DATA.OUTFITS[charId]) charId = d.char.id;
    UI.wardrobeChar = charId;
    const char = chars.find(function (c) { return c.id === charId; }) || d.char;
    const outfits = UI.outfitList(charId);
    if (!outfits.some(function (o) { return o.id === UI.wardrobeSelected; })) {
      UI.wardrobeSelected = UI.equippedOutfitId(charId);
    }
    UI.el.wardrobeCharTabs.innerHTML = chars.map(function (c) {
      const worn = withOutfit(c);
      const count = UI.outfitCount(c.id);
      const total = UI.outfitList(c.id).length;
      const active = c.id === charId;
      const shortName = c.name.replace(/^O /, "");
      const wallet = UI.walletFor(c.id);
      return '<button class="shop-class-tab wardrobe-char-tab' + (active ? " active" : "") + '" type="button"' +
        ' data-wardrobe-char="' + c.id + '" role="tab" aria-selected="' + (active ? "true" : "false") + '"' +
        ' aria-label="Roupas de ' + esc(c.name) + ', ' + formatCoins(wallet) + ' moedas" title="' + esc(c.name) + ' · ' + formatCoins(wallet) + ' moedas">' +
        '<img src="' + art.makePortrait(worn) + '" alt="">' +
        '<span>' + esc(shortName) + '</span>' +
        '<small>' + count + '/' + total + '</small>' +
        '<small class="wardrobe-tab-wallet"><i class="coin-dot"></i>' + formatCoins(wallet) + '</small>' +
      '</button>';
    }).join("");

    const equippedId = UI.equippedOutfitId(charId);
    const equipped = UI.getOutfit(charId, equippedId) || outfits[0];
    UI.el.wardrobeCurrent.textContent = equipped ? equipped.name : "Traje inicial";

    UI.el.wardrobeGrid.innerHTML = outfits.map(function (outfit) {
      const owned = UI.outfitOwned(charId, outfit.id);
      const equippedNow = equippedId === outfit.id;
      const selected = UI.wardrobeSelected === outfit.id;
      let cardCls = "wp-card shop-card outfit-card";
      if (owned) cardCls += " owned";
      if (equippedNow) cardCls += " equipped";
      if (selected) cardCls += " selected";
      if (outfit.final) cardCls += " final-outfit";
      const fxStyle = outfit.fx ? ' style="--fx-color:' + outfit.fx.color + ';--fx-glow:' + outfit.fx.glow + '"' : "";
      const badge = equippedNow ? "EM USO" : owned ? "SEU" : outfit.final ? "TRAJE FINAL" : "À VENDA";
      const preview = withOutfit(char, outfit.id);
      const priceLine = owned ? (equippedNow ? "Vestido agora" : "Desbloqueado") : formatCoins(outfit.price) + ' moedas';
      return '<button class="' + cardCls + '" type="button" data-wardrobe-outfit="' + outfit.id + '" aria-pressed="' + (selected ? "true" : "false") + '"' + fxStyle + '>' +
        '<span class="wp-badge">' + badge + '</span>' +
        (outfit.final ? '<span class="wp-badge final-badge">250 VIDA</span>' : "") +
        '<div class="outfit-portrait" style="background-image:url(\'' + art.makePortrait(preview) + '\')"></div>' +
        '<div class="wp-name">' + esc(outfit.name) + '</div>' +
        '<div class="wp-stat">' + priceLine + '</div>' +
        '<div class="wp-bonus">' + esc(outfitBonusLabel(outfit)) + '</div>' +
      '</button>';
    }).join("");

    const selected = UI.getOutfit(charId, UI.wardrobeSelected) || outfits[0];
    if (!selected) return;
    const owned = UI.outfitOwned(charId, selected.id);
    const equippedNow = equippedId === selected.id;
    const isActiveHero = charId === d.char.id;
    const activeWallet = UI.walletFor(d.char.id);
    const heroWallet = UI.walletFor(charId);
    const shortName = char.name.replace(/^O /, "");
    const bonusBlock = selected.final
      ? '<div class="outfit-bonus final"><span>TRAJE FINAL</span><b>250 DE VIDA MÁXIMA</b><small>Sem outro bônus de combate.</small></div>'
      : '<div class="outfit-bonus">' + esc(outfitBonusLabel(selected)) + '</div>';
    UI.el.wardrobeDetail.innerHTML =
      '<b>' + esc(selected.name) + '</b> · ' + (selected.price > 0 ? formatCoins(selected.price) + ' moedas' : 'traje inicial') +
      '.<br>' + esc(selected.desc) +
      bonusBlock +
      '<div class="forge-diff"><span>Herói: ' + esc(char.name) + '</span>' +
      '<span>' + (owned ? 'Já está no vestiário' : 'Compra única') + '</span>' +
      '<span>Saldo de ' + esc(shortName) + ': ' + formatCoins(heroWallet) + ' moedas</span></div>' +
      (isActiveHero ? "" : '<div class="wardrobe-lock">Jogue com <b>' + esc(char.name) + '</b> para comprar ou equipar este traje.</div>');

    const attrs = ' data-wardrobe-char="' + charId + '" data-wardrobe-outfit="' + selected.id + '"';
    if (!isActiveHero) {
      UI.el.wardrobeAction.innerHTML = '<span class="forge-price">SALDO DE ' + esc(shortName.toUpperCase()) + ': ' + formatCoins(heroWallet) + ' MOEDAS</span>' +
        '<button class="btn" type="button" disabled>JOGUE COM ' + esc(shortName.toUpperCase()) + '</button>';
    } else if (equippedNow) {
      UI.el.wardrobeAction.innerHTML = '<span class="forge-price">VESTIDO AGORA</span>' +
        '<button class="btn" type="button" disabled>EM USO</button>';
    } else if (owned) {
      UI.el.wardrobeAction.innerHTML = '<span class="forge-price">JÁ DESBLOQUEADO</span>' +
        '<button class="btn btn-primary" type="button" data-wardrobe-act="equip"' + attrs + '>VESTIR <span>›</span></button>';
    } else if (activeWallet >= selected.price) {
      UI.el.wardrobeAction.innerHTML = '<span class="forge-price">CUSTO: ' + formatCoins(selected.price) + '</span>' +
        '<button class="btn btn-primary" type="button" data-wardrobe-act="buy"' + attrs + '>' +
        (selected.final ? "COMPRAR TRAJE FINAL" : "COMPRAR E VESTIR") + ' <span>›</span></button>';
    } else {
      UI.el.wardrobeAction.innerHTML = '<span class="forge-price missing">FALTAM ' + formatCoins(selected.price - activeWallet) + ' MOEDAS</span>' +
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
    const isAct2 = run.act === 2;
    const levels = TP.DATA.LEVELS.slice(0, isAct2 ? 10 : 5);
    const totalMemories = isAct2 ? 30 : 15;
    const totalQuests = isAct2 ? 10 : 5;
    let foundTotal = 0;
    let questsDone = 0;
    UI.el.journalGrid.innerHTML = levels.map(function (level, li) {
      const memories = TP.DATA.MEMORIES.slice(li * 3, li * 3 + 3);
      const quest = TP.DATA.QUESTS.find(function (q) { return q.id === level.quest; });
      const qs = quest && run.quests ? run.quests[quest.id] : null;
      const qDone = !!(qs && qs.complete);
      if (qDone) questsDone++;
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
      const questCard = quest
        ? '<article class="journal-quest ' + (qDone ? "done" : qs && qs.accepted ? "active" : "") + '" role="listitem">' +
            '<span class="jq-mark">' + (qDone ? "✦" : "!") + '</span>' +
            '<div><h4>Tarefa de ' + esc(quest.npc.name) + ' <small>' + esc(quest.npc.role) + '</small></h4>' +
              '<p>' + (qDone
                ? 'Alvo derrotado. Recompensa de ' + formatCoins(quest.reward) + ' moedas recebida.'
                : qs && qs.accepted
                  ? 'Derrote ' + esc(quest.target.name) + ' para receber ' + formatCoins(quest.reward) + ' moedas.'
                  : 'Fale com ' + esc(quest.npc.name) + ' em ' + esc(level.name) + ' para aceitar.') + '</p>' +
              '<span class="jq-status">' + (qDone ? "Concluída" : qs && qs.accepted ? "Em andamento" : "Não iniciada") +
                ' · ' + formatCoins(quest.reward) + ' moedas</span>' +
            '</div>' +
          '</article>'
        : "";
      foundTotal += foundInLevel;
      return '<section class="journal-group">' +
        '<header class="journal-group-head">' +
          '<span class="jg-numeral">' + esc(level.numeral) + '</span>' +
          '<h3>' + esc(level.name) + '</h3>' +
          '<span class="jg-count">' + foundInLevel + ' / 3</span>' +
        '</header>' +
        '<div class="journal-list">' + questCard + cards + '</div>' +
      '</section>';
    }).join("");

    UI.el.journalCount.textContent = foundTotal + " / " + totalMemories + " memórias · " + questsDone + " / " + totalQuests + " tarefas";
    UI.el.journalNote.textContent = foundTotal >= totalMemories
      ? (isAct2
        ? "Pedro não precisa mais procurar. As trinta memórias estão inteiras, e o Ato II pode terminar sem esquecer nada."
        : "Pedro não precisa mais procurar. A história está inteira. As tarefas de fase pagam moedas a cada jornada.")
      : foundTotal === 0
        ? "Nenhuma memória ainda. A terra guarda o que você ainda não sabe. As tarefas de fase pagam moedas a cada jornada."
        : (isAct2
          ? "As memórias do Ato II continuam a história. As tarefas de fase pagam moedas a cada jornada."
          : "As memórias não aumentam seu poder. Elas mudam o que você pode dizer no fim. As tarefas de fase pagam moedas.");
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
    UI.el.endingResultView.classList.remove("act2");
    if (UI.el.endingAct2) UI.el.endingAct2.classList.add("hidden");
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

  UI.showEndingResult = function (key, ending, run, note, tone, options) {
    const act2 = !!(options && options.act2);
    UI.el.endingChoiceView.classList.add("hidden");
    UI.el.endingResultView.classList.remove("hidden");
    UI.el.endingResultView.classList.toggle("act2", act2);
    UI.el.endingResultKicker.textContent = act2 ? "FINAL DO ATO II" : tone === "gold" ? "FINAL VERDADEIRO" : "FINAL";
    UI.el.endingResultTitle.textContent = ending.title;
    UI.el.endingResultText.innerHTML = ending.text.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join(" ");
    UI.el.endingResultNote.innerHTML = note || "";
    if (UI.el.endingAct2) {
      const canContinue = !act2 && run && run.act === 1;
      UI.el.endingAct2.classList.toggle("hidden", !canContinue);
      UI.el.endingAct2.disabled = !canContinue;
    }
    void key;
  };

  UI.resetEnding = function () {
    UI.el.endingChoiceView.classList.remove("hidden");
    UI.el.endingResultView.classList.add("hidden");
    UI.el.endingResultView.classList.remove("act2");
    if (UI.el.endingAct2) UI.el.endingAct2.classList.add("hidden");
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
