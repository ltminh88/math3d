# Phase 03: Stages, chapter 1 — field, forest, city, tower

## Context links
- [plan.md](plan.md), [phase-00-design.md](phase-00-design.md) (stage table),
  [phase-01-measure-pools-stage-model-and-save-code-m3d4.md](phase-01-measure-pools-stage-model-and-save-code-m3d4.md)
  (stage model, `level-stages.ts`, host `ctx.stage`)
- `src/levels/field/*` (`field-round-flow.ts`, `field-reasoning-round.ts`),
  `src/levels/forest/*` (`forest-round-flow.ts`, `forest-remainder-round.ts`,
  `forest-fact-variety.ts`), `src/levels/city/*` (`city-round-flow.ts`,
  `city-compare-round.ts`), `src/levels/tower/*` (`tower-round-flow.ts`,
  `tower-question-formats.ts`, `tower-expression-floor.ts`)
- `src/levels/shared/level-stages.ts`, `level-run-tally.ts`
  (`starsFor`: 3 stars ≥ 90% first-try clean, ≤ 1 hint), `step-miss-budget.ts`
- `src/learning/session-planner.ts` (`planSession`), `skill-tiers.ts`
- `tests/e2e/field-level.spec.ts`, `forest-level.spec.ts`,
  `city-level.spec.ts`, `tower-level.spec.ts` (+ `*-level-leak.spec.ts`)

## Overview
- Priority P1. Status **not started**. Depends on 01 (stage model). Parallel
  with 04 by level folder (this phase owns `field/`, `forest/`, `city/`,
  `tower/` + their e2e specs; 04 owns the chapter-2 folders).
- Give the four tables levels 6 stages each (24 runs, 132 fresh rounds).
  Stage 1 is the current run, unchanged in content, order and rewards; the
  chain still unlocks after stage 1. Stages 2–6 vary the round *format*,
  skill subset and tier floor inside the level's existing scene — no new
  3D world, no new diorama geometry beyond re-arranging existing props.

## Key Insights
- The planner already takes a pool and a length (`planSession(pool,
  length)`), and each level already has a `*-round-plan` that turns planned
  facts into rounds. A stage is therefore a *different call* to the same
  machinery (different pool slice / format mix / tier floor), not a new
  level. The per-level round-plan file is where stage content lives; the
  scene, camera, hints and celebration stay shared.
- The reasoning round that chapter 2 added ("once a child shows mastery,
  each level ends its run with one reasoning round") is a stage lever, not
  a fixed slot: in stage 1 it stays mastery-gated exactly as today; in
  later stages it becomes a regular round kind once the box says so.
- Field's pool is the thinnest in the game (tables 3, 4 → 18 mul facts),
  so its stages lean hardest on *format* variety (planting, commutativity,
  missing factor, word problem, recall) rather than new facts. If phase 01
  [K] finds field has no missing-factor format, that format is built here
  as a new round type in `field-round-flow.ts` — the one genuinely new
  interaction in this phase.
- Stars are per stage (`stageStars`), best-kept. The celebration card
  shows the stage's stars and "Chặng {n}/6"; the first-completion bonus
  (+50 XP / +10 coins) is paid on stage 1 only (phase 01).

## Requirements
- **Stage definitions** (one `*-stage-plan.ts` per level, pure, seeded;
  each stage = pool + format mix + tier floor + round count = the level's
  `rounds`):
  - **field** (5 rounds/stage): S1 planting grid, build-then-total (today).
    S2 commutativity — same plot, equation in both orders. S3 missing
    factor ("3 × ? = 12") on the plot. S4 word problems, tables 3–4
    (phase-02 contexts). S5 recall speed — equation only, no planting
    drag, faster tempo. S6 mastery — mixed 3–4 + the reasoning round.
  - **forest** (5): S1 share/pack/family (today). S2 remainders as regular
    rounds (`div-rem-floor`/`ceil`, tier from box). S3 fact families
    (×/÷ inverse) emphasis. S4 word problems — sharing in context. S5
    pack speed, larger dividends (≤ 100). S6 mastery — mixed 2–5.
  - **city** (5): S1 parcel delivery + lighting windows (today). S2
    reverse delivery (÷). S3 compare rounds (existing
    `city-compare-round.ts`). S4 word problems, tables 6–9. S5 two-step
    delivery (× then +/−, small, ≤ 100). S6 mastery — mixed 6–9.
  - **tower** (7): S1 mixed ×/÷, weak first (today). S2 expression floors
    (existing `tower-expression-floor.ts`). S3 true/false floors. S4
    word-problem floors. S5 remainder floors. S6 mastery climb — all
    tables 2–9, tier 3 where earned.
- **Stage dressing, cheap only**: within each level's own diorama builder
  (e.g. field: crop/plot tint per stage; forest: different animal friends
  already in `animal-friend-factory.ts`; city: day/dusk window lights;
  tower: floor banners). No world-scatter change, no new meshes that push
  a level over 60 draw calls, no memory growth across enter/exit (leak
  specs run per stage, not just stage 1).
- **Gate + celebration**: entering a gate plays the next uncompleted stage
  (`nextStage`); the gate pop-panel and the celebration card name the stage
  ("Chặng 2/6", "Chặng 3/6" …) in `vi` (source) + `en`. A completed stage
  can be replayed from the gate (replay keeps the best stars; replay pays
  per-question rewards only).
- **Planner behaviour per stage**: later stages plan from the level's full
  pool with the stage's tier floor (a skill/fact below the floor is
  practised at the floor's *format* but its own box still decides the
  tier — tiers come from the box, never from the stage number). Due/weak
  facts come first, as `planSession` already does; stages never reset a
  Leitner box.
- **Tests**: unit tests for each `*-stage-plan.ts` (stage → pool/format,
  deterministic for a seed, no repeated format twice in a row within a
  run where avoidable, every number ≤ 100); e2e per level on all 4
  projects (desktop, phone, tablet portrait/landscape) playing stage 1
  *and* one later stage via the `seedStageProgress` hook, asserting
  `stageStars` in the store, gate text, and ≤ 60 draw calls; leak spec
  extended to enter/exit a later stage. Touch: every new control ≥ 44 px,
  tap-only playable, no key hints on `(pointer: coarse)`.

## Architecture
```
src/levels/field/field-stage-plan.ts (new, pure)
src/levels/forest/forest-stage-plan.ts (new, pure)
src/levels/city/city-stage-plan.ts (new, pure)
src/levels/tower/tower-stage-plan.ts (new, pure)
src/levels/{field,forest,city,tower}/index.ts (mod: stages: 6)
src/levels/{...}/*-round-flow.ts, *-scene.ts (mod: accept ctx.stage)
src/levels/{...}/*-strings.ts (mod: "Chặng {n}/6" vi/en)
src/levels/{...}/*-celebration.ts (mod: stage stars line)
tests/e2e/{field,forest,city,tower}-level.spec.ts (mod: stage coverage)
tests/e2e/{field,forest,city,tower}-level-leak.spec.ts (mod: later stage)
```
Each level's scene keeps its own chunk; no shared-level code is forked.
Files < 200 lines, kebab-case.

## Related code files
- Modify: the four level folders + their e2e specs listed above.
- Create: the four `*-stage-plan.ts` files (+ co-located tests).
- Delete: none.

## Implementation Steps
1. Field first (smallest pool, hardest format problem): RED stage-plan
   tests (S1 identical to today's rounds for a fixed seed — parity of
   stage 1 is a test, not an assumption); GREEN.
2. Forest, city, tower in that order; each lands as its own commit with
   its unit + e2e green before the next starts.
3. Missing-factor format (field S3) only if phase 01 [K] says it does not
   exist: build it as a round type with its own hint ladder (rung ≥ 2
   never shows the answer) and touch controls.
4. Gate text + celebration stage line; replay path (best stars kept).
5. Leak specs per later stage; draw-call check per stage.
6. Lint, typecheck, unit, build, golden `--check` (no world change:
   byte-identical expected), e2e on 4 projects.

## Todo list
- [ ] field stage plan (S1 parity test first)
- [ ] forest stage plan
- [ ] city stage plan
- [ ] tower stage plan
- [ ] missing-factor format (only if [K] says it is missing)
- [ ] gate / celebration stage text + replay
- [ ] e2e + leak per level, 4 projects

## Success Criteria
- Stage 1 of every level is behaviour-identical to today for a fixed seed
  (unit test proves it; the existing e2e specs still pass unmodified for
  stage 1).
- Stages 2–6 play end to end on all 4 projects by tap alone; `stageStars`
  recorded; gates show the next stage; replays keep best stars.
- ≤ 60 draw calls per stage; no memory growth across enter/exit of any
  stage; every number a child sees ≤ 100.
- Changed lines per PR under ~800 without tests (split by level if needed:
  field+forest, then city+tower).

## Scope Contract
- Changed: four level folders (stage plans, scenes accept `ctx.stage`,
  strings, celebrations) + their e2e specs.
- Impacted: the gate pop-panel text, the celebration card, the store's
  `stageStars` (written, not redefined — phase 01).
- Will verify: unit (stage plans), e2e (4 projects, incl. leak), golden
  check.
- Deliberately skipped: chapter-2 levels (phase 04), daily (05), stickers
  (06), quest-card chapter row changes beyond the stage line (phase 07),
  any world/scatter change.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Stage 1 accidentally changes (regression for existing players) | M | H | S1 parity unit test per level; existing e2e untouched for S1 |
| Field S3–S5 feel identical (18 facts, same plot) | H | M | Format rotation is the content; author playthrough (phase 08) judges it — if it fails, S5 becomes a word-problem stage instead |
| A later stage's format needs a new hint ladder | M | M | Hint ladders are per round kind; a new kind gets its own ladder + tests, never a reused one that leaks the answer |
| E2E time doubles (4 levels × 2 stages × 4 projects) | M | M | Later-stage e2e uses `seedStageProgress` + `teleportToGate`; only stage 1 walks the full entry path |

## Security Considerations
- None: no input parsing, no save-code change, no network.

## Next steps
- 07 integrates the gate/quest text; 08 runs the full 44-run chain e2e.
