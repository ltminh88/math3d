# Phase 16: Dialog scenes — base-10 blocks, place-value table, number line, fraction shapes

## Context links
- [plan.md](plan.md), [phase-04](phase-04-dialog-scene-registry-geo-meas-in-daily.md), `src/numbers/numbers-scene-types.ts`, `src/fractions/fraction-scene-types.ts`

## Overview
P1. Effort 6h. Lane muse-min. Deps 04, 07, 12. Branch `muse/scenes-numbers-fractions`.

## Key Insights
Each renderer is one self-registering file under `src/ui/dialog-scenes/scenes/`; no shared edits. Fraction shapes need equal *and* unequal part drawing (trap items).

## Requirements
- `place-value-scene-svg.ts` (blocks 1/10/100/1000/10 000 + table), `number-line-scene-svg.ts`, `fraction-shape-scene-svg.ts` (circle sectors, bars, grids), `object-set-scene-svg.ts` (fraction of set).
- Readable at phone width; labels ≥14 px; aria-label text summary per scene.

## Architecture
SVG via DOM APIs; css in `src/styles/dialog-scene.css` (append-only section) or own css file to avoid conflict with 17 → own `dialog-scene-numbers.css`.

## Related code files
Ownership: the four scene files + `src/styles/dialog-scene-numbers.css` + `tests/e2e/lesson-scenes-numbers.spec.ts`.

## Implementation Steps
1. RED: registry test — every numbers/fraction skill sample's `scene.kind` has a renderer; e2e B14 + B45 lesson run by tap (4 projects).
2. Implement; GREEN; screenshots in PR; gates.

## Todo list
- [ ] place value + number line
- [ ] fraction shapes + sets
- [ ] e2e + screenshots

## Success Criteria
All numbers/fraction skills renderable → no "Sắp có" for B1, B14, B45, B59.

## Risk Assessment
| Risk | Countermove |
|---|---|
| 10 000 blocks too many to draw | draw block counts per column with ×n badge beyond 9 |

## Security Considerations
No innerHTML from data.

## Next steps
20.
