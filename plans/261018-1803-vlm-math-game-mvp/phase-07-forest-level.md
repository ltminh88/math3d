# Phase 07: Forest level (sharing equally, fact families)

## Context links
- [plan.md](./plan.md) · [brainstorm §3 option A table](../reports/brainstorm-261018-math-game-continuation.md) · [research 01 §7 facts model](research/researcher-01-threejs-game-architecture-report.md)
- Depends on: [phase 04](./phase-04-hub-map-vlm-guide-story.md)
- Parallel with: 05, 06, 09

## Overview
- Date: 2026-10-18
- Description: Forest clearing with animal friends whose fruit was scattered by the storm. Child shares fruit equally among animals (partitive division) and packs fruit into baskets of k (quotative division), then completes the fact family (`3 x 4`, `4 x 3`, `12 : 3`, `12 : 4`). Exact division only, tables 2-5.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed

## Key Insights
- Vietnamese division sign is `:` in GDPT 2018 textbooks (show `:`; `÷` only in en locale). Put symbol in strings, not code.
- Division facts drawn from mult facts with box >= 3 when available (inverse builds on known multiplication); else from tables 2-3 at concrete stage.
- Dealing one-by-one round robin is the natural child strategy: support "deal one to each" button as tap alternative to dragging fruit.
- No remainders in MVP (plan Q3): generator only picks exact dividends.

## Requirements
- 5 rounds: (a) share N fruit among m animals -> enter per-animal count; (b) N fruit into baskets of k -> enter basket count; (c) fact-family card: fill 4 blanks via number pad; box 3+: symbolic only.
- Uneven distribution is allowed while dealing; "check" shows which animal has too many/few (shape + sound, not colour alone).
- Hints: rung 2 deal animation one per animal, rung 3 skip count, rung 4 inverse multiplication (`? x 3 = 12`).
- Strings namespace `forest`; budget <= 60 draw calls.

## Architecture
```
src/levels/forest/
  index.ts                     levelDefinition {id:'forest', regionId:'forest', tables:[2,3,4,5], rounds:5}
  forest-scene.ts
  forest-diorama-builder.ts    instanced trees, clearing, stumps
  animal-friend-factory.ts     low-poly rabbit/squirrel/bear with basket drop zones
  fruit-pile.ts                pickable fruit, deal-one-each action
  sharing-model.ts             pure: counts per basket, isEqual, remaining
  fact-family-card.ts          DOM card with 4 equation blanks
  forest-round-flow.ts
  forest-strings.ts
  sharing-model.test.ts
  forest-round-flow.test.ts
tests/e2e/forest-level.spec.ts
```

## Related code files
Create: files above. Modify: none. Delete: none.

## Implementation Steps
1. Sharing model (pure, tested): deal, move, equality check, exact-only guard.
2. Diorama, animals, fruit pile; drag + tap + deal-one-each.
3. Round flow a/b/c + fact-family card.
4. Hints + celebration (animals cheer, fruit returns to trees).
5. E2E: complete level; assert `div:12/3`-style keys recorded; map shows City/Tower "coming soon".

## Todo list
- [ ] sharing model (+tests)
- [ ] diorama, animals, fruit
- [ ] round flow + fact-family card (+tests)
- [ ] hints + celebration
- [ ] e2e spec

## Success Criteria
- All 4 fact-family equations accepted only when correct; division keys recorded in store.
- Completable via touch, mouse, keyboard; e2e green; <= 60 draw calls.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Many fruit objects (up to 20) as separate meshes | L | M | shared geometry/material; instancing if bench shows >60 calls |
| Partitive vs quotative confuses | M | M | story framing differs clearly (friends vs baskets); playtest |
Rollback: delete `src/levels/forest/`.

## Security Considerations
- None (local only).

## Next steps
- City/Tower post-MVP reuse `sharing-model` concept for remainders.
