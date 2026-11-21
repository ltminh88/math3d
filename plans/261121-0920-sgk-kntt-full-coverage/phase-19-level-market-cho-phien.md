# Phase 19: Level "Chợ Phiên Tí Hon" — money, time, calendar, data

## Context links
- [plan.md](plan.md), [phase-18](phase-18-chapter-3-regions-config.md), [phase-17](phase-17-dialog-scenes-clock-calendar-money-data.md)
- `src/levels/cave/` (lightest level: chamber board + step kit), `levels/shared/level-types.ts:17-31`, `level-registry.ts:44-46`, `level-stages.ts`

## Overview
P2. Effort 8h (split scene / stage plan commits). Lane muse-min. Deps 17, 18. Branch `muse/level-market`. Reviewer recaptures parity.

## Key Insights
- Reuse the cave pattern: simple diorama (stalls) + DOM board that mounts dialog scenes from 04/17 — no new 3D interaction. Keeps ≤60 draw calls cheap.
- Stages follow textbook order: 1 clock, 2 calendar, 3 money, 4 data/chance, 5 mix.

## Requirements
- `levels/market/index.ts` (`LevelDefinition`, lazy load, 5 stages), stage plan, round flow, strings, test hook; quest chain + quest-card strings; level id `market` (M3D5 handles it).
- e2e `market-level.spec.ts` + `market-level-leak.spec.ts` (4 projects, tap only).

## Architecture
`src/levels/market/**` mirroring `levels/cave/` file set.

## Related code files
Ownership: `src/levels/market/**`, `tests/e2e/market-level*.spec.ts`, `src/ui/quest-chain-strings.ts` (market rows only — coordinate with 20 by rebase).

## Implementation Steps
RED e2e (enter gate, play stage 1, stars stored) → scene + plan → GREEN → leak + draw calls → preview → parity recapture.

## Todo list
- [ ] diorama + board
- [ ] stage plan (5)
- [ ] quest chain strings
- [ ] e2e + leak

## Success Criteria
Playable end to end on 4 projects; ≤60 draw calls; no memory growth.

## Risk Assessment
| Risk | Countermove |
|---|---|
| quest-chain-strings conflict with 20 | 20 rebases; one-line additions |

## Security Considerations
None.

## Next steps
21.
