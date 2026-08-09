# Cast model registry

Confirm with `ollama list` before trusting this table — tags drift. Canonical
tags as of last check (all present locally):

| Role                                       | Canonical tag                                                | Vanilla fallback             |
| ------------------------------------------ | ------------------------------------------------------------ | ---------------------------- |
| Silas — CSS/Hugo/HTML, precise code        | `silas-7b-q8-ft:latest`                                      | `silas` → qwen2.5-coder:7b   |
| Margot — ASCII art, vignettes, tone copy   | `margot-1.7b-q8-ft:latest`                                   | `margot:latest` → qwen3:1.7b |
| Ren — structure, nav, mermaid              | `ren-1.7b-q8-ft:latest`                                      | qwen3:1.7b                   |
| June — QA, validation, broken-link checks  | `june-1.7b-q8-ft:latest`                                     | smollm2:1.7b-instruct        |
| Jester — tone contrarian, roasts microcopy | `jester-1.7b-q8-ft:latest`                                   | qwen3:1.7b                   |
| Gloria — voiced copy                       | `gloria-7b-q8-ft:latest`                                     | —                            |
| Louuy — voiced fragments                   | `louuy-7b-q4-ft:latest`                                      | —                            |
| Reader — annotation voice                  | `reader-7b-q8-ft:latest`                                     | —                            |
| Nathan — broadcast dispatches              | `nathan-7b-q8-ft:latest` (q4 + `nathan:latest` also present) | —                            |
| Mote — meta-tooling (comments/logs ONLY)   | `mote-14b-q3-ft:latest`                                      | `mote-9b-q35-vanilla:latest` |

`scripts/cast.sh` encodes this same table — if you update a tag here, update
the script's case block too.

## Per-model context

- **Dossiers** (prompt shape + known quirks):
  `~/Documents/AI/llm-models/fine-tuning/<name>/dossier.md`
- **Character canon**: `~/Documents/AI/llm-models/CHARACTERS.md` — read the
  entry before voicing anyone (see `canon-voice`).
- Character models (Gloria/Louuy/Reader/Nathan) have **no vanilla fallback**
  on purpose: a vanilla model can't hold the voice. If the tag is missing,
  stop and tell Eric rather than substituting.
