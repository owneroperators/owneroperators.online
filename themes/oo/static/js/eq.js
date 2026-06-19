/* ── Web Audio spectrum visualizer ──────────────────────────────────────
   OWNER/OPERATORS custom addition — NOT part of the upstream web-mp3 lib.
   web-mp3.js imports setupEQ() and calls it once per mounted player; when
   syncing the player from its source repo, this file is the only thing to
   keep, plus the one import line in web-mp3.js.

   Taps the #player <audio> through an AnalyserNode to the speakers:

     source → analyser → out

   The analyser drives the bouncing spectrum bars. UI (the canvas) is
   injected into #player-container so every page that mounts the player
   gets it automatically. (The 3-band EQ sliders were removed — viz only.)

   Three hazards this code is built around:
   1. Routing an element through a MediaElementSource REPLACES its normal
      output — the graph must terminate at ctx.destination or it's silent.
   2. AudioContext is gated behind a user gesture: it starts suspended and
      must be resume()'d from a real gesture or it stays silent.
   3. The graph is built EAGERLY here (not on first gesture). The element is
      wired into the context from the start so playback never gets hot-swapped
      into createMediaElementSource mid-track — that swap could jump the pitch.
      The context just sits suspended until the first play/gesture resumes it. */
function setupEQ(audioEl) {
  const container =
    audioEl.closest("#player-container") || audioEl.parentElement;
  if (!container || container.dataset.eq) return; // once per container
  container.dataset.eq = "1";

  // --- UI: visualizer canvas --------------------------------------------
  const viz = document.createElement("canvas");
  viz.className = "eq-viz";
  viz.setAttribute("aria-hidden", "true");
  audioEl.after(viz);

  // --- audio graph (built eagerly, starts suspended) --------------------
  let ctx, analyser, freq;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (AC) {
    // Pin the context to the file's rate (44.1k). With a default (often 48k)
    // context, routing a 44.1k <audio> through createMediaElementSource can play
    // ~8.8% fast/sharp; the browser resamples 44.1→hardware at output instead.
    ctx = new AC({ sampleRate: 44100 });
    const src = ctx.createMediaElementSource(audioEl);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 64; // 32 bins → chunky bars
    analyser.smoothingTimeConstant = 0.9; // calmer motion, won't fight the bg video
    freq = new Uint8Array(analyser.frequencyBinCount);
    src.connect(analyser);
    analyser.connect(ctx.destination); // <-- terminate at speakers
  }
  // resume on the first gesture and on every play (suspended ctx = silent)
  const resume = () => {
    if (ctx && ctx.state === "suspended") ctx.resume();
  };
  window.addEventListener("pointerdown", resume, { once: true });
  window.addEventListener("keydown", resume, { once: true });
  audioEl.addEventListener("play", resume);

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
