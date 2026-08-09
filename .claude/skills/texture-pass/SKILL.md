---
name: texture-pass
description: The recurring OWNER/OPERATORS move — pull the page toward the project's aesthetic (photocopy grit, ASCII ornaments, toner ghosts, one line of manual voice) WITHOUT adding new sections. Use when asked to make the site feel less sterile/templated, add texture/an ornament/an ASCII masthead/a halftone, drop in a line of voice, or "make it feel more like the project." Covers the Margot-draft -> curate -> Jester-roast -> implement -> build-check loop, the ornaments.yaml slots, and the perf/legibility fallback so texture never breaks the page. Pair with cast-invoke (to call the models) and canon-voice (so nothing shipped breaks canon).
---

# texture-pass

From PLAN.md "Rough moves #1": pull the page from neutral toward the aesthetic **without adding sections**. If a change makes the page slicker, ask whether it's hiding something that should be visible. "Too clean or too designed" is probably wrong.

## The loop

**Margot drafts → curate (keep the seams) → Jester roasts → Silas/you
implement in `themes/oo/` → `hugo` build check → canon gate → show Eric.**
Invoke the cast via `cast-invoke`'s `scripts/cast.sh`. Don't commit, don't
deploy — Eric redirects from the draft.

## Guardrails specific to texture

- **Music first.** Don't bury the release under texture.
- **Performant + legible fallback.** If a texture fails to load/render, the
  page must stay readable and fast. Legibility never depends on an ornament.
- **Cast not frontloaded, dev team unnamed** (see `canon-voice`).
- **No new sections.** Texture changes feel, not information architecture.
  A new home-page section is Eric's call.
- **Prefer editing existing templates/CSS** over adding files; no frameworks.

## References — load on demand

- **[references/aesthetic.md](references/aesthetic.md)** — the codex: the full visual vocabulary (zine grit, roadside Americana, obsolete tech, Riso accents) and typography rules. _Read before drafting any texture element so it lands in-world._
- **[references/moves.md](references/moves.md)** — the three pre-wired low-risk moves (ornaments.yaml slots, one line of voice, masthead/halftone) with slot names, width limits, and styling hooks. _Read when picking WHERE the texture goes._
