# Phase 07: Stages — garden (Khu Vườn Quy Luật)

## Context links
- [plan.md](plan.md), [phase-00-design.md](phase-00-design.md) (stage table, no-time-pressure rule),
  [phase-01-measure-pools-stage-model-and-save-code-m3d4.md](phase-01-measure-pools-stage-model-and-save-code-m3d4.md),
  [phase-02-wider-item-pools.md](phase-02-wider-item-pools.md)
- `src/levels/garden/garden-round-plan.ts` (kinds rotate, tier from box),
  `src/levels/shared/level-stages.ts`
- `src/reasoning/reasoning-item-for-skill.ts`, `src/learning/skill-tiers.ts`
- `tests/e2e/garden-level.spec.ts`, `tests/e2e/garden-level-leak.spec.ts`
- Chapter 2 phase 05 (how this level was built).

## Overview
- Priority P1. Status **not started**. Depends on 01 (stage model) and 02
  (widened pools — this level's rounds *are* the `sk:` generators, so
  thin pools would show immediately). Effort **7 h** (branch
  `muse/stages-garden`, one PR into `main`).
- Give the garden 5 stages (5 runs, 30 fresh rounds). Stage 1 is the
  current run, unchanged; the chain still unlocks after stage 1. One
  level, one PR (PR #1 review, point 3).

## Stage table — question type already exists, or new
Verified against the code. All five stages use mechanisms that already
exist; a stage is a skill-subset + tier-floor choice in the existing
round planner — no new round type and no new wiring in this phase.

| Stage | Content (6 rounds) | Type | File / reuse |
|---|---|---|---|
| S1 | Rotating kinds: flower-row patterns, watering-can balance, seed-bag expressions (8 skills) | ĐÃ CÓ | `garden-round-plan.ts` (`pattern \| balance \| bag`) — stage 1 is today's run |
| S2 | Tier-2 emphasis: larger pattern steps, two-step unknowns | ĐÃ CÓ | `garden-round-plan.ts` + `skill-tiers.ts` (tier follows the box) — subset + tier floor only |
| S3 | Brackets + expressions from stories emphasis | ĐÃ CÓ | `garden-round-plan.ts` (`bag`: `expr-order`, `expr-brackets`, `expr-from-story`) — subset only |
| S4 | Mixed patterns, tier 3 where earned | ĐÃ CÓ | `garden-round-plan.ts` — subset + tier floor only |
| S5 | Mastery — weakest-first across all 8 skills | ĐÃ CÓ | `garden-round-plan.ts` (least-used fallback) — subset only |

## Key Insights
- The garden already plans from *skill* pools with the tier following the
  Leitner box (`skillTierOf`). A stage here is a *skill-subset* choice,
  which is a smaller change than chapter 1's format work. The risk is
  the opposite: with only 8 skills, a stage can repeat a skill twice in
  one run. The planner already avoids that (least-used fallback); the
  stage plan keeps that invariant and the unit tests assert it per stage.
- Tier floors are *floors for the format*, not for the box: a skill at
  box 1 stays tier 1 even in stage 4. A stage that forced tier 3 on a
  box-1 skill would break the "tiers come from the box" rule and the hint
  ladders built for tier 1.

## No time pressure (rule)
No countdown timer, no penalty for a slow answer, no copy that hurries the
child — in any stage.

## Requirements
- **Stage plan**: extend `garden-round-plan.ts` with a stage parameter
  (split into `garden-stage-plan.ts` only if the file would pass 200
  lines): stage → skill subset + tier floor; round count = the level's
  `rounds` (6).
- **No-repeat invariant**: no skill appears twice in one run. Unit tests
  assert it per stage per seed.
- **Stage dressing, cheap only**: inside the garden's own diorama builder
  (flower colours per stage). No world-scatter change, ≤ 60 draw calls,
  leak spec per stage.
- **Gate + celebration**: next uncompleted stage; gate pop-panel and
  celebration name the stage ("Chặng 2/5") in `vi` + `en`; replays keep
  best stars, pay per-question rewards only.
- **Tests**: unit tests per stage (skill subset, tier floor, no repeat,
  every number ≤ 100, deterministic per seed); e2e on all 4 projects
  playing stage 1 and one later stage via `seedStageProgress`, asserting
  `stageStars`, gate text, draw calls; leak spec extended to a later
  stage. Touch: ≥ 44 px, tap-only, no key hints on coarse pointers.
- **Preview deploy**: preview of this branch (no `--prod`) with its URL
  in the pull request.

## Visible changes in the world outside the levels
- Gate pop-panel for the garden gate: "Chặng {n}/5" + next-stage line.
- Garden celebration card: stage stars line.
- Nothing else in the world changes. The parity reviewer re-shoots the
  garden gate pop-panel and the celebration card; these are intentional.

## Architecture
```
src/levels/garden/garden-round-plan.ts (mod: stage param)
src/levels/garden/index.ts (mod: stages: 5)
src/levels/garden/garden-scene.ts (mod: accept ctx.stage)
src/levels/garden/garden-strings.ts (mod: "Chặng {n}/5" vi/en)
src/levels/garden/garden-celebration.ts (mod: stage stars line)
tests/e2e/garden-level.spec.ts (mod: stage coverage)
tests/e2e/garden-level-leak.spec.ts (mod: later stage)
```

## Related code files
- Modify: the garden folder + its e2e specs listed above.
- Create: `garden-stage-plan.ts` only if the round-plan file would pass
  200 lines.
- Delete: none.

## Implementation Steps
1. RED stage-plan tests (S1 identical to today's rounds for a fixed seed);
   GREEN.
2. Stage subsets + tier floors (S2–S5); no-repeat tests.
3. Gate text + celebration stage line; replay path.
4. Leak spec for a later stage; draw-call check per stage.
5. Lint, typecheck, unit, build, golden `--check`, e2e on 4 projects,
   preview deploy + URL in PR.

## Todo list
- [ ] garden stage plan (S1 parity test first)
- [ ] stage subsets + tier floors, no-repeat tests
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
- Changed: the garden folder + its e2e specs.
- Impacted: gate pop-panel text, celebration card, `stageStars` writes.
- Will verify: unit (stage plans, no-repeat invariant), e2e (4 projects,
  incl. leak), golden check, preview playthrough by the author.
- Deliberately skipped: other levels (phases 03–06, 08–10), daily (11),
  stickers (12), quest-card changes beyond the stage line (13), any
  world/scatter change, any new skill id (if a stage needs a skill that
  does not exist, that is a phase-01 failure — stop and re-open phase 01,
  do not invent an id here).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| A stage repeats the same skill twice in a run | M | M | No-repeat unit test per stage per seed; least-used fallback kept |
| Tier floor misread as "stage sets the tier" | M | M | Tier always from `skillTierOf(box)`; stage only picks the skill subset — asserted in tests |
| Phase-02 shortfall lands here (a thin skill) | M | M | Shortfall list from phase 02 adjusts the stage's skill mix before building, not after |

## Security Considerations
- None: no input parsing, no save-code change, no network.

## Next steps
- 08 (valley) after this lands; 13 integrates the gate/quest text; 14
  runs the full 44-run chain e2e.
