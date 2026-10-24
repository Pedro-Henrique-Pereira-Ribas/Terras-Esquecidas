/* ============================================================
   TERRA PERDIDA — helpers de arte procedural
   ============================================================ */
(function () {
  "use strict";
  const TP = (window.TP = window.TP || {});

  const art = {
    W: 640, H: 360, GROUND_Y: 320,
    portraitCache: {}, weaponCache: {}, pedroCache: null, npcPortraitCache: {},
    THEMES: {
      ruins: {
        skyTop: "#31475e", skyMid: "#68899c", skyLow: "#c5b38e",
        far: "#485c66", mid: "#4e5e59", near: "#344038",
        ground: "#686852", groundDark: "#454637", top: "#8d8a68",
        moss: "#6b7e4f", light: "#f4dfac", fog: "rgba(207,213,188,.10)",
        hazard: "#314b55", accent: "#e0c27c"
      },
      forest: {
        skyTop: "#0d3030", skyMid: "#24524d", skyLow: "#638a72",
        far: "#23443d", mid: "#18352d", near: "#0e241e",
        ground: "#3d4b36", groundDark: "#263026", top: "#6b7b4e",
        moss: "#72975c", light: "#d8eaa0", fog: "rgba(129,185,151,.08)",
        hazard: "#1c4b4b", accent: "#a9d88e"
      },
      mountain: {
        skyTop: "#101b32", skyMid: "#263b5b", skyLow: "#7280a0",
        far: "#364a63", mid: "#293448", near: "#171d2a",
        ground: "#586270", groundDark: "#343b47", top: "#d9dde4",
        moss: "#8fa1b4", light: "#d7e7ff", fog: "rgba(183,207,232,.09)",
        hazard: "#25394e", accent: "#a9c7ee"
      },
      mine: {
        skyTop: "#1a1210", skyMid: "#38231b", skyLow: "#5b3525",
        far: "#3b2a24", mid: "#2a1d19", near: "#1a1210",
        ground: "#5b4939", groundDark: "#382c23", top: "#8c6a46",
        moss: "#8f5d35", light: "#ff9d54", fog: "rgba(182,111,65,.07)",
        hazard: "#67311f", accent: "#ffb066"
      },
      frontier: {
        skyTop: "#1b0c13", skyMid: "#521b20", skyLow: "#b24f35",
        far: "#3b1b21", mid: "#241218", near: "#130b0e",
        ground: "#3a2f2d", groundDark: "#241d1b", top: "#6e5143",
        moss: "#79362c", light: "#ffb072", fog: "rgba(157,91,68,.08)",
        hazard: "#4d1e1b", accent: "#ff8a5c"
      },
      forge: {
        skyTop: "#120d0c", skyMid: "#3b1c14", skyLow: "#8a3c22",
        far: "#2a1a17", mid: "#1c1210", near: "#100b0a",
        ground: "#4a3830", groundDark: "#2b201b", top: "#8a5a3a",
        moss: "#7a3d24", light: "#ffb066", fog: "rgba(255,140,80,.06)",
        hazard: "#6b2e1c", accent: "#ffb066"
      },
      temple: {
        skyTop: "#191b2a", skyMid: "#3c4058", skyLow: "#9b9278",
        far: "#4e4b55", mid: "#34333d", near: "#1d1c24",
        ground: "#5a5647", groundDark: "#353229", top: "#9b9172",
        moss: "#6d7650", light: "#e8d9a8", fog: "rgba(210,200,160,.07)",
        hazard: "#4a4436", accent: "#d8c58a"
      },
      desert: {
        skyTop: "#2a1730", skyMid: "#6b3b4a", skyLow: "#d79b5b",
        far: "#6b4a4e", mid: "#4b323d", near: "#2a1e26",
        ground: "#b68a5a", groundDark: "#7a5a3a", top: "#e0b878",
        moss: "#9a6a3f", light: "#ffe0a0", fog: "rgba(230,190,120,.08)",
        hazard: "#7a4a2e", accent: "#e8c36a"
      },
      void: {
        skyTop: "#07050d", skyMid: "#171028", skyLow: "#2f2147",
        far: "#241a3d", mid: "#171126", near: "#0b0814",
        ground: "#2a2038", groundDark: "#160f20", top: "#55368a",
        moss: "#3a2a55", light: "#b48cff", fog: "rgba(130,90,200,.08)",
        hazard: "#3a2458", accent: "#b48cff"
      },
      celestial: {
        skyTop: "#1b2a42", skyMid: "#49698c", skyLow: "#e6d8b0",
        far: "#6f7e95", mid: "#4b5a72", near: "#2a3446",
        ground: "#7a7a78", groundDark: "#4b4b50", top: "#c9c3ac",
        moss: "#8f967d", light: "#fff0b0", fog: "rgba(255,245,210,.10)",
        hazard: "#5a6170", accent: "#fff0b0"
      }
    }
  };
  TP.art = art;

  art.rect = function (ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };

  art.rng = function (seed) {
    let s = (seed >>> 0) || 1;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  };

  art.pixelCircle = function (ctx, cx, cy, r, color) {
    ctx.fillStyle = color;
    const rr = Math.max(1, Math.round(r));
    for (let y = -rr; y <= rr; y++) {
      const span = Math.floor(Math.sqrt(rr * rr - y * y));
      ctx.fillRect(Math.round(cx - span), Math.round(cy + y), span * 2 + 1, 1);
    }
  };

  art.shadow = function (ctx, cx, y, w, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha == null ? 0.28 : alpha;
    ctx.fillStyle = "#050706";
    ctx.beginPath();
    ctx.ellipse(cx, y, w, Math.max(2, w * 0.2), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  art.glow = function (ctx, x, y, r, color, alpha) {
    if (r <= 0) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.save();
    ctx.globalAlpha = alpha == null ? 0.5 : alpha;
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  };

  /* ============================================================
     RETRATOS DE PERSONAGENS (bustos em pixel art)
     ============================================================ */
  function drawHairMass(ctx, x, y, color, dark, curly) {
    art.rect(ctx, x - 15, y - 9, 30, 8, dark);
    art.rect(ctx, x - 17, y - 4, 34, 10, color);
    art.rect(ctx, x - 14, y + 4, 28, 8, color);
    if (curly) {
      const pts = [[-17, -6], [-12, -13], [-4, -16], [5, -15], [13, -11], [18, -4],
        [-18, 3], [17, 4], [-11, 9], [10, 10], [-19, -1], [19, -1]];
      pts.forEach(function (p) { art.pixelCircle(ctx, x + p[0], y + p[1], 4, color); });
      pts.forEach(function (p, i) { if (i % 2 === 0) art.pixelCircle(ctx, x + p[0] - 1, y + p[1] - 1, 2, dark); });
    } else {
      art.rect(ctx, x - 13, y + 5, 26, 10, dark);
      art.rect(ctx, x - 10, y + 12, 20, 4, color);
    }
  }

  function drawFace(ctx, x, y, skin, eye, opts) {
    opts = opts || {};
    art.rect(ctx, x - 10, y, 20, 18, skin);
    art.rect(ctx, x - 12, y + 3, 3, 9, skin);
    art.rect(ctx, x + 9, y + 3, 3, 9, skin);
    // sombreado
    art.rect(ctx, x - 10, y + 13, 20, 5, "rgba(45,26,20,.22)");
    // olhos
    const ey = y + 7;
    art.rect(ctx, x - 7, ey, 4, 2, "#211512");
    art.rect(ctx, x + 3, ey, 4, 2, "#211512");
    art.rect(ctx, x - 6, ey, 2, 1, eye);
    art.rect(ctx, x + 4, ey, 2, 1, eye);
    // nariz e boca
    art.rect(ctx, x - 1, y + 10, 2, 4, "rgba(60,32,24,.4)");
    if (opts.smile === false) art.rect(ctx, x - 4, y + 16, 8, 1, "#593126");
    else {
      art.rect(ctx, x - 4, y + 15, 2, 1, "#593126");
      art.rect(ctx, x - 2, y + 16, 5, 1, "#593126");
      art.rect(ctx, x + 3, y + 15, 2, 1, "#593126");
    }
    if (opts.beard) {
      art.rect(ctx, x - 10, y + 13, 20, 8, opts.beard);
      art.rect(ctx, x - 7, y + 19, 14, 6, opts.beard);
      art.rect(ctx, x - 4, y + 24, 8, 4, opts.beard);
      art.rect(ctx, x - 4, y + 16, 8, 1, skin);
    }
    if (opts.scar) art.rect(ctx, x + 7, y + 4, 1, 7, "#8b4f3e");
  }

  art.drawCharacterBust = function (ctx, char, w, h) {
    const pal = char.palette;
    ctx.save();
    ctx.translate(Math.round(w / 2), 0);
    const scale = w / 96;
    ctx.scale(scale, scale);

    // fundo do retrato
    const bg = ctx.createLinearGradient(0, 0, 0, 96);
    bg.addColorStop(0, "#171a16");
    bg.addColorStop(1, "#27251d");
    ctx.fillStyle = bg;
    ctx.fillRect(-48, 0, 96, 96);
    art.pixelCircle(ctx, 0, 30, 27, "rgba(216,176,106,.055)");

    // aura do traje: o retrato também veste a peça equipada.
    if (char.outfitFx) {
      const fx = char.outfitFx;
      art.glow(ctx, 0, 48, char.outfitFinal ? 52 : 38, fx.glow || fx.color, char.outfitFinal ? 0.2 : 0.1);
      if (char.outfitFinal) {
        ctx.save();
        ctx.globalAlpha = 0.28;
        ctx.strokeStyle = fx.glow || fx.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 30, 31, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 0.5;
        for (let i = 0; i < 10; i++) {
          const a = i * (Math.PI * 2 / 10);
          art.rect(ctx, Math.round(Math.cos(a) * 36) - 1, Math.round(32 + Math.sin(a) * 32) - 1, 2, 2, fx.color);
        }
        ctx.restore();
      } else {
        for (let i = 0; i < 5; i++) {
          const a = i * 1.7;
          art.rect(ctx, Math.round(Math.cos(a) * 30) - 1, Math.round(46 + Math.sin(a) * 24) - 1, 2, 2, fx.color);
        }
      }
    }

    // ombros / corpo
    art.rect(ctx, -30, 70, 60, 26, pal.dark);
    art.rect(ctx, -25, 64, 50, 22, pal.cloak || pal.armor || pal.robe);
    art.rect(ctx, -19, 63, 38, 16, pal.tunic || pal.robe2 || pal.armor);
    art.rect(ctx, -8, 73, 16, 23, pal.accent);

    // cabeça
    const hx = 0, hy = 32;
    drawFace(ctx, hx, hy, pal.skin, char.id === "mago" ? "#d9e6ff" : "#d8b06a", {
      beard: char.id === "minerador" ? pal.beard : null,
      scar: char.id === "guerreiro"
    });

    // cabelos / chapéus
    if (char.id === "viajante") {
      drawHairMass(ctx, hx, hy - 8, pal.hair, "#120d0b", false);
      art.rect(ctx, -24, 25, 48, 7, pal.hood);
      art.rect(ctx, -26, 30, 7, 38, pal.hood);
      art.rect(ctx, 19, 30, 7, 38, pal.hood);
      art.rect(ctx, -20, 49, 40, 3, "rgba(20,14,10,.5)");
      art.rect(ctx, -18, 76, 36, 5, pal.accent);
    } else if (char.id === "arqueira") {
      drawHairMass(ctx, hx, hy - 9, pal.hair, "#0f0c0a", false);
      art.rect(ctx, -23, 26, 46, 6, pal.hood);
      art.rect(ctx, -27, 30, 7, 34, pal.hood);
      art.rect(ctx, 20, 30, 7, 34, pal.hood);
      art.rect(ctx, -11, 19, 22, 5, pal.hood);
      art.rect(ctx, 15, 41, 6, 28, pal.hair);
      art.rect(ctx, 18, 61, 5, 12, pal.hair);
      art.rect(ctx, -16, 75, 32, 4, "#8a6a3f");
    } else if (char.id === "guerreiro") {
      art.rect(ctx, -15, 15, 30, 8, pal.armor);
      art.rect(ctx, -17, 21, 34, 7, pal.armor);
      art.rect(ctx, -13, 14, 6, 6, pal.metal);
      art.rect(ctx, -3, 8, 6, 8, pal.plume);
      art.rect(ctx, -7, 4, 12, 6, pal.plume);
      art.rect(ctx, -10, 28, 3, 12, pal.metal);
      art.rect(ctx, 7, 28, 3, 12, pal.metal);
      art.rect(ctx, -8, 70, 16, 20, pal.accent);
      art.rect(ctx, -30, 71, 11, 17, pal.armor);
      art.rect(ctx, 19, 71, 11, 17, pal.armor);
    } else if (char.id === "mago") {
      drawHairMass(ctx, hx, hy - 8, pal.hair, "#8f877a", true);
      art.rect(ctx, -22, 22, 44, 6, pal.robe2);
      art.rect(ctx, -27, 26, 8, 7, pal.robe2);
      art.rect(ctx, -33, 19, 10, 6, pal.robe2);
      art.rect(ctx, -31, 14, 6, 7, pal.robe2);
      art.rect(ctx, -25, 50, 50, 8, pal.accent);
      art.rect(ctx, -4, 58, 8, 8, RARITY_GLOW(pal.accent));
    } else if (char.id === "minerador") {
      art.rect(ctx, -19, 16, 38, 8, pal.helmet);
      art.rect(ctx, -16, 10, 32, 8, pal.helmet);
      art.rect(ctx, -21, 22, 7, 8, pal.helmet);
      art.rect(ctx, 14, 22, 7, 8, pal.helmet);
      art.rect(ctx, -6, 8, 12, 5, pal.metal);
      art.rect(ctx, -3, 10, 6, 5, pal.accent);
      art.pixelCircle(ctx, 0, 13, 7, "rgba(224,168,78,.15)");
      art.rect(ctx, -28, 69, 13, 22, pal.armor);
      art.rect(ctx, 15, 69, 13, 22, pal.armor);
      art.rect(ctx, -16, 66, 32, 7, pal.accent);
    }

    // detalhes de arma no ombro/peito
    if (char.weaponClass === "sword") {
      art.rect(ctx, 27, 57, 4, 29, pal.metal);
      art.rect(ctx, 22, 56, 14, 4, pal.accent);
      art.rect(ctx, 29, 86, 2, 6, "#31241b");
    } else if (char.weaponClass === "bow") {
      ctx.strokeStyle = "#8a6a3f";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(28, 74, 17, -Math.PI / 2.6, Math.PI / 2.6);
      ctx.stroke();
      ctx.strokeStyle = "#cfc0a0";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(33, 57); ctx.lineTo(33, 91); ctx.stroke();
    } else if (char.weaponClass === "staff") {
      art.rect(ctx, 27, 47, 3, 42, pal.staff || "#6b4f3a");
      art.pixelCircle(ctx, 28, 45, 7, "rgba(143,122,214,.25)");
      art.pixelCircle(ctx, 28, 45, 4, pal.accent);
    } else if (char.weaponClass === "pickaxe") {
      ctx.save();
      ctx.translate(31, 72);
      ctx.rotate(-0.42);
      art.rect(ctx, -2, -24, 4, 47, "#6b4f3a");
      art.rect(ctx, -1, -24, 2, 47, "#8a6642");
      ctx.fillStyle = pal.metal;
      ctx.beginPath();
      ctx.moveTo(-23, -20); ctx.lineTo(-10, -31); ctx.lineTo(0, -33);
      ctx.lineTo(10, -31); ctx.lineTo(23, -20); ctx.lineTo(15, -17);
      ctx.lineTo(3, -24); ctx.lineTo(-3, -24); ctx.lineTo(-15, -17);
      ctx.closePath(); ctx.fill();
      art.rect(ctx, -5, -25, 10, 4, "rgba(255,255,255,.14)");
      art.rect(ctx, -4, 13, 8, 4, pal.accent);
      ctx.restore();
    }

    // brilho de fogueira
    art.glow(ctx, -30, 85, 55, "#ff9d54", 0.1);

    // Coroa de luz do traje final, desenhada depois do corpo.
    if (char.outfitFinal && char.outfitFx) {
      const fx = char.outfitFx;
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = fx.glow || fx.color;
      ctx.lineWidth = 1;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 5, 13);
        ctx.lineTo(i * 7, 2 - Math.abs(i) * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  };

  function RARITY_GLOW(c) { return c; }

  art.makePortrait = function (char) {
    // O traje muda a paleta; o cache precisa separar cada combinação.
    const key = char.id + ":" + (char.outfitId || "base");
    if (art.portraitCache[key]) return art.portraitCache[key];
    const c = document.createElement("canvas");
    c.width = 96; c.height = 96;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    art.drawCharacterBust(ctx, char, 96, 96);
    art.portraitCache[key] = c.toDataURL("image/png");
    return art.portraitCache[key];
  };

  /* ============================================================
     PEDRO — retrato do narrador
     ============================================================ */
  art.drawPedro = function (ctx, w, h) {
    const pal = {
      skin: "#8b5a3c", skin2: "#a96b49", hair: "#1b1310", hair2: "#2b1d18",
      shirt: "#42503c", scarf: "#a65a3a", accent: "#d8a85f", eye: "#2b1b12"
    };
    ctx.save();
    ctx.translate(Math.round(w / 2), 0);
    const sc = w / 96;
    ctx.scale(sc, sc);
    const bg = ctx.createLinearGradient(0, 0, 0, 96);
    bg.addColorStop(0, "#241d16");
    bg.addColorStop(1, "#0f0c0a");
    ctx.fillStyle = bg;
    ctx.fillRect(-48, 0, 96, 96);
    art.glow(ctx, 0, 90, 50, "#ff9d54", 0.18);
    art.pixelCircle(ctx, 0, 34, 29, "rgba(216,168,95,.06)");

    // ombros e manto
    art.rect(ctx, -34, 69, 68, 27, "#2e2a20");
    art.rect(ctx, -29, 64, 58, 20, pal.shirt);
    art.rect(ctx, -22, 62, 44, 16, "#4e5c45");
    art.rect(ctx, -30, 70, 60, 6, pal.scarf);
    art.rect(ctx, -14, 76, 8, 6, pal.scarf);
    art.rect(ctx, 9, 76, 7, 6, pal.scarf);

    // rosto
    drawFace(ctx, 0, 31, pal.skin, pal.eye, { smile: true });
    art.rect(ctx, -10, 30, 20, 2, pal.skin2);

    // cabelo volumoso e cacheado
    const hair = [
      [-22, 20, 8], [-25, 27, 8], [-23, 35, 7], [-17, 42, 7], [-9, 47, 6],
      [0, 49, 5], [8, 47, 6], [16, 42, 7], [22, 35, 7], [24, 27, 8],
      [21, 19, 8], [13, 13, 8], [4, 9, 8], [-6, 10, 8], [-15, 13, 8],
      [-24, 16, 6], [23, 14, 5], [-20, 47, 5], [18, 48, 5]
    ];
    hair.forEach(function (p, i) {
      art.pixelCircle(ctx, p[0], p[1], p[2], i % 3 === 0 ? pal.hair2 : pal.hair);
    });
    art.rect(ctx, -21, 8, 42, 5, pal.hair);
    art.rect(ctx, -24, 11, 9, 5, pal.hair2);

    // sobrancelhas grossas e olhos gentis
    art.rect(ctx, -8, 34, 5, 2, pal.hair);
    art.rect(ctx, 3, 34, 5, 2, pal.hair);
    art.rect(ctx, -6, 37, 2, 1, "#f0d7b0");
    art.rect(ctx, 4, 37, 2, 1, "#f0d7b0");

    // barba curta
    art.rect(ctx, -10, 44, 20, 5, "#4a3025");
    art.rect(ctx, -7, 49, 14, 4, "#4a3025");
    art.rect(ctx, -3, 45, 6, 1, "#6b4432");

    // brinco
    art.rect(ctx, 12, 42, 2, 4, pal.accent);
    art.rect(ctx, 13, 46, 3, 3, "#8a6a3f");

    ctx.restore();
  };

  art.drawNpcBust = function (ctx, npc, w, h) {
    const pal = npc.palette || {
      skin: "#a66b4b", hair: "#2b1b17", cloth: "#5c4a3a", accent: "#7de7d8", dark: "#241a16"
    };
    ctx.save();
    ctx.translate(Math.round(w / 2), 0);
    const scale = w / 96;
    ctx.scale(scale, scale);

    const bg = ctx.createLinearGradient(0, 0, 0, 96);
    bg.addColorStop(0, "#141713");
    bg.addColorStop(1, "#2b261d");
    ctx.fillStyle = bg;
    ctx.fillRect(-48, 0, 96, 96);
    art.glow(ctx, 0, 52, 42, pal.accent, 0.09);
    art.pixelCircle(ctx, 0, 30, 28, "rgba(216,176,106,.06)");

    // ombros
    art.rect(ctx, -31, 71, 62, 25, pal.dark);
    art.rect(ctx, -26, 64, 52, 22, pal.cloth);
    art.rect(ctx, -19, 67, 38, 18, pal.dark);
    art.rect(ctx, -9, 74, 18, 22, pal.accent);

    // cabeça
    drawFace(ctx, 0, 32, pal.skin, pal.accent, { smile: true });

    if (npc.kind === "scholar") {
      art.rect(ctx, -23, 22, 46, 6, pal.cloth);
      art.rect(ctx, -27, 27, 8, 31, pal.cloth);
      art.rect(ctx, 19, 27, 8, 31, pal.cloth);
      art.rect(ctx, -13, 18, 26, 5, pal.dark);
      art.rect(ctx, -18, 75, 36, 4, pal.accent);
      art.rect(ctx, 28, 55, 3, 37, "#6b4f3a");
      art.pixelCircle(ctx, 29, 50, 5, "rgba(125,231,216,.22)");
      art.pixelCircle(ctx, 29, 50, 3, pal.accent);
    } else if (npc.kind === "hunter") {
      art.rect(ctx, -22, 23, 44, 6, pal.cloth);
      art.rect(ctx, -26, 28, 7, 27, pal.cloth);
      art.rect(ctx, 19, 28, 7, 27, pal.cloth);
      art.rect(ctx, 9, 14, 4, 15, pal.accent);
      art.rect(ctx, 12, 17, 7, 3, pal.accent);
      art.rect(ctx, -17, 73, 34, 4, "#8a6a3f");
    } else if (npc.kind === "climber") {
      art.rect(ctx, -21, 23, 42, 5, pal.cloth);
      art.rect(ctx, -23, 28, 7, 24, pal.cloth);
      art.rect(ctx, 16, 28, 7, 24, pal.cloth);
      art.rect(ctx, -12, 39, 24, 4, pal.accent);
      art.rect(ctx, -8, 36, 4, 2, pal.dark);
      art.rect(ctx, 4, 36, 4, 2, pal.dark);
      art.rect(ctx, 27, 40, 3, 52, "#6b4f3a");
    } else if (npc.kind === "miner") {
      art.rect(ctx, -19, 16, 38, 8, pal.cloth);
      art.rect(ctx, -15, 10, 30, 8, pal.cloth);
      art.rect(ctx, -6, 8, 12, 4, pal.accent);
      art.pixelCircle(ctx, 0, 13, 6, "rgba(255,176,102,.2)");
      art.rect(ctx, -29, 70, 12, 21, pal.dark);
      art.rect(ctx, 17, 70, 12, 21, pal.dark);
    } else {
      art.rect(ctx, -21, 21, 42, 6, pal.dark);
      art.rect(ctx, -24, 26, 7, 30, pal.dark);
      art.rect(ctx, 17, 26, 7, 30, pal.dark);
      art.rect(ctx, -4, 8, 8, 13, pal.accent);
      art.rect(ctx, -11, 74, 22, 3, pal.accent);
      art.rect(ctx, 30, 38, 3, 55, "#8a6a3f");
      art.rect(ctx, 27, 35, 9, 3, "#c6c8c4");
    }

    art.glow(ctx, -32, 86, 52, "#ff9d54", 0.08);
    ctx.restore();
  };

  art.makeNpcPortrait = function (npc) {
    const key = npc.id || npc.name || "npc";
    if (art.npcPortraitCache[key]) return art.npcPortraitCache[key];
    const c = document.createElement("canvas");
    c.width = 96; c.height = 96;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    art.drawNpcBust(ctx, npc, 96, 96);
    art.npcPortraitCache[key] = c.toDataURL("image/png");
    return art.npcPortraitCache[key];
  };

  art.makePedro = function () {
    if (art.pedroCache) return art.pedroCache;
    const c = document.createElement("canvas");
    c.width = 96; c.height = 96;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    art.drawPedro(ctx, 96, 96);
    art.pedroCache = c.toDataURL("image/png");
    return art.pedroCache;
  };

  /* ============================================================
     ÍCONES DE ARMA
     ============================================================ */
  art.drawWeaponIcon = function (ctx, cls, tier, w, h) {
    const data = TP.DATA.WEAPONS[cls][tier];
    const rar = TP.DATA.RARITIES[data.rarity];
    ctx.save();
    ctx.translate(w / 2, h / 2);
    const s = Math.min(w / 110, h / 72);
    ctx.scale(s, s);
    art.glow(ctx, 0, 4, 40, rar.color, 0.18);

    if (cls === "sword") {
      ctx.save();
      ctx.rotate(-Math.PI / 4.3);
      art.rect(ctx, -5, -34, 10, 54, "#d7d2c4");
      art.rect(ctx, -5, -34, 4, 54, "#f2eee2");
      art.rect(ctx, 1, -32, 3, 50, "#8f979e");
      ctx.fillStyle = "#e6e1d3";
      ctx.beginPath();
      ctx.moveTo(-5, -34); ctx.lineTo(0, -46); ctx.lineTo(5, -34); ctx.closePath(); ctx.fill();
      art.rect(ctx, -15, 18, 30, 5, rar.color);
      art.rect(ctx, -13, 23, 26, 3, "#513b29");
      art.rect(ctx, -3, 26, 6, 16, "#4a3427");
      art.rect(ctx, -6, 40, 12, 5, rar.color);
      ctx.restore();
      if (tier >= 2) {
        art.glow(ctx, 14, -20, 25, tier === 2 ? "#ffb05e" : "#b487ff", 0.3);
        art.pixelCircle(ctx, 14, -20, 3, tier === 2 ? "#ffcf8a" : "#d8b6ff");
      }
    } else if (cls === "bow") {
      ctx.strokeStyle = "#8d6a45";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, 34, -Math.PI / 2.45, Math.PI / 2.45);
      ctx.stroke();
      ctx.strokeStyle = rar.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 38, -Math.PI / 2.3, Math.PI / 2.3);
      ctx.stroke();
      ctx.strokeStyle = "#d8cdb3";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(13, -31); ctx.lineTo(13, 31); ctx.stroke();
      art.rect(ctx, -8, -2, 52, 3, "#d8cdb3");
      art.rect(ctx, 42, -4, 9, 7, rar.color);
      art.rect(ctx, 37, -8, 6, 8, "#b8b1a1");
      if (tier >= 2) art.glow(ctx, 42, 0, 22, tier === 2 ? "#ffae5a" : "#b487ff", 0.3);
    } else if (cls === "pickaxe") {
      ctx.save();
      ctx.rotate(-Math.PI / 5.2);
      art.rect(ctx, -3, -38, 6, 76, "#5e432f");
      art.rect(ctx, -2, -38, 2, 76, "#8a6642");
      ctx.fillStyle = "#9aa0a4";
      ctx.beginPath();
      ctx.moveTo(-35, -23); ctx.lineTo(-22, -36); ctx.lineTo(-7, -40);
      ctx.lineTo(0, -34); ctx.lineTo(7, -40); ctx.lineTo(22, -36);
      ctx.lineTo(35, -23); ctx.lineTo(22, -26); ctx.lineTo(7, -31);
      ctx.lineTo(0, -25); ctx.lineTo(-7, -31); ctx.lineTo(-22, -26);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#c5c8c6";
      ctx.beginPath();
      ctx.moveTo(-27, -22); ctx.lineTo(-18, -30); ctx.lineTo(-5, -33);
      ctx.lineTo(-1, -29); ctx.lineTo(-17, -25); ctx.closePath(); ctx.fill();
      art.rect(ctx, -7, -33, 14, 4, rar.color);
      art.rect(ctx, -5, -5, 10, 4, rar.color);
      ctx.restore();
      if (tier >= 2) art.glow(ctx, 0, -22, 34, tier === 2 ? "#ff9a4e" : "#b57bff", 0.3);
    } else {
      art.rect(ctx, -3, -30, 6, 64, "#6b4c35");
      art.rect(ctx, -2, -30, 2, 64, "#8f6847");
      ctx.strokeStyle = rar.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -35, 15, 0, Math.PI * 2); ctx.stroke();
      art.pixelCircle(ctx, 0, -35, 9, "rgba(0,0,0,.4)");
      art.pixelCircle(ctx, 0, -35, 7, rar.color);
      art.pixelCircle(ctx, -2, -37, 3, rar.glow);
      art.rect(ctx, -12, 30, 24, 4, rar.color);
      if (tier >= 2) art.glow(ctx, 0, -35, 30, tier === 2 ? "#ffae5a" : "#b487ff", 0.35);
      ctx.strokeStyle = "rgba(255,255,255,.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, -35, 20, -0.6, 1.1); ctx.stroke();
    }
    ctx.restore();
  };

  art.makeWeaponIcon = function (cls, tier) {
    const key = cls + ":" + tier;
    if (art.weaponCache[key]) return art.weaponCache[key];
    const c = document.createElement("canvas");
    c.width = 120; c.height = 80;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    art.drawWeaponIcon(ctx, cls, tier, 120, 80);
    art.weaponCache[key] = c.toDataURL("image/png");
    return art.weaponCache[key];
  };
})();
