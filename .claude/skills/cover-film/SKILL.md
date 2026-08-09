---
name: cover-film
description: The animated album cover (static/video/cover-film.mp4) — where it comes from, how to re-cut/re-render it, and the film grammar rules (smooth gen overlays, chopped glitch bursts, airspace, loop discipline). Use when changing the cover film, re-rolling a region effect, adjusting burst density/pacing, or shipping a new cut to the site.
---

# cover-film — the living album cover

`static/video/cover-film.mp4` is the looping animated cover the home player swaps in over the still art (`#cover-film` in `themes/oo/layouts/index.html`). **It is generated in the cover-lab (`~/Documents/dev/oo-band/gen/cover-lab/`), never edited in this repo.** Read the lab's README before touching the pipeline.

## Film grammar (policy, not preference)

1. **Gen-AI overlays are smooth and continuous** — original clip + `return:`
   clip (wan-2.2 `last_image` = the cover crop) so the region settles back
   onto the cover diegetically. Fade-in on entry, 0.25s blend at the very
   end only. No long fade-outs — they read as a visible reset.
2. **Only procedural effects (ffglitch / glitchgpu Metal / numpy) get the
   chopped treatment** — the timeline's `sprinkle:` block scatters them as
   seeded micro-bursts (hard cuts, stutter echoes). Same seed → same film.
3. **Airspace rule:** a burst never strikes a region whose box intersects a
   gen overlay live at that moment (`boxes_clash` in assemble.py).
4. **Loop discipline:** open and close on stills; `guard:` keeps bursts off
   the seam. Verify: first-vs-last frame mean diff ≤ ~2.

## Guardrails

- Keep the `/video/cover-film.mp4` filename — template and swap JS point at it.
- `static/video/` gets the ~5 MB 1080px web encode only; masters stay in the lab.
- Region mask feathers small (2–4) — heavy feather reads mushy (Eric).
- The player-side swap (template/JS/CSS) is Eric's in-progress work — coordinate before changing it.

## Shipping a new cut

```bash
# from the site repo root: encode 1080px web + install (does not commit)
.claude/skills/cover-film/scripts/ship.sh ~/Documents/dev/oo-band/gen/cover-lab/composites/<cut>.mp4
```

## References — load on demand

- **[references/recut.md](references/recut.md)** — the common asks with commands: re-cut a timeline, adjust burst density/seed, re-roll one region (gen or procedural), verify a cut before shipping. _Read when actually operating the lab._
