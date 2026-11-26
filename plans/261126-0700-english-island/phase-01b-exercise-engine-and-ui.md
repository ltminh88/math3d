# Phase 1B: exercise engine and tap-only UI

## Context links
- Parent: [plan.md](plan.md)
- Depends on: [Phase 0](phase-00-shared-contracts.md)
- Docs: `docs/code-standards.md` (layering, strings, tests), `AGENTS.md`
- Reuse: `src/levels/shared/step-miss-budget.ts`, `src/learning/hint-ladder.ts`,
  `src/levels/shared/level-run-tally.ts`, `src/ui/kit/ui-button.ts`, `src/ui/kit/aria-announcer.ts`

## Overview
- Date: 2026-11-26
- Description: pure item planner/generators/answer check plus five tap-only widgets, wired
  into `startEnglishRun`.
- Priority: P2
- Implementation status: pending
- Review status: not reviewed
- Owner: Lane B, muse-min
- Effort: 1.5d

## Key Insights
- Same Leitner stats as math: `learning.record` with `sk:en-*` keys; tier from
  `skillTierOf(box)`.
- Engine stays pure (no DOM, no `three`) so it tests in Vitest node.
- English words are never translated: `lang="en" translate="no"`, never through `t()`.
- Works on the Phase 0 seed + synthetic fixture until 2A content lands.

## Requirements
- Functional
  - `item-planner`: weakest first by Leitner, seeded, never the same item twice in a row.
  - `item-generators`: tier 1 = 3 choices, tier 2 = 4 with confusable letters (b/d, p/q),
    tier 3 = listen-only.
  - `english-wrong-feedback`: gentle Vietnamese feedback that never gives the answer.
  - Reveal after 3 misses (step-miss-budget); hint ladder; run tally.
  - Widgets: picture-choice-grid, tap-pair-matcher, word-tile-order, fill-choice, letter-choice.
  - Test-build hook `window.__game.island.currentAnswer()`.
- Non-functional: tap-only, targets ≥ 44 px, no key hints on `(pointer: coarse)`, keyboard
  alternative for every drag (WCAG 2.5.7); UI in Vietnamese, the child is "bạn".

## Architecture
- `startEnglishRun(port)` → planner picks skill → generator builds `EnglishItem` → widget renders
  → `answer-check` → `learning.record` + tally → next round (8 per run).
- Strings: namespace `english-island` in `english-strings.ts`.

## Related code files
- Create
  - `src/english/engine/item-planner.ts` (new), `item-generators.ts` (new),
    `answer-check.ts` (new), `english-wrong-feedback.ts` (new), each with a `*.test.ts` (new)
  - `src/ui/english/picture-choice-grid.ts`, `tap-pair-matcher.ts`, `word-tile-order.ts`,
    `fill-choice.ts`, `letter-choice.ts` (all new)
  - `src/ui/english/english-strings.ts` (new)
  - `tests/e2e/english-exercises.spec.ts` (new)
- Modify: `src/ui/english/english-run.ts` (from Phase 0; Lane B owns it now)
- Delete: none

## Implementation Steps
1. Claim the lane on #11; branch `muse-min/...` from latest main.
2. Write the planner and generators against the Phase 0 types; unit-test seeding, no repeats,
   tier rules, confusable sets.
3. Write `answer-check` and `english-wrong-feedback` (assert feedback never contains the answer).
4. Build the five widgets on `ui-button` + `aria-announcer`; tap-select for match/order.
5. Fill `startEnglishRun`: rounds, miss budget, hints, tally, `learning.record`.
6. Add the test hook (test builds only).
7. E2E: drive every item kind by tap via `currentAnswer()` on all 4 projects.
8. Gates; PR (`parity-change` if shots change); watch CI.

## Todo list
- [ ] Planner + tests
- [ ] Generators + tiers + tests
- [ ] Answer check + wrong feedback + tests
- [ ] Five widgets
- [ ] Run wiring + test hook
- [ ] `english-exercises.spec.ts`
- [ ] Gates green, PR

## Success Criteria
- Every item kind playable by tap on desktop, mobile-pixel, tablet-portrait, tablet-landscape.
- Stats land under `sk:en-*`; planner deterministic per seed.

## Risk Assessment
- Word-order drag on touch. Mitigation: tap-to-place only, drag optional.
- Widget files grow past 200 lines. Mitigation: one widget per file, shared layout helper.

## Security Considerations
- Test hook compiled out of production builds.

## Next steps
- Phase 3B (speech, pack client), then Phase 6.

## Validation note (2026-11-26)
The Vietnamese gloss (`EnglishWord.vi`) is shown only after the item is answered, as feedback such as "cat = con mèo". It is never shown while the item is open.
