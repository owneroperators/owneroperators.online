---
name: deploy-preflight
description: The OWNER/OPERATORS ship checklist — everything to verify BEFORE the site goes to the server, stopping at the line Eric runs himself. Use when asked to "get ready to deploy", "check before shipping", do a pre-deploy pass, or validate a build. Covers the clean --minify build, the June/broken-link QA pass, the don't-commit-public and don't-push guardrails, and the hard rule that ./deploy.sh (and the actual rsync to the server) is Eric's to run, not yours.
---

# deploy-preflight

Preflight = everything up to but NOT including the actual deploy. **Eric runs `./deploy.sh` himself.** You get the plane to the runway; he takes off.

## The hard stops (never on your own)

- **Don't run `./deploy.sh`** or the raw rsync — Eric deploys.
- **Don't commit** unless Eric asks; local edits fine, commits his call.
- **Don't push** to a remote — local git only (CLAUDE.md).
- **Don't touch outbound links** in `data/links.yaml` beyond a URL Eric supplied.

## Running a preflight

**Start with [`scripts/preflight.py`](scripts/preflight.py)** — it runs the
mechanical half (clean `--minify` build, don't-ship staging check, internal
link existence scan; `--outbound` adds HEAD checks on `data/links.yaml`):

```bash
python3 .claude/skills/deploy-preflight/scripts/preflight.py [--outbound]
```

Then the judgment half: the **canon gate** on any new/changed copy
(`canon-voice` — brand slash, Gloria, academic leak, cast frontloading), and
**asset ratios** if background video/canvas changed (4:3, 720×540 — source
clips, `bg.js` hydra buffer, `.bg-canvas` object-fit all assume it).

**Output:** a short pass/fail report — build, links/QA, canon gate — then hand
back to Eric. Stop at the runway.

## References — load on demand

- **[references/checklist.md](references/checklist.md)** — the full five-point checklist with commands, what each step is guarding against, and the June QA pattern. _Read when running a full manual pass or when preflight.py flags something._
- **[references/server.md](references/server.md)** — deploy/server mechanics for context (deploy.sh internals, droplet, 404 wiring). _Read for context only — never to execute._
