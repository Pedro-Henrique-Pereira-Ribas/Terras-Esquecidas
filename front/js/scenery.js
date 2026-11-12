/* ============================================================
   TERRA PERDIDA — cenários, parallax e cenas de menu
   ============================================================ */
(function () {
  "use strict";
  const TP = (window.TP = window.TP || {});
  const art = TP.art;
  const W = 640, H = 360;
  const T = art.THEMES;

  const S = {
    drawBackground: function (ctx, level, cameraX, time) {
      const theme = level.def.theme;
      const pal = T[theme] || T.ruins;
      drawSky(ctx, pal, theme, time);
      if (theme === "ruins") drawRuins(ctx, pal, cameraX, time);
      else if (theme === "forest") drawForest(ctx, pal, cameraX, time);
      else if (theme === "mountain") drawMountain(ctx, pal, cameraX, time);
      else if (theme === "mine") drawMine(ctx, pal, cameraX, time);
      else if (theme === "forge") drawForge(ctx, pal, cameraX, time);
      else if (theme === "temple") drawTemple(ctx, pal, cameraX, time);
      else if (theme === "desert") drawDesert(ctx, pal, cameraX, time);
      else if (theme === "void") drawVoid(ctx, pal, cameraX, time);
      else if (theme === "celestial") drawCelestial(ctx, pal, cameraX, time);
      else drawFrontier(ctx, pal, cameraX, time);
      // névoa baixa comum
      ctx.save();
      ctx.fillStyle = pal.fog;
      for (let i = 0; i < 4; i++) {
        const y = 238 + i * 22 + Math.sin(time * 0.004 + i) * 3;
        ctx.fillRect(0, y, W, 14 + i * 3);
      }
      ctx.restore();
    },
    drawTitleScene,
    drawCampScene,
    drawThroneScene
  };
  TP.scenery = S;

  function drawSky(ctx, pal, theme, time) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, pal.skyTop);
    g.addColorStop(0.58, pal.skyMid);
    g.addColorStop(1, pal.skyLow);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // bandas de cor para reforçar o look pixelado
    ctx.save();
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = i % 2 ? "#ffffff" : "#000000";
      ctx.fillRect(0, 32 + i * 28, W, 8);
    }
    ctx.restore();

    if (theme === "frontier") {
      art.pixelCircle(ctx, 480, 112, 46, "#e2643e");
      art.pixelCircle(ctx, 480, 112, 36, "#f08a58");
      ctx.save();
      ctx.globalAlpha = 0.2;
      art.pixelCircle(ctx, 480, 112, 60, "#ffb06f");
      ctx.restore();
      // nuvens de cinza
      ctx.fillStyle = "rgba(31,15,18,.5)";
      for (let i = 0; i < 5; i++) {
        const x = ((i * 173 + time * 0.02) % 780) - 70;
        ctx.fillRect(x, 60 + (i % 3) * 28, 130, 10);
        ctx.fillRect(x + 34, 52 + (i % 3) * 28, 62, 8);
      }
    } else if (theme === "mountain") {
      art.pixelCircle(ctx, 118, 74, 25, "#c9d5e4");
      art.pixelCircle(ctx, 126, 68, 22, "#263b5b");
      ctx.save();
      ctx.globalAlpha = 0.22;
      for (let i = 0; i < 5; i++) {
        const x = 40 + i * 130;
        ctx.fillStyle = i % 2 ? "#8aa8c9" : "#5e7899";
        ctx.beginPath();
        ctx.moveTo(x, 100);
        ctx.lineTo(x + 90, 130);
        ctx.lineTo(x + 160, 100);
        ctx.lineTo(x + 160, 116);
        ctx.lineTo(x + 90, 148);
        ctx.lineTo(x, 116);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    } else if (theme === "forest") {
      // feixes de luz
      ctx.save();
      ctx.globalAlpha = 0.055;
      ctx.fillStyle = "#d5edb0";
      for (let i = 0; i < 5; i++) {
        const x = 60 + i * 150 + Math.sin(time * 0.002 + i) * 10;
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x + 30, 0); ctx.lineTo(x + 94, 300); ctx.lineTo(x + 30, 300);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    } else if (theme === "ruins") {
      // nuvens claras
      ctx.save();
      ctx.globalAlpha = 0.25;
      for (let i = 0; i < 5; i++) {
        const x = ((i * 198 - time * 0.015) % 820) - 100;
        ctx.fillStyle = "#dce5de";
        ctx.fillRect(x, 54 + (i % 3) * 34, 110, 8);
        ctx.fillRect(x + 28, 47 + (i % 3) * 34, 58, 8);
      }
      ctx.restore();
    } else if (theme === "mine") {
      // brilho distante da mina
      art.glow(ctx, 320, 260, 220, "#c56535", 0.1);
    } else if (theme === "forge") {
      art.glow(ctx, 320, 250, 260, "#ff7a3d", 0.14);
      ctx.save();
      ctx.globalAlpha = 0.2;
      for (let i = 0; i < 6; i++) {
        const x = ((i * 151 + time * 0.018) % 760) - 60;
        ctx.fillStyle = i % 2 ? "#3a1d15" : "#24120e";
        ctx.fillRect(x, 48 + (i % 3) * 30, 120, 9);
        ctx.fillRect(x + 28, 40 + (i % 3) * 30, 54, 8);
      }
      ctx.restore();
    } else if (theme === "temple") {
      art.pixelCircle(ctx, 500, 74, 34, "#d8c58a");
      art.pixelCircle(ctx, 512, 68, 30, "#3c4058");
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = "#e8d9a8";
      for (let i = 0; i < 18; i++) {
        const x = (i * 47 + Math.sin(time * 0.01 + i) * 12) % W;
        const y = 60 + ((i * 31) % 160);
        ctx.fillRect(x, y, 2, 2);
      }
      ctx.restore();
    } else if (theme === "desert") {
      art.pixelCircle(ctx, 486, 92, 50, "#f0c070");
      art.pixelCircle(ctx, 486, 92, 42, "#ffe0a0");
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = "#ffe0a0";
      for (let i = 0; i < 6; i++) {
        const y = 120 + i * 24 + Math.sin(time * 0.006 + i) * 2;
        ctx.fillRect(0, y, W, 2);
      }
      ctx.restore();
    } else if (theme === "void") {
      ctx.save();
      ctx.globalAlpha = 0.85;
      art.pixelCircle(ctx, 500, 98, 42, "#120c20");
      art.pixelCircle(ctx, 500, 98, 34, "#07050d");
      ctx.globalAlpha = 0.2;
      art.pixelCircle(ctx, 500, 98, 62, "#8d5cff");
      ctx.restore();
      ctx.fillStyle = "rgba(230,214,255,.7)";
      for (let i = 0; i < 28; i++) {
        const x = (i * 97 + time * 0.01) % W;
        const y = 24 + ((i * 53) % 190);
        ctx.fillRect(x, y, i % 4 ? 1 : 2, i % 4 ? 1 : 2);
      }
    } else if (theme === "celestial") {
      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = "#fff0b0";
      for (let i = 0; i < 5; i++) {
        const x = 80 + i * 140 + Math.sin(time * 0.002 + i) * 14;
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x + 26, 0); ctx.lineTo(x + 100, 300); ctx.lineTo(x + 52, 300);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      art.glow(ctx, 520, 60, 160, "#fff0b0", 0.12);
    }
  }

  /* ---------------- RUÍNAS ---------------- */
  function drawRuins(ctx, pal, cam, time) {
    // montanhas distantes
    const far = -(cam * 0.09) % 1000;
    ctx.fillStyle = pal.far;
    ctx.save();
    ctx.globalAlpha = 0.7;
    for (let i = -1; i < 4; i++) {
      const x = far + i * 360;
      ctx.beginPath();
      ctx.moveTo(x, 240);
      ctx.lineTo(x + 80, 155);
      ctx.lineTo(x + 150, 205);
      ctx.lineTo(x + 240, 135);
      ctx.lineTo(x + 330, 220);
      ctx.lineTo(x + 400, 240);
      ctx.lineTo(x + 400, 330);
      ctx.lineTo(x, 330);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // arcos distantes
    const mid = -(cam * 0.22) % 760;
    for (let i = -1; i < 3; i++) {
      const x = mid + i * 380;
      drawArch(ctx, x + 40, 212, 116, 108, pal.mid, 0.55);
      drawArch(ctx, x + 190, 238, 80, 82, pal.mid, 0.4);
      ctx.fillStyle = "rgba(50,65,58,.45)";
      ctx.fillRect(x + 316, 168, 18, 150);
      ctx.fillRect(x + 330, 158, 50, 10);
    }

    // colunas próximas
    const near = -(cam * 0.38) % 540;
    for (let i = -1; i < 3; i++) {
      const x = near + i * 270;
      ctx.fillStyle = pal.near;
      ctx.fillRect(x + 20, 130, 24, 200);
      ctx.fillRect(x + 12, 120, 40, 12);
      ctx.fillRect(x + 12, 320, 48, 18);
      ctx.fillStyle = "rgba(0,0,0,.16)";
      ctx.fillRect(x + 38, 132, 6, 194);
      // videira
      for (let v = 0; v < 5; v++) {
        const vy = 138 + v * 24;
        ctx.fillStyle = "#526243";
        ctx.fillRect(x + 16 + Math.sin(time * 0.01 + v) * 2, vy, 4, 14);
        ctx.fillRect(x + 12, vy + 9, 8, 4);
      }
    }

    // cachoeiras
    for (let i = 0; i < 3; i++) {
      const x = ((i * 310 - cam * 0.3) % 990 + 990) % 990 - 60;
      drawWaterfall(ctx, x, 170, 34, 150, time + i * 20);
    }

    // videiras no topo
    ctx.save();
    ctx.globalAlpha = 0.9;
    for (let i = 0; i < 14; i++) {
      const x = ((i * 87 - cam * 0.5) % 740 + 740) % 740 - 50;
      const len = 25 + (i * 17) % 62;
      ctx.fillStyle = i % 3 ? "#344934" : "#465d3e";
      ctx.fillRect(x, 0, 4, len);
      ctx.fillRect(x - 4, len - 8, 12, 5);
      ctx.fillRect(x + 3, len * 0.55, 9, 4);
    }
    ctx.restore();

    // pássaros distantes
    ctx.fillStyle = "rgba(30,42,44,.5)";
    for (let i = 0; i < 4; i++) {
      const x = ((time * 0.08 + i * 190) % 820) - 90;
      const y = 92 + (i % 3) * 20 + Math.sin(time * 0.01 + i) * 6;
      ctx.fillRect(x, y, 6, 2);
      ctx.fillRect(x + 7, y - 2, 5, 2);
      ctx.fillRect(x + 13, y, 6, 2);
    }
  }

  function drawArch(ctx, x, y, w, h, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    const thick = 14;
    ctx.fillRect(x, y, thick, h);
    ctx.fillRect(x + w - thick, y, thick, h);
    ctx.fillRect(x, y, w, thick);
    // recorte interno do arco
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h * 0.45, w * 0.32, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(x + w * 0.18, y + h * 0.45 - 2, w * 0.64, h);
    ctx.restore();
    // detalhes de pedra
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(255,255,255,.07)";
    for (let i = 0; i < 4; i++) ctx.fillRect(x + 3, y + 18 + i * 24, thick - 6, 3);
    ctx.restore();
  }

  function drawWaterfall(ctx, x, y, w, h, time) {
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = "#a9c9c1";
    ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = 0.65;
    for (let i = 0; i < 10; i++) {
      const yy = y + ((i * 23 + time * 1.4) % h);
      ctx.fillStyle = i % 2 ? "#d9ebe1" : "#86aaa5";
      ctx.fillRect(x + 4 + (i % 4) * 7, yy, 3, 12);
    }
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#e9f4e9";
    ctx.fillRect(x + 8, y + h - 6, w - 12, 4);
    ctx.restore();
  }

  /* ---------------- FLORESTA ---------------- */
  function drawForest(ctx, pal, cam, time) {
    // troncos distantes
    const far = -(cam * 0.1) % 520;
    for (let i = -1; i < 3; i++) {
      const x = far + i * 260;
      ctx.fillStyle = "#23433c";
      ctx.fillRect(x + 40, 30, 58, 300);
      ctx.fillRect(x + 25, 300, 90, 20);
      ctx.fillStyle = "rgba(120,180,145,.08)";
      ctx.fillRect(x + 58, 40, 8, 250);
      // raízes
      ctx.fillStyle = "#1c362f";
      ctx.fillRect(x + 12, 296, 38, 10);
      ctx.fillRect(x + 90, 292, 34, 12);
    }

    // troncos médios gigantes
    const mid = -(cam * 0.26) % 620;
    for (let i = -1; i < 3; i++) {
      const x = mid + i * 330;
      ctx.fillStyle = "#18352c";
      ctx.fillRect(x + 70, 0, 76, 330);
      ctx.fillRect(x + 52, 300, 112, 20);
      ctx.fillStyle = "rgba(137,189,143,.07)";
      ctx.fillRect(x + 92, 0, 12, 280);
      ctx.fillStyle = "#10251f";
      ctx.fillRect(x + 46, 300, 44, 10);
      ctx.fillRect(x + 144, 306, 38, 9);
      // galhos
      ctx.fillStyle = "#18352c";
      ctx.fillRect(x + 20, 88, 54, 10);
      ctx.fillRect(x + 10, 80, 14, 8);
      ctx.fillRect(x + 144, 142, 62, 9);
      ctx.fillRect(x + 194, 132, 12, 10);
    }

    // ponte de corda
    ctx.save();
    ctx.globalAlpha = 0.55;
    const bridge = -(cam * 0.18) % 800;
    for (let i = 0; i < 2; i++) {
      const bx = bridge + i * 460 + 90;
      ctx.strokeStyle = "#3b3a2d";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx, 238);
      ctx.quadraticCurveTo(bx + 80, 255, bx + 160, 238);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bx, 248);
      ctx.quadraticCurveTo(bx + 80, 265, bx + 160, 248);
      ctx.stroke();
      for (let j = 0; j < 9; j++) {
        const px = bx + j * 20;
        const py = 238 + Math.sin((j / 8) * Math.PI) * 14;
        ctx.fillStyle = "#6b5b3e";
        ctx.fillRect(px, py, 14, 4);
      }
    }
    ctx.restore();

    // copa no topo
    ctx.fillStyle = "#0b201a";
    for (let i = 0; i < 12; i++) {
      const x = ((i * 73 - cam * 0.4) % 800 + 800) % 800 - 80;
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x + 50, 0); ctx.lineTo(x + 26, 32 + (i % 4) * 10);
      ctx.closePath(); ctx.fill();
    }

    // vaga-lumes
    for (let i = 0; i < 24; i++) {
      const x = ((i * 73 - cam * 0.5 + Math.sin(time * 0.01 + i) * 20) % 660 + 660) % 660;
      const y = 100 + (i * 37) % 190 + Math.cos(time * 0.013 + i) * 8;
      const a = 0.3 + 0.35 * (Math.sin(time * 0.06 + i) * 0.5 + 0.5);
      ctx.save(); ctx.globalAlpha = a; art.pixelCircle(ctx, x, y, i % 4 === 0 ? 2 : 1, "#d9f3a2"); ctx.restore();
      if (i % 5 === 0) art.glow(ctx, x, y, 10, "#b8e97b", a * 0.25);
    }
  }

  /* ---------------- SERRA ---------------- */
  function drawMountain(ctx, pal, cam, time) {
    // picos distantes
    const far = -(cam * 0.08) % 900;
    for (let i = -1; i < 3; i++) {
      const x = far + i * 450;
      ctx.fillStyle = "#2b3d56";
      ctx.beginPath();
      ctx.moveTo(x, 260);
      ctx.lineTo(x + 110, 105);
      ctx.lineTo(x + 176, 176);
      ctx.lineTo(x + 255, 75);
      ctx.lineTo(x + 360, 200);
      ctx.lineTo(x + 450, 260);
      ctx.lineTo(x + 450, 330);
      ctx.lineTo(x, 330);
      ctx.closePath(); ctx.fill();
      // neve
      ctx.fillStyle = "rgba(214,226,235,.7)";
      ctx.beginPath();
      ctx.moveTo(x + 74, 148); ctx.lineTo(x + 110, 105); ctx.lineTo(x + 140, 138);
      ctx.lineTo(x + 126, 132); ctx.lineTo(x + 112, 146); ctx.lineTo(x + 100, 136);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 220, 115); ctx.lineTo(x + 255, 75); ctx.lineTo(x + 288, 112);
      ctx.lineTo(x + 270, 104); ctx.lineTo(x + 255, 120); ctx.lineTo(x + 240, 108);
      ctx.closePath(); ctx.fill();
    }

    // castelo distante
    const castleX = 430 - (cam * 0.16) % 500;
    drawCastle(ctx, castleX, 138, 146, 112);

    // serra média + ponte
    const mid = -(cam * 0.26) % 700;
    for (let i = -1; i < 3; i++) {
      const x = mid + i * 350;
      ctx.fillStyle = "#202a3c";
      ctx.beginPath();
      ctx.moveTo(x, 320); ctx.lineTo(x + 80, 210); ctx.lineTo(x + 150, 270);
      ctx.lineTo(x + 230, 180); ctx.lineTo(x + 330, 320);
      ctx.closePath(); ctx.fill();
    }
    // ponte de corda suspensa
    const bridgeX = 90 - (cam * 0.36) % 560;
    drawRopeBridge(ctx, bridgeX, 238, 170);

    // pinheiros escuros
    const near = -(cam * 0.5) % 240;
    for (let i = -1; i < 5; i++) {
      const x = near + i * 160;
      drawPine(ctx, x, 320, 34 + (i % 3) * 12, "#121a27");
    }

    // neve
    ctx.save();
    for (let i = 0; i < 70; i++) {
      const x = ((i * 53 - cam * 0.4 + time * 0.2) % 700 + 700) % 700 - 30;
      const y = ((i * 37 + time * 0.55) % 400) - 40;
      ctx.globalAlpha = 0.25 + (i % 4) * 0.12;
      ctx.fillStyle = "#dce8f2";
      ctx.fillRect(x, y, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1);
    }
    ctx.restore();
  }

  function drawCastle(ctx, x, y, w, h) {
    ctx.save();
    ctx.fillStyle = "#1b2232";
    ctx.fillRect(x + 22, y + 34, w - 44, h);
    ctx.fillRect(x + 10, y + 56, 22, h - 22);
    ctx.fillRect(x + w - 32, y + 46, 22, h - 12);
    ctx.fillRect(x + w / 2 - 16, y + 16, 32, h - 6);
    // ameias
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(x + 22 + i * 18, y + 26, 10, 10);
      ctx.fillRect(x + 10, y + 48 - i * 0, 8, 8);
    }
    // torre central
    ctx.fillRect(x + w / 2 - 10, y, 20, 26);
    ctx.fillRect(x + w / 2 - 14, y + 20, 28, 6);
    // janelas
    ctx.fillStyle = "rgba(224,164,84,.55)";
    ctx.fillRect(x + w / 2 - 4, y + 44, 6, 10);
    ctx.fillRect(x + 30, y + 74, 5, 8);
    ctx.fillRect(x + w - 42, y + 60, 5, 8);
    ctx.restore();
  }

  function drawRopeBridge(ctx, x, y, w) {
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = "#59606b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + w / 2, y + 36, x + w, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y + 14);
    ctx.quadraticCurveTo(x + w / 2, y + 50, x + w, y + 14);
    ctx.stroke();
    for (let i = 0; i <= 10; i++) {
      const px = x + (w / 10) * i;
      const py = y + Math.sin((i / 10) * Math.PI) * 36;
      ctx.fillStyle = "#6e5941";
      ctx.fillRect(px - 2, py, 4, 16);
      ctx.fillRect(px - 8, py + 14, 16, 3);
    }
    // postes
    ctx.fillStyle = "#3f3c37";
    ctx.fillRect(x - 6, y - 18, 8, 42);
    ctx.fillRect(x + w - 2, y - 18, 8, 42);
    ctx.restore();
  }

  function drawPine(ctx, x, baseY, s, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x - 2, baseY - s * 0.3, 4, s * 0.3);
    for (let i = 0; i < 3; i++) {
      const yy = baseY - s * 0.32 - i * s * 0.22;
      const ww = s * (0.4 - i * 0.09);
      ctx.beginPath();
      ctx.moveTo(x - ww, yy);
      ctx.lineTo(x, yy - s * 0.42);
      ctx.lineTo(x + ww, yy);
      ctx.closePath(); ctx.fill();
    }
  }

  /* ---------------- MINA ---------------- */
  function drawMine(ctx, pal, cam, time) {
    // teto rochoso
    ctx.fillStyle = "#120d0c";
    ctx.fillRect(0, 0, W, 125);
    const far = -(cam * 0.12) % 560;
    for (let i = -1; i < 3; i++) {
      const x = far + i * 300;
      ctx.fillStyle = "#1b1310";
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x + 300, 0); ctx.lineTo(x + 300, 110);
      ctx.lineTo(x + 230, 88); ctx.lineTo(x + 160, 118); ctx.lineTo(x + 96, 78);
      ctx.lineTo(x + 30, 125); ctx.lineTo(x, 96); ctx.closePath(); ctx.fill();
      // estalactites
      for (let j = 0; j < 5; j++) {
        const sx = x + 30 + j * 55;
        ctx.beginPath();
        ctx.moveTo(sx - 7, 80); ctx.lineTo(sx, 118 + (j % 3) * 16); ctx.lineTo(sx + 8, 80);
        ctx.closePath(); ctx.fill();
      }
    }

    // fundo da caverna
    ctx.save();
    ctx.globalAlpha = 0.8;
    const mid = -(cam * 0.23) % 650;
    for (let i = -1; i < 3; i++) {
      const x = mid + i * 360;
      ctx.fillStyle = "#241814";
      ctx.beginPath();
      ctx.moveTo(x, 320); ctx.lineTo(x + 60, 195); ctx.lineTo(x + 128, 230);
      ctx.lineTo(x + 210, 170); ctx.lineTo(x + 300, 270); ctx.lineTo(x + 360, 320);
      ctx.closePath(); ctx.fill();
      art.glow(ctx, x + 170, 270, 80, "#e27a3d", 0.08);
    }
    ctx.restore();

    // vigas de madeira
    const beams = -(cam * 0.35) % 440;
    for (let i = -1; i < 3; i++) {
      const x = beams + i * 440;
      ctx.fillStyle = "#3a2a20";
      ctx.fillRect(x + 40, 132, 14, 190);
      ctx.fillRect(x + 160, 132, 14, 190);
      ctx.fillRect(x + 34, 124, 146, 14);
      ctx.fillRect(x + 52, 142, 110, 5);
      ctx.fillStyle = "#5a402b";
      ctx.fillRect(x + 42, 132, 4, 188);
      ctx.fillRect(x + 162, 132, 4, 188);
      // correntes
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = "#5e5851";
      ctx.lineWidth = 2;
      for (let c = 0; c < 2; c++) {
        const cx = x + 220 + c * 48;
        for (let k = 0; k < 8; k++) {
          ctx.strokeRect(cx - 3, 120 + k * 17, 6, 11);
        }
      }
      ctx.restore();
      // lanterna
      drawLantern(ctx, x + 118, 128, time + i);
    }

    // carrinho de mina
    const cartX = -(cam * 0.5) % 900 + 160;
    drawMineCart(ctx, cartX, 276);

    // veios de minério
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#b96b3e";
    for (let i = 0; i < 9; i++) {
      const x = ((i * 83 - cam * 0.4) % 760 + 760) % 760;
      ctx.fillRect(x, 176 + (i * 37) % 130, 13, 3);
      ctx.fillRect(x + 4, 171 + (i * 37) % 130, 5, 3);
    }
    ctx.restore();

    // brasas
    for (let i = 0; i < 18; i++) {
      const x = ((i * 91 - cam * 0.5) % 700 + 700) % 700;
      const y = 340 - ((i * 57 + time * 0.5) % 190);
      ctx.globalAlpha = 0.35 + (i % 3) * 0.15;
      ctx.fillStyle = "#ff9a55";
      ctx.fillRect(x, y, 2, 2);
      ctx.globalAlpha = 1;
    }
  }

  function drawLantern(ctx, x, y, time) {
    ctx.save();
    art.glow(ctx, x, y + 24, 48, "#ff9d54", 0.2 + Math.sin(time * 0.05) * 0.03);
    art.rect(ctx, x - 1, y - 12, 2, 12, "#4a4138");
    art.rect(ctx, x - 7, y, 14, 18, "#28211b");
    art.rect(ctx, x - 5, y + 2, 10, 13, "#c9863f");
    art.rect(ctx, x - 3, y + 4, 6, 9, "#ffcf7c");
    art.rect(ctx, x - 8, y - 2, 16, 3, "#6a563f");
    art.rect(ctx, x - 6, y + 16, 12, 3, "#6a563f");
    ctx.restore();
  }

  function drawMineCart(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = "#3a3430";
    ctx.fillRect(x, y, 66, 26);
    ctx.fillStyle = "#574a3d";
    ctx.fillRect(x + 4, y + 3, 58, 18);
    ctx.fillStyle = "#77604a";
    ctx.fillRect(x + 9, y + 7, 14, 8);
    ctx.fillRect(x + 29, y + 9, 19, 6);
    // rodas
    art.pixelCircle(ctx, x + 15, y + 28, 7, "#1e1a17");
    art.pixelCircle(ctx, x + 51, y + 28, 7, "#1e1a17");
    art.pixelCircle(ctx, x + 15, y + 28, 3, "#5f5348");
    art.pixelCircle(ctx, x + 51, y + 28, 3, "#5f5348");
    ctx.restore();
  }

  /* ---------------- ÚLTIMA FRONTEIRA ---------------- */
  function drawFrontier(ctx, pal, cam, time) {
    // nuvens de fumaça
    ctx.save();
    ctx.globalAlpha = 0.35;
    for (let i = 0; i < 8; i++) {
      const x = ((i * 113 - cam * 0.07 + time * 0.02) % 800) - 80;
      ctx.fillStyle = i % 2 ? "#35161a" : "#251015";
      ctx.fillRect(x, 80 + (i % 4) * 35, 160, 12);
      ctx.fillRect(x + 40, 72 + (i % 4) * 35, 84, 10);
    }
    ctx.restore();

    // cidadela negra
    const city = 470 - (cam * 0.12) % 600;
    ctx.fillStyle = "#160e11";
    for (let i = 0; i < 5; i++) {
      const x = city + i * 36;
      const h = 150 + (i % 3) * 52;
      ctx.fillRect(x, 270 - h, 26, h);
      ctx.beginPath();
      ctx.moveTo(x - 4, 270 - h); ctx.lineTo(x + 13, 270 - h - 28); ctx.lineTo(x + 30, 270 - h);
      ctx.closePath(); ctx.fill();
      // janelas vermelhas
      ctx.fillStyle = "rgba(224,92,62,.45)";
      ctx.fillRect(x + 9, 292 - h, 4, 7);
      ctx.fillRect(x + 9, 322 - h, 4, 7);
      ctx.fillStyle = "#160e11";
    }
    // torre central
    ctx.fillRect(city + 128, 58, 38, 240);
    ctx.beginPath();
    ctx.moveTo(city + 120, 58); ctx.lineTo(city + 147, 12); ctx.lineTo(city + 174, 58);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(255,110,75,.6)";
    ctx.fillRect(city + 141, 92, 10, 16);
    art.glow(ctx, city + 147, 100, 70, "#ff563e", 0.16);

    // ruínas / estandartes
    const mid = -(cam * 0.27) % 600;
    for (let i = -1; i < 3; i++) {
      const x = mid + i * 340;
      ctx.fillStyle = "#1d1115";
      ctx.fillRect(x + 40, 220, 18, 110);
      ctx.fillRect(x + 28, 212, 42, 10);
      ctx.fillStyle = "#5c1e22";
      ctx.fillRect(x + 58, 218, 32, 42);
      ctx.fillStyle = "#8c322c";
      ctx.fillRect(x + 66, 226, 16, 4);
      ctx.fillStyle = "#1d1115";
      ctx.fillRect(x + 160, 260, 26, 70);
      ctx.fillRect(x + 148, 250, 50, 11);
      // lança
      ctx.fillRect(x + 210, 200, 3, 130);
      ctx.fillStyle = "#5c4b42";
      ctx.beginPath();
      ctx.moveTo(x + 205, 206); ctx.lineTo(x + 211, 190); ctx.lineTo(x + 217, 206);
      ctx.closePath(); ctx.fill();
    }

    // brasas e cinzas
    for (let i = 0; i < 46; i++) {
      const x = ((i * 71 - cam * 0.45 + Math.sin(time * 0.01 + i) * 16) % 700 + 700) % 700;
      const y = ((i * 47 - time * 0.25) % 380 + 380) % 380;
      ctx.globalAlpha = 0.18 + (i % 4) * 0.12;
      ctx.fillStyle = i % 5 === 0 ? "#ff8f5e" : "#b6a69a";
      ctx.fillRect(x, y, i % 6 === 0 ? 2 : 1, 1);
    }
    ctx.globalAlpha = 1;
  }

  /* ============================================================
     CENÁRIOS DO ATO II
     ============================================================ */
  function drawForge(ctx, pal, cam, time) {
    const far = -(cam * 0.08) % 960;
    ctx.save();
    ctx.globalAlpha = 0.75;
    for (let i = -1; i < 3; i++) {
      const x = far + i * 420;
      ctx.fillStyle = pal.far;
      ctx.fillRect(x + 30, 176, 92, 150);
      ctx.fillRect(x + 48, 132, 20, 48);
      ctx.fillRect(x + 86, 148, 16, 34);
      ctx.fillStyle = "rgba(255,140,80,.18)";
      ctx.fillRect(x + 52, 206, 10, 14);
      ctx.fillRect(x + 86, 192, 8, 10);
      ctx.fillRect(x + 180, 202, 120, 120);
      ctx.fillRect(x + 212, 156, 24, 52);
    }
    ctx.restore();

    const mid = -(cam * 0.24) % 720;
    for (let i = -1; i < 3; i++) {
      const x = mid + i * 360;
      ctx.fillStyle = pal.mid;
      ctx.fillRect(x + 40, 230, 250, 96);
      ctx.fillRect(x + 62, 190, 18, 42);
      ctx.fillRect(x + 226, 174, 18, 58);
      // boca da fornalha
      ctx.fillStyle = "#140c09";
      ctx.beginPath();
      ctx.arc(x + 160, 266, 48, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = "rgba(255,150,80,.6)";
      ctx.fillRect(x + 118, 270, 84, 5);
      art.glow(ctx, x + 160, 270, 82, "#ff8a45", 0.18);
      // tubos
      ctx.fillStyle = pal.far;
      ctx.fillRect(x + 8, 246, 42, 8);
      ctx.fillRect(x + 284, 252, 50, 8);
      ctx.fillRect(x + 308, 216, 8, 44);
    }

    const near = -(cam * 0.46) % 560;
    for (let i = -1; i < 3; i++) {
      const x = near + i * 280;
      // correntes
      ctx.fillStyle = "rgba(20,14,12,.75)";
      for (let c = 0; c < 7; c++) {
        ctx.fillRect(x + 40 + (c % 2) * 3, 92 + c * 18, 5, 14);
      }
      // engrenagem
      ctx.save();
      ctx.translate(x + 196, 252);
      ctx.rotate(time * 0.002);
      ctx.fillStyle = "rgba(34,23,19,.85)";
      for (let g = 0; g < 8; g++) {
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-3, -40, 6, 12);
      }
      art.pixelCircle(ctx, 0, 0, 32, "rgba(34,23,19,.85)");
      art.pixelCircle(ctx, 0, 0, 15, "rgba(120,72,44,.35)");
      ctx.restore();
    }
  }

  function drawTemple(ctx, pal, cam, time) {
    const far = -(cam * 0.1) % 900;
    ctx.save();
    ctx.globalAlpha = 0.65;
    for (let i = -1; i < 3; i++) {
      const x = far + i * 380;
      ctx.fillStyle = pal.far;
      ctx.beginPath();
      ctx.moveTo(x, 270); ctx.lineTo(x + 110, 120); ctx.lineTo(x + 210, 220);
      ctx.lineTo(x + 310, 100); ctx.lineTo(x + 390, 270);
      ctx.closePath(); ctx.fill();
      drawArch(ctx, x + 90, 174, 100, 120, pal.mid, 0.55);
    }
    ctx.restore();

    const mid = -(cam * 0.25) % 680;
    for (let i = -1; i < 3; i++) {
      const x = mid + i * 340;
      drawArch(ctx, x + 24, 146, 138, 168, pal.mid, 0.8);
      ctx.fillStyle = pal.near;
      ctx.fillRect(x + 10, 140, 28, 190);
      ctx.fillRect(x + 148, 140, 28, 190);
      ctx.fillRect(x + 4, 128, 178, 16);
      ctx.fillStyle = "rgba(216,197,138,.16)";
      ctx.fillRect(x + 50, 200, 10, 90);
      ctx.fillRect(x + 128, 200, 10, 90);
    }

    const near = -(cam * 0.46) % 520;
    for (let i = -1; i < 3; i++) {
      const x = near + i * 260;
      ctx.fillStyle = "rgba(21,20,27,.9)";
      ctx.fillRect(x + 20, 150, 22, 180);
      ctx.fillRect(x + 8, 138, 46, 14);
      ctx.fillRect(x + 4, 316, 54, 10);
      // lanterna suspensa
      ctx.fillStyle = "rgba(216,197,138,.25)";
      ctx.fillRect(x + 88, 64, 2, 58);
      art.glow(ctx, x + 89, 132, 24, "#e8d9a8", 0.22);
      art.rect(ctx, x + 83, 122, 13, 18, "rgba(232,217,168,.55)");
    }
  }

  function drawDesert(ctx, pal, cam, time) {
    const far = -(cam * 0.06) % 1000;
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = pal.far;
    for (let i = -1; i < 3; i++) {
      const x = far + i * 420;
      ctx.beginPath();
      ctx.moveTo(x, 280); ctx.lineTo(x + 100, 120); ctx.lineTo(x + 200, 280);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 210, 280); ctx.lineTo(x + 280, 166); ctx.lineTo(x + 350, 280);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    const mid = -(cam * 0.2) % 760;
    for (let i = -1; i < 3; i++) {
      const x = mid + i * 380;
      ctx.fillStyle = pal.mid;
      ctx.fillRect(x + 40, 232, 220, 94);
      ctx.fillStyle = pal.far;
      ctx.fillRect(x + 70, 190, 24, 42);
      ctx.fillRect(x + 206, 190, 24, 42);
      ctx.fillRect(x + 54, 180, 192, 16);
      // vidro quebrado
      ctx.fillStyle = "rgba(127,216,207,.28)";
      ctx.beginPath();
      ctx.moveTo(x + 122, 240); ctx.lineTo(x + 146, 194); ctx.lineTo(x + 158, 240);
      ctx.lineTo(x + 136, 226); ctx.lineTo(x + 128, 250);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(232,195,106,.2)";
      ctx.fillRect(x + 170, 248, 40, 4);
    }

    const near = -(cam * 0.42) % 540;
    for (let i = -1; i < 3; i++) {
      const x = near + i * 270;
      ctx.fillStyle = "rgba(42,30,38,.8)";
      ctx.fillRect(x + 30, 150, 14, 180);
      ctx.fillRect(x + 18, 140, 38, 12);
      ctx.fillStyle = "rgba(232,195,106,.35)";
      ctx.fillRect(x + 34, 166, 6, 6);
      // dunas próximas
      ctx.fillStyle = "rgba(122,90,58,.45)";
      ctx.beginPath();
      ctx.moveTo(x + 80, 330); ctx.quadraticCurveTo(x + 150, 270, x + 240, 330);
      ctx.closePath(); ctx.fill();
    }
  }

  function drawVoid(ctx, pal, cam, time) {
    const far = -(cam * 0.07) % 980;
    ctx.save();
    ctx.globalAlpha = 0.5;
    for (let i = -1; i < 3; i++) {
      const x = far + i * 430;
      ctx.fillStyle = pal.far;
      ctx.beginPath();
      ctx.moveTo(x, 300); ctx.lineTo(x + 80, 200); ctx.lineTo(x + 130, 240);
      ctx.lineTo(x + 220, 160); ctx.lineTo(x + 300, 260); ctx.lineTo(x + 360, 300);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    const mid = -(cam * 0.23) % 700;
    for (let i = -1; i < 3; i++) {
      const x = mid + i * 350;
      ctx.fillStyle = pal.mid;
      ctx.fillRect(x + 40, 208, 24, 122);
      ctx.fillRect(x + 28, 196, 48, 14);
      ctx.fillRect(x + 92, 236, 18, 94);
      ctx.fillRect(x + 84, 226, 34, 12);
      // rachadura roxa
      ctx.fillStyle = "rgba(180,140,255,.3)";
      ctx.fillRect(x + 52, 218, 4, 86);
      ctx.fillRect(x + 48, 260, 12, 3);
      art.glow(ctx, x + 55, 252, 42, "#b48cff", 0.12);
    }

    const near = -(cam * 0.44) % 560;
    for (let i = -1; i < 3; i++) {
      const x = near + i * 280;
      // pedras flutuantes
      const fy = 120 + Math.sin(time * 0.012 + i) * 10;
      ctx.fillStyle = "rgba(23,17,38,.9)";
      ctx.beginPath();
      ctx.moveTo(x + 46, fy); ctx.lineTo(x + 92, fy - 18); ctx.lineTo(x + 126, fy + 4);
      ctx.lineTo(x + 92, fy + 26); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(180,140,255,.22)";
      ctx.fillRect(x + 70, fy - 4, 22, 3);
      ctx.fillStyle = "rgba(23,17,38,.7)";
      ctx.fillRect(x + 170, 168, 10, 152);
      ctx.fillRect(x + 160, 160, 30, 8);
    }
  }

  function drawCelestial(ctx, pal, cam, time) {
    const far = -(cam * 0.08) % 940;
    ctx.save();
    ctx.globalAlpha = 0.55;
    for (let i = -1; i < 3; i++) {
      const x = far + i * 410;
      ctx.fillStyle = pal.far;
      ctx.beginPath();
      ctx.moveTo(x, 260); ctx.lineTo(x + 80, 150); ctx.lineTo(x + 150, 230);
      ctx.lineTo(x + 230, 120); ctx.lineTo(x + 310, 250); ctx.lineTo(x + 360, 260);
      ctx.closePath(); ctx.fill();
      // ilhas flutuantes
      ctx.fillStyle = "rgba(201,195,172,.18)";
      ctx.beginPath();
      ctx.moveTo(x + 40, 196); ctx.lineTo(x + 120, 180); ctx.lineTo(x + 170, 198);
      ctx.lineTo(x + 100, 222); ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    const mid = -(cam * 0.24) % 720;
    for (let i = -1; i < 3; i++) {
      const x = mid + i * 360;
      ctx.fillStyle = pal.mid;
      ctx.fillRect(x + 42, 234, 180, 88);
      ctx.fillRect(x + 58, 204, 20, 30);
      ctx.fillRect(x + 186, 204, 20, 30);
      ctx.fillRect(x + 48, 194, 168, 14);
      // janela partida
      ctx.fillStyle = "rgba(255,240,176,.28)";
      ctx.beginPath();
      ctx.moveTo(x + 104, 260); ctx.lineTo(x + 130, 220); ctx.lineTo(x + 152, 260);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(124,106,143,.5)";
      ctx.fillRect(x + 124, 236, 8, 24);
    }

    const near = -(cam * 0.45) % 560;
    for (let i = -1; i < 3; i++) {
      const x = near + i * 280;
      // asa caída
      ctx.save();
      ctx.translate(x + 120, 186 + Math.sin(time * 0.01 + i) * 4);
      ctx.rotate(-0.24);
      ctx.fillStyle = "rgba(231,223,196,.35)";
      for (let f = 0; f < 5; f++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(18 + f * 13, -10 - f * 5);
        ctx.lineTo(24 + f * 14, 4 - f * 3);
        ctx.lineTo(10 + f * 12, 10);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      // penas soltas
      ctx.fillStyle = "rgba(255,240,176,.35)";
      for (let p = 0; p < 3; p++) {
        const py = 70 + ((time * 0.18 + p * 47 + i * 31) % 220);
        const px = x + 40 + p * 33 + Math.sin(time * 0.02 + p) * 9;
        ctx.fillRect(px, py, 4, 2);
        ctx.fillRect(px + 4, py + 2, 4, 2);
      }
    }
  }

  /* ============================================================
     CENA DO TÍTULO
     ============================================================ */
  function drawTitleScene(ctx, time) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#0a1015");
    g.addColorStop(0.55, "#17252a");
    g.addColorStop(1, "#39291f");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // estrelas
    const rnd = art.rng(33);
    for (let i = 0; i < 70; i++) {
      const x = rnd() * W, y = rnd() * 210;
      ctx.globalAlpha = 0.18 + rnd() * 0.55;
      ctx.fillStyle = i % 7 === 0 ? "#e6c483" : "#c6d4cf";
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = 1;
    art.pixelCircle(ctx, 505, 72, 30, "#d8cfae");
    art.pixelCircle(ctx, 516, 65, 27, "#101a20");

    // montanhas
    ctx.fillStyle = "#121f23";
    ctx.beginPath();
    ctx.moveTo(0, 260); ctx.lineTo(100, 155); ctx.lineTo(210, 235);
    ctx.lineTo(330, 120); ctx.lineTo(470, 245); ctx.lineTo(560, 170);
    ctx.lineTo(640, 245); ctx.lineTo(640, 360); ctx.lineTo(0, 360);
    ctx.closePath(); ctx.fill();

    // árvores gigantes
    for (let i = 0; i < 4; i++) {
      const x = 40 + i * 170;
      ctx.fillStyle = "#0b1517";
      ctx.fillRect(x, 50, 44 + (i % 2) * 16, 310);
      ctx.fillRect(x - 18, 110, 30, 9);
      ctx.fillRect(x - 32, 100, 18, 8);
      ctx.fillRect(x + 44, 165, 42, 8);
      ctx.fillRect(x + 76, 152, 14, 9);
      // copa
      for (let j = 0; j < 7; j++) {
        ctx.beginPath();
        ctx.moveTo(x - 20 + j * 14, 52);
        ctx.lineTo(x + 20 + j * 14, 52);
        ctx.lineTo(x + j * 14, 12 + (j % 3) * 8);
        ctx.closePath(); ctx.fill();
      }
    }

    // névoa
    ctx.fillStyle = "rgba(174,194,182,.055)";
    ctx.fillRect(0, 246, W, 26);
    ctx.fillRect(0, 284, W, 18);

    // clareira e fogueira
    ctx.fillStyle = "#221b14";
    ctx.beginPath();
    ctx.ellipse(320, 338, 250, 58, 0, 0, Math.PI * 2);
    ctx.fill();
    drawCampfire(ctx, 320, 302, time, 1.1);
    drawPedroSilhouette(ctx, 250, 318, time);

    // pedras
    const r2 = art.rng(7);
    for (let i = 0; i < 22; i++) {
      const x = r2() * W;
      const y = 312 + r2() * 40;
      ctx.fillStyle = i % 2 ? "#17140f" : "#252018";
      ctx.fillRect(x, y, 4 + r2() * 9, 2 + r2() * 4);
    }
    // brasas
    for (let i = 0; i < 24; i++) {
      const x = 320 + Math.sin(time * 0.018 + i * 1.7) * (8 + (i * 7) % 40);
      const y = 300 - ((time * 0.28 + i * 19) % 150);
      ctx.globalAlpha = 0.65 - (300 - y) / 300;
      ctx.fillStyle = i % 4 === 0 ? "#ffd38a" : "#e87a42";
      ctx.fillRect(x, y, 1 + (i % 2), 1 + (i % 3 === 0 ? 1 : 0));
    }
    ctx.globalAlpha = 1;

    // vinheta
    vignette(ctx, 0.62);
  }

  function drawCampfire(ctx, x, y, time, scale) {
    scale = scale || 1;
    art.glow(ctx, x, y, 120 * scale, "#ff8b45", 0.22);
    // pedras
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.fillStyle = i % 2 ? "#484238" : "#353129";
      ctx.fillRect(x + Math.cos(a) * 24 * scale - 4, y + Math.sin(a) * 8 * scale, 8, 4);
    }
    // troncos
    ctx.save();
    ctx.translate(x, y - 4);
    ctx.rotate(-0.18);
    art.rect(ctx, -22 * scale, 0, 44 * scale, 7 * scale, "#4b3322");
    art.rect(ctx, -18 * scale, 1, 36 * scale, 2 * scale, "#755039");
    ctx.rotate(0.36);
    art.rect(ctx, -20 * scale, 0, 40 * scale, 6 * scale, "#3b281c");
    ctx.restore();
    // chamas em camadas
    const t = time * 0.06;
    const flames = [
      { w: 34, h: 46, c: "#b94128", o: 0.85 },
      { w: 24, h: 38, c: "#e97338", o: 0.95 },
      { w: 15, h: 28, c: "#ffc35e", o: 1 },
      { w: 7, h: 17, c: "#fff1b0", o: 1 }
    ];
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    flames.forEach(function (f, k) {
      const sway = Math.sin(t + k * 1.6) * (4 + k * 2);
      ctx.fillStyle = f.c;
      ctx.globalAlpha = f.o;
      for (let i = 0; i < 5; i++) {
        const ww = f.w * (1 - i / 7);
        const yy = y - 8 - i * (f.h / 7);
        ctx.fillRect(x - ww / 2 + sway * (i / 5), yy, ww, f.h / 5 + 2);
      }
    });
    ctx.restore();
    // faíscas
    for (let i = 0; i < 16; i++) {
      const sx = x + Math.sin(time * 0.03 + i * 2.4) * (10 + (i * 9) % 36);
      const sy = y - 18 - ((time * 0.5 + i * 17) % 110);
      ctx.globalAlpha = 0.8 - (y - sy) / 150;
      ctx.fillStyle = i % 3 === 0 ? "#ffdf94" : "#ff9758";
      ctx.fillRect(sx, sy, 1, 2);
    }
    ctx.globalAlpha = 1;
  }

  function drawPedroSilhouette(ctx, x, baseY, time) {
    ctx.save();
    ctx.translate(x, baseY);
    // tronco sentado
    ctx.fillStyle = "#15110d";
    ctx.fillRect(-24, -34, 48, 34);
    ctx.fillRect(-30, -18, 12, 18);
    // cabeça e cabelo
    art.pixelCircle(ctx, 0, -48, 15, "#15110d");
    art.pixelCircle(ctx, -11, -52, 8, "#100c09");
    art.pixelCircle(ctx, 11, -51, 8, "#100c09");
    art.pixelCircle(ctx, 0, -61, 7, "#100c09");
    // braço apoiado no joelho
    ctx.fillRect(16, -30, 22, 7);
    ctx.fillRect(32, -25, 8, 15);
    // perna
    ctx.fillRect(-18, -2, 34, 8);
    ctx.fillRect(14, -18, 8, 18);
    // brilho da fogueira
    ctx.globalAlpha = 0.18 + Math.sin(time * 0.03) * 0.02;
    ctx.fillStyle = "#ff9a55";
    ctx.fillRect(-30, -58, 60, 58);
    ctx.restore();
    art.shadow(ctx, x + 2, baseY + 3, 30, 0.35);
  }

  function drawCampScene(ctx, time) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#0b1214");
    g.addColorStop(0.6, "#1d2421");
    g.addColorStop(1, "#432b1d");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // estrelas
    const rnd = art.rng(91);
    for (let i = 0; i < 55; i++) {
      ctx.globalAlpha = 0.15 + rnd() * 0.4;
      ctx.fillStyle = "#d9d4b8";
      ctx.fillRect(rnd() * W, rnd() * 190, 1, 1);
    }
    ctx.globalAlpha = 1;
    // árvores
    for (let i = 0; i < 5; i++) {
      const x = i * 160 - 40;
      ctx.fillStyle = "#0b1415";
      ctx.fillRect(x, 40, 38, 290);
      ctx.fillRect(x - 16, 100, 20, 8);
      ctx.fillRect(x + 38, 155, 30, 8);
    }
    ctx.fillStyle = "rgba(165,186,171,.05)";
    ctx.fillRect(0, 235, W, 30);
    // chão
    ctx.fillStyle = "#201b13";
    ctx.beginPath();
    ctx.ellipse(320, 350, 280, 70, 0, 0, Math.PI * 2);
    ctx.fill();
    drawCampfire(ctx, 420, 305, time, 1.35);
    drawPedroSilhouette(ctx, 270, 320, time);
    // equipamento
    ctx.fillStyle = "#16130f";
    ctx.fillRect(500, 302, 44, 22);
    ctx.fillRect(512, 292, 3, 30);
    // brasas
    for (let i = 0; i < 30; i++) {
      const x = 420 + Math.sin(time * 0.025 + i * 1.2) * (16 + (i * 11) % 80);
      const y = 300 - ((time * 0.24 + i * 13) % 170);
      ctx.globalAlpha = 0.55 - (300 - y) / 400;
      ctx.fillStyle = i % 4 === 0 ? "#ffd38a" : "#e87a42";
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = 1;
    vignette(ctx, 0.55);
  }

  function drawThroneScene(ctx, time, tone) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    if (tone === "warm") {
      g.addColorStop(0, "#3b2a23");
      g.addColorStop(0.55, "#9b5f42");
      g.addColorStop(1, "#e3b06a");
    } else if (tone === "gold") {
      g.addColorStop(0, "#231c13");
      g.addColorStop(0.55, "#67512e");
      g.addColorStop(1, "#d5af62");
    } else {
      g.addColorStop(0, "#100d11");
      g.addColorStop(0.55, "#2c1a20");
      g.addColorStop(1, "#4e2325");
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // vitral
    if (tone !== "dark") {
      ctx.save();
      ctx.globalAlpha = 0.2;
      art.pixelCircle(ctx, 320, 126, 92, "#ffd79b");
      ctx.restore();
    }
    // colunas
    for (let i = 0; i < 4; i++) {
      const x = 30 + i * 200;
      ctx.fillStyle = "rgba(14,11,12,.7)";
      ctx.fillRect(x, 30, 34, 300);
      ctx.fillRect(x - 8, 22, 50, 14);
      ctx.fillRect(x - 12, 320, 58, 18);
    }
    // trono
    ctx.fillStyle = "#100c0e";
    ctx.fillRect(272, 178, 96, 142);
    ctx.fillRect(282, 145, 76, 42);
    ctx.fillRect(298, 98, 44, 55);
    ctx.fillStyle = "rgba(198,155,75,.4)";
    ctx.fillRect(312, 100, 4, 45);
    ctx.fillRect(340, 100, 3, 35);
    // coroa caída
    ctx.save();
    ctx.translate(432, 318);
    ctx.rotate(0.16);
    ctx.fillStyle = "#c69b4b";
    ctx.fillRect(-16, 0, 32, 7);
    ctx.fillRect(-14, -8, 5, 8);
    ctx.fillRect(-3, -10, 5, 10);
    ctx.fillRect(8, -8, 5, 8);
    ctx.restore();
    // poeira
    for (let i = 0; i < 26; i++) {
      const x = ((i * 83 + time * 0.1) % 700) - 20;
      const y = ((i * 57 + time * 0.2) % 380) - 20;
      ctx.globalAlpha = 0.15 + (i % 3) * 0.08;
      ctx.fillStyle = "#ffe0a8";
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = 1;
    vignette(ctx, 0.6);
  }

  function vignette(ctx, strength) {
    const g = ctx.createRadialGradient(320, 180, 150, 320, 180, 390);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0," + (strength || 0.5) + ")");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
})();
