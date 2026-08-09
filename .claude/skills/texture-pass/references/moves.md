# The three pre-wired texture moves

Lowest-risk first. All of these exist already — no template surgery needed
for #1 and #2.

## 1. Ornament slots (`data/ornaments.yaml`)

Three ASCII slots, auto-rendered where keys have content; empty string
renders nothing:

- `masthead` — above the brand hero
- `between` — between release block and intro
- `footer` — above the footer line

Rules: **width ≤72 chars** (mobile must not scroll horizontally), populate
with Margot output (`cast.sh margot ...`), keep the seams. `.ornament`
styles them muted 0.75rem monospace. Other keys in the file (mastheads,
`combo_*`, per-link ornaments in `data/links.yaml`) follow the same width
rule.

## 2. One line of voice

A single manual-grounded sentence dropped into a hero footnote, the footer,
or between sections. Not a paragraph — let the line do the work. Must be
sourced (manual / established canon lines — see `canon-voice`
references/canon-sources.md); never invented.

## 3. Masthead / halftone / corner ornaments

More involved: start from Margot drafts, implement in `themes/oo/`
(existing templates/CSS preferred — the ornament classes and `body.is-home`
shadow treatments are already there to hook into). Halftone/toner effects
belong in CSS (repeating gradients, blend modes) — no JS, no frameworks.
The scanline + vignette overlays on `body::before/::after` show the pattern.

## Placement judgment

Texture concentrates at _edges and seams_ — margins, section boundaries,
the footer — not on top of the release block. Music first: the player and
links must never lose contrast or attention to an ornament.
