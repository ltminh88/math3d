# Phase 3: fresh draw in lesson + daily runs

## Context links
- Parent: [plan.md](plan.md)
- Depends on: [Phase 2](phase-02-item-fingerprint-and-recent-store.md); English Island
  [phase 6](../261126-0700-english-island/phase-06-english-in-daily-practice.md) merged (it edits
  `practice-run.ts`)
- Research: [baseline](research/researcher-01-repeat-causes-baseline.md) §4
- Reuse: `src/ui/daily-skill-item.ts` (158, `skillPlan` L37–45), `src/ui/practice-run.ts` (204,
  skill branch L152–163), `src/learning/lesson-walkthrough.ts:134`

## Overview
- Date: 2026-11-27
- Description: lesson runs and "Luyện tập hôm nay" draw skill items with `drawFreshItem`, using
  the skill's `seen` list plus the run's own shown set, so a run never repeats an item and the
  next run avoids the last ~4 runs' items.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed
- Owner: Lane B, muse-min
- Effort: 0.5d

## Key Insights
- Both run types share `practice-run.ts` → `skillPlan(id, box, run.rng)` → one change point.
- `daily-planner.ts` is **not** touched (which skills = planner, which item = this phase).
- **Q2 decided: same-day daily replay gives a NEW set** (mix a per-day replay counter into the daily seed; `seen` excludes earlier runs today). Old note, superseded: `seen` only holds items already answered,
  and a resumed run reuses the stored plan, so resume is unaffected.
- Parity builds start from fixed saves with no `seen` → the first candidate is accepted →
  shots unchanged, unless a run repeats in itself (pool ≤ 6) — then the 2nd copy changes.

## Requirements
- Functional
  - `skillPlan(id, box, rng, seen = [], shownThisRun = [])` calls `drawFreshItem`.
  - `practice-run.ts` keeps `run.shown: number[]` (fingerprints this run), passes
    `stats[key]?.seen` and `run.shown`; pushes the accepted fingerprint.
  - Lesson walkthrough (`lesson-walkthrough.ts:134`) uses the same call (demo items vary too).
  - No UI change; no star, XP, coin or Leitner change.
- Non-functional: `practice-run.ts` stays ≤ 204 lines or moves the skill branch into
  `practice-run-skill-step.ts` (< 200 rule).

## Architecture
`practice-run` → `skillPlan` → `drawFreshItem(id, rng, tier, stat.seen, run.shown)` → item →
mount → answer → `session-recorder` stores `seen` (Phase 2).

## Related code files
- Create: maybe `src/ui/practice-run-skill-step.ts` (split)
- Modify: `src/ui/daily-skill-item.ts`, `src/ui/practice-run.ts`, `src/learning/lesson-walkthrough.ts`,
  tests: `lesson-practice.test.ts`, a new `practice-run-fresh-draw.test.ts`
- Delete: none

## Implementation Steps
1. Claim on #11 after English 6 merges; branch `muse-min/fresh-draw-runs`.
2. Wire `skillPlan` + run shown set; unit test: 6-item run of `mul-tens-mental` T1 has 6
   distinct items (today: duplicates).
3. Meter (Phase 1) with `drawItem` = fresh draw: T1 = 0 in-run repeats; T4 per lesson.
4. E2E: existing lesson/daily specs unchanged (fixed seeds); run `test:e2e` + tablet project.
5. Parity run; if any shot differs, label `parity-change` and name the shot + the in-run
   duplicate that caused it.

## Todo list
- [ ] Claim after English 6
- [ ] `skillPlan` + run shown set
- [ ] Unit + meter rows in PR body
- [ ] E2E + tablet green
- [ ] Parity checked (label if needed), PR

## Success Criteria
- Meter: 0 in-run exact repeats for every lesson; T4 ≤ 2 % for lessons whose skills reach T2.
- Golden traces unchanged except where a trace had an in-run duplicate (listed in the PR).

## Risk Assessment
- Small pools exhaust: `drawFreshItem` falls back to least-recent, never blocks a run.
- Collision with English 6 / boost 4A in `practice-run.ts` / planner. Mitigation: start only
  after English 6 merges; planner untouched.

## Security Considerations
- None beyond Phase 2 (device-only data).

## Next steps
- Phase 9 measures T1/T4 after all content phases.
