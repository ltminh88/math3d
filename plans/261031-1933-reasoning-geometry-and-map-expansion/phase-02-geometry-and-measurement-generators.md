# Phase 02: Geometry and measurement generators (pure), KNTT verification

## Context links
- [plan.md](plan.md), [phase 01](phase-01-skill-keys-reasoning-generators-and-save-code-m3d3.md) (catalog, `ReasoningItem`, tiers)
- [research 01](research/researcher-01-kntt-grade3-geometry-and-reasoning.md) §1–2, §4

## Overview
- Date 2026-10-31. Priority P1. Status pending. Review: not started. Starts after 01's `skill-catalog.ts` commit; parallel with rest of 01 and 03.
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
- [ ] KNTT verification report + ranges locked
- [ ] geometry generators + tests
- [ ] measurement generators + tests
- [ ] dispatch covers catalog

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
