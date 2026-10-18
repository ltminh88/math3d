# Phase 13: Level host inside the recovered world + region progression

## Context links
- [plan.md](plan.md) · [old phase 04 hub/levels shared](../261018-1803-vlm-math-game-mvp/phase-04-hub-map-vlm-guide-story.md) (only `levels/shared` concepts reused; its hub/story dropped, its shop spec moves to [phase 19](phase-19-cosmetics-shop-in-village.md)) · [phase 12](phase-12-store-migration-and-learning-integration.md)
- Depends on: 12. Parallel with: 16 (G6).

## Overview
- Date: 2026-10-18
- Description: Add a level gate in the meadow ("Cánh Đồng Phép Tính") and forest ("Rừng Nhân Chia") regions; walking up to it shows the existing interact button; entering pauses the world and runs a level scene on the same renderer; finishing records `LevelProgress` and returns the player to the gate. Levels self-register.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed

## Key Insights
- Keep original world behavior: regions stay walkable exactly as today (they unlock after the bridge quest). Only the level gate is gated: Field gate needs bridge quest complete, Forest gate needs Field completed. City/Tower show "Sắp ra mắt" on their sign; no gate.
- One renderer, two scenes: world loop paused (no render, input detached), level loop owns renderer + canvas; dispose level scene on exit (old `scene-disposer.ts` kept in 11). No second WebGL context (iPad memory).
- Interaction reuse: `#interact` button + proximity check already used for the guide NPC VLM (ex-Milo, renamed in 09) -> generalize to "nearest interactable" (VLM, gates; 19 registers the shop stall) without changing VLM dialog behavior. Registry API `registerInteractable({id, position, radius, label, onInteract})` is the contract 19 consumes.
- Levels use kept `src/core/input/**` (drop-zone, tap-select, raycast-picker, keyboard guard) and `src/ui/kit/{number-pad,choice-buttons,aria-announcer}` restyled with recovered CSS tokens.
- Test builds (`--mode test`) expose `window.__game` (seed progress, teleport, read store) for e2e; absent from prod (asserted in 18).

## Requirements
- `LevelDefinition {id, regionId, tables, rounds, requires: 'bridge'|'field'|null, load(): Promise<LevelModule>}` (dynamic import -> level code split from main bundle).
- `LevelContext`: renderer, canvas, synth audio, game-store, learning API, input helpers, `defineStrings`, announcer, `exit(result)`.
- Result -> `commitSession(delta)` with level progress (stars, bestScore, completedAt) via session recorder; XP/coins rules from `src/learning/scoring.ts` for level rounds ONLY; bridge quest rewards stay frozen as in 12 (+10 XP, +5 coins, combo >= 3, 5 levels) and the host never routes bridge answers through `scoring.ts`.
- Gate visuals: low-poly arch/sign built with recovered primitives; lock icon + label projected like region labels; map detail shows level state.
- World map/minimap: region lock logic unchanged; region detail shows gate state text.

## Architecture
```
src/levels/shared/level-types.ts          LevelDefinition, LevelContext, LevelResult
src/levels/shared/level-registry.ts       import.meta.glob('/src/levels/*/index.ts', {eager:false}) minus shared
src/levels/shared/level-progression.ts    pure: isGateOpen(levelId, progress)
src/levels/shared/level-host.ts           pause world, run level loop, exit/dispose, commit result
src/levels/shared/level-gate-builder.ts   gate mesh in region, interactable registration
src/levels/shared/level-host-strings.ts   defineStrings('levelHost', vi/en)
src/levels/shared/test-debug-hook.ts      window.__game (test mode only)
src/world/world.ts                        + pause()/resume(), interactables registry (VLM + gates; public API for 19)
src/config/regions.ts                     + gate positions for meadow/forest, comingSoon for city/tower
src/ui/world-labels.ts  src/ui/guide-dialog.ts  src/map/map-render.ts   gate label/state, interact routing
```

## Related code files
- Create: `src/levels/shared/**` + `level-progression.test.ts`, `level-registry.test.ts`. Modify: files listed above. Delete: none.

## Implementation Steps
1. Progression + registry (pure, tested).
2. World pause/resume + interactables; VLM flow unchanged (parity guide-dialog scenario must stay identical).
3. Gate builder + labels; region detail text.
4. Level host loop + dispose + commit; "Sắp ra mắt" toast when level module missing.
5. Test debug hook; e2e `tests/e2e/level-gate.spec.ts`: seeded progress -> teleport to meadow gate -> locked before bridge, open after; enter/exit returns to gate; renderer.info.geometries back to baseline after exit (leak check).

## Todo list
- [ ] progression + registry (+ tests)
- [ ] world pause/resume, interactables
- [ ] gates + labels + map text
- [ ] level host + commit
- [ ] debug hook + e2e

## Success Criteria
- `npm test` + `npm run test:e2e -- level-gate` green; `npm run test:parity`: all original scenarios identical except shots containing the new gates (re-baselined, listed).
- 10x enter/exit: `renderer.info.memory.geometries/textures` return to pre-entry values.

## Scope Contract
- Changed: world (pause, interactables), regions config, labels/map text, new levels/shared. Impacted: VLM interaction, map, every world screenshot near gates.
- Will verify: unit (progression), e2e (gate flow + leak), parity (unchanged scenes).
- Skipped: store tests (untouched).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Interact button conflicts VLM vs gate | M | M | nearest-wins with distance ties to VLM; e2e both |
| Memory leak across level entries | M | H | disposer + leak e2e |
| Gate placement collides with scatter/obstacles | M | L | place on existing plaza/road points; add obstacle circle after scatter (does not shift RNG) |
Rollback: remove gates (config flag) -> world as after 12.

## Security Considerations
- Debug hook compiled only in test mode (`import.meta.env.MODE === 'test'`).

## Next steps
- 14/15 implement levels against `LevelContext`; 19 adds the shop stall via the interactables registry.
