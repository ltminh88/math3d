# Phase 2B: order/match step kinds and length scenes

## Context links
- Parent: [plan.md](plan.md)
- Depends on: [Phase 0](phase-00-shared-contracts.md)
- Research: [codebase](research/researcher-01-codebase-add-sub-length-report.md) §2 (step kinds,
  scenes), [pedagogy](research/researcher-02-pedagogy-add-sub-length-report.md) §2.10, 2.12, 2.13
- Reuse: `src/ui/kit/` (step-card, multi-select, verdict buttons, `ui-button`, aria-announcer),
  `src/ui/english/tap-pair-matcher.ts` and `word-tile-order.ts` (same interaction, English-only today),
  `measurement-ruler-balance-scene-svg.ts`

## Overview
- Date: 2026-11-26
- Description: two new step kinds for the math step kit — `order` (tap tiles in order) and
  `match` (tap left, then right) — plus the `length-ladder` scene (m→dm→cm→mm staircase with
  ×10 / :10 arrows) and a ruler tweak for cm + mm reading.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed
- Owner: Lane B, muse-min
- Effort: 1.25d

## Key Insights
- Adding union members to `ReasoningStep` forces every exhaustive switch (kit renderer, answer
  check, test sweeps, level controllers) to handle them; do it in one PR here only.
- The English widgets already solve tap-to-place and tap-pairs; extract the shared layout or copy
  the pattern into `ui/kit/` (no import from `ui/english/` into the math kit).
- Levels that never emit these kinds only need a `never`-safe default branch.

## Requirements
- Functional
  - `{kind:'order', prompt, tiles: PromptRef[], answer: number[]}`: tap tiles to fill slots; tap a
    filled slot to undo; "Xong" checks; a wrong order records the first misplaced tile.
  - `{kind:'match', prompt, left: PromptRef[], right: PromptRef[], pairs: number[]}`: tap left then
    right; a wrong pair flashes and records the right option's `misconception` if tagged.
  - Kit widgets `tap-order-step.ts`, `tap-match-step.ts` (≥ 44 px, aria-announcer, keyboard optional,
    no key hints on coarse pointers).
  - Scene `length-ladder`: units m, dm, cm, mm as steps; optional `highlight: [from, to]`,
    `arrows: '×10' | ':10'`; `ruler` gains `showMmLabels?` for cm + mm reading.
  - Test hook answers for both kinds (test builds only).
- Non-functional: tap-only; WCAG 2.5.7 (no drag needed); files < 200 lines.

## Architecture
- `ReasoningStep` union + answer-check helpers → step-card dispatch → widget → onAnswer(bug) →
  runner. Scenes self-register via the existing glob.

## Related code files
- Modify: `src/reasoning/reasoning-types.ts` (step union only), `src/ui/kit/step-card.ts`
  (dispatch), every exhaustive step switch typecheck reports, `ruler` scene types + SVG
- Create: `src/ui/kit/tap-order-step.ts`, `tap-match-step.ts`, `step-kit-order-match-strings.ts`,
  `src/ui/dialog-scenes/scenes/length-ladder-scene-svg.ts`,
  `src/measurement/length-scene-types.ts`, `tests/e2e/step-kit-order-match.spec.ts` (+ unit tests)
- Delete: none

## Implementation Steps
1. Branch `muse-min/order-match-steps`. Add the two kinds; fix every switch typecheck flags.
2. Pure answer-check for order/match + tests.
3. Widgets on `ui-button`; undo; "Xong"; aria text.
4. Length-ladder scene + ruler mm labels; SVG string tests.
5. A dev-only fixture item to drive both kinds in e2e by `tap()` on 4 projects.
6. Gates; PR with `parity-change` (ruler + new shots).

## Todo list
- [ ] Step kinds + switches
- [ ] Answer check + tests
- [ ] Two widgets
- [ ] Length-ladder scene, ruler mm labels
- [ ] E2E 4 projects
- [ ] Gates green, PR (`parity-change`)

## Success Criteria
- Order and match items finish by taps only on all 4 projects; keyboard optional.
- No behaviour change for existing step kinds (existing e2e green).

## Risk Assessment
- Many switches to touch → merge conflicts with Lane A. Mitigation: land early; Lane A rebases;
  Lane A does not edit step switches.
- Narrow phones: 5 tiles overflow. Mitigation: wrap to two rows; max 5 tiles/4 pairs.

## Security Considerations
- Test hook compiled out of production builds.

## Next steps
- 1B `meas-len-order`, 3A `add-sub-match`, 3B workshop.
