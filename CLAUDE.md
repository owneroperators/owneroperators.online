# CLAUDE.md — owneroperators (Hugo site)

This is the public website repo for **OWNER/OPERATORS**. For project-wide context, read the parent project's `AGENTS.md` first (voice, release state, cast, manual references). This file covers the site itself.

For **creative direction** (texture, voice, cast usage, dev-agent-team workflow) read `PLAN.md` alongside this file — CLAUDE.md is mechanics and hard rules; PLAN.md is where the site is going.

## Stack

- **Hugo** (extended, v0.160+), single binary, no Node dependency at runtime.
- **Custom minimal theme** at `themes/oo/`. No third-party theme. Keep it small; prefer editing the theme over vendoring anything.
- **CSS** is plain CSS at `themes/oo/assets/css/main.css`, fingerprinted by Hugo's asset pipeline. No Tailwind, no PostCSS yet.
- **`package.json`** is intentionally a stub (`{}`) — reserved for future tooling (e.g. Tailwind) but not wired up. Don't add a build step that Hugo doesn't need.
- **Markdown:** goldmark with `unsafe = true` (raw HTML in content files passes through). Intentional — content sometimes uses inline spans/classes. Don't disable it without checking what breaks.

## Structure

```
hugo.toml                   # site config; release params live under [params.release]
content/_index.md           # home page body (renders into the .intro section of index.html)
content/                    # future: posts/, songs/, cast/, etc.
themes/oo/
  layouts/
    _default/baseof.html    # HTML shell, loads fingerprinted CSS
    _default/single.html    # single content pages
    _default/list.html      # section list pages
    index.html              # home page (hero + release block + intro)
    partials/
      footer.html
      links.html            # renders site.Data.links (streaming + social)
  assets/css/main.css
  theme.toml
static/robots.txt
deploy.sh                   # hugo build + rsync to remote server
```

## Data files

Anything under `data/` (YAML/TOML/JSON) is auto-loaded by Hugo as `site.Data.<filename>` — no imports, no glue.

Outbound links (streaming services + social) live in `data/links.yaml` as a flat list:

```yaml
- name: Spotify
  url: https://open.spotify.com/artist/...
- name: Instagram
  url: https://www.instagram.com/...
```

`partials/links.html` renders them as a single row in the release block. Order in the YAML = order in the UI. Spotify and Apple Music URLs are currently dummies — replace when artist profiles go live. Bandcamp and Instagram URLs are real.

`data/ornaments.yaml` holds three ASCII ornament slots — `masthead` (above brand hero), `between` (between release and intro), `footer` (above footer line). Empty string → renders nothing. Populate with Margot's output. Keep width ≤72 chars so mobile doesn't scroll horizontally; `.ornament` styles them as muted 0.75rem monospace.

## Deploy

`./deploy.sh` builds and rsyncs `public/` to the remote web server. Configure via env vars or a local `.env` file (gitignored) — see `deploy.sh` for the required variables.

Currently **local git only — don't push to a remote** unless Eric explicitly says so. Commits are fine.

## Server

Production hosting and server configuration (web server, TLS, vhost, access control) are managed out-of-band and intentionally **not documented in this repo**. Ask Eric for server access details.

## Working locally

- `hugo server` → live reload at `http://localhost:1313/`
- `hugo` → production build to `public/` (gitignored)
- `hugo --minify --cleanDestinationDir` → what `deploy.sh` runs

## Scripts

- `scripts/ask.sh <model> "<prompt>"` — local helper that strips CLI escape codes and spinner glyphs so captured model output is clean and pipeable. Use it when you need to save, diff, or further process a response. Reads stdin if no prompt arg is given.

## Design intent

- **"Analog imperfection, digital precision"** — high-contrast dark palette, monospace body, bold sans display for the brand lockup. Keep the slash in `OWNER/OPERATORS` as a visual anchor (`.slash` span is muted, everything else is full-weight).
- **Body typography: MgOpen Moderna** (regular + bold), loaded via `@font-face` from Eric's own CDN. Declared as one family with weights 400 and 700 so `<strong>`/`font-weight: bold` just works. Display/brand still uses the system sans stack. Don't load Google Fonts; if another face gets picked, self-host it under `themes/oo/static/fonts/` or use the CDN.
- **No JS unless needed.** Single page, server-rendered, no client framework.
- **Background canvas is 4:3.** Source clips in `/video/*.mp4` and the hydra render buffer (`bg.js`, `width: 720, height: 540`) are all 720×540. `.bg-canvas` uses `object-fit: cover` so the 4:3 frame keeps its ratio and crops to fill any window rather than stretching. If you change the clip ratio, update both the hydra buffer dims and that expectation.

## Content conventions

- Brand name is always `OWNER/OPERATORS` — uppercase, literal slash. Don't sanitize.
- Page/section copy should anchor to `manual/1_MANUAL__STANDARD.md` in the owner-operators workspace (sharp, quotable, metamodern). Don't leak the academic register (that's reserved for The Reader In Cultural Theory).
- **Don't surface the performance-piece framing on the front page** — the music comes first; the cast is discoverable but not frontloaded. See parent `AGENTS.md`.

## What to do / not do

- **Prefer editing** existing templates/CSS over adding new ones. This is meant to stay small.
- **Don't add a theme framework** (Tailwind, CSS-in-JS, Alpine, HTMX, etc.) without Eric's say-so.
- **Don't invent real URLs.** Streaming URLs in `data/links.yaml` for Spotify/Apple Music are dummies for now — replace with real ones when artist profiles go live, don't add other platforms on guess.
- **Don't commit `public/`, `resources/_gen/`, `.hugo_build.lock`, or `.env`** — already in `.gitignore`.
- **Don't push** to a remote. Eric will do that when ready.

## Release context (as of 2026-04-20)

- Single: _Echoes and Static_, DSP go-live **2026-05-08**.
- LP: _LOSS LEADER LP_, 10 tracks, date TBD.
- Site needs to be live before 5/8 with working pre-save / stream links.
- **2026-06-03:** site is live and **public**. Custom Hugo 404 wired up server-side.
