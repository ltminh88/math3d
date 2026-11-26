# Phase 6: English in daily practice

## Context links
- Parent: [plan.md](plan.md)
- Depends on: [Phase 3B](phase-03b-speech-and-pack-client.md), [Phase 2A](phase-02a-own-english-content.md)
- Docs: `docs/code-standards.md` (daily practice, stickers)
- Code: `src/learning/daily-planner.ts`, `src/ui/practice-run.ts`, `src/ui/daily-practice.ts`,
  `src/learning/sticker-book.ts`, `src/ui/sticker-book-strings.ts`

## Overview
- Date: 2026-11-26
- Description: "Luyện tập hôm nay" mixes in at most 2 English items once the island is
  unlocked; the English sticker page shows.
- Priority: P2
- Implementation status: pending
- Review status: not reviewed
- Owner: Lane B, muse-min
- Effort: 0.5d

## Key Insights
- English uses the same `factStats`, so learned `sk:en-*` skills already enter the daily pool;
  this phase caps them and renders them.
- "Học tiếp" stays math-only.
- Island locked (bridge not done) → zero English items.
- The day's set stays deterministic per (today, profile).

## Requirements
- Functional
  - `practice-run.ts`: `isKeyRenderable` true for `sk:en-*`; renders them with the English widgets
    and speaker.
  - Daily planner: ≤ 2 English items per run; none while the island is locked; never an
    untaught skill.
  - English sticker page visible in the sticker book.
- Non-functional: English widgets load lazily (dynamic import) so the daily dialog's chunk
  does not grow.

## Architecture
- Daily planner → pool filter (island unlocked?) → cap 2 English → practice-run → English widget
  (lazy) → `learning.record`.

## Related code files
- Modify: `src/learning/daily-planner.ts` (+ test), `src/ui/practice-run.ts`,
  `src/ui/daily-practice.ts`, `src/ui/sticker-book-strings.ts`
- Create: `tests/e2e/daily-practice-english.spec.ts` (new)
- Delete: none

## Implementation Steps
1. Claim on #11; ask the owners on #11 first if `daily-planner.ts` or `practice-run.ts` has an
   active owner.
2. Planner: lock filter and the 2-item cap; unit tests for locked, cap, determinism.
3. `practice-run.ts`: render `sk:en-*` through the English widgets (lazy).
4. Sticker page label/strings for the `'english'` topic.
5. E2E: seeded English stats + unlocked island → an English item appears and is answered by tap.
6. Gates; PR (`parity-change` if shots change).

## Todo list
- [ ] Lock filter + cap 2 + tests
- [ ] Render English keys in practice run
- [ ] Sticker page strings
- [ ] E2E on 4 projects
- [ ] PR

## Success Criteria
- Locked island → no English; unlocked → at most 2 English items; answerable by tap.
- Existing daily-practice and sticker specs stay green.

## Risk Assessment
- Changing the day's set mid-day for existing saves. Mitigation: cap applies from the next day's
  plan or keeps determinism per (today, profile); covered by test.

## Security Considerations
- Pack items appear only if the pack is unlocked on this device.

## Next steps
- Phase 5 parity recapture if shots changed.
