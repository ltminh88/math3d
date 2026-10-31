# Phase 02: Geometry and measurement generators (pure), KNTT verification

## Context links
- [plan.md](plan.md), [phase 01](phase-01-skill-keys-reasoning-generators-and-save-code-m3d3.md) (catalog, `ReasoningItem`, tiers)
- [research 01](research/researcher-01-kntt-grade3-geometry-and-reasoning.md) §1–2, §4

## Overview
- Date 2026-10-31. Priority P1. Status done (2026-11-01). Review: not started. Starts after 01's `skill-catalog.ts` commit; parallel with rest of 01 and 03.
- Pure, seeded item generators for the geometry and measurement skills (catalog ids `geo-*`, `meas-*`), returning the same `ReasoningItem` shape plus a small scene descriptor that 06/07 render (segment, circle, angle, polygon on a grid, solid, ruler, scale, jug, thermometer).

## Key Insights
- Only B50 is verified [V]; B16–B19, B21, B30–B33, B51–B52 are [K] → verify first, lock ranges after.
- Misconceptions are the distractors: chu vi vs diện tích (7 cm → 28 vs 49), (a+b) instead of (a+b)×2, cạnh×2 for square, R↔D swap, "góc vuông chỉ khi nằm ngang", hình vuông ∉ HCN, 1 kg = 100 g, 1 l = 100 ml, 1 cm = 100 mm, cm vs cm².
- A rotated shape is the key right-angle item: descriptor carries a rotation so 06 can show it turned 20–70°.
- Descriptors are data (numbers, vertex lists in grid units), never three objects, so tests run in node.

## Requirements
- Ranges (author cap 2026-10-31: every number, intermediate and answer ≤100): sides 1–20 cm, perimeter ≤100, area by counting ≤20 squares, area HCN/vuông ≤100 cm² (sides ≤10), mm ≤100 (cm↔mm only), g ≤100, ml ≤100, °C 0–100, midpoint segments even lengths 2–20. No kg↔g, l↔ml, m↔mm conversions. Tiers raise reasoning, not size.
- Generators per skill id, `(rng, tier) => GeoItem` where `GeoItem = ReasoningItem & { scene: GeoScene }`.
- `geo-shape-classify`: multi-select ("chọn tất cả hình chữ nhật" includes squares if the author confirms decision 7).
- `geo-solid-parts`: 6 mặt, 12 cạnh, 8 đỉnh; identify khối lập phương vs hộp chữ nhật from dimensions.
- Units in answers (`unit: 'cm' | 'cm2' | 'mm' | 'g' | 'kg' | 'ml' | 'l' | 'degC'`); unit choice step where the misconception is the unit (cm vs cm²).
- Strings for prompts in `geometry-strings.ts` / `measurement-strings.ts` (vi source, short sentences; en).

## Architecture
```
src/geometry/geo-scene-types.ts  geometry-ranges.ts  midpoint-and-circle-generators.ts  angle-generators.ts
src/geometry/shape-generators.ts  solid-generators.ts  geometry-distractors.ts  geometry-strings.ts  geometry-item-for-skill.ts
src/measurement/measurement-ranges.ts  length-and-unit-generators.ts  mass-volume-temperature-generators.ts
src/measurement/perimeter-generators.ts  area-generators.ts  measurement-distractors.ts  measurement-strings.ts  measurement-item-for-skill.ts
```
Co-located tests; pure (no three/DOM); each file <200 lines.

## Related code files
- Create: above + `research/researcher-03-kntt-geometry-measurement-verification.md`. Modify: none outside own folders. Delete: none.

## Implementation Steps
1. Verify B16, B17, B18, B19, B20 (name), B21, B30–B33, B50 (tiết 2), B51, B52 on loigiaihay/vietjack: objectives, number ranges, exact Vietnamese terms (e.g. "điểm ở giữa", "trung điểm", "ê ke"), square-as-rectangle wording. Write the verification report; lock `*-ranges.ts`.
2. RED per generator: exact answer, unique options incl. named misconception distractor, ranges per tier, descriptor consistent with answer (e.g. polygon on grid really has the area), 1000 seeds deterministic.
3. GREEN generators; `*-item-for-skill.ts` dispatch covers every `geo-*`/`meas-*` catalog id (test iterates the catalog).
4. Lint, typecheck, unit.

## Todo list
- [x] KNTT verification report + ranges locked
- [x] geometry generators + tests
- [x] measurement generators + tests
- [x] dispatch covers catalog

## Success Criteria
- Every `geo-*`/`meas-*` skill has a tested generator; distractors unique; ranges match the verification report; unit/lint/typecheck green.
- Touch: n/a (pure); descriptors include tap-target-friendly sizes hint (min scene unit) for 06/07 at phone + tablet sizes.

## Scope Contract
- Changed: new pure folders only.
- Impacted: none at runtime until 06–08 import them.
- Will verify: unit tests of the new folders.
- Deliberately skipped: e2e, parity, goldens (nothing rendered or shared changed).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Terms/ranges differ from SGK | M | M | Verification step before locking; ranges in one file |
| Rotated-angle or area items ambiguous on small screens | M | M | Descriptor carries min sizes; 06/07 check phone + tablet layout |
| Choose-all items with square/rectangle confuse kids | M | M | Author decision 7; hint explains "4 góc vuông" |

## Security Considerations
- None (pure functions, research reads public pages only).

## Next steps
- 06, 07, 08 consume generators.

## Implementation notes (2026-11-01)
- KNTT check → `research/researcher-03-kntt-geometry-measurement-verification.md`. **Decision 7: KNTT does not call a square a rectangle** (B19 Bài 1 counts the square apart), so no option set ever needs that claim: "chọn hình chữ nhật" never shows a square, "chọn hình tứ giác" never shows a rectangle/square, choose-all solids asks for cubes only. B17 never writes "đường kính = 2 × bán kính"; items follow the book's "two radii" (7 + 7).
- Ranges locked in `src/geometry/geometry-ranges.ts`, `src/measurement/measurement-ranges.ts` (all ≤ 100; only cm ↔ mm).
- `GeoItem = ReasoningItem & { scene, unit }` (`src/geometry/geo-scene-types.ts`); scenes are data (segment, circle, circle-row, angles, shapes, figure, solids, ruler, balance, jug, thermometers, side-polygon, rect, cells) with `minUnitPx` (24-32) as the phone/tablet layout hint. `unit` adds `'m'` (B50 fence) to the planned list.
- Entry points: `geometryItemForSkill` / `GEOMETRY_SKILLS` (9 ids), `measurementItemForSkill` / `MEASUREMENT_SKILLS` (12 ids); tests assert they equal the catalog's `geometry` / `measurement` families.
- Strings: `renderGeometryPrompt` (namespace `geometry`, also holds shared labels `num`, `q_<unit>`, `u_<unit>`, `letter`, `seg`) and `renderMeasurementPrompt` (namespace `measurement`, falls back to geometry for shared labels; perimeter/area texts in `perimeter-area-strings.ts`).
- Tests: 1000 seeds × 3 tiers × 21 skills with independent oracles from raw scene data (dot-product right angles, B19 classification, rectangle/triangle counting from segments, BFS area of cells), unique options with a named misconception on every wrong one, every shown number an integer 0..100, unit step's right option = item unit, determinism; template test (every shape kind's right angles/class over 1000 seeds); vi/en render tests. Mutation check: 10 deliberate generator bugs, all caught (one survived at first → added `polygon-templates.test.ts`).
- **Outside ownership (minimal, additive):** `src/reasoning/reasoning-types.ts` — 24 new `Misconception` names (geometry/measurement distractors) so `GeoItem` stays a real `ReasoningItem` for the step kit.
- **For 04/06/07:** the step card (`src/ui/kit/step-card.ts`) renders with the reasoning `renderPrompt`; geometry/measurement items need `renderGeometryPrompt` / `renderMeasurementPrompt` (inject a renderer or dispatch on skill family). `cells` groups are drawn each in its own grid; `side-polygon` is not to scale.
