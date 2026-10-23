/* ============================================================
   TERRA PERDIDA — entrada: teclado, mouse, toque e gamepad
   ============================================================ */
(function () {
  "use strict";
  const TP = (window.TP = window.TP || {});

  const input = {
    left: false, right: false, jumpDown: false, jumpPressed: false,
    attackDown: false, attackPressed: false, dashPressed: false,
    pausePressed: false, advancePressed: false,
    usingGamepad: false, hasTouch: false,
    _mouseHeld: false, _touchLeft: false, _touchRight: false,
    _touchJump: false, _touchAttack: false
  };
  TP.input = input;

  let held = Object.create(null);
  let padPrev = [];
  let padConnected = false;
  let lastMenuKey = null;

  input.hasTouch = ("ontouchstart" in window) || navigator.maxTouchPoints > 0;

  function isTypingTarget(el) {
    if (!el) return false;
    const tag = (el.tagName || "").toLowerCase();
    return tag === "input" || tag === "textarea" || tag === "select";
  }

  function keyDown(e) {
    if (isTypingTarget(e.target)) return;
    const code = e.code;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].indexOf(code) >= 0) {
      e.preventDefault();
    }
    if (held[code]) return;
    held[code] = true;

    if (code === "ArrowLeft" || code === "KeyA") input.left = true;
    if (code === "ArrowRight" || code === "KeyD") input.right = true;
    if (code === "Space" || code === "ArrowUp" || code === "KeyW" || code === "KeyZ") {
      input.jumpDown = true;
      input.jumpPressed = true;
    }
    if (code === "KeyJ" || code === "KeyX") {
      input.attackDown = true;
      input.attackPressed = true;
    }
    if (code === "ShiftLeft" || code === "ShiftRight" || code === "KeyK" || code === "KeyC") {
      input.dashPressed = true;
    }
    if (code === "Escape" || code === "KeyP") {
      input.pausePressed = true;
    }
    if (code === "Enter" || code === "Space" || code === "KeyE") {
      input.advancePressed = true;
      if (TP.ui && TP.game && TP.game.getMode && TP.game.getMode() === "dialogue") {
        TP.ui.advanceDialogue();
      }
    }
  }

  function keyUp(e) {
    const code = e.code;
    held[code] = false;
    if (code === "ArrowLeft" || code === "KeyA") input.left = false;
    if (code === "ArrowRight" || code === "KeyD") input.right = false;
    if (code === "Space" || code === "ArrowUp" || code === "KeyW" || code === "KeyZ") input.jumpDown = false;
    if (code === "KeyJ" || code === "KeyX") input.attackDown = false;
  }

  window.addEventListener("keydown", keyDown);
  window.addEventListener("keyup", keyUp);

  function releaseAll() {
    input.left = false;
    input.right = false;
    input.jumpDown = false;
    input.attackDown = false;
    input.attackPressed = false;
    input.jumpPressed = false;
    input.dashPressed = false;
    input.pausePressed = false;
    input.advancePressed = false;
    held = Object.create(null);
  }
  input.releaseAll = releaseAll;

  // Evita perder teclas quando a janela perde foco.
  window.addEventListener("blur", function () {
    for (const k in held) held[k] = false;
    input.left = input.right = input.jumpDown = input.attackDown = false;
    input._mouseHeld = false;
    input._touchLeft = input._touchRight = false;
    input._touchJump = input._touchAttack = false;
  });

  // ---------- mouse ----------
  let canvasEl = null;
  input.bindCanvas = function (canvas) {
    canvasEl = canvas;
    canvas.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse") return;
      if (!TP.game || TP.game.getMode() !== "playing") return;
      input._mouseHeld = true;
      input.attackDown = true;
      input.attackPressed = true;
    });
    window.addEventListener("pointerup", function (e) {
      if (e.pointerType === "mouse") {
        input._mouseHeld = false;
        input.attackDown = false;
      }
    });
    window.addEventListener("pointercancel", function () {
      input._mouseHeld = false;
      input.attackDown = false;
    });
  };

  function setTouch(action, down, e) {
    if (e) e.preventDefault();
    if (action === "left") { input.left = down; input._touchLeft = down; }
    if (action === "right") { input.right = down; input._touchRight = down; }
    if (action === "jump") {
      input.jumpDown = down;
      input._touchJump = down;
      if (down) input.jumpPressed = true;
    }
    if (action === "attack") {
      input.attackDown = down;
      input._touchAttack = down;
      if (down) input.attackPressed = true;
    }
    if (action === "dash" && down) input.dashPressed = true;
    if (action === "pause" && down) input.pausePressed = true;
  }

  input.bindTouch = function (buttons) {
    buttons.forEach(function (btn) {
      const action = btn.getAttribute("data-action");
      if (!action) return;
      btn.addEventListener("pointerdown", function (e) {
        if (btn.setPointerCapture) {
          try { btn.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        }
        setTouch(action, true, e);
      });
      const up = function (e) { setTouch(action, false, e); };
      btn.addEventListener("pointerup", up);
      btn.addEventListener("pointercancel", up);
      btn.addEventListener("lostpointercapture", up);
      btn.addEventListener("pointerleave", function (e) {
        if (e.buttons === 0) return;
        setTouch(action, false, e);
      });
      btn.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    });
  };

  function activeMenuScreen() {
    const screens = document.querySelectorAll(".screen.active");
    return screens.length ? screens[screens.length - 1] : null;
  }

  function menuFocusables(screen) {
    if (!screen) return [];
    return Array.prototype.slice.call(screen.querySelectorAll("button:not([disabled])"))
      .filter(function (el) { return el.offsetParent !== null && el.getClientRects().length > 0; });
  }

  function preferredMenuTarget(screen) {
    if (!screen) return null;
    const map = {
      "screen-account": "#btn-account-play, #btn-account-skip, #btn-account-create",
      "screen-title": "#btn-start",
      "screen-characters": ".char-card.selected, [data-char]",
      "screen-difficulty": ".diff-card.selected, [data-diff]",
      "screen-how": "#btn-how-close",
      "screen-pause": "#btn-resume",
      "screen-journal": "#btn-journal-back",
      "screen-gameover": "#btn-continue-checkpoint",
      "screen-ending": ".ending-choice:not([disabled])",
      "screen-camp": "#camp-wardrobe-panel:not(.hidden) #wardrobe-action [data-wardrobe-act], #btn-camp-continue"
    };
    const sel = map[screen.id];
    if (!sel) return null;
    const els = screen.querySelectorAll(sel);
    for (let i = 0; i < els.length; i++) {
      if (els[i].offsetParent !== null && els[i].getClientRects().length > 0) return els[i];
    }
    return null;
  }

  function moveMenuFocus(screen, step) {
    const list = menuFocusables(screen);
    if (!list.length) return;
    let i = list.indexOf(document.activeElement);
    if (i < 0) i = step > 0 ? -1 : 0;
    i = (i + step + list.length) % list.length;
    list[i].focus();
  }

  function updateGamepadMenu(pressed, prev) {
    if (!TP.game || !TP.game.getMode) return;
    const mode = TP.game.getMode();
    const menuMode = ["account", "title", "characters", "difficulty", "how", "paused", "camp", "gameover", "ending", "endingText"].indexOf(mode) >= 0;
    if (!menuMode) { lastMenuKey = null; return; }
    const screen = activeMenuScreen();
    if (!screen) { lastMenuKey = null; return; }
    const key = screen.id + "|" + mode;
    const focusList = menuFocusables(screen);
    const active = document.activeElement;
    const focusValid = active && focusList.indexOf(active) >= 0;
    if (key !== lastMenuKey || !focusValid) {
      lastMenuKey = key;
      const pref = preferredMenuTarget(screen) || focusList[0];
      if (pref) {
        try { pref.focus(); } catch (err) { /* ignore */ }
      }
    }
    if (pressed(14) && !prev[14]) moveMenuFocus(screen, -1);
    if (pressed(15) && !prev[15]) moveMenuFocus(screen, 1);
    if (pressed(12) && !prev[12]) moveMenuFocus(screen, -1);
    if (pressed(13) && !prev[13]) moveMenuFocus(screen, 1);
    if (pressed(0) && !prev[0]) {
      const el = document.activeElement;
      if (el && el.tagName === "BUTTON" && !el.disabled && el.closest(".screen.active")) {
        el.click();
      }
    }
  }

  // ---------- gamepad ----------
  function pollGamepad() {
    if (!navigator.getGamepads) return;
    const pads = navigator.getGamepads();
    let pad = null;
    for (let i = 0; i < pads.length; i++) {
      if (pads[i] && pads[i].connected) { pad = pads[i]; break; }
    }
    if (!pad) {
      if (padConnected) {
        padConnected = false;
        input.usingGamepad = false;
        padPrev = [];
      }
      return;
    }
    if (!padConnected) {
      padConnected = true;
      input.usingGamepad = true;
    }
    const b = pad.buttons;
    const pressed = function (i) { return b[i] && b[i].pressed; };
    const axisX = pad.axes[0] || 0;
    const axisY = pad.axes[1] || 0;
    const left = axisX < -0.35 || pressed(14);
    const right = axisX > 0.35 || pressed(15);
    const jump = pressed(0);
    const attack = pressed(2);
    const dash = pressed(1);
    const pause = pressed(9);

    if (left) input.left = true;
    else if (!held.ArrowLeft && !held.KeyA && !input._touchLeft) input.left = false;
    if (right) input.right = true;
    else if (!held.ArrowRight && !held.KeyD && !input._touchRight) input.right = false;

    // Para não misturar gamepad com teclado de forma confusa, atualizamos
    // os campos de ação; o teclado e o toque, se usados, também contam.
    input.jumpDown = jump || held.Space || held.ArrowUp || held.KeyW || input._touchJump;
    input.attackDown = attack || held.KeyJ || held.KeyX || input._mouseHeld || input._touchAttack;

    const prev = padPrev;
    if (jump && !prev[0]) {
      input.jumpPressed = true;
      input.advancePressed = true;
    }
    if (attack && !prev[2]) input.attackPressed = true;
    if (dash && !prev[1]) input.dashPressed = true;
    if (pause && !prev[9]) input.pausePressed = true;
    if (jump && !prev[0] && TP.game && TP.game.getMode && TP.game.getMode() === "dialogue") {
      if (TP.ui) TP.ui.advanceDialogue();
    }
    if (!jump && prev[0] && !held.Space) input.jumpDown = input._touchJump;
    if (!attack && prev[2] && !held.KeyJ) input.attackDown = input._mouseHeld || input._touchAttack;

    updateGamepadMenu(pressed, prev);

    padPrev = b.map(function (x) { return !!(x && x.pressed); });
  }

  // Guardamos os botões de toque para não sobrescrever no poll do gamepad.
  input.bindTouchButtons = function (buttons) {
    buttons.forEach(function (btn) {
      const action = btn.getAttribute("data-action");
      if (!action) return;
      btn.addEventListener("pointerdown", function () {
        if (action === "left") input._touchLeft = true;
        if (action === "right") input._touchRight = true;
      });
      const up = function () {
        if (action === "left") input._touchLeft = false;
        if (action === "right") input._touchRight = false;
      };
      btn.addEventListener("pointerup", up);
      btn.addEventListener("pointercancel", up);
    });
  };

  input.poll = function () {
    pollGamepad();
  };

  input.consume = function () {
    input.jumpPressed = false;
    input.attackPressed = false;
    input.dashPressed = false;
    input.pausePressed = false;
    input.advancePressed = false;
  };

  // Converte toque em cliques de interface quando o alvo é um botão.
  document.addEventListener("contextmenu", function (e) {
    const t = e.target;
    if (t && t.closest && t.closest(".no-menu")) e.preventDefault();
  });
})();
