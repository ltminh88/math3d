# Phase 06: Field level (arrays, commutativity, tables 3 and 4)

## Context links
- [plan.md](./plan.md) · [brainstorm §3 option A table](../reports/brainstorm-261018-math-game-continuation.md) · [research 01 §7](research/researcher-01-threejs-game-architecture-report.md)
- Depends on: [phase 04](./phase-04-hub-map-vlm-guide-story.md)
- Parallel with: 05, 07, 09

## Overview
- Date: 2026-10-18
- Description: Farm-field diorama. Child plants seedlings into a rows x cols plot to reach N plants, then rotates the plot 90 degrees to see `3 x 4 = 4 x 3`. Tables 3 and 4. Each round restores one patch of the storm-flattened field.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed

## Key Insights
- Array model is the bridge from equal groups to commutativity; the rotation must be animated (reduced motion: instant swap + highlight).
- Planting one by one is tedious for 12-16 plants: tap a row header to fill a whole row (still counting visible), plus single-cell tap; drag a seedling basket across cells as the drag variant.
- Fact keys pooled (`mul:3x4`) so practising both orders feeds one mastery entry.

## Requirements
- 5 rounds; round types: (a) build array for "3 rows of 4" then enter total; (b) given array, pick both equations (multi-select 2 of 4 options); (c) box 3+: numeric entry, either order shown.
- Rotate button (and keyboard R) animates plot 90 degrees; equations update.
- Plants are `InstancedMesh` (one draw call); cells are drop zones in a grid.
- Hints: rung 2 row highlight, rung 3 skip count per row, rung 4 swapped known fact.
- Strings namespace `field`; budget <= 60 draw calls.

## Architecture
```
src/levels/field/
  index.ts                    levelDefinition {id:'field', regionId:'field', tables:[3,4], rounds:5}
  field-scene.ts
  field-diorama-builder.ts    soil plots, fence (instanced), scarecrow
  planting-grid.ts            grid model: cells, fill row, count, rotate (pure)
  planting-grid-view.ts       instanced plants bound to grid model
  field-round-flow.ts         round types a/b/c by box
  field-strings.ts
  planting-grid.test.ts       fill/rotate/count invariants (rows*cols == count after rotate)
  field-round-flow.test.ts
tests/e2e/field-level.spec.ts
```

## Related code files
Create: files above. Modify: none. Delete: none.

## Implementation Steps
1. Grid model (pure, tested) incl. rotate.
2. Diorama + instanced plant view + drop zones.
3. Round flow types a/b/c + wiring to session controller.
4. Rotation animation + equation labels (DOM projected labels, few).
5. Hints + celebration (field turns green patch by patch).
6. E2E: unlock state seeded via debug hook -> complete level -> Forest unlocked.

## Todo list
- [ ] grid model (+tests)
- [ ] diorama + plant view
- [ ] round flow (+tests)
- [ ] rotation + labels
- [ ] hints + celebration
- [ ] e2e spec

## Success Criteria
- Rotate keeps count and swaps rows/cols (unit); visible equation pair `3 x 4 = 12`, `4 x 3 = 12`.
- Completable via touch, mouse, keyboard; e2e green; <= 60 draw calls.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Multi-select confuses kids | M | M | playtest in 10; fallback to two sequential single choices |
| Projected DOM labels jitter on resize | L | L | recompute on resize only, not per frame |
Rollback: delete `src/levels/field/` -> region "coming soon".

## Security Considerations
- None (local only).

## Next steps
- Forest unlock depends on `field` completion.
