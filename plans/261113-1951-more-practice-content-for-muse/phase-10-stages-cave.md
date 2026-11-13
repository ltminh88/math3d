# Phase 10: Stages — cave (Hang Đố Vui)

## Context links
- [plan.md](plan.md), [phase-00-design.md](phase-00-design.md) (stage table, no-time-pressure rule),
  [phase-01-measure-pools-stage-model-and-save-code-m3d4.md](phase-01-measure-pools-stage-model-and-save-code-m3d4.md),
  [phase-02-wider-item-pools.md](phase-02-wider-item-pools.md)
- `src/levels/cave/cave-chamber-formats.ts` (17 skills, 6 formats,
  required mix), `src/levels/shared/level-stages.ts`
- `src/reasoning/reasoning-item-for-skill.ts`,
  `src/geometry/geometry-item-for-skill.ts`,
  `src/measurement/measurement-item-for-skill.ts`
- `tests/e2e/cave-level.spec.ts`, `tests/e2e/cave-level-leak.spec.ts`
- Chapter 2 phase 08 (how this level was built).

## Overview
- Priority P1. Status **not started**. Depends on 01 (stage model) and 02
  (widened pools). Effort **8 h** (branch `muse/stages-cave`, one PR into
  `main`).
- Give the cave 5 stages (5 runs, 35 fresh rounds). Stage 1 is the
  current run, unchanged — and the cave is the last stage of the whole
  chain, so stage 1's closing card ("Bạn đã qua cả chín chặng!") must
  still appear exactly as today. One level, one PR (PR #1 review,
  point 3).

## Stage table — question type already exists, or new
Verified against the code. All five stages use the chamber formats that
already exist; a stage is an *emphasis* choice over the 17 cave skills.

| Stage | Content (7 chambers) | Type | File / reuse |
|---|---|---|---|
| S1 | Weakest-first mixed: one word problem, one remainder, one choose-all, one true/false + fix, one geometry/measurement item, topped up (17 skills) | ĐÃ CÓ | `cave-chamber-formats.ts` (formats `word \| remainder \| choose-all \| tf-explain \| expression \| geo-meas`, `REQUIRED_FORMATS`) — stage 1 is today's run |
| S2 | Two-step word problems emphasis | ĐÃ CÓ | `cave-chamber-formats.ts` (`word`: `wp-times-then-add`, `wp-divide-then-add`, `wp-more-less-then-total`, `wp-unit-then-times`, `wp-times-compare`, `wp-difference-compare`) — emphasis only |
| S3 | Logic emphasis (choose-all, true/false + fix) | ĐÃ CÓ | `cave-chamber-formats.ts` (`choose-all`, `tf-explain`) — emphasis only |
| S4 | Geometry + measurement mixed | ĐÃ CÓ | `cave-chamber-formats.ts` (`geo-meas`: `meas-wp-fence`, `meas-perimeter-rect`, `meas-area-rect`, `geo-radius-diameter`) — emphasis only |
| S5 | Mastery — weakest-first, tier 3 where earned | ĐÃ CÓ | `cave-chamber-formats.ts` (`planCaveSkills`: weakest box first, no repeats) — emphasis only |

## Key Insights
- The cave is the mixed level: it draws weakest-first across *all*
  reasoning/geometry/measurement skills, with a required format mix
  (`REQUIRED_FORMATS`) and no format twice in a row. Its stages are
  *emphasis* stages, not new skills — the cave must never introduce a
  skill the child has not met in its home level (garden/valley/workshop)
  or in a reasoning round. The stage plan enforces that by intersecting
  the cave's pool with skills that have attempts > 0.
- The closing card after stage 1 stays exactly as today. Later stages
  end with a stage celebration ("Chặng {n}/5"), not a second closing
  card — the chain is finished once, at the end of stage 1.

## No time pressure (rule)
No countdown timer, no penalty for a slow answer, no copy that hurries the
child — in any stage.

## Requirements
- **Stage plan**: extend `cave-chamber-formats.ts` with a stage parameter
  (split into `cave-stage-plan.ts` only if the file would pass 200
  lines): stage → format emphasis; chamber count = the level's `rounds`
  (7).
- **Pool-intersection rule**: a stage's pool is the cave's skills
  intersected with skills the child has attempted. Unit test with a fresh
  profile: S2 must not invent an unseen skill.
- **No-repeat invariant**: no format twice in a row, no skill twice in
  one run (both already hold in `cave-chamber-formats.ts`; unit tests
  assert them per stage per seed).
- **Stage dressing, cheap only**: inside the cave's own diorama builder
  (crystal colours per stage). No world-scatter change, ≤ 60 draw calls,
  leak spec per stage.
- **Gate + celebration**: next uncompleted stage; gate pop-panel and
  celebration name the stage ("Chặng 2/5") in `vi` + `en`; replays keep
  best stars, pay per-question rewards only. The closing card appears
  after stage 1 only.
- **Tests**: unit tests per stage (format emphasis, pool intersection,
  no repeat, every number ≤ 100); e2e on all 4 projects playing stage 1
  and one later stage via `seedStageProgress`, asserting `stageStars`,
  gate text, closing card after stage 1, draw calls; leak spec extended
  to a later stage. Touch: ≥ 44 px, tap-only, no key hints on coarse
  pointers.
- **Preview deploy**: preview of this branch (no `--prod`) with its URL
  in the pull request.

## Visible changes in the world outside the levels
- Gate pop-panel for the cave gate: "Chặng {n}/5" + next-stage line.
- Cave celebration card: stage stars line (stage 1 keeps the closing card
  as today).
- Nothing else in the world changes. The parity reviewer re-shoots the
  cave gate pop-panel and the celebration card; these are intentional.

## Architecture
```
src/levels/cave/cave-chamber-formats.ts (mod: stage param)
src/levels/cave/index.ts (mod: stages: 5)
src/levels/cave/cave-scene.ts (mod: accept ctx.stage)
src/levels/cave/cave-strings.ts (mod: "Chặng {n}/5" vi/en)
src/levels/cave/cave-celebration.ts (mod: stage stars line; closing card S1 only)
tests/e2e/cave-level.spec.ts (mod: stage coverage)
tests/e2e/cave-level-leak.spec.ts (mod: later stage)
```

## Related code files
- Modify: the cave folder + its e2e specs listed above.
- Create: `cave-stage-plan.ts` only if the formats file would pass
  200 lines.
- Delete: none.

## Implementation Steps
1. RED stage-plan tests (S1 identical to today's chambers for a fixed
   seed, closing card intact); GREEN.
2. Stage format emphases (S2–S5) + pool-intersection rule.
3. Gate text + celebration stage line; replay path.
4. Leak spec for a later stage; draw-call check per stage.
5. Lint, typecheck, unit, build, golden `--check`, e2e on 4 projects,
   preview deploy + URL in PR.

## Todo list
- [ ] cave stage plan (S1 parity test + closing card first)
- [ ] stage format emphases + pool-intersection rule
- [ ] gate / celebration stage text + replay
- [ ] e2e + leak, 4 projects
- [ ] preview deploy + URL in PR

## Success Criteria
- Stage 1 is behaviour-identical to today for a fixed seed, closing card
  included.
- Stages 2–5 play end to end on all 4 projects by tap alone; no skill
  introduces itself unseen; `stageStars` recorded.
- ≤ 60 draw calls per stage; no memory growth across enter/exit of any
  stage; every number ≤ 100.
- No countdown, no slow-answer penalty, no hurrying copy in any stage.
- Changed lines under ~800 without tests; PR carries a preview URL.

## Scope Contract
- Changed: the cave folder + its e2e specs.
- Impacted: gate pop-panel text, celebration card, `stageStars` writes.
- Will verify: unit (stage plans, pool intersection, no-repeat), e2e
  (4 projects, incl. leak), golden check, preview playthrough by the
  author.
- Deliberately skipped: other levels (phases 03–09), daily (11), stickers
  (12), quest-card changes beyond the stage line (13), any world/scatter
  change, any new skill id (if a stage needs a skill that does not exist,
  that is a phase-01 failure — stop and re-open phase 01, do not invent
  an id here).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Cave introduces an unseen skill | M | H | Pool-intersection rule + RED test with a fresh profile |
| A second closing card after a later stage confuses the chain | M | M | Closing card is stage-1-only by construction; e2e asserts S2 ends with the stage celebration, not the closing card |
| Stage 1 accidentally changes (closing card!) | M | H | S1 parity unit test + existing cave e2e untouched for S1 |

## Security Considerations
- None: no input parsing, no save-code change, no network.

## Next steps
- 11 (daily) after this lands; 13 integrates the gate/quest text; 14
  runs the full 44-run chain e2e.
