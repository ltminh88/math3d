# Phase 25: Level scenes — pinch / wheel / button zoom

## Context links
- [plan.md](plan.md) · issue [#46](https://github.com/ltminh88/math3d/issues/46) (author, iPad, forest stage 1)
- Level cameras: `src/levels/{forest/forest-camera,field/field-stage,city/city-camera,tower/tower-climb-camera,garden/garden-camera,valley/valley-camera,workshop/workshop-camera,cave/cave-chamber-camera}.ts`; world zoom: `src/world/world-input.ts`, `src/world/camera-rig.ts`

## Overview
P2, 5h, lane: whichever Muse frees first. Levels use fixed auto-fit cameras; no pinch anywhere; page has `touch-action: none` → no zoom on iPad.

## Requirements
- Shared helper `src/levels/shared/level-zoom.ts`: 2-pointer pinch, wheel, in-level +/− buttons (≥44 px); zoom factor clamped 0.6×–1.6× of the auto-fit distance; keeps the free-area view offset.
- One-finger taps/drags (answers, dragging) unaffected; pinch never triggers an answer.
- Forest first, then wire every level camera (one small adapter each).

## Implementation Steps
1. RED unit: pinch distance ratio → factor, clamping, reset on new round.
2. Helper + forest; e2e tablet: synthetic two-pointer pinch changes camera distance; one tap still answers.
3. Wire remaining levels; draw calls/leak specs unchanged.

## Success Criteria
On iPad, every level zooms by pinch and buttons; answering by tap unchanged.

## Risk Assessment
Pointer conflicts with drag interactions (field, workshop ruler) → only activate on ≥2 active pointers; e2e on those levels.

## Security Considerations
None.
