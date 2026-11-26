# Phase 3B: length in the workshop

## Context links
- Parent: [plan.md](plan.md)
- Depends on: [Phase 1B](phase-01b-length-ladder-generators.md), [Phase 2B](phase-02b-order-match-steps-and-length-scenes.md); author decision D6
- Research: [codebase](research/researcher-01-codebase-add-sub-length-report.md) §4
- Reuse: `src/levels/workshop/workshop-stations.ts` (148, ruler station slot
  `['meas-ruler-read','meas-mm-convert']` stages 1–5), `workshop-round-flow.ts`

## Overview
- Date: 2026-11-26
- Description: the workshop's ruler station draws from the new `meas-len-*` ids by stage, so
  length practice happens in play, not only in daily/lesson runs.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed
- Owner: Lane B, muse-min
- Effort: 0.5d

## Key Insights
- Workshop stages already include ruler/mm slots; widen the slot list per stage following the
  ladder: stage 1 L0–L1 (choose unit, ladder, adjacent), stage 2 + far, stage 3 + compare/order,
  stage 4 + mixed, stage 5 + add/sub of lengths.
- Tier still from the ladder, not the stage — the stage only picks *which* skill.

## Requirements
- Functional
  - Ruler station slot lists per stage as above, weakest-first among attempted ids with the
    stage's fallback; never more than one length round in a row from the same id.
  - Workshop round flow passes the chosen option's `bug` to `learning.record`.
- Non-functional: stage star rules, round counts and golden traces unchanged; < 200 lines.

## Architecture
- `workshop-stations.ts` → `workshop-length-slots.ts` (new) → `itemForSkill` → round controller.

## Related code files
- Create: `src/levels/workshop/workshop-length-slots.ts` (+ test)
- Modify: `workshop-stations.ts`, `workshop-round-flow.ts`, workshop e2e spec
- Delete: none

## Implementation Steps
1. Branch `muse-min/length-in-workshop`. Slot file + deterministic tests.
2. Wire the station; pass `bug`.
3. E2E: stage 1 and stage 4 runs reach a new length item by `tap()`.
4. Gates; PR with `parity-change` if shots move.

## Todo list
- [ ] Slot lists + tests
- [ ] Station wiring + bug passing
- [ ] E2E
- [ ] Gates green, PR

## Success Criteria
- Every `meas-len-*` id reachable from a workshop stage.

## Risk Assessment
- Mixed-unit items longer than the station's dialog space. Mitigation: check mobile-pixel shot;
  shorten prompts.

## Security Considerations
- None.

## Next steps
- 7 (parity + docs).
