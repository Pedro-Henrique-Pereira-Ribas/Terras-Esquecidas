/* ============================================================
   TERRA PERDIDA — fluxo, combate e jornada
   ============================================================ */
(function () {
  "use strict";
  const TP = (window.TP = window.TP || {});
  const DATA = TP.DATA;
  const W = 640, H = 360, GROUND_Y = 320, GRAV = 0.52, MAX_FALL = 12;

  const state = {
    mode: "title",
    time: 0,
    selectedChar: null,
    selectedDiff: null,
    run: null,
    level: null,
    player: null,
    camera: { x: 0, shake: 0 },
    projectiles: [],
    particles: [],
    floaters: [],
    hitFlash: 0,
    bossIntro: 0,
    flowTimer: null,
    last: 0,
    acc: 0,
    endingTone: "dark",
    campData: null,
    campContext: null,
    nearNpc: null,
    enchantNpc: null,
    deathTimer: 0
  };
  TP.state = state;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function approach(v, t, s) { return v < t ? Math.min(v + s, t) : Math.max(v - s, t); }
  function sign(v) { return v < 0 ? -1 : 1; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function irand(a, b) { return Math.floor(rand(a, b + 1)); }
  function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function getWeapon(char, tier, cls) {
    const weaponClass = cls || char.weaponClass;
    const w = DATA.WEAPONS[weaponClass][tier];
    const rar = DATA.RARITIES[w.rarity];
    return {
      name: w.name, rarity: w.rarity, rarityLabel: rar.label, tier: w.tier,
      dmg: w.dmg, speed: w.speed, cooldown: w.cooldown, weight: w.weight,
      effect: w.effect, desc: w.desc,
      className: DATA.WEAPON_CLASSES[weaponClass].name,
      cls: weaponClass
    };
  }

  function weaponKey(cls, tier) { return cls + ":" + tier; }

  function ownsWeapon(run, cls, tier) {
    return !!(run && run.ownedWeapons && run.ownedWeapons[weaponKey(cls, tier)]);
  }

  function equipRunWeapon(run, cls, tier) {
    if (!ownsWeapon(run, cls, tier)) return false;
    run.weaponClass = cls;
    run.weaponTier = tier;
    if (state.player) state.player.weapon = getWeapon(run.char, tier, cls);
    return true;
  }

  function saveWallet(run) {
    if (!run || !run.char) return;
    TP.ui.saveWalletFor(run.char.id, run.coins);
  }

  function addCoins(run, amount) {
    if (!run) return;
    run.coins += amount;
    saveWallet(run);
  }

  function spendCoins(run, amount) {
    if (!run) return false;
    if (run.coins < amount) return false;
    run.coins -= amount;
    saveWallet(run);
    return true;
  }

  function enchantBonus(run, type) {
    if (!run || !run.enchantments || run.enchantments.enabled === false) return 0;
    const owned = run.enchantments.owned || {};
    let total = 0;
    DATA.ENCHANTMENTS.forEach(function (def) {
      if (owned[def.id] && def.type === type) total += def.value;
    });
    return total;
  }

  function persistArmory(run) {
    if (!run || !run.char) return;
    TP.ui.saveArmoryFor(run.char.id, run.ownedWeapons, run.weaponClass, run.weaponTier);
  }

  function createQuestState() {
    const quests = {};
    DATA.QUESTS.forEach(function (quest) {
      quests[quest.id] = { accepted: false, complete: false, targetDead: false };
    });
    return quests;
  }

  function dropBossWeapon(run, boss) {
    const tier = boss.cfg.dropTier;
    if (tier == null || !run) return null;
    const cls = run.weaponClass;
    const def = DATA.WEAPONS[cls] && DATA.WEAPONS[cls][tier];
    if (!def || ownsWeapon(run, cls, tier)) return null;
    // Drops seguem a progressão: nenhum chefe entrega um degrau saltado.
    if (tier > 0 && !ownsWeapon(run, cls, tier - 1)) return null;
    run.ownedWeapons[weaponKey(cls, tier)] = true;
    equipRunWeapon(run, cls, tier);
    persistArmory(run);
    const rar = DATA.RARITIES[def.rarity];
    return {
      name: def.name,
      rarity: def.rarity,
      rarityLabel: rar ? rar.label : "Rara",
      tier: tier,
      cls: cls,
      className: DATA.WEAPON_CLASSES[cls].name
    };
  }

  function joinRewards(parts) {
    if (!parts.length) return "";
    if (parts.length === 1) return parts[0];
    return parts.slice(0, -1).join(", ") + " e " + parts[parts.length - 1];
  }

  function syncCamp() {
    const run = state.run;
    if (!run || !state.campData) return;
    saveWallet(run);
    state.campData.weaponClass = run.weaponClass;
    state.campData.tier = run.weaponTier;
    state.campData.coins = run.coins;
    state.campData.owned = run.ownedWeapons;
    TP.ui.camp = state.campData;
    TP.ui.refreshCamp();
  }

  const G = {
    getMode: function () { return state.mode; },
    init: init,
    showAccountGate: showAccountGate,
    showTitle: showTitle,
    showCharacters: showCharacters,
    selectCharacter: selectCharacter,
    showDifficulty: showDifficulty,
    selectDifficulty: selectDifficulty,
    showHow: showHow,
    beginJourney: beginJourney,
    togglePause: togglePause,
    openJournal: openJournal,
    restartPhase: restartPhase,
    returnToTitle: returnToTitle,
    continueFromCheckpoint: continueFromCheckpoint,
    buyOutfit: buyOutfit,
    equipOutfit: equipOutfit,
    equipWeapon: equipWeapon,
    openEnchantShop: openEnchantShop,
    closeEnchant: closeEnchant,
    buyEnchantment: buyEnchantment,
    toggleEnchantments: toggleEnchantments,
    enchantBonus: enchantBonus,
    campContinue: campContinue,
    chooseEnding: chooseEnding,
    continueToAct2: continueToAct2,
    newJourney: newJourney
  };
  TP.game = G;

  function init() {
    TP.ui.init();
    TP.input.bindCanvas(document.getElementById("game"));
    TP.renderer.init(document.getElementById("game"));
    showTitle();
    state.last = 0;
    state.acc = 0;
    requestAnimationFrame(loop);
  }

  function loop(ts) {
    if (!state.last) state.last = ts;
    let dt = ts - state.last;
    state.last = ts;
    if (dt > 100) dt = 100;
    state.acc += dt;
    let guard = 0;
    while (state.acc >= 16.666 && guard < 6) {
      update();
      state.acc -= 16.666;
      guard++;
    }
    TP.renderer.draw(state);
    requestAnimationFrame(loop);
  }

  function update() {
    state.time++;
    TP.input.poll();

    if (TP.input.pausePressed) {
      if (state.mode === "enchant") closeEnchant();
      else if (state.mode === "playing" || state.mode === "paused") togglePause();
    }

    if (state.mode === "title" && TP.input.advancePressed) {
      showCharacters();
    }

    if (state.mode === "playing") {
      updatePlaying();
    } else if (state.mode === "dying") {
      updateDying();
    } else if (state.mode === "cutscene") {
      updateParticles();
      if (state.level) updateCamera();
    } else if (state.mode === "dialogue") {
      // O mundo fica congelado, mas a fogueira e as partículas continuam vivas.
    }

    if (state.flowTimer) {
      state.flowTimer.t--;
      if (state.flowTimer.t <= 0) {
        const fn = state.flowTimer.fn;
        state.flowTimer = null;
        fn();
      }
    }

    if (state.level && state.mode !== "camp" && state.mode !== "enchant" && state.mode !== "ending" && state.mode !== "endingText" && state.mode !== "title") {
      if (state.mode === "playing") TP.ui.setHUD({ player: state.player, run: state.run, level: state.level });
      else TP.ui.setHUD({ player: state.player, run: state.run, level: state.level });
    }

    TP.input.consume();
  }

  function after(frames, fn) {
    state.flowTimer = { t: frames, fn: fn };
  }
  function clearFlow() { state.flowTimer = null; }

  /* ============================================================
     FLUXO DE TELAS
     ============================================================ */
  function resetFlowState() {
    clearFlow();
    state.level = null;
    state.player = null;
    state.run = null;
    state.projectiles = [];
    state.particles = [];
    state.floaters = [];
    state.hitFlash = 0;
    state.bossIntro = 0;
    state.campData = null;
    state.campContext = null;
    state.nearNpc = null;
    state.endingTone = "dark";
    state.camera.x = 0;
    state.camera.shake = 0;
    TP.ui.showHUD(false);
    TP.ui.showTouch(false);
    TP.ui.showGameOver(false);
    TP.ui.hideDialogue(false);
    TP.ui.hideLevelCard();
    document.body.classList.remove("playing");
  }

  function showAccountGate() {
    resetFlowState();
    state.mode = "account";
    TP.ui.hideScreens();
    TP.ui.showScreen("screen-account");
    TP.ui.refreshAccountGate();
    TP.ui.updateSoundLabels();
    if (TP.audio) TP.audio.startTheme(0);
  }

  function showTitle() {
    resetFlowState();
    state.mode = "title";
    TP.ui.hideScreens();
    TP.ui.showScreen("screen-title");
    TP.ui.resetEnding();
    TP.ui.refreshCharacterCards();
    TP.ui.updateSoundLabels();
    TP.ui.renderAccountBadge();
    if (TP.audio) TP.audio.startTheme(0);
  }

  function showCharacters() {
    if (state.mode === "title" || state.mode === "characters" || state.mode === "difficulty") {
      state.mode = "characters";
      TP.ui.hideScreens();
      TP.ui.showScreen("screen-characters");
      TP.ui.showHUD(false);
      TP.ui.showTouch(false);
      TP.ui.updateCharacterSelection(state.selectedChar);
      if (TP.audio && TP.audio.ctx) TP.audio.sfx("click");
    }
  }

  function selectCharacter(id) {
    if (!DATA.CHARACTERS.some(function (c) { return c.id === id; })) return;
    state.selectedChar = id;
    TP.ui.updateCharacterSelection(id);
  }

  function showDifficulty() {
    if (!state.selectedChar) { showCharacters(); return; }
    state.mode = "difficulty";
    TP.ui.selectedChar = state.selectedChar;
    TP.ui.showDifficulty();
    TP.ui.updateDifficultySelection(state.selectedDiff);
    TP.ui.updateDiffHeroNote();
  }

  function selectDifficulty(id) {
    if (!DATA.DIFFICULTIES.some(function (d) { return d.id === id; })) return;
    state.selectedDiff = id;
    TP.ui.selectedDiff = id;
    TP.ui.updateDifficultySelection(id);
    TP.ui.updateDiffHeroNote();
  }

  function showHow() {
    state.mode = "how";
    TP.ui.hideScreens();
    TP.ui.showScreen("screen-how");
    TP.ui.showHUD(false);
    TP.ui.showTouch(false);
  }

  function beginJourney() {
    const baseChar = DATA.CHARACTERS.find(function (c) { return c.id === state.selectedChar; });
    const diff = DATA.DIFFICULTIES.find(function (d) { return d.id === state.selectedDiff; });
    if (!baseChar || !diff) return;
    const char = TP.ui.characterWithOutfit ? TP.ui.characterWithOutfit(baseChar) : baseChar;
    const armory = TP.ui.armoryFor(char.id);
    const ownedWeapons = {};
    Object.keys(armory.owned || {}).forEach(function (key) {
      if (armory.owned[key]) ownedWeapons[key] = true;
    });
    ownedWeapons[weaponKey(char.weaponClass, 0)] = true;
    const loadedTier = armory.tier != null ? armory.tier : 0;
    state.run = {
      char: char,
      diff: diff,
      playerName: TP.ui.account ? TP.ui.account.name : "Viajante",
      serverName: TP.ui.account ? TP.ui.account.server : "Reino Sem Nome",
      levelIndex: 0,
      act: 1,
      coins: TP.ui.walletFor(char.id),
      weaponClass: char.weaponClass,
      weaponTier: ownedWeapons[weaponKey(char.weaponClass, loadedTier)] ? loadedTier : 0,
      ownedWeapons: ownedWeapons,
      memories: 0,
      memoryGoal: 15,
      memoryIds: [],
      checkpoints: {},
      bossCoins: [false, false, false, false, false, false, false, false, false, false],
      finalCoinClaimed: false,
      finalForgeDone: false,
      lastDrop: null,
      deaths: 0,
      quests: createQuestState(),
      enchantments: TP.ui.enchantmentsFor(char.id),
      startedAt: state.time,
      ending: null,
      act1Ending: null,
      act2Ending: null
    };
    state.campData = null;
    state.campContext = null;
    state.nearNpc = null;
    state.enchantNpc = null;
    state.selectedDiff = diff.id;
    TP.audio.init();
    startLevel(0, false);
  }

  function createRunPlayer(run, x, y) {
    const char = run.char;
    const weapon = getWeapon(char, run.weaponTier, run.weaponClass);
    const maxHp = char.maxHp || char.hp || 100;
    const p = {
      char: char,
      weapon: weapon,
      x: x, y: y, w: 20, h: 36,
      vx: 0, vy: 0, facing: 1,
      hp: maxHp, maxHp: maxHp,
      onGround: false, jumpsLeft: char.maxJumps,
      jumpBuffer: 0, coyote: 0,
      attackCd: 0, attackTimer: 0, attackDuration: 16, attackHitDone: false,
      dashCd: 0, dashTimer: 0, invuln: 0,
      anim: 0, moving: false, locked: false, dead: false,
      respawnX: x, respawnY: y
    };
    return p;
  }

  function startLevel(index, restart) {
    const run = state.run;
    if (!run) return;
    run.levelIndex = index;
    state.mode = "cutscene";
    clearFlow();
    state.projectiles = [];
    state.particles = [];
    state.floaters = [];
    state.hitFlash = 0;
    state.bossIntro = 0;
    state.campData = null;
    state.campContext = null;
    state.nearNpc = null;
    state.enchantNpc = null;
    buildLevel(index);
    TP.ui.hideScreens();
    TP.ui.showHUD(true);
    TP.ui.showGameOver(false);
    TP.ui.hideDialogue(false);
    TP.ui.invalidateHUD();
    TP.audio.startTheme(index);
    document.body.classList.add("playing");

    if (restart) {
      state.mode = "playing";
      TP.ui.hideLevelCard();
      TP.ui.showTouch(true);
      return;
    }

    TP.ui.showTouch(false);
    const level = state.level;
    const token = state.level.token;
    TP.ui.showLevelCard(level, function () {
      if (!state.level || state.level.token !== token) return;
      state.mode = "dialogue";
      const lines = formatLines(level.def.intro, run);
      TP.ui.showDialogue(lines, function () {
        if (!state.level || state.level.token !== token) return;
        state.mode = "playing";
        TP.ui.showTouch(true);
        TP.ui.hideDialogue(false);
      });
    });
  }

  function formatLines(lines, run) {
    return lines.map(function (s) {
      return s.replace(/\{hero\}/g, run.char.name).replace(/\{class\}/g, run.char.classLabel);
    });
  }

  /* ============================================================
     CONSTRUÇÃO DAS FASES
     ============================================================ */
  let levelToken = 0;
  function buildLevel(index) {
    const def = DATA.LEVELS[index];
    const run = state.run;
    const diff = run.diff;
    const gaps = (def.groundGaps || []).slice().sort(function (a, b) { return a[0] - b[0]; });
    const grounds = [];
    let cursor = 0;
    for (let i = 0; i < gaps.length; i++) {
      const g = gaps[i];
      if (g[0] > cursor) grounds.push({ x: cursor, y: GROUND_Y, w: g[0] - cursor, h: 52 });
      cursor = Math.max(cursor, g[1]);
    }
    if (cursor < def.width) grounds.push({ x: cursor, y: GROUND_Y, w: def.width - cursor, h: 52 });

    const platforms = (def.platforms || []).map(function (p) {
      return { x: p.x, y: p.y, w: p.w, h: 16 };
    });
    const spikes = (def.spikes || []).map(function (s) {
      return { x: s.x, y: s.y, w: s.w, h: 12 };
    });
    const checkpoints = (def.checkpoints || []).map(function (cp, i) {
      const key = index + ":" + i;
      return {
        x: cp.x, y: GROUND_Y, index: i, key: key,
        lit: !!run.checkpoints[key]
      };
    });
    const memories = (def.memories || []).map(function (m, i) {
      const overall = index * 3 + i;
      const info = DATA.MEMORIES[overall];
      return {
        x: m.x, y: m.y, index: overall, info: info,
        taken: run.memoryIds.indexOf(info.id) >= 0, bob: i * 13
      };
    });
    const heals = (def.heals || []).map(function (h) { return { x: h.x, y: h.y, taken: false }; });

    const questDef = DATA.QUESTS.find(function (q) { return q.id === def.quest; }) || null;
    const questState = questDef && run.quests ? run.quests[questDef.id] : null;
    let questNpc = null;
    let questTarget = null;
    if (questDef) {
      questNpc = {
        id: questDef.id,
        questId: questDef.id,
        name: questDef.npc.name,
        role: questDef.npc.role,
        kind: questDef.npc.kind,
        palette: questDef.npc.palette,
        x: questDef.npc.x,
        y: GROUND_Y - 34,
        w: 20,
        h: 34
      };
      if (!questState || (!questState.targetDead && !questState.complete)) {
        questTarget = createEnemy({
          type: questDef.target.type,
          x: questDef.target.x,
          y: questDef.target.y,
          range: questDef.target.range,
          hpMul: questDef.target.hpMul,
          dmgMul: questDef.target.dmgMul,
          palette: questDef.target.palette,
          name: questDef.target.name,
          questId: questDef.id,
          questTarget: true
        }, index, diff);
      }
    }

    const merchantDef = def.merchant ? DATA.MERCHANTS[def.merchant] : null;
    let merchantNpc = null;
    if (merchantDef) {
      merchantNpc = {
        id: "merchant_" + merchantDef.id,
        merchantId: merchantDef.id,
        name: merchantDef.name,
        role: merchantDef.role,
        kind: merchantDef.kind,
        style: merchantDef.style,
        palette: merchantDef.palette,
        x: merchantDef.x,
        y: GROUND_Y - 34,
        w: 20,
        h: 34,
        stock: (merchantDef.stock || []).slice(),
        speech: merchantDef.speech,
        prompt: merchantDef.prompt,
        touchLabel: merchantDef.touchLabel,
        marker: merchantDef.marker,
        shop: true
      };
    }

    const level = {
      token: ++levelToken,
      index: index,
      def: def,
      width: def.width,
      grounds: grounds,
      platforms: platforms,
      spikes: spikes,
      checkpoints: checkpoints,
      memories: memories,
      heals: heals,
      enemies: [],
      boss: null,
      bossActive: false,
      bossDefeated: false,
      bossIntro: 0,
      arena: {
        start: def.arenaStart,
        trigger: def.arenaStart + 100,
        left: def.arenaStart + 34,
        right: def.width - 24
      },
      gateX: def.arenaStart + 20,
      questDef: questDef,
      questNpc: questNpc,
      questTarget: questTarget,
      merchantNpc: merchantNpc
    };

    (def.enemies || []).forEach(function (e) {
      level.enemies.push(createEnemy(e, index, diff));
    });
    if (questTarget) level.enemies.push(questTarget);

    // Memórias já coletadas não voltam a brilhar.
    memories.forEach(function (m) { if (m.taken) m.taken = true; });

    const respawn = run.checkpoints["respawn"] && run.checkpoints.respawn.level === index
      ? run.checkpoints.respawn
      : null;
    const spawnX = respawn ? respawn.x : 60;
    const player = createRunPlayer(run, spawnX, GROUND_Y - 36);
    player.respawnX = spawnX;
    player.respawnY = GROUND_Y - 36;
    if (respawn) player.respawnX = respawn.x;

    state.level = level;
    state.player = player;
    state.camera.x = clamp(player.x - 250, 0, Math.max(0, level.width - W));
    state.camera.shake = 0;
    state.bossIntro = 0;
  }

  function createEnemy(def, index, diff) {
    const type = def.type;
    let w = 20, h = 24;
    if (type === "flyer") { w = 24; h = 18; }
    if (type === "spitter") { w = 22; h = 24; }
    const baseHp = type === "flyer" ? 18 : type === "spitter" ? 26 : 24;
    const hpMul = def.hpMul || 1;
    const dmgMul = def.dmgMul || 1;
    const hp = Math.round((baseHp + index * 6) * diff.hpMul * hpMul);
    const dmg = (7 + index * 2.2) * diff.dmgMul * dmgMul;
    const baseY = type === "flyer" ? (def.y || 220) : GROUND_Y - h;
    return {
      type: type, x: def.x, y: baseY, baseY: baseY, w: w, h: h,
      spawnX: def.x, range: def.range || 160,
      hp: hp, maxHp: hp, damage: dmg,
      speed: (type === "flyer" ? 0.62 : type === "spitter" ? 0 : 0.58) * diff.speedMul,
      dir: -1, t: irand(0, 200), kb: 0,
      flash: 0, burn: 0, burnTick: 0, dead: false,
      cooldown: irand(60, 150), charge: 0,
      surfaceY: GROUND_Y,
      name: def.name || null,
      palette: def.palette || null,
      questId: def.questId || null,
      questTarget: !!def.questTarget
    };
  }

  function initBoss(level) {
    const run = state.run;
    const cfg = DATA.BOSSES[level.def.bossKey];
    const diff = run.diff;
    const maxHp = Math.round(cfg.hp * (diff.hpMul * 0.92 + 0.08));
    const phase2 = !!(run.finalForgeDone && cfg.final);
    const hp = phase2 ? Math.ceil(maxHp * 0.5) : maxHp;
    let y;
    // O hover e a base do sprite: o hitbox precisa terminar na mesma linha
    // para nao causar dano de contato em uma area invisivel abaixo do chefe.
    if (cfg.flying) y = (cfg.hover || 218) - cfg.h;
    else y = GROUND_Y - cfg.h;
    const b = {
      key: level.def.bossKey, cfg: cfg, x: level.arena.start + 200, y: y, w: cfg.w, h: cfg.h,
      hp: hp, maxHp: maxHp, phase: phase2 ? 2 : 1,
      state: phase2 ? "idle" : "intro", timer: phase2 ? 70 : 96,
      facing: -1, vx: 0, vy: 0, anim: 0, flash: 0, burn: 0, burnTick: 0,
      lastAttack: "", attackCount: 0, contactCd: 0, dead: false, deathTimer: 0,
      phaseTransitioned: phase2, slamPending: false, chargeDir: -1,
      hoverBase: (cfg.hover || 218), invuln: 0, summonCount: 0
    };
    level.boss = b;
    level.bossActive = true;
    level.bossIntro = phase2 ? 0 : 90;
    state.bossIntro = phase2 ? 0 : 90;
    state.player.locked = !phase2;
    TP.audio.sfx("boss");
    TP.ui.invalidateHUD();
  }

  /* ============================================================
     CAMP / FORJA
     ============================================================ */
  function showCamp(context) {
    const run = state.run;
    const char = run.char;
    const level = state.level;
    state.mode = "camp";
    TP.ui.showHUD(false);
    TP.ui.showTouch(false);
    TP.audio.startTheme(0);
    const isFinal = context.type === "finalForge";
    const nextDef = context.nextIndex != null ? DATA.LEVELS[context.nextIndex] : null;
    const dropped = context.dropped || 0;
    const weaponDrop = context.weaponDrop || null;
    let speech = isFinal
      ? "O Rei deixou cair mil moedas antes de se erguer de novo. Não pergunte como. A forja está aberta, o vestiário também, e o trono ainda espera."
      : level.def.camp + (dropped ? "  O chefe deixou " + fmt(dropped) + " moedas entre as pedras." : "");
    if (weaponDrop) speech += "  A arma " + weaponDrop.name + " veio junto.";
    state.campContext = context;
    state.campData = {
      type: context.type,
      char: char,
      weaponClass: run.weaponClass,
      tier: run.weaponTier,
      owned: run.ownedWeapons,
      coins: run.coins,
      weaponDrop: weaponDrop,
      speech: speech,
      kicker: isFinal ? "ENTRE O REI E A COROA" : "ACAMPAMENTO · " + level.def.name.toUpperCase(),
      title: isFinal ? "A Última Forja" : "A Forja de Pedro",
      hint: isFinal
        ? "As armas vêm dos chefes. No vestiário, as moedas viram roupas para os heróis. O Rei espera do outro lado da fogueira."
        : (nextDef ? "Próxima parada: " + nextDef.name + ". As armas caem dos chefes; as moedas compram roupas no vestiário." : ""),
      continueLabel: isFinal ? "ENFRENTAR O REI" : (nextDef ? "SEGUIR PARA " + nextDef.name.toUpperCase() : "SEGUIR VIAGEM")
    };
    TP.ui.showCamp(state.campData);
  }

  function outfitDefFor(charId, outfitId) {
    const list = DATA.OUTFITS[charId] || [];
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === outfitId) return list[i];
    }
    return null;
  }

  function applyRunOutfit(charId, outfitId) {
    const run = state.run;
    if (!run || !run.char || run.char.id !== charId) return;
    const base = DATA.CHARACTERS.find(function (c) { return c.id === charId; });
    if (!base) return;
    const clothed = TP.ui.characterWithOutfit(base, outfitId);
    const oldPlayerMax = state.player ? state.player.maxHp : 0;
    run.char.palette = clothed.palette;
    run.char.outfitId = clothed.outfitId;
    run.char.outfitName = clothed.outfitName;
    run.char.outfitBonus = clothed.outfitBonus;
    run.char.outfitFx = clothed.outfitFx;
    run.char.outfitFinal = clothed.outfitFinal;
    run.char.outfitDesc = clothed.outfitDesc;
    run.char.outfitPrice = clothed.outfitPrice;
    run.char.maxHp = clothed.maxHp;
    run.char.hp = clothed.hp;
    run.char.damageMul = clothed.damageMul;
    run.char.damageTaken = clothed.damageTaken;
    run.char.speed = clothed.speed;
    if (state.player) {
      state.player.char = run.char;
      state.player.maxHp = run.char.maxHp;
      if (state.player.maxHp > oldPlayerMax) {
        state.player.hp = Math.min(state.player.maxHp, state.player.hp + (state.player.maxHp - oldPlayerMax));
      } else {
        state.player.hp = Math.min(state.player.hp, state.player.maxHp);
      }
    }
  }

  function buyOutfit(charId, outfitId) {
    if (state.mode !== "camp" || !state.run) return;
    const run = state.run;
    if (run.char.id !== charId) {
      TP.ui.toast("Só <strong>" + run.char.name + "</strong> pode comprar e vestir o próprio traje nesta jornada.", "danger", 2600);
      return;
    }
    const char = DATA.CHARACTERS.find(function (c) { return c.id === charId; });
    const outfit = outfitDefFor(charId, outfitId);
    if (!char || !outfit) return;

    if (TP.ui.outfitOwned(charId, outfitId)) {
      equipOutfit(charId, outfitId);
      return;
    }
    if (run.coins < outfit.price) {
      TP.ui.toast("Pedro conta as moedas: “Faltam " + fmt(outfit.price - run.coins) + " para esse traje.”", "danger", 2400);
      return;
    }

    spendCoins(run, outfit.price);
    TP.ui.markOutfitOwned(charId, outfitId);
    applyRunOutfit(charId, outfitId);
    TP.audio.sfx("buy");
    TP.ui.toast('<strong>' + outfit.name + '</strong> vestido agora. A peça fica no vestiário deste navegador.', "memory", 3400);
    syncCamp();
    TP.ui.invalidateHUD();
  }

  function equipOutfit(charId, outfitId) {
    if (state.mode !== "camp" || !state.run) return;
    const run = state.run;
    if (run.char.id !== charId) {
      TP.ui.toast("Só <strong>" + run.char.name + "</strong> pode equipar o próprio traje nesta jornada.", "danger", 2400);
      return;
    }
    const char = DATA.CHARACTERS.find(function (c) { return c.id === charId; });
    const outfit = outfitDefFor(charId, outfitId);
    if (!char || !outfit || !TP.ui.outfitOwned(charId, outfitId)) return;
    if (TP.ui.equippedOutfitId(charId) === outfitId) return;

    TP.ui.setOutfitEquipped(charId, outfitId);
    applyRunOutfit(charId, outfitId);
    TP.audio.sfx("click");
    TP.ui.toast('<strong>' + outfit.name + '</strong> vestido.', "coin", 2200);
    syncCamp();
    TP.ui.invalidateHUD();
  }

  function equipWeapon(tier) {
    if (state.mode !== "camp" || !state.run) return;
    const run = state.run;
    if (!equipRunWeapon(run, run.weaponClass, tier)) {
      TP.ui.toast("Você ainda não conquistou essa arma.", "danger", 2000);
      return;
    }
    persistArmory(run);
    TP.audio.sfx("click");
    TP.ui.toast("<strong>" + getWeapon(run.char, tier, run.weaponClass).name + "</strong> equipada.", "coin", 2200);
    syncCamp();
    TP.ui.invalidateHUD();
  }

  function campContinue() {
    const ctx = state.campContext;
    if (!ctx) return;
    TP.ui.hideScreens();
    if (ctx.type === "finalForge") {
      resumeFinalBoss();
      return;
    }
    if (ctx.nextIndex != null && ctx.nextIndex < DATA.LEVELS.length) {
      startLevel(ctx.nextIndex, false);
    }
  }

  function resumeFinalBoss() {
    const level = state.level;
    const run = state.run;
    if (!level || !level.boss) { startLevel(4, false); return; }
    TP.ui.hideScreens();
    TP.ui.showHUD(true);
    TP.ui.showTouch(true);
    state.mode = "playing";
    level.boss.phase = 2;
    level.boss.state = "idle";
    level.boss.timer = 60;
    level.boss.phaseTransitioned = true;
    level.boss.invuln = 0;
    level.boss.burn = 0;
    level.boss.burnTick = 0;
    level.boss.hp = Math.max(1, Math.min(level.boss.hp, Math.ceil(level.boss.maxHp * 0.5)));
    state.player.locked = false;
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + 45);
    state.player.invuln = 60;
    state.projectiles = [];
    level.bossIntro = 0;
    state.bossIntro = 0;
    TP.audio.startTheme(4);
    TP.ui.toast("<strong>Pedro:</strong> “Não precisa ser um rei. Só precisa ser você.”", "memory", 3500);
    TP.ui.invalidateHUD();
  }

  /* ============================================================
     FIM, MORTE, PAUSA
     ============================================================ */
  function openJournal() {
    if (state.mode !== "paused" || !state.run) return;
    TP.ui.showJournal(state.run);
  }

  function togglePause() {
    if (state.mode === "playing") {
      state.mode = "paused";
      TP.ui.clearToasts();
      TP.ui.showScreen("screen-pause");
      TP.ui.showTouch(false);
      TP.ui.updateSoundLabels();
      TP.ui.updateEnchantLabels(state.run);
      TP.audio.sfx("click");
    } else if (state.mode === "paused") {
      TP.ui.hideScreens();
      state.mode = "playing";
      TP.ui.showTouch(true);
      TP.audio.sfx("click");
    }
  }

  function restartPhase() {
    if (!state.run || !state.level) return;
    TP.ui.hideScreens();
    TP.ui.showGameOver(false);
    state.mode = "cutscene";
    state.player.dead = false;
    state.player.hp = state.player.maxHp;
    startLevel(state.run.levelIndex, true);
  }

  function returnToTitle() {
    if (state.run) {
      saveWallet(state.run);
      persistArmory(state.run);
    }
    TP.ui.hideScreens();
    TP.ui.showGameOver(false);
    showTitle();
  }

  function continueFromCheckpoint() {
    if (!state.run || !state.level) { returnToTitle(); return; }
    TP.ui.hideScreens();
    TP.ui.showGameOver(false);
    respawnAtCheckpoint();
  }

  function respawnAtCheckpoint() {
    const level = state.level;
    const player = state.player;
    if (!level || !player) return;
    state.projectiles = [];
    state.particles = [];
    state.floaters = [];
    state.hitFlash = 0;
    player.dead = false;
    player.hp = player.maxHp;
    player.vx = 0; player.vy = 0;
    player.invuln = 90;
    player.locked = false;
    player.dashTimer = 0; player.dashCd = 0;
    player.attackCd = 0; player.attackTimer = 0;

    if (level.bossActive && !level.bossDefeated) {
      // Reinicia o confronto no portão da arena.
      player.x = level.arena.left + 30;
      player.y = GROUND_Y - 36;
      level.boss = null;
      level.bossActive = false;
      level.bossIntro = 0;
      state.bossIntro = 0;
      state.mode = "playing";
      TP.ui.showHUD(true);
      TP.ui.showTouch(true);
      TP.ui.invalidateHUD();
      state.camera.shake = 0;
      state.camera.x = clamp(player.x - 250, 0, Math.max(0, level.width - W));
      return;
    }

    player.x = player.respawnX;
    player.y = player.respawnY;
    // Reposiciona os inimigos vivos nos pontos iniciais, sem reviver os mortos.
    level.enemies.forEach(function (e) {
      if (e.dead) return;
      e.x = e.spawnX;
      e.y = e.baseY;
      e.hp = e.maxHp;
      e.burn = 0;
      e.flash = 0;
    });
    state.mode = "playing";
    TP.ui.showHUD(true);
    TP.ui.showTouch(true);
    TP.ui.invalidateHUD();
    state.camera.shake = 0;
    state.camera.x = clamp(player.x - 250, 0, Math.max(0, level.width - W));
    TP.ui.toast("Pedro: “Levanta. A brasa ainda está acesa.”", "memory", 2400);
  }

  function playerDied() {
    const player = state.player;
    if (!player || player.dead) return;
    player.dead = true;
    player.hp = 0;
    state.run.deaths++;
    state.mode = "dying";
    state.deathTimer = 0;
    state.hitFlash = 22;
    state.camera.shake = 8;
    state.nearNpc = null;
    TP.audio.sfx("death");
    burst(player.x + player.w / 2, player.y + player.h / 2, "#c8684b", 24, 2.4, 2, 0.12);
    burst(player.x + player.w / 2, player.y + player.h / 2, "#e9c17a", 12, 1.6, 1, 0.08);
    TP.ui.hideInteractPrompt();
    TP.ui.showTouch(false);
  }

  function updateDying() {
    state.deathTimer++;
    updateParticles();
    state.camera.shake *= 0.94;
    if (state.deathTimer === 70) {
      state.mode = "gameover";
      TP.ui.showGameOver(true);
      TP.ui.showTouch(false);
    }
  }

  /* ============================================================
     FINAIS
     ============================================================ */
  function showEndingSelection() {
    const run = state.run;
    if (!run) return;
    state.mode = "ending";
    state.endingTone = run.memories >= 15 ? "gold" : "dark";
    TP.ui.showEndingChoice(run);
    TP.audio.sfx("victory");
  }

  function chooseEnding(key) {
    const run = state.run;
    if (!run) return;
    if (key === "true" && run.memories < 15) return;
    const ending = DATA.ENDINGS[key];
    if (!ending) return;
    saveWallet(run);
    persistArmory(run);
    run.ending = key;
    run.act1Ending = key;
    state.endingTone = ending.tone;
    state.mode = "endingText";
    const note = "Jornada de <strong>" + run.char.name + "</strong> · " + run.diff.name + " — " + run.diff.label +
      " · <strong>" + run.memories + "/15</strong> memórias · <strong>" + fmt(run.coins) + "</strong> moedas restantes · " +
      run.deaths + " queda(s).";
    TP.ui.showEndingResult(key, ending, run, note, ending.tone);
    TP.audio.startTheme(key === "true" ? 4 : 0);
  }

  function showAct2Ending() {
    const run = state.run;
    if (!run) return;
    saveWallet(run);
    persistArmory(run);
    const key = run.memories >= 30 ? "act2true" : "act2";
    const ending = DATA.ENDINGS[key];
    if (!ending) return;
    run.act2Ending = key;
    state.endingTone = ending.tone;
    state.mode = "endingText";
    const note = "Jornada de <strong>" + run.char.name + "</strong> · Ato II · " + run.diff.name +
      " · <strong>" + run.memories + "/30</strong> memórias · <strong>" + fmt(run.coins) + "</strong> moedas restantes · " +
      run.deaths + " queda(s).";
    TP.ui.showEndingResult(key, ending, run, note, ending.tone, { act2: true });
    TP.audio.startTheme(ending.tone === "gold" ? 9 : 8);
  }

  function continueToAct2() {
    const run = state.run;
    if (!run || run.act !== 1 || !run.ending) return;
    saveWallet(run);
    persistArmory(run);
    run.act1Ending = run.ending;
    run.ending = null;
    run.act = 2;
    run.memoryGoal = 30;
    state.mode = "cutscene";
    TP.ui.hideScreens();
    TP.ui.resetEnding();
    TP.ui.showGameOver(false);
    startLevel(5, false);
  }

  function newJourney() {
    if (!state.run) { showTitle(); return; }
    const charId = state.run.char.id;
    const diffId = state.run.diff.id;
    saveWallet(state.run);
    persistArmory(state.run);
    state.selectedChar = charId;
    state.selectedDiff = diffId;
    TP.ui.hideScreens();
    TP.ui.showGameOver(false);
    TP.ui.resetEnding();
    beginJourney();
  }

  /* ============================================================
     ATUALIZAÇÃO DO MUNDO
     ============================================================ */
  function updatePlaying() {
    const p = state.player;
    const level = state.level;
    if (!p || !level) return;
    if (state.hitFlash > 0) state.hitFlash--;
    if (p.invuln > 0) p.invuln--;
    if (p.attackCd > 0) p.attackCd--;
    if (p.dashCd > 0) p.dashCd--;
    if (p.attackTimer > 0) p.attackTimer--;
    if (p.dashTimer > 0) p.dashTimer--;

    updatePlayerInput(p);
    if (p.dead) return;

    updatePlayerPhysics(p);
    if (p.dead) return;

    checkHazards(p);
    if (p.dead) return;

    checkPickups(p);
    updateNpcs(p, level);
    if (state.mode !== "playing") return;
    updateEnemies();
    updateBoss();
    updateProjectiles();
    updateParticles();
    updateCamera();

    if (state.bossIntro > 0) state.bossIntro--;
    if (!level.bossActive && !level.bossDefeated && p.x > level.arena.trigger) {
      initBoss(level);
    }

    if (level.boss && level.boss.dead) {
      updateBossDeath(level.boss);
    }

    if (state.camera.shake > 0.1) state.camera.shake *= 0.9;
    else state.camera.shake = 0;
  }

  function playerMoveSpeed(p) {
    const char = p.char;
    const weightPenalty = 1 - Math.max(0, p.weapon.weight - 3) * 0.018;
    return char.speed * weightPenalty;
  }

  function updatePlayerInput(p) {
    const input = TP.input;
    if (p.locked) {
      p.vx = approach(p.vx, 0, 0.6);
      p.moving = false;
      applyGravity(p, true);
      return;
    }

    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (dir !== 0) p.facing = dir;
    p.moving = dir !== 0;

    const speed = playerMoveSpeed(p) * (p.dashTimer > 0 ? 1.35 : 1);
    if (p.dashTimer > 0) {
      p.vx = p.facing * 7.4;
    } else {
      const accel = p.onGround ? 0.72 : 0.42;
      p.vx = approach(p.vx, dir * speed, accel);
      if (dir === 0 && p.onGround) p.vx = approach(p.vx, 0, 0.5);
    }

    if (p.onGround) {
      p.coyote = 6;
      p.jumpsLeft = p.char.maxJumps;
    } else if (p.coyote > 0) {
      p.coyote--;
    }

    if (input.jumpPressed) p.jumpBuffer = 7;
    if (p.jumpBuffer > 0) p.jumpBuffer--;

    if (p.jumpBuffer > 0) {
      const canGround = p.onGround || p.coyote > 0;
      if (canGround) {
        p.vy = p.char.jump;
        p.onGround = false;
        p.coyote = 0;
        p.jumpsLeft = Math.max(0, p.char.maxJumps - 1);
        p.jumpBuffer = 0;
        TP.audio.sfx("jump");
        burst(p.x + p.w / 2, p.y + p.h, "#b9a47d", 5, 1.1, 1, 0.16);
      } else if (p.jumpsLeft > 0) {
        p.vy = p.char.jump * 0.91;
        p.jumpsLeft--;
        p.jumpBuffer = 0;
        TP.audio.sfx("doublejump");
        burst(p.x + p.w / 2, p.y + p.h - 4, p.char.palette.accent, 7, 1.3, 1, 0.08);
      }
    }

    if (!input.jumpDown && p.vy < -4) p.vy += 0.3;

    if (input.dashPressed && p.dashCd <= 0 && p.dashTimer <= 0) {
      p.dashTimer = 10;
      p.dashCd = 54;
      p.invuln = Math.max(p.invuln, 10);
      p.vx = p.facing * 7.4;
      TP.audio.sfx("jump");
      burst(p.x + p.w / 2, p.y + p.h - 6, p.char.palette.accent, 8, 1.5, 1, 0.05);
    }

    if (input.attackPressed && p.attackCd <= 0 && p.attackTimer <= 0 && p.dashTimer <= 0) {
      performAttack(p);
    }

    applyGravity(p, false);
  }

  function applyGravity(p, locked) {
    if (p.dashTimer > 0) {
      p.vy = Math.min(p.vy + GRAV * 0.35, 3.2);
    } else {
      p.vy = Math.min(p.vy + GRAV, MAX_FALL);
    }
    if (locked && p.onGround) p.vy = 0;
  }

  function updatePlayerPhysics(p) {
    const level = state.level;
    const prevBottom = p.y + p.h;

    p.x += p.vx;
    // colisão horizontal com o chão maciço
    for (let i = 0; i < level.grounds.length; i++) {
      const g = level.grounds[i];
      if (p.x < g.x + g.w && p.x + p.w > g.x && p.y + p.h > g.y + 2 && p.y < g.y + g.h) {
        if (p.vx > 0) p.x = g.x - p.w;
        else if (p.vx < 0) p.x = g.x + g.w;
        p.vx = 0;
      }
    }
    p.x = clamp(p.x, 0, level.width - p.w);
    if (level.bossActive && !level.bossDefeated) {
      if (state.mode === "playing" && p.x < level.arena.left) p.x = level.arena.left;
      if (p.x + p.w > level.arena.right) p.x = level.arena.right - p.w;
    }

    p.y += p.vy;
    p.onGround = false;
    for (let i = 0; i < level.grounds.length; i++) {
      const g = level.grounds[i];
      if (p.x < g.x + g.w && p.x + p.w > g.x && p.y < g.y + g.h && p.y + p.h > g.y) {
        if (p.vy > 0) {
          p.y = g.y - p.h;
          p.vy = 0;
          p.onGround = true;
        } else if (p.vy < 0) {
          p.y = g.y + g.h;
          p.vy = 0;
        }
      }
    }

    for (let i = 0; i < level.platforms.length; i++) {
      const pl = level.platforms[i];
      if (p.vy >= 0 &&
          prevBottom <= pl.y + 6 &&
          p.y + p.h >= pl.y &&
          p.y + p.h <= pl.y + pl.h + 10 &&
          p.x + p.w > pl.x + 2 &&
          p.x < pl.x + pl.w - 2) {
        p.y = pl.y - p.h;
        p.vy = 0;
        p.onGround = true;
      }
    }

    if (p.onGround) {
      p.jumpsLeft = p.char.maxJumps;
      p.coyote = 6;
    }
    p.anim += p.moving && p.onGround ? 2.2 : 1;
    p.x = clamp(p.x, 0, level.width - p.w);

    if (p.y > H + 70) {
      fallRespawn(p);
    }
  }

  function fallRespawn(p) {
    const run = state.run;
    p.hp -= 22;
    state.hitFlash = 16;
    state.camera.shake = 5;
    if (p.hp <= 0) { playerDied(); return; }
    p.x = p.respawnX;
    p.y = p.respawnY;
    p.vx = 0; p.vy = 0;
    p.invuln = 90;
    p.onGround = false;
    p.jumpsLeft = p.char.maxJumps;
    state.camera.x = clamp(p.x - 250, 0, Math.max(0, state.level.width - W));
    TP.audio.sfx("hurt");
    TP.ui.toast("Pedro: “O chão mentiu. Respira e volta.” <strong>-22</strong>", "danger", 2200);
    if (run) run.deaths = run.deaths;
  }

  function checkHazards(p) {
    const level = state.level;
    for (let i = 0; i < level.spikes.length; i++) {
      const s = level.spikes[i];
      if (aabb(p, { x: s.x + 2, y: s.y - 4, w: s.w - 4, h: 16 })) {
        if (p.invuln <= 0) {
          hurtPlayer(10 + level.index * 2, s.x + s.w / 2);
          p.vy = -5.2;
          p.vx = (p.x + p.w / 2 < s.x + s.w / 2 ? -1 : 1) * 2.4;
        }
      }
    }
  }

  function checkPickups(p) {
    const level = state.level;
    const run = state.run;
    for (let i = 0; i < level.memories.length; i++) {
      const m = level.memories[i];
      if (m.taken) continue;
      if (Math.abs((p.x + p.w / 2) - m.x) < 22 && Math.abs((p.y + p.h / 2) - m.y) < 30) {
        m.taken = true;
        if (run.memoryIds.indexOf(m.info.id) < 0) {
          run.memoryIds.push(m.info.id);
          run.memories++;
        }
        TP.audio.sfx("memory");
        burst(m.x, m.y, "#ffe2a0", 20, 2.3, 2, 0.05);
        TP.ui.invalidateHUD();
        TP.ui.toast('<strong>MEMÓRIA — ' + m.info.name + '</strong><br>' + m.info.text, "memory", 5200);
      }
    }
    for (let i = 0; i < level.heals.length; i++) {
      const h = level.heals[i];
      if (h.taken) continue;
      if (Math.abs((p.x + p.w / 2) - h.x) < 20 && Math.abs((p.y + p.h / 2) - h.y) < 28) {
        h.taken = true;
        const amount = Math.round(26 * (state.run.diff.healMul || 1));
        p.hp = Math.min(p.maxHp, p.hp + amount);
        TP.audio.sfx("heal");
        burst(h.x, h.y, "#ff9f83", 14, 1.8, 2, 0.03);
        addFloater("+" + amount, h.x, h.y - 10, "#ffb39a");
        TP.ui.invalidateHUD();
      }
    }
    for (let i = 0; i < level.checkpoints.length; i++) {
      const cp = level.checkpoints[i];
      if (cp.lit) continue;
      if (Math.abs((p.x + p.w / 2) - cp.x) < 28 && p.y + p.h > cp.y - 50) {
        cp.lit = true;
        state.run.checkpoints[cp.key] = true;
        state.run.checkpoints.respawn = { level: level.index, x: cp.x };
        p.respawnX = cp.x;
        p.respawnY = GROUND_Y - p.h;
        p.hp = Math.min(p.maxHp, p.hp + Math.round(30 * (state.run.diff.healMul || 1)));
        p.invuln = Math.max(p.invuln, 30);
        TP.audio.sfx("checkpoint");
        burst(cp.x, cp.y - 28, "#ffb66b", 18, 1.9, 2, 0.04);
        TP.ui.toast("Descanso aceso. A memória de <strong>" + p.char.name + "</strong> está segura aqui.", "coin", 2600);
      }
    }
  }

  /* ============================================================
     ATAQUES
     ============================================================ */
  function performAttack(p) {
    const cls = p.weapon.cls;
    const classDef = DATA.WEAPON_CLASSES[cls];
    const attackSpeedBonus = enchantBonus(state.run, "attackSpeed");
    p.attackCd = Math.max(10, Math.round(p.weapon.cooldown * p.char.atkSpeedMul / (1 + attackSpeedBonus)));
    p.attackTimer = cls === "pickaxe" ? 18 : 14;
    p.attackDuration = p.attackTimer;
    p.attackHitDone = false;

    if (classDef.ranged) {
      fireProjectile(p, cls);
      TP.audio.sfx("shoot");
      burst(p.x + p.w / 2 + p.facing * 12, p.y + 18, p.weapon.rarity === "mitica" ? "#c292ff" : "#f2d49b", 4, 0.8, 1, 0.02);
    } else {
      TP.audio.sfx("attack");
      meleeHit(p, classDef);
      if (p.weapon.effect === "spirit") {
        spawnProjectile({
          x: p.x + p.w / 2 + p.facing * 22, y: p.y + 18,
          vx: p.facing * 5.2, vy: 0, kind: "spirit", owner: "player",
          damage: Math.round(playerDamage(p) * 0.55), r: 9, life: 36, maxLife: 36,
          color: "#9de0c4", pierce: 3, splash: 0, effect: "none"
        });
      }
    }
    p.attackHitDone = true;
  }

  function playerDamage(p) {
    const damageBonus = enchantBonus(state.run, "damage");
    return Math.max(1, Math.round(p.weapon.dmg * p.char.damageMul * (1 + damageBonus) * rand(0.94, 1.06)));
  }

  function meleeHit(p, classDef) {
    const reach = classDef.range;
    const box = {
      x: p.facing > 0 ? p.x + p.w - 3 : p.x - reach + 3,
      y: p.y + 4, w: reach, h: p.h - 6
    };
    const level = state.level;
    let hitAny = false;
    for (let i = 0; i < level.enemies.length; i++) {
      const e = level.enemies[i];
      if (e.dead) continue;
      if (aabb(box, { x: e.x, y: e.y, w: e.w, h: e.h })) {
        damageEnemy(e, playerDamage(p), p.facing, p);
        hitAny = true;
      }
    }
    if (level.boss && level.bossActive && !level.bossDefeated && !level.boss.dead) {
      if (aabb(box, { x: level.boss.x, y: level.boss.y, w: level.boss.w, h: level.boss.h })) {
        damageBoss(level.boss, playerDamage(p), p);
        hitAny = true;
      }
    }
    const cx = p.x + p.w / 2 + p.facing * reach * 0.55;
    burst(cx, p.y + 20, hitAny ? "#ffd18a" : "#b9a47d", hitAny ? 9 : 3, 1.8, 2, 0.14);
    if (hitAny) {
      state.camera.shake = Math.min(4, state.camera.shake + 1.2);
      TP.audio.sfx("hit");
    }
  }

  function fireProjectile(p, cls) {
    const classDef = DATA.WEAPON_CLASSES[cls];
    const originX = p.x + p.w / 2 + p.facing * 13;
    const originY = p.y + 17;
    const target = findAimTarget(p);
    let vx = p.facing * classDef.projectileSpeed;
    let vy = 0;
    if (target) {
      const dx = target.x - originX;
      const dy = target.y - originY;
      const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      vx = (dx / len) * classDef.projectileSpeed;
      vy = (dy / len) * classDef.projectileSpeed;
    } else {
      vx = p.facing * classDef.projectileSpeed;
    }
    const isBow = cls === "bow";
    const pierce = isBow && p.char.id === "arqueira" ? 1 : 0;
    const splash = cls === "staff" && p.char.id === "mago" ? 27 : 0;
    spawnProjectile({
      x: originX, y: originY, vx: vx, vy: vy,
      kind: isBow ? "arrow" : "spell", owner: "player",
      damage: playerDamage(p), r: isBow ? 4 : 6,
      life: isBow ? 80 : 100, maxLife: isBow ? 80 : 100,
      color: isBow ? "#e0c47d" : (p.weapon.rarity === "mitica" ? "#bd83ff" : "#b9a1ff"),
      pierce: pierce, splash: splash, effect: p.weapon.effect,
      falloff: classDef.falloff || null
    });
  }

  function findAimTarget(p) {
    const level = state.level;
    const px = p.x + p.w / 2, py = p.y + p.h / 2;
    let best = null, bestD = 360;
    function consider(x, y, w, h) {
      const tx = x + w / 2, ty = y + h / 2;
      const dx = tx - px;
      if (dx * p.facing < -30) return;
      const d = Math.sqrt(dx * dx + (ty - py) * (ty - py));
      if (d < bestD) { bestD = d; best = { x: tx, y: ty }; }
    }
    for (let i = 0; i < level.enemies.length; i++) {
      const e = level.enemies[i];
      if (!e.dead) consider(e.x, e.y, e.w, e.h);
    }
    if (level.boss && level.bossActive && !level.bossDefeated && !level.boss.dead) {
      consider(level.boss.x, level.boss.y, level.boss.w, level.boss.h);
    }
    return best;
  }

  /* ============================================================
     DANO
     ============================================================ */
  function hurtPlayer(amount, sourceX) {
    const p = state.player;
    if (!p || p.dead || p.invuln > 0) return;
    const dmg = Math.max(1, Math.round(amount * (p.char.damageTaken || 1)));
    p.hp -= dmg;
    p.invuln = 72;
    state.hitFlash = 14;
    state.camera.shake = Math.min(7, state.camera.shake + 3);
    TP.audio.sfx("hurt");
    addFloater("-" + dmg, p.x + p.w / 2, p.y - 4, "#ff9a82");
    burst(p.x + p.w / 2, p.y + p.h / 2, "#c95d4d", 12, 2.1, 2, 0.1);
    if (sourceX != null) {
      p.vx = (p.x + p.w / 2 < sourceX ? -1 : 1) * 2.6;
      p.vy = Math.min(p.vy, -3.4);
    }
    if (p.hp <= 0) playerDied();
  }

  function healPlayer(amount) {
    const p = state.player;
    if (!p) return;
    const before = p.hp;
    p.hp = Math.min(p.maxHp, p.hp + amount);
    if (p.hp > before) {
      addFloater("+" + Math.round(p.hp - before), p.x + p.w / 2, p.y - 6, "#a8d68c");
      TP.ui.invalidateHUD();
    }
  }

  function damageEnemy(e, dmg, dir, player) {
    if (e.dead) return;
    const dealt = Math.max(1, Math.round(dmg));
    e.hp -= dealt;
    e.flash = 7;
    e.kb = (dir || 1) * 2.2;
    addFloater(String(dealt), e.x + e.w / 2, e.y - 4, "#f6dca2");
    burst(e.x + e.w / 2, e.y + e.h / 2, "#e7b26b", 7, 1.8, 2, 0.1);
    if (player && (player.weapon.effect === "burn" || player.weapon.effect === "eternal")) {
      e.burn = 170;
      e.burnDmg = Math.max(2, Math.round(player.weapon.dmg * 0.13));
      e.burnTick = 0;
    }
    if (player && (player.weapon.effect === "lifesteal" || player.weapon.effect === "eternal")) {
      healPlayer(Math.max(1, Math.round(dealt * 0.13)));
    }
    if (e.hp <= 0) {
      e.dead = true;
      burst(e.x + e.w / 2, e.y + e.h / 2, "#c9875b", 16, 2.2, 2, 0.08);
      TP.audio.sfx("hit");
      onEnemyKilled(e);
    }
  }

  function questForId(id) {
    return DATA.QUESTS.find(function (q) { return q.id === id; }) || null;
  }

  function completeQuest(quest, qs) {
    if (!quest || !qs || qs.complete || !state.run) return;
    qs.accepted = true;
    qs.complete = true;
    addCoins(state.run, quest.reward);
    TP.audio.sfx("coin");
    TP.ui.invalidateHUD();
    TP.ui.toast("<strong>Tarefa de " + quest.npc.name + "</strong> concluída. +" +
      fmt(quest.reward) + " moedas.", "memory", 3800);
  }

  function onEnemyKilled(e) {
    if (!e || !e.questTarget || !e.questId || !state.run || !state.run.quests) return;
    const quest = questForId(e.questId);
    const qs = state.run.quests[e.questId];
    if (!quest || !qs) return;
    qs.targetDead = true;
    if (qs.accepted) {
      completeQuest(quest, qs);
    } else if (!qs.complete) {
      TP.ui.toast("O alvo de <strong>" + quest.npc.name + "</strong> caiu. Fale com " +
        quest.npc.name + " para receber a recompensa.", "memory", 3600);
    }
  }

  function npcSpeaker(quest) {
    return {
      name: quest.npc.name,
      role: quest.npc.role,
      portrait: TP.art.makeNpcPortrait ? TP.art.makeNpcPortrait(quest.npc) : null
    };
  }

  function finishNpcDialogue(token) {
    const level = state.level;
    if (!level || level.token !== token) return;
    state.mode = "playing";
    if (state.player) state.player.locked = false;
    TP.ui.showTouch(true);
    TP.ui.invalidateHUD();
  }

  function talkToNpc(npc) {
    const run = state.run;
    const level = state.level;
    if (!run || !level || !npc || state.mode !== "playing") return;
    const quest = questForId(npc.questId);
    const qs = quest && run.quests ? run.quests[quest.id] : null;
    if (!quest || !qs) return;
    const token = level.token;
    const speaker = npcSpeaker(quest);
    state.mode = "dialogue";
    state.nearNpc = null;
    if (state.player) state.player.locked = true;
    TP.ui.hideInteractPrompt();
    TP.ui.showTouch(false);

    function finish() {
      finishNpcDialogue(token);
    }

    if (qs.complete) {
      TP.ui.showDialogue([quest.lines.done], finish, speaker);
      return;
    }

    if (qs.accepted) {
      if (qs.targetDead) {
        completeQuest(quest, qs);
        TP.ui.showDialogue([quest.lines.done], finish, speaker);
      } else {
        TP.ui.showDialogue([quest.lines.active], finish, speaker);
      }
      return;
    }

    TP.ui.showDialogue(quest.lines.intro.slice(), function () {
      qs.accepted = true;
      if (qs.targetDead) {
        completeQuest(quest, qs);
        TP.ui.showDialogue([quest.lines.done], finish, speaker);
        return;
      }
      TP.ui.toast("<strong>Tarefa aceita:</strong> derrote " + quest.target.name +
        " para " + quest.npc.name + ".", "memory", 3400);
      finish();
    }, speaker);
  }

  function openEnchantShop(npc) {
    if (state.mode !== "playing" || !state.run || !npc || !npc.shop) return;
    state.mode = "enchant";
    state.nearNpc = null;
    state.enchantNpc = npc;
    if (state.player) state.player.locked = true;
    TP.ui.hideInteractPrompt();
    TP.ui.showTouch(false);
    TP.ui.showEnchant({ merchant: npc, run: state.run });
    TP.audio.sfx("click");
  }

  function closeEnchant() {
    if (state.mode !== "enchant") return;
    state.mode = "playing";
    state.enchantNpc = null;
    if (state.player) state.player.locked = false;
    TP.ui.hideScreens();
    TP.ui.showHUD(true);
    TP.ui.showTouch(true);
    TP.ui.invalidateHUD();
    TP.audio.sfx("click");
  }

  function buyEnchantment(id) {
    if (state.mode !== "enchant" || !state.run || !state.enchantNpc) return;
    const def = DATA.ENCHANTMENTS.find(function (e) { return e.id === id; }) || null;
    if (!def || (state.enchantNpc.stock || []).indexOf(id) < 0) return;
    const run = state.run;
    if (!run.enchantments) run.enchantments = TP.ui.enchantmentsFor(run.char.id);
    const ench = run.enchantments;
    if (ench.owned[id]) {
      TP.ui.toast("<strong>" + def.name + "</strong> já está gravado neste herói.", "coin", 2200);
      return;
    }
    if (run.coins < def.price) {
      TP.audio.sfx("click");
      TP.ui.toast("Faltam <strong>" + fmt(def.price - run.coins) + " moedas</strong> para este encantamento.", "danger", 2600);
      return;
    }
    spendCoins(run, def.price);
    ench.owned[id] = true;
    TP.ui.saveEnchantmentsFor(run.char.id, ench);
    TP.audio.sfx("buy");
    TP.ui.toast("<strong>" + def.name + "</strong> gravado. O bônus vale para todas as armas de " + run.char.name + ".", "memory", 3600);
    TP.ui.refreshEnchant();
    TP.ui.invalidateHUD();
  }

  function toggleEnchantments(value) {
    const run = state.run;
    if (!run) return;
    if (!run.enchantments) run.enchantments = TP.ui.enchantmentsFor(run.char.id);
    const ench = run.enchantments;
    const next = typeof value === "boolean" ? value : !ench.enabled;
    if (next === ench.enabled) return;
    ench.enabled = next;
    TP.ui.saveEnchantmentsFor(run.char.id, ench);
    TP.ui.updateEnchantLabels(run);
    if (state.mode === "enchant") {
      TP.ui.refreshEnchant();
      TP.ui.toast(next ? "Encantamentos ligados." : "Encantamentos desligados. As compras continuam salvas.", "coin", 2400);
    }
    TP.ui.invalidateHUD();
    TP.audio.sfx("click");
  }

  function npcNear(p, npc) {
    if (!npc) return false;
    const dx = Math.abs((p.x + p.w / 2) - (npc.x + npc.w / 2));
    const dy = Math.abs((p.y + p.h / 2) - (npc.y + npc.h / 2));
    return dx < 48 && dy < 42;
  }

  function npcDistance(p, npc) {
    const dx = (p.x + p.w / 2) - (npc.x + npc.w / 2);
    const dy = (p.y + p.h / 2) - (npc.y + npc.h / 2);
    return dx * dx + dy * dy;
  }

  function updateNpcs(p, level) {
    if (!state.run || p.dead) {
      state.nearNpc = null;
      TP.ui.hideInteractPrompt();
      return;
    }
    let npc = null;
    let best = Infinity;
    if (level.questNpc && state.run.quests && npcNear(p, level.questNpc)) {
      npc = level.questNpc;
      best = npcDistance(p, npc);
    }
    if (level.merchantNpc && npcNear(p, level.merchantNpc)) {
      const dist = npcDistance(p, level.merchantNpc);
      if (dist < best) {
        npc = level.merchantNpc;
        best = dist;
      }
    }
    if (!npc) {
      state.nearNpc = null;
      TP.ui.hideInteractPrompt();
      return;
    }
    state.nearNpc = npc;
    if (npc.shop) {
      TP.ui.showInteractPrompt(npc);
      if (TP.input.interactPressed) {
        TP.input.interactPressed = false;
        openEnchantShop(npc);
      }
      return;
    }
    TP.ui.showInteractPrompt(npc, state.run.quests[npc.questId]);
    if (TP.input.interactPressed) {
      TP.input.interactPressed = false;
      talkToNpc(npc);
    }
  }

  function damageBoss(b, dmg, player) {
    if (!b || b.dead || b.invuln > 0) return;
    const dealt = Math.max(1, Math.round(dmg));
    b.hp -= dealt;
    b.flash = 8;
    addFloater(String(dealt), b.x + b.w / 2, b.y - 6, "#ffe0a0");
    burst(b.x + b.w / 2, b.y + b.h / 2, "#f0bd72", 9, 2.1, 2, 0.08);
    if (player && (player.weapon.effect === "burn" || player.weapon.effect === "eternal")) {
      b.burn = 170;
      b.burnDmg = Math.max(3, Math.round(player.weapon.dmg * 0.13));
      b.burnTick = 0;
    }
    if (player && (player.weapon.effect === "lifesteal" || player.weapon.effect === "eternal")) {
      healPlayer(Math.max(1, Math.round(dealt * 0.13)));
    }
    if (b.hp <= 0) {
      if ((b.cfg.final || b.cfg.act2Final) && b.phase === 1 && !b.phaseTransitioned) {
        b.hp = 1;
      } else {
        b.hp = 0;
        killBoss(b);
        return;
      }
    }
    if (b.phase === 1 && !b.phaseTransitioned && b.hp <= b.maxHp * 0.5) {
      b.phaseTransitioned = true;
      if (b.cfg.final) {
        triggerFinalForge(b);
      } else {
        if (b.cfg.act2Final) b.hp = Math.ceil(b.maxHp * 0.5);
        b.phase = 2;
        b.state = "idle";
        b.timer = 45;
        b.flash = 22;
        state.camera.shake = 9;
        state.hitFlash = 12;
        TP.audio.sfx("boss");
        TP.ui.toast("<strong>" + b.cfg.name + "</strong> se ergue. " + b.cfg.taunt2, "danger", 3400);
        TP.ui.invalidateHUD();
      }
    }
  }

  /* ============================================================
     INIMIGOS COMUNS
     ============================================================ */
  function updateEnemies() {
    const level = state.level;
    const p = state.player;
    for (let i = 0; i < level.enemies.length; i++) {
      const e = level.enemies[i];
      if (e.dead) continue;
      e.t++;
      if (e.flash > 0) e.flash--;
      if (e.burn > 0) {
        e.burn--;
        e.burnTick++;
        if (e.burnTick >= 30) {
          e.burnTick = 0;
          e.hp -= e.burnDmg || 2;
          addFloater(String(e.burnDmg || 2), e.x + e.w / 2, e.y - 2, "#ff9b62");
          if (e.hp <= 0) {
            e.dead = true;
            burst(e.x + e.w / 2, e.y + e.h / 2, "#d97545", 10, 1.8, 2, 0.06);
            onEnemyKilled(e);
          }
        }
      }
      if (e.dead) continue;

      if (e.type === "walker") {
        const dx = (p.x + p.w / 2) - (e.x + e.w / 2);
        if (Math.abs(dx) < 290) e.dir = dx > 0 ? 1 : -1;
        e.x += e.dir * e.speed + e.kb;
        e.kb *= 0.82;
        const min = e.spawnX - e.range;
        const max = e.spawnX + e.range;
        if (e.x < min) { e.x = min; e.dir = 1; }
        if (e.x > max) { e.x = max; e.dir = -1; }
        e.y = GROUND_Y - e.h;
        if (aabb(p, e)) hurtPlayer(e.damage, e.x + e.w / 2);
      } else if (e.type === "flyer") {
        const targetX = clamp(p.x + p.w / 2 - e.w / 2, e.spawnX - e.range, e.spawnX + e.range);
        e.x = approach(e.x, targetX, e.speed * 0.55);
        e.dir = p.x < e.x ? -1 : 1;
        e.y = e.baseY + Math.sin(e.t * 0.045) * 11;
        if (aabb(p, { x: e.x, y: e.y, w: e.w, h: e.h })) hurtPlayer(e.damage, e.x + e.w / 2);
      } else {
        e.cooldown--;
        const dist = Math.abs((p.x + p.w / 2) - (e.x + e.w / 2));
        if (e.cooldown <= 0 && dist < 390) {
          e.charge = 24;
          e.cooldown = Math.max(70, 150 - level.index * 10 - (state.run.diff.id === "ruina" ? 25 : 0));
        }
        if (e.charge > 0) {
          e.charge--;
          if (e.charge === 0) {
            const ox = e.x + e.w / 2, oy = e.y + 9;
            const dx = (p.x + p.w / 2) - ox;
            const dy = (p.y + p.h / 2) - oy;
            const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
            spawnProjectile({
              x: ox, y: oy, vx: (dx / len) * 3.1, vy: (dy / len) * 3.1,
              kind: "orb", owner: "enemy", damage: e.damage * 0.9,
              r: 6, life: 160, maxLife: 160,
              color: level.def.theme === "forest" ? "#a9dd85" : level.def.theme === "mine" ? "#ff9f5a" : level.def.theme === "mountain" ? "#a9d7ef" : level.def.theme === "frontier" ? "#ff7457" : level.def.theme === "forge" ? "#ffb066" : level.def.theme === "temple" ? "#d8c58a" : level.def.theme === "desert" ? "#e8c36a" : level.def.theme === "void" ? "#b48cff" : level.def.theme === "celestial" ? "#fff0b0" : "#82d9cc"
            });
            TP.audio.sfx("shoot");
          }
        }
        if (aabb(p, { x: e.x, y: e.y, w: e.w, h: e.h })) hurtPlayer(e.damage, e.x + e.w / 2);
      }
    }
  }

  /* ============================================================
     CHEFES
     ============================================================ */
  function updateBoss() {
    const level = state.level;
    const b = level && level.boss;
    if (!b) return;
    if (b.dead) return;

    if (b.flash > 0) b.flash--;
    if (b.contactCd > 0) b.contactCd--;
    if (b.invuln > 0 && b.invuln < 99990) b.invuln--;
    b.anim++;
    if (b.burn > 0) {
      b.burn--;
      b.burnTick++;
      if (b.burnTick >= 32) {
        b.burnTick = 0;
        damageBoss(b, b.burnDmg || 3, null);
        if (b.dead) return;
      }
    }

    const p = state.player;
    const arena = level.arena;
    const dx = (p.x + p.w / 2) - (b.x + b.w / 2);

    if (b.state === "intro") {
      b.timer--;
      if (b.timer <= 0) {
        b.state = "idle";
        b.timer = 55;
        level.bossIntro = 0;
        state.bossIntro = 0;
        p.locked = false;
        TP.audio.sfx("boss");
      }
      return bossContact(b);
    }

    if (b.state === "telegraph") {
      b.timer--;
      if (dx !== 0) b.facing = dx < 0 ? -1 : 1;
      if (b.timer <= 0) executeBossAttack(b);
      return bossContact(b);
    }

    if (b.state === "recover") {
      b.timer--;
      hoverBossIdle(b, 0.25);
      if (b.timer <= 0) {
        b.state = "idle";
        b.timer = b.phase === 2 ? 45 : 70;
      }
      return bossContact(b);
    }

    if (b.state === "charge" || b.state === "dash") {
      const speed = b.state === "dash" ? 6.3 : b.cfg.speed * 4.1;
      b.vx = b.facing * speed;
      b.x += b.vx;
      if (b.x < arena.left + 6 || b.x + b.w > arena.right - 6) {
        b.x = clamp(b.x, arena.left + 6, arena.right - b.w - 6);
        b.state = "recover";
        b.timer = 25;
        b.vx = 0;
        state.camera.shake = Math.min(6, state.camera.shake + 2);
        burst(b.x + b.w / 2, b.y + b.h - 6, "#d4b178", 10, 2, 2, 0.15);
      }
      b.timer--;
      if (b.timer <= 0) {
        b.state = "recover";
        b.timer = b.phase === 2 ? 20 : 32;
        b.vx = 0;
      }
      if (b.timer % 4 === 0) {
        burst(b.x + b.w / 2 - b.facing * 18, b.y + b.h - 10, "#c9a167", 1, 0.9, 2, 0.04);
      }
      return bossContact(b);
    }

    if (b.state === "slam") {
      b.vy += 0.48;
      b.y += b.vy;
      b.x += b.vx || 0;
      b.x = clamp(b.x, arena.left + 6, arena.right - b.w - 6);
      if (b.vy > 0 && b.y + b.h >= GROUND_Y) {
        b.y = GROUND_Y - b.h;
        b.vy = 0;
        if (!b.slamPending) {
          b.slamPending = true;
          bossSlamImpact(b);
          b.state = "recover";
          b.timer = b.phase === 2 ? 28 : 42;
        }
      }
      return bossContact(b);
    }

    if (b.state === "dive") {
      b.timer--;
      const targetX = clamp(b.diveTargetX - b.w / 2, arena.left + 20, arena.right - b.w - 20);
      b.x = approach(b.x, targetX, 2.4);
      if (!b.slamPending) {
        b.y += 5.4;
        if (b.y + b.h >= GROUND_Y - 2) {
          b.y = GROUND_Y - b.h - 2;
          b.slamPending = true;
          bossSlamImpact(b);
          b.vy = -2.1;
          b.timer = Math.min(b.timer, 36);
        }
      } else {
        b.vy += 0.12;
        b.y += b.vy;
        if (b.y < b.hoverBase - b.h) {
          b.y = b.hoverBase - b.h;
          b.vy = 0;
        }
      }
      if (b.timer <= 0) {
        b.y = b.hoverBase - b.h;
        b.state = "recover";
        b.timer = b.phase === 2 ? 20 : 30;
      }
      return bossContact(b);
    }

    if (b.state === "teleport") {
      b.timer--;
      if (b.timer === 14) {
        burst(b.x + b.w / 2, b.y + b.h / 2, "#7fbd8e", 16, 2.2, 2, 0.03);
        b.oldX = b.x;
        b.x = clamp(p.x + p.w / 2 - b.w / 2 + (p.facing > 0 ? 70 : -70), arena.left + 20, arena.right - b.w - 20);
        b.y = b.hoverBase - b.h;
        burst(b.x + b.w / 2, b.y + b.h / 2, "#b8e8b4", 20, 2.4, 2, 0.02);
      }
      if (b.timer <= 0) {
        const shots = b.phase === 2 ? 8 : 5;
        const fromX = b.x + b.w / 2, fromY = b.y + b.h / 2;
        for (let i = 0; i < shots; i++) {
          const a = (i / shots) * Math.PI * 2 + rand(-0.1, 0.1);
          spawnProjectile({
            x: fromX, y: fromY, vx: Math.cos(a) * 2.7, vy: Math.sin(a) * 2.7,
            kind: "orb", owner: "enemy", damage: b.cfg.contact * 0.85 * state.run.diff.bossDmgMul,
            r: 7, life: 150, maxLife: 150, color: b.cfg.attackColor || "#9be8a8"
          });
        }
        TP.audio.sfx("shoot");
        b.state = "recover";
        b.timer = b.phase === 2 ? 24 : 36;
      }
      return bossContact(b);
    }

    if (b.state === "idle") {
      b.timer--;
      hoverBossIdle(b, 1);
      if (dx !== 0) b.facing = dx < 0 ? -1 : 1;
      if (b.timer <= 0) {
        if (b.invuln > 99990) { b.timer = 20; return; }
        b.state = "telegraph";
        b.pendingAttack = chooseBossAttack(b);
        b.timer = b.phase === 2 ? 19 : 28;
        b.slamPending = false;
        TP.audio.sfx("wave");
      }
      return bossContact(b);
    }

    bossContact(b);
  }

  function hoverBossIdle(b, amount) {
    const level = state.level;
    const p = state.player;
    const arena = level.arena;
    if (b.cfg.flying) {
      const tx = clamp(p.x + p.w / 2 - b.w / 2, arena.left + 20, arena.right - b.w - 20);
      b.x = approach(b.x, tx, 0.55 * amount);
      b.y = b.hoverBase - b.h + Math.sin(b.anim * 0.04) * 7;
    } else {
      const dx = (p.x + p.w / 2) - (b.x + b.w / 2);
      if (Math.abs(dx) > 115) b.x += sign(dx) * b.cfg.speed * 0.5 * amount;
      b.x = clamp(b.x, arena.left + 8, arena.right - b.w - 8);
      b.y = GROUND_Y - b.h;
    }
  }

  function chooseBossAttack(b) {
    let list = b.cfg.attacks.slice();
    if (b.phase === 2) {
      if (b.key === "rei") list.push("rain", "volley");
      if (b.key === "corvo") list.push("feathers");
      if (b.key === "vulto") list.push("volley");
      if (b.key === "ferrugem") list.push("acid");
      if (b.key === "colosso") list.push("volley");
      if (b.key === "titao") list.push("volley");
      if (b.key === "guardiao") list.push("pillars");
      if (b.key === "farao") list.push("rain");
      if (b.key === "imperador") list.push("volley");
      if (b.key === "arcanjo") list.push("feathers", "dash");
    }
    if (list.length > 1) {
      for (let tries = 0; tries < 6; tries++) {
        const pick = list[irand(0, list.length - 1)];
        if (pick !== b.lastAttack) return pick;
      }
    }
    return list[irand(0, list.length - 1)];
  }

  function executeBossAttack(b) {
    const level = state.level;
    const p = state.player;
    const attack = b.pendingAttack;
    const diff = state.run.diff;
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    b.lastAttack = attack;
    b.state = "recover";
    b.timer = b.phase === 2 ? 25 : 38;

    if (attack === "slam") {
      b.state = "slam";
      b.vy = -7.2;
      b.vx = 0;
      b.slamPending = false;
      b.timer = 150;
      TP.audio.sfx("jump");
      return;
    }

    if (attack === "charge") {
      b.state = "charge";
      b.vx = b.facing * b.cfg.speed * 4.1;
      b.timer = b.phase === 2 ? 58 : 45;
      TP.audio.sfx("wave");
      return;
    }

    if (attack === "dash") {
      b.state = "dash";
      b.vx = b.facing * 6.3;
      b.timer = 30;
      TP.audio.sfx("wave");
      return;
    }

    if (attack === "dive") {
      b.state = "dive";
      b.diveTargetX = p.x + p.w / 2;
      b.slamPending = false;
      b.timer = 90;
      TP.audio.sfx("wave");
      return;
    }

    if (attack === "teleport") {
      b.state = "teleport";
      b.timer = 24;
      TP.audio.sfx("wave");
      return;
    }

    if (attack === "summon") {
      const kind = b.key === "ferrugem" || b.key === "guardiao" ? "walker" : "flyer";
      spawnBossAdds(b, b.phase === 2 ? 3 : 2, kind);
      TP.audio.sfx("boss");
      return;
    }

    if (attack === "feathers") {
      const count = b.phase === 2 ? 8 : 5;
      const base = Math.atan2((p.y + 18) - cy, (p.x + p.w / 2) - cx);
      for (let i = 0; i < count; i++) {
        const a = base + (i - (count - 1) / 2) * 0.16 + rand(-0.03, 0.03);
        spawnProjectile({
          x: cx, y: cy, vx: Math.cos(a) * 3.7, vy: Math.sin(a) * 3.7,
          kind: "feather", owner: "enemy", damage: 13 * diff.bossDmgMul,
          r: 6, life: 160, maxLife: 160, color: b.cfg.attackColor || "#8fa3bd", rot: a
        });
      }
      TP.audio.sfx("shoot");
      return;
    }

    if (attack === "gust") {
      spawnBossWave(b, -1);
      spawnBossWave(b, 1);
      state.camera.shake = 5;
      TP.audio.sfx("wave");
      return;
    }

    if (attack === "slashwave") {
      spawnProjectile({
        x: cx, y: GROUND_Y - 3, vx: -4.6, vy: 0, kind: "beam", owner: "enemy",
        damage: 15 * diff.bossDmgMul, w: 16, h: 58, life: 85, maxLife: 85,
        color: b.cfg.attackColor || "#ff9a6e"
      });
      spawnProjectile({
        x: cx, y: GROUND_Y - 3, vx: 4.6, vy: 0, kind: "beam", owner: "enemy",
        damage: 15 * diff.bossDmgMul, w: 16, h: 58, life: 85, maxLife: 85,
        color: b.cfg.attackColor || "#ff9a6e"
      });
      TP.audio.sfx("wave");
      return;
    }

    if (attack === "pillars") {
      const offsets = b.phase === 2 ? [-150, -75, 0, 75, 150] : [-110, 0, 110];
      for (let i = 0; i < offsets.length; i++) {
        const px = clamp((p.x + p.w / 2) + offsets[i], level.arena.left + 20, level.arena.right - 20);
        spawnProjectile({
          x: px, y: GROUND_Y - 100, vx: 0, vy: 0, kind: "pillar", owner: "enemy",
          damage: 17 * diff.bossDmgMul, w: 32, h: 100, life: 112, maxLife: 112,
          warning: 42 + i * 5, color: b.cfg.attackColor || "#ff8d54"
        });
      }
      TP.audio.sfx("boss");
      return;
    }

    if (attack === "acid") {
      for (let i = 0; i < (b.phase === 2 ? 4 : 3); i++) {
        const tx = p.x + p.w / 2 + rand(-50, 50);
        const vx = clamp((tx - cx) / 40, -4.2, 4.2);
        spawnProjectile({
          x: cx + rand(-20, 20), y: b.y + 20, vx: vx, vy: -5.2 - rand(0, 1.2),
          gravity: 0.23, kind: "orb", owner: "enemy",
          damage: 14 * diff.bossDmgMul, r: 7, life: 150, maxLife: 150,
          color: b.cfg.attackColor || "#d6c35d"
        });
      }
      TP.audio.sfx("shoot");
      return;
    }

    if (attack === "rain") {
      for (let i = 0; i < 9; i++) {
        const rx = rand(level.arena.left + 30, level.arena.right - 30);
        spawnProjectile({
          x: rx, y: rand(-90, 10), vx: rand(-0.35, 0.35), vy: rand(2.2, 3.3),
          gravity: 0.1, kind: "rock", owner: "enemy",
          damage: 14 * diff.bossDmgMul, r: 8, life: 210, maxLife: 210,
          color: b.cfg.attackColor || "#9b8577"
        });
      }
      TP.audio.sfx("boss");
      return;
    }

    if (attack === "volley") {
      if (b.key === "colosso") {
        const count = b.phase === 2 ? 4 : 3;
        for (let i = 0; i < count; i++) {
          const targetX = p.x + p.w / 2 + (i - (count - 1) / 2) * 62;
          const vx = clamp((targetX - cx) / 42, -4.2, 4.2);
          spawnProjectile({
            x: cx, y: b.y + 24, vx: vx, vy: -5.8, gravity: 0.25,
            kind: "rock", owner: "enemy", damage: 16 * diff.bossDmgMul,
            r: 8, life: 180, maxLife: 180, color: "#9f967d"
          });
        }
      } else if (b.key === "rei") {
        const shots = b.phase === 2 ? 16 : 11;
        for (let i = 0; i < shots; i++) {
          const a = (i / shots) * Math.PI * 2 + b.anim * 0.01;
          spawnProjectile({
            x: cx, y: cy, vx: Math.cos(a) * 2.9, vy: Math.sin(a) * 2.9,
            kind: "orb", owner: "enemy", damage: 14 * diff.bossDmgMul,
            r: 7, life: 170, maxLife: 170, color: "#ff8664"
          });
        }
      } else {
        const shots = b.phase === 2 ? 7 : 5;
        const base = Math.atan2((p.y + 18) - cy, (p.x + p.w / 2) - cx);
        for (let i = 0; i < shots; i++) {
          const a = base + (i - (shots - 1) / 2) * 0.22;
          spawnProjectile({
            x: cx, y: cy, vx: Math.cos(a) * 3.2, vy: Math.sin(a) * 3.2,
            kind: "orb", owner: "enemy", damage: 13 * diff.bossDmgMul,
            r: 6, life: 160, maxLife: 160, color: b.cfg.attackColor || "#9be8a8"
          });
        }
      }
      TP.audio.sfx("shoot");
      return;
    }
  }

  function bossSlamImpact(b) {
    const cfg = b.cfg;
    const diff = state.run.diff;
    spawnBossWave(b, -1);
    spawnBossWave(b, 1);
    state.camera.shake = 10;
    state.hitFlash = Math.max(state.hitFlash, 7);
    TP.audio.sfx("explosion");
    const cx = b.x + b.w / 2;
    for (let i = 0; i < 22; i++) {
      burst(cx + rand(-b.w / 2, b.w / 2), GROUND_Y - rand(0, 14), cfg.theme === "mine" ? "#d17d4c" : "#b7a373", 1, 2.2, 2, 0.1);
    }
    void diff;
  }

  function spawnBossWave(b, dir) {
    const diff = state.run.diff;
    spawnProjectile({
      x: b.x + b.w / 2, y: GROUND_Y - 36, vx: dir * 4.2, vy: 0,
      kind: "shock", owner: "enemy", damage: 13 * diff.bossDmgMul,
      w: 38, h: 36, life: 62, maxLife: 62, color: b.cfg.attackColor || "#e6ad64"
    });
  }

  function spawnBossAdds(b, count, type) {
    const level = state.level;
    const diff = state.run.diff;
    for (let i = 0; i < count; i++) {
      const x = clamp(level.arena.left + 60 + i * 70 + rand(-20, 20), level.arena.left + 30, level.arena.right - 50);
      const child = createEnemy({ type: type, x: x, y: type === "flyer" ? 215 : undefined, range: 120 }, level.index, diff);
      child.hp = Math.max(12, Math.round(child.hp * 0.62));
      child.maxHp = child.hp;
      child.speed *= 1.1;
      level.enemies.push(child);
      burst(x + child.w / 2, child.y + child.h / 2, type === "flyer" ? "#9be8a8" : "#d19a5a", 10, 1.6, 2, 0.04);
    }
    state.camera.shake = 3;
  }

  function bossContact(b) {
    const p = state.player;
    if (!p || p.dead || b.state === "intro" || b.state === "teleport" || b.dead) return;
    if (b.contactCd > 0) return;
    if (aabb(p, { x: b.x, y: b.y, w: b.w, h: b.h })) {
      b.contactCd = 58;
      hurtPlayer(b.cfg.contact * state.run.diff.bossDmgMul, b.x + b.w / 2);
    }
  }

  function retireEnemyProjectiles() {
    // Não troque o array durante updateProjectiles: o laço ainda usa os
    // índices antigos. Marcar os projéteis mantém o array vivo e seguro.
    for (let i = 0; i < state.projectiles.length; i++) {
      const pr = state.projectiles[i];
      if (pr.owner === "enemy") {
        pr.retired = true;
        pr.life = 0;
      }
    }
  }

  function killBoss(b) {
    if (b.dead) return;
    const level = state.level;
    const run = state.run;
    b.dead = true;
    b.deathTimer = 0;
    b.flowDone = false;
    b.hp = 0;
    b.state = "dead";
    level.bossDefeated = true;
    level.bossIntro = 0;
    state.bossIntro = 0;
    state.player.locked = true;
    state.player.invuln = 999999;
    retireEnemyProjectiles();
    state.camera.shake = 12;
    state.hitFlash = 20;
    TP.audio.sfx("explosion");
    burst(b.x + b.w / 2, b.y + b.h / 2, "#ffd18a", 34, 3.2, 3, 0.08);
    burst(b.x + b.w / 2, b.y + b.h / 2, "#d05e4a", 26, 2.5, 2, 0.12);
    TP.ui.showTouch(false);
    TP.ui.invalidateHUD();
    run.lastDrop = null;

    if (b.cfg.final) {
      if (!run.finalCoinClaimed) {
        run.finalCoinClaimed = true;
        addCoins(run, 1000);
        TP.ui.toast("A coroa deixou cair <strong>1.000 moedas</strong>.", "coin", 3000);
      }
    } else {
      const rewards = [];
      if (!run.bossCoins[level.index]) {
        run.bossCoins[level.index] = true;
        addCoins(run, b.cfg.coin);
        rewards.push("<strong>" + fmt(b.cfg.coin) + " moedas</strong>");
      }
      const drop = dropBossWeapon(run, b);
      if (drop) {
        run.lastDrop = drop;
        rewards.push("<strong>" + drop.name + "</strong>");
      }
      if (rewards.length) {
        TP.audio.sfx(drop ? "memory" : "coin");
        TP.ui.toast("O chefe deixou " + joinRewards(rewards) + ".", drop ? "memory" : "coin", 3600);
      }
      TP.ui.invalidateHUD();
    }
  }

  function updateBossDeath(b) {
    if (!b || !b.dead) return;
    b.deathTimer++;
    if (b.deathTimer % 5 === 0 && b.deathTimer < 95) {
      burst(b.x + rand(10, b.w - 10), b.y + rand(10, b.h - 10), b.deathTimer % 10 === 0 ? "#ffe1a0" : "#a85a45", 2, 1.4, 2, 0.06);
      state.camera.shake = Math.max(state.camera.shake, 3);
    }
    if (b.deathTimer === 100 && !b.flowDone) {
      b.flowDone = true;
      bossVictoryFlow(b);
    }
  }

  function bossVictoryFlow(b) {
    const level = state.level;
    const run = state.run;
    if (!level || !run) return;
    state.mode = "dialogue";
    TP.ui.showTouch(false);
    state.projectiles = [];
    state.player.locked = true;
    const lines = formatLines(level.def.outro, run).concat([
      "Pedro: " + b.cfg.deathLine
    ]);
    TP.ui.showDialogue(lines, function () {
      TP.ui.hideDialogue(false);
      if (b.cfg.act2Final) {
        showAct2Ending();
      } else if (b.cfg.final) {
        showEndingSelection();
      } else {
        showCamp({
          type: "afterBoss",
          nextIndex: level.index + 1,
          dropped: b.cfg.coin,
          weaponDrop: run.lastDrop
        });
      }
    });
  }

  function triggerFinalForge(b) {
    const run = state.run;
    const level = state.level;
    const token = level && level.token;
    if (!run || run.finalForgeDone) return;
    run.finalForgeDone = true;
    b.phaseTransitioned = true;
    b.hp = Math.ceil(b.maxHp * 0.5);
    b.state = "idle";
    b.timer = 9999;
    b.invuln = 999999;
    b.flash = 24;
    b.burn = 0;
    b.burnTick = 0;
    state.player.locked = true;
    state.mode = "cutscene";
    retireEnemyProjectiles();
    state.camera.shake = 11;
    state.hitFlash = 22;
    TP.audio.sfx("explosion");

    if (!run.finalCoinClaimed) {
      run.finalCoinClaimed = true;
      addCoins(run, 1000);
      TP.audio.sfx("coin");
      TP.ui.invalidateHUD();
      TP.ui.toast("O Rei se ajoelha por um instante. <strong>1.000 moedas</strong> caem da coroa.", "coin", 3600);
    }
    TP.ui.toast("<strong>Pedro:</strong> “A forja está aberta. O vestiário também. Escolha o que vai vestir para o fim.”", "memory", 4200);

    after(95, function () {
      if (!state.level || state.level.token !== token) return;
      showCamp({ type: "finalForge", dropped: 1000 });
    });
  }

  /* ============================================================
     PROJÉTEIS
     ============================================================ */
  function spawnProjectile(opts) {
    const pr = {
      x: opts.x || 0, y: opts.y || 0,
      vx: opts.vx || 0, vy: opts.vy || 0,
      kind: opts.kind || "orb", owner: opts.owner || "enemy",
      damage: opts.damage || 1, r: opts.r || 5,
      w: opts.w || (opts.r ? opts.r * 2 : 10),
      h: opts.h || (opts.r ? opts.r * 2 : 10),
      life: opts.life || 100, maxLife: opts.maxLife || opts.life || 100,
      color: opts.color || "#ffb06e", gravity: opts.gravity || 0,
      pierce: opts.pierce || 0, splash: opts.splash || 0,
      effect: opts.effect || "none", rot: opts.rot || 0,
      warning: opts.warning || 0, hitIds: {}, hitCd: 0,
      originX: opts.x || 0, originY: opts.y || 0,
      falloff: opts.falloff || null
    };
    state.projectiles.push(pr);
    return pr;
  }

  function projectileBox(pr) {
    if (pr.kind === "beam") {
      return { x: pr.x - (pr.w || 16) / 2, y: pr.y - (pr.h || 50), w: pr.w || 16, h: pr.h || 50 };
    }
    if (pr.kind === "pillar") {
      return { x: pr.x - (pr.w || 32) / 2, y: 0, w: pr.w || 32, h: GROUND_Y };
    }
    if (pr.kind === "shock") {
      return { x: pr.x - (pr.w || 36) / 2, y: pr.y, w: pr.w || 36, h: pr.h || 36 };
    }
    const r = pr.r || 6;
    return { x: pr.x - r, y: pr.y - r, w: r * 2, h: r * 2 };
  }

  function solidAt(x, y) {
    const level = state.level;
    for (let i = 0; i < level.grounds.length; i++) {
      const g = level.grounds[i];
      if (x >= g.x && x <= g.x + g.w && y >= g.y) return true;
    }
    return false;
  }

  function updateProjectiles() {
    const level = state.level;
    const p = state.player;
    const diff = state.run.diff;
    for (let i = state.projectiles.length - 1; i >= 0; i--) {
      const pr = state.projectiles[i];
      // Um chefe pode morrer no meio deste laço e aposentar projéteis.
      if (!pr) continue;
      if (pr.retired) { state.projectiles.splice(i, 1); continue; }
      pr.life--;
      if (pr.life <= 0) { state.projectiles.splice(i, 1); continue; }
      if (pr.hitCd > 0) pr.hitCd--;

      if (pr.kind === "pillar") {
        if (pr.warning > 0) {
          pr.warning--;
          if (pr.warning === 0) burst(pr.x, GROUND_Y - 20, pr.color, 15, 2.4, 2, 0.03);
          continue;
        }
        if (pr.owner === "enemy" && aabb(p, projectileBox(pr)) && pr.hitCd <= 0) {
          pr.hitCd = 50;
          hurtPlayer(pr.damage, pr.x);
        }
        if (Math.random() < 0.25) burst(pr.x + rand(-12, 12), GROUND_Y - rand(0, 60), pr.color, 1, 1, 2, -0.02);
        continue;
      }

      if (pr.kind === "shock") {
        pr.y = GROUND_Y - (pr.h || 36);
        pr.x += pr.vx;
      } else if (pr.kind === "beam") {
        pr.x += pr.vx;
      } else {
        pr.vy += pr.gravity;
        pr.x += pr.vx;
        pr.y += pr.vy;
      }

      if (pr.owner === "player") {
        if (hitFriendlyProjectile(pr)) {
          state.projectiles.splice(i, 1);
          continue;
        }
        if ((pr.kind === "arrow" || pr.kind === "spell" || pr.kind === "spirit") && solidAt(pr.x, pr.y)) {
          burst(pr.x, pr.y, pr.color, 6, 1.3, 1, 0.08);
          if (pr.splash > 0) splashDamage(pr, pr.x, pr.y, undefined, projectileDamage(pr));
          state.projectiles.splice(i, 1);
          continue;
        }
      } else {
        if (aabb(p, projectileBox(pr)) && pr.hitCd <= 0) {
          pr.hitCd = 45;
          hurtPlayer(pr.damage, pr.x);
          if (pr.kind !== "beam") {
            state.projectiles.splice(i, 1);
            continue;
          }
        }
        if ((pr.kind === "rock" || (pr.kind === "orb" && pr.gravity > 0)) && pr.y > GROUND_Y - 4) {
          burst(pr.x, GROUND_Y - 5, pr.color, 8, 1.5, 2, 0.08);
          state.projectiles.splice(i, 1);
          continue;
        }
      }

      if (pr.x < -80 || pr.x > level.width + 80 || pr.y > H + 80 || pr.y < -140) {
        state.projectiles.splice(i, 1);
      }
    }
  }

  function hitFriendlyProjectile(pr) {
    const level = state.level;
    const dmg = projectileDamage(pr);
    const effects = { weapon: { effect: pr.effect, dmg: dmg } };
    const dir = pr.vx >= 0 ? 1 : -1;

    for (let i = 0; i < level.enemies.length; i++) {
      const e = level.enemies[i];
      if (e.dead) continue;
      if (pr.hitIds["e" + i]) continue;
      if (aabb(projectileBox(pr), { x: e.x, y: e.y, w: e.w, h: e.h })) {
        pr.hitIds["e" + i] = true;
        damageEnemy(e, dmg, dir, effects);
        burst(pr.x, pr.y, pr.color, 7, 1.8, 2, 0.06);
        TP.audio.sfx("hit");
        if (pr.splash > 0) splashDamage(pr, e.x + e.w / 2, e.y + e.h / 2, i, dmg);
        if (pr.pierce > 0) { pr.pierce--; return false; }
        return true;
      }
    }

    const b = level.boss;
    if (b && level.bossActive && !level.bossDefeated && !b.dead && !pr.hitIds.boss) {
      if (aabb(projectileBox(pr), { x: b.x, y: b.y, w: b.w, h: b.h })) {
        pr.hitIds.boss = true;
        damageBoss(b, dmg, effects);
        burst(pr.x, pr.y, pr.color, 9, 2.1, 2, 0.05);
        TP.audio.sfx("hit");
        if (pr.splash > 0) splashDamage(pr, b.x + b.w / 2, b.y + b.h / 2, undefined, dmg);
        if (pr.pierce > 0) { pr.pierce--; return false; }
        return true;
      }
    }
    return false;
  }

  /* Dano por distância: arqueira brilha longe; mago brilha na faixa média. */
  function projectileDamage(pr) {
    const falloff = pr.falloff;
    if (!falloff) return pr.damage;
    const dx = pr.x - pr.originX;
    const dy = pr.y - pr.originY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    let mul = 1;

    if (falloff.mode === "long") {
      const t = clamp((dist - falloff.near) / Math.max(1, falloff.far - falloff.near), 0, 1);
      mul = falloff.nearMul + (falloff.farMul - falloff.nearMul) * t;
    } else if (dist <= falloff.near) {
      mul = falloff.nearMul;
    } else if (dist < falloff.idealMin) {
      const t = (dist - falloff.near) / Math.max(1, falloff.idealMin - falloff.near);
      mul = falloff.nearMul + (falloff.idealMul - falloff.nearMul) * t;
    } else if (dist <= falloff.idealMax) {
      mul = falloff.idealMul;
    } else if (dist < falloff.far) {
      const t = (dist - falloff.idealMax) / Math.max(1, falloff.far - falloff.idealMax);
      mul = falloff.idealMul + (falloff.farMul - falloff.idealMul) * t;
    } else {
      mul = falloff.farMul;
    }

    return Math.max(1, Math.round(pr.damage * mul));
  }

  function splashDamage(pr, x, y, skipEnemy, damage) {
    const level = state.level;
    const radius = pr.splash;
    const baseDamage = damage == null ? pr.damage : damage;
    const effects = { weapon: { effect: pr.effect, dmg: baseDamage } };
    for (let i = 0; i < level.enemies.length; i++) {
      if (i === skipEnemy) continue;
      const e = level.enemies[i];
      if (e.dead) continue;
      const dx = (e.x + e.w / 2) - x;
      const dy = (e.y + e.h / 2) - y;
      if (dx * dx + dy * dy <= radius * radius) {
        damageEnemy(e, baseDamage * 0.5, dx < 0 ? -1 : 1, effects);
      }
    }
    const b = level.boss;
    if (b && level.bossActive && !level.bossDefeated && !b.dead) {
      const dx = (b.x + b.w / 2) - x;
      const dy = (b.y + b.h / 2) - y;
      if (dx * dx + dy * dy <= radius * radius) damageBoss(b, baseDamage * 0.55, effects);
    }
    for (let i = 0; i < 10; i++) {
      burst(x + rand(-radius, radius), y + rand(-radius, radius), pr.color, 1, 0.7, 1, 0.02);
    }
  }

  /* ============================================================
     PARTÍCULAS / NÚMEROS
     ============================================================ */
  function burst(x, y, color, count, speed, size, gravity) {
    if (state.particles.length > 650) count = Math.max(1, Math.floor(count / 3));
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2);
      const s = rand(0.2, 1) * speed;
      state.particles.push({
        x: x, y: y,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: irand(20, 48), maxLife: 48,
        size: Math.max(1, Math.round(rand(1, size + 1))),
        color: color, gravity: gravity == null ? 0.06 : gravity,
        glow: null
      });
    }
  }

  function updateParticles() {
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.life--;
      if (p.life <= 0) { state.particles.splice(i, 1); continue; }
      p.vy += p.gravity;
      p.vx *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
    }
    for (let i = state.floaters.length - 1; i >= 0; i--) {
      const f = state.floaters[i];
      f.life--;
      f.y -= 0.55;
      if (f.life <= 0) state.floaters.splice(i, 1);
    }
  }

  function addFloater(text, x, y, color) {
    if (state.floaters.length > 40) state.floaters.shift();
    state.floaters.push({
      text: String(text), x: x, y: y,
      color: color || "#f6dca2",
      life: 52, maxLife: 52
    });
  }

  /* ============================================================
     CÂMERA
     ============================================================ */
  function updateCamera() {
    const level = state.level;
    const p = state.player;
    if (!level || !p) return;
    let target;
    if (level.bossActive && !level.bossDefeated && level.boss) {
      const mid = ((p.x + p.w / 2) + (level.boss.x + level.boss.w / 2)) / 2;
      target = mid - W * 0.48;
    } else {
      target = p.x + p.w / 2 - W * 0.42;
    }
    target = clamp(target, 0, Math.max(0, level.width - W));
    state.camera.x = approach(state.camera.x, target, Math.max(1.2, Math.abs(target - state.camera.x) * 0.14));
    if (!level.bossActive) state.camera.x = clamp(state.camera.x, 0, Math.max(0, level.width - W));
    state.camera.shake *= 0.92;
    if (state.camera.shake < 0.2) state.camera.shake = 0;
  }

  /* ============================================================
     INICIALIZAÇÃO
     ============================================================ */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
