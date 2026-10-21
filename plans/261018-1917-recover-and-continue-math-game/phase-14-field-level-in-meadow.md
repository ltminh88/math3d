# Phase 14: Field level "Cánh Đồng Phép Tính" (arrays, commutativity, tables 3 and 4)

## Context links
- [plan.md](plan.md) · **Spec: [old phase 06 field level](../261018-1803-vlm-math-game-mvp/phase-06-field-level.md)** (requirements, round types a/b/c, grid model, hints, success criteria stay valid) · [phase 13 level host](phase-13-level-host-and-region-progression.md)
- Depends on: 13. Parallel with: 15, 17 (G7).

## Overview
- Date: 2026-10-18
- Description: Implement old-06 Field level as a level module behind the meadow gate. Only deltas are written here.
- Priority: P1
- Implementation status: done (2026-10-21, branch worktree-agent-phase14-field)
- Review status: not reviewed

## Deltas vs old phase 06
- Host: `LevelDefinition {id:'field', regionId:'meadow', tables:[3,4], rounds:5, requires:'bridge'}`; scene runs inside 13's host (not old `scene-manager`). `import.meta.glob` path unchanged (`src/levels/field/index.ts`).
- Story: VLM (guide NPC, ex-Milo) frames the level in a speech line on the level HUD; "storm-flattened field" story kept but tied to the meadow region's existing visuals (sign "2x3", number props).
- Visual language: recovered materials/colors (reuse `world-primitives` material cache palette: grass/soil colors from `regions.ts` meadow), icosahedron-style low poly, Baloo 2/Nunito, recovered CSS classes for buttons/feedback (`.answer`, `feedback success|gentle`, `.reward-pop`).
- Audio: recovered synth (`correct`, `hint`, `celebrate`); no old audio engine.
- Hints: rung 1-3 rendered with the recovered hint area UI; rungs per old 06 (row highlight, skip count, swapped known fact).
- Rewards: `scoring.ts` (+10 first try, +5 with hint, +5 coins), plus level-complete bonus same as bridge completion (+50 XP +10 coins) once.
- Input: kept `src/core/input/**` + `src/ui/kit/number-pad`; keyboard R rotates, arrows move cell focus, Enter plants.
- Draw-call budget: <= 60 calls in level scene (world paused, not rendered).

## Key Insights
- See old 06. Plus: level scene must dispose all geometries on exit (13 leak check covers it).

## Requirements
- As old 06 + deltas. Strings namespace `field` (vi source, en typed).

## Architecture
```
src/levels/field/index.ts  field-scene.ts  field-diorama-builder.ts  planting-grid.ts  planting-grid-view.ts
src/levels/field/field-round-flow.ts  field-strings.ts  planting-grid.test.ts  field-round-flow.test.ts
tests/e2e/field-level.spec.ts
```

## Related code files
- Create: above. Modify: none (self-registers). Delete: none.

## Implementation Steps
1. Grid model + tests (old 06 step 1).
2. Diorama with recovered palette + instanced plants + drop zones.
3. Round flow a/b/c via `LevelContext.learning` (planSession restricted to tables 3,4) + tests.
4. Rotation animation (reduced motion: instant swap) + projected equation labels.
5. Hints, celebration, result -> host.
6. E2E: `__game` seeds bridge complete -> teleport -> enter -> complete 5 rounds (keyboard path + touch path on mobile-pixel) -> back at gate; store has `field` completed; Forest gate opens.

## Todo list
- [x] grid model (+tests)
- [x] diorama + plant view
- [x] round flow (+tests)
- [x] rotation + labels
- [x] hints + celebration + result
- [x] e2e

## Success Criteria
- Old 06 criteria + `npm run test:e2e -- field-level` green on desktop-chromium and mobile-pixel; `renderer.info.render.calls` <= 60 in level (asserted in e2e via `__game`).
- `mul:3x4`-style keys recorded once per pooled fact.

## Scope Contract
- Changed: new folder only. Impacted: progression (forest gate). Will verify: unit (grid, round flow) + e2e. Skipped: parity (world untouched; CI runs it anyway).

## Risk Assessment
See old 06 table, plus:
| Risk | L | I | Countermove |
|---|---|---|---|
| Style mismatch with original game | M | M | author reviews screenshots of level vs world before e2e finalization |
Rollback: delete `src/levels/field/` -> gate shows "Sắp ra mắt".

## Security Considerations
- None (local only).

## Implementation notes (2026-10-21)
- Files: `src/levels/field/` index (definition only; scene chunk `field-scene-*.js` ~27 kB), pure
  `planting-grid.ts` + `field-round-flow.ts` (unit-tested RED first), stage (own scene background +
  fog + hemisphere/sun from `WORLD_LIGHTING`; renderer state untouched), diorama (fence, barn,
  scarecrow, hay, trees, 5 storm-flattened patches; repeated props instanced), plot meshes/view
  (instanced mounds/stems/flower heads, row stakes, seedling basket, invisible hit proxies), HUD
  (`.glass`, `.dialog-eyebrow`, `.feedback success|gentle`, `.hint-area`, `.answer`, `.primary`,
  `.reward-pop`; kit number pad styled in `field-level.css`), projected DOM labels (equation,
  skip count), test-only `window.__field`.
- Rounds: `planSession(mulFactsForTables([3,4]), 5)`; box >= 3 -> recall (c, either order); else
  even index -> build (a), odd -> equations (b, 2 of 4: r×c, c×r, r+c, r×(c+1)); square facts are
  always (a). 3 attempts on the shared hint ladder; rung 1 encourage, 2 row highlight, 3 skip count
  (last row "?"), 4 swapped fact (plot turns). A correct answer turns the plot to show c × r.
  Rewards only via `learning.record`; the host adds the completion bonus.
- Input: tap a cell / tap a row stake / drag from a cell or the basket across cells (shared
  `createInteraction`); keyboard on `document` (capture, disposer signal): arrows move cell focus,
  Enter/Space plants, R turns, H hint, 1-4 + Enter equations, digits/Enter number pad. Reduced
  motion: instant turn, plants and patches appear without growing.
- Measured (desktop-chromium, SwiftShader): 43 draw calls planting, 48 at the celebration (incl.
  shadow pass); geometries 272 -> 296 in level -> 272 after exit and after 10 more cycles (e2e).
- Deviation: rung 5 "requeue" is not replayed inside the run (5 fixed rounds); the revealed fact
  drops a Leitner box and comes back through the planner next session.
- Author review screenshots: `reports/phase-14-screens/` (start, mid-round, hint, celebration,
  world at the gate).
- `level-gate.spec.ts`: the field gate is now open (no "Sắp ra mắt"); forest stays coming-soon
  until phase 15 (that spec's forest lines must change when 15 merges).

## Next steps
- 18 playtest + perf on iPad.
