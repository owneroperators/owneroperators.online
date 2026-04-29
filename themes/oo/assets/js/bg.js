// Runs hydra-synth over a background <video> on capable devices, or swaps in
// an animated ASCII noise field as a fallback (iOS, no-WebGL, etc).
// hydra-synth is loaded globally as `Hydra` by the <script> tag in baseof.html.
document.documentElement.setAttribute("data-bg", "loaded");
(function () {
  var canvas = document.getElementById("bg");
  if (!canvas) return;

  // Temporarily ignoring prefers-reduced-motion so the animated ASCII fallback
  // is visible during iPhone testing. Re-enable before shipping.
  // var reduceMotion =
  //   window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reduceMotion = false;

  if (reduceMotion || !supportsHydra()) {
    document.documentElement.setAttribute(
      "data-bg",
      reduceMotion ? "ascii-static" : "ascii",
    );
    asciiFallback(canvas, { animate: !reduceMotion });
    return;
  }
  document.documentElement.setAttribute("data-bg", "hydra");

  // Internal render resolution — visual stretch comes from CSS.
  new Hydra({
    canvas: canvas,
    detectAudio: false,
    makeGlobal: true,
    width: 720,
    height: 540,
  });

  var videoSrc = canvas.getAttribute("data-video");

  if (videoSrc) {
    // All clip paths. Add/remove as needed — order is the playback sequence.
    var clips = [
      videoSrc,
      "/video/store.mp4",
      "/video/action.mp4",
      "/video/bridge.mp4",
      "/video/bwamp.mp4",
      "/video/cone.mp4",
      "/video/dad.mp4",
      "/video/dance.mp4",
      "/video/fan.mp4",
      "/video/float.mp4",
      "/video/king.mp4",
      "/video/talent.mp4",
      "/video/trio.mp4",
    ];

    // Four slots: active[i] and idle[i] are indices into `slots`.
    // Each position (0 and 1) swaps independently on a staggered timer.
    var slots = [s0, s1, s2, s3];
    var active = [0, 1]; // slot indices currently on screen
    var idle = [2, 3]; // slot indices preloading (paired by position)
    var recentClips = [];

    // Persistent <video> per slot. We create them ourselves (with playsinline,
    // muted, autoplay) instead of using slots[i].initVideo(url), because
    // hydra's internal initVideo creates an element without playsinline, which
    // iOS hijacks into fullscreen and refuses to render to a texture.
    var videoEls = [null, null, null, null];

    function initSlotVideo(idx, url) {
      var v = videoEls[idx];
      if (!v) {
        v = document.createElement("video");
        v.muted = true;
        v.defaultMuted = true;
        v.playsInline = true;
        v.setAttribute("playsinline", "");
        v.setAttribute("webkit-playsinline", "");
        v.setAttribute("muted", "");
        v.autoplay = true;
        v.loop = true;
        v.crossOrigin = "anonymous";
        videoEls[idx] = v;
        slots[idx].init({ src: v });
      }
      v.src = url;
      v.load();
      var p = v.play();
      if (p && p.catch) {
        p.catch(function () {
          /* iOS will retry on first user interaction */
        });
      }
    }

    function nextClip() {
      var available = clips.filter(function (c) {
        return recentClips.indexOf(c) === -1;
      });
      var c = available[(Math.random() * available.length) | 0];
      recentClips.push(c);
      if (recentClips.length > 3) recentClips.shift();
      return c;
    }

    console.log("time", time);

    // Effect chains — each references active slots so clip swaps re-use the current chain.
    var chainIdx = 0;
    var chains = [
      function () {
        // base
        src(slots[active[0]])
          .blend(
            src(slots[active[1]])
              .colorama(0.004)
              .pixelate(400, 30)
              .modulate(noise(2.0, 0.06), 0.025),
            0.4,
          )
          .scale(1.02)
          .modulate(noise(1.6, 0.08), 0.018)

          .contrast(1.08)
          .out();
      },
      function () {
        // mirror + pixelate
        src(slots[active[0]])
          .blend(
            src(slots[active[1]])
              .pixelate(72, 54)
              .modulate(noise(2.0, 0.06), 0.025),
            0.4,
          )
          .scale(1.02)
          // .kaleid(.5)
          .colorama(0.012)
          .contrast(1.1)
          .out();
      },
      function () {
        // pixelate blend — both slots visible
        src(slots[active[0]])
          .blend(
            src(slots[active[1]])
              .modulate(noise(2.0, 0.06), 0.025)
              .pixelate(72, 54)
              .colorama(0.006),
            0.4,
          )
          .contrast(1.1)
          .out();
      },
      function () {
        // slow scroll drift
        src(slots[active[0]])
          .blend(src(slots[active[1]]).pixelate(40, 300), 0.4)
          .scale(1.02)
          .scrollX(function () {
            return time * 0.008;
          })
          .modulate(noise(1.6, 0.08), 0.018)
          .colorama(0.004)
          .contrast(1.1)
          .out();
      },
    ];
    var chainDurations = [10000, 10000, 10000, 10000];

    function renderFront() {
      chains[chainIdx]();
    }

    function nextChain() {
      chainIdx = (chainIdx + 1) % chains.length;
      renderFront();
      setTimeout(nextChain, chainDurations[chainIdx]);
    }

    function swapOne(pos) {
      var out = active[pos];
      active[pos] = idle[pos];
      idle[pos] = out;
      renderFront();
      initSlotVideo(out, nextClip());
    }

    // Seed all four slots up front.
    initSlotVideo(0, nextClip());
    initSlotVideo(1, nextClip());
    initSlotVideo(2, nextClip());
    initSlotVideo(3, nextClip());

    // Give initial clips a moment to buffer, then start rendering.
    setTimeout(function () {
      renderFront();
      // Effect chain cycles independently of clip swaps.
      setTimeout(nextChain, chainDurations[chainIdx]);
      // Position 0 swaps at 10s, 20s, 30s...
      setTimeout(function tick0() {
        swapOne(0);
        setTimeout(tick0, 10000);
      }, 10000);
      // Position 1 swaps at 15s, 25s, 35s... (5s offset)
      setTimeout(function tick1() {
        swapOne(1);
        setTimeout(tick1, 10000);
      }, 15000);
    }, 1500);
  } else {
    noise(9, 0.12)
      .thresh(0.55)
      .luma(0.2)
      .modulate(osc(380, 0, 0).thresh(0.5), 0.012)
      .out();
  }

  function supportsHydra() {
    if (!window.Hydra) return false;
    try {
      var test = document.createElement("canvas");
      var gl =
        test.getContext("webgl") || test.getContext("experimental-webgl");
      if (!gl) return false;
    } catch (e) {
      return false;
    }
    return true;
  }

  function asciiFallback(el, opts) {
    var animate = !opts || opts.animate !== false;
    var fallback = document.createElement("div");
    fallback.className = "bg-ascii";
    fallback.setAttribute("aria-hidden", "true");
    el.parentNode.replaceChild(fallback, el);

    // Glyph pool drawn from the same vocabulary as data/ornaments.yaml:
    // shade blocks, box-drawing, waves, ticks, dots. Spaces are overweighted
    // so the field reads as sparse static instead of a solid wall.
    var glyphs = [
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      "·",
      "·",
      "·",
      "˙",
      "░",
      "▒",
      "▓",
      "─",
      "│",
      "┼",
      "┤",
      "├",
      "┬",
      "┴",
      "┌",
      "┐",
      "└",
      "┘",
      "╭",
      "╮",
      "╯",
      "╰",
      "≋",
      "≡",
      "=",
      "~",
      "▪",
      "▫",
    ];

    var state = { cols: 0, rows: 0, cells: null };

    function measure() {
      var probe = document.createElement("span");
      probe.textContent = "M";
      probe.style.cssText =
        "position:absolute;visibility:hidden;font:inherit;white-space:pre;";
      fallback.appendChild(probe);
      var cw = probe.getBoundingClientRect().width || 7;
      var ch = probe.getBoundingClientRect().height || 12;
      fallback.removeChild(probe);
      return { cw: cw, ch: ch };
    }

    function build() {
      var m = measure();
      state.cols = Math.ceil(window.innerWidth / m.cw) + 1;
      state.rows = Math.ceil(window.innerHeight / m.ch) + 1;
      var total = state.cols * state.rows;
      var cells = new Array(total);
      for (var i = 0; i < total; i++) {
        cells[i] = glyphs[(Math.random() * glyphs.length) | 0];
      }
      state.cells = cells;
      render();
    }

    function render() {
      var lines = new Array(state.rows);
      var cells = state.cells;
      var cols = state.cols;
      for (var r = 0; r < state.rows; r++) {
        lines[r] = cells.slice(r * cols, (r + 1) * cols).join("");
      }
      fallback.textContent = lines.join("\n");
    }

    function tick() {
      if (!state.cells) return;
      var cells = state.cells;
      var mutations = Math.max(6, (cells.length * 0.004) | 0);
      for (var i = 0; i < mutations; i++) {
        var idx = (Math.random() * cells.length) | 0;
        cells[idx] = glyphs[(Math.random() * glyphs.length) | 0];
      }
      render();
    }

    // Ornament pool, emitted by baseof.html from data/ornaments.yaml as a
    // JSON data block (not inline JS — Hugo's minifier will rewrite that into
    // a template literal and nuke the object structure).
    var ornamentPool = [];
    var dataEl = document.getElementById("ornaments-data");
    if (dataEl) {
      try {
        var raw = JSON.parse(dataEl.textContent || "{}");
        var source = Array.isArray(raw)
          ? raw
          : Object.keys(raw).map(function (k) {
              return raw[k];
            });
        for (var i = 0; i < source.length; i++) {
          var v = source[i];
          if (typeof v === "string" && v.replace(/\s/g, "").length > 0) {
            ornamentPool.push(v);
          }
        }
      } catch (e) {}
    }

    function shuffle(arr) {
      for (var i = arr.length - 1; i > 0; i--) {
        var j = (Math.random() * (i + 1)) | 0;
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
      }
      return arr;
    }

    shuffle(ornamentPool);
    var ornamentCursor = 0;

    function stampOrnament() {
      if (!ornamentPool.length || !state.cells) return;
      if (ornamentCursor >= ornamentPool.length) {
        shuffle(ornamentPool);
        ornamentCursor = 0;
      }
      var o = ornamentPool[ornamentCursor++];
      var lines = o.split("\n");
      // Drop fully blank leading/trailing lines so stamps hug their content.
      while (lines.length && !lines[0].replace(/\s/g, "").length) lines.shift();
      while (lines.length && !lines[lines.length - 1].replace(/\s/g, "").length)
        lines.pop();
      if (!lines.length) return;
      var oh = lines.length;
      var ow = 0;
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].length > ow) ow = lines[i].length;
      }
      // If the ornament is bigger than the field, skip this tick.
      if (oh >= state.rows || ow >= state.cols) return;
      var startR = (Math.random() * (state.rows - oh)) | 0;
      var startC = (Math.random() * (state.cols - ow)) | 0;
      for (var r = 0; r < oh; r++) {
        var line = lines[r];
        for (var c = 0; c < line.length; c++) {
          var ch = line.charAt(c);
          // Skip spaces so the ornament's negative space lets the noise field
          // bleed through, rather than carving out a rectangular hole.
          if (ch === " ") continue;
          state.cells[(startR + r) * state.cols + (startC + c)] = ch;
        }
      }
      render();
    }

    build();
    if (animate) {
      setInterval(tick, 180);
      setInterval(stampOrnament, 3200);
      setTimeout(stampOrnament, 1200);
    }

    var rebuildTimer;
    window.addEventListener("resize", function () {
      clearTimeout(rebuildTimer);
      rebuildTimer = setTimeout(build, 200);
    });
  }
})();
