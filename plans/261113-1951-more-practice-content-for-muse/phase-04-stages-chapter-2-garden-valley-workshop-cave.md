# Phase 04: Stages, chapter 2 — garden, valley, workshop, cave

## Context links
- [plan.md](plan.md), [phase-00-design.md](phase-00-design.md) (stage table),
  [phase-01-measure-pools-stage-model-and-save-code-m3d4.md](phase-01-measure-pools-stage-model-and-save-code-m3d4.md),
  [phase-02-wider-item-pools.md](phase-02-wider-item-pools.md)
- `src/levels/garden/garden-round-plan.ts` (kinds rotate, tier from box),
  `src/levels/valley/valley-round-plan.ts`,
  `src/levels/workshop/workshop-stations.ts` (`WORKSHOP_ROUNDS = 6`),
  `src/levels/cave/cave-scene.ts` (`CHAMBER_COUNT`), `cave-chamber-formats.ts`
- `src/reasoning/reasoning-item-for-skill.ts`,
  `src/geometry/geometry-item-for-skill.ts`,
  `src/measurement/measurement-item-for-skill.ts`, `src/learning/skill-tiers.ts`
- `tests/e2e/garden-level.spec.ts`, `valley-level.spec.ts`,
  `workshop-level.spec.ts`, `cave-level.spec.ts` (+ leak specs)
- Chapter 2 phases 05–08 (how each of these levels was built).

## Overview
- Priority P1. Status **not started**. Depends on 01 (stage model) and 02
  (widened pools — these levels' rounds *are* the `sk:` generators, so
  thin pools would show immediately). Parallel with 03 by level folder
  (this phase owns `garden/`, `valley/`, `workshop/`, `cave/`).
- Give the four chapter-2 levels 5 stages each (20 runs, 125 fresh
  rounds). Stage 1 is the current run, unchanged; stages 2–5 raise the
  tier floor, rotate the skill emphasis and change the round mix inside
  the existing scenes.

## Key Insights
- These levels already plan from *skill* pools, not fact pools
  (`garden-round-plan.ts`, `valley-round-plan.ts`, workshop stations,
  cave chambers), and the tier already follows the Leitner box
  (`skillTierOf`). A stage here is therefore mostly a *skill-subset +
  tier-floor* choice, which is a smaller change than chapter 1's format
  work — the risk is the opposite: with only 8–12 skills per level, a
  stage can run out of distinct skills and repeat the same skill twice in
  one run. The round planners already avoid that (least-used fallback in
  the garden planner); the stage plans must keep that invariant and the
  unit tests must assert it per stage.
- The cave is the mixed level: it draws weakest-first across *all*
  reasoning/geometry/measurement skills. Its stages are *emphasis*
  stages (word problems, then logic, then geometry+measurement), not new
  skills — the cave must never introduce a skill the child has not met
  in its home level (garden/valley/workshop) or in a reasoning round.
  The stage plan enforces that by intersecting the cave's pool with
  skills that have attempts > 0.
- Workshop's `tables: [10]` is a contract placeholder (the level drills
  `meas-*` skills, not tables). Stages do not change it.
- Tier floors are *floors for the format*, not for the box: a skill at
  box 1 stays tier 1 even in stage 4 (its box decides). A stage that
  forced tier 3 on a box-1 skill would break the "tiers come from the
  box" rule and the hint ladders built for tier 1.

## Requirements
- **Stage definitions** (extend each level's existing `*-round-plan.ts`
  with a stage parameter; new `*-stage-plan.ts` only if the file would
  pass 200 lines):
  - **garden** (6 rounds/stage, 8 skills): S1 rotating kinds as today.
    S2 tier-2 emphasis (patterns with larger steps, balance with
    two-step unknowns). S3 brackets + `expr-from-story` emphasis. S4
    mixed patterns, tier 3 where earned. S5 mastery — weakest-first
    across all 8 skills.
  - **valley** (6, 9 `geo-*` skills): S1 as today. S2 count-right-angles
    + shape-count emphasis. S3 rotated figures (tier 2+) + solid parts.
    S4 choose-all geometry. S5 mastery mixed.
  - **workshop** (6, 12 `meas-*` skills): S1 as today (ruler, fence,
    tiles, balance/jug/thermometer). S2 perimeter rect/square emphasis.
    S3 area rect/square + counting. S4 cm↔mm + gram/ml/temperature
    mixed. S5 mastery — fence word problems + mixed stations.
  - **cave** (7 chambers): S1 weakest-first mixed (today). S2 two-step
    word problems emphasis. S3 logic (choose-all, true/false + fix).
    S4 geometry + measurement mixed. S5 mastery — weakest-first, tier 3
    where earned.
- **No-repeat invariant**: no skill appears twice in one run unless the
  stage's skill subset is smaller than the run length (cave S2/S3
  subsets are large enough — assert it; garden's 8 skills over 6 rounds
  already satisfies it). Unit tests assert it per stage per seed.
- **Stage dressing, cheap only**: inside each level's own diorama builder
  (garden: flower colours per stage; valley: stone-board layout variants;
  workshop: workbench order props; cave: crystal colours). No
  world-scatter change, ≤ 60 draw calls, leak specs per stage.
- **Gate + celebration**: same contract as phase 03 ("Chặng {n}/5",
  replay keeps best stars, first-completion bonus on stage 1 only).
- **Tests**: unit tests per stage plan (skill subset, tier floor, no
  repeat, every number ≤ 100, deterministic per seed); e2e per level on
  all 4 projects playing stage 1 and one later stage via
  `seedStageProgress`, asserting `stageStars`, gate text, draw calls;
  leak spec extended to a later stage. Touch rules as phase 03.

## Architecture
```
src/levels/garden/garden-round-plan.ts (mod: stage param)
src/levels/valley/valley-round-plan.ts (mod: stage param)
src/levels/workshop/workshop-stations.ts (mod: stage param)
src/levels/cave/cave-chamber-formats.ts (mod: stage param)
src/levels/{garden,valley,workshop,cave}/index.ts (mod: stages: 5)
src/levels/{...}/*-scene.ts, *-strings.ts, *-celebration.ts (mod: stage text)
tests/e2e/{garden,valley,workshop,cave}-level.spec.ts (mod: stage coverage)
tests/e2e/{garden,valley,workshop,cave}-level-leak.spec.ts (mod: later stage)
```
If a round-plan file would pass 200 lines, the stage mapping splits
into `*-stage-plan.ts` (pure) instead.

## Related code files
- Modify: the four level folders + their e2e specs listed above.
- Create: stage-plan files only if the split is needed.
- Delete: none.

## Implementation Steps
1. Garden first (the pattern in chapter 2 phase 05 is the template):
   RED stage-plan tests (S1 identical to today's rounds for a fixed
   seed); GREEN.
2. Valley, workshop, cave in that order; each its own commit, unit +
   e2e green before the next.
3. Cave pool-intersection rule (only skills with attempts > 0) — RED
   test with a fresh profile (cave S2 must not invent an unseen skill);
   GREEN.
4. Gate text + celebration stage line; replay path.
5. Leak specs per later stage; draw-call check per stage.
6. Lint, typecheck, unit, build, golden `--check`, e2e on 4 projects.

## Todo list
- [ ] garden stage plan (S1 parity test first)
- [ ] valley stage plan
- [ ] workshop stage plan
- [ ] cave stage plan (+ pool-intersection rule)
- [ ] gate / celebration stage text + replay
- [ ] e2e + leak per level, 4 projects

## Success Criteria
- Stage 1 of every level is behaviour-identical to today for a fixed seed.
- Stages 2–5 play end to end on all 4 projects by tap alone; no skill
  repeats inside a run (unless the subset forces it, which no stage
  does); `stageStars` recorded.
- ≤ 60 draw calls per stage; no memory growth across enter/exit of any
  stage; every number ≤ 100.
- Changed lines per PR under ~800 without tests (split by level if needed:
  garden+valley, then workshop+cave).

## Scope Contract
- Changed: four level folders + their e2e specs.
- Impacted: gate/celebration text, `stageStars` writes.
- Will verify: unit (stage plans, no-repeat invariant), e2e (4 projects,
  incl. leak), golden check.
- Deliberately skipped: chapter-1 levels (phase 03), daily (05), stickers
  (06), quest-card changes (07), any world/scatter change, any new skill
  id (if a stage needs a skill that does not exist, that is a phase-01
  failure — stop and re-open phase 01, do not invent an id here).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| A stage repeats the same skill twice in a run | M | M | No-repeat unit test per stage per seed; least-used fallback kept |
| Cave introduces an unseen skill | M | H | Pool-intersection rule + RED test with a fresh profile |
| Tier floor misread as "stage sets the tier" | M | M | Tier always from `skillTierOf(box)`; stage only picks the skill subset and the format — asserted in tests |
| Phase-02 shortfall lands here (a thin skill) | M | M | Shortfall list from phase 02 adjusts the stage's skill mix before building, not after |

## Security Considerations
- None: no input parsing, no save-code change, no network.

## Next steps
- 07 integrates the gate/quest text; 08 runs the full 44-run chain e2e.
