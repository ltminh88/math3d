# Phase 3A: add/sub in play (garden, numberfort)

## Context links
- Parent: [plan.md](plan.md)
- Depends on: [Phase 1A](phase-01a-add-sub-bug-catalogue-and-formats.md), [Phase 2B](phase-02b-order-match-steps-and-length-scenes.md) (`match` step); author decision D6
- Research: [codebase](research/researcher-01-codebase-add-sub-length-report.md) §4
- Reuse: `levels/garden/garden-round-plan.ts` (190 lines), `levels/numberfort/numberfort-stage-plan.ts` (177)

## Overview
- Date: 2026-11-26
- Description: give the B2 add/sub formats a home in play (no level plays them today) and let
  numberfort stages 3/5 use bug-choice/column variants at their own range; add `add-sub-match`.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed
- Owner: Lane A, muse-88
- Effort: 0.75d

## Key Insights
- Numberfort stages keep their range rule ("a stage never introduces a skill from another
  stage's range"), so B2 (≤1000) skills go to the garden, which already plays `unknown-add-sub`,
  `pattern-add/sub`.
- Both plan files are near 200 lines: put the new slot lists in small sibling files.
- Levels record attempts themselves (`*-round-flow.ts`); pass the chosen option's bug there too.

## Requirements
- Functional
  - Garden: one add/sub round per stage, weakest-first among the focus add/sub ids the child has
    attempted (fallback: `add-sub-bug-choice`); stage 1 uses T0–T1 only through the ladder.
  - Numberfort stages 3/5: one round per run of `add-sub-bug-choice` at 10 000 / 100 000 range
    (generator takes range from the skill, ids `add-4digit`… unchanged; choice variant behind a
    flag on the existing calc generator, or new ids `add-sub-10000-bug-choice` if cleaner — append).
  - `add-sub-match` (lessons T1 B2): 4 expression↔result pairs on the `match` step, one result
    being a bug value as a decoy.
  - Garden/numberfort round flows pass `bug` to `learning.record`.
- Non-functional: stage star rules, golden traces and level gates unchanged.

## Architecture
- Stage plan → `garden-add-sub-slots.ts` picks the skill → `itemForSkill` → round controller.

## Related code files
- Create: `src/levels/garden/garden-add-sub-slots.ts` (+ test),
  `src/levels/numberfort/numberfort-bug-choice-slots.ts` (+ test),
  `src/arithmetic/add-sub-match-generator.ts` (+ test)
- Modify: `garden-round-plan.ts`, `garden-round-flow.ts`, `numberfort-stage-plan.ts`, numberfort
  round flow, `arithmetic-skill-entries.ts`, `arithmetic-item-for-skill.ts`,
  `tests/e2e/` garden + numberfort specs
- Delete: none

## Implementation Steps
1. Branch `muse/add-sub-in-play`. Slot files + deterministic plan tests.
2. Wire into garden and numberfort plans; keep round counts.
3. `add-sub-match` generator (after 2B merges).
4. Bug passing in the two round flows.
5. E2E: one garden run and one numberfort stage 3 run reach the add/sub round by `tap()`.
6. Gates; PR with `parity-change` if shots move.

## Todo list
- [ ] Garden slots + tests
- [ ] Numberfort bug-choice slots + tests
- [ ] `add-sub-match`
- [ ] Bug recorded in level flows
- [ ] E2E
- [ ] Gates green, PR

## Success Criteria
- Every new add/sub id is reachable from at least one level or the lesson run.
- Garden/numberfort plan files stay < 200 lines; existing stage tests unchanged.

## Risk Assessment
- Garden's theme (patterns) dilutes. Mitigation: one round per run only.
- 2B late. Mitigation: ship slots first, `add-sub-match` in a follow-up PR.

## Security Considerations
- None.

## Next steps
- 7 (parity + docs).
