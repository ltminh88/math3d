# Phase 09: Stages — workshop (Xưởng Đo Đạc)

## Context links
- [plan.md](plan.md), [phase-00-design.md](phase-00-design.md) (stage table, no-time-pressure rule),
  [phase-01-measure-pools-stage-model-and-save-code-m3d4.md](phase-01-measure-pools-stage-model-and-save-code-m3d4.md),
  [phase-02-wider-item-pools.md](phase-02-wider-item-pools.md)
- `src/levels/workshop/workshop-stations.ts` (`WORKSHOP_ROUNDS = 6`, story
  slots), `src/levels/shared/level-stages.ts`
- `src/measurement/measurement-item-for-skill.ts`, `src/learning/skill-tiers.ts`
- `tests/e2e/workshop-level.spec.ts`, `tests/e2e/workshop-level-leak.spec.ts`
- Chapter 2 phase 07 (how this level was built).

## Overview
- Priority P1. Status **not started**. Depends on 01 (stage model) and 02
  (widened pools). Effort **7 h** (branch `muse/stages-workshop`, one PR
  into `main`).
- Give the workshop 5 stages (5 runs, 30 fresh rounds). Stage 1 is the
  current run, unchanged; the chain still unlocks after stage 1. One
  level, one PR (PR #1 review, point 3).

## Stage table — question type already exists, or new
Verified against the code. All five stages use mechanisms that already
exist: the workshop already tells its story in slots
(`workshop-stations.ts` `SLOTS`), and a stage only re-weights which slot
skills are picked. No new round type and no new wiring in this phase.

| Stage | Content (6 rounds) | Type | File / reuse |
|---|---|---|---|
| S1 | Ruler, fence (chu vi), tiles (diện tích), one more fence/tiling order, then balance, jug, thermometer | ĐÃ CÓ | `workshop-stations.ts` (`SLOTS`, `STATION_OF`) — stage 1 is today's run |
| S2 | Perimeter rect/square emphasis | ĐÃ CÓ | `workshop-stations.ts` (`meas-perimeter-rect`, `meas-perimeter-square`) — slot emphasis only |
| S3 | Area rect/square + counting emphasis | ĐÃ CÓ | `workshop-stations.ts` (`meas-area-rect`, `meas-area-square`, `meas-area-count`) — slot emphasis only |
| S4 | cm↔mm + gram/ml/temperature mixed | ĐÃ CÓ | `workshop-stations.ts` (`meas-mm-convert`, `meas-gram`, `meas-ml`, `meas-temperature`) — slot emphasis only |
| S5 | Mastery — fence word problems + mixed stations | ĐÃ CÓ | `workshop-stations.ts` (`meas-wp-fence` + weakest-first across stations) — slot emphasis only |

## Key Insights
- The workshop's run is a story told in slots: ruler → fence → tiles →
  one more order → two instruments. The weakest skill in each slot goes
  first. A stage re-weights the slots; the scene, stations and instruments
  are all reused as-is.
- Note the level's `tables: [10]` is a contract placeholder (the level
  drills `meas-*` skills, not tables). Stages do not change it.

## No time pressure (rule)
No countdown timer, no penalty for a slow answer, no copy that hurries the
child — in any stage. Measuring takes as long as it takes.

## Requirements
- **Stage plan**: extend `workshop-stations.ts` with a stage parameter
  (split into `workshop-stage-plan.ts` only if the file would pass 200
  lines): stage → slot emphasis; round count = the level's `rounds` (6).
- **No-repeat invariant**: no skill twice in one run. Unit tests assert it
  per stage per seed.
- **Stage dressing, cheap only**: inside the workshop's own diorama builder
  (workbench order props per stage). No world-scatter change, ≤ 60 draw
  calls, leak spec per stage.
- **Gate + celebration**: next uncompleted stage; gate pop-panel and
  celebration name the stage ("Chặng 2/5") in `vi` + `en`; replays keep
  best stars, pay per-question rewards only.
- **Tests**: unit tests per stage (skill subset, every number ≤ 100,
  deterministic per seed); e2e on all 4 projects playing stage 1 and one
  later stage via `seedStageProgress`, asserting `stageStars`, gate text,
  draw calls; leak spec extended to a later stage. Touch: ≥ 44 px,
  tap-only, no key hints on coarse pointers.
- **Preview deploy**: preview of this branch (no `--prod`) with its URL
  in the pull request.

## Visible changes in the world outside the levels
- Gate pop-panel for the workshop gate: "Chặng {n}/5" + next-stage line.
- Workshop celebration card: stage stars line.
- Nothing else in the world changes. The parity reviewer re-shoots the
  workshop gate pop-panel and the celebration card; these are intentional.

## Architecture
```
src/levels/workshop/workshop-stations.ts (mod: stage param)
src/levels/workshop/index.ts (mod: stages: 5)
src/levels/workshop/workshop-scene.ts (mod: accept ctx.stage)
src/levels/workshop/workshop-strings.ts (mod: "Chặng {n}/5" vi/en)
src/levels/workshop/workshop-celebration.ts (mod: stage stars line)
tests/e2e/workshop-level.spec.ts (mod: stage coverage)
tests/e2e/workshop-level-leak.spec.ts (mod: later stage)
```

## Related code files
- Modify: the workshop folder + its e2e specs listed above.
- Create: `workshop-stage-plan.ts` only if the stations file would pass
  200 lines.
- Delete: none.

## Implementation Steps
1. RED stage-plan tests (S1 identical to today's rounds for a fixed seed);
   GREEN.
2. Stage slot emphases (S2–S5); no-repeat tests.
3. Gate text + celebration stage line; replay path.
4. Leak spec for a later stage; draw-call check per stage.
5. Lint, typecheck, unit, build, golden `--check`, e2e on 4 projects,
   preview deploy + URL in PR.

## Todo list
- [ ] workshop stage plan (S1 parity test first)
- [ ] stage slot emphases, no-repeat tests
- [ ] gate / celebration stage text + replay
- [ ] e2e + leak, 4 projects
- [ ] preview deploy + URL in PR

## Success Criteria
- Stage 1 is behaviour-identical to today for a fixed seed.
- Stages 2–5 play end to end on all 4 projects by tap alone; no skill
  repeats inside a run; `stageStars` recorded.
- ≤ 60 draw calls per stage; no memory growth across enter/exit of any
  stage; every number ≤ 100.
- No countdown, no slow-answer penalty, no hurrying copy in any stage.
- Changed lines under ~800 without tests; PR carries a preview URL.

## Scope Contract
- Changed: the workshop folder + its e2e specs.
- Impacted: gate pop-panel text, celebration card, `stageStars` writes.
- Will verify: unit (stage plans, no-repeat invariant), e2e (4 projects,
  incl. leak), golden check, preview playthrough by the author.
- Deliberately skipped: other levels (phases 03–08, 10), daily (11),
  stickers (12), quest-card changes beyond the stage line (13), any
  world/scatter change, any new skill id.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Slot emphasis unbalances the story (e.g. S2 is all fences) | M | M | The story order (ruler → fence → tiles → instruments) is kept in every stage; emphasis only changes *which* skill fills a slot, never the slot order |
| Phase-02 shortfall lands here (a thin measurement skill) | M | M | Shortfall list from phase 02 adjusts the stage's slot mix before building, not after |

## Security Considerations
- None: no input parsing, no save-code change, no network.

## Next steps
- 10 (cave) after this lands; 13 integrates the gate/quest text; 14 runs
  the full 44-run chain e2e.
