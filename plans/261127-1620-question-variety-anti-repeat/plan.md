---
title: "Nhiều câu hỏi hơn, ít lặp lại hơn"
description: "Measure repeats per skill × tier and per run, widen the smallest pools and templates within grade-3 rules, and stop re-serving items the child saw in recent runs"
status: pending
priority: P1
effort: 5.5d
branch: main
tags: [math, practice, variety, anti-repeat, daily-practice, lesson, content]
created: 2026-11-27
---

# Nhiều câu hỏi hơn, ít lặp lại hơn

Parent report: the child plays fast because questions repeat. Baseline
([research](research/researcher-01-repeat-causes-baseline.md)): add/sub numbers rarely repeat
exactly, but nearly every skill has **one prompt frame** and word problems share 3 name pairs and
6 nouns, so runs *feel* the same; mental mul/div, length unit sense and mm convert have **5–20
items** and repeat inside one 6-item lesson run. Nothing remembers what was shown last run.
Fix = measure → widen → remember. Own exercises only, KNTT frame; every PR passes the AGENTS.md
gates; files < 200 lines; `tap()` only; catalog append-only; R79 untouched.

## Phases
| # | Phase | Owner | Depends | Effort | Status |
|---|---|---|---|---|---|
| 1 | [Repeat meter + baseline report](phase-01-repeat-meter-and-baseline.md) | first free lane | — | 0.5d | pending |
| 2 | [Item fingerprint + recent-item store](phase-02-item-fingerprint-and-recent-store.md) | Lane B, muse-min | 1 | 0.75d | pending |
| 3 | [Fresh draw in lesson + daily runs](phase-03-fresh-draw-in-lesson-and-daily-runs.md) | Lane B, muse-min | 2, English 6 merged | 0.5d | pending |
| 4 | [Fresh draw in level rounds](phase-04-fresh-draw-in-level-rounds.md) | Lane A, muse-88 | 2, boost 3A merged | 0.5d | pending |
| 5 | [Story variety: names, nouns, contexts](phase-05-story-names-nouns-contexts.md) | Lane B, muse-min | 1 | 0.75d | pending |
| 6 | [Length pools wider](phase-06-length-pools-wider.md) | Lane B, muse-min | 1 | 0.75d | pending |
| 7 | [Mul/div mental + small pools wider](phase-07-mul-div-small-pools-wider.md) | Lane B, muse-min | 1 | 0.75d | pending |
| 8 | [Add/sub frames + contexts wider](phase-08-add-sub-frames-and-contexts.md) | Lane A, muse-88 | 1, boost 2A merged | 0.75d | pending |
| 9 | [After-report + docs](phase-09-after-report-and-docs.md) | reviewer | 3–8 | 0.25d | pending |

Lane B (muse-min, after English 6): 1 → 6 → 5 → 7 → 2 → 3. Lane A (muse-88, after boost 2A):
8 → (after 3A) 4. Phase 1 has no file conflicts with anyone: whichever lane idles first takes it.
5, 6, 7 are independent content PRs, any order; each re-runs the meter and pastes its rows.

## File ownership
- Phase 1: new `tools/practice/repeat-*.ts` only. Phase 2: `learning-types.ts` (append `seen`),
  `session-recorder.ts`, `progress-repository.ts` (+ split helper), new `src/practice/item-fingerprint.ts`,
  `recent-items.ts`, `fresh-item-draw.ts`.
- Lane B: `src/measurement/length-*`, `measurement-distractors.ts`, `src/reasoning/reasoning-distractors.ts`,
  `word-problem-contexts.ts`, `reasoning-strings.ts`, `mul-generators.ts`, `div-generators.ts`,
  `mul-div-large-generators.ts`, `mul-div-word-problems.ts`, `src/ui/daily-skill-item.ts`, `practice-run.ts`.
- Lane A: `src/arithmetic/add-sub-*`, `arithmetic-strings.ts`, `src/levels/**` call sites.

## Key dependencies
- **English 6** edits `daily-planner.ts` and `practice-run.ts` → Phase 3 waits for its merge.
  This plan does **not** touch `daily-planner.ts` at all (boost 4A owns it next).
- **Boost 1A/2A** own `src/arithmetic/add-sub-*` → Phase 8 starts after 2A merges. Boost 3A
  edits garden/numberfort → Phase 4 after 3A.
- Phase 7 edits mul/div files only; confirm on #11 that 1A/2A do not touch them before claiming.

## Targets (set in Phase 1, checked in Phase 9)
- **T1** no exact repeat inside one run (lesson 6, daily 10, level round).
- **T2** every played skill × tier ≥ 60 distinct exact items in 2000 draws, except an allow-list
  of curriculum-bound skills (money notes, roman, fraction-read, clock hour/half) with a reason.
- **T3** focus skills (add/sub, `meas-len-*`, ruler, mm, mul/div): ≥ 4 shapes where a story fits,
  ≥ 2 forms for pure calc.
- **T4** simulated 10 replays of one lesson: ≤ 2 % of items seen in the previous 5 runs.

## Key risks
- **Golden traces / parity:** fresh draw accepts the first candidate when the recent list is
  empty → zero extra rng calls on a fresh save → traces unchanged. Within-run dedupe (3) and new
  frames (5–8) change some draws → those phases may be `parity-change`, stated per phase.
- **Content rules:** ≤100 for legacy skills, lesson range for the six new families, D1 for
  `meas-len-*` (integers ≤ 1000, m↔mm from L2). Widening never crosses them; a sweep test guards.
- **Strings:** every new noun/name/frame needs vi + en strings; reuse `i:` noun tables.

## Decisions (author, 2026-11-27)
1. Q1 Memory depth: last 24 items per skill (≈ 4 lesson runs), device-only, not in save code.
2. Q2 Daily replay same day: **a replay must give a NEW set** (author: "phải thay đổi sau mỗi
   lần vào chơi lại"). The daily seed mixes in a replay counter; `seen` also excludes items from
   today's earlier runs. Phase 3 owns this.
3. Q3 Level fact rounds (field 17 facts…): **in scope — make them more varied** (author: "cần đa
   dạng hơn"). Keep Leitner choice of WHICH fact; vary order, presentation and avoid the same
   fact twice in a row. Phase 4 owns this (field/garden/numberfort fact rounds).
4. Q4 Mental mul T1: tens 1–5 × 2–5, product ≤ 100. Yes.
5. Q5 New story contexts: everyday Vietnamese school/home/market themes, own text. Yes.
