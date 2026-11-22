# Phase 24: Shop — 8–12 new items

## Context links
- [plan.md](plan.md) · issue [#45](https://github.com/ltminh88/math3d/issues/45) · phase 23 (multi-equip)

## Overview
P3, 5h, lane muse-min. Add 8–12 cosmetics across VLM / avatar / village decor, prices 20–120 coins, each on a body spot (head/neck/back) or its own decor spot.

## Key Insights
- Ideas: VLM — star wizard hat, round glasses, book bag, new staff; avatar — backpack, straw hat, raincoat, red shoes; decor — rainbow arch, peach-blossom tree, chicken coop, windmill, number signboard.
- Original low-poly art only (vertex-colour parts), no copied assets.

## Requirements
- Every new item passes the phase-22 visibility test; village draw-call budget kept; vi + en names; prices/ids follow `COSMETIC_ID_PATTERN`.

## Architecture
Append to `COSMETIC_CATALOG` + builders; decor spots table.

## Related code files
Ownership: `src/shop/cosmetic-catalog.ts`, `src/shop/cosmetic-mesh-builders.ts` (may split into `*-builders-*.ts` to stay <200 lines), `src/shop/shop-strings.ts`, tests.

## Implementation Steps
1. RED: catalog test counts/prices/spots; visibility test covers new items.
2. Build meshes; strings; screenshots of each item worn/placed.

## Todo list
- [ ] items · [ ] strings · [ ] tests · [ ] screenshots

## Success Criteria
Shop shows the new items; all wearable/placeable and visible; draw calls within budget.

## Risk Assessment
Village draw calls: verify `data-draw-calls` with all decor placed.

## Security Considerations
None.

## Next steps
Phase 21 close-out covers shop docs.
