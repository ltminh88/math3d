# Phase 01: Structured lesson metadata + static 81-lesson table

## Context links
- [plan.md](plan.md), [gap report](../reports/261121-0915-sgk-kntt-toan3-curriculum-gap.md)
- `src/learning/skill-catalog.ts` (`lesson` free text, e.g. `'T1 B24, B28'`), `skill-catalog.test.ts:52-57`
- SGK mục lục (titles only) in (author-local folder outside the repo) — outside repo

## Overview
P1, pure TS. Effort 4h. Lane muse-min. Branch `muse/lesson-metadata`. Parallel with 00, 03.

## Key Insights
- Inverting the mapping (skills declare lessons; table holds only lesson facts) means later family phases never touch the table → no merge conflicts.
- Table needs three kinds: `skills` (derived from catalog), `tables` (mul/div facts of given tables, e.g. B4–B6, B9–B12), `mix` (luyện tập chung, ôn tập, B20 thực hành vẽ → `mixOf: number[]`).
- Legacy `'T1 luyện tập (dãy số)'` (pattern-*) has no number: map to the nearest luyện tập lesson (decide from TOC, document choice).

## Requirements
- `SkillEntry.lessons: readonly {book: 1 | 2; n: readonly number[]}[]`; keep `lesson` string derived (`lessonLabel(entry)`) for any existing reader, or migrate readers — grep `\.lesson\b`.
- `src/learning/kntt-lessons-tap1.ts` (B1–B44), `kntt-lessons-tap2.ts` (B45–B81): `{n, book, topic (chủ đề 1–16), titleVi, titleEn, kind, tables?, mixOf?, practicable}`. Titles **paraphrased** short (≤40 chars), never copied sentences.
- `src/learning/kntt-lesson-index.ts`: `ALL_LESSONS`, `topicsInOrder()`, `skillsOfLesson(n)` (derived from catalog; `mix` → union of mixOf; `tables` → fact keys).
- Unit tests: 81 rows, n = 1..81 contiguous, book split 44/37, every legacy skill's lessons exist, every `mixOf` points to earlier lessons, topic ids non-decreasing.

## Architecture
Pure `learning/`. Catalog keeps append-only order; only the field shape changes (ids untouched → save code unaffected).

## Related code files
Ownership: `src/learning/skill-catalog.ts` (lessons field only), `src/learning/skill-catalog.test.ts`, `src/learning/kntt-lesson*.ts(+test)`.

## Implementation Steps
1. RED tests for table invariants + `skillsOfLesson(25)` contains `div-rem-floor`.
2. Write table from TOC titles (paraphrase), structured `lessons` on 39 legacy entries.
3. Replace `/^T[12] /` test with structured check. GREEN; lint/typecheck/test/build.

## Todo list
- [ ] invariants RED
- [ ] tap1/tap2 tables
- [ ] structured lessons on legacy entries
- [ ] index helpers + tests

## Success Criteria
`skillsOfLesson` answers for every lesson; no textbook sentence in repo; each file <200 lines.

## Risk Assessment
| Risk | Countermove |
|---|---|
| Wrong lesson numbers from 70-dpi TOC | Author spot-checks table in PR (list printed in PR body) |
| Tables >200 lines | split tap1/tap2; one line per lesson |

## Security Considerations
Copyright: titles paraphrased; scans never committed.

## Next steps
02 adds family entries with `lessons`; 05 consumes `skillsOfLesson`.
