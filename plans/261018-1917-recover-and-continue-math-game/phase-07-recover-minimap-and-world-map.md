# Phase 07: Recover minimap and world-map canvas renderer

## Context links
- [plan.md](plan.md) · [inventory §1 lines 1674-1912](research/researcher-01-recovered-code-inventory.md)
- Depends on: 03 (regions, roads, LCG). Parallel with: 05/06, 08 (G2).

## Overview
- Date: 2026-10-18
- Description: Recover the 2D canvas map system (`ag, og, Jl, lg, cg, hg, Ql`): seeded decor (LCG 23 and 7), view transform, minimap + full map drawing, hit-test, locked-region rendering. Overlay DOM wiring (2320-2394) stays with UI (08).
- Priority: P2
- Implementation status: pending
- Review status: not reviewed

## Key Insights
- Pure canvas 2D, deterministic given seeds and inputs -> parity via minimap + world-map screenshots and a hit-test golden (grid of points -> region id).
- Locked state comes from `isRegionUnlocked(region, questComplete)` (03); 13 will change the unlock rule, so keep the predicate injected, not hard-wired.

## Requirements
- Functions: `createMapDecor(seed)`, `computeMapView(canvas, mode)`, `drawMinimap(ctx, state)`, `drawWorldMap(ctx, state, selected)`, `hitTestRegion(view, x, y)`; names finalized by rename map.
- Identical pixels for minimap and world-map scenarios (DOM shot, canvas not masked for these).

## Architecture
```
src/map/map-decor.ts          (1674-1722) seeded decor
src/map/map-view-transform.ts view fit + hit-test
src/map/map-render.ts         (1723-1912) draw minimap/world map, locked regions (split in two files if > 200 lines)
src/map/map-hit-test.golden.test.ts
src/legacy/shims/map.js
```

## Related code files
- Create: above. Modify: `src/legacy/shims/map.js`, `tools/recovery/golden/generate-golden-traces.mjs` (add hit-test grid). Delete: `src/legacy/legacy-map.js`.

## Implementation Steps
1. Rename map + TS move.
2. Hit-test golden generated with the 01 harness (grid 40x40 per map mode).
3. Swap shim, parity minimap/map scenarios. Commit + tag `recovery-p07`.

## Todo list
- [ ] rename map + modules
- [ ] hit-test golden
- [ ] shim swap + parity

## Success Criteria
- `npm test -- src/map` green; `npm run test:parity` minimap + world map + region detail shots maxDiffPixelRatio <= 0.001.

## Scope Contract
- Changed: map rendering. Impacted: minimap HUD, map overlay. Will verify: hit-test golden + map screenshots. Skipped: 3D scenarios (unaffected, but full parity run still executes in CI).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Canvas font/emoji glyphs differ by platform | M | L | same machine baselines; emoji icons from region config verbatim |
| devicePixelRatio scaling changed | L | M | dpr fixed 1 in parity config; code path copied verbatim |
Rollback: shim back to legacy chunk.

## Security Considerations
- None.

## Next steps
- 08 wires overlay; 13 injects new unlock predicate.
