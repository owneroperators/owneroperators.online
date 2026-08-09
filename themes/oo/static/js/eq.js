/* ── Web Audio spectrum visualizer ──────────────────────────────────────
   OWNER/OPERATORS custom addition — NOT part of the upstream web-mp3 lib.
   The home template imports setupEQ() and calls it on #player BEFORE init().
   web-mp3.js is a pristine upstream build; when syncing it from its source
   repo, nothing here needs patching.

   ── THE CHIPMUNK BUG. Read this before touching the graph. ──
   createMediaElementSource() does not "listen to" the <audio> element, it
   MOVES the element's output into the AudioContext — playback itself now
   runs through the graph. When the context's rate (the output device's,
   usually 48k) differs from the file's (44.1k), a browser that doesn't
   resample the element into the context plays the track 48000/44100 = 8.8%
   fast and sharp. That is the bug, and it has now shipped twice:
     - pinned to 44.1k  → pitch correct, but an always-on 44.1→48k resampler
                          sat on OUTPUT and glitched on device switches
     - unpinned to 48k  → resampler gone, chipmunk back
   Both are the same mistake: a decorative visualizer holding the playback
   path hostage. So it doesn't hold it anymore. Three routes, picked at runtime:

   1. captureStream() available (Chrome/Edge/Firefox) — TAP a copy:

        element ──native output──> speakers   (untouched; browser resamples
                └─stream copy─> analyser → gain(0) → destination   as it always has)

      The element never enters the graph, so the analyser CANNOT shift pitch,
      whatever the context rate is. Nothing here is audible; the gain-0 leg
      exists only because an analyser with no path to destination isn't pulled.

   2. No captureStream, but the context honors a sample-rate pin (desktop
      Safari) — createMediaElementSource with the context pinned to the FILE's
      rate, so context rate == media rate and there is nothing to resample
      inside the graph. The rate is checked BEFORE the source node is created:
      createMediaElementSource is irreversible (it permanently rebinds the
      element's output — disconnect() gives silence, not the element back), so
      a refused pin has to bail while bailing is still possible.

   3. iOS, or a browser that refused the pin — NO GRAPH AT ALL. No context, no
      source node, nothing: the element plays natively, exactly as if this file
      didn't exist. iOS is the known-bad case (2026-07): it chipmunks through
      route 2 even with the pin requested, and on iOS merely constructing an
      AudioContext can drag the audio session's rate around underneath a
      playing element. The bars fall back to the idle wave — decoration lost,
      audio guaranteed. That trade is deliberate; see the git history before
      re-litigating it, this bug has shipped three times.

   Other hazards this code is built around:
   - AudioContext is gated behind a user gesture: it starts suspended and must
     be resume()'d from a real gesture or the bars never move.
   - The graph is built EAGERLY (not on first gesture) so route 2 never
     hot-swaps a playing element into a MediaElementSource mid-track. In route
     1 only the stream tap is lazy — the stream has no audio track until
     playback actually starts. */

// Sample rate of the served track (static/mp3/echoes2.mp3). Only route 2 uses
// it. If the master is ever re-bounced at another rate, change it here.
const SOURCE_RATE = 44100;

// The one thing here that can't be feature-detected. What we'd need to test is
// "does this browser resample a media element into the context correctly," and
// the only way to find out is createMediaElementSource — which is exactly the
// call we can't take back. So iOS gets named. iPadOS 13+ lies and reports
// MacIntel, hence the touch-point check.
const IS_IOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

function setupEQ(audioEl, opts = {}) {
  const sourceRate = opts.sourceRate || SOURCE_RATE;
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
  let ctx, analyser, freq, tapSrc; // tapSrc held so GC can't collect the tap
  let route = "none"; // "tap" | "element-source" | "none"
  const AC = window.AudioContext || window.webkitAudioContext;
  const capture = audioEl.captureStream || audioEl.mozCaptureStream;

  // shared analyser setup — only reached once a context is known to be safe
  const wireAnalyser = () => {
    analyser = ctx.createAnalyser();
    analyser.fftSize = 2048; // fine linear bins, regrouped log-spaced in draw()
    analyser.smoothingTimeConstant = 0.9; // calmer motion, won't fight the bg video
    freq = new Uint8Array(analyser.frequencyBinCount);
  };

  if (AC && IS_IOS) {
    // route 3 — deliberately nothing. See the header.
  } else if (AC && capture) {
    // route 1 — playback stays outside the graph, so the context is free to
    // adopt the device's rate.
    ctx = new AC();
    route = "tap";
    wireAnalyser();
    const mute = ctx.createGain(); // silent terminator: keeps the graph pulled
    mute.gain.value = 0;
    analyser.connect(mute).connect(ctx.destination);
    // captureStream() yields no audio track until the element is actually
    // playing, so keep trying until one shows up.
    const tap = () => {
      if (tapSrc) return;
      try {
        const stream = capture.call(audioEl);
        if (!stream || !stream.getAudioTracks().length) return;
        tapSrc = ctx.createMediaStreamSource(stream);
        tapSrc.connect(analyser);
      } catch (e) {
        /* no tap → bars fall back to the idle wave; audio is unaffected */
      }
    };
    audioEl.addEventListener("play", tap);
    audioEl.addEventListener("playing", tap);
    audioEl.addEventListener("timeupdate", tap); // cheap no-op once tapped
  } else if (AC) {
    // route 2 — ask for the file's rate, and only commit to the irreversible
    // createMediaElementSource if the browser actually gave it to us.
    const pinned = new AC({ sampleRate: sourceRate });
    if (Math.round(pinned.sampleRate) === sourceRate) {
      ctx = pinned;
      route = "element-source";
      wireAnalyser();
      ctx.createMediaElementSource(audioEl).connect(analyser);
      analyser.connect(ctx.destination); // playback runs THROUGH here — must terminate at speakers
    } else {
      // Pin refused → route 2 would chipmunk. Drop to route 3 while the
      // element is still untouched.
      const off = ((pinned.sampleRate / sourceRate - 1) * 100).toFixed(1);
      pinned.close();
      console.warn(
        `[oo/eq] context refused a ${sourceRate}Hz pin (got ${pinned.sampleRate}Hz) — ` +
          `routing playback through it would run ${off}% fast, so the visualizer ` +
          `is off and audio plays natively. See the chipmunk-bug note in eq.js.`,
      );
    }
  }

  // Debug handle: which route this browser took and at what rate. The pitch bug
  // is browser-specific, so being able to ask from a phone console beats
  // guessing. route "tap"/"none" → playback is outside the graph and safe.
  window.__ooEQ = { ctx, route, sourceRate, ios: IS_IOS };
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
  // 32 bars, log-spaced 40 Hz–16 kHz. Linear FFT bins would cram everything
  // musical into the first few bars (bar 1 of 32 = 0–689 Hz: kick, bass, and
  // most fundamentals) and read as bass-heavy no matter the mix; log spacing
  // gives each octave equal screen space, like a hardware EQ display.
  const BARS = 32;
  const FMIN = 40;
  const FMAX = 16000;
  // If the route-1 tap never attaches the bars silently go decorative, which is
  // exactly the kind of quiet failure this file has a history of. Say so once.
  let signalChecked = false;
  let deadFrames = 0;
  function draw() {
    requestAnimationFrame(draw);
    t += 1;
    if (!w) size(); // layout may not have settled on first frame
    cctx.clearRect(0, 0, w, h);
    const live = analyser && !audioEl.paused;
    if (live) {
      analyser.getByteFrequencyData(freq);
      if (!signalChecked) {
        if (freq.some((b) => b)) signalChecked = true; // real signal — stop checking
        else if (++deadFrames > 300) {
          signalChecked = true; // ~5s of playing silence
          console.warn(
            "[oo/eq] analyser reads silence while playing — the stream tap never " +
              "attached, so the bars are decorative. Audio itself is unaffected.",
          );
        }
      }
    }
    const n = BARS;
    const gap = 2;
    const bw = (w - gap * (n - 1)) / n;
    cctx.fillStyle = barColor;
    for (let i = 0; i < n; i++) {
      // playing → real spectrum; idle → a gentle low wave so it reads as alive
      let v;
      if (live) {
        const nyq = ctx.sampleRate / 2;
        const lo = Math.floor(
          ((FMIN * Math.pow(FMAX / FMIN, i / n)) / nyq) * freq.length,
        );
        let hi = Math.ceil(
          ((FMIN * Math.pow(FMAX / FMIN, (i + 1) / n)) / nyq) * freq.length,
        );
        hi = Math.min(Math.max(hi, lo + 1), freq.length);
        let sum = 0;
        for (let k = lo; k < hi; k++) sum += freq[k];
        v = sum / (hi - lo) / 255;
      } else {
        v = 0.14 + 0.09 * Math.sin(t * 0.05 + i * 0.5);
      }
      const bh = Math.max(2, v * h);
      cctx.globalAlpha = 0.28 + v * 0.5; // visible floor, tops ~0.78 — soft, not stark
      cctx.fillRect(i * (bw + gap), h - bh, bw, bh);
    }
    cctx.globalAlpha = 1;
  }
  draw();
}

export { setupEQ };
