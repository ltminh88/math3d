# Phase 07: Measurement workshop level "Xưởng Đo Đạc" (KNTT B30–B33, B50–B52)

## Context links
- [plan.md](plan.md), [01](phase-01-skill-keys-reasoning-generators-and-save-code-m3d3.md), [02](phase-02-geometry-and-measurement-generators.md), [03](phase-03-map-expansion-regions-gates-and-quest-chain.md)
- Reference: `src/levels/city/city-building-view.ts` (instanced tiles/windows), `src/levels/field/planting-grid*.ts` (grid by tap)

## Overview
- Date 2026-10-31. Priority P1. Status done (branch feat/ch2-p07-workshop). Review: not started. Depends on 01, 02, 03. Parallel with 04–06, 08.
- Story: the workshop's carpenter must finish orders — fences for gardens, tiled floors, packages to weigh, juice to pour, a thermometer to read. The child measures and computes with VLM.

## Key Insights
- Chu vi vs diện tích is the headline misconception: perimeter = walk the fence around the edge (each side lights); area = cover with 1 cm² tiles. Same rectangle shown in both modes over two rounds.
- Grid tiling by tap (tap a cell / "đặt một hàng") avoids dragging; counting stays the child's job.
- Instruments read by tapping marks or entering values; scale/jug/thermometer are 2–4 meshes each.

## Requirements
- `index.ts`: `{id:'workshop', regionId:'workshop', rounds:6, requires:'valley', load: () => import('./workshop-scene')}`.
- Skill pool: all `meas-*` ids; tiers per box.
- Round kinds:
  - (a) Thước đo: object beside a ruler (cm/mm ticks); read length (pad) then convert (mm↔cm) (pad, unit chip).
  - (b) Hàng rào (chu vi): polygon/HCN/square on grid with side labels; tap each side to walk it (or "đi tiếp" button), enter perimeter; tier 3 fence-post word problem (`meas-wp-fence`).
  - (c) Lát gạch (diện tích): tap cells or "đặt một hàng" to tile, enter area in cm²; tier 2+: HCN/vuông by formula without tiling; unit step cm vs cm².
  - (d) Cân (g): weights on a balance; total or missing weight (pad), kg↔g.
  - (e) Bình (ml): jugs with marks; total or how many cups (pad), l↔ml.
  - (f) Nhiệt kế (°C): read temperature (pad) or choose hot/cold (choice).
- Hints: encourage → formula in words ("đi một vòng quanh viền", "đếm ô phủ kín") → partial (sides added so far / one row) → 3 misses reveal.
- Look: workshop palette from 03, instanced tiles/ticks; ≤60 draw calls. Test hook `window.__workshop`.
- Touch: every action by tap or on-screen button; keys optional (digits, Enter, arrows, Space for "đặt một hàng", H); targets ≥44 px (grid cells sized ≥44 px at phone width; grid ≤20 cells for tiling); no key hints on coarse pointers.

## Architecture
```
src/levels/workshop/index.ts  workshop-scene.ts  workshop-round-flow.ts  workshop-hints.ts  workshop-diorama-builder.ts
src/levels/workshop/workshop-ruler-view.ts  workshop-fence-view.ts  workshop-tile-grid-view.ts  workshop-instruments-view.ts
src/levels/workshop/workshop-panel.ts  workshop-input.ts  workshop-labels.ts  workshop-celebration.ts  workshop-strings.ts
src/levels/workshop/workshop-test-hook.ts  workshop-level.css  workshop-round-flow.test.ts  workshop-hints.test.ts  workshop-tile-grid.test.ts
tests/e2e/workshop-level.spec.ts  workshop-level-leak.spec.ts
```

## Related code files
- Create: above. Modify: none. Delete: none.

## Implementation Steps
1. RED round flow (kinds, tiers, units, outcomes with `sk:` keys) + tile grid model (cells placed, count, row fill); GREEN.
2. RED hints (no rung ≥2 gives the answer; chu vi/diện tích hint names the right concept); GREEN.
3. Views + diorama + labels; instruments.
4. Panel/input (step kit, unit chips); celebration + exit.
5. e2e on desktop (keyboard), phone + tablet portrait + tablet landscape (taps only): seed valley done → workshop gate → 6 rounds incl. perimeter and area of the same rectangle → back; `workshop` completed; cave gate opens; ≤60 draw calls; leak 10 cycles.
6. Screenshots `reports/workshop-screens/` (4 projects).

## Todo list
- [x] round flow + grid model + tests
- [x] hints + tests
- [x] views, instruments, diorama
- [x] panel, input
- [x] celebration
- [x] e2e 4 projects + leak
- [x] screenshots

## Success Criteria
- Unit + workshop e2e green on desktop, phone, tablet portrait, tablet landscape; own chunk; ≤60 draw calls; no leaks; ranges match 02 report.
- Touch: no step needs a keyboard or drag; targets ≥44 px; no key hints on coarse pointers; layout verified at tablet portrait + landscape.

## Scope Contract
- Changed: new folder + its e2e.
- Impacted: progression (cave gate).
- Will verify: unit + workshop e2e on 4 projects + leak.
- Deliberately skipped: parity (09), other levels.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Ruler ticks unreadable on phones | M | H | Zoomed ruler segment, mm ticks only at tier 2+, DOM labels |
| Tiling 20 cells by tap is tedious | M | M | "Đặt một hàng" button; formula path at tier 2+ |
| Six kinds feel scattered | M | M | Story order per run (ruler → fence → tiles → instruments); author review |

## Security Considerations
- None.

## Next steps
- 09 merge.

## Implementation notes (2026-11-02)
- Folder `src/levels/workshop/` (own chunk `workshop-scene-*.js`). Pure: `workshop-stations.ts` (skill → station, six-slot story plan, weakest skill first by box then last seen), `workshop-round-plan.ts` (items via `measurementItemForSkill` at the box tier; the fence round redraws `meas-perimeter-rect` until it matches the `meas-area-rect` floor, tier-1 floors drawn ≤ 20 cells so they can be tiled; bounded 4000 draws), `workshop-round-flow.ts` (misses, 3 hint rungs, reveal after 3 misses, `sk:` outcome), `workshop-tile-grid.ts`, `workshop-fence-walk.ts`, `workshop-hints.ts` + `workshop-hint-strings.ts`.
- Run order: ruler → fence (chu vi) → tiles of the **same rectangle** (diện tích) → one more fence/tiles order → two of balance/jug/thermometer (in that order). All 12 `meas-*` skills reachable.
- Answers go through the kit step card (`render: renderMeasurementPrompt`); the board above it is DOM/SVG (ruler with mm ticks from tier 2, fence sides as buttons + "Đi tiếp", tiling grid of 44 px buttons + "Đặt một hàng", formula floor with faint grid and cut corner, balance, jug, thermometers zoomed 0–50 °C). The 3D shed is one baked mesh plus instanced ruler ticks, instanced tiles mirroring the child's taps, jug water, thermometer column and a station ring: **max 9 draw calls** (budget 60).
- Hints: rung 1 encourages, rung 2 the rule in words ("đi một vòng quanh viền", "đếm ô vuông phủ kín"), rung 3 an expression from numbers already visible; unit test checks over 1000+ items that no rung ≥ 2 writes `= answer` or a number the child cannot see. Wrong choices that mix chu vi/diện tích get a note naming the right concept.
- Keys (optional, desktop): digits + Enter (pad), 1–4 choices, → walk, Space lay a row, H hint, Enter next order; key help hidden on `(pointer: coarse)` and narrow layouts.
- e2e: `workshop-level.spec.ts` (keys on desktop, taps on phone + both tablets; wrong answer + 3 hint rungs, a reveal after 3 misses, fence walk, tiling, same rectangle, bonus, `sk:` keys stored, cave gate unlocked), `workshop-level-leak.spec.ts` (10 cycles, settled baseline). Screenshots `reports/p07-screens/` (env `WORKSHOP_SCREENS`).
- Outside ownership (tests only): `tests/e2e/chapter2-gates-and-regions.spec.ts` (`SHIPPED` += workshop, merged with valley's list), `tests/e2e/quest-chain.spec.ts` (workshop card now "Đến Cổng Xưởng Đo Đạc").
