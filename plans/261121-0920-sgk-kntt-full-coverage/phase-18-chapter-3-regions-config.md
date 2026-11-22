# Phase 18: Chapter-3 regions — config, roads, signposts, gates (no levels yet)

## Context links
- [plan.md](plan.md) decision 6, [scout §3](scout/scout-01-integration-points.md)
- `src/config/expansion-regions.ts:8-61`, `expansion-roads.ts`, `expansion-signposts.ts`, `expansion-region-lookup.ts`, `world/world-build-pipeline.ts:40-47`, `world/expansion-scatter-clearing.ts`, `world/expansion-world-builder.ts`, `config/level-gate-config.ts:6-29,46-111`, `map/map-render-expansion-layer.ts`
- `plans/261031-1933-reasoning-geometry-and-map-expansion/` (how chapter 2 was placed)

## Overview
P2. Effort 6h. Lane muse-min (moved from muse-88 on 2026-11-23); reviewer recaptures parity (world/map visuals). Deps 03. Branch `muse-min/chapter3-regions`.

## Key Insights
- World bounds x −50..70, z −44..44. Taken: village (−13,0 34×40), garden, meadow, forest, city, tower, valley (40,−37), workshop (45,38), cave (−32,32). Candidates to probe: west bank north (≈ −38,−32, mirror of cave) and east bank between city and tower (≈ 60,−2) — roads may block the latter; run the footprint probe used in chapter 2 before choosing.
- Added after the scatter, no RNG draw before gates; REGIONS/ROADS/WALKABLE_BOUNDS untouched; golden traces byte-equal.
- Two regions only: `market` "Chợ Phiên Tí Hon" (world 10, 🏮), `numberfort` "Lâu Đài Số" (world 11, 🏰). Gates locked until cave stage 1 (Q4).

## Requirements
- `ExpansionRegionId` += `market | numberfort`; roads/signposts (±30° test); map layer; lookup; strings vi/en; gate config entries pointing to level ids that 19/20 create (gate shows "Sắp mở" until the level registers).
- Draw calls in world unchanged budget-wise (baked meshes like chapter 2, ~+2–4 calls); world leak spec green.

## Architecture
Config + baked region builders `world/regions/market-region-builder.ts`, `numberfort-region-builder.ts` (low-poly, merged geometry).

## Related code files
Ownership: `src/config/expansion-*`, `src/config/level-gate-config.ts`, `src/world/regions/{market,numberfort}-region-builder.ts`, `src/world/expansion-world-builder.ts`, `src/map/map-render-expansion-layer.ts`, `tests/e2e/chapter3-regions.spec.ts`.

## Implementation Steps
1. Footprint probe → choose centres (state numbers in PR).
2. RED: lookup/signpost tests, gate locked/unlocked e2e (seeded cave done), golden `--check`.
3. Builders + config; GREEN; draw-call + leak checks; preview; reviewer recaptures parity.

## Todo list
- [ ] probe + placement
- [ ] config/roads/signposts/strings
- [ ] builders + map layer
- [ ] e2e, golden, parity handoff

## Success Criteria
Two new regions visible and walkable after the bridge, gates unlock after cave stage 1; golden byte-equal.

## Risk Assessment
| Risk | Countermove |
|---|---|
| No clean east-bank spot | both regions on west/north bank; or shrink size |
| Golden drift | add strictly after scatter; `--check` in CI |

## Security Considerations
None.

## Next steps
19, 20 register levels.
