# Phase 02: City level "Thành Phố Con Số" (tables 6–9)

## Context links
- [plan.md](plan.md), [phase 01](phase-01-gates-progression-and-quest-chain.md)
- Reference implementations: `src/levels/field/**` (grid, number pad, test hook, CSS), `src/levels/forest/**` (panel, celebration, baked diorama)
- Rules: `src/levels/shared/level-types.ts` doc comments; `docs/code-standards.md`

## Overview
- Priority: P1. Status: done (awaiting phase 04 merge). Depends on 01. Parallel with 03.
- Story: VLM and the child help the city postman, who has mixed up the parcels. Each parcel shows a multiplication; each house shows a product. Then the lights in a building went out, and the child turns them on floor by floor.

## Key Insights
- Tables 6–9 are the hardest facts. Hints lean on known facts:
  - split strategy, e.g. 7 × 8 = 7 × 5 + 7 × 3;
  - commutativity to a known table, e.g. 6 × 3 = 3 × 6;
  - near-square, e.g. 8 × 8 − 8.
- Use the existing learning core: `planSession` over `mulFactsForTables([6,7,8,9])`, the distractor picker for wrong house numbers, and the hint ladder.

## Requirements
- `index.ts`: `{id:'city', regionId:'city', tables:[6,7,8,9], rounds:5, requires:'forest', load: () => import('./city-scene')}`.
- Round types, chosen by Leitner box, like field:
  - **(a) Giao hàng / deliver:** a parcel "7 × 8" and a street of 4 houses with numbers (correct product plus 3 distractor-class numbers). Tap, keyboard (arrows + Enter) or drag the parcel to a house.
  - **(b) Ô cửa sổ / windows:** a building with r floors × c windows (r ∈ 6–9 or c ∈ 6–9). Tap a floor to light it; a running count is shown. Then enter the total on the kit number pad.
  - **(c) Reverse delivery (box ≥3):** a house shows 56; choose the parcel 7 × 8 or 8 × 7 among expressions (expression-choice).
- Hints:
  1. encouragement;
  2. split the building or parcel into 5 + rest with colour bands;
  3. skip count by floors;
  4. commuted fact, if the swapped table is a known one.
  Three misses reveal the answer.
- Strings in `defineStrings('city')`, vi source, short sentences for 7–9 year olds.
- Look: low-poly houses reusing the recovered house builders and palette (the city region colour `#8fb3c9`), a road strip, postman and VLM figures (icosahedron/cone style), instanced windows.
- ≤60 draw calls; geometries back to baseline after exit and after 10 cycles; reduced motion respected.
- Test hook `window.__city` (test build only) for e2e: state, screen points.

## Architecture
```
src/levels/city/index.ts  city-scene.ts  city-diorama-builder.ts  city-street-view.ts  city-building-view.ts
src/levels/city/city-round-flow.ts  city-hints.ts  city-panel.ts  city-strings.ts  city-test-hook.ts  city-level.css
src/levels/city/city-round-flow.test.ts  city-hints.test.ts
tests/e2e/city-level.spec.ts
```

## Related code files
- Create: the above. Modify: none (self-registers). Delete: none.

## Implementation Steps
1. Round flow (pure) + tests, RED first: type choice by box, distractor houses, reverse delivery, outcomes.
2. Hint builder (split, skip count, commute) + tests.
3. Diorama + street + building views (instanced windows, baked statics).
4. Panel / HUD + input (tap, drag, keyboard) + number pad.
5. Celebration + `exit({completed:true})`.
6. e2e both projects: seed field + forest completed → teleport to the city gate → 5 rounds (keyboard on desktop, tap on mobile) → back at the gate; `city` completed; tower gate `coming-soon` (no tower level in this branch); `mul:` keys of tables 6–9 recorded; ≤60 draw calls; 10× leak check.
7. Screenshots for the author in `reports/city-screens/`.

## Todo list
- [x] round flow + tests
- [x] hints + tests
- [x] diorama, street, building
- [x] panel + input
- [x] celebration
- [x] e2e
- [x] screenshots

## Implementation notes
- Files: `index.ts`, `city-scene.ts` (wiring), `city-round-flow.ts` (pure planner + answer flow), `city-hints.ts` (pure rungs) + `city-hint-view.ts`, `city-round-controller.ts`, `city-input.ts` (3D facade + document keys), `city-panel.ts` + `city-choice-cards.ts`, `city-street-view.ts` (parcels, house zones), `city-building-view.ts` (instanced windows, floor proxies), `city-diorama-builder.ts`, `city-camera.ts`, `city-labels.ts`, `city-layout.ts`, `city-celebration.ts`, `city-strings.ts`, `city-test-hook.ts`, two CSS files. All under 200 lines.
- Every answer is a number: house number (deliver), window total (windows), value of the chosen parcel expression (reverse); `CityRoundFlow.submit(value)` compares with the product. Round type: box ≥3 → reverse, else deliver/windows alternating (round 0 deliver). The 6–9 factor is `table` (windows per floor, shown first); when both factors are 6–9 the rng picks.
- Deliver: 4 houses = product + `pickDistractors` (child's `errs` as the personal class) shuffled by `placeAnswer`. Reverse: `expressionChoice` (3 parcels, " x " shown as " × "). Both rounds also show house/parcel cards (keys 1–4) next to the 3D drag/tap/keyboard path.
- Windows: tap a floor (invisible proxy), arrows + Enter, or "Bật đèn một tầng"; the running count shows lit floors and windows; total on the kit number pad. Lighting a floor by keyboard drops the 3D focus so the next Enter submits the pad.
- Hints: 1 encourage; 2 `t = 5 + rest` (windows in two band colours with ■/● chips on the building, the same split in the hint card); 3 skip count per floor (`8, 16, 24, ?`, chips per floor in windows rounds); 4 commute when the other factor is 2–5 or 10, else near square (`7 × 8 = 7 × 7 + 7`), else count back from ten (`6 × 9 = 60 − 6`). 3 misses reveal.
- Look: backdrop (ground, road, sidewalk, lamps, numbered blocks, trees, postman, VLM via `buildMiloModel`) baked to one mesh; four `buildHouse` cottages (roofs incl. `#8fb3c9`) baked to a second mesh hidden in windows rounds. Max draw calls in e2e: 7 (desktop and phone; budget 60).
- Celebration: the card sits at the bottom and the camera frames a fully lit 8 × 7 building above it.
- e2e: `city-level.spec.ts` (five rounds; desktop: wrong card → hint → 3D keyboard delivery, keyboard floor + button, 2 hints with bands, typed answers; phone: the same by taps incl. 3D parcel/house/floor taps) and `city-level-leak.spec.ts` (10 cycles). The leak spec waits for the world camera to settle (counted in frames) before its baseline: on the phone the world keeps uploading geometries for ~10 s after a teleport to the city gate (measured 271 → 279 with no level), which is not a level leak. Reverse delivery is unit-tested only (a fresh e2e profile has no box-3 facts and `seedProgress` cannot seed fact stats).
- Expected failures for phase 04 (city gate now has a level): `level-gate.spec.ts` "the forest opens the city gate, the city the tower gate (both Sắp ra mắt without a level)" and `forest-level.spec.ts` map check `Cổng màn chơi: Sắp ra mắt` for the city.
- Screenshots: `reports/city-screens/` (desktop + mobile: world at the gate, delivery, delivered, windows, hint bands, celebration).

## Success Criteria
- Unit + `city-level` e2e green on desktop-chromium and mobile-pixel; full e2e green except tower expectations that phase 04 owns; lint/typecheck/build clean; own chunk.

## Scope Contract
- Changed: new folder only.
- Impacted: progression (tower gate).
- Will verify: unit + e2e.
- Skipped: parity (world untouched; 04 runs it).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Products up to 81 make distractors too easy or too hard | M | M | Distractor classes from the learning core; unit-test that options are unique and plausible |
| Windows grid up to 9×9 is too dense on a phone | M | M | Light floors rather than single windows; check layout on mobile-pixel |
| Style drift from the world | M | M | Author screenshot review in 04 |

## Security Considerations
- None.

## Next steps
- 04 merge.
