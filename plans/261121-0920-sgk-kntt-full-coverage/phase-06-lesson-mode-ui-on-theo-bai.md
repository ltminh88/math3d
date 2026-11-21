# Phase 06: "Ôn theo bài" lesson mode UI

## Context links
- [plan.md](plan.md), [phase-05](phase-05-lesson-planner-pure.md), [phase-04](phase-04-dialog-scene-registry-geo-meas-in-daily.md)
- `src/ui/daily-practice.ts:49-150` (run loop), `daily-hud-button.ts`, `daily-quiz-item.ts`, `guide-dialog.ts`, `hud.ts`, `dom-template.ts:44`
- `tests/e2e/daily-practice.spec.ts` (pattern)

## Overview
P1. Effort 6h. Lane muse-88. Deps 04, 05. Branch `muse/lesson-mode`. Reviewer recaptures parity (HUD + VLM dialog change).

## Key Insights
- Extract the daily run loop into `practice-run.ts` (items in, outcomes recorded through the session recorder, coins +5/correct); daily and lesson both call it. No streak/daily-finish reward in lesson mode.
- Picker = list grouped by 16 chủ đề (collapsible, current topic open), each row "Bài n · tên ngắn · ⭐⭐☆"; "Học tiếp: Bài n" button on top. Large rows ≥44 px, scrolls on phone.
- Open from day one, all 81 lessons (Q6); lessons without content show "Sắp có" (disabled).

## Requirements
- HUD button "Ôn theo bài" next to "Luyện tập hôm nay" (not over joystick); VLM dialog entry.
- `src/ui/lesson-practice.ts`, `lesson-picker.ts`, `lesson-practice-strings.ts` (vi/en), `practice-run.ts` (extracted), css.
- Run: 6 items, leave mid-way keeps answered; result screen shows lesson stars before/after.
- Hidden while a level runs (same guard as daily).

## Architecture
```
src/ui/practice-run.ts (extracted from daily-practice.ts)
src/ui/lesson-practice.ts, lesson-picker.ts, lesson-practice-strings.ts, lesson-hud-button.ts
src/styles/lesson-practice.css
tests/e2e/lesson-practice.spec.ts
```

## Related code files
Ownership: above + `src/ui/daily-practice.ts`, `src/ui/hud.ts`, `src/ui/guide-dialog.ts`, `src/ui/dom-template.ts`.

## Implementation Steps
1. RED e2e (4 projects, tap only): open picker via HUD, pick B25, answer all, stars appear, coins in store; "Học tiếp" points to first unfinished lesson; daily e2e still green after extraction.
2. Extract run loop (no behaviour change, daily spec green), then picker + run.
3. Gates + preview; ask reviewer for parity recapture.

## Todo list
- [ ] extract practice-run (daily green)
- [ ] picker + strings
- [ ] lesson run + result
- [ ] HUD/VLM entries + e2e

## Success Criteria
Child can reach any lesson in ≤3 taps; textbook order visible; daily unchanged.

## Risk Assessment
| Risk | Countermove |
|---|---|
| Extraction breaks daily | extract first in its own commit, daily e2e must stay green |
| Top bar crowded on phone | icon-only buttons on narrow width with aria-label; hit-area e2e |

## Security Considerations
None.

## Next steps
Every family phase becomes playable here as soon as it merges.
