# Phase 6B: parent progress view (optional)

## Context links
- Parent: [plan.md](plan.md)
- Depends on: [Phase 4A](phase-04a-weak-spot-weighting.md); author decision D5 (skip if "no")
- Research: [codebase](research/researcher-01-codebase-add-sub-length-report.md) §5
- Reuse: `src/ui/sticker-book.ts`, `src/learning/sticker-book.ts` (199 lines — do not grow),
  `sticker-book-strings.ts`, `weak-skill-score.ts`, `focus-skills.ts`

## Overview
- Date: 2026-11-26
- Description: a read-only "Tiến bộ" tab in the sticker book: per focus skill, accuracy of the
  last 10, a 5-step ladder level and the top labelled bugs in plain Vietnamese. Local only.
- Priority: P2 (optional)
- Implementation status: pending (waits for D5)
- Review status: not reviewed
- Owner: Lane B, muse-min
- Effort: 0.5d

## Key Insights
- Data already exists (attempts, correct, box, `recent`, `bugs`); no schema change, no Supabase
  (paused per the English plan).
- Derived, never stored — same rule as stickers.
- Wording for the parent, not a grade for the child: "Hay quên nhớ sang hàng chục".

## Requirements
- Functional
  - `progress-view-model.ts` (pure): rows `{skillId, titleVi, accuracy10, ladder, bugs[]}` for
    focus ids with ≥ 1 attempt, weakest first.
  - Tab in the sticker book; one bug label string per Misconception id used by 1A/1B.
- Non-functional: tap-only, ≥ 44 px, readable on mobile-pixel; < 200 lines per file.

## Architecture
- `factStats` → `progress-view-model` → `ui/progress-view.ts` inside the sticker book dialog.

## Related code files
- Create: `src/learning/progress-view-model.ts` (+ test), `src/ui/progress-view.ts`,
  `src/ui/progress-view-strings.ts`
- Modify: `src/ui/sticker-book.ts` (tab), sticker-book e2e spec
- Delete: none

## Implementation Steps
1. Branch `muse-min/progress-view`. View model + tests.
2. Tab UI + strings; e2e by `tap()`.
3. Gates; PR with `parity-change`.

## Todo list
- [ ] View model + tests
- [ ] Tab UI + strings
- [ ] E2E, gates green, PR

## Success Criteria
- A seeded weak profile shows the weak skills first with correct accuracy numbers.

## Risk Assessment
- Sticker-book dialog crowded. Mitigation: tab, not a section.

## Security Considerations
- Local data only; nothing sent anywhere.

## Next steps
- 7.
