# Phase 15: Forest level "Rừng Nhân Chia" (sharing equally, fact families)

## Context links
- [plan.md](plan.md) · **Spec: [old phase 07 forest level](../261018-1803-vlm-math-game-mvp/phase-07-forest-level.md)** (round types, sharing model, fact-family card, exact division only, `:` sign in vi) · [phase 13 level host](phase-13-level-host-and-region-progression.md) · [phase 14 deltas](phase-14-field-level-in-meadow.md)
- Depends on: 13. Parallel with: 14, 17 (G7).

## Overview
- Date: 2026-10-18
- Description: Implement old-07 Forest level as a level module behind the forest gate. Only deltas are written here.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed

## Deltas vs old phase 07
- Host: `LevelDefinition {id:'forest', regionId:'forest', tables:[2,3,4,5], rounds:5, requires:'field'}`; runs in 13's host.
- Same visual/audio/reward/input deltas as [phase 14](phase-14-field-level-in-meadow.md) (recovered palette, VLM framing, recovered synth, scoring + one-time completion bonus, kept input + number pad).
- Trees reuse recovered tree/cone builders (`props-house-tree.ts`) so the clearing matches the world's forest region; animals new low-poly (icosahedron/cone style).
- E2E end state: map shows City/Tower "Sắp ra mắt" (already from 13), division keys `div:12/3` recorded.
- Must NOT edit 14's files; shared helpers needed by both go to `src/levels/shared/` only via a small follow-up in 18 (avoid G7 collision) — duplicate tiny helpers temporarily if needed.

## Key Insights
- See old 07 (`:` sign in strings, deal-one-each tap alternative, exact dividends, division from mult facts box >= 3).

## Requirements
- As old 07 + deltas. Strings namespace `forest`.

## Architecture
```
src/levels/forest/index.ts  forest-scene.ts  forest-diorama-builder.ts  animal-friend-factory.ts  fruit-pile.ts
src/levels/forest/sharing-model.ts  fact-family-card.ts  forest-round-flow.ts  forest-strings.ts
src/levels/forest/sharing-model.test.ts  forest-round-flow.test.ts
tests/e2e/forest-level.spec.ts
```

## Related code files
- Create: above. Modify: none. Delete: none.

## Implementation Steps
1. Sharing model + tests (old 07 step 1).
2. Diorama (recovered tree builders), animals, fruit; drag + tap + deal-one-each.
3. Round flow a/b/c + fact-family card (+ tests).
4. Hints + celebration + result.
5. E2E: `__game` seeds field complete -> enter forest gate -> complete -> `div:` keys in store.

## Todo list
- [ ] sharing model (+tests)
- [ ] diorama, animals, fruit
- [ ] round flow + fact-family card (+tests)
- [ ] hints + celebration
- [ ] e2e

## Success Criteria
- Old 07 criteria + `npm run test:e2e -- forest-level` green both projects; <= 60 draw calls in level.

## Scope Contract
- Changed: new folder only. Impacted: none outside level. Will verify: unit + e2e. Skipped: parity.

## Risk Assessment
See old 07 table, plus: style mismatch -> author screenshot review.
Rollback: delete `src/levels/forest/`.

## Security Considerations
- None (local only).

## Next steps
- 18 playtest; post-MVP City/Tower.
