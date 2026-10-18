# Phase 05: Bridge level (equal groups, tables 2 and 5)

## Context links
- [plan.md](./plan.md) · [brainstorm §1 original bridge, §3 option A](../reports/brainstorm-261018-math-game-continuation.md) · [research 01 §7](research/researcher-01-threejs-game-architecture-report.md)
- Depends on: [phase 04](./phase-04-hub-map-vlm-guide-story.md) (level kit)
- Parallel with: 06, 07, 09

## Overview
- Date: 2026-10-18
- Description: River diorama; each correct round repairs one bridge segment with number stones. Teaches multiplication as equal groups (`b` stones taken `a` times = `b x a`), tables 2 and 5. Concrete -> symbolic via mastery box.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed

## Key Insights
- Original bridge was pure 3-choice MC with neighbour distractors (guessable). Rebuild: manipulate first, then symbolic.
- Representation by fact box: box 1-2 -> stage A (drag groups of stones into slab moulds, count shows) then stage B (choose expression); box 3+ -> numeric entry on number pad.
- Expression choice follows VN convention `groupSize x groupCount`; distractors from picker (never the swapped expression).

## Requirements
- 6 segments per play = 6 rounds; segment visibly built per correct round (tween stones into slab).
- Stage A: pile of stone groups (each group = `b` stones on a tray); child places `a` trays into mould; tap-select alternative + keyboard. Over-filling bounces back gently.
- Stage B: choice buttons (3 options) for expression; Stage C: number pad for product.
- Hints via ladder: rung 2 highlights groups, rung 3 skip-count labels "5, 10, 15", rung 4 related known fact.
- Strings in `bridge` namespace vi/en. Reduced motion respected.
- Budget: <= 60 draw calls, <= 30k tris.

## Architecture
```
src/levels/bridge/
  index.ts                     export levelDefinition {id:'bridge', regionId:'bridge', tables:[2,5], rounds:6}
  bridge-scene.ts              GameScene: builds diorama, implements presentQuestion/showHint/celebrate
  bridge-diorama-builder.ts    river, banks, posts, 6 segment slots (instanced water ripples)
  stone-tray-factory.ts        tray + b stones (shared geometry), pickable proxy
  bridge-round-stages.ts       stage A/B/C selection + transitions per question
  bridge-segment-builder.ts    animate segment assembly
  bridge-strings.ts
  bridge-round-stages.test.ts  stage choice by box, mould capacity logic
tests/e2e/bridge-level.spec.ts
```

## Related code files
Create: files above. Modify: none (registry auto-discovers). Delete: none.

## Implementation Steps
1. Diorama + camera fit (landscape and portrait framing).
2. Tray factory + drop zones (mould slots) via core drag/tap-select.
3. Round stages logic (pure, tested) + wiring to level session controller.
4. Segment build animation, celebration, VLM lines (story: "the storm broke the bridge").
5. Hint visuals for rungs 2-4.
6. E2E: map -> bridge -> complete 6 rounds using driver (one round by real drag with `page.mouse`, one by tap-select on mobile project, rest via `answerCurrent`) -> stars shown -> map shows Field unlocked -> reload persists.

## Todo list
- [ ] diorama + camera fit
- [ ] trays, moulds, drag + tap-select
- [ ] round stages (+tests)
- [ ] segment build + celebration
- [ ] hints
- [ ] e2e spec

## Success Criteria
- Level completable with mouse, touch (mobile project) and keyboard only.
- E2E green; unit tests green; draw calls <= 60 via debug hook assertion.
- Field region unlocked after completion; fact stats for `mul:2x?`/`mul:5x?` updated.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Drag of whole trays on phone too fiddly | M | H | trays are large; tap-select shown as default hint; snap radius |
| Stage A too slow for kids who know facts | M | M | box 3+ skips to numeric |
Rollback: delete `src/levels/bridge/` -> map shows Bridge "coming soon" (no breakage elsewhere).

## Security Considerations
- None beyond shared store (no network).

## Next steps
- Feeds 10 playtest; Field unlock depends on this level id.
