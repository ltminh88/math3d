# Phase 4A: weak-spot weighting (Luyện tập hôm nay + Học tiếp)

## Context links
- Parent: [plan.md](plan.md)
- Depends on: [Phase 0](phase-00-shared-contracts.md), [Phase 1A](phase-01a-add-sub-bug-catalogue-and-formats.md) (ids); author decision D2
- Research: [codebase](research/researcher-01-codebase-add-sub-length-report.md) §3,
  [pedagogy](research/researcher-02-pedagogy-add-sub-length-report.md) §3
- Reuse: `src/learning/daily-planner.ts` (103), `daily-intervals.ts`, `lesson-planner.ts` (187),
  `src/ui/lesson-picker.ts`, `lesson-progress.nextLesson`

## Overview
- Date: 2026-11-26
- Description: a weak score per skill (accuracy of last 10 + recent bugs), a fixed focus set
  (add/sub + length ids), and planner changes so the daily set and "Học tiếp" lean toward weak
  focus skills with a 60/25/15 mix.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed
- Owner: Lane A, muse-88
- Effort: 1d

## Key Insights
- Daily pool = attempted skills only; keep that rule — focus never pulls an untaught skill.
- Daily set is deterministic per (day, profile); the weighting must stay deterministic.
- Lesson runs already pick weakest box first; "Học tiếp" picks the next lesson by progress.
  Weighting = when the next lesson is not a focus lesson and a focus skill is weak, offer one
  focus review lesson (B2/B7/B30 or B8 mix) before moving on.
- Promotion/demotion lives in `ladderTierOf` (Phase 0); weighting only chooses *which* skill.

## Requirements
- Functional
  - `focus-skills.ts`: `FOCUS_SKILL_IDS` = add/sub ids (B2, B54/55/63/64 calc + new 1A/2A/3A ids)
    + `meas-ruler-read`, `meas-mm-convert`, every `meas-len-*` id (from length entries).
  - `weak-skill-score.ts`: `weakScore(stat)` = (1 − accuracy of `recent`) + 0.2 × distinct bugs
    seen ≥ 2 times in `bugs`; a bug is "labelled" only at ≥ 2 of the last 5.
  - Daily planner, when ≥ 3 focus skills are in the pool: 10 = 6 focus (weakest first, ≤ 2 per
    skill, interleave add/sub with length) + 3 due review (any family, today's rule) +
    1 mastered. Smaller pool → today's behaviour, no top-up.
  - Within a focus slot, the item uses the skill's ladder tier; if the skill has a labelled bug,
    prefer a format that targets it (find-error / true-false with that bug) every other time.
  - Lesson picker "Học tiếp": if a focus skill's weak score ≥ 0.4 and its lesson is done, the next
    run is that lesson's review (one in three runs at most, so progress still moves).
- Non-functional: pure, deterministic per seed; `daily-planner.ts` < 200 lines (helper file).

## Architecture
- `factStats` → `weakScore` per focus id → `planFocusSlots(pool, rng)` → merged with due/mastered
  in `pickDailyItems` → same daily UI. Lesson picker asks `focusReviewLesson(stats)` first.

## Related code files
- Create: `src/learning/focus-skills.ts`, `weak-skill-score.ts`, `daily-focus-slots.ts` (+ tests)
- Modify: `src/learning/daily-planner.ts`, `src/learning/lesson-planner.ts` or
  `src/ui/lesson-picker.ts` (whichever owns "next lesson"), `daily-planner.test.ts`
- Delete: none

## Implementation Steps
1. Branch `muse/focus-weighting`. Focus list + weak score with table tests.
2. `daily-focus-slots.ts`; planner merge; tests: deterministic per day, no repeats, pool < 3 focus
   → identical to today's output (regression guard).
3. Bug-targeted format choice for focus slots.
4. "Học tiếp" focus review rule + tests (1 in 3 cap).
5. E2E: seeded save with weak add/sub → daily shows ≥ 6 focus items.
6. Gates; PR (no `parity-change` unless the picker text changes).

## Todo list
- [ ] Focus list + weak score
- [ ] Daily focus slots + regression test
- [ ] Bug-targeted formats
- [ ] Học tiếp focus review
- [ ] E2E seeded save
- [ ] Gates green, PR

## Success Criteria
- With a seeded weak profile, 6 of 10 daily items are focus skills, the weakest appear first.
- A profile with no focus attempts gets exactly today's set.

## Risk Assessment
- ×/÷ practice starves. Mitigation: 3 review slots keep any family; cap 6 focus.
- Child bored by one skill. Mitigation: ≤ 2 items per skill per day; interleave topics.

## Security Considerations
- None.

## Next steps
- 5B (diagnostic seeds the pool), 6B (parent view reads `weakScore`).
