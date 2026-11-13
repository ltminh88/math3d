# Phase 08: Stages — valley (Thung Lũng Hình Học)

## Context links
- [plan.md](plan.md), [phase-00-design.md](phase-00-design.md) (stage table, no-time-pressure rule),
  [phase-01-measure-pools-stage-model-and-save-code-m3d4.md](phase-01-measure-pools-stage-model-and-save-code-m3d4.md),
  [phase-02-wider-item-pools.md](phase-02-wider-item-pools.md)
- `src/levels/valley/valley-round-plan.ts` (five kinds, tier from box),
  `src/levels/shared/level-stages.ts`
- `src/geometry/geometry-item-for-skill.ts`, `src/learning/skill-tiers.ts`,
  `src/ui/kit/multi-select-buttons.ts` (step-kit multi-select)
- `tests/e2e/valley-level.spec.ts`, `tests/e2e/valley-level-leak.spec.ts`
- Chapter 2 phase 06 (how this level was built).

## Overview
- Priority P1. Status **not started**. Depends on 01 (stage model) and 02
  (widened pools). Effort **8 h** (branch `muse/stages-valley`, one PR
  into `main`).
- Give the valley 5 stages (5 runs, 30 fresh rounds). Stage 1 is the
  current run, unchanged; the chain still unlocks after stage 1. One
  level, one PR (PR #1 review, point 3).

## Stage table — question type already exists, or new
Verified against the code. Four stages use existing mechanisms; S4 is one
new wiring through the existing step kit.

| Stage | Content (6 rounds) | Type | File / reuse |
|---|---|---|---|
| S1 | Midpoint, circle, right angle, classify, solids (9 `geo-*` skills; a first run meets only the first three kinds) | ĐÃ CÓ | `valley-round-plan.ts` (kinds `midpoint \| circle \| right-angle \| classify \| solids`) — stage 1 is today's run |
| S2 | Count-right-angles + shape-count emphasis | ĐÃ CÓ | `valley-round-plan.ts` (`geo-count-right-angles`, `geo-shape-count`) — subset only |
| S3 | Rotated figures (tier 2+) + solid parts | ĐÃ CÓ | `valley-round-plan.ts` + `geometry-ranges.ts` (`ROTATION_RANGE`) — subset + tier floor only |
| S4 | Choose-all geometry (pick every correct shape) | **MỚI (đấu nối)** | Reuses the step kit's existing multi-select (`ui/kit/multi-select-buttons.ts`, already used by the cave's choose-all chambers). The valley panel renders the multi-select for `geo-shape-classify` / `geo-shape-count` items; no valley-specific multi-select widget is built. |
| S5 | Mastery — mixed, weakest-first | ĐÃ CÓ | `valley-round-plan.ts` — subset only |

## Key Insights
- The valley planner already rotates five kinds and never repeats a kind
  twice in a row when another kind is left (`valley-round-plan.ts`
  cost function). Stages ride that rotation; the stage plan only chooses
  the skill subset.
- S4 is the one place in chapter 2 where a *format* (not just a subset)
  is new — and the format already exists in the kit. The work is mounting
  it in the valley panel and testing the tap targets (multi-select rows
  ≥ 44 px), not designing a widget.

## No time pressure (rule)
No countdown timer, no penalty for a slow answer, no copy that hurries the
child — in any stage.

## Requirements
- **Stage plan**: extend `valley-round-plan.ts` with a stage parameter
  (split into `valley-stage-plan.ts` only if the file would pass 200
  lines): stage → skill subset + tier floor; round count = the level's
  `rounds` (6).
- **S4 choose-all**: mount the step-kit multi-select in the valley panel
  for the S4 skill subset; hint ladder as the kit defines it (rung ≥ 2
  never shows the answer).
- **No-repeat invariant**: no skill twice in one run, no kind twice in a
  row where avoidable. Unit tests assert both per stage per seed.
- **Stage dressing, cheap only**: inside the valley's own diorama builder
  (stone-board layout variants). No world-scatter change, ≤ 60 draw
  calls, leak spec per stage.
- **Gate + celebration**: next uncompleted stage; gate pop-panel and
  celebration name the stage ("Chặng 2/5") in `vi` + `en`; replays keep
  best stars, pay per-question rewards only.
- **Tests**: unit tests per stage (skill subset, tier floor, no repeat,
  every number ≤ 100); e2e on all 4 projects playing stage 1 and one
  later stage (including S4's multi-select by tap) via `seedStageProgress`,
  asserting `stageStars`, gate text, draw calls; leak spec extended to a
  later stage. Touch: ≥ 44 px, tap-only, no key hints on coarse pointers.
- **Preview deploy**: preview of this branch (no `--prod`) with its URL
  in the pull request.

## Visible changes in the world outside the levels
- Gate pop-panel for the valley gate: "Chặng {n}/5" + next-stage line.
- Valley celebration card: stage stars line.
- Nothing else in the world changes. The parity reviewer re-shoots the
  valley gate pop-panel and the celebration card; these are intentional.

## Architecture
```
src/levels/valley/valley-round-plan.ts (mod: stage param)
src/levels/valley/index.ts (mod: stages: 5)
src/levels/valley/valley-scene.ts (mod: accept ctx.stage)
src/levels/valley/valley-panel.ts (mod: S4 multi-select mount)
src/levels/valley/valley-strings.ts (mod: "Chặng {n}/5" vi/en)
src/levels/valley/valley-celebration.ts (mod: stage stars line)
tests/e2e/valley-level.spec.ts (mod: stage coverage)
tests/e2e/valley-level-leak.spec.ts (mod: later stage)
```

## Related code files
- Modify: the valley folder + its e2e specs listed above.
- Create: `valley-stage-plan.ts` only if the round-plan file would pass
  200 lines.
- Delete: none.

## Implementation Steps
1. RED stage-plan tests (S1 identical to today's rounds for a fixed seed);
   GREEN.
2. Stage subsets + tier floors (S2, S3, S5); S4 multi-select mount.
3. Gate text + celebration stage line; replay path.
4. Leak spec for a later stage; draw-call check per stage.
5. Lint, typecheck, unit, build, golden `--check`, e2e on 4 projects,
   preview deploy + URL in PR.

## Todo list
- [ ] valley stage plan (S1 parity test first)
- [ ] S4 multi-select mount (step kit)
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
- Changed: the valley folder + its e2e specs.
- Impacted: gate pop-panel text, celebration card, `stageStars` writes.
- Will verify: unit (stage plans, no-repeat invariant), e2e (4 projects,
  incl. leak), golden check, preview playthrough by the author.
- Deliberately skipped: other levels (phases 03–07, 09–10), daily (11),
  stickers (12), quest-card changes beyond the stage line (13), any
  world/scatter change, any valley-specific multi-select widget (step kit
  instead), any new skill id.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| S4 multi-select rows too small on phones | M | M | Kit rows are ≥ 44 px by construction; e2e asserts every visible button ≥ 44 px on the touch projects |
| A stage repeats the same kind twice in a row | M | M | Cost-function rotation kept; unit test asserts no kind twice in a row where avoidable |

## Security Considerations
- None: no input parsing, no save-code change, no network.

## Next steps
- 09 (workshop) after this lands; 13 integrates the gate/quest text; 14
  runs the full 44-run chain e2e.
