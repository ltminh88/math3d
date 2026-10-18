# Phase 05: Recover world static builders (primitives, sky, terrain, props, regions)

## Context links
- [plan.md](plan.md) · [inventory §1 lines 282-741, §2 three ids, §6 pixel risks](research/researcher-01-recovered-code-inventory.md)
- Depends on: 03. Parallel with: 07, 08 (G2). Followed by 06 (same folder).

## Overview
- Date: 2026-10-18
- Description: Extract the static scene builders of world class `$m` into TS functions that take a typed `WorldBuildContext` (scene, material cache, obstacle registry, lowPower flag). The legacy class keeps its constructor and order, but its builder methods now delegate to the TS functions.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed

## Key Insights
- Build order matters: material cache insertion order, obstacle list (consumed by scatter in 06), and later `mergeStatic` traversal order all depend on it. Delegation keeps the constructor's call order untouched.
- "sphere()" = `IcosahedronGeometry(r, 1)`; flowers/rocks detail 0; cones = `ConeGeometry(r,h,7)`; terrain flat-shaded vertex-colored 200x200 plane; shadow normalBias 0.045 / bias -3e-4. Wrong class = visible diff; scene-graph JSON catches it before pixels.
- Signs use CanvasTexture with Baloo 2 font string -> must render after fonts load exactly as legacy did.
- Magic numbers verbatim; decimal colors -> hex mechanically only.

## Requirements
- Builders: primitives (material by color cache, mesh/box/sphere/cylinder/block/regionGroup/sign, obstacle registry), sky dome ShaderMaterial + groundHeight, terrain + river + ripples(60) + plaza + roads, house + tree props, village/garden, meadow/forest, city/tower, west bank.
- Each file < 200 lines; no behavior change; region text from `src/config/regions.ts`.
- Keep the shader source string verbatim (needed for 10 deprecation check).

## Architecture
```
src/world/world-build-context.ts       type WorldBuildContext { scene, materials: Map, obstacles: Circle[], lowPower, animated: Object3D[] }
src/world/world-primitives.ts          (282-329)
src/world/sky-dome.ts                  (330-345) incl. groundHeight
src/world/terrain-river-roads.ts       (346-439)
src/world/props-house-tree.ts          (440-479)
src/world/regions/village-garden-builder.ts   (480-539)
src/world/regions/meadow-forest-builder.ts    (540-615)
src/world/regions/city-tower-builder.ts       (616-684)
src/world/west-bank-builder.ts         (685-741)
src/legacy/legacy-world.js             methods delegate: `village(){ return buildVillage(this) }`
```

## Related code files
- Create: above. Modify: `src/legacy/legacy-world.js`, `src/legacy/shims/world.js` (unchanged export surface). Delete: none.

## Implementation Steps
1. Rename map for lines 282-741 (method locals); review.
2. Define `WorldBuildContext` matching fields the legacy instance already has (pass `this`).
3. Move builders group by group; after each group run parity (desktop + mobile) — 5 small gates, not one big one.
4. Commit + tag `recovery-p05`.

## Todo list
- [ ] rename map
- [ ] context type
- [ ] primitives + sky (+ parity)
- [ ] terrain/river/roads (+ parity)
- [ ] props + 3 region builders (+ parity)
- [ ] west bank (+ parity)

## Success Criteria
- `npm run test:parity`: scene-graph JSON + WebGL draw-call/triangle counts equal; canvas maxDiffPixelRatio <= 0.002 all scenarios, both projects.
- `npm run typecheck` green for `src/world/**`.

## Scope Contract
- Changed: static world geometry code. Impacted: every 3D screenshot, scatter (obstacles), mergeStatic.
- Will verify: structural scene dump (fast, exact) then pixel parity.
- Skipped: golden unit tests of 03/04 (untouched modules).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Material cache insertion order changes -> merge order changes | M | M | same call order; scene dump compares merged geometry vertex counts |
| Canvas sign text renders before font ready | L | M | keep original timing; fonts.ready in scenarios |
| `this` binding lost in moved closures (animation callbacks) | M | M | context passed explicitly; idle-orbit scenarios capture animations |
Rollback: revert delegation commit per group (tags per sub-step allowed).

## Security Considerations
- None (rendering only).

## Next steps
- 06 moves the rest of the class and replaces it with a composed `world.ts`.
