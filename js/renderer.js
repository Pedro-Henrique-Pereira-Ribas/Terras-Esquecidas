/* ============================================================
   TERRA PERDIDA — renderizador do mundo
   ============================================================ */
(function () {
  "use strict";
  const TP = (window.TP = window.TP || {});
  const art = TP.art;
  const W = 640, H = 360;

  const R = {
    canvas: null, ctx: null,
    init: function (canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.ctx.imageSmoothingEnabled = false;
      return this.ctx;
    },
    draw: function (state) { draw(state); }
  };
  TP.renderer = R;

  function draw(state) {
    const ctx = R.ctx;
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    const mode = state.mode;
    if (mode === "title" || mode === "characters" || mode === "difficulty" || mode === "how") {
      TP.scenery.drawTitleScene(ctx, state.time);
    } else if (mode === "camp") {
      TP.scenery.drawCampScene(ctx, state.time);
    } else if (mode === "ending" || mode === "endingText") {
      TP.scenery.drawThroneScene(ctx, state.time, state.endingTone || "dark");
    } else if (state.level) {
      drawWorld(state);
    } else {
      TP.scenery.drawTitleScene(ctx, state.time);
    }

    // vinheta de tela + flash de dano
    if (state.level && mode !== "title") {
      if (state.hitFlash > 0) {
        ctx.save();
        ctx.globalAlpha = Math.min(0.35, state.hitFlash / 45);
        ctx.fillStyle = "#d74a3c";
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }
    }
  }

  function drawWorld(state) {
    const ctx = R.ctx;
    const level = state.level;
    const t = state.time;
    const cam = state.camera.x;
    const shake = state.camera.shake || 0;
    const sx = shake ? (Math.random() * 2 - 1) * shake : 0;
    const sy = shake ? (Math.random() * 2 - 1) * shake : 0;

    TP.scenery.drawBackground(ctx, level, cam, t);

    ctx.save();
    ctx.translate(-Math.round(cam) + Math.round(sx), Math.round(sy));

    drawGround(ctx, level, t);
    drawArenaGate(ctx, level, state, t);
    drawSpikes(ctx, level, t);
    drawCheckpoints(ctx, level, t);
    drawPickups(ctx, level, t);

    // NPC da tarefa
    if (level.questNpc) {
      const qs = state.run && state.run.quests ? state.run.quests[level.questNpc.questId] : null;
      TP.sprites.drawNpc(ctx, level.questNpc, t, qs);
    }

    // inimigos
    for (let i = 0; i < level.enemies.length; i++) {
      const e = level.enemies[i];
      if (!e.dead) TP.sprites.drawEnemy(ctx, e, level.def.theme);
    }

    // chefe
    if (level.boss && !level.boss.dead) TP.sprites.drawBoss(ctx, level.boss, t);

    // projéteis atrás do jogador quando são "shock"
    for (let i = 0; i < state.projectiles.length; i++) {
      const p = state.projectiles[i];
      if (p.kind === "shock") TP.sprites.drawProjectile(ctx, p, t);
    }

    // jogador
    if (state.player && !state.player.dead) TP.sprites.drawPlayer(ctx, state.player, t);

    // projéteis na frente
    for (let i = 0; i < state.projectiles.length; i++) {
      const p = state.projectiles[i];
      if (p.kind !== "shock") TP.sprites.drawProjectile(ctx, p, t);
    }

    drawParticles(ctx, state);
    drawFloaters(ctx, state);

    // detalhes de primeiro plano
    drawForeground(ctx, level, cam, t);

    ctx.restore();

    drawWeather(ctx, level, t, cam);
    drawScreenLighting(ctx, state);

    if (state.bossIntro && state.bossIntro > 0) {
      drawBossIntro(ctx, level, state);
    }
  }

  /* ---------------- chão e plataformas ---------------- */
  function drawGround(ctx, level, time) {
    const pal = art.THEMES[level.def.theme] || art.THEMES.ruins;
    const theme = level.def.theme;

    for (let i = 0; i < level.grounds.length; i++) {
      const g = level.grounds[i];
      art.rect(ctx, g.x, g.y, g.w, Math.max(g.h, H - g.y), pal.groundDark);
      art.rect(ctx, g.x, g.y, g.w, 6, pal.top);
      art.rect(ctx, g.x, g.y + 6, g.w, 4, pal.ground);
      art.rect(ctx, g.x, g.y + 10, g.w, 3, "rgba(0,0,0,.18)");
      // tijolos / tábuas
      const tile = theme === "mine" ? 38 : 32;
      for (let x = g.x + 14; x < g.x + g.w; x += tile) {
        art.rect(ctx, x, g.y + 13, 1, Math.min(g.h, 30), "rgba(0,0,0,.18)");
        art.rect(ctx, x + 2, g.y + 16, 13, 1, "rgba(255,255,255,.05)");
      }
      for (let x = g.x; x < g.x + g.w; x += 96) {
        const n = (Math.floor(x / 96) * 37) % 17;
        art.rect(ctx, x + 20 + n, g.y + 20 + (n % 9), 8, 2, "rgba(0,0,0,.2)");
        art.rect(ctx, x + 53, g.y + 31 + (n % 7), 3, 7, "rgba(0,0,0,.16)");
      }
      // topo decorado
      for (let x = g.x + 6; x < g.x + g.w - 4; x += 23) {
        const n = (Math.floor(x) * 13) % 11;
        if (theme === "ruins") {
          art.rect(ctx, x, g.y - 3, 10, 3, pal.moss);
          if (n % 3 === 0) art.rect(ctx, x + 2, g.y - 7, 2, 5, "#52633f");
        } else if (theme === "forest") {
          art.rect(ctx, x, g.y - 4, 7, 4, pal.moss);
          if (n % 2 === 0) art.rect(ctx, x + 8, g.y - 7, 2, 5, "#6f9453");
        } else if (theme === "mountain") {
          art.rect(ctx, x, g.y - 2, 15, 2, "#e3e8ec");
        } else if (theme === "mine") {
          art.rect(ctx, x, g.y - 2, 9, 2, "#86583a");
          if (n % 4 === 0) art.rect(ctx, x + 3, g.y + 17, 4, 2, "#c78b4a");
        } else if (theme === "forge") {
          art.rect(ctx, x, g.y - 2, 11, 2, "#8a5a3a");
          if (n % 3 === 0) art.rect(ctx, x + 4, g.y - 5, 2, 3, "#ff9b4e");
        } else if (theme === "temple") {
          art.rect(ctx, x, g.y - 2, 13, 2, "#9b9172");
          if (n % 4 === 0) art.rect(ctx, x + 5, g.y + 18, 4, 2, "#d8bd72");
        } else if (theme === "desert") {
          art.rect(ctx, x, g.y - 2, 14, 2, "#e0b878");
          if (n % 4 === 0) art.rect(ctx, x + 5, g.y + 16, 3, 3, "#7fd8cf");
        } else if (theme === "void") {
          art.rect(ctx, x, g.y - 2, 12, 2, "#55368a");
          if (n % 3 === 0) art.rect(ctx, x + 4, g.y - 5, 2, 3, "#b48cff");
        } else if (theme === "celestial") {
          art.rect(ctx, x, g.y - 2, 13, 2, "#c9c3ac");
          if (n % 4 === 0) art.rect(ctx, x + 5, g.y - 5, 2, 3, "#fff0b0");
        } else {
          art.rect(ctx, x, g.y - 2, 12, 2, "#6a4f43");
          if (n % 4 === 0) art.rect(ctx, x + 5, g.y - 5, 3, 3, "#8e4b3a");
        }
      }
    }

    for (let i = 0; i < level.platforms.length; i++) {
      const p = level.platforms[i];
      drawPlatform(ctx, p, pal, theme, time);
    }
  }

  function drawPlatform(ctx, p, pal, theme, time) {
    art.shadow(ctx, p.x + p.w / 2, p.y + 13, p.w * 0.4, 0.2);
    if (theme === "forest") {
      art.rect(ctx, p.x, p.y + 3, p.w, 12, "#3b2d20");
      art.rect(ctx, p.x, p.y, p.w, 6, "#5a4630");
      art.rect(ctx, p.x + 2, p.y - 3, p.w - 4, 4, pal.moss);
      ctx.save();
      ctx.globalAlpha = 0.6;
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = "#3d5c38";
        ctx.fillRect(p.x + 10 + i * (p.w / 4), p.y + 12, 3, 10 + (i % 3) * 6);
      }
      ctx.restore();
    } else if (theme === "mountain") {
      art.rect(ctx, p.x, p.y, p.w, 10, "#4b5360");
      art.rect(ctx, p.x, p.y, p.w, 3, "#d9e1e8");
      art.rect(ctx, p.x + 8, p.y + 10, p.w - 16, 4, "#303845");
      ctx.strokeStyle = "#7c8793";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x + 14, p.y + 10); ctx.lineTo(p.x + 22, p.y + 25);
      ctx.moveTo(p.x + p.w - 14, p.y + 10); ctx.lineTo(p.x + p.w - 22, p.y + 25);
      ctx.stroke();
    } else if (theme === "mine") {
      art.rect(ctx, p.x, p.y, p.w, 11, "#5b4737");
      art.rect(ctx, p.x, p.y, p.w, 3, "#9a784e");
      art.rect(ctx, p.x + 4, p.y + 11, 7, 5, "#3c2b21");
      art.rect(ctx, p.x + p.w - 11, p.y + 11, 7, 5, "#3c2b21");
      art.rect(ctx, p.x + 12, p.y + 5, p.w - 24, 2, "#3b2a20");
    } else if (theme === "frontier") {
      art.rect(ctx, p.x, p.y, p.w, 12, "#352923");
      art.rect(ctx, p.x, p.y, p.w, 3, "#755442");
      art.rect(ctx, p.x + 6, p.y + 12, 4, 8, "#201816");
      art.rect(ctx, p.x + p.w - 10, p.y + 12, 4, 8, "#201816");
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = "#a54b38";
      ctx.fillRect(p.x + 20, p.y + 2, p.w * 0.4, 1);
      ctx.restore();
    } else if (theme === "forge") {
      art.rect(ctx, p.x, p.y, p.w, 12, "#4a3830");
      art.rect(ctx, p.x, p.y, p.w, 3, "#a66b45");
      art.rect(ctx, p.x + 4, p.y + 12, 6, 7, "#2b201b");
      art.rect(ctx, p.x + p.w - 10, p.y + 12, 6, 7, "#2b201b");
      art.rect(ctx, p.x + 12, p.y + 5, p.w - 24, 2, "#2b201b");
      ctx.fillStyle = "rgba(255,155,78,.35)";
      ctx.fillRect(p.x + 8, p.y - 2, 18, 2);
    } else if (theme === "temple") {
      art.rect(ctx, p.x, p.y, p.w, 12, "#5a5647");
      art.rect(ctx, p.x, p.y, p.w, 3, "#a89b75");
      art.rect(ctx, p.x + 4, p.y + 12, 7, 8, "#353229");
      art.rect(ctx, p.x + p.w - 11, p.y + 12, 7, 8, "#353229");
      art.rect(ctx, p.x + 14, p.y + 5, p.w - 28, 1, "#d8bd72");
    } else if (theme === "desert") {
      art.rect(ctx, p.x, p.y, p.w, 12, "#7a5a3a");
      art.rect(ctx, p.x, p.y, p.w, 3, "#e0b878");
      art.rect(ctx, p.x + 5, p.y + 12, 5, 7, "#4a3524");
      art.rect(ctx, p.x + p.w - 10, p.y + 12, 5, 7, "#4a3524");
      ctx.fillStyle = "rgba(127,216,207,.35)";
      ctx.fillRect(p.x + 20, p.y + 2, p.w * 0.28, 1);
    } else if (theme === "void") {
      art.rect(ctx, p.x, p.y, p.w, 12, "#241a3d");
      art.rect(ctx, p.x, p.y, p.w, 3, "#55368a");
      art.rect(ctx, p.x + 5, p.y + 12, 5, 8, "#120f21");
      art.rect(ctx, p.x + p.w - 10, p.y + 12, 5, 8, "#120f21");
      art.glow(ctx, p.x + p.w / 2, p.y + 3, p.w * 0.3, "#b48cff", 0.1);
    } else if (theme === "celestial") {
      art.rect(ctx, p.x, p.y, p.w, 12, "#6f6f74");
      art.rect(ctx, p.x, p.y, p.w, 3, "#d8d2ba");
      art.rect(ctx, p.x + 4, p.y + 12, 7, 8, "#4b4b50");
      art.rect(ctx, p.x + p.w - 11, p.y + 12, 7, 8, "#4b4b50");
      ctx.fillStyle = "rgba(255,240,176,.45)";
      ctx.fillRect(p.x + 16, p.y + 2, p.w * 0.35, 1);
    } else {
      art.rect(ctx, p.x, p.y, p.w, 12, "#5f604e");
      art.rect(ctx, p.x, p.y, p.w, 3, "#8f8c6b");
      art.rect(ctx, p.x + 3, p.y + 12, 9, 6, "#464737");
      art.rect(ctx, p.x + p.w - 12, p.y + 12, 9, 6, "#464737");
      ctx.fillStyle = "#6a7e4d";
      ctx.fillRect(p.x + 8, p.y - 2, 22, 2);
      ctx.fillRect(p.x + p.w - 30, p.y - 2, 14, 2);
      ctx.strokeStyle = "rgba(44,45,34,.55)";
      ctx.strokeRect(p.x + 18, p.y + 17, 6, 8);
    }
    if (time) {
      // pequeno brilho nas pontas para leitura de colisão
      art.rect(ctx, p.x, p.y, 2, 3, "rgba(255,255,255,.16)");
      art.rect(ctx, p.x + p.w - 2, p.y, 2, 3, "rgba(255,255,255,.16)");
    }
  }

  /* ---------------- espinhos / armadilhas ---------------- */
  function drawSpikes(ctx, level, time) {
    const theme = level.def.theme;
    for (let i = 0; i < level.spikes.length; i++) {
      const s = level.spikes[i];
      const count = Math.max(2, Math.floor(s.w / 13));
      const step = s.w / count;
      for (let j = 0; j < count; j++) {
        const x = s.x + j * step;
        ctx.fillStyle = theme === "mine" ? "#8a6250" : theme === "mountain" ? "#c4d1db" : theme === "forge" ? "#b26b43" : theme === "temple" ? "#b0a47f" : theme === "desert" ? "#d8b06a" : theme === "void" ? "#7a58b0" : theme === "celestial" ? "#e8dfc0" : "#7a745e";
        ctx.beginPath();
        ctx.moveTo(x, s.y + 10);
        ctx.lineTo(x + step / 2, s.y - 8);
        ctx.lineTo(x + step, s.y + 10);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.18)";
        ctx.fillRect(x + step / 2 - 1, s.y - 2, 1, 7);
      }
      ctx.fillStyle = "rgba(22,20,17,.6)";
      ctx.fillRect(s.x, s.y + 8, s.w, 3);
      if (theme === "frontier") {
        ctx.save();
        ctx.globalAlpha = 0.25;
        art.glow(ctx, s.x + s.w / 2, s.y, s.w, "#ff5d3a", 0.1);
        ctx.restore();
      }
    }
  }

  /* ---------------- portão da arena ---------------- */
  function drawArenaGate(ctx, level, state, time) {
    if (!level.arenaStart) return;
    const x = level.arenaStart + 20;
    // pilares de pedra
    art.rect(ctx, x - 14, 210, 12, 110, "#34342e");
    art.rect(ctx, x - 18, 200, 20, 10, "#48483d");
    art.rect(ctx, x + 4, 210, 12, 110, "#34342e");
    art.rect(ctx, x, 200, 20, 10, "#48483d");
    if (level.bossActive && !level.bossDefeated) {
      TP.sprites.drawGate(ctx, x, time, true);
    } else {
      ctx.save();
      ctx.globalAlpha = 0.3;
      art.rect(ctx, x, 220, 2, 80, "#7e6c50");
      art.rect(ctx, x + 7, 220, 2, 60, "#7e6c50");
      ctx.restore();
    }
  }

  /* ---------------- pontos de descanso e coletáveis ---------------- */
  function drawCheckpoints(ctx, level, time) {
    for (let i = 0; i < level.checkpoints.length; i++) {
      TP.sprites.drawCheckpoint(ctx, level.checkpoints[i], time, level.def.theme);
    }
  }

  function drawPickups(ctx, level, time) {
    for (let i = 0; i < level.memories.length; i++) TP.sprites.drawMemory(ctx, level.memories[i], time);
    for (let i = 0; i < level.heals.length; i++) TP.sprites.drawHeal(ctx, level.heals[i], time);
  }

  /* ---------------- partículas e números ---------------- */
  function drawParticles(ctx, state) {
    const arr = state.particles;
    for (let i = 0; i < arr.length; i++) {
      const p = arr[i];
      if (p.life <= 0) continue;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / p.maxLife));
      ctx.fillStyle = p.color || "#d8b06a";
      const s = p.size || 2;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), s, s);
      if (p.glow) {
        ctx.globalAlpha *= 0.3;
        ctx.fillStyle = p.glow;
        ctx.fillRect(Math.round(p.x) - s, Math.round(p.y) - s, s * 3, s * 3);
      }
      ctx.restore();
    }
  }

  function drawFloaters(ctx, state) {
    const arr = state.floaters;
    ctx.save();
    ctx.font = "bold 10px 'Courier New', monospace";
    ctx.textAlign = "center";
    for (let i = 0; i < arr.length; i++) {
      const f = arr[i];
      if (f.life <= 0) continue;
      ctx.globalAlpha = Math.max(0, Math.min(1, f.life / f.maxLife));
      ctx.fillStyle = "rgba(10,8,6,.8)";
      ctx.fillText(f.text, f.x + 1, f.y + 1);
      ctx.fillStyle = f.color || "#ffe0a0";
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.restore();
  }

  /* ---------------- detalhes em primeiro plano ---------------- */
  function drawForeground(ctx, level, cam, time) {
    const theme = level.def.theme;
    const pal = art.THEMES[theme];
    // não desenhar sobre a arena em excesso
    if (theme === "forest") {
      for (let i = 0; i < 12; i++) {
        const wx = ((i * 131 + Math.sin(time * 0.008 + i) * 8) % (level.width + 200)) - 100;
        const x = wx;
        if (x < cam - 40 || x > cam + W + 40) continue;
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = "#6b8d5b";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.quadraticCurveTo(x + 10, 50, x + 2, 90);
        ctx.stroke();
        ctx.fillStyle = "#557b4b";
        ctx.fillRect(x - 2, 28, 14, 3);
        ctx.fillRect(x - 8, 57, 15, 3);
        ctx.restore();
      }
    } else if (theme === "ruins") {
      for (let i = 0; i < 14; i++) {
        const x = ((i * 107 - cam * 0.2) % 760 + 760) % 760 - 50;
        const y = 90 + (i * 43) % 220;
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = "#d8e3c9";
        ctx.fillRect(x, y, 2, 2);
      }
      ctx.globalAlpha = 1;
    } else if (theme === "mine") {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = "#0f0a09";
      for (let i = 0; i < 8; i++) {
        const x = ((i * 190 - cam * 0.8) % 1000 + 1000) % 1000 - 100;
        ctx.fillRect(x, 0, 34, 10);
        ctx.fillRect(x + 30, 0, 12, 22);
      }
      ctx.restore();
    } else if (theme === "frontier") {
      for (let i = 0; i < 24; i++) {
        const x = ((i * 53 - cam * 0.6 + time * 0.08) % 700 + 700) % 700;
        const y = ((i * 37 + time * 0.05) % 360);
        ctx.globalAlpha = 0.25 + (i % 4) * 0.1;
        ctx.fillStyle = i % 5 === 0 ? "#ff9b6a" : "#b6a091";
        ctx.fillRect(x, y, i % 6 === 0 ? 2 : 1, 1);
      }
      ctx.globalAlpha = 1;
    } else if (theme === "forge") {
      for (let i = 0; i < 26; i++) {
        const x = ((i * 61 - cam * 0.5 + time * 0.12) % 720 + 720) % 720;
        const y = 360 - ((i * 43 + time * 0.35) % 300);
        ctx.globalAlpha = 0.2 + (i % 4) * 0.1;
        ctx.fillStyle = i % 4 === 0 ? "#ffd18a" : "#ff8a45";
        ctx.fillRect(x, y, i % 5 === 0 ? 2 : 1, 2);
      }
      ctx.globalAlpha = 1;
    } else if (theme === "temple") {
      for (let i = 0; i < 20; i++) {
        const x = ((i * 79 - cam * 0.4 + Math.sin(time * 0.01 + i) * 10) % 720 + 720) % 720;
        const y = 70 + (i * 47) % 240;
        ctx.globalAlpha = 0.14 + (i % 3) * 0.06;
        ctx.fillStyle = "#e8d9a8";
        ctx.fillRect(x, y, 1, 1);
      }
      ctx.globalAlpha = 1;
    } else if (theme === "desert") {
      for (let i = 0; i < 30; i++) {
        const x = ((i * 47 - cam * 0.7 + time * 0.16) % 720 + 720) % 720;
        const y = 180 + (i * 29 + time * 0.08) % 180;
        ctx.globalAlpha = 0.18 + (i % 3) * 0.06;
        ctx.fillStyle = i % 4 === 0 ? "#7fd8cf" : "#ffe0a0";
        ctx.fillRect(x, y, i % 5 === 0 ? 2 : 1, 1);
      }
      ctx.globalAlpha = 1;
    } else if (theme === "void") {
      for (let i = 0; i < 22; i++) {
        const x = ((i * 83 - cam * 0.45 + time * 0.05) % 720 + 720) % 720;
        const y = 40 + (i * 53) % 300 + Math.sin(time * 0.02 + i) * 8;
        ctx.globalAlpha = 0.18 + (i % 4) * 0.08;
        ctx.fillStyle = i % 3 === 0 ? "#e6d6ff" : "#8d6bc7";
        ctx.fillRect(x, y, i % 6 === 0 ? 2 : 1, 1);
      }
      ctx.globalAlpha = 1;
    } else if (theme === "celestial") {
      for (let i = 0; i < 18; i++) {
        const x = ((i * 67 - cam * 0.35 + time * 0.1) % 720 + 720) % 720;
        const y = 50 + (i * 59 + time * 0.2) % 280;
        ctx.globalAlpha = 0.2 + (i % 3) * 0.08;
        ctx.fillStyle = "#fff0b0";
        ctx.fillRect(x, y, 3, 1);
        ctx.fillRect(x + 3, y + 1, 2, 1);
      }
      ctx.globalAlpha = 1;
    }
  }

  function drawWeather(ctx, level, time, cam) {
    const theme = level.def.theme;
    ctx.save();
    if (theme === "mountain") {
      for (let i = 0; i < 70; i++) {
        const x = ((i * 59 + time * 0.16 - cam * 0.15) % 700 + 700) % 700;
        const y = ((i * 41 + time * 0.5) % 400) - 40;
        ctx.globalAlpha = 0.25 + (i % 4) * 0.1;
        ctx.fillStyle = "#e6f0f8";
        ctx.fillRect(x, y, i % 6 === 0 ? 2 : 1, i % 6 === 0 ? 2 : 1);
      }
    } else if (theme === "forest") {
      for (let i = 0; i < 18; i++) {
        const x = ((i * 71 - time * 0.05 - cam * 0.2) % 700 + 700) % 700;
        const y = 70 + (i * 47) % 230 + Math.sin(time * 0.02 + i) * 9;
        ctx.globalAlpha = 0.16 + (i % 3) * 0.08;
        ctx.fillStyle = "#d4efa0";
        ctx.fillRect(x, y, 2, 2);
      }
    } else if (theme === "frontier") {
      for (let i = 0; i < 32; i++) {
        const x = ((i * 37 + time * 0.18) % 680 + 680) % 680;
        const y = ((i * 53 + time * 0.08) % 390) - 20;
        ctx.globalAlpha = 0.2 + (i % 4) * 0.08;
        ctx.fillStyle = i % 4 === 0 ? "#ff9060" : "#b49a8c";
        ctx.fillRect(x, y, i % 7 === 0 ? 2 : 1, 1);
      }
    } else if (theme === "mine") {
      for (let i = 0; i < 22; i++) {
        const x = ((i * 69 - time * 0.08) % 680 + 680) % 680;
        const y = 360 - ((i * 43 + time * 0.3) % 260);
        ctx.globalAlpha = 0.25 + (i % 3) * 0.12;
        ctx.fillStyle = "#ff9954";
        ctx.fillRect(x, y, 1, 2);
      }
    } else if (theme === "forge") {
      for (let i = 0; i < 30; i++) {
        const x = ((i * 53 + time * 0.1) % 680 + 680) % 680;
        const y = 360 - ((i * 37 + time * 0.55) % 300);
        ctx.globalAlpha = 0.2 + (i % 4) * 0.1;
        ctx.fillStyle = i % 3 === 0 ? "#ffd18a" : "#ff8a45";
        ctx.fillRect(x, y, i % 5 === 0 ? 2 : 1, 2);
      }
    } else if (theme === "temple") {
      for (let i = 0; i < 24; i++) {
        const x = ((i * 67 - time * 0.03) % 700 + 700) % 700;
        const y = 60 + (i * 43) % 250 + Math.sin(time * 0.015 + i) * 7;
        ctx.globalAlpha = 0.12 + (i % 3) * 0.05;
        ctx.fillStyle = "#e8d9a8";
        ctx.fillRect(x, y, 1, 1);
      }
    } else if (theme === "desert") {
      for (let i = 0; i < 44; i++) {
        const x = ((i * 47 + time * 0.35) % 700 + 700) % 700;
        const y = ((i * 31 + time * 0.12) % 380) - 10;
        ctx.globalAlpha = 0.15 + (i % 4) * 0.06;
        ctx.fillStyle = i % 5 === 0 ? "#7fd8cf" : "#ffe0a0";
        ctx.fillRect(x, y, i % 4 === 0 ? 2 : 1, 1);
      }
    } else if (theme === "void") {
      for (let i = 0; i < 26; i++) {
        const x = ((i * 61 - time * 0.02) % 700 + 700) % 700;
        const y = 30 + (i * 47) % 280;
        ctx.globalAlpha = 0.15 + (i % 4) * 0.08;
        ctx.fillStyle = i % 3 === 0 ? "#e6d6ff" : "#8d6bc7";
        ctx.fillRect(x, y, i % 6 === 0 ? 2 : 1, 1);
      }
    } else if (theme === "celestial") {
      for (let i = 0; i < 20; i++) {
        const x = ((i * 71 + time * 0.07) % 700 + 700) % 700;
        const y = ((i * 43 + time * 0.14) % 330);
        ctx.globalAlpha = 0.18 + (i % 3) * 0.07;
        ctx.fillStyle = "#fff0b0";
        ctx.fillRect(x, y, 3, 1);
        ctx.fillRect(x + 3, y + 1, 2, 1);
      }
    } else {
      for (let i = 0; i < 16; i++) {
        const x = ((i * 89 - time * 0.06) % 700 + 700) % 700;
        const y = ((i * 41 + time * 0.12) % 340);
        ctx.globalAlpha = 0.12 + (i % 3) * 0.05;
        ctx.fillStyle = "#f1e7c8";
        ctx.fillRect(x, y, 1, 1);
      }
    }
    ctx.restore();
  }

  function drawScreenLighting(ctx, state) {
    // brilho quente de fogueiras e memórias
    if (!state.level) return;
    const level = state.level;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < level.checkpoints.length; i++) {
      const cp = level.checkpoints[i];
      if (!cp.lit) continue;
      const sx = cp.x - state.camera.x;
      if (sx < -80 || sx > W + 80) continue;
      const g = ctx.createRadialGradient(sx, cp.y - 30, 4, sx, cp.y - 30, 60);
      g.addColorStop(0, "rgba(255,170,90,.14)");
      g.addColorStop(1, "rgba(255,120,60,0)");
      ctx.fillStyle = g;
      ctx.fillRect(sx - 60, cp.y - 90, 120, 120);
    }
    ctx.restore();

    // vinheta
    const vg = ctx.createRadialGradient(320, 180, 180, 320, 180, 400);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,.48)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }

  function drawBossIntro(ctx, level, state) {
    const b = level.boss;
    if (!b) return;
    const a = Math.min(1, state.bossIntro / 30);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = "rgba(10,7,6,.55)";
    ctx.fillRect(0, 72, W, 56);
    ctx.fillStyle = "rgba(198,155,75,.55)";
    ctx.fillRect(80, 88, 480, 1);
    ctx.fillRect(80, 112, 480, 1);
    ctx.textAlign = "center";
    ctx.font = "bold 19px 'Courier New', monospace";
    ctx.fillStyle = "#f2d49b";
    ctx.fillText(b.cfg.name.toUpperCase(), 320, 105);
    ctx.font = "10px 'Courier New', monospace";
    ctx.fillStyle = "#b7aa90";
    ctx.fillText(b.cfg.title.toUpperCase(), 320, 120);
    ctx.restore();
  }
})();
