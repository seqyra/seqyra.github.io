/* ══════════════════════════════════════════════════════════════════
   SEQYRA — pink anime bio · script.js
   ──────────────────────────────────────────────────────────────────
   What lives in here:
     1. CAT PAW CURSOR  — paw pointer + walking paw-print trail 🐾
     2. BACKGROUND      — falling sakura petals, floating hearts,
                          twinkling sparkles and soft bokeh
     3. HEADPATS        — click the character art; the counter
                          remembers (milestones included ♡)
     4. VISITOR COUNTER — all-time visits via the free Abacus API.
                          Works on GitHub Pages (no backend!).
                          ⚠ Change COUNTER_NAMESPACE below to
                            something unique to YOU.
     5. KAWAII BGM ♪    — a tiny music-box melody generated live
                          with the Web Audio API (no files needed).
                          Plays automatically from the visitor's
                          first click/tap (browser autoplay rules).
                          → Want your own mp3? See the commented
                            <audio> tag at the bottom of index.html.
     6. UI SUGAR        — typing effect, scroll reveal,
                          placeholder-link toast
     7. GOODIES         — double-click sakura burst, N = heart storm,
                          DO-NOT-BOOP button, pettable neko,
                          mission clock, console commands

   You normally DON'T need to edit this file to add your links —
   all link placeholders live in index.html (search for "INSERT").
   ══════════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  /* ═══ VISITOR COUNTER SETTINGS ══════════════════════════════════
     The counter stores a number on abacus.jasoncameron.dev (free,
     no signup). Namespace+key identify YOUR counter — make the
     namespace unique (e.g. "seqyra-github-io-2026") so nobody
     else's site shares it. First visit creates it automatically. */
  const COUNTER_NAMESPACE = 'seqyra-pink-site';
  const COUNTER_KEY = 'visits';
  /* ═══════════════════════════════════════════════════════════════ */

  /* ---------------- helpers ---------------- */
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const rand = (a, b) => a + Math.random() * (b - a);
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const TAU = Math.PI * 2;

  const isTouch = matchMedia('(hover: none)').matches;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const small = () => innerWidth < 640;

  /* shared FX bus — background effects registered here so the
     goodies (and console commands) can trigger them */
  const FX = {};

  /* toast helper */
  function notify(msg) {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(notify._t);
    notify._t = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  /* storage that never throws (sandboxed iframes etc.) */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* fine */ } },
    sget(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    sset(k, v) { try { sessionStorage.setItem(k, v); } catch { /* fine */ } },
  };

  /* little ♡ that pop out of clicks (DOM-based) */
  function popHearts(x, y, n = 3) {
    for (let i = 0; i < n; i++) {
      const h = document.createElement('span');
      h.className = 'pat-heart';
      h.textContent = pick(['♡', '💗', '💕', '♥']);
      h.style.left = (x + rand(-14, 14)) + 'px';
      h.style.top = (y + rand(-10, 6)) + 'px';
      h.style.setProperty('--dx', rand(-30, 30) + 'px');
      h.style.fontSize = rand(0.9, 1.5) + 'rem';
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 1050);
    }
  }

  /* ══════════════════════════════════════════════════════════════
     1. CAT PAW CURSOR 🐾
     ══════════════════════════════════════════════════════════════ */
  function initCursor() {
    if (isTouch) return;
    const paw = $('.cursor-paw');
    if (!paw) return;

    let shown = false;
    let lastPrint = 0, printX = 0, printY = 0, side = 1;

    addEventListener('mousemove', (e) => {
      const mx = e.clientX, my = e.clientY;
      if (!shown) {
        document.body.classList.add('cursor-on');
        shown = true;
        printX = mx; printY = my;
      }
      paw.style.transform = `translate(${mx}px, ${my}px)`;

      /* leave little paw prints while "walking" */
      const now = performance.now();
      const dist = Math.hypot(mx - printX, my - printY);
      if (!reduceMotion && now - lastPrint > 130 && dist > 26) {
        lastPrint = now;
        const ang = Math.atan2(my - printY, mx - printX);
        side = -side;                                 // alternate left/right like real steps
        const ox = Math.cos(ang + Math.PI / 2) * 7 * side;
        const oy = Math.sin(ang + Math.PI / 2) * 7 * side;
        makePrint(mx + ox, my + oy, ang * 180 / Math.PI + 90);
        printX = mx; printY = my;
      }
    });

    function makePrint(x, y, rotDeg, stamp = false) {
      const p = document.createElement('span');
      p.className = 'paw-print' + (stamp ? ' stamp' : '');
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.setProperty('--rot', rotDeg.toFixed(0) + 'deg');
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1150);
    }

    /* a firm paw stamp on click */
    addEventListener('mousedown', (e) => {
      document.body.classList.add('cursor-down');
      if (!reduceMotion) makePrint(e.clientX, e.clientY, rand(-30, 30), true);
    });
    addEventListener('mouseup', () => document.body.classList.remove('cursor-down'));

    const HOVER = 'a, button, [data-hover]';
    addEventListener('mouseover', (e) => { if (e.target.closest(HOVER)) document.body.classList.add('cursor-hover'); });
    addEventListener('mouseout',  (e) => { if (e.target.closest(HOVER)) document.body.classList.remove('cursor-hover'); });
  }

  /* ══════════════════════════════════════════════════════════════
     2. BACKGROUND — sakura petals · hearts · sparkles · bokeh
     ══════════════════════════════════════════════════════════════ */
  function initBackground() {
    const cv = $('#bg-canvas');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let W = 0, H = 0;

    const PETAL_COLORS = ['#ffd1e6', '#ffb3d7', '#ff9ecd', '#ffc7de', '#ffdcec'];
    const HEART_COLORS = ['#ff8ac2', '#ff6fb5', '#ffa8d1', '#e0479a'];

    let petals = [], hearts = [], sparkles = [], bokeh = [];
    let burst = [];   // sakura-burst petals (physics)
    let storm = [];   // heart-storm hearts (rising)

    function makePetal(fromTop) {
      return {
        bx: rand(0, W),
        y: fromTop ? rand(-40, -10) : rand(0, H),
        s: rand(5.5, 11),
        rot: rand(0, TAU), vr: rand(-0.0016, 0.0016),
        vy: rand(0.018, 0.05),
        swayA: rand(18, 46), swayF: rand(0.0004, 0.0009), ph: rand(0, TAU),
        color: pick(PETAL_COLORS),
        alpha: rand(0.55, 0.95),
      };
    }

    function build() {
      const s = small();
      const petalN = reduceMotion ? 12 : (s ? 18 : 34);
      const heartN = reduceMotion ? 3 : (s ? 5 : 8);
      const sparkN = s ? 14 : 26;
      const bokehN = s ? 4 : 6;

      petals = [];
      for (let i = 0; i < petalN; i++) petals.push(makePetal(false));

      hearts = [];
      for (let i = 0; i < heartN; i++) {
        hearts.push({
          bx: rand(0, W), y: rand(0, H),
          s: rand(12, 24),
          vy: rand(0.008, 0.02),
          swayA: rand(12, 30), swayF: rand(0.0003, 0.0007), ph: rand(0, TAU),
          color: pick(HEART_COLORS),
          alpha: rand(0.10, 0.22),
        });
      }

      sparkles = [];
      for (let i = 0; i < sparkN; i++) {
        sparkles.push({
          x: rand(0, W), y: rand(0, H),
          s: rand(3, 7),
          tw: rand(0.6, 1.8), ph: rand(0, TAU),
          color: Math.random() < 0.6 ? '#ffffff' : '#ffd1e6',
        });
      }

      bokeh = [];
      for (let i = 0; i < bokehN; i++) {
        bokeh.push({
          fx: Math.random(), fy: Math.random(),
          r: rand(60, 150),
          spx: rand(0.00003, 0.00008), spy: rand(0.00003, 0.00008), ph: rand(0, TAU),
          hue: Math.random() < 0.5 ? 330 : 265,
          a: rand(0.06, 0.12),
        });
      }
    }

    function resize() {
      W = innerWidth; H = innerHeight;
      cv.width = W * DPR; cv.height = H * DPR;
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      build();
    }
    addEventListener('resize', resize);
    resize();

    /* ---- drawing helpers ---- */
    function drawPetal(x, y, s, rot, color, alpha) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(s * 0.85, -s * 0.15, 0, s);
      ctx.quadraticCurveTo(-s * 0.85, -s * 0.15, 0, -s);
      ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    function drawHeart(x, y, s, color, alpha, rot = 0) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, 0.45 * s);
      ctx.bezierCurveTo(-0.7 * s, 0.05 * s, -0.5 * s, -0.55 * s, 0, -0.2 * s);
      ctx.bezierCurveTo(0.5 * s, -0.55 * s, 0.7 * s, 0.05 * s, 0, 0.45 * s);
      ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    function drawSparkle(x, y, s, color, alpha) {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(s * 0.14, -s * 0.14, s, 0);
      ctx.quadraticCurveTo(s * 0.14, s * 0.14, 0, s);
      ctx.quadraticCurveTo(-s * 0.14, s * 0.14, -s, 0);
      ctx.quadraticCurveTo(-s * 0.14, -s * 0.14, 0, -s);
      ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    /* ---- public FX ---- */
    FX.sakuraBurst = (x, y, n = 26) => {
      for (let i = 0; i < n; i++) {
        const a = rand(0, TAU), sp = rand(0.05, 0.32);
        burst.push({
          x, y,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.06,
          s: rand(4.5, 9),
          rot: rand(0, TAU), vr: rand(-0.006, 0.006),
          color: pick(PETAL_COLORS),
          life: 0, max: rand(1300, 2200),
        });
      }
    };

    FX.heartStorm = (n = 40) => {
      for (let i = 0; i < n; i++) {
        storm.push({
          x: rand(0, W), y: H + rand(10, 120),
          s: rand(9, 22),
          vy: -rand(0.07, 0.17),
          swayA: rand(10, 34), swayF: rand(0.001, 0.003), ph: rand(0, TAU),
          color: pick(HEART_COLORS),
          life: 0, max: rand(2400, 4200),
        });
      }
    };

    let last = 0;
    function frame(t) {
      const dt = clamp(t - last, 0, 50); last = t;
      ctx.clearRect(0, 0, W, H);

      /* bokeh (soft dreamy circles) */
      for (const b of bokeh) {
        const X = b.fx * W + Math.sin(t * b.spx + b.ph) * 60;
        const Y = b.fy * H + Math.cos(t * b.spy + b.ph) * 46;
        const g = ctx.createRadialGradient(X, Y, 0, X, Y, b.r);
        g.addColorStop(0, `hsla(${b.hue}, 90%, 82%, ${b.a})`);
        g.addColorStop(1, 'hsla(0, 0%, 100%, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(X - b.r, Y - b.r, b.r * 2, b.r * 2);
      }

      /* ambient floating hearts (rise slowly) */
      for (const h of hearts) {
        h.y -= h.vy * dt;
        if (h.y < -40) { h.y = H + 40; h.bx = rand(0, W); }
        const x = h.bx + Math.sin(t * h.swayF + h.ph) * h.swayA;
        drawHeart(x, h.y, h.s, h.color, h.alpha);
      }

      /* falling sakura petals */
      for (const p of petals) {
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        if (p.y > H + 30) { Object.assign(p, makePetal(true)); }
        const x = p.bx + Math.sin(t * p.swayF + p.ph) * p.swayA;
        drawPetal(x, p.y, p.s, p.rot, p.color, p.alpha);
      }

      /* twinkling sparkles */
      for (const s of sparkles) {
        const a = 0.25 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.001 * s.tw + s.ph));
        drawSparkle(s.x, s.y, s.s, s.color, a);
      }

      /* sakura bursts (double-click) */
      for (let i = burst.length - 1; i >= 0; i--) {
        const p = burst[i];
        p.life += dt;
        if (p.life >= p.max) { burst.splice(i, 1); continue; }
        p.vy += 0.00012 * dt;            // gentle gravity
        p.vx *= 0.999;
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.rot += p.vr * dt;
        const alpha = 1 - p.life / p.max;
        drawPetal(p.x, p.y, p.s, p.rot, p.color, alpha);
      }

      /* heart storms (N key / boop button) */
      for (let i = storm.length - 1; i >= 0; i--) {
        const h = storm[i];
        h.life += dt;
        if (h.life >= h.max || h.y < -60) { storm.splice(i, 1); continue; }
        h.y += h.vy * dt;
        const x = h.x + Math.sin(t * h.swayF + h.ph) * h.swayA;
        const alpha = clamp(1 - h.life / h.max, 0, 1) * 0.85;
        drawHeart(x, h.y, h.s, h.color, alpha, Math.sin(t * 0.002 + h.ph) * 0.25);
      }

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ══════════════════════════════════════════════════════════════
     3. HEADPATS ♡ — click the character, the counter remembers
     ══════════════════════════════════════════════════════════════ */
  function initWaifu() {
    const card = $('#waifu');
    const patsEl = $('#pats');
    if (!card || !patsEl) return;

    let pats = parseInt(store.get('seqyra_headpats') || '0', 10) || 0;
    patsEl.textContent = pats.toLocaleString('en-US');

    card.addEventListener('pointermove', (e) => {
      if (matchMedia('(pointer: coarse)').matches) return;
      const r = card.getBoundingClientRect();
      const ry = ((e.clientX - r.left) / r.width - .5) * 9;
      const rx = (.5 - (e.clientY - r.top) / r.height) * 7;
      card.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });

    const MILESTONES = {
      1:   'first headpat — she noticed you ♡',
      10:  '10 headpats — blushing intensifies',
      25:  '25 headpats — you two are besties now',
      50:  '50 headpats — certified headpat expert',
      100: '100 headpats — soulmates, fr fr 💗',
    };

    function pat(x, y) {
      pats++;
      store.set('seqyra_headpats', String(pats));
      patsEl.textContent = pats.toLocaleString('en-US');
      card.classList.remove('patted');
      void card.offsetWidth;               // restart the squish animation
      card.classList.add('patted');
      popHearts(x, y, 3);
      if (MILESTONES[pats]) notify(MILESTONES[pats]);
    }

    card.addEventListener('click', (e) => {
      const r = card.getBoundingClientRect();
      const x = e.clientX || (r.left + r.width / 2);
      const y = e.clientY || (r.top + r.height / 3);
      pat(x, y);
    });

    /* exposed for the console command */
    FX.headpat = (n = 1) => {
      const r = card.getBoundingClientRect();
      for (let i = 0; i < Math.min(n, 50); i++) {
        setTimeout(() => pat(rand(r.left + 30, r.right - 30), rand(r.top + 30, r.top + r.height / 2)), i * 90);
      }
    };
  }

  /* ══════════════════════════════════════════════════════════════
     4. VISITOR COUNTER — works on GitHub Pages, no backend ♡
     ──────────────────────────────────────────────────────────────
     How it works: on your first pageview this session, we call
       https://abacus.jasoncameron.dev/hit/{namespace}/{key}
     which adds +1 and returns the total. On repeat views in the
     same session we only READ the value (no double counting).
     The API is free and CORS-friendly — perfect for static sites.
     ══════════════════════════════════════════════════════════════ */
  function initVisitors() {
    const el = $('#visit-count');
    if (!el) return;
    const counted = store.sget('seqyra_counted') === '1';
    const mode = counted ? 'get' : 'hit';
    fetch(`https://abacus.jasoncameron.dev/${mode}/${encodeURIComponent(COUNTER_NAMESPACE)}/${encodeURIComponent(COUNTER_KEY)}`)
      .then(r => {
        if (!r.ok) throw new Error('counter unavailable');
        return r.json();
      })
      .then(d => {
        if (typeof d.value === 'number') {
          el.textContent = d.value.toLocaleString('en-US');
          if (!counted) store.sset('seqyra_counted', '1');
        } else {
          el.textContent = '♡';
        }
      })
      .catch(() => { el.textContent = '♡'; });   // offline / blocked → stay cute
  }

  /* ══════════════════════════════════════════════════════════════
     5. KAWAII BGM ♪ — a tiny music-box melody, always on
     ──────────────────────────────────────────────────────────────
     A gentle 8-bar loop in C major (~96 BPM): music-box melody,
     soft triangle pads, a warm little bass and a whisper of hats,
     all through a dreamy echo.

     It plays AUTOMATICALLY — browsers block sound until the first
     user interaction, so the melody starts on the visitor's very
     first click / tap / keypress (that's the closest to "always on"
     the web allows). Secret console mute: seqyra.bgm()

     Prefer your own track? Un-comment the <audio id="custom-music">
     tag at the bottom of index.html — your file will auto-play
     instead of the synth.
     ══════════════════════════════════════════════════════════════ */
  function initMusic() {
    const customEl = $('#custom-music');   // exists only if the user un-commented it

    let actx = null, master = null, delayBus = null, noiseBuf = null;
    let playing = false, timer = null;
    let nextTime = 0, step = 0;

    const BPM = 96;
    const EIGHTH = 60 / BPM / 2;           // one 8th note, in seconds
    const LOOP_STEPS = 64;                 // 8 bars × 8 eighths

    /* note frequencies */
    const N = {
      F2: 87.31, G2: 98.00, A2: 110.00, C3: 130.81,
      F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00,
      C5: 523.25, D5: 587.33, E5: 659.26, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
      C6: 1046.50, D6: 1174.66, E6: 1318.51,
    };

    /* the melody — [step, note, length in eighths]; loops every 8 bars */
    const MELODY = [
      /* bar 1 · C  */ [0, 'C6', 1], [1, 'B5', 1], [2, 'G5', 2], [4, 'E5', 2], [6, 'G5', 2],
      /* bar 2 · G  */ [8, 'D6', 1], [9, 'B5', 1], [10, 'G5', 2], [12, 'D5', 2], [14, 'G5', 2],
      /* bar 3 · Am */ [16, 'A5', 1], [17, 'B5', 1], [18, 'C6', 2], [20, 'E6', 2], [22, 'C6', 2],
      /* bar 4 · F  */ [24, 'F5', 1], [25, 'G5', 1], [26, 'A5', 2], [28, 'C6', 4],
      /* bar 5 · C  */ [32, 'E6', 1], [33, 'D6', 1], [34, 'C6', 2], [36, 'G5', 2], [38, 'E5', 2],
      /* bar 6 · G  */ [40, 'D6', 2], [42, 'B5', 2], [44, 'G5', 2], [46, 'A5', 1], [47, 'B5', 1],
      /* bar 7 · F  */ [48, 'A5', 1], [49, 'G5', 1], [50, 'F5', 2], [52, 'A5', 2], [54, 'C6', 2],
      /* bar 8 · C  */ [56, 'E6', 2], [58, 'D6', 1], [59, 'B5', 1], [60, 'C6', 4],
    ];
    const MELODY_MAP = {};
    MELODY.forEach(([s, note, len]) => { MELODY_MAP[s] = [note, len]; });

    /* per-bar harmony: [bass root, pad chord] (I–V–vi–IV, then I–V–IV–I) */
    const CHORDS = [
      ['C3', ['C4', 'E4', 'G4']],
      ['G2', ['G3', 'B3', 'D4']],
      ['A2', ['A3', 'C4', 'E4']],
      ['F2', ['F3', 'A3', 'C4']],
      ['C3', ['C4', 'E4', 'G4']],
      ['G2', ['G3', 'B3', 'D4']],
      ['F2', ['F3', 'A3', 'C4']],
      ['C3', ['C4', 'E4', 'G4']],
    ];

    function buildSynth() {
      const AC = window.AudioContext || window.webkitAudioContext;
      actx = new AC();
      master = actx.createGain();
      master.gain.value = 0;
      master.connect(actx.destination);

      /* dreamy echo bus */
      delayBus = actx.createDelay(1);
      delayBus.delayTime.value = EIGHTH * 2;          // dotted-feel echo
      const fb = actx.createGain(); fb.gain.value = 0.28;
      const damp = actx.createBiquadFilter();
      damp.type = 'lowpass'; damp.frequency.value = 2400;
      delayBus.connect(damp).connect(fb).connect(delayBus);
      const wet = actx.createGain(); wet.gain.value = 0.4;
      delayBus.connect(wet).connect(master);

      /* soft noise buffer for the hats */
      noiseBuf = actx.createBuffer(1, actx.sampleRate * 0.1, actx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }

    /* --- voices --- */
    function musicBox(f, t, dur) {
      const g = actx.createGain();
      const peak = 0.15 + Math.random() * 0.04;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(dur * 1.6, 0.55));
      const o1 = actx.createOscillator();
      o1.type = 'sine'; o1.frequency.value = f;
      const o2 = actx.createOscillator();                 // bell partial
      o2.type = 'sine'; o2.frequency.value = f * 4;
      const g2 = actx.createGain(); g2.gain.value = 0.12;
      o1.connect(g);
      o2.connect(g2).connect(g);
      g.connect(master);
      const send = actx.createGain(); send.gain.value = 0.35;
      g.connect(send).connect(delayBus);
      o1.start(t); o2.start(t);
      o1.stop(t + 2.2); o2.stop(t + 2.2);
    }

    function bassNote(f, t, dur, soft = false) {
      const o = actx.createOscillator();
      o.type = 'triangle'; o.frequency.value = f;
      const g = actx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(soft ? 0.05 : 0.1, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      const lp = actx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 520;
      o.connect(g).connect(lp).connect(master);
      o.start(t); o.stop(t + dur + 0.1);
    }

    function padNote(f, t, dur) {
      const o = actx.createOscillator();
      o.type = 'triangle'; o.frequency.value = f;
      const g = actx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.032, t + dur * 0.35);
      g.gain.linearRampToValueAtTime(0.0001, t + dur * 1.05);
      const lp = actx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 950;
      o.connect(g).connect(lp).connect(master);
      o.start(t); o.stop(t + dur * 1.1 + 0.1);
    }

    function hat(t) {
      const src = actx.createBufferSource();
      src.buffer = noiseBuf;
      const g = actx.createGain();
      g.gain.setValueAtTime(0.014, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
      const hp = actx.createBiquadFilter();
      hp.type = 'highpass'; hp.frequency.value = 6500;
      src.connect(hp).connect(g).connect(master);
      src.start(t); src.stop(t + 0.06);
    }

    /* --- lookahead scheduler --- */
    function scheduleStep(s, t) {
      const bar = (s / 8) | 0;
      const inBar = s % 8;
      const m = MELODY_MAP[s];
      if (m) musicBox(N[m[0]], t, m[1] * EIGHTH);
      if (inBar === 0) {
        bassNote(N[CHORDS[bar][0]], t, EIGHTH * 4);
        CHORDS[bar][1].forEach(n => padNote(N[n], t, EIGHTH * 8));
      }
      if (inBar === 4) bassNote(N[CHORDS[bar][0]] * 2, t, EIGHTH * 2, true);
      if (inBar % 2 === 1) hat(t);
    }

    function tick() {
      if (!playing) return;
      while (nextTime < actx.currentTime + 0.35) {
        scheduleStep(step % LOOP_STEPS, nextTime);
        step++;
        nextTime += EIGHTH;
      }
      timer = setTimeout(tick, 90);
    }

    /* --- always-on autoplay --- */
    let muted = false;

    function startSynth() {
      if (playing) return;
      if (!actx) buildSynth();
      Promise.resolve(actx.resume()).then(() => {
        if (playing || actx.state !== 'running') return;
        playing = true;
        const now = actx.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setTargetAtTime(muted ? 0 : 0.9, now, 0.5);
        step = 0;
        nextTime = now + 0.1;
        tick();
      }).catch(() => { /* blocked — the next gesture will retry */ });
    }

    function tryStart() {
      if (playing) return;
      if (customEl) {
        customEl.volume = 0.5;
        const pr = customEl.play();
        if (pr && pr.then) pr.then(() => { playing = true; }).catch(() => {});
        return;
      }
      startSynth();
    }

    /* attempt right away (some browsers allow it) — otherwise the
       very first click / tap / keypress starts the melody */
    tryStart();
    ['pointerdown', 'keydown', 'touchstart'].forEach(ev =>
      addEventListener(ev, tryStart, { capture: true, passive: true })
    );

    /* secret mute/unmute for the console: seqyra.bgm() */
    FX.bgmToggle = () => {
      if (customEl) {
        if (customEl.paused) customEl.play(); else customEl.pause();
        return;
      }
      if (!playing) { tryStart(); return; }
      muted = !muted;
      const now = actx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setTargetAtTime(muted ? 0 : 0.9, now, 0.3);
    };

    /* tiny "pling" for the petal game (reuses the music-box voice) */
    FX.pling = (f = 1046.5) => {
      if (actx && actx.state === 'running' && !muted) {
        musicBox(f, actx.currentTime + 0.01, 0.22);
      }
    };
  }

  /* ══════════════════════════════════════════════════════════════
     5½. PETAL MINI-GAME 🌸 — catch the falling petals!
     ──────────────────────────────────────────────────────────────
     30 seconds. Catch petals with your paw (hover or tap them).
     Golden petals are worth 3 points. Best score is saved in your
     browser. Start: the "petal game 🌸" button in the hero,
     Escape or ✕ to quit. Console cheat: seqyra.game()
     ══════════════════════════════════════════════════════════════ */
  function initPetalGame() {
    const btn = $('#petal-game-btn');
    const cv = $('#game-canvas');
    const hud = $('#game-hud');
    if (!btn || !cv || !hud) return;
    const ctx = cv.getContext('2d');
    const scoreEl = $('#game-score');
    const timeEl = $('#game-time');
    const bestEl = $('#game-best');
    const quitBtn = $('#game-quit');

    const GAME_MS = 30000;
    const COLORS = ['#ffd1e6', '#ffb3d7', '#ff9ecd', '#ffc7de'];
    const NOTES = [1046.5, 1174.66, 1318.51, 1568.0, 1760.0];

    let active = false, score = 0, endAt = 0, spawnIn = 0, raf = 0, lastT = 0;
    let petals = [], rings = [];
    let px = -999, py = -999;
    let best = parseInt(store.get('seqyra_petal_best') || '0', 10) || 0;

    function resize() {
      cv.width = innerWidth * DPR;
      cv.height = innerHeight * DPR;
      cv.style.width = innerWidth + 'px';
      cv.style.height = innerHeight + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    addEventListener('resize', () => { if (active) resize(); });

    function drawGamePetal(x, y, s, rot, color, alpha) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(s * 0.85, -s * 0.15, 0, s);
      ctx.quadraticCurveTo(-s * 0.85, -s * 0.15, 0, -s);
      ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    function start() {
      if (active) return;
      active = true;
      score = 0;
      petals = []; rings = [];
      endAt = performance.now() + GAME_MS;
      spawnIn = 0;
      lastT = performance.now();
      px = py = -999;
      resize();
      cv.classList.add('on');
      hud.classList.add('on');
      hud.setAttribute('aria-hidden', 'false');
      scoreEl.textContent = '🌸 0';
      timeEl.textContent = '⏱ 30s';
      bestEl.textContent = 'best: ' + best;
      notify('catch the petals with your paw! gold = ×3 🐾');
      raf = requestAnimationFrame(loop);
    }

    function end(early) {
      if (!active) return;
      active = false;
      cancelAnimationFrame(raf);
      cv.classList.remove('on');
      hud.classList.remove('on');
      hud.setAttribute('aria-hidden', 'true');
      if (early) { notify('fleeing the petals?? okay ♡'); return; }
      if (score > best) {
        best = score;
        store.set('seqyra_petal_best', String(best));
        bestEl.textContent = 'best: ' + best;
        notify(`NEW RECORD: ${score} petals!! ✧♡`);
        if (FX.heartStorm) FX.heartStorm(30);
      } else {
        notify(`you caught ${score} petals ♡ (best: ${best})`);
      }
    }

    function tryCatch(x, y, radius) {
      let caughtAny = false;
      for (const p of petals) {
        if (p.caught) continue;
        if (Math.hypot(p.x - x, p.y - y) < p.s + radius) {
          p.caught = true;
          caughtAny = true;
          score += p.gold ? 3 : 1;
          rings.push({ x: p.x, y: p.y, life: 0, max: 420, gold: p.gold });
          popHearts(p.x, p.y, p.gold ? 3 : 1);
          if (FX.pling) {
            FX.pling(pick(NOTES));
            if (p.gold) {
              setTimeout(() => FX.pling && FX.pling(1318.51), 90);
              setTimeout(() => FX.pling && FX.pling(1568.0), 180);
            }
          }
        }
      }
      if (caughtAny) {
        petals = petals.filter(p => !p.caught);
        scoreEl.textContent = '🌸 ' + score;
      }
    }

    cv.addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; });
    cv.addEventListener('pointerdown', (e) => {
      px = e.clientX; py = e.clientY;
      tryCatch(px, py, 28);
    });

    function loop(t) {
      if (!active) return;
      const dt = clamp(t - lastT, 0, 50); lastT = t;
      const left = endAt - t;
      if (left <= 0) { end(false); return; }
      timeEl.textContent = '⏱ ' + Math.ceil(left / 1000) + 's';

      /* spawn petals — a little faster as time runs out */
      spawnIn -= dt;
      if (spawnIn <= 0) {
        const progress = 1 - left / GAME_MS;
        spawnIn = rand(340, 600) * (1 - progress * 0.35);
        const bx = rand(24, innerWidth - 24);
        petals.push({
          bx, x: bx, y: -26,
          vy: rand(0.1, 0.18) * (1 + progress * 0.45),
          s: rand(10, 15),
          rot: rand(0, TAU), vr: rand(-0.004, 0.004),
          swayA: rand(14, 40), swayF: rand(0.0012, 0.0026), ph: rand(0, TAU),
          color: pick(COLORS),
          gold: Math.random() < 0.12,
          caught: false,
        });
      }

      ctx.clearRect(0, 0, innerWidth, innerHeight);

      /* soft focus veil over the page */
      ctx.fillStyle = 'rgba(255, 240, 247, 0.4)';
      ctx.fillRect(0, 0, innerWidth, innerHeight);

      /* catching by hovering the paw */
      tryCatch(px, py, 22);

      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        p.x = p.bx + Math.sin(t * p.swayF + p.ph) * p.swayA;
        if (p.y > innerHeight + 30) { petals.splice(i, 1); continue; }
        if (p.gold) {
          ctx.save();
          ctx.shadowColor = '#ffcf5e';
          ctx.shadowBlur = 18;
          drawGamePetal(p.x, p.y, p.s * 1.18, p.rot, '#ffd166', 1);
          ctx.restore();
        } else {
          drawGamePetal(p.x, p.y, p.s, p.rot, p.color, 0.95);
        }
      }

      /* catch rings */
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.life += dt;
        const k = r.life / r.max;
        if (k >= 1) { rings.splice(i, 1); continue; }
        ctx.globalAlpha = 1 - k;
        ctx.strokeStyle = r.gold ? '#ffb347' : '#ff6fb5';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 8 + k * 34, 0, TAU);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(loop);
    }

    btn.addEventListener('click', start);
    quitBtn.addEventListener('click', () => end(true));
    addEventListener('keydown', (e) => { if (e.code === 'Escape' && active) end(true); });

    /* exposed for the console command */
    FX.startGame = start;
  }

  /* ══════════════════════════════════════════════════════════════
     6. UI SUGAR
     ══════════════════════════════════════════════════════════════ */
  function initTyping() {
    const el = $('#typed');
    if (!el) return;
    const PHRASES = [
      'certified pink enjoyer ♡',
      'headpat the pink one — the counter remembers~',
      'double-click anywhere: sakura burst 🌸',
      'bored? try the petal game 🌸',
      'press N for a heart storm, nya~',
      'the tiny melody? handmade, in code ♪',
      'the cat in the corner? very pettable.',
      'do NOT boop the pink button. (boop it)',
    ];
    let pi = 0, ci = 0, deleting = false;
    (function step() {
      const s = PHRASES[pi];
      ci += deleting ? -1 : 1;
      el.textContent = s.slice(0, ci);
      let d = deleting ? 26 : 52 + Math.random() * 40;
      if (!deleting && ci === s.length) { d = 2500; deleting = true; }
      else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % PHRASES.length; d = 450; }
      setTimeout(step, d);
    })();
  }

  function initReveal() {
    $$('.stagger').forEach(group => {
      [...group.children].forEach((c, i) => { c.style.transitionDelay = (i * 90) + 'ms'; });
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    $$('.reveal').forEach(el => io.observe(el));
  }

  function initNav() {
    const nav = $('#nav');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('scrolled', scrollY > 40);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* toast for links that are still placeholders */
  function initPlaceholderLinks() {
    $$('.needs-link').forEach(a => {
      a.addEventListener('click', (e) => {
        if (a.getAttribute('href') === '#') {
          e.preventDefault();
          notify('⋆ TODO: paste your real link in index.html, nya~ ⋆');
        }
      });
    });
  }

  /* ══════════════════════════════════════════════════════════════
     7. GOODIES — bursts, boops, neko, clock, console
     ══════════════════════════════════════════════════════════════ */
  function initGoodies() {

    /* --- double-click anywhere → sakura burst --- */
    addEventListener('dblclick', (e) => {
      if (e.target.closest('a, button')) return;
      if (FX.sakuraBurst) FX.sakuraBurst(e.clientX, e.clientY);
    });

    /* --- N key → heart storm, nya~ --- */
    addEventListener('keydown', (e) => {
      if (e.code === 'KeyN' && !e.metaKey && !e.ctrlKey && !e.altKey && !e.repeat) {
        if (FX.heartStorm) FX.heartStorm(40);
        notify('nya nya nya~ 🐾');
      }
    });

    /* --- the button you were told not to boop --- */
    const btn = $('#do-not-boop');
    if (btn) {
      const LABELS = ['DO NOT BOOP 🎀', 'I SAID NO BOOP', 'STOP BOOPING ME >:3', 'fine… boop me all you want ♡'];
      const MSGS = [
        'you booped it. of course you booped it. 🎀',
        'the pink grows stronger…',
        'unlimited boop works?!',
        'okay that actually felt kind of nice ♡',
      ];
      let boops = 0;
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        btn.disabled = true;
        notify(MSGS[Math.min(boops, MSGS.length - 1)]);
        boops++;
        btn.textContent = LABELS[Math.min(boops, LABELS.length - 1)];
        document.body.classList.add('shake');
        if (FX.heartStorm) FX.heartStorm(70);
        if (FX.sakuraBurst) FX.sakuraBurst(innerWidth / 2, innerHeight / 2, 34);
        setTimeout(() => document.body.classList.remove('shake'), 800);
        setTimeout(() => { btn.disabled = false; }, 2400);
      });
    }

    /* --- the very pettable corner neko (now with nap mode 💤) --- */
    const neko = $('#neko');
    if (neko) {
      const NYA = ['nya~', 'mrrp?', '*purrs in pink*', 'feed me pixels', '✧ nya!', '*happy cat noises*'];
      const IDLE_MS = 45000;                 // fall asleep after 45s of nothing
      let sleeping = false, lastWake = 0, idleTimer = null;

      function fallAsleep() {
        sleeping = true;
        neko.classList.add('sleeping');
      }
      function wakeUp() {
        if (!sleeping) return false;
        sleeping = false;
        lastWake = performance.now();
        neko.classList.remove('sleeping');
        return true;
      }
      function resetIdle() {
        if (wakeUp()) notify('*yawns* …nya? you came back ♡');
        clearTimeout(idleTimer);
        idleTimer = setTimeout(fallAsleep, IDLE_MS);
      }
      ['pointermove', 'pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(ev =>
        addEventListener(ev, resetIdle, { passive: true })
      );
      idleTimer = setTimeout(fallAsleep, IDLE_MS);

      neko.addEventListener('click', () => {
        const r = neko.getBoundingClientRect();
        popHearts(r.left + r.width / 2, r.top + 8, 3);
        /* grumpy if you JUST woke it up */
        notify(performance.now() - lastWake < 1500 ? 'i was napping, you know >:c' : pick(NYA));
        neko.classList.remove('bounce');
        void neko.offsetWidth;
        neko.classList.add('bounce');
      });
    }

    /* --- mission clock in the footer --- */
    const clockEl = $('#mission-clock');
    if (clockEl) {
      const t0 = Date.now();
      const pad = (n) => String(n).padStart(2, '0');
      setInterval(() => {
        let s = ((Date.now() - t0) / 1000) | 0;
        const h = (s / 3600) | 0; s -= h * 3600;
        const m = (s / 60) | 0; s -= m * 60;
        clockEl.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
      }, 1000);
    }

    /* --- footer year --- */
    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();

    /* --- console easter eggs --- */
    console.log(
      '%c seqyra %c you found the console, nya~ 🐾 ',
      'background:#ff6fb5;color:#fff;font-weight:bold;padding:4px 10px;border-radius:8px 0 0 8px;',
      'background:#fff0f6;color:#e0479a;font-weight:bold;padding:4px 10px;border-radius:0 8px 8px 0;'
    );
    console.log(
      '%ctry these:\n  seqyra.nya()\n  seqyra.sakura()\n  seqyra.hearts(60)\n  seqyra.headpat(10)\n  seqyra.bgm()\n  seqyra.game()',
      'color:#b088a4;font-family:monospace;'
    );
    window.seqyra = {
      nya() { if (FX.heartStorm) FX.heartStorm(30); return 'nya~ 🐾'; },
      sakura() {
        if (FX.sakuraBurst) FX.sakuraBurst(rand(innerWidth * 0.2, innerWidth * 0.8), rand(innerHeight * 0.2, innerHeight * 0.6), 30);
        return '🌸🌸🌸';
      },
      hearts(n = 40) { if (FX.heartStorm) FX.heartStorm(n); return '💗'.repeat(Math.min(5, Math.ceil(n / 20))); },
      headpat(n = 1) { if (FX.headpat) FX.headpat(n); return 'so soft ♡'; },
      bgm() { if (FX.bgmToggle) FX.bgmToggle(); return '♪ ~'; },
      game() { if (FX.startGame) FX.startGame(); return '🌸 catch!'; },
    };
  }

  /* ---------------- boot ---------------- */
  initCursor();
  initBackground();
  initWaifu();
  initVisitors();
  initMusic();
  initPetalGame();
  initTyping();
  initReveal();
  initNav();
  initPlaceholderLinks();
  initGoodies();
})();
