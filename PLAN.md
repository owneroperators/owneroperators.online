# PLAN.md — owneroperators site

Steering doc for future Claude sessions working on this site. Not a spec. Candidates here get picked up, redirected, or dropped.

Pair with `CLAUDE.md` (mechanics, stack, hard rules) and the parent `pi5:~/.openclaw/workspace/owner-operators/AGENTS.md` (project-wide voice and canon).

## Start here (for a fresh session)

1. Read this file, `CLAUDE.md`, and `pi5:~/.openclaw/workspace/owner-operators/AGENTS.md`.
2. **Read "Push the tools until they break" below before using any local model.** That section is load-bearing. If you are about to say "the models aren't really good for this," stop and read it again.
3. Ask Eric which open thread (see "Rough moves" below) to pull on, or which new one he has in mind.
4. Before writing any character-voiced copy, read that character's entry in `~/Documents/AI/llm-models/CHARACTERS.md`.
5. Use the dev agents (see "Dev agent team" below) to draft, validate, and sharpen — don't do it all from the main session.

## Where we are (2026-04-20)

Single page: hero brand lockup, release block (_Echoes and Static_, 5/8, four outbound links), empty intro, copyright footer. MgOpen Moderna body, system sans display, dark palette. Clean, fast, functional — and sterile. It reads like a placeholder, not like the project.

## What the site is trying to do

- Be a place the music lives. Single first, LP when it lands. Music-first on the home page.
- Carry the project's _feeling_, not just its facts.
- Stay small. Hugo + plain CSS. No frameworks, no JS unless earned.
- Keep the cast **discoverable, not frontloaded** (per `AGENTS.md`).

## Where the feeling comes from

Ground any new copy or visual choice in the manual + canon. Don't invent:

- **Voice North Star** — `pi5:~/.openclaw/workspace/owner-operators/manual/1_MANUAL__STANDARD.md`. The metamodern stance lives here. Sample moves that are canon: _"We do not play shows. We deploy payloads."_ · _"A mistake, repeated with intention, becomes a hook."_ · _"Visible seams are the sincerity."_
- **Cast canon** — `~/Documents/AI/llm-models/CHARACTERS.md`. Front door for everyone below. Read the entry before writing in a character's voice.
- **Visual codex** — from `CHARACTERS.md`: black-and-white zine grit, photocopy smear, toner ghosts, ASCII halos, corrupted debug tables, errant UI fragments. Roadside Americana (truck stops, gas stations, laundromats) crossed with obsolete tech (Speak & Spell, CRT, dot-matrix). Riso accents — fluo pink, safety yellow, cornflower.
- **Archive** — `/Volumes/bananas/local-ai/source/chat-gpt-export/OWNER-OPERATORS/` (~119 dated conversations). Grep by topic for deeper context; don't bulk-load.

If something on the site feels too clean or too designed, it's probably wrong. Rough edges belong.

## Cast and crew available

### Characters (canon, discoverable on the site — not frontloaded)

- **Gloria.exe** — HR-polished surface, broken underneath. Stage-mode energy. Good for dated posts, diary-commit fragments, release microcopy with a seam. **Never self-IDs as AI.**
- **Louuy** — absence as image. One-line fragments, empty-room suggestions, liturgical flashes. Good candidate for a 404 page, a stray footer line, a `<!-- -->` in source. Rarely surfaces; weighs heavy when he does.
- **The Reader In Cultural Theory** — footnoted, over-precise, extradiegetic. He comments _on_ the piece, never _to_ it. Good for an annotation layer (release-notes footnotes, a manual gloss).
- **Nathan and the Churro Bros** — broadcast layer. _Exclusive Long Beach_ dispatches could live as their own slow stream, decoupled from the release cycle. Post-5/8 candidate.
- **Mote** — meta-tooling. **Stays out of the diegesis.** Fine in HTML comments, commit messages, deploy logs. Never a public byline.

### Dev agent team (easter-egg layer — never named publicly on the site)

Local ollama fine-tunes. Their fingerprints can appear on the site; their names cannot. Roles:

- **Silas** — precise code (CSS, Hugo templates, HTML).
- **Margot** — ASCII art, vignettes, tone-setting copy.
- **Ren** — structural reasoning, mermaid diagrams, nav.
- **June** — QA, validation, broken-link checks.
- **Jester** — tone contrarian; sharpens microcopy by roasting it first.

**Invocation.** All runnable locally as Ollama models. Fine-tuned tags and vanilla fallbacks both exist; run `ollama list` for the current set (names drift). Canonical tags at time of writing:

```
silas-7b-q8-ft     (fallback: silas — qwen2.5-coder:7b)
margot-1.7b-q8-ft  (fallback: margot — qwen3:1.7b)
ren-1.7b-q8-ft     (fallback: ren — qwen3:1.7b)
june-1.7b-q8-ft    (fallback: june — smollm2:1.7b-instruct)
jester-1.7b-q8-ft  (fallback: jester — qwen3:1.7b)
```

Two patterns:

```bash
# Quick one-shot
ollama run margot-1.7b-q8-ft "ASCII masthead, 'OWNER/OPERATORS', monospace, no frills, ~8 rows tall"

# Pipe in file context
cat themes/oo/layouts/index.html | ollama run jester-1.7b-q8-ft "Roast the microcopy. Keep it short."
```

Dossiers at `~/Documents/AI/llm-models/fine-tuning/<name>/dossier.md` if you need prompt shape or known quirks.

**Typical workflow.** Margot drafts tone → Silas implements → Jester sharpens → June validates → Ren checks structure. Don't run all five on every change; pick the ones the task needs. Treat their output as material — curate, don't polish (see "Push the tools until they break" below). Don't credit them on-page.

### Character models (Gloria, Louuy, Reader, Nathan)

Same pattern — `gloria-7b-q8-ft`, `louuy-7b-q4-ft`, `reader-7b-q8-ft`, `nathan-7b-q8-ft`. Use for voice checks or in-character drafting, then hand-edit. **Don't paste model output raw into canon** — but see the next section, because "raw" doesn't mean "polished." Read the character's `CHARACTERS.md` entry and their dossier first so you know what constraints to hold.

## Push the tools until they break

**This section is load-bearing. Read it before saying any model is "not good enough."**

The manual, Section 4 (_"Our relationship to technology"_): _"We refuse to fear our tools. We use AI not because our words are disposable, but because they are not sacred. They are raw material, shaped, broken, rebuilt until they sound like truth."_

And Section 2: _"A mistake, repeated with intention, becomes a hook."_

Translation for this site:

- **Glitch is material, not error.** When Margot's ASCII is lopsided, when Silas indents a block weirdly, when Jester's roast lands at a strange angle, when Gloria's post has a phrase that doesn't quite parse — the default move is **keep and curate**, not discard and retry until smooth.
- **Visible seams are the sincerity.** A Margot masthead that's a little off is more on-project than a clean one that reads like Figma. A corrupted debug-table aesthetic is in the codex. Scrubbing a model's fingerprints off its output is usually scrubbing the work off too.
- **"The models aren't good enough for this" is almost always the wrong conclusion.** The right question is: _what did they give me that I can use, curate, or repeat with intention?_ If a model produced something weird, weirdness is often the payload. Repeat a typo three times and it's a hook.
- **Polishing is a bigger risk than rough output.** Over-editing toward a neutral "professional" aesthetic is the failure mode to watch for. The site is not trying to look good; it's trying to look _honest and slightly wrong_, like a flyer photocopied one too many times.

What this does _not_ mean:

- Don't ship code that breaks the build. Silas sometimes hallucinates a Hugo function — check the build, not the vibe.
- Don't ship character copy that violates canon (e.g. Gloria self-IDing as AI). Canon beats glitch every time.
- Don't accept low-effort model output you didn't engage with. Reprompt, pipe through another agent, combine outputs, curate. Push the tool before you blame it.

**Rule of thumb.** Before you say "this model output isn't usable," ask: _could a version of this, kept on purpose, be a seam?_ If yes, it's material. If no — and you've genuinely looked — then move on.

## Rough moves (open threads, not a roadmap)

1. **Texture pass on the current home page.** Pull it from neutral toward the aesthetic without adding sections. Candidates: ASCII masthead, halftone plate, corner ornaments, a more honest release eyebrow. Start with Margot drafts, Silas implements, Jester sharpens. Keep the page performant and legible if textures fail.

2. **One line of voice.** A single sentence from the manual dropped somewhere — hero footnote, footer, or between sections. Not a paragraph. Let the line do the work.

3. **`/echoes-and-static`**. Song page: lyrics, key/BPM, release date, the outbound links. Room for a Gloria fragment or a Reader footnote — not both. Not required for 5/8; earns its keep later.

4. **404 in Louuy voice.** Empty room, coat on a chair, one line. Nobody links to it; people find it.

5. **`/manual`**. North Star manual rendered at a readable width, one long scroll, no nav. Reads like a tract. Direct port of `manual/1_MANUAL__STANDARD.md`, no adornment.

6. **Easter-egg layer.** Source-view artifacts: Mote-voice HTML comments on the build, a Ren mermaid diagram behind `/operations`, a `robots.txt` that rewards reading. Don't explain any of it.

7. **Dispatch channel (post-5/8).** Nathan's broadcasts as a lightweight static stream or RSS. Decoupled from the release cycle; its own cadence.

Anything concrete above is a candidate. Redirect freely.

## Guardrails

- **Music first** on the home page. Don't bury the release under texture.
- **Cast discoverable, not frontloaded.** No character names on the home hero.
- **Don't leak academic register** into hero/release copy — reserved for the Reader.
- **Don't surface the "multimedia performance piece" framing.** It's a band on the site.
- **Gloria never self-IDs as AI / language model / software.**
- **Mote stays out of the diegesis** — comments/logs only, never bylines.
- **Dev team stays unnamed publicly** — easter-egg only.
- **Don't invent canon.** Check `CHARACTERS.md` and the manual before putting words in any character's mouth. When in doubt, ask.
- **Brand is always `OWNER/OPERATORS`** — uppercase, literal slash.
- **Visible seams are the point.** If a design decision makes the page slicker, ask whether it's also hiding something that should be visible.

## When to kick it up to Eric

Don't decide these on your own — stop and ask:

- Picking which character "owns" a new section or page (Gloria vs. Louuy vs. Reader).
- Adding a new content section to the home page (song/cast/crew/about stubs).
- Any change to the outbound links in `data/links.yaml` beyond fixing a URL Eric supplied.
- A design decision that implies genre/scene positioning ("post-punk band from Boise" style copy).
- Deploying. Eric runs `deploy.sh` himself.
- Committing, and especially pushing. Local edits are fine; commits/pushes are Eric's call.
- Anything that would require inventing canon (a lyric, a character detail, a lineup fact).

When stuck on voice or fit, draft with the relevant model (character or dev agent), show Eric the draft, and let him redirect.

## What this plan is not

- Not a release blocker. The site as it stands works for DSP go-live 5/8.
- Not a spec. Iteration is expected — update this doc as directions harden.
- Not exhaustive. New canon (e.g. LP structure, highway-metaphor decisions) will surface moves not listed here.
