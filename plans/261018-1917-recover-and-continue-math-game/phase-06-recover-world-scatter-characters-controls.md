# Phase 06: Recover scatter, characters, bridge, controls, camera, world orchestrator

## Context links
- [plan.md](plan.md) · [inventory §1 lines 155-281, 742-1255; §6 RNG order, lowPower](research/researcher-01-recovered-code-inventory.md) · [phase 05](phase-05-recover-world-static-builders.md)
- Depends on: 05. Parallel with: 07, 08 (G2).

## Overview
- Date: 2026-10-18
- Description: Recover the rest of `$m`: seeded scatter (instanced trees/rocks/flowers), Milo + avatar, bridge, clouds/mountains, mergeStatic, player controller, camera rig, pointer/wheel input, frame loop. Replace the legacy class with a composed `World` in TS that keeps the same public API used by UI.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed

## Key Insights
- Scatter uses LCG seed 1337, decorate seed 91. RNG calls inside `||` chains consume conditionally -> copy expressions verbatim; never "simplify" conditions.
- lowPower counts (150/230, 450/900, 700/1300) and shadow map 1024/2048 must branch exactly as original; mobile-pixel baselines verify the lowPower path.
- Loop: `dt = min(clock.getDelta(), 0.05)`; `onFrame` throttled every 2nd frame; idle orbit + `setViewOffset` on wide screens; sky follows camera; shadow box follows target.
- Burst sparks use `Math.random` (seeded in parity runs) - keep call order.
- Quirks kept: `regionById('forest')` excluded from scatter exclusion; `setBridge(0)` on reset leaves obstacles; bridge gating `|z|<1.25` once built.
- Public API (used by UI chunk, stable names): constructor(canvas,...), setAvatar, setBridge, resetCamera, zoom, jump, clearInput, moveToScreen, nearMilo, project, heading, burst, onFrame/onJump/onSceneClick hooks, dispose, state/camera fields read by UI. Inventory exact list -> `world-public-api.ts` interface.

## Requirements
- `World` composes: renderer setup, build pipeline (05 builders + scatter/decorate/characters/bridge/merge in original order), `PlayerController`, `CameraRig`, `WorldInput`, `FrameLoop`. No file > 200 lines.
- Controls identical: WASD/arrows + joystick vector, tap-to-move raycast on y=0, speed 6.5, jump v 6.5 g 18, collision circles.
- `three` usage unchanged (still 0.180.0).

## Architecture
```
src/world/world-scatter.ts            (742-879) instanced trunks/crowns/cones, rocks, flowers/grass
src/world/characters-milo-avatar.ts   (880-913)
src/world/bridge-segments.ts          (914-936)
src/world/sky-decor-clouds-mountains.ts (937-990)
src/world/merge-static-meshes.ts      (991-1038)
src/world/player-controller.ts        (1045-1141 minus camera)
src/world/camera-rig.ts               (camera parts of 1039-1066, 1157-1251)
src/world/world-input.ts              (204-235, 1068-1089)
src/world/world-renderer-setup.ts     (155-203 renderer, lights, fog, lowPower)
src/world/world-frame-loop.ts         (1189-1255)
src/world/world-public-api.ts         interface consumed by UI
src/world/world.ts                    orchestrator class implementing the API (<200 lines)
src/legacy/shims/world.js             -> export { World as <legacy name> } from '../../world/world'
```

## Related code files
- Create: above. Modify: `src/legacy/shims/world.js`. Delete: `src/legacy/legacy-world.js`.

## Implementation Steps
1. Rename maps (scatter, characters, controls, loop).
2. Move scatter/decorate/characters/bridge/merge as builders on `WorldBuildContext` (parity after each).
3. Extract controller, camera rig, input, loop; keep state fields where UI reads them.
4. Write `world.ts` orchestrator; swap shim; delete legacy chunk.
5. Add 2 interaction parity scenarios: keyboard walk 2 s to bridge, tap-to-move to Milo (positions compared at fixed clock steps).
6. Commit + tag `recovery-p06`.

## Todo list
- [ ] rename maps
- [ ] scatter + decorate (+ parity both projects)
- [ ] characters + bridge + merge (+ parity)
- [ ] controller, camera, input, loop
- [ ] orchestrator + shim swap
- [ ] movement parity scenarios

## Success Criteria
- `npm run test:parity` thresholds of 02 met incl. idle-orbit shots at 2/6/12 s, bridge 0/3/6, movement scenarios (player position within 1e-3 of live trace at each step).
- Scene-graph JSON equal (instance counts per lowPower class).
- `wc -l src/world/**/*.ts` each < 200.

## Scope Contract
- Changed: whole world runtime. Impacted: all 3D shots, movement, labels projection used by UI.
- Will verify: structural + pixel + movement trace parity on both device classes.
- Skipped: pure-logic goldens (untouched).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| RNG consumption order drift in scatter | M | H | verbatim expressions; instance matrices compared in scene dump |
| UI reads private fields not in API list | M | M | grep UI chunk for `_e.` accesses before writing interface |
| Frame loop timing differs (throttle parity) | L | M | onFrame call count asserted in trace |
Rollback: shim back to `legacy-world.js` from tag `recovery-p05`.

## Security Considerations
- None (rendering/input only).

## Next steps
- 09 removes legacy; 10 bumps three (shadow type in `world-renderer-setup.ts`); 13 adds level host hooks to `world.ts`.
