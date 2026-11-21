# Phase 13: Time — clock reading (MCQ), 24h, elapsed, calendar (B66–67, Roman clock B47)

## Context links
- [plan.md](plan.md), [research 02 §B66, B67, B47](research/researcher-02-hk2-missing-topics.md)

## Overview
P2. Effort 5h. Lane muse-min. Deps 02. Branch `muse/time-calendar`.

## Key Insights
- v1 is MCQ-only: show a clock (scene `kind: 'clock'` {h, m, roman?}) and pick the time; "đặt giờ" by dragging hands is out (Q2, later phase; WCAG 2.5.7 would need tap alternative anyway).
- Calendar scene `kind: 'month-calendar'` {year, month, firstWeekday} → weekday of a date, days between dates; month lengths (30/31, February) are a pure helper with a hand oracle.
- giờ↔phút only (1 giờ = 60 phút) — needs author OK (Q1).

## Requirements
Skills: `clock-read-hour-half`, `clock-read-5min`, `clock-read-minute`, `clock-sang-chieu-24h`, `clock-elapsed-minutes`, `times-order-digital`, `roman-clock-hour`, `months-days-count`, `calendar-weekday`, `calendar-days-between`.

## Architecture
`src/time/`: entries, item-for-skill, `clock-generators.ts`, `calendar-generators.ts`, `calendar-math.ts`, `time-scene-types.ts`, `time-distractors.ts` (hands swapped, 5-min misread, sáng/chiều), `time-strings.ts`, oracles, tests.

## Related code files
Ownership: `src/time/**`.

## Implementation Steps
RED (oracles: hand table of clock readings, Zeller-free hand calendar fixtures) → implement → GREEN → gates.

## Todo list
- [ ] clock generators
- [ ] calendar math + generators
- [ ] strings

## Success Criteria
B66, B67 covered (scene-free `months-days-count`, `times-order-digital` playable immediately).

## Risk Assessment
| Risk | Countermove |
|---|---|
| Device locale/timezone leaks into calendar math | pure integer math, no `Date` locale APIs |

## Security Considerations
None.

## Next steps
17 renderer, 19 market level.
