---
title: "Preview"
nobg: true
noindex: true
build:
  render: always
  list: never
---

<div class="preview-row">

<pre class="ornament hidden">
        ,--.  .-.          .-.
        /_ |_/ -_)       (_| |
         `-' (__)        `( ) )
              (_)           / /
                             `/

    Louuy                     you

    ┌──────────────────────────────┐
    │                              │
    │   every user knows three     │
    │   versions of themselves     │
    │                              │
    ├─────────┬────────────────────┤
    │   the one in front of the    │
    │   screen                      │
    ├───┼─┼───┬───────────────┐
    │   what you pretend to be││
    │   what you're pretending to ││
    │   pretend                ││
    └────┴─┴───┴───────────────┘
                    ▲
                    │
            next, come back when you have something to lose or delete something you wrote

</pre>

<div id="player-container" class="oo-player">
  <img id="thumb" alt="" />
  <audio id="player" controls></audio>
  <ul id="playlist"></ul>
</div>
</div>

<script type="module">
  import { init } from "/js/web-mp3.js";
  // mp3s live in static/mp3/ (served at /mp3/). Files carry ID3v2 tags so the
  // player fills in title/artist/album art. Server needs HTTP Range support
  // (Hugo's dev server and nginx both do).
  init([
    "/mp3/echoes2.mp3",
  ]);
</script>
