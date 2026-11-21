# Phase 14: Money — Vietnamese notes (B68, money word problems)

## Context links
- [plan.md](plan.md), [research 02 §B68](research/researcher-02-hk2-missing-topics.md)

## Overview
P2. Effort 4h. Lane muse-min. Deps 02. Branch `muse/money`.

## Key Insights
- Notes 1 000 … 500 000 đ as flat coloured cards with value text (scene `kind: 'notes'`), never banknote images (legal/copyright). Coins pending Q5.
- Picking notes for an amount = multi-select kit (exists); change = number pad.

## Requirements
Skills: `money-recognize`, `money-total-notes`, `money-exchange`, `money-change-back`, `money-pick-notes` (T3 fewest notes), `money-wp`.
- Totals ≤ 100 000 (B68 scope).

## Architecture
`src/money/`: entries, item-for-skill, `money-generators.ts`, `vnd-denominations.ts`, `money-scene-types.ts`, `money-distractors.ts`, `money-strings.ts`, oracles, tests.

## Related code files
Ownership: `src/money/**`.

## Implementation Steps
RED (oracle: greedy-free brute-force min notes in test) → implement → GREEN → gates.

## Todo list
- [ ] denominations + generators
- [ ] change / exchange / pick
- [ ] strings

## Success Criteria
B68 covered; `money-change-back` scene-free.

## Risk Assessment
| Risk | Countermove |
|---|---|
| Card colours read as real notes | stylised cards, no portraits/emblems |

## Security Considerations
No real-note imagery.

## Next steps
17, 19.
