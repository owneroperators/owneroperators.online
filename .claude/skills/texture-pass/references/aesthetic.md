# The codex — visual vocabulary

Black-and-white zine grit, photocopy smear, toner ghosts, ASCII halos,
corrupted debug tables, errant UI fragments. Roadside Americana (truck
stops, gas stations, laundromats) crossed with obsolete tech (Speak & Spell,
CRT, dot-matrix). Riso accents used sparingly — fluo pink, safety yellow,
cornflower.

## Typography

- **Body** is MgOpen Moderna (400 + 700 via `@font-face` from Eric's CDN —
  see CLAUDE.md "Design intent"). Don't load Google Fonts.
- **Brand lockup** is the system sans stack with the muted `.slash` span —
  the slash is the visual anchor; everything else full-weight.
- **Ornaments/ASCII** render in the mono stack at muted 0.75rem
  (`.ornament`), with the home page adding phosphor-ish text-shadow.

## Reading the aesthetic (the gut checks)

- Would this look at home on a flyer photocopied one generation too many?
- Does it read as _honest and slightly wrong_, or as a design-system
  component wearing a costume?
- If it got 20% more broken, would it get better or just illegible?
  (Answer should be "better, briefly, then illegible" — sit just before
  that line.)
- Slicker after the change = probably wrong direction (PLAN.md).
