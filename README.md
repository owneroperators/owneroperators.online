# OWNER/OPERATORS

The official website for **OWNER/OPERATORS** — a post-punk / doom-groove / metamodern
pop project out of Boise, Idaho. Built as a small, fast, single-binary
[Hugo](https://gohugo.io/) site. Analog imperfection, digital precision.

🔗 **Live:** [owneroperators.online](https://owneroperators.online)

## Stack

- **Hugo** (extended, v0.160+) — no Node dependency at runtime.
- **Custom theme** at `themes/oo/` — minimal, hand-rolled, no third-party theme.
- **Plain CSS** at `themes/oo/assets/css/main.css`, fingerprinted by Hugo's asset
  pipeline. No Tailwind, no PostCSS.
- **No JS framework.** A small background canvas (`bg.js`, a 720×540 hydra render)
  is the only client-side code; the rest is server-rendered.
- **Markdown:** goldmark with `unsafe = true` — content files may contain raw inline
  HTML (figures, ornaments, spans) on purpose.

## Quick start

```bash
hugo server          # live reload at http://localhost:1313/
hugo                 # production build → public/ (gitignored)
hugo --minify --cleanDestinationDir   # what deploy.sh runs
```

Requires Hugo **extended**. On macOS: `brew install hugo`.

## Structure

```
hugo.toml                 # site config; release params under [params.release]
content/
  _index.md               # home page body
  *.md                    # standalone pages (cast profiles, etc.)
data/
  links.yaml              # streaming + social links (order = UI order)
  ornaments.yaml          # ASCII ornament slots (masthead / between / footer)
static/
  img/                    # images (webp)
  mp3/                    # audio masters
themes/oo/
  layouts/                # baseof, index, single, list, partials, shortcodes
  assets/css/main.css     # the stylesheet
deploy.sh                 # hugo build + rsync to the web server
```

## Data-driven bits

Anything under `data/` is auto-loaded by Hugo as `site.Data.<filename>` — no glue
code.

- **`data/links.yaml`** — a flat list of outbound links (streaming services +
  social). Order in the file is the order they render in the release block.
- **`data/ornaments.yaml`** — three ASCII ornament slots (`masthead`, `between`,
  `footer`). Empty string renders nothing. Keep each ≤72 chars wide so mobile
  doesn't scroll horizontally.

## Conventions

- The brand name is always **`OWNER/OPERATORS`** — uppercase, literal slash. Don't
  sanitize it.
- Prefer editing existing templates/CSS over adding new ones. This site is meant to
  stay small. No theme framework (Tailwind, Alpine, HTMX, etc.) without good reason.
- The background canvas is **4:3** (720×540); `.bg-canvas` uses `object-fit: cover`.
  If you change the clip ratio, update both the hydra buffer dims and that
  expectation.

## Deploy

`./deploy.sh` builds with `--minify --cleanDestinationDir` and rsyncs `public/` to
the web server. Configure via env vars or a local (gitignored) `.env` — see
`deploy.sh` for the required variables. Production hosting and server config (web
server, TLS, vhost) are managed out-of-band and intentionally not in this repo.

## What not to commit

`public/`, `resources/_gen/`, `.hugo_build.lock`, and `.env` are gitignored — keep
them that way.

---

Released under [Rack & Pinecone LLC](https://rack.and.pinecone.website).
