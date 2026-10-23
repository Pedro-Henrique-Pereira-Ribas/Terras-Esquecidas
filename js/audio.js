/* ============================================================
   TERRA PERDIDA — áudio procedural (WebAudio, sem assets)
   ============================================================ */
(function () {
  "use strict";
  const TP = (window.TP = window.TP || {});

  const A = {
    ctx: null,
    master: null,
    enabled: true,
    ambient: null,
    ambientGain: null,
    ambientTimer: null,
    pendingTheme: null,
    lastTalk: 0,
    noiseBuffer: null,
    unlocked: false,
    resuming: false
  };

  try {
    const saved = localStorage.getItem("terra-perdida-sound");
    if (saved === "off") A.enabled = false;
  } catch (e) { /* sem localStorage */ }

  function resumeContext() {
    if (!A.ctx || !A.unlocked || A.ctx.state !== "suspended" || A.resuming) return;
    A.resuming = true;
    const resuming = A.ctx.resume();
    const clear = function () { A.resuming = false; };
    if (resuming && resuming.then) resuming.then(clear).catch(clear);
    else clear();
  }

  A.init = function () {
    if (A.ctx) {
      // Só tentamos retomar depois de um gesto real; evita avisos do navegador.
      resumeContext();
      return;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    A.ctx = new Ctx();
    A.master = A.ctx.createGain();
    A.master.gain.value = A.enabled ? 0.3 : 0;
    A.master.connect(A.ctx.destination);

    // buffer de ruído para impactos
    const len = Math.floor(A.ctx.sampleRate * 0.5);
    const buf = A.ctx.createBuffer(1, len, A.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    A.noiseBuffer = buf;

    if (A.pendingTheme !== null) {
      const t = A.pendingTheme;
      A.pendingTheme = null;
      A.startTheme(t);
    }

    resumeContext();
  };

  A.setEnabled = function (on) {
    A.enabled = !!on;
    if (A.master && A.ctx) {
      A.master.gain.cancelScheduledValues(A.ctx.currentTime);
      A.master.gain.linearRampToValueAtTime(A.enabled ? 0.3 : 0, A.ctx.currentTime + 0.12);
    }
    try { localStorage.setItem("terra-perdida-sound", A.enabled ? "on" : "off"); } catch (e) {}
  };

  A.toggle = function () {
    A.setEnabled(!A.enabled);
    return A.enabled;
  };

  function tone(freq, dur, type, vol, slideTo, delay) {
    if (!A.ctx || !A.enabled) return;
    const t0 = A.ctx.currentTime + (delay || 0);
    const osc = A.ctx.createOscillator();
    const g = A.ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(Math.max(20, freq), t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol || 0.08), t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(A.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  function noise(dur, vol, freq, q, delay) {
    if (!A.ctx || !A.enabled || !A.noiseBuffer) return;
    const t0 = A.ctx.currentTime + (delay || 0);
    const src = A.ctx.createBufferSource();
    src.buffer = A.noiseBuffer;
    const filter = A.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = freq || 700;
    filter.Q.value = q || 0.7;
    const g = A.ctx.createGain();
    g.gain.setValueAtTime(vol || 0.06, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(A.master);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  A.sfx = function (name) {
    // Não criamos o contexto aqui: ele só nasce no primeiro gesto do jogador.
    if (!A.ctx || !A.enabled) return;
    switch (name) {
      case "jump": tone(250, 0.14, "triangle", 0.06, 420); break;
      case "doublejump": tone(420, 0.18, "sine", 0.055, 700); tone(660, 0.1, "triangle", 0.03, 900, 0.03); break;
      case "attack": noise(0.08, 0.055, 1200, 1.2); tone(170, 0.09, "sawtooth", 0.035, 90); break;
      case "shoot": tone(760, 0.12, "triangle", 0.045, 280); noise(0.05, 0.025, 2200, 1.4); break;
      case "hit": noise(0.09, 0.07, 550, 0.8); tone(140, 0.09, "square", 0.025, 90); break;
      case "hurt": tone(110, 0.24, "sawtooth", 0.06, 50); noise(0.15, 0.05, 260, 0.6); break;
      case "heal": tone(420, 0.2, "sine", 0.05, 630); tone(630, 0.28, "sine", 0.035, 840, 0.07); break;
      case "coin": tone(1040, 0.08, "square", 0.035); tone(1560, 0.14, "square", 0.03, 1560, 0.06); break;
      case "buy": tone(390, 0.1, "triangle", 0.05); tone(520, 0.12, "triangle", 0.05, 520, 0.08); tone(780, 0.25, "sine", 0.05, 1040, 0.16); break;
      case "memory": tone(880, 0.5, "sine", 0.045, 1320); tone(660, 0.6, "sine", 0.025, 990, 0.08); break;
      case "checkpoint": tone(300, 0.3, "sine", 0.05, 450); tone(450, 0.45, "sine", 0.035, 600, 0.1); break;
      case "death": tone(180, 0.8, "sawtooth", 0.06, 40); noise(0.6, 0.05, 160, 0.5); break;
      case "boss": tone(65, 0.8, "sawtooth", 0.075, 42); noise(0.7, 0.07, 130, 0.5); break;
      case "explosion": noise(0.42, 0.11, 160, 0.5); tone(75, 0.35, "sawtooth", 0.05, 35); break;
      case "click": tone(520, 0.05, "square", 0.025, 460); break;
      case "talk": {
        const now = performance.now();
        if (now - A.lastTalk < 75) return;
        A.lastTalk = now;
        tone(180 + Math.random() * 100, 0.025, "square", 0.008, 220);
        break;
      }
      case "wave": tone(170, 0.3, "triangle", 0.04, 110); noise(0.2, 0.025, 300, 0.8); break;
      case "victory": {
        [392, 494, 587, 784].forEach((f, i) => tone(f, 0.55, "sine", 0.04, f, i * 0.13));
        break;
      }
      default: break;
    }
  };

  const SCALES = [
    [220, 261.63, 293.66, 349.23, 392.0, 440.0],
    [196, 233.08, 261.63, 293.66, 349.23, 392.0],
    [174.61, 220, 233.08, 261.63, 349.23, 392.0],
    [146.83, 174.61, 196, 220, 261.63, 293.66],
    [130.81, 164.81, 196, 233.08, 261.63, 311.13]
  ];
  const ROOTS = [110, 98, 87.31, 73.42, 65.41];

  A.startTheme = function (index) {
    A.pendingTheme = index;
    if (!A.ctx) return;
    A.stopTheme();
    const t = Math.max(0, Math.min(4, index | 0));
    const now = A.ctx.currentTime;

    const bus = A.ctx.createGain();
    bus.gain.setValueAtTime(0.0001, now);
    bus.gain.linearRampToValueAtTime(0.11, now + 1.2);
    const filter = A.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 720;
    filter.Q.value = 0.5;
    bus.connect(filter);
    filter.connect(A.master);

    const drone = A.ctx.createOscillator();
    drone.type = "sine";
    drone.frequency.value = ROOTS[t];
    const drone2 = A.ctx.createOscillator();
    drone2.type = "triangle";
    drone2.frequency.value = ROOTS[t] * 1.5;
    const dg = A.ctx.createGain();
    dg.gain.value = 0.18;
    drone.connect(dg);
    drone2.connect(dg);
    dg.connect(bus);
    drone.start();
    drone2.start();

    const lfo = A.ctx.createOscillator();
    const lfoGain = A.ctx.createGain();
    lfo.frequency.value = 0.07 + t * 0.01;
    lfoGain.gain.value = 0.06;
    lfo.connect(lfoGain);
    lfoGain.connect(bus.gain);
    lfo.start();

    A.ambient = { bus, drone, drone2, lfo, index: t, step: 0, next: 0 };
    A.ambientTimer = setInterval(function () {
      if (!A.ctx || !A.enabled || !A.ambient) return;
      const a = A.ambient;
      const now2 = A.ctx.currentTime;
      if (now2 < a.next) return;
      a.next = now2 + 1.25 + Math.random() * 1.3;
      const scale = SCALES[a.index];
      const notes = [scale[a.step % scale.length], scale[(a.step + 2) % scale.length]];
      a.step++;
      notes.forEach(function (freq, i) {
        const osc = A.ctx.createOscillator();
        const g = A.ctx.createGain();
        osc.type = i === 0 ? "sine" : "triangle";
        osc.frequency.value = freq * (i === 0 ? 2 : 3);
        g.gain.setValueAtTime(0.0001, now2 + i * 0.16);
        g.gain.exponentialRampToValueAtTime(i === 0 ? 0.018 : 0.008, now2 + i * 0.16 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now2 + i * 0.16 + 1.4);
        osc.connect(g);
        g.connect(a.bus);
        osc.start(now2 + i * 0.16);
        osc.stop(now2 + i * 0.16 + 1.5);
      });
    }, 320);
  };

  A.stopTheme = function () {
    if (A.ambientTimer) {
      clearInterval(A.ambientTimer);
      A.ambientTimer = null;
    }
    if (A.ambient && A.ctx) {
      const a = A.ambient;
      const now = A.ctx.currentTime;
      try {
        a.bus.gain.cancelScheduledValues(now);
        a.bus.gain.setValueAtTime(a.bus.gain.value, now);
        a.bus.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        a.drone.stop(now + 0.45);
        a.drone2.stop(now + 0.45);
        a.lfo.stop(now + 0.45);
      } catch (e) {}
      A.ambient = null;
    }
  };

  A.campTheme = function () {
    A.startTheme(0);
  };

  TP.audio = A;

  // O navegador exige um gesto para iniciar o áudio.
  function unlock() {
    A.unlocked = true;
    A.init();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  }
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("keydown", unlock);
})();
