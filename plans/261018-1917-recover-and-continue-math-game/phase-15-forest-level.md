# Phase 15: Forest level "Rừng Nhân Chia" (sharing equally, fact families)

## Context links
- [plan.md](plan.md) · **Spec: [old phase 07 forest level](../261018-1803-vlm-math-game-mvp/phase-07-forest-level.md)** (round types, sharing model, fact-family card, exact division only, `:` sign in vi) · [phase 13 level host](phase-13-level-host-and-region-progression.md) · [phase 14 deltas](phase-14-field-level-in-meadow.md)
- Depends on: 13. Parallel with: 14, 17 (G7).

## Overview
- Date: 2026-10-18
- Description: Implement old-07 Forest level as a level module behind the forest gate. Only deltas are written here.
- Priority: P1
- Implementation status: done (2026-10-21, awaiting review)
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
- [x] sharing model (+tests)
- [x] diorama, animals, fruit
- [x] round flow + fact-family card (+tests)
- [x] hints + celebration
- [x] e2e

## Implementation notes (2026-10-21)
- `index.ts` only holds the definition; `load: () => import('./forest-scene')` builds as its own
  chunk (`forest-scene-*.js` ~34 kB, `forest-scene-*.css` 4 kB). Strings are registered through
  `ctx.defineStrings('forest', …)` once (cached); VLM's name comes from `tc('guideName')`.
- Facts: `forestFactPool` = inverse divisions (`div:p/d`, tables 2-5) of box 3+ multiplication
  facts plus divisions already seen; with fewer than 3, the concrete starter set (tables 2-3,
  dividend <= 20). `ctx.learning.planSession(pool, 5)` picks the run. Rounds cycle share / pack /
  family / share / pack; a fact at box 3+ or with more than 20 fruit is a fact family (symbolic).
  One `learning.record` per round (fact-family blanks share one outcome); no completion bonus
  in the level (the host adds it).
- Sharing model: per-fruit spots (pile or group). Share = uncapped (uneven dealing allowed);
  pack = baskets of k that appear one after another. "Kiểm tra" marks friends with ▲/▼/✓
  chips (shape + colour) and a tone. Inputs: drag, tap fruit then friend, keyboard (arrows +
  Enter through the shared InteractionController), "Chia mỗi bạn một quả" / "Xếp đầy một giỏ",
  and the kit number pad (digits + Enter). The interaction is created before the pad so the 3D
  layer sees Enter first (it passes Enter on when nothing in 3D has focus).
- Hints: rung 1 encourage, 2 model (auto deal in 3D every 0.45 s, instant with reduced motion;
  stone groups for the fact family), 3 skip count, 4 `? × d = p`; 3 misses reveal the answer
  (recorded as not correct). Revealed facts are not requeued inside the 5-round run (the
  Leitner box drop reschedules them).
- Look: recovered `buildTree` ring + recovered primitives in a scratch context, baked into ONE
  vertex-coloured mesh; animals (rabbit, squirrel, fox, hedgehog, bear) are icosahedron/cone
  parts baked to one mesh each; fruit and baskets are instanced. World lighting constants,
  sky colour, recovered CSS classes (glass, equation, answer-style pad keys, feedback,
  hint-area, stone-groups, reward-pop, completion-medal, primary/secondary).
- Measured (SwiftShader, test build): 8 draw calls in a 2-friend round; worst case by
  construction ~17 (5 friends + shadows, fruit, baskets, ring); e2e asserts max <= 60
  (budget 60). Geometries 236 in the world, 276 in the level, back to 236 after exit and after
  10 enter/exit cycles (both projects). Renderer state untouched; the level's sun shadow map is
  disposed in `dispose()`.
- Test-build only: `.level-layer[data-draw-calls|data-max-draw-calls]` (previous frame's
  `renderer.info.render.calls`), `.forest-panel[data-round|kind|dividend|divisor|pile]`.
- Merge note: `tests/e2e/level-gate.spec.ts` lines 65 and 71 expect the forest gate to be
  `coming-soon`; with this level shipped it is `open` (the e2e owner of that file updates it).
- Screens for author review: `reports/phase-15-screens/` (world gate, start, mid-round, hint,
  fact family, celebration).

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
