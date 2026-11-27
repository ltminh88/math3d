# Phase 4: fresh draw in level rounds

## Context links
- Parent: [plan.md](plan.md)
- Depends on: [Phase 2](phase-02-item-fingerprint-and-recent-store.md); boost
  [3A](../261126-2145-math-add-sub-length-boost/phase-03a-add-sub-in-play.md) merged (edits garden/numberfort)
- Research: [baseline](research/researcher-01-repeat-causes-baseline.md) §4
- Reuse: `src/levels/shared/reasoning-round-slot.ts` (68, `planReasoningRound` L55–61),
  `market-stage-plan.ts:132`, `numberfort-stage-plan.ts:174`, `cave-chamber-formats.ts:151`

## Overview
- **Q3 decided (author): level fact rounds (field 17 facts, garden, numberfort) are in scope — vary order and presentation, never the same fact twice in a row; Leitner still picks which facts.**
- Date: 2026-11-27
- Description: every level that drops a skill item into a round (reasoning slot, market,
  numberfort, cave) draws it with `drawFreshItem` and the skill's `seen` list.
- Priority: P2
- Implementation status: pending
- Review status: not reviewed
- Owner: Lane A, muse-88
- Effort: 0.5d

## Key Insights
- Levels use `Math.random` (`level-host-ports.ts:82`); parity builds seed it. With no `seen`
  in the parity saves, the first candidate is accepted → rng consumption unchanged → shots stable.
- Level fact rounds (tables) stay as they are (Q3): repeating a fact until mastered is the
  Leitner design; only *skill* items are de-duplicated.
- Stats are already in every stage-plan input (`stats[skillKey(id)]`), so `seen` is at hand.

## Requirements
- Functional
  - One helper `levelSkillItem(id, rng, tier, stats)` in `reasoning-round-slot.ts` (or a sibling
    file) that reads `stats[sk:id]?.seen` and calls `drawFreshItem`; all four call sites use it.
  - A stage plan that draws several items of one skill keeps a local shown set (no repeats in a stage).
  - `test-debug-hook.ts:142` keeps plain `itemForSkill` (tests pin exact items).
- Non-functional: no visual change; files stay < 200 lines.

## Architecture
stage plan → `levelSkillItem` → `drawFreshItem(…, stat.seen, stageShown)` → round → answer →
recorder writes `seen` (Phase 2, same path as today's level attempts).

## Related code files
- Create: none (or `src/levels/shared/level-skill-item.ts` if the slot file would pass 100 lines)
- Modify: `reasoning-round-slot.ts`, `market-stage-plan.ts`, `numberfort-stage-plan.ts`,
  `cave-chamber-formats.ts` + their tests
- Delete: none

## Implementation Steps
1. After 3A merges, branch `muse/fresh-draw-levels`.
2. Helper + unit test: seeded stats with `seen` = the first candidate → a different item.
3. Swap the four call sites; existing stage-plan tests stay green.
4. E2E level specs + tablet; parity run (expect no change; if a stage shows one skill twice,
   the second copy may change → `parity-change` with the shot named).

## Todo list
- [ ] Helper + test
- [ ] Four call sites
- [ ] E2E + parity, PR

## Success Criteria
- Meter level sim (50 rounds per level): no item repeats within 5 rounds where the pool ≥ 30.
- Parity shots unchanged (or listed).

## Risk Assessment
- Market/numberfort plans may assume a fixed rng order for later picks. Mitigation: empty-`seen`
  identity test per stage plan (same plan output as before for a fresh save).

## Security Considerations
- None.

## Next steps
- Phase 9 after-report includes the level table.
