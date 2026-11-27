# Phase 1: repeat meter + baseline report

## Context links
- Parent: [plan.md](plan.md)
- Depends on: none
- Research: [baseline](research/researcher-01-repeat-causes-baseline.md) §2–4, §6
- Reuse: `tools/practice/pool-counting.ts` (142: `itemSignature`, `countSkill`),
  `pool-counter.test.ts`, `src/learning/lesson-planner.ts` (`planLessonRun`),
  `src/ui/lesson-practice.ts` (`lessonSeed`), `src/learning/daily-planner.ts` (`planDailySet`, read only)

## Overview
- Date: 2026-11-27
- Description: one deterministic report that says, per skill × tier and per run type, how many
  distinct items and shapes a child can meet and how often a run repeats an item from the run
  itself or the last 5 runs; ranked worst-first. Fixes the tsx crash by running under vitest.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed
- Owner: first free lane (no shared files)
- Effort: 0.5d

## Key Insights
- `itemSignature` already defines "exact repeat"; add `shapeSignature` (story key + step kinds +
  prompt keys) for "feels the same".
- `pool-counter.ts` under tsx dies on `import.meta.glob`; vitest runs everything in ~5 s.
- Runs differ by dealer: lesson = `planLessonRun` + `lessonSeed(lesson, profile, attempts)`;
  daily = `planDailySet` + `mulberry32(seed ^ 0x9e3779b9)` (`practice-run.ts:106`); level round =
  `planReasoningRound`. The sim calls these pure functions, never the UI.

## Requirements
- Functional
  - `tools/practice/repeat-metrics.ts`: `shapeSignature(item)`; `simulateLessonRuns(lessonN, runs)`
    (stats advance by the run's attempts so `lessonSeed` changes like in the game);
    `simulateDailyDays(stats, days)`; `simulateLevelRounds(skills, rounds, seed)`.
    Each returns per run: items, in-run exact repeats, items seen in the previous K = 5 runs.
  - `tools/practice/repeat-report.test.ts`: skipped unless `REPEAT_REPORT=1`; writes
    `plans/261127-1620-question-variety-anti-repeat/reports/repeat-baseline.md`: tables ranked by
    worst T1/T2/T3/T4 (see plan.md targets) plus a top-20 "repeaters" list (item signature,
    count). Also `--json`-like output to `reports/repeat-baseline.json` for later diffing.
  - Optional `recent` hook: the sims accept a `drawItem` function so Phase 3 can pass the fresh
    draw and Phase 9 can show before/after with the same harness.
  - Always-on small guard test: harness is deterministic (same seed → same numbers), and a
    known pool (`meas-temperature` T1 = 48) still counts right.
- Non-functional: pure, seeded; every file < 200 lines; full report < 30 s.

## Architecture
`SKILL_CATALOG` × tiers → `countSkill` + shape count → table A. `KNTT lessons` → lesson sim →
table B. Synthetic profile (every skill attempted, boxes spread 1–5) → 30-day daily sim → table C.
Level skill lists (from stage plans) → 50 rounds → table D. Rank → markdown + json.

## Related code files
- Create: `tools/practice/repeat-metrics.ts`, `repeat-run-simulators.ts`, `repeat-report.test.ts`
- Modify: `tools/practice/pool-counter.ts` header comment: "run via vitest" (one line)
- Delete: none

## Implementation Steps
1. Branch `<lane>/repeat-meter`. Shape signature + guard test.
2. Lesson, daily, level simulators (pure imports only, no `src/ui/*` DOM modules; copy the
   one-line `lessonSeed` hash into the sim if importing `lesson-practice.ts` drags the DOM in).
3. Report writer + ranking; run with `REPEAT_REPORT=1 npx vitest run tools/practice/repeat-report.test.ts`.
4. Commit the baseline report; PR (no `parity-change`, no `src/` change).

## Todo list
- [ ] Shape signature + guard test
- [ ] Three run simulators
- [ ] Ranked report + json
- [ ] Baseline committed, gates green, PR

## Success Criteria
- Report reproduces the research numbers (e.g. `mul-tens-mental` T1 = 6, `meas-len-choose-unit` T1 = 14).
- Two runs give byte-identical output. The normal `npm test` time grows < 2 s.

## Risk Assessment
- Daily sim needs a realistic stats shape. Mitigation: synthetic profile documented in the report header.
- Report slows CI. Mitigation: env-gated; only the guard runs by default.

## Security Considerations
- None (tooling, no data leaves the machine; no save or profile data read).

## Next steps
- Phases 5–8 paste their before/after rows from this report into the PR body.
- Phase 9 runs it again with the fresh draw on.
