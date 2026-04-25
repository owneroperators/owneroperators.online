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
      reduceMotion ? "ascii-static" : "ascii"
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
    width: 960,
    height: 540,
  });

  var videoSrc = canvas.getAttribute("data-video");

  if (videoSrc) {
    s0.initVideo(videoSrc);
    src(s0)
      .scale(1.02)
      .modulate(noise(1.6, 0.08), 0.018)
      .colorama(0.004)
      .contrast(1.08)
      .out();
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
      var gl = test.getContext("webgl") || test.getContext("experimental-webgl");
      if (!gl) return false;
    } catch (e) {
      return false;
    }
    // Touch-primary devices (all iPhones/iPads, Android phones) hit two walls:
    // iOS refuses inline video playback for the element hydra's initVideo
    // creates, and mobile GPUs churn on the shader chain. Bail early.
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) {
      return false;
    }
    var ua = navigator.userAgent || "";
    var platform = navigator.platform || "";
    var isIOS =
      /iPhone|iPad|iPod/i.test(ua) ||
      /iPhone|iPad|iPod/i.test(platform) ||
      (platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
      (ua.indexOf("Mac") >= 0 && "ontouchend" in document);
    if (isIOS) return false;
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
      " ", " ", " ", " ", " ", " ", " ", " ",
      "·", "·", "·", "˙",
      "░", "▒", "▓",
      "─", "│", "┼", "┤", "├", "┬", "┴",
      "┌", "┐", "└", "┘",
      "╭", "╮", "╯", "╰",
      "≋", "≡", "=", "~",
      "▪", "▫",
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
        var source = Array.isArray(raw) ? raw : Object.keys(raw).map(function (k) {
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
      while (lines.length && !lines[lines.length - 1].replace(/\s/g, "").length) lines.pop();
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
