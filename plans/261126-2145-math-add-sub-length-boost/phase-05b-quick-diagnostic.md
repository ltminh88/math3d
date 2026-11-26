# Phase 5B: quick diagnostic ("Kiểm tra nhanh")

## Context links
- Parent: [plan.md](plan.md)
- Depends on: [Phase 1A](phase-01a-add-sub-bug-catalogue-and-formats.md), [Phase 1B](phase-01b-length-ladder-generators.md), [Phase 4A](phase-04a-weak-spot-weighting.md); author decision D3
- Research: [pedagogy](research/researcher-02-pedagogy-add-sub-length-report.md) §1, §3
- Reuse: `src/ui/daily-practice.ts`, `daily-skill-item.ts`, `daily-finish-screen.ts`,
  `src/store/app-settings.ts` (store "last check date")

## Overview
- Date: 2026-11-26
- Description: a short, adaptive check of 12 items (8 add/sub bugs + 4 length bugs), each a
  bug-tagged choice item, offered from the "Luyện tập hôm nay" screen. Results go into the normal
  stats (attempts, `bugs`, `recent`), so focus weighting starts from real data.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed
- Owner: Lane B, muse-min
- Effort: 1d

## Key Insights
- One item per bug is not enough to label a bug (research: 3–5 same-type items). The check is a
  seed, not a verdict: it records attempts; 4A labels only at ≥ 2 of the last 5.
- Adaptive: if T1 (one regroup) is answered right, the next add item jumps to T3; if wrong, a
  second T1 item of the same bug type follows (max 12 items, ~6 min).
- Never feels like a test: no score, no red; finish screen says what we will practise together.

## Requirements
- Functional
  - `quick-check-plan.ts` (pure): ordered bug probes (research §1 table), adaptive next item,
    stop at 12; seeded per day.
  - Items from `add-sub-bug-choice` (forced bug set) and `meas-len-convert` / `meas-len-mixed` /
    `meas-len-compare` with chosen bug distractors.
  - Entry button on the daily screen when never done or ≥ 14 days since the last check
    (`app-settings.quickCheckAt`). Unlocks with daily practice.
  - Finish screen: "Mình sẽ luyện thêm: …" listing up to 3 focus skills (vi + en), no score.
  - Records through the same `learning.record` path (with `bug`); no XP/coins/stars.
- Non-functional: tap-only, ≥ 44 px, test hook for answers, files < 200 lines.

## Architecture
- Daily screen → `quick-check-run.ts` → plan → `itemForSkill(id, rng, forcedBugs)` → kit →
  `learning.record` → finish screen reads `weakScore` (4A).

## Related code files
- Create: `src/learning/quick-check-plan.ts` (+ test), `src/ui/quick-check-run.ts`,
  `src/ui/quick-check-strings.ts`, `src/ui/quick-check-finish.ts`, `tests/e2e/quick-check.spec.ts`
- Modify: `src/ui/daily-practice.ts` (entry button), `src/store/app-settings.ts` (one field),
  generator option `forcedBugs` in 1A/1B dispatch (coordinate on #11: Lane A owns arithmetic)
- Delete: none

## Implementation Steps
1. Branch `muse-min/quick-check`. Plan + adaptive tests.
2. `forcedBugs` option: ask Lane A on #11 for the arithmetic side (small PR or included in 1A).
3. Run + finish screen + entry button + settings field.
4. E2E on 4 projects by `tap()`: full check, then the daily set contains focus items.
5. Gates; PR with `parity-change`.

## Todo list
- [ ] Plan + tests
- [ ] `forcedBugs` option (both families)
- [ ] Run, finish, entry button
- [ ] E2E
- [ ] Gates green, PR (`parity-change`)

## Success Criteria
- After one check, `factStats` has attempts for ≥ 8 focus ids, and the next daily set shows
  focus items first.
- The check never shows a score or the word "sai" in red.

## Risk Assessment
- Child anxiety. Mitigation: friendly copy, no score, can stop any time (progress kept).
- Settings shape change. Mitigation: optional field, default "never done".

## Security Considerations
- None.

## Next steps
- 6B (parent view), 7.
