# Phase 03: Map expansion — regions, roads, gates, scenery, map/HUD, quest chain, shell touch audit

## Context links
- [plan.md](plan.md), [scout 01](scout/scout-01-codebase-report.md) "World and map"
- `src/config/level-gate-config.ts` (post-scatter precedent), `src/world/world-build-pipeline.ts:27-56`, `world-scatter*.ts`, `src/map/map-render-*.ts`, `map-view-transform.ts`, `src/ui/quest-chain*.ts`, `src/levels/shared/level-progression.ts`, `level-host-ports.ts`
- `docs/recovery-notes.md` (preserved quirks, parity method)

## Overview
- Date 2026-10-31. Priority P1. Status done (branch `feat/ch2-p03-map-expansion`, 2026-11-01, not merged). Review: author review of map screenshots pending. No deps; parallel with 01/02.
- Three new regions + roads inside current bounds without touching `REGIONS`/`ROADS`/`WALKABLE_BOUNDS`; gates for garden/valley/workshop/cave; map, minimap, HUD and EN names see both lists; 9-stage quest chain; every shell step reachable by touch.

## Key Insights
- Goldens run the original bundle → `REGIONS`, `ROADS`, bounds, `regionAt`, `regionAtMapPoint`, map decor stay byte-equal. All new data lives in `src/config/expansion-regions.ts` / `expansion-roads.ts`, consulted by new combined lookups.
- Scatter draws from one LCG over the whole bounds → never feed expansion data into `isBlocked`. Instead, after `scatterWorld`, filter scatter instances/obstacles inside expansion footprints/roads (removal draws no RNG).
- three UUIDs draw `Math.random` → build expansion scenery and gates at the same pipeline point as `LEVEL_GATES` (after clouds/mountains), or later draws shift. Confirm where gates are built first.
- Map screen layer inherits the previous fill style (quirk) → expansion layer draws after the original code and sets every style explicitly; `map-render.parity.test.ts` keeps feeding only `REGIONS`.
- Free space (scout): east bank z 31..44 and z −44..−30 (x 10..70); west bank z 20..44 / −44..−20. Proposed: valley ≈ center [40,38] size [24,10]; workshop ≈ [40,−37] [24,12]; cave ≈ [−34,32] [16,14]; final coords from a footprint overlay probe.
- Quest card is a 5-cell row today; 9 stages do not fit a 412 px phone row → chapters.
- Existing shell has keyboard-worded hints ("nhấn E" in `quest-chain-strings.ts:21`, recovered `book-help-dialogs.ts`); touch path exists (`#interact`) but wording must follow pointer type.

## Requirements
- Types: `ExpansionRegionId = 'valley' | 'workshop' | 'cave'`; `AnyRegionId = RegionId | ExpansionRegionId`; `LevelGate.levelId` adds `garden | valley | workshop | cave`; `GateRequirement` adds `tower | garden | valley | workshop`.
- Gates: garden (in garden region, requires tower), valley (requires garden), workshop (requires valley), cave (requires workshop); signs e.g. "2, 4, 6, ?", "⊾", "cm²", "?".
- Lookups: `allRegions()`, `areaAt(x,z)` (expansion first, then original `regionAt`), `areaAtMapPoint`, HUD area label + minimap use them; EN names through `defineStrings('expansion-regions')` (legacy EN table untouched).
- Scenery builders (low-poly, recovered palette, baked to ≤3 meshes total): valley (stone cubes/cones/cylinders, a round pond, a big ê ke sculpture), workshop (shed, giant ruler fence, balance scale), cave (rock mound with lit mouth). Roads as flat strips from existing road ends. World draw calls +≤6.
- Obstacles for new scenery appended like gates (no RNG); gate placement e2e (`level-gate.spec.ts`) covers new gates.
- Progression/chain: `CHAIN_LEVELS` = field, forest, city, tower, garden, valley, workshop, cave; `QuestStage` follows; closing card after cave. Quest card: chapter 1 (bridge…tower) and chapter 2 (garden…cave), one row ≤5 cells for the current chapter + "Chương n · k/m" label; fits 412 px phone and both tablet orientations.
- `gateNameOf` + level layer labels for the new gates; "Sắp ra mắt" for gates whose level is not merged yet.
- Touch audit of the shell: every "nhấn E / M / phím" text has a coarse-pointer variant ("chạm nút Vào cổng", "chạm bản đồ nhỏ"); `#interact` and gate tap enter every gate; map opens by tap; targets ≥44 px. Recovered help dialog: switch text by `(pointer: coarse)` only (desktop parity text unchanged; mobile DOM changes attributed in re-baseline).
- Fix tablet-project failures in shell/world listed in `reports/tablet-baseline.md` (from 01, or own run if 01 not merged).

## Architecture
```
src/config/expansion-regions.ts  expansion-roads.ts  expansion-region-lookup.ts  level-gate-config.ts (mod)
src/world/expansion-scatter-clearing.ts  expansion-road-builder.ts
src/world/regions/geometry-valley-builder.ts  measurement-workshop-builder.ts  puzzle-cave-builder.ts
src/world/world-build-pipeline.ts (mod)
src/map/map-render-expansion-layer.ts  map-render-world-layer.ts (mod)  map-render-screen-layer.ts (mod)  map-view-transform.ts (mod)
src/ui/quest-chain-stage.ts (mod)  quest-chain.ts (mod)  quest-chain-chapters.ts  quest-chain-strings.ts (mod)  hud area label (mod)
src/levels/shared/level-progression.ts (mod)  level-host-ports.ts (mod)  src/ui/pointer-kind.ts  src/ui/book-help-dialogs.ts (mod)
```
`config/regions.ts` (156 lines) and the golden tests are not edited.

## Related code files
- Modify/create: above; e2e `level-gate.spec.ts`, `full-chain.spec.ts`, specs expecting the tower closing card. Delete: none.

## Implementation Steps
1. Probe: overlay footprints/roads on the map and the scatter (dev page/test), pick final coords free of existing regions, roads, gates, shop stall; write them into config.
2. RED: lookup unit tests (`areaAt` returns expansion ids inside footprints, original results everywhere else — compare with `region-at-point.json`); golden suite untouched and green.
3. RED: scatter clearing unit test (instances/obstacles inside footprints removed, all others identical to before, RNG call count unchanged); GREEN.
4. Scenery + roads builders at the gate build point; draw-call check (world +≤6).
5. Map/minimap/HUD expansion layer; `map-render.parity.test.ts` unchanged and green.
6. RED: quest stage tests for 9 stages + chapter split; GREEN; card layout at 412×839, 834×1194, 1194×834.
7. Gates + progression + host labels; gate e2e for the 4 new gates (tap on phone/tablet, E on desktop).
8. Touch audit + tablet fixes; pointer-aware strings.
9. Parity: run, check diffs are only scatter/scene/map/quiz-reshuffle/quest-card/help-on-mobile; re-baseline (attributed commit); determinism double run; goldens `--check`.

## Todo list
- [x] footprint probe + coords
- [x] lookups + tests
- [x] scatter clearing + tests
- [x] scenery + roads
- [x] map/minimap/HUD
- [x] 9-stage quest card (chapters)
- [x] gates + progression + labels + e2e
- [x] touch audit + tablet fixes
- [x] parity re-baseline + golden check

## Success Criteria
- Goldens byte-identical; `config.golden.test.ts` and map parity unit green; full e2e green on desktop, phone and both tablet projects (shell/world specs); no obstacle overlaps new gates; world draw calls within +6.
- Touch: every gate entered by tap/`#interact`; map/quest card usable by tap; no key hints on coarse pointers; targets ≥44 px; quest card verified at tablet portrait + landscape.

## Scope Contract
- Changed: config (expansion lists, gates), world pipeline + builders, map layers, HUD label, quest chain, progression, shell strings.
- Impacted: scatter output, scene/DOM parity, gate e2e, quest card e2e, save code level ids (M3D3 in 01).
- Will verify: golden check, unit (lookups, scatter, quest stage), full e2e all 4 projects, parity full run + re-baseline (world change = safety-critical config surface → full).
- Deliberately skipped: level internals (05–08), reasoning content.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Accidental change to REGIONS/ROADS/bounds or scatter RNG | L | H | Separate files; golden + RNG-count tests |
| New scenery draws Math.random before clouds | M | M | Build at gate point; parity diff review |
| Cave on west bank feels far / blocked by props | M | M | Probe; author decision 6 |
| Quest card cramped on phones | M | M | Chapter rows ≤5 cells; layout checked at 3 sizes |
| Help dialog change breaks desktop parity | L | M | Coarse-pointer-only variant |

## Security Considerations
- None.

## Next steps
- 05–08 register levels against these gates; 09 final re-baseline.

## Implementation notes (2026-11-01)
- North = top of the world map (−z). Final coords (footprint probe over the live scatter/obstacles):
  valley centre [40, −37] size [22, 10]; workshop [45, 38] [18, 10]; cave [−32, 32] [14, 12].
  Roads: (46,0)→(47.5,−34) valley; (46,0)→(46,36) workshop; (−36.5,6.5)→(−30,26.5) cave (from the gazebo road, east of the mound).
  Gates: garden (21.8, −6) "2, 4, ?" (the 9-char "2, 4, 6, ?" overflowed the 256 px sign), valley (44, −36.5) "△ □", workshop (50.5, 37) "cm²", cave (−27, 30) "?".
- Files: `src/config/expansion-{regions,roads,region-lookup,region-strings}.ts`; `src/world/expansion-{scatter-clearing,road-builder,world-builder}.ts`, `src/world/regions/{geometry-valley,measurement-workshop,puzzle-cave}-builder.ts` + `expansion-region-group.ts`; `src/map/{map-render-expansion-layer,map-area-hit-test,area-display-text}.ts`; `src/ui/{pointer-kind,book-help-touch-text}.ts`, `book-help-touch.css`.
- Scenery is built in `initLevelGates` right after the gates and baked into 3 meshes (ground, scenery, unlit glow). Gate frames and padlocks are baked too: world draw calls at the start view 420 → 416 with 8 gates + scenery.
- Map expansion pass runs only when `MapDrawState.expansion` is set; `map-render.parity.test.ts` (original draw) unchanged and green.
- Quest card: one chapter row + `#quest-chapter` label (created on the first chain card only, so bridge-stage DOM is unchanged); chapter 2 stages say "Sắp ra mắt" until `levelDefinition(id)` exists; VLM line via `chainGuideLine`.
- Touch: help dialog text by `(pointer: coarse)` (desktop text byte-identical), the "Nhấn M" completion note has a tap variant, E/M key badges hidden on coarse pointers, bottom toolbar buttons get a 44 px hit area.
- Edited outside the listed ownership (small, needed): `levels/shared/level-types.ts` (regionId → `AnyRegionId`), `levels/shared/level-gates.ts`, `level-gate-builder.ts`, `level-host-strings.ts`, `ui/guide-dialog.ts` (1 line), `ui/world-frame-hook.ts` (1 line), `ui/map-overlay.ts`, `ui/world-labels.ts`; e2e `tower-level`, `save-code-full-progress`, `shop-purchase` (camera snap before draw-call samples: fixes the tablet-portrait 221 > 220 flake from reports/tablet-baseline.md).
- Parity re-baseline attributed in `reports/parity-rebaseline-p03.md`; screenshots in `reports/p03-screens/`.
