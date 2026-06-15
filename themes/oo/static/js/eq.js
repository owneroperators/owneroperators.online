/* ── Web Audio EQ + visualizer ──────────────────────────────────────────
   OWNER/OPERATORS custom addition — NOT part of the upstream web-mp3 lib.
   web-mp3.js imports setupEQ() and calls it once per mounted player; when
   syncing the player from its source repo, this file is the only thing to
   keep, plus the one import line in web-mp3.js.

   Taps the #player <audio> through a 3-band BiquadFilter chain into an
   AnalyserNode, then to the speakers:

     source → bass(lowshelf) → mid(peaking) → high(highshelf) → analyser → out

   The analyser drives the bouncing spectrum bars; the sliders drive the
   filter gains (actual tone control). UI is injected into #player-container
   so every page that mounts the player gets it automatically.

   Two hazards this code is built around:
   1. Routing an element through a MediaElementSource REPLACES its normal
      output — the graph must terminate at ctx.destination or it's silent.
   2. AudioContext is gated behind a user gesture. We build the graph on the
      first real click/keypress (resume guaranteed) rather than on autoplay,
      so we never strand a playing track in a suspended context. */
function setupEQ(audioEl) {
  const container =
    audioEl.closest("#player-container") || audioEl.parentElement;
  if (!container || container.dataset.eq) return; // once per container
  container.dataset.eq = "1";

  const bands = [
    { key: "bass", label: "BASS", type: "lowshelf", freq: 120 },
    { key: "mid", label: "MID", type: "peaking", freq: 1000, q: 1 },
    { key: "high", label: "HIGH", type: "highshelf", freq: 6000 },
  ];

  // --- UI: visualizer canvas + one slider per band ----------------------
  const viz = document.createElement("canvas");
  viz.className = "eq-viz";
  viz.setAttribute("aria-hidden", "true");

  const controls = document.createElement("div");
  controls.className = "eq-controls";
  const sliders = {};
  bands.forEach((b) => {
    const row = document.createElement("label");
    row.className = "eq-band";
    const name = document.createElement("span");
    name.className = "eq-label";
    name.textContent = b.label;
    const input = document.createElement("input");
    Object.assign(input, {
      type: "range",
      min: "-12",
      max: "12",
      step: "1",
      value: "0",
      className: "eq-slider",
    });
    input.setAttribute("aria-label", `${b.label} gain, decibels`);
    const val = document.createElement("span");
    val.className = "eq-val";
    val.textContent = "0dB";
    row.append(name, input, val);
    controls.appendChild(row);
    sliders[b.key] = { input, val };
  });
  audioEl.after(viz, controls);

  // --- audio graph (built lazily on first user gesture) -----------------
  let ctx, analyser, freq, filters;
  function buildGraph() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return; // no Web Audio → sliders/viz stay inert, audio still plays
    // Pin the context to the file's rate (44.1k). With a default (often 48k)
    // context, routing a 44.1k <audio> through createMediaElementSource can play
    // ~8.8% fast/sharp; the browser resamples 44.1→hardware at output instead.
    ctx = new AC({ sampleRate: 44100 });
    const src = ctx.createMediaElementSource(audioEl);
    filters = bands.map((b) => {
      const f = ctx.createBiquadFilter();
      f.type = b.type;
      f.frequency.value = b.freq;
      if (b.q != null) f.Q.value = b.q;
      f.gain.value = parseFloat(sliders[b.key].input.value);
      return f;
    });
    analyser = ctx.createAnalyser();
    analyser.fftSize = 64; // 32 bins → chunky bars
    analyser.smoothingTimeConstant = 0.9; // calmer motion, won't fight the bg video
    freq = new Uint8Array(analyser.frequencyBinCount);
    const chain = [src, ...filters, analyser];
    for (let i = 0; i < chain.length - 1; i++) chain[i].connect(chain[i + 1]);
    analyser.connect(ctx.destination); // <-- terminate at speakers
    bands.forEach((b, i) => {
      const { input, val } = sliders[b.key];
      input.addEventListener("input", () => {
        const g = parseFloat(input.value);
        filters[i].gain.value = g;
        val.textContent = (g > 0 ? "+" : "") + g + "dB";
      });
    });
  }
  function ensureGraph() {
    buildGraph();
    if (ctx && ctx.state === "suspended") ctx.resume();
  }
  // first gesture anywhere builds + resumes; later plays just nudge resume
  window.addEventListener("pointerdown", ensureGraph, { once: true });
  window.addEventListener("keydown", ensureGraph, { once: true });
  audioEl.addEventListener("play", () => {
    if (ctx && ctx.state === "suspended") ctx.resume();
  });

  // --- visualizer render loop -------------------------------------------
  const cctx = viz.getContext("2d");
  let w = 0,
    h = 0;
  function size() {
    const dpr = window.devicePixelRatio || 1;
    w = viz.clientWidth || container.clientWidth || 280;
    h = 40;
    viz.width = Math.round(w * dpr);
    viz.height = Math.round(h * dpr);
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();
  window.addEventListener("resize", size);
  // soft (not invisible) bars: visible against the bg video but not shouting
  const barColor =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--fg-dim")
      .trim() || "#c8c6c0";
  let t = 0;
  function draw() {
    requestAnimationFrame(draw);
    t += 1;
    if (!w) size(); // layout may not have settled on first frame
    cctx.clearRect(0, 0, w, h);
    const live = analyser && !audioEl.paused;
    if (live) analyser.getByteFrequencyData(freq);
    const n = freq ? freq.length : 24;
    const gap = 2;
    const bw = (w - gap * (n - 1)) / n;
    cctx.fillStyle = barColor;
    for (let i = 0; i < n; i++) {
      // playing → real spectrum; idle → a gentle low wave so it reads as alive
      const v = live ? freq[i] / 255 : 0.14 + 0.09 * Math.sin(t * 0.05 + i * 0.5);
      const bh = Math.max(2, v * h);
      cctx.globalAlpha = 0.28 + v * 0.5; // visible floor, tops ~0.78 — soft, not stark
      cctx.fillRect(i * (bw + gap), h - bh, bw, bh);
    }
    cctx.globalAlpha = 1;
  }
  draw();
}

export { setupEQ };
