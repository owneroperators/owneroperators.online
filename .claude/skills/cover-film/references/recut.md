# Operating the lab — common asks

All commands run from `~/Documents/dev/oo-band/gen/cover-lab/`. Current cut:
`timeline-v4.yaml` → `composites/cover-film-v4.mp4` (63s loop). Every
generation is a journaled run under `runs/<stamp>-...>/` with a
`recipe.yaml`; nothing is ever overwritten.

## Re-cut the film (pacing, swaps, burst density)

```bash
# edit the timeline YAML, then:
python3 scripts/assemble.py --timeline timeline-v4.yaml --out composites/new.mp4
```

- More/less glitch: `sprinkle.bursts` (42 in v4; 60 was ~30% louder).
- Different scatter: `sprinkle.seed`.
- Burst texture: `min_frames`/`max_frames`/`stutter_prob`.
- Pacing: the `still:` holds. Longer stills = cheaper file, calmer film.
- New event: `run:` + its `return:` clip (generate the return with
  `transform.py --tail-of <run> --end-cover` if it doesn't exist).

## Re-roll one region (nothing else changes)

```bash
python3 scripts/transform.py --replay runs/<id> --seed 7        # gen, new take
python3 scripts/proc.py --region <r> --effect <fx> --sp <n>     # procedural
```

Procedural effects: `mvdrift mvsine dcstreak dcdecay datamosh` (ffglitch),
`sort scanroll trails chroma` (glitchgpu Metal), `halftone` (numpy). All
free/local. Gen video runs bill Replicate (~$0.10–0.25 each).

## Verify a cut before shipping

- **Loop seam**: first-vs-last frame mean abs diff ≤ ~2
  (`ffmpeg -sseof -0.08 ... -frames:v 1` vs frame 0, numpy mean).
- **Airspace**: assemble logs "gen-event airspace respected"; if paranoid,
  recompute the plan with `plan_bursts` and assert no `boxes_clash` against
  event windows (there's a worked example in the session that built v4).
- **Motion sanity**: frame-diff _inside a region's box_, not whole-frame —
  whole-frame numbers dilute ~30× and have produced false "it's frozen"
  verdicts twice.

## Ship

`.claude/skills/cover-film/scripts/ship.sh <cut.mp4>` from the site repo
root — 1080px/crf-23 encode → `static/video/cover-film.mp4`. Committing is
a separate, deliberate step.
