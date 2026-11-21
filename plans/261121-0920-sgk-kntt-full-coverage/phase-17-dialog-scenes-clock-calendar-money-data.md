# Phase 17: Dialog scenes — clock, calendar, money cards, data table/tally/bag/dice

## Context links
- [plan.md](plan.md), [phase-04](phase-04-dialog-scene-registry-geo-meas-in-daily.md), scene types of phases 13–15

## Overview
P2. Effort 6h. Lane muse-min. Deps 04, 13, 14, 15. Branch `muse/scenes-time-money-data`.

## Key Insights
Clock: Arabic + Roman faces from one SVG with label swap; minute ticks visible at phone size. Calendar = 7-col grid; tap-date not needed in v1 (MCQ).

## Requirements
`clock-scene-svg.ts`, `month-calendar-scene-svg.ts`, `money-notes-scene-svg.ts`, `data-table-scene-svg.ts`, `tally-bag-dice-scene-svg.ts`; own css `dialog-scene-market.css`.

## Architecture
Same self-registering pattern as 16.

## Related code files
Ownership: those files + `tests/e2e/lesson-scenes-market.spec.ts`.

## Implementation Steps
RED registry + e2e (B66, B68, B73 lesson runs by tap) → implement → GREEN → screenshots, gates.

## Todo list
- [ ] clock + calendar
- [ ] money cards
- [ ] table/tally/bag/dice
- [ ] e2e

## Success Criteria
B66–68, B73–74 fully playable in lesson mode/daily.

## Risk Assessment
| Risk | Countermove |
|---|---|
| Clock hands misread at small size | min clock diameter 160 px; thicker hour hand |

## Security Considerations
None.

## Next steps
19.
