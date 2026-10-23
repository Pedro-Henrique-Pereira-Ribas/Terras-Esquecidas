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
    levelCardTimer: null,
    lastHud: "",
    lastProgress: -1,
    lastGateLevel: -1
  };
  TP.ui = UI;

  const SCREEN_IDS = ["screen-title", "screen-characters", "screen-difficulty", "screen-how",
    "screen-camp", "screen-pause", "screen-journal", "screen-gameover", "screen-ending"];

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
      campContinue: q("btn-camp-continue"),
      endingChoiceView: q("ending-choice-view"), endingResultView: q("ending-result-view"),
      endingMemories: q("ending-memories"), endingCoins: q("ending-coins"), endingCls: q("ending-cls"),
      endingTrue: q("btn-ending-true"), trueNote: q("true-choice-note"),
      endingResultKicker: q("ending-result-kicker"), endingResultTitle: q("ending-result-title"),
      endingResultText: q("ending-result-text"), endingResultNote: q("ending-result-note"),
      journalGrid: q("journal-grid"), journalCount: q("journal-count"), journalNote: q("journal-note"),
      touch: q("touch-controls")
    };

    // Retratos de Pedro via data URL gerada pelo canvas.
    const pedro = art.makePedro();
    document.querySelectorAll(".pedro-portrait").forEach(function (el) {
      el.style.backgroundImage = "url('" + pedro + "')";
    });

    bindButtons();
    buildCharacterCards();
    buildDifficultyCards();
    updateSoundLabels();

    const touchButtons = Array.from(document.querySelectorAll("#touch-controls [data-action]"));
    if (TP.input && TP.input.bindTouch) TP.input.bindTouch(touchButtons);
    if (TP.input && TP.input.hasTouch) UI.el.touch.classList.remove("hidden");
  };

  /* ============================================================
     BOTÕES
     ============================================================ */
  function call(name, arg) {
    if (TP.game && typeof TP.game[name] === "function") return TP.game[name](arg);
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

    const key = p.char.id + ":" + p.hp + ":" + p.weapon.tier + ":" + run.coins + ":" + run.memories + ":" +
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
      esc(c.weaponClass === "sword" ? "Espada" : c.weaponClass === "bow" ? "Arco" : c.weaponClass === "axe" ? "Machado" : "Cajado") +
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
    UI.clearToasts();
    UI.showScreen("screen-camp");
    UI.showHUD(false);
    UI.showTouch(false);
    UI.refreshCamp();
  };

  UI.refreshCamp = function () {
    const d = UI.camp;
    if (!d) return;
    const char = d.char;
    const weapons = TP.DATA.WEAPONS[char.weaponClass];
    const tier = d.tier;
    const cur = weapons[tier];
    const next = tier < 3 ? weapons[tier + 1] : null;
    UI.el.campKicker.textContent = d.kicker || "ACAMPAMENTO";
    UI.el.campTitle.textContent = d.title || "A Forja de Pedro";
    UI.el.campCoins.textContent = d.coins;
    UI.el.campSpeech.textContent = d.speech;
    UI.el.campHint.textContent = d.hint || "";
    UI.el.forgeClass.textContent = TP.DATA.WEAPON_CLASSES[char.weaponClass].name + " · " + char.name;
    UI.el.forgeCurrent.textContent = rarLabel(cur);

    UI.el.weaponPath.innerHTML = weapons.map(function (w, i) {
      let cls = "wp-card";
      if (i === tier) cls += " owned";
      else if (i === tier + 1) cls += " next";
      else if (i > tier + 1) cls += " locked";
      const badge = i === tier ? '<span class="wp-badge">ATUAL</span>' : i === tier + 1 ? '<span class="wp-badge">PRÓXIMA</span>' : "";
      const buy = i === tier + 1 ? ' data-buy-tier="' + i + '"' : "";
      return '<button class="' + cls + '" type="button"' + buy + '>' + badge +
        '<img src="' + art.makeWeaponIcon(char.weaponClass, i) + '" alt="' + esc(w.name) + '">' +
        '<div class="wp-rarity rarity-text ' + w.rarity + '">' + esc(rarLabel(w)) + '</div>' +
        '<div class="wp-name">' + esc(w.name) + '</div>' +
        '<div class="wp-stat">' + w.dmg + ' dano · ' + esc(w.speed) + '</div>' +
      '</button>';
    }).join("");

    if (next) {
      let effect = "";
      if (next.effect === "burn") effect = "Incendeia o alvo por alguns segundos.";
      else if (next.effect === "lifesteal") effect = "Rouba um pouco de vida a cada acerto.";
      else if (next.effect === "spirit") effect = "Libera uma onda espiritual no golpe.";
      else effect = "Sem efeito elemental — só aço e intenção.";
      const missing = Math.max(0, next.upgrade - d.coins);
      const can = d.coins >= next.upgrade;
      UI.el.forgeNext.innerHTML =
        'Próximo degrau: <b>' + esc(next.name) + '</b> · ' + esc(rarLabel(next)) +
        ' · <b>' + next.dmg + ' dano</b> · ' + esc(next.speed) + '.<br>' + esc(next.desc) +
        '<div class="forge-diff"><span>Efeito: ' + esc(effect) + '</span><span>Peso: ' + next.weight + '</span></div>';
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
    UI.el.campContinue.textContent = d.continueLabel || "SEGUIR VIAGEM";
    UI.el.campContinue.innerHTML = esc(d.continueLabel || "SEGUIR VIAGEM") + ' <span>›</span>';
    UI.updateSoundLabels();
  };

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
