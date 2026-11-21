# Phase 20: Level "Lâu Đài Số" — big numbers, rounding, Roman, big arithmetic

## Context links
- [plan.md](plan.md), [phase-18](phase-18-chapter-3-regions-config.md), [phase-16](phase-16-dialog-scenes-numbers-and-fractions.md), phases 08, 11
- `src/levels/cave/` pattern

## Overview
P2. Effort 8h. Lane muse-88. Deps 08, 11, 16, 18. Branch `muse/level-numberfort`. Reviewer recaptures parity.

## Key Insights
Stages in textbook order: 1 số đến 10 000 + so sánh, 2 làm tròn + La Mã, 3 +/−/×/: 10 000, 4 số đến 100 000, 5 +/−/×/: 100 000 + mix.

## Requirements
`levels/numberfort/**` (cave-like), 5 stages, quest chain strings, e2e + leak specs (4 projects).

## Architecture
Same as 19.

## Related code files
Ownership: `src/levels/numberfort/**`, `tests/e2e/numberfort-level*.spec.ts`, `src/ui/quest-chain-strings.ts` (numberfort rows).

## Implementation Steps
RED e2e → diorama + plan → GREEN → leak/draw calls → preview → parity.

## Todo list
- [ ] diorama + board
- [ ] stage plan
- [ ] e2e + leak

## Success Criteria
As 19.

## Risk Assessment
| Risk | Countermove |
|---|---|
| Long numbers overflow board on phone | grouped digits formatter; phone e2e checks no horizontal scroll |

## Security Considerations
None.

## Next steps
21.
