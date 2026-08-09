---
name: cast-invoke
description: How to invoke the local OWNER/OPERATORS Ollama cast (dev-agent team Silas/Margot/Ren/June/Jester and the character models Gloria/Louuy/Reader/Nathan/Mote) for drafts, art, and voice checks. Use when a task needs a cast member's fingerprint — ASCII art or tone copy (Margot), CSS/Hugo/HTML (Silas), structure/nav/mermaid (Ren), QA/link checks (June), microcopy roasts (Jester), or in-character copy (Gloria/Louuy/Reader/Nathan). Covers the canonical ollama tags, vanilla fallbacks, dossier paths, the Margot->Silas->Jester->June->Ren workflow, and the "curate, don't polish" rule. Pair with canon-voice before anything voiced ships.
---

# cast-invoke

The cast are local Ollama fine-tunes. Their fingerprints can appear on the site; their names cannot (easter-egg layer — see `canon-voice`). Treat output as **material** — curate, don't polish.

## Invoking

**Use [`scripts/cast.sh`](scripts/cast.sh)** — it resolves the live tag
(canonical first, vanilla fallback; tags drift) and runs the prompt:

```bash
.claude/skills/cast-invoke/scripts/cast.sh margot "ASCII masthead, 'OWNER/OPERATORS', ~8 rows"
cat themes/oo/layouts/index.html | .claude/skills/cast-invoke/scripts/cast.sh jester "Roast the microcopy. Short."
```

Raw `ollama run <tag>` works too — but run `ollama list` first; tags drift.
For output you need to save/diff/chain, pipe through the repo's
`scripts/ask.sh` (strips CLI escape codes and spinner glyphs).

## Typical workflow

**Margot drafts tone → Silas implements → Jester sharpens → June validates →
Ren checks structure.** Pick only the ones the task needs.

## The three hard limits on glitch

1. **Don't ship code that breaks the build** — Silas hallucinates Hugo
   functions; check `hugo` output, not the vibe.
2. **Don't ship copy that violates canon** — Gloria self-IDing, academic
   leak. Canon beats glitch (`canon-voice`).
3. **Don't credit the cast on-page** — fingerprints yes, names no.

## References — load on demand

- **[references/models.md](references/models.md)** — the full role → canonical tag → vanilla fallback table, dossier and canon paths. _Read when cast.sh can't resolve a tag, picking a model manually, or adding a new cast member._
- **[references/curation.md](references/curation.md)** — the curate-don't-polish doctrine in full: keep-the-seams, push-the-tool-before-blaming-it, when weird output is the payload. _Read before discarding or heavily editing any cast output._
