---
title: "Tăng cường cộng trừ và đổi đơn vị độ dài"
description: "Bug-driven add/sub ≤1000 and m/dm/cm/mm length items, weak-spot weighting in daily practice and Học tiếp, quick diagnostic, items in play"
status: pending
priority: P1
effort: 10d
branch: main
tags: [math, arithmetic, measurement, length, diagnostic, daily-practice, content]
created: 2026-11-26
---

# Tăng cường cộng trừ và đổi đơn vị độ dài

The child is weak at add/sub with regrouping and at length conversion. Distractors come from the
classic bug catalogue, so a wrong pick names the bug; the bug is recorded and drives the
explanation, the next items and the daily mix. KNTT frame: Toán 3 T1 B2 (add/sub ≤1000),
T1 B7 (review grade-2 m, dm), T1 B30 (mm). Own exercises only, never SGK text. Every PR passes
the AGENTS.md gates; UI PRs carry `parity-change`; `tap()` only, targets ≥ 44 px; catalog append-only.

## Phases
| # | Phase | Owner | Depends | Effort | Status |
|---|---|---|---|---|---|
| 0 | [Shared contracts](phase-00-shared-contracts.md) | muse-min (R77, moved: muse-88 quota) | — | 0.5d | done (#87) |
| 1A | [Add/sub bug catalogue + new formats](phase-01a-add-sub-bug-catalogue-and-formats.md) | Lane A, muse-88 (R82, after audio) | 0 | 1.5d | done (#93) |
| 2A | [Column-calc scene, step by step](phase-02a-column-calc-scene.md) | Lane A, muse-88 | 1A | 1.25d | pending |
| 3A | [Add/sub in play](phase-03a-add-sub-in-play.md) | Lane A, muse-88 | 1A, 2B | 0.75d | pending |
| 4A | [Weak-spot weighting](phase-04a-weak-spot-weighting.md) | Lane A, muse-88 | 0, 1A | 1d | pending |
| 1B | [Length ladder generators](phase-01b-length-ladder-generators.md) | Lane B, muse-min (R81) | 0, D1 | 1.5d | done (#88) |
| 2B | [Order/match steps + length scenes](phase-02b-order-match-steps-and-length-scenes.md) | Lane B, muse-min (R81, after 1B) | 0 | 1.25d | done (#89) |
| 3B | [Length in the workshop](phase-03b-length-in-workshop.md) | Lane B, muse-min | 1B, 2B | 0.5d | done (#92) |
| 5B | [Quick diagnostic](phase-05b-quick-diagnostic.md) | Lane B, muse-min | 1A, 1B, 4A | 1d | pending |
| 6B | [Parent progress view (optional)](phase-06b-parent-progress-view.md) | Lane B, muse-min | 4A, D5 | 0.5d | pending |
| 7 | [Parity + docs](phase-07-parity-and-docs.md) | reviewer | all UI phases | 0.25d | pending |

Lane A (muse-88): 0 → 1A → 2A → 4A → 3A. Lane B (muse-min, after English PR #85): 1B and 2B
(either order) → 3B → 5B → 6B. If muse-min stays busy, muse-88 may take 2B after 2A; the board
(#11) decides. 3A waits only for 2B's `match` step (matching items); its other slots can land first.

## File ownership
- Phase 0 (one edit each, then frozen): `reasoning-types.ts` (Misconception append),
  `learning-types.ts`, `leitner-box.ts`, `wrong-answer-explanation.ts` (bug registry),
  `skill-catalog.ts` (length entries hook), `docs/code-standards.md` content rule.
- Lane A: `src/arithmetic/**`, `src/practice/wrong-answer-carry*`, new `wrong-answer-add-sub-bug*`,
  number-line + new column-calc scene files, `src/levels/garden/**`, `src/levels/numberfort/**`,
  `src/learning/daily-planner.ts`, `lesson-planner.ts`, new `focus-skills.ts`, `weak-skill-score.ts`.
- Lane B: `src/measurement/length-*`, `measurement-ranges.ts`, new `wrong-answer-length*`,
  `src/ui/kit/` new step widgets + step-card dispatch, ruler + new length-ladder scene files,
  `src/levels/workshop/**`, new `src/ui/quick-check*`, `src/ui/progress-view*`.

## Author decisions (pending — see Unresolved questions)
- D1 length rule lift · D2 focus source · D3 diagnostic placement · D4 column-calc visual ·
  D5 parent view · D6 level homes. Record answers here as a Validation Log.

## Key risks
- **Content rule conflict:** m↔mm and numbers > 100 are forbidden today → 1B blocked until D1.
- **Daily pool rule:** only attempted skills enter daily; new ids need a lesson run or the
  diagnostic first (4A seeds via focus, never untaught items).
- **Bug labelling noise:** one wrong pick ≠ a bug; label only after ≥ 2 of the last 5 (4A).
- **Shared step union:** new `order`/`match` step kinds touch every exhaustive switch → only 2B adds them.
- **Parity:** 2A, 2B, 3A, 3B, 5B, 6B change shots → `parity-change`, reviewer recaptures (7).
- **File size:** `add-sub-generators.ts` 264 lines → split first in 1A; `sticker-book.ts` is 199.

## Research
- [Codebase map](research/researcher-01-codebase-add-sub-length-report.md)
- [Pedagogy + KNTT frame](research/researcher-02-pedagogy-add-sub-length-report.md)

## Unresolved questions (validation, recommended answer in bold)
1. D1 Length: lift the ≤100 / no m↔mm rule? **Yes, for new `meas-len-*` skills only: m, dm, cm,
   mm; whole numbers ≤ 1000; m↔mm only at L2+; no decimals; refs T1 B7 + T1 B30. Legacy ≤100 stays.**
2. D2 Focus: author-fixed or automatic? **Fixed focus families (add/sub + length) as a constant;
   which skills inside are weak is computed automatically. Daily 10 = 6 focus / 3 review / 1 mastered.**
3. D3 Diagnostic: where and how often? **A 12-item "Kiểm tra nhanh" offered on the Luyện tập hôm nay
   screen, once, then again every 14 days; seeds stats and bugs only, no XP/star effect.**
4. D4 Column-calc: new scene with digit-by-digit entry right→left and a carry toggle? **Yes (parity-change).**
5. D5 Parent view: **Small read-only "Tiến bộ" page in the sticker book (accuracy of last 10 + top
   bugs per skill), local only, no Supabase.** Alternative: skip for now.
6. D6 Level homes: **Garden gets B2 add/sub slots; numberfort stages 3/5 get bug-choice/column
   variants at their own range; workshop gets the length slots.**

## Validation Log
Session 2026-11-26 (all recommended): D1 **relax for new `meas-len-*` only** (m/dm/cm/mm, integers ≤ 1000, m↔mm from L2, no decimals; KNTT T1 B7 + B30) · D4 **new column-calc scene** · D2+D3 **diagnostic in "Luyện tập hôm nay", re-offered every 14 days, no score/XP; fixed focus group, weak skills computed** · D5 **"Tiến bộ" tab in the sticker book** (local data, view-only). D6 keeps the recommendation (garden + numberfort 3/5 + workshop).
