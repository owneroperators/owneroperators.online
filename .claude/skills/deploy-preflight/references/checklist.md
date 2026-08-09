# The full preflight checklist

`scripts/preflight.py` automates 1, 2 (internal half), and 5. Steps 3–4 are
judgment calls; do them by hand.

1. **Clean production build.** Exactly what deploy does, minus the rsync:

   ```bash
   rm -rf public && hugo --minify --cleanDestinationDir
   ```

   Must exit 0 with no ERROR lines. Silas sometimes hallucinates a Hugo
   function — a green vibe is not a green build. Read the output.

2. **Broken-link / QA pass (June's job).** Internal links resolve under
   `public/`, outbound `data/links.yaml` targets answer, 404 wiring intact,
   new pages actually rendered. Pipe context to June for a second pair of
   eyes when the change was structural:

   ```bash
   .claude/skills/cast-invoke/scripts/cast.sh june "Check this nav/link list for problems: ..."
   ```

   Report anything dead — don't silently pass.

3. **Canon gate.** Any new/changed on-page copy clears `canon-voice`: brand
   slash intact, Gloria never self-IDs, no academic leak in hero/release,
   cast not frontloaded, nothing invented.

4. **Asset ratios.** If background video/canvas changed: 4:3 (720×540) holds
   across source clips, the hydra buffer in `bg.js`, and `.bg-canvas`
   object-fit (CLAUDE.md "Design intent"). If the cover film changed: it's a
   1080px web encode, not a lab master (`cover-film` skill).

5. **Don't-ship list — never stage or commit:** `public/`,
   `resources/_gen/`, `.hugo_build.lock`, `.env`. All gitignored; keep them
   out of the index anyway.
