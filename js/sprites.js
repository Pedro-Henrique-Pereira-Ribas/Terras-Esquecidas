/* ============================================================
   TERRA PERDIDA — sprites de heróis, monstros, chefes e efeitos
   ============================================================ */
(function () {
  "use strict";
  const TP = (window.TP = window.TP || {});
  const art = TP.art;
  const S = {};

  /* ============================================================
     HERÓIS
     ============================================================ */
  S.drawPlayer = function (ctx, p, time) {
    const char = p.char;
    const pal = char.palette;
    if (p.invuln > 0 && Math.floor(time / 3) % 2 === 0) return;

    art.shadow(ctx, p.x + p.w / 2, p.y + p.h + 1, 11, 0.3);
    ctx.save();
    ctx.translate(Math.round(p.x + p.w / 2), Math.round(p.y));
    ctx.scale(p.facing, 1);

    const moving = p.moving && p.onGround;
    const run = moving ? Math.sin(p.anim * 0.34) : 0;
    const bob = moving ? Math.round(Math.abs(Math.sin(p.anim * 0.34)) * -1) : Math.round(Math.sin(time * 0.06) * 0.6);
    const airborne = !p.onGround;
    const attacking = p.attackTimer > 0;
    const atkProg = attacking ? 1 - (p.attackTimer / p.attackDuration) : 0;

    ctx.translate(0, bob);

    // sombra da capa / manto
    ctx.fillStyle = pal.dark;
    ctx.fillRect(-10, 9, 20, 20);
    if (char.id === "mago") {
      ctx.fillStyle = pal.robe2;
      ctx.fillRect(-12, 10, 24, 20);
      ctx.fillRect(-9 + run * 2, 27, 18, 9);
    } else if (char.id === "viajante") {
      ctx.fillStyle = pal.cloak;
      ctx.fillRect(-11, 10, 22, 18);
      ctx.fillRect(-16, 12, 6, 15);
    } else if (char.id === "guerreiro") {
      ctx.fillStyle = pal.dark;
      ctx.fillRect(-12, 8, 24, 21);
    }

    // pernas
    const legA = moving ? Math.round(run * 4) : (airborne ? -2 : 0);
    const legB = moving ? Math.round(-run * 4) : (airborne ? 2 : 0);
    ctx.fillStyle = pal.boot || pal.dark;
    ctx.fillRect(-7 + legA, 27, 6, 9);
    ctx.fillRect(2 + legB, 27, 6, 9);
    ctx.fillStyle = pal.dark;
    ctx.fillRect(-8 + legA, 34, 8, 3);
    ctx.fillRect(1 + legB, 34, 8, 3);

    // corpo
    if (char.id === "guerreiro") {
      ctx.fillStyle = pal.armor;
      ctx.fillRect(-9, 11, 18, 17);
      ctx.fillStyle = pal.metal;
      ctx.fillRect(-7, 13, 5, 11);
      ctx.fillRect(3, 13, 5, 11);
      ctx.fillStyle = pal.accent;
      ctx.fillRect(-8, 23, 16, 4);
      ctx.fillRect(-2, 12, 4, 12);
    } else if (char.id === "mago") {
      ctx.fillStyle = pal.robe;
      ctx.fillRect(-8, 11, 16, 20);
      ctx.fillStyle = pal.robe2;
      ctx.fillRect(-9, 24, 18, 7);
      ctx.fillStyle = pal.accent;
      ctx.fillRect(-7, 13, 3, 13);
      ctx.fillRect(-1, 18, 8, 2);
    } else if (char.id === "minerador") {
      ctx.fillStyle = pal.armor;
      ctx.fillRect(-10, 11, 20, 18);
      ctx.fillStyle = pal.metal;
      ctx.fillRect(-9, 13, 6, 9);
      ctx.fillRect(4, 13, 5, 9);
      ctx.fillStyle = pal.accent;
      ctx.fillRect(-9, 23, 18, 5);
    } else if (char.id === "arqueira") {
      ctx.fillStyle = pal.tunic;
      ctx.fillRect(-7, 12, 14, 17);
      ctx.fillStyle = pal.hood;
      ctx.fillRect(-9, 12, 5, 14);
      ctx.fillStyle = pal.accent;
      ctx.fillRect(-6, 22, 12, 3);
    } else {
      ctx.fillStyle = pal.tunic;
      ctx.fillRect(-7, 12, 14, 16);
      ctx.fillStyle = pal.cloak;
      ctx.fillRect(-9, 13, 4, 15);
      ctx.fillStyle = pal.accent;
      ctx.fillRect(-6, 23, 12, 3);
    }

    // cinto
    ctx.fillStyle = "#2b2118";
    ctx.fillRect(-8, 24, 16, 3);
    if (char.id !== "mago") {
      ctx.fillStyle = pal.accent;
      ctx.fillRect(-1, 24, 3, 3);
    }

    // cabeça
    const headY = 1;
    if (char.id === "guerreiro") {
      ctx.fillStyle = pal.skin;
      ctx.fillRect(-5, 4, 10, 8);
      ctx.fillStyle = pal.armor;
      ctx.fillRect(-7, 0, 14, 7);
      ctx.fillRect(-8, 3, 3, 7);
      ctx.fillRect(5, 3, 3, 7);
      ctx.fillStyle = pal.metal;
      ctx.fillRect(-2, -1, 4, 4);
      ctx.fillStyle = pal.accent;
      ctx.fillRect(-1, -5, 2, 5);
      ctx.fillRect(-4, -4, 8, 2);
      ctx.fillStyle = "#17120f";
      ctx.fillRect(-4, 6, 3, 1);
      ctx.fillRect(1, 6, 3, 1);
    } else if (char.id === "mago") {
      ctx.fillStyle = pal.robe2;
      ctx.fillRect(-10, 2, 6, 12);
      ctx.fillRect(4, 2, 6, 12);
      ctx.fillStyle = pal.skin;
      ctx.fillRect(-5, 4, 10, 8);
      ctx.fillStyle = pal.hair;
      ctx.fillRect(-7, 0, 14, 5);
      ctx.fillRect(-8, 3, 3, 5);
      ctx.fillRect(5, 3, 3, 5);
      ctx.fillStyle = pal.accent;
      ctx.fillRect(-5, 11, 10, 1);
      ctx.fillStyle = "#1c1722";
      ctx.fillRect(-4, 6, 2, 1);
      ctx.fillRect(2, 6, 2, 1);
    } else if (char.id === "minerador") {
      ctx.fillStyle = pal.helmet;
      ctx.fillRect(-8, 1, 16, 6);
      ctx.fillRect(-7, -2, 14, 4);
      ctx.fillStyle = pal.metal;
      ctx.fillRect(-3, -3, 6, 3);
      ctx.fillStyle = pal.accent;
      ctx.fillRect(-2, -2, 4, 2);
      ctx.fillStyle = pal.skin;
      ctx.fillRect(-5, 5, 10, 7);
      ctx.fillStyle = pal.beard;
      ctx.fillRect(-6, 9, 12, 5);
      ctx.fillRect(-4, 13, 8, 3);
      ctx.fillStyle = "#1c130f";
      ctx.fillRect(-4, 7, 2, 1);
      ctx.fillRect(2, 7, 2, 1);
    } else if (char.id === "arqueira") {
      ctx.fillStyle = pal.hood;
      ctx.fillRect(-8, -1, 16, 6);
      ctx.fillRect(-9, 3, 3, 8);
      ctx.fillRect(6, 3, 3, 8);
      ctx.fillStyle = pal.skin;
      ctx.fillRect(-5, 4, 10, 8);
      ctx.fillStyle = pal.hair;
      ctx.fillRect(-6, 1, 12, 3);
      ctx.fillRect(4, 3, 3, 10);
      ctx.fillRect(5, 11, 2, 5);
      ctx.fillStyle = "#17120f";
      ctx.fillRect(-4, 6, 2, 1);
      ctx.fillRect(2, 6, 2, 1);
      ctx.fillStyle = pal.accent;
      ctx.fillRect(-5, 11, 10, 1);
    } else {
      ctx.fillStyle = pal.cloak;
      ctx.fillRect(-8, -1, 16, 5);
      ctx.fillRect(-9, 3, 3, 9);
      ctx.fillStyle = pal.skin;
      ctx.fillRect(-5, 4, 10, 8);
      ctx.fillStyle = pal.hair;
      ctx.fillRect(-7, 0, 14, 4);
      ctx.fillRect(-8, 3, 3, 6);
      ctx.fillRect(5, 3, 3, 6);
      ctx.fillStyle = "#1b130f";
      ctx.fillRect(-4, 6, 2, 1);
      ctx.fillRect(2, 6, 2, 1);
      ctx.fillStyle = pal.accent;
      ctx.fillRect(-5, 12, 10, 2);
    }

    // arma e ataque
    drawHeroWeapon(ctx, char, p, atkProg, attacking, time);

    // poeira / rastro de dash
    if (p.dashTimer > 0) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = char.palette.accent;
      ctx.fillRect(-14, 12, 4, 14);
      ctx.fillRect(-20, 17, 4, 9);
      ctx.restore();
    }
    ctx.restore();

    drawOutfitFx(ctx, p, time);

    // escudo de invulnerabilidade logo após o dano
    if (p.invuln > 50 && p.invuln % 8 < 4) {
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.strokeStyle = pal.accent;
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(p.x) - 3, Math.round(p.y) - 2, p.w + 6, p.h + 4);
      ctx.restore();
    }
  };

  function drawOutfitFx(ctx, p, time) {
    const fx = p.char && p.char.outfitFx;
    if (!fx) return;
    const final = !!p.char.outfitFinal;
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;
    const count = final ? 8 : 4;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    if (final) {
      art.glow(ctx, cx, cy, 34, fx.glow || fx.color, 0.13 + Math.sin(time * 0.05) * 0.03);
      ctx.globalAlpha = 0.18 + Math.sin(time * 0.06) * 0.04;
      ctx.strokeStyle = fx.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 23 + Math.sin(time * 0.07) * 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (let i = 0; i < count; i++) {
      const a = time * (final ? 0.045 : 0.06) + i * (Math.PI * 2 / count);
      const r = (final ? 20 : 12) + Math.sin(time * 0.07 + i) * 3;
      const x = Math.round(cx + Math.cos(a) * r);
      const y = Math.round(cy + Math.sin(a * 1.2) * r * 0.7);
      const s = final ? 2 : 1;
      ctx.globalAlpha = 0.5 + Math.sin(time * 0.1 + i) * 0.25;
      ctx.fillStyle = i % 3 === 0 ? (fx.glow || fx.color) : fx.color;
      ctx.fillRect(x, y, s, s);
    }
    if (final) {
      ctx.globalAlpha = 0.5 + Math.sin(time * 0.08) * 0.12;
      ctx.strokeStyle = fx.glow || fx.color;
      ctx.lineWidth = 1;
      const topY = p.y - 7;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i * 4, topY + 4);
        ctx.lineTo(cx + i * 6, topY - 4 - Math.abs(i));
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawHeroWeapon(ctx, char, p, prog, attacking, time) {
    const pal = char.palette;
    const cls = p.weapon.cls || char.weaponClass;
    const tier = p.weapon.tier;
    const rar = TP.DATA.RARITIES[p.weapon.rarity];
    const effect = p.weapon.effect;

    if (cls === "sword") {
      // arma em repouso ou golpe
      const swing = attacking ? (-1.25 + prog * 2.25) : -0.45;
      ctx.save();
      ctx.translate(7, 17);
      ctx.rotate(swing);
      art.rect(ctx, -1, -2, 3, 14, "#4b3525");
      art.rect(ctx, -5, 11, 11, 2, rar.color);
      art.rect(ctx, -1, -22, 3, 21, "#d6d4c6");
      art.rect(ctx, 1, -22, 1, 19, "#8f969b");
      ctx.fillStyle = rar.glow;
      ctx.fillRect(-2, -25, 5, 3);
      if (effect === "burn") art.glow(ctx, 1, -18, 16, "#ff9c4f", 0.4);
      if (effect === "lifesteal") art.glow(ctx, 1, -18, 16, "#b27aff", 0.35);
      ctx.restore();
      if (attacking && prog > 0.2 && prog < 0.75) {
        ctx.save();
        ctx.globalAlpha = 0.5 - Math.abs(prog - 0.5);
        ctx.strokeStyle = rar.glow;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(6, 17, 25, -1.4, 0.4);
        ctx.stroke();
        ctx.restore();
      }
    } else if (cls === "pickaxe") {
      const swing = attacking ? (-1.45 + prog * 2.55) : -0.5;
      ctx.save();
      ctx.translate(6, 18);
      ctx.rotate(swing);
      art.rect(ctx, -1, -3, 3, 18, "#5a3f2a");
      ctx.fillStyle = "#979da0";
      ctx.beginPath();
      ctx.moveTo(-11, -3); ctx.lineTo(-5, -8); ctx.lineTo(0, -9);
      ctx.lineTo(5, -8); ctx.lineTo(11, -3); ctx.lineTo(5, -1);
      ctx.lineTo(0, -5); ctx.lineTo(-5, -1);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#c6c8c4";
      ctx.beginPath();
      ctx.moveTo(-8, -3); ctx.lineTo(-3, -6); ctx.lineTo(0, -6);
      ctx.lineTo(0, -3); ctx.lineTo(-4, -2); ctx.closePath(); ctx.fill();
      art.rect(ctx, -4, -6, 8, 2, rar.color);
      if (effect === "burn") art.glow(ctx, 0, -3, 17, "#ff8f48", 0.35);
      if (effect === "lifesteal") art.glow(ctx, 0, -3, 17, "#a97bff", 0.32);
      ctx.restore();
      if (attacking && prog > 0.25 && prog < 0.8) {
        ctx.save();
        ctx.globalAlpha = 0.32;
        ctx.strokeStyle = rar.glow;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(4, 18, 25, -1.2, 0.9);
        ctx.stroke();
        ctx.restore();
      }
    } else if (cls === "bow") {
      ctx.save();
      ctx.translate(7, 17);
      const pull = attacking ? Math.sin(Math.min(1, prog * 1.4) * Math.PI) * 5 : 0;
      ctx.strokeStyle = "#8c6a44";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 13, -1.35, 1.35);
      ctx.stroke();
      ctx.strokeStyle = "#d2c5a8";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(3, -12); ctx.lineTo(3, 12); ctx.stroke();
      if (attacking) {
        art.rect(ctx, 2 - pull, -1, 16, 2, "#e8dfc6");
        art.rect(ctx, 17, -2, 4, 4, rar.color);
      }
      if (tier >= 2) art.glow(ctx, 5, 0, 11, effect === "burn" ? "#ff9c4f" : "#b27aff", 0.25);
      ctx.restore();
    } else {
      ctx.save();
      ctx.translate(6, 18);
      art.rect(ctx, -1, -19, 3, 35, pal.staff || "#6b4f3a");
      art.rect(ctx, -4, -20, 8, 3, rar.color);
      art.pixelCircle(ctx, 0, -22, 5, rar.dark);
      art.pixelCircle(ctx, 0, -22, 3, rar.color);
      art.pixelCircle(ctx, -1, -23, 1, rar.glow);
      if (attacking) art.glow(ctx, 0, -22, 18, effect === "burn" ? "#ff9c4f" : "#b27aff", 0.45);
      else art.glow(ctx, 0, -22, 9, rar.glow, 0.18 + Math.sin(time * 0.08) * 0.04);
      ctx.restore();
    }
  }

  /* ============================================================
     INIMIGOS
     ============================================================ */
  S.drawEnemy = function (ctx, e, theme) {
    const x = e.x, y = e.y, w = e.w, h = e.h;
    const pal = e.palette || enemyPalette(theme);
    art.shadow(ctx, x + w / 2, y + h + 1, w * 0.45, 0.25);
    ctx.save();
    ctx.translate(Math.round(x + w / 2), Math.round(y));
    ctx.scale(e.dir || 1, 1);
    const walk = Math.sin((e.t || 0) * 0.17);

    if (e.type === "walker") {
      art.rect(ctx, -8, 14, 5, 8 + walk * 2, pal.dark);
      art.rect(ctx, 3, 14, 5, 8 - walk * 2, pal.dark);
      art.rect(ctx, -7, 21, 6, 3, pal.dark);
      art.rect(ctx, 2, 21, 6, 3, pal.dark);
      art.rect(ctx, -9, 5, 18, 11, pal.body);
      art.rect(ctx, -7, 3, 14, 4, pal.body2 || pal.body);
      art.rect(ctx, -9, 8, 18, 3, pal.dark);
      art.rect(ctx, 3, 6, 4, 2, pal.eye);
      art.rect(ctx, -7, 11, 9, 1, "rgba(0,0,0,.25)");
      if (theme === "forest") {
        art.rect(ctx, -8, 1, 4, 4, pal.accent);
        art.rect(ctx, 3, 0, 3, 5, pal.accent);
      } else if (theme === "mountain") {
        art.rect(ctx, -7, 2, 3, 3, "#d7e8ef");
        art.rect(ctx, 2, 1, 3, 4, "#d7e8ef");
      } else if (theme === "mine") {
        art.rect(ctx, 4, 4, 4, 1, pal.glow);
        art.rect(ctx, -8, 15, 3, 2, "#855137");
      } else if (theme === "frontier") {
        art.rect(ctx, 2, 3, 5, 1, "#ff8b62");
      } else {
        art.rect(ctx, -8, 2, 3, 3, pal.moss || "#718453");
      }
    } else if (e.type === "flyer") {
      const flap = Math.sin((e.t || 0) * 0.35) * 4;
      ctx.fillStyle = pal.dark;
      ctx.beginPath();
      ctx.moveTo(-3, 5); ctx.lineTo(-16, 1 - flap); ctx.lineTo(-9, 10); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(3, 5); ctx.lineTo(16, 1 - flap); ctx.lineTo(9, 10); ctx.closePath(); ctx.fill();
      art.rect(ctx, -6, 3, 12, 10, pal.body);
      art.rect(ctx, -4, 1, 8, 5, pal.body2 || pal.body);
      art.rect(ctx, 2, 6, 3, 2, pal.eye);
      art.rect(ctx, -7, 12, 3, 3, pal.dark);
      art.rect(ctx, 4, 12, 3, 3, pal.dark);
      if (theme === "frontier" || theme === "mine") art.glow(ctx, 3, 7, 8, pal.glow, 0.25);
    } else {
      // cuspidor
      const charge = e.charge > 0;
      art.rect(ctx, -7, 12, 14, 11, pal.dark);
      art.rect(ctx, -8, 6, 16, 9, pal.body);
      art.rect(ctx, -6, 3, 12, 5, pal.body2 || pal.body);
      art.rect(ctx, -4, 9, 8, 3, "#211814");
      art.rect(ctx, -2, 10, 4, 2, charge ? "#ffde8a" : pal.eye);
      art.rect(ctx, -10, 15, 4, 6, pal.body);
      art.rect(ctx, 6, 15, 4, 6, pal.body);
      if (charge) art.glow(ctx, 0, 11, 13, pal.glow, 0.45);
      if (theme === "mine") {
        art.rect(ctx, -7, 2, 3, 3, "#a7653b");
        art.rect(ctx, 4, 1, 3, 4, "#a7653b");
      }
    }
    if (e.burn > 0) {
      ctx.globalAlpha = 0.6;
      for (let i = 0; i < 3; i++) {
        const fx = -6 + i * 6;
        const fy = 1 - ((e.t * 0.6 + i * 9) % 12);
        ctx.fillStyle = i % 2 ? "#ffad5c" : "#e85e3c";
        ctx.fillRect(fx, fy, 2, 4);
      }
      ctx.globalAlpha = 1;
    }
    if (e.flash > 0) {
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = "#fff4dc";
      ctx.fillRect(-w / 2, 0, w, h);
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    if (e.questTarget) {
      const cx = x + w / 2;
      const cy = y + h / 2;
      art.glow(ctx, cx, cy, Math.max(20, w * 0.9), pal.glow || pal.eye, 0.18 + Math.sin((e.t || 0) * 0.08) * 0.05);
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = pal.glow || pal.eye;
      ctx.fillRect(Math.round(cx) - 2, Math.round(y) - 9, 4, 4);
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = "#f8e6bd";
      ctx.font = "7px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.fillText(String(e.name || "ALVO").toUpperCase(), Math.round(cx), Math.round(y) - 14);
      ctx.restore();
    }
  };

  S.drawNpc = function (ctx, npc, time, questState) {
    const pal = npc.palette || {
      skin: "#a66b4b", hair: "#2b1b17", cloth: "#5c4a3a", accent: "#7de7d8", dark: "#241a16"
    };
    const x = npc.x, y = npc.y, w = npc.w, h = npc.h;
    const bob = Math.sin((time || 0) * 0.045) * 1;
    art.shadow(ctx, x + w / 2, y + h + 1, 10, 0.28);
    ctx.save();
    ctx.translate(Math.round(x + w / 2), Math.round(y + bob));

    // corpo / casaco
    art.rect(ctx, -9, 12, 18, 18, pal.dark);
    art.rect(ctx, -7, 12, 14, 17, pal.cloth);
    art.rect(ctx, -8, 25, 16, 5, pal.dark);
    art.rect(ctx, -6, 16, 12, 3, pal.accent);

    // cabeça
    art.rect(ctx, -5, 3, 10, 9, pal.skin);
    art.rect(ctx, -6, 1, 12, 4, pal.hair);
    art.rect(ctx, -7, 4, 2, 5, pal.hair);
    art.rect(ctx, 5, 4, 2, 5, pal.hair);
    art.rect(ctx, -4, 7, 2, 1, "#1b130f");
    art.rect(ctx, 2, 7, 2, 1, "#1b130f");

    if (npc.kind === "scholar") {
      art.rect(ctx, -10, 0, 20, 5, pal.cloth);
      art.rect(ctx, -11, 4, 4, 13, pal.cloth);
      art.rect(ctx, 7, 4, 4, 13, pal.cloth);
      art.rect(ctx, -9, 19, 18, 2, pal.accent);
      art.rect(ctx, 8, 16, 4, 12, "#6b4f3a");
      art.pixelCircle(ctx, 10, 14, 3, pal.accent);
    } else if (npc.kind === "hunter") {
      art.rect(ctx, -9, 0, 18, 4, pal.cloth);
      art.rect(ctx, -10, 3, 3, 9, pal.cloth);
      art.rect(ctx, 7, 3, 3, 9, pal.cloth);
      art.rect(ctx, 3, -4, 3, 7, pal.accent);
      art.rect(ctx, 5, -2, 4, 2, pal.accent);
      ctx.strokeStyle = "#8c6a44";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-10, 20, 8, -1.2, 1.2);
      ctx.stroke();
    } else if (npc.kind === "climber") {
      art.rect(ctx, -7, 1, 14, 3, pal.cloth);
      art.rect(ctx, -6, 6, 12, 3, pal.accent);
      art.rect(ctx, -10, 10, 4, 17, pal.dark);
      art.rect(ctx, 6, 10, 4, 17, pal.dark);
      art.rect(ctx, 9, 6, 2, 28, "#6b4f3a");
    } else if (npc.kind === "miner") {
      art.rect(ctx, -7, 0, 14, 4, pal.cloth);
      art.rect(ctx, -4, -3, 8, 3, "#6b4f3a");
      art.pixelCircle(ctx, 0, 0, 3, pal.accent);
      art.glow(ctx, 0, 0, 9, pal.accent, 0.28);
      art.rect(ctx, -9, 22, 18, 3, pal.accent);
    } else {
      art.rect(ctx, -8, 0, 16, 5, pal.dark);
      art.rect(ctx, -9, 3, 3, 9, pal.dark);
      art.rect(ctx, 6, 3, 3, 9, pal.dark);
      art.rect(ctx, -2, -7, 4, 8, pal.accent);
      art.rect(ctx, -8, 18, 16, 2, pal.accent);
      art.rect(ctx, 9, 5, 2, 28, "#8a6a3f");
    }
    ctx.restore();

    if (questState) {
      const done = !!questState.complete;
      const accepted = !!questState.accepted;
      const mark = done ? "✦" : "!";
      const color = done ? "#a8d68c" : accepted ? "#ffb066" : "#ffd27a";
      const cx = npc.x + npc.w / 2;
      const cy = npc.y - 9 + Math.sin((time || 0) * 0.08) * 1.5;
      art.glow(ctx, cx, cy + 2, 11, color, 0.16);
      ctx.save();
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = color;
      ctx.font = "bold 11px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.fillText(mark, cx, cy + 3);
      ctx.restore();
    }
  };

  function enemyPalette(theme) {
    if (theme === "forest") return { body: "#5e7d4d", body2: "#78935c", dark: "#2c3d27", eye: "#c9e982", glow: "#a5d774", accent: "#8fb16a" };
    if (theme === "mountain") return { body: "#71839a", body2: "#95a6b8", dark: "#334052", eye: "#bfe6ff", glow: "#a9d6ee", accent: "#d8e6f0" };
    if (theme === "mine") return { body: "#8c583e", body2: "#aa6f4b", dark: "#432b22", eye: "#ffb05a", glow: "#ff8b45", accent: "#c99463" };
    if (theme === "frontier") return { body: "#6a4540", body2: "#85564c", dark: "#2c1b1c", eye: "#ff825f", glow: "#ff6e4a", accent: "#9b5e4b" };
    if (theme === "forge") return { body: "#7a5a45", body2: "#9a7458", dark: "#3a2a22", eye: "#ffb066", glow: "#ff8a4e", accent: "#b7825b" };
    if (theme === "temple") return { body: "#8d846c", body2: "#a49a7d", dark: "#453f35", eye: "#8fe6cb", glow: "#8fe6cb", accent: "#d8bd72" };
    if (theme === "desert") return { body: "#c9b184", body2: "#8f7651", dark: "#3b3024", eye: "#ffcf5e", glow: "#7fd8cf", accent: "#e0b45e" };
    if (theme === "void") return { body: "#35254f", body2: "#55368a", dark: "#120f21", eye: "#e6d6ff", glow: "#b48cff", accent: "#8d6bc7" };
    if (theme === "celestial") return { body: "#d8cfb6", body2: "#f0e6d0", dark: "#7c6a8f", eye: "#fff0b0", glow: "#fff0b0", accent: "#f0cf7c" };
    return { body: "#767b69", body2: "#8d9077", dark: "#3f4439", eye: "#83e3d0", glow: "#73cab9", accent: "#99a17d" };
  }

  /* ============================================================
     CHEFES
     ============================================================ */
  S.drawBoss = function (ctx, b, time) {
    if (b.dead && b.deathTimer > 100) return;
    if (!b.cfg.flying) art.shadow(ctx, b.x + b.w / 2, TP.art.GROUND_Y + 2, b.w * 0.52, 0.35);
    ctx.save();
    ctx.translate(Math.round(b.x + b.w / 2), Math.round(b.y + b.h));
    const tilt = b.state === "charge" ? (b.vx > 0 ? 0.16 : -0.16) : 0;
    ctx.rotate(tilt);
    if (b.facing < 0 && !b.cfg.flying) ctx.scale(-1, 1);
    if (b.flash > 0) ctx.globalAlpha = 0.78 + Math.random() * 0.2;
    if (b.key === "colosso") drawColosso(ctx, b, time);
    else if (b.key === "vulto") drawVulto(ctx, b, time);
    else if (b.key === "corvo") drawCorvo(ctx, b, time);
    else if (b.key === "ferrugem") drawFerrugem(ctx, b, time);
    else if (b.key === "titao") drawTitao(ctx, b, time);
    else if (b.key === "guardiao") drawGuardiao(ctx, b, time);
    else if (b.key === "farao") drawFarao(ctx, b, time);
    else if (b.key === "imperador") drawImperador(ctx, b, time);
    else if (b.key === "arcanjo") drawArcanjo(ctx, b, time);
    else drawRei(ctx, b, time);
    ctx.restore();

    if (b.state === "telegraph" && b.timer > 0) {
      const pulse = 0.2 + Math.sin(time * 0.35) * 0.08;
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = b.key === "rei" ? "#ff7d5c" : "#ffd18a";
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x - 4, b.y - 4, b.w + 8, b.h + 8);
      ctx.restore();
    }
  };

  function drawColosso(ctx, b, time) {
    const c = b.cfg.colors;
    const raise = b.state === "telegraph" || b.state === "slam" ? Math.sin(time * 0.15) * 3 : 0;
    // pernas
    art.rect(ctx, -34, -34, 24, 34, c.dark);
    art.rect(ctx, 10, -34, 24, 34, c.dark);
    art.rect(ctx, -38, -8, 30, 8, c.stone);
    art.rect(ctx, 8, -8, 32, 8, c.stone);
    // torso
    art.rect(ctx, -30, -80, 60, 49, c.stone);
    art.rect(ctx, -36, -72, 10, 32, c.dark);
    art.rect(ctx, 26, -72, 10, 32, c.dark);
    art.rect(ctx, -24, -86, 48, 12, c.stone);
    // cabeça
    art.rect(ctx, -18, -96, 36, 14, c.stone);
    art.rect(ctx, -14, -100, 28, 5, c.moss);
    art.rect(ctx, -10, -88, 7, 3, c.eye);
    art.rect(ctx, 3, -88, 7, 3, c.eye);
    art.glow(ctx, 0, -86, 22, "#7de7d8", 0.25);
    // rachaduras
    art.rect(ctx, -7, -78, 2, 13, c.crack);
    art.rect(ctx, -5, -70, 10, 2, c.crack);
    art.rect(ctx, 13, -59, 2, 12, c.crack);
    // musgo
    art.rect(ctx, -28, -72, 18, 5, c.moss);
    art.rect(ctx, 14, -52, 14, 4, c.moss);
    art.rect(ctx, -22, -47, 8, 3, c.moss);
    art.rect(ctx, -2, -94, 8, 3, c.moss);
    // braços enormes
    const arm = raise;
    ctx.save();
    ctx.translate(-32, -68 - arm);
    ctx.rotate(0.12 + arm * 0.01);
    art.rect(ctx, -13, 0, 16, 34, c.dark);
    art.rect(ctx, -15, 24, 20, 15, c.stone);
    art.rect(ctx, -17, 33, 9, 8, c.crack);
    ctx.restore();
    ctx.save();
    ctx.translate(31, -68 - arm);
    ctx.rotate(-0.12 - arm * 0.01);
    art.rect(ctx, -3, 0, 16, 34, c.dark);
    art.rect(ctx, -5, 24, 20, 15, c.stone);
    art.rect(ctx, 8, 30, 7, 7, c.crack);
    ctx.restore();
    // runas
    art.rect(ctx, -17, -61, 4, 4, "#d7b56a");
    art.rect(ctx, 10, -45, 4, 4, "#d7b56a");
    if (b.phase === 2) art.glow(ctx, 0, -62, 55, "#7de7d8", 0.12);
  }

  function drawVulto(ctx, b, time) {
    const c = b.cfg.colors;
    const float = Math.sin(time * 0.045) * 3;
    ctx.translate(0, float);
    // manto
    ctx.fillStyle = c.cloak2;
    ctx.beginPath();
    ctx.moveTo(-12, -86);
    ctx.lineTo(-26, -54);
    ctx.lineTo(-34, -8);
    ctx.lineTo(-20, -16);
    ctx.lineTo(-12, 0);
    ctx.lineTo(-2, -12);
    ctx.lineTo(6, -2);
    ctx.lineTo(15, -18);
    ctx.lineTo(26, 0);
    ctx.lineTo(28, -48);
    ctx.lineTo(14, -84);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.cloak;
    ctx.beginPath();
    ctx.moveTo(-10, -82);
    ctx.lineTo(-18, -50);
    ctx.lineTo(-12, -10);
    ctx.lineTo(-3, -22);
    ctx.lineTo(5, -8);
    ctx.lineTo(12, -20);
    ctx.lineTo(20, -45);
    ctx.lineTo(10, -82);
    ctx.closePath(); ctx.fill();
    // fissuras de luz
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = c.glow;
    ctx.fillRect(-7, -55, 2, 18);
    ctx.fillRect(4, -42, 2, 12);
    ctx.globalAlpha = 1;
    // crânio
    art.rect(ctx, -12, -101, 24, 17, c.bone);
    art.rect(ctx, -9, -84, 18, 6, c.bone);
    art.rect(ctx, -14, -98, 4, 9, c.bone);
    art.rect(ctx, 10, -98, 4, 9, c.bone);
    art.rect(ctx, -8, -94, 5, 4, c.eye);
    art.rect(ctx, 3, -94, 5, 4, c.eye);
    art.glow(ctx, 0, -92, 28, c.eye, 0.25);
    art.rect(ctx, -4, -87, 8, 2, "#2b2620");
    art.rect(ctx, -2, -85, 4, 1, "#2b2620");
    // galhadas
    ctx.strokeStyle = c.bone;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-9, -101); ctx.lineTo(-26, -122); ctx.lineTo(-30, -132);
    ctx.moveTo(-21, -115); ctx.lineTo(-36, -117);
    ctx.moveTo(-17, -108); ctx.lineTo(-27, -104);
    ctx.moveTo(9, -101); ctx.lineTo(26, -123); ctx.lineTo(31, -134);
    ctx.moveTo(21, -116); ctx.lineTo(37, -119);
    ctx.moveTo(16, -108); ctx.lineTo(28, -104);
    ctx.stroke();
    // mãos esqueléticas
    art.rect(ctx, -38, -54, 12, 4, c.bone);
    art.rect(ctx, -41, -50, 3, 9, c.bone);
    art.rect(ctx, -35, -50, 3, 10, c.bone);
    art.rect(ctx, -29, -50, 3, 8, c.bone);
    art.rect(ctx, 27, -54, 12, 4, c.bone);
    art.rect(ctx, 37, -50, 3, 10, c.bone);
    art.rect(ctx, 31, -50, 3, 9, c.bone);
    // névoa
    ctx.globalAlpha = 0.22;
    art.pixelCircle(ctx, 0, -20, 30, c.cloak);
    ctx.globalAlpha = 1;
    if (b.phase === 2) art.glow(ctx, 0, -70, 70, c.glow, 0.12);
  }

  function drawCorvo(ctx, b, time) {
    const c = b.cfg.colors;
    const flap = Math.sin(time * 0.12) * 14;
    const hover = Math.sin(time * 0.04) * 2;
    ctx.translate(0, hover);
    // asas
    ctx.fillStyle = c.feather2;
    ctx.beginPath();
    ctx.moveTo(-8, -38);
    ctx.lineTo(-70, -48 - flap);
    ctx.lineTo(-56, -18 - flap * 0.5);
    ctx.lineTo(-70, -6 + flap * 0.3);
    ctx.lineTo(-24, -18);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(8, -38);
    ctx.lineTo(70, -48 - flap);
    ctx.lineTo(56, -18 - flap * 0.5);
    ctx.lineTo(70, -6 + flap * 0.3);
    ctx.lineTo(24, -18);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.wing;
    ctx.beginPath();
    ctx.moveTo(-10, -36); ctx.lineTo(-52, -42 - flap); ctx.lineTo(-42, -22 - flap * 0.4);
    ctx.lineTo(-20, -22); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(10, -36); ctx.lineTo(52, -42 - flap); ctx.lineTo(42, -22 - flap * 0.4);
    ctx.lineTo(20, -22); ctx.closePath(); ctx.fill();
    // penas
    ctx.strokeStyle = "rgba(180,195,220,.16)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(-20 - i * 8, -29 - i * 3);
      ctx.lineTo(-45 - i * 5, -22 - i * 4 - flap * 0.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(20 + i * 8, -29 - i * 3);
      ctx.lineTo(45 + i * 5, -22 - i * 4 - flap * 0.5);
      ctx.stroke();
    }
    // corpo
    ctx.fillStyle = c.feather;
    ctx.beginPath();
    ctx.moveTo(-22, -20); ctx.lineTo(-16, -50); ctx.lineTo(0, -58); ctx.lineTo(18, -50);
    ctx.lineTo(24, -20); ctx.lineTo(10, -2); ctx.lineTo(-8, -2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.feather2;
    ctx.fillRect(-12, -30, 24, 24);
    // cabeça
    art.rect(ctx, -17, -62, 30, 18, c.feather);
    art.rect(ctx, -12, -66, 22, 6, c.feather2);
    // bico
    ctx.fillStyle = c.beak;
    ctx.beginPath();
    ctx.moveTo(12, -55); ctx.lineTo(35, -48); ctx.lineTo(14, -42); ctx.closePath(); ctx.fill();
    // olho vermelho
    art.rect(ctx, 5, -58, 7, 4, c.eye);
    art.glow(ctx, 8, -56, 24, c.eye, 0.3);
    // garras
    ctx.strokeStyle = c.beak;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, -2); ctx.lineTo(-14, 4); ctx.moveTo(-6, -2); ctx.lineTo(-6, 5);
    ctx.moveTo(10, -2); ctx.lineTo(14, 4); ctx.moveTo(6, -2); ctx.lineTo(6, 5);
    ctx.stroke();
    if (b.phase === 2) art.glow(ctx, 0, -35, 82, "#ff5d54", 0.08);
  }

  function drawFerrugem(ctx, b, time) {
    const c = b.cfg.colors;
    const twitch = Math.sin(time * 0.16) * 2;
    // patas
    ctx.strokeStyle = c.metal;
    ctx.lineWidth = 5;
    for (let i = 0; i < 3; i++) {
      const sx = -30 + i * 30;
      const sway = Math.sin(time * 0.08 + i) * 4;
      ctx.beginPath();
      ctx.moveTo(sx, -26);
      ctx.lineTo(sx - 22 - i * 4, -10);
      ctx.lineTo(sx - 32 - i * 5 + sway, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sx, -26);
      ctx.lineTo(sx + 22 + i * 4, -10);
      ctx.lineTo(sx + 32 + i * 5 - sway, 0);
      ctx.stroke();
    }
    // corpo
    ctx.fillStyle = c.rust;
    ctx.beginPath();
    ctx.ellipse(0, -40, 44, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.metal;
    ctx.beginPath();
    ctx.ellipse(0, -44, 34, 17, 0, 0, Math.PI * 2);
    ctx.fill();
    // placas
    art.rect(ctx, -36, -54, 20, 6, c.rust);
    art.rect(ctx, 14, -38, 22, 5, c.rust);
    art.rect(ctx, -18, -58, 10, 4, "#a86a45");
    // núcleo
    art.pixelCircle(ctx, 0, -42, 13, "#2b1812");
    art.pixelCircle(ctx, 0, -42, 9, c.core);
    art.pixelCircle(ctx, -2, -44, 4, c.glow);
    art.glow(ctx, 0, -42, 55, c.glow, 0.22 + Math.sin(time * 0.08) * 0.05);
    // cabeça / pinças
    art.rect(ctx, -18, -65, 36, 18, c.metal);
    art.rect(ctx, -14, -70, 28, 8, c.rust);
    art.rect(ctx, -11, -61, 8, 4, c.eye);
    art.rect(ctx, 3, -61, 8, 4, c.eye);
    art.glow(ctx, 0, -59, 20, c.eye, 0.2);
    ctx.fillStyle = c.metal;
    ctx.beginPath();
    ctx.moveTo(-17, -66); ctx.lineTo(-34, -74); ctx.lineTo(-30, -58); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(17, -66); ctx.lineTo(34, -74); ctx.lineTo(30, -58); ctx.closePath(); ctx.fill();
    // chaminé
    art.rect(ctx, 22, -78, 8, 22, c.dark);
    art.rect(ctx, 20, -80, 12, 4, c.rust);
    // fumaça
    for (let i = 0; i < 4; i++) {
      ctx.globalAlpha = 0.18 - i * 0.03;
      art.pixelCircle(ctx, 26 + Math.sin(time * 0.02 + i) * 5, -90 - i * 10, 5 + i * 2, "#b6a79c");
    }
    ctx.globalAlpha = 1;
    // rachaduras de ferrugem
    art.rect(ctx, -28, -32, 16, 2, c.dark);
    art.rect(ctx, 10, -24, 12, 2, c.dark);
    if (twitch > 1.5) art.rect(ctx, -5, -30, 2, 4, c.eye);
    if (b.phase === 2) art.glow(ctx, 0, -40, 83, c.core, 0.1);
  }

  function drawRei(ctx, b, time) {
    const c = b.cfg.colors;
    const phase2 = b.phase === 2;
    const breath = Math.sin(time * 0.05) * 1.5;
    // capa
    ctx.fillStyle = c.cape;
    ctx.beginPath();
    ctx.moveTo(-22, -80);
    ctx.lineTo(-42 - Math.sin(time * 0.04) * 4, -34);
    ctx.lineTo(-34, -6);
    ctx.lineTo(-8, -18);
    ctx.lineTo(4, -4);
    ctx.lineTo(30, -22);
    ctx.lineTo(38, -44);
    ctx.lineTo(20, -80);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(30,10,12,.4)";
    ctx.fillRect(-30, -68, 12, 38);
    // pernas
    art.rect(ctx, -18, -32, 14, 32, c.armor);
    art.rect(ctx, 4, -32, 14, 32, c.armor);
    art.rect(ctx, -20, -9, 18, 9, "#0e0d10");
    art.rect(ctx, 2, -9, 20, 9, "#0e0d10");
    art.rect(ctx, -18, -17, 14, 3, c.gold);
    art.rect(ctx, 4, -17, 14, 3, c.gold);
    // torso
    art.rect(ctx, -22, -79, 44, 49, c.armor);
    art.rect(ctx, -16, -73, 32, 20, "#25232a");
    art.rect(ctx, -2, -72, 4, 36, c.gold);
    art.rect(ctx, -20, -39, 40, 5, c.gold);
    // ombreiras
    ctx.fillStyle = c.armor;
    ctx.beginPath(); ctx.moveTo(-22, -78); ctx.lineTo(-37, -70); ctx.lineTo(-34, -54); ctx.lineTo(-18, -58); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(22, -78); ctx.lineTo(37, -70); ctx.lineTo(34, -54); ctx.lineTo(18, -58); ctx.closePath(); ctx.fill();
    art.rect(ctx, -36, -68, 4, 9, c.gold);
    art.rect(ctx, 32, -68, 4, 9, c.gold);
    // cabeça/elmo
    art.rect(ctx, -14, -97, 28, 19, c.armor);
    art.rect(ctx, -11, -93, 22, 3, "#0e0d10");
    art.rect(ctx, -8, -88, 5, 3, c.eye);
    art.rect(ctx, 3, -88, 5, 3, c.eye);
    art.glow(ctx, 0, -86, 20, c.eye, 0.22);
    // coroa
    art.rect(ctx, -15, -104, 30, 7, c.crown);
    art.rect(ctx, -15, -111, 5, 8, c.crown);
    art.rect(ctx, -4, -115, 6, 12, c.crown);
    art.rect(ctx, 9, -110, 5, 7, c.crown);
    art.pixelCircle(ctx, 0, -112, 2, "#ffdf9c");
    // espada longa
    ctx.save();
    ctx.translate(30, -56);
    ctx.rotate(b.state === "telegraph" ? -0.7 : 0.22);
    art.rect(ctx, -2, 0, 5, 17, "#3a2a20");
    art.rect(ctx, -8, -3, 17, 4, c.gold);
    art.rect(ctx, -2, -62, 4, 60, "#c7c5bd");
    art.rect(ctx, 1, -62, 2, 58, "#7d8087");
    ctx.fillStyle = "#e4e0d4";
    ctx.beginPath(); ctx.moveTo(-2, -62); ctx.lineTo(0, -73); ctx.lineTo(2, -62); ctx.closePath(); ctx.fill();
    if (phase2) art.glow(ctx, 0, -40, 30, "#ff6a52", 0.28);
    ctx.restore();
    // aura da fase 2
    if (phase2) {
      art.glow(ctx, 0, -55, 85, "#ff5d3a", 0.13);
      for (let i = 0; i < 8; i++) {
        const a = time * 0.03 + (i / 8) * Math.PI * 2;
        const x = Math.cos(a) * (36 + (i % 3) * 8);
        const y = -55 + Math.sin(a) * (42 + (i % 2) * 12);
        ctx.globalAlpha = 0.3 + Math.sin(time * 0.1 + i) * 0.15;
        ctx.fillStyle = i % 2 ? "#ff8d5c" : "#a8362c";
        ctx.fillRect(x, y, 2, 5);
      }
      ctx.globalAlpha = 1;
    }
    // respiração
    ctx.globalAlpha = 0.08;
    art.rect(ctx, -22, -79 + breath, 44, 2, "#ffb06e");
    ctx.globalAlpha = 1;
  }

  function drawTitao(ctx, b, time) {
    const c = b.cfg.colors;
    const pulse = Math.sin(time * 0.07) * 2;
    const step = Math.sin(time * 0.06) * 4;
    // pernas hidráulicas
    ctx.strokeStyle = c.dark;
    ctx.lineWidth = 8;
    for (let i = 0; i < 2; i++) {
      const sx = -28 + i * 56;
      ctx.beginPath();
      ctx.moveTo(sx, -34);
      ctx.lineTo(sx - 16 - i * 4, -16);
      ctx.lineTo(sx - 24 - i * 5 + step, 0);
      ctx.stroke();
      ctx.fillStyle = c.metal;
      ctx.fillRect(sx - 32 - i * 5 + step, -6, 18, 7);
    }
    // torso
    art.rect(ctx, -42, -76, 84, 44, c.metal);
    art.rect(ctx, -34, -70, 68, 22, c.dark);
    art.rect(ctx, -10, -72, 20, 36, c.rust);
    art.rect(ctx, -38, -78, 76, 7, c.rust);
    // placas e parafusos
    art.rect(ctx, -32, -62, 10, 4, "#b58a62");
    art.rect(ctx, 22, -62, 10, 4, "#b58a62");
    art.rect(ctx, -28, -48, 8, 3, c.dark);
    art.rect(ctx, 20, -48, 8, 3, c.dark);
    // núcleo
    art.pixelCircle(ctx, 0, -53, 15, "#1a100c");
    art.pixelCircle(ctx, 0, -53, 10, c.core);
    art.pixelCircle(ctx, -2, -55, 4, c.glow);
    art.glow(ctx, 0, -53, 58 + pulse, c.glow, 0.18);
    // cabeça
    art.rect(ctx, -22, -93, 44, 20, c.metal);
    art.rect(ctx, -16, -98, 32, 7, c.rust);
    art.rect(ctx, -12, -88, 8, 4, c.eye);
    art.rect(ctx, 4, -88, 8, 4, c.eye);
    art.glow(ctx, 0, -86, 24, c.eye, 0.24);
    // chaminés
    art.rect(ctx, -38, -96, 8, 22, c.dark);
    art.rect(ctx, 30, -92, 8, 18, c.dark);
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 3; i++) {
      art.pixelCircle(ctx, -34 + Math.sin(time * 0.03 + i) * 5, -104 - i * 8, 5 + i * 2, "#c7a58c");
      art.pixelCircle(ctx, 34 + Math.sin(time * 0.025 + i) * 4, -100 - i * 7, 4 + i * 2, "#c7a58c");
    }
    ctx.globalAlpha = 1;
    // braço-martelo
    ctx.save();
    ctx.translate(44, -64);
    ctx.rotate(b.state === "telegraph" ? -0.5 : 0.18);
    art.rect(ctx, -4, 0, 9, 34, c.dark);
    art.rect(ctx, -12, 32, 26, 16, c.rust);
    art.rect(ctx, -8, 35, 18, 5, c.metal);
    if (b.phase === 2) art.glow(ctx, 0, 36, 26, c.core, 0.2);
    ctx.restore();
    if (b.phase === 2) art.glow(ctx, 0, -50, 92, c.core, 0.12);
  }

  function drawGuardiao(ctx, b, time) {
    const c = b.cfg.colors;
    // pernas
    art.rect(ctx, -28, -34, 20, 34, c.dark);
    art.rect(ctx, 8, -34, 20, 34, c.dark);
    art.rect(ctx, -30, -8, 24, 8, c.stone);
    art.rect(ctx, 6, -8, 24, 8, c.stone);
    // torso de pedra
    art.rect(ctx, -34, -78, 68, 48, c.stone);
    art.rect(ctx, -28, -74, 56, 18, c.dark);
    art.rect(ctx, -6, -76, 12, 38, c.moss);
    art.rect(ctx, -30, -80, 60, 6, c.gold);
    // rachaduras
    art.rect(ctx, -22, -62, 3, 14, c.dark);
    art.rect(ctx, -19, -52, 10, 3, c.dark);
    art.rect(ctx, 12, -70, 3, 18, c.dark);
    // ombreiras
    ctx.fillStyle = c.dark;
    ctx.beginPath(); ctx.moveTo(-34, -76); ctx.lineTo(-48, -66); ctx.lineTo(-42, -48); ctx.lineTo(-26, -54); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(34, -76); ctx.lineTo(48, -66); ctx.lineTo(42, -48); ctx.lineTo(26, -54); ctx.closePath(); ctx.fill();
    art.rect(ctx, -46, -62, 4, 9, c.gold);
    art.rect(ctx, 42, -62, 4, 9, c.gold);
    // cabeça
    art.rect(ctx, -20, -98, 40, 22, c.stone);
    art.rect(ctx, -16, -101, 32, 6, c.gold);
    art.rect(ctx, -12, -90, 7, 4, c.eye);
    art.rect(ctx, 5, -90, 7, 4, c.eye);
    art.glow(ctx, 0, -88, 24, c.eye, 0.18);
    // barba de pedra
    art.rect(ctx, -13, -80, 26, 4, c.moss);
    // escudo
    ctx.save();
    ctx.translate(-46, -56);
    ctx.fillStyle = c.dark;
    ctx.beginPath();
    ctx.moveTo(0, -24); ctx.lineTo(24, -14); ctx.lineTo(22, 20); ctx.lineTo(0, 32); ctx.lineTo(-22, 20); ctx.lineTo(-24, -14);
    ctx.closePath(); ctx.fill();
    art.rect(ctx, -10, -10, 20, 18, c.stone);
    art.rect(ctx, -2, -18, 4, 34, c.gold);
    ctx.restore();
    // lança
    ctx.save();
    ctx.translate(44, -58);
    ctx.rotate(b.state === "telegraph" ? -0.5 : -0.08);
    art.rect(ctx, -2, -52, 4, 82, "#6b5a3d");
    ctx.fillStyle = "#d8c58a";
    ctx.beginPath(); ctx.moveTo(-6, -52); ctx.lineTo(0, -74); ctx.lineTo(6, -52); ctx.closePath(); ctx.fill();
    if (b.phase === 2) art.glow(ctx, 0, -60, 26, c.gold, 0.2);
    ctx.restore();
    // poeira
    ctx.globalAlpha = 0.16;
    for (let i = 0; i < 5; i++) {
      art.pixelCircle(ctx, -30 + i * 15, -10 + Math.sin(time * 0.05 + i) * 3, 4 + (i % 2) * 2, c.gold);
    }
    ctx.globalAlpha = 1;
    if (b.phase === 2) art.glow(ctx, 0, -50, 86, c.eye, 0.1);
  }

  function drawFarao(ctx, b, time) {
    const c = b.cfg.colors;
    const float = Math.sin(time * 0.05) * 3;
    // pernas / faixas
    art.rect(ctx, -20, -34 + float, 14, 34, c.bandage2);
    art.rect(ctx, 6, -34 + float, 14, 34, c.bandage2);
    art.rect(ctx, -24, -8 + float, 20, 8, c.gold);
    art.rect(ctx, 4, -8 + float, 20, 8, c.gold);
    // torso
    art.rect(ctx, -28, -76 + float, 56, 45, c.bandage);
    art.rect(ctx, -24, -70 + float, 48, 8, c.bandage2);
    art.rect(ctx, -24, -54 + float, 48, 7, c.bandage2);
    art.rect(ctx, -24, -38 + float, 48, 5, c.bandage2);
    // colar
    art.rect(ctx, -22, -78 + float, 44, 6, c.gold);
    art.pixelCircle(ctx, 0, -75 + float, 4, c.glass);
    // braços
    art.rect(ctx, -40, -72 + float, 12, 38, c.bandage2);
    art.rect(ctx, 28, -72 + float, 12, 38, c.bandage2);
    art.rect(ctx, -42, -38 + float, 14, 7, c.gold);
    art.rect(ctx, 28, -38 + float, 14, 7, c.gold);
    // cabeça
    art.rect(ctx, -17, -95 + float, 34, 22, c.bandage);
    art.rect(ctx, -14, -92 + float, 28, 5, c.bandage2);
    art.rect(ctx, -9, -86 + float, 6, 3, c.eye);
    art.rect(ctx, 4, -86 + float, 6, 3, c.eye);
    art.glow(ctx, 0, -85 + float, 18, c.eye, 0.2);
    // nemes
    art.rect(ctx, -24, -101 + float, 48, 7, c.gold);
    art.rect(ctx, -20, -107 + float, 40, 7, c.gold);
    art.rect(ctx, -26, -96 + float, 8, 22, c.gold);
    art.rect(ctx, 18, -96 + float, 8, 22, c.gold);
    art.rect(ctx, -2, -110 + float, 4, 10, c.glass);
    // cajado de vidro
    ctx.save();
    ctx.translate(36, -58 + float);
    ctx.rotate(b.state === "telegraph" ? -0.35 : 0.1);
    art.rect(ctx, -2, -34, 4, 74, c.gold);
    art.pixelCircle(ctx, 0, -38, 10, c.glass);
    art.pixelCircle(ctx, -2, -40, 4, "#e9ffff");
    art.glow(ctx, 0, -38, 28, c.glass, 0.22);
    ctx.restore();
    // escaravelhos de vidro
    for (let i = 0; i < 4; i++) {
      const a = time * 0.03 + i * 1.7;
      const x = Math.cos(a) * (38 + i * 5);
      const y = -52 + Math.sin(a * 1.3) * 24 + float;
      ctx.fillStyle = c.glass;
      ctx.fillRect(x, y, 4, 3);
      ctx.fillStyle = "rgba(255,255,255,.35)";
      ctx.fillRect(x + 1, y - 1, 1, 1);
    }
    if (b.phase === 2) art.glow(ctx, 0, -50 + float, 84, c.glass, 0.12);
  }

  function drawImperador(ctx, b, time) {
    const c = b.cfg.colors;
    const float = Math.sin(time * 0.045) * 5;
    // manto flutuante
    ctx.fillStyle = c.cloak;
    ctx.beginPath();
    ctx.moveTo(-26, -78 + float);
    ctx.lineTo(-54 - Math.sin(time * 0.04) * 6, -30 + float);
    ctx.lineTo(-38, -2 + float);
    ctx.lineTo(-10, -18 + float);
    ctx.lineTo(6, -4 + float);
    ctx.lineTo(38, -22 + float);
    ctx.lineTo(52, -42 + float);
    ctx.lineTo(24, -78 + float);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.cloak2;
    ctx.beginPath();
    ctx.moveTo(-18, -70 + float);
    ctx.lineTo(-34, -28 + float);
    ctx.lineTo(-18, -14 + float);
    ctx.lineTo(0, -48 + float);
    ctx.lineTo(18, -12 + float);
    ctx.lineTo(34, -30 + float);
    ctx.lineTo(16, -70 + float);
    ctx.closePath(); ctx.fill();
    // torso
    art.rect(ctx, -20, -82 + float, 40, 42, c.cloak2);
    art.rect(ctx, -14, -76 + float, 28, 8, c.gold);
    art.rect(ctx, -2, -74 + float, 4, 30, c.gold);
    // ombreiras
    ctx.fillStyle = c.void;
    ctx.beginPath(); ctx.moveTo(-20, -80 + float); ctx.lineTo(-38, -70 + float); ctx.lineTo(-30, -52 + float); ctx.lineTo(-14, -60 + float); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(20, -80 + float); ctx.lineTo(38, -70 + float); ctx.lineTo(30, -52 + float); ctx.lineTo(14, -60 + float); ctx.closePath(); ctx.fill();
    // cabeça
    art.rect(ctx, -14, -100 + float, 28, 20, c.cloak2);
    art.rect(ctx, -10, -96 + float, 20, 4, c.void);
    art.rect(ctx, -7, -89 + float, 5, 3, c.eye);
    art.rect(ctx, 2, -89 + float, 5, 3, c.eye);
    art.glow(ctx, 0, -88 + float, 20, c.eye, 0.18);
    // coroa de vazio
    art.rect(ctx, -16, -108 + float, 32, 5, c.gold);
    art.rect(ctx, -14, -116 + float, 4, 9, c.gold);
    art.rect(ctx, -3, -120 + float, 6, 13, c.gold);
    art.rect(ctx, 10, -114 + float, 4, 7, c.gold);
    art.pixelCircle(ctx, 0, -118 + float, 3, c.glow);
    // orbe
    art.pixelCircle(ctx, 0, -58 + float, 13, "#0b0814");
    art.pixelCircle(ctx, 0, -58 + float, 8, c.void);
    art.pixelCircle(ctx, -2, -60 + float, 3, c.eye);
    art.glow(ctx, 0, -58 + float, 44, c.glow, 0.2);
    // tentáculos de vazio
    ctx.strokeStyle = c.glow;
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const a = time * 0.03 + i * 1.25;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 22, -54 + float + Math.sin(a) * 18);
      ctx.lineTo(Math.cos(a) * 42, -34 + float + Math.sin(a) * 28);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    if (b.phase === 2) art.glow(ctx, 0, -56 + float, 100, c.glow, 0.1);
  }

  function drawArcanjo(ctx, b, time) {
    const c = b.cfg.colors;
    const float = Math.sin(time * 0.04) * 4;
    const wingSwing = Math.sin(time * 0.05) * 8;
    // asas
    ctx.save();
    ctx.translate(0, -62 + float);
    for (let side = -1; side <= 1; side += 2) {
      ctx.fillStyle = c.wing;
      for (let f = 0; f < 5; f++) {
        ctx.beginPath();
        ctx.moveTo(side * 12, 0);
        ctx.lineTo(side * (30 + f * 14), -22 - f * 7 + wingSwing * (f / 5));
        ctx.lineTo(side * (42 + f * 16), -2 - f * 5 + wingSwing * (f / 5));
        ctx.lineTo(side * (24 + f * 12), 12 - f * 2);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = f % 2 ? c.wing2 : c.wing;
      }
    }
    ctx.restore();
    // robe
    ctx.fillStyle = c.robe;
    ctx.beginPath();
    ctx.moveTo(-24, -74 + float);
    ctx.lineTo(-34, -18 + float);
    ctx.lineTo(-18, -6 + float);
    ctx.lineTo(0, -22 + float);
    ctx.lineTo(18, -6 + float);
    ctx.lineTo(34, -18 + float);
    ctx.lineTo(24, -74 + float);
    ctx.closePath(); ctx.fill();
    art.rect(ctx, -18, -70 + float, 36, 34, c.dark);
    art.rect(ctx, -2, -72 + float, 4, 42, c.gold);
    // torso / ombros
    art.rect(ctx, -20, -82 + float, 40, 18, c.robe);
    art.rect(ctx, -24, -80 + float, 8, 22, c.gold);
    art.rect(ctx, 16, -80 + float, 8, 22, c.gold);
    // cabeça
    art.rect(ctx, -12, -100 + float, 24, 20, "#d8c7a8");
    art.rect(ctx, -8, -95 + float, 5, 3, c.eye);
    art.rect(ctx, 3, -95 + float, 5, 3, c.eye);
    art.glow(ctx, 0, -94 + float, 18, c.eye, 0.16);
    // cabelo / auréola
    art.rect(ctx, -14, -104 + float, 28, 6, c.wing2);
    ctx.strokeStyle = c.halo;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, -116 + float, 22, 7, 0, 0, Math.PI * 2);
    ctx.stroke();
    art.glow(ctx, 0, -116 + float, 34, c.halo, 0.18);
    // lança de luz
    ctx.save();
    ctx.translate(40, -58 + float);
    ctx.rotate(b.state === "telegraph" ? -0.5 : 0.08);
    art.rect(ctx, -2, -46, 4, 84, c.gold);
    ctx.fillStyle = c.halo;
    ctx.beginPath(); ctx.moveTo(-8, -46); ctx.lineTo(0, -72); ctx.lineTo(8, -46); ctx.closePath(); ctx.fill();
    art.glow(ctx, 0, -58, 30, c.halo, 0.2);
    ctx.restore();
    // penas soltas
    for (let i = 0; i < 7; i++) {
      const a = time * 0.025 + i * 0.9;
      const x = Math.cos(a) * (38 + (i % 3) * 8);
      const y = -46 + float + Math.sin(a * 1.4) * 28;
      ctx.globalAlpha = 0.3 + (i % 3) * 0.08;
      ctx.fillStyle = i % 2 ? c.halo : c.wing;
      ctx.fillRect(x, y, 4, 2);
    }
    ctx.globalAlpha = 1;
    if (b.phase === 2) art.glow(ctx, 0, -58 + float, 112, c.halo, 0.12);
  }

  /* ============================================================
     PROJÉTEIS
     ============================================================ */
  S.drawProjectile = function (ctx, pr, time) {
    const x = Math.round(pr.x), y = Math.round(pr.y);
    if (pr.kind === "arrow") {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.atan2(pr.vy || 0, pr.vx || 1));
      art.rect(ctx, -7, -1, 14, 2, "#d9cda9");
      art.rect(ctx, 5, -2, 4, 4, "#e7dfc7");
      art.rect(ctx, -9, -3, 3, 6, pr.color || "#c9a15e");
      art.rect(ctx, -12, -1, 4, 1, "rgba(220,235,220,.4)");
      ctx.restore();
      return;
    }
    if (pr.kind === "spell") {
      art.glow(ctx, x, y, 22, pr.color || "#c9a6ff", 0.4);
      art.pixelCircle(ctx, x, y, pr.r || 5, pr.color || "#a988e8");
      art.pixelCircle(ctx, x - 1, y - 1, Math.max(2, (pr.r || 5) - 3), "#f1e7ff");
      return;
    }
    if (pr.kind === "rock") {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(time * 0.08);
      ctx.fillStyle = pr.color || "#8d8063";
      ctx.beginPath();
      ctx.moveTo(-7, -5); ctx.lineTo(2, -8); ctx.lineTo(8, -2); ctx.lineTo(5, 6); ctx.lineTo(-4, 7); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.12)";
      ctx.fillRect(-3, -4, 5, 2);
      ctx.restore();
      return;
    }
    if (pr.kind === "feather") {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((pr.rot || 0) + time * 0.14);
      ctx.fillStyle = pr.color || "#8fa3bd";
      ctx.beginPath();
      ctx.moveTo(-6, 1); ctx.lineTo(2, -4); ctx.lineTo(7, 0); ctx.lineTo(0, 4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(15,18,26,.35)";
      ctx.fillRect(-2, 0, 1, 10);
      ctx.restore();
      return;
    }
    if (pr.kind === "shock") {
      const w = pr.w || 34, h = pr.h || 38;
      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = pr.color || "#e6ad64";
      for (let i = 0; i < 4; i++) {
        const sx = x - w / 2 + i * (w / 4);
        const hh = h * (0.55 + (i % 2) * 0.35);
        ctx.beginPath();
        ctx.moveTo(sx, y + h);
        ctx.lineTo(sx + w / 8, y + h - hh);
        ctx.lineTo(sx + w / 4, y + h);
        ctx.closePath(); ctx.fill();
      }
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = "#fff0c4";
      ctx.fillRect(x - w / 2, y + h - 4, w, 3);
      ctx.restore();
      return;
    }
    if (pr.kind === "beam") {
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = pr.color || "#ffb06e";
      ctx.fillRect(x - 3, y - (pr.h || 50), 6, pr.h || 50);
      ctx.globalAlpha = 0.25;
      ctx.fillRect(x - 9, y - (pr.h || 50) + 3, 18, (pr.h || 50) - 4);
      ctx.restore();
      return;
    }
    if (pr.kind === "pillar") {
      if (pr.warning > 0) {
        ctx.save();
        ctx.globalAlpha = 0.25 + Math.sin(time * 0.4) * 0.1;
        ctx.fillStyle = pr.color || "#ff8054";
        ctx.fillRect(x - 16, 0, 32, TP.art.GROUND_Y);
        ctx.strokeStyle = pr.color || "#ffb07e";
        ctx.strokeRect(x - 12, 0, 24, TP.art.GROUND_Y);
        ctx.restore();
      } else {
        ctx.save();
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = pr.color || "#ff8d54";
        for (let i = 0; i < 7; i++) {
          const ww = 18 - i * 2;
          ctx.fillRect(x - ww / 2 + Math.sin(time * 0.2 + i) * 2, TP.art.GROUND_Y - i * 28, ww, 30);
        }
        art.glow(ctx, x, TP.art.GROUND_Y - 80, 45, pr.color || "#ff9d54", 0.25);
        ctx.restore();
      }
      return;
    }
    // orb / wisp / spit
    const r = pr.r || 6;
    art.glow(ctx, x, y, r * 3.4, pr.color || "#ffb06e", 0.32);
    art.pixelCircle(ctx, x, y, r, pr.color || "#ffb06e");
    art.pixelCircle(ctx, x - 1, y - 1, Math.max(1, r - 3), "#ffe9c2");
  };

  /* ============================================================
     COLETÁVEIS E CENÁRIO INTERATIVO
     ============================================================ */
  S.drawMemory = function (ctx, m, time) {
    if (m.taken) return;
    const y = m.y + Math.sin(time * 0.05 + m.x) * 3;
    const pulse = 0.5 + Math.sin(time * 0.07 + m.x) * 0.2;
    art.glow(ctx, m.x, y, 27, "#ffd58a", pulse * 0.35);
    ctx.save();
    ctx.translate(m.x, y);
    ctx.rotate(Math.sin(time * 0.02) * 0.15);
    ctx.fillStyle = "#b98b44";
    ctx.beginPath();
    ctx.moveTo(0, -12); ctx.lineTo(9, 0); ctx.lineTo(0, 12); ctx.lineTo(-9, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#ffe6a6";
    ctx.beginPath();
    ctx.moveTo(0, -8); ctx.lineTo(5, 0); ctx.lineTo(0, 8); ctx.lineTo(-5, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#8e6b32";
    ctx.fillRect(-1, -5, 2, 10);
    ctx.fillRect(-4, -1, 8, 2);
    ctx.restore();
    // faíscas orbitando
    for (let i = 0; i < 3; i++) {
      const a = time * 0.03 + i * 2.1;
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = "#ffe8b0";
      ctx.fillRect(m.x + Math.cos(a) * 14, y + Math.sin(a) * 9, 1, 1);
    }
    ctx.globalAlpha = 1;
  };

  S.drawHeal = function (ctx, h, time) {
    if (h.taken) return;
    const y = h.y + Math.sin(time * 0.05 + h.x) * 2;
    art.glow(ctx, h.x, y, 17, "#ff8c72", 0.2);
    art.rect(ctx, h.x - 4, y - 7, 8, 4, "#b9a980");
    art.rect(ctx, h.x - 3, y - 5, 6, 2, "#6c4930");
    art.rect(ctx, h.x - 5, y - 3, 10, 9, "#762f2c");
    art.rect(ctx, h.x - 4, y - 2, 8, 7, "#c25042");
    art.rect(ctx, h.x - 2, y, 4, 3, "#ffb39c");
    art.rect(ctx, h.x - 6, y + 6, 12, 2, "#473329");
  };

  S.drawCheckpoint = function (ctx, cp, time, theme) {
    const y = cp.y;
    art.shadow(ctx, cp.x, y + 2, 14, 0.3);
    // pedestal de pedra
    art.rect(ctx, cp.x - 8, y - 18, 16, 18, "#4d493e");
    art.rect(ctx, cp.x - 10, y - 8, 20, 5, "#655f4d");
    art.rect(ctx, cp.x - 6, y - 23, 12, 6, "#39362e");
    if (cp.lit) {
      art.glow(ctx, cp.x, y - 30, 40, "#ffb15e", 0.22 + Math.sin(time * 0.09) * 0.04);
      for (let i = 0; i < 3; i++) {
        const fw = 8 - i * 2;
        ctx.fillStyle = i === 0 ? "#e36e3a" : i === 1 ? "#ffad5a" : "#ffe6a0";
        ctx.fillRect(cp.x - fw / 2 + Math.sin(time * 0.14 + i) * 1, y - 34 - i * 5, fw, 9 + i * 2);
      }
    } else {
      art.rect(ctx, cp.x - 3, y - 27, 6, 5, "#2c2a25");
      art.rect(ctx, cp.x - 1, y - 31, 2, 5, "#4a4030");
    }
  };

  S.drawGate = function (ctx, x, time, active) {
    if (!active) return;
    ctx.save();
    const g = ctx.createLinearGradient(x, 0, x + 20, 0);
    g.addColorStop(0, "rgba(255,150,80,0)");
    g.addColorStop(0.5, "rgba(255,164,92,.22)");
    g.addColorStop(1, "rgba(255,150,80,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - 14, 80, 48, 240);
    ctx.strokeStyle = "rgba(255,190,110,.5)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const yy = 120 + i * 38;
      ctx.beginPath();
      ctx.moveTo(x - 8, yy + Math.sin(time * 0.05 + i) * 3);
      ctx.lineTo(x + 8, yy + 20 + Math.cos(time * 0.05 + i) * 3);
      ctx.stroke();
    }
    ctx.restore();
  };

  TP.sprites = S;
})();
