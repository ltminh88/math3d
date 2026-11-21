# Phase 05: Lesson planner (pure)

## Context links
- [plan.md](plan.md) decision 3, [phase-01](phase-01-structured-lesson-metadata-and-lesson-table.md)
- `src/learning/daily-planner.ts` (selection + interleave style), `session-planner.ts`, `skill-tiers.ts`, `sticker-book.ts` (derived-progress pattern)

## Overview
P1. Effort 3h. Lane muse-min. Deps 02. Branch `muse/lesson-planner`.

## Key Insights
- Unlike daily, lesson mode *introduces* skills: unseen skills of the chosen lesson are fair game (box 1 → T1).
- Progress must be derived (like stickers), never stored: ⭐1 every skill of the lesson attempted; ⭐2 all box ≥3; ⭐3 all box ≥4. `tables` lessons use their facts' boxes (share rule like stickers, 70%).
- "Next lesson" = first practicable lesson (textbook order) below ⭐3 — gives the "từ đầu đến cuối" path.

## Requirements
- `planLessonRun(lessonN, stats, rng, opts={items:6, renderable})`: round-robin over the lesson's generated+renderable skills (weakest box first), facts for `tables`, mixes spread over source lessons; deterministic per (seed, stats); no item twice in a run.
- `lessonStars(lessonN, stats)`, `nextLesson(stats)`, `topicProgress(topic, stats)`.
- Lessons with 0 plannable skills → `planLessonRun` returns `[]` (UI shows "Sắp có").

## Architecture
`src/learning/lesson-planner.ts`, `src/learning/lesson-progress.ts` (+ tests). Pure, node-only.

## Related code files
Ownership: `src/learning/lesson-planner*.ts`, `src/learning/lesson-progress*.ts`.

## Implementation Steps
1. RED unit with hand-built stats (oracle = expected star counts computed by hand, not by calling helpers).
2. Implement; GREEN; lint/typecheck/test.

## Todo list
- [ ] planner + tests
- [ ] progress + next-lesson + tests

## Success Criteria
B25 run gives B25's skills (2 remainder + choose-all-correct + tf-explain); B44 mix spreads; empty lesson → []; deterministic.

## Risk Assessment
| Risk | Countermove |
|---|---|
| Lesson with 1 skill gives 6 identical-type items | allowed (different numbers); cap via `items` = min(6, 3×skills) |

## Security Considerations
None.

## Next steps
06 UI.
