# Phase 08: Puzzle cave level "Hang Đố Vui" (final reasoning)

## Context links
- [plan.md](plan.md), [01](phase-01-skill-keys-reasoning-generators-and-save-code-m3d3.md), [02](phase-02-geometry-and-measurement-generators.md), [03](phase-03-map-expansion-regions-gates-and-quest-chain.md)
- Reference: `src/levels/tower/**` (multi-step floors, verdict + fix, climb camera, rung rules from the review fixes)

## Overview
- Date 2026-10-31. Priority P1. Status pending. Review: not started. Depends on 01, 02, 03. Parallel with 04–07.
- Story: a cave of riddles. Each solved riddle lights a crystal and opens the next chamber; at the end a treasure chest of light. Final challenge of chapter 2: mixed reasoning across all skills, weakest first.

## Key Insights
- Mixed review like the tower: plan over every `sk:` id seen so far + chapter 2 pools, weakest box first, at least one 2-step word problem, one remainder-in-context, one choose-all, one true/false-explain, one geometry/measurement word problem.
- No timer, no lives; 3 misses reveal (recorded not correct).
- True/false needs an explanation step: after "Sai", the child picks the reason (choice: misconception named) or fixes the number (pad) — one recorded question.

## Requirements
- `index.ts`: `{id:'cave', regionId:'cave', rounds:7, requires:'workshop', load: () => import('./cave-scene')}`.
- Skill pool: reasoning (`wp-*`, `div-rem-*`, `choose-all-correct`, `tf-explain`, `expr-*`) + `meas-wp-fence`, `meas-perimeter-rect`, `meas-area-rect`, `geo-radius-diameter`.
- Chamber formats rotated (no two in a row): word problem two steps (pad, pad); remainder "cần mấy xe" (pad, distractor = round-down); choose-all-correct (multi-select statements, ≥1 correct, ≤4 options); đúng/sai + giải thích (verdict + reason choice or fix); expression (choice of first op + pad).
- Hints: encourage → sơ đồ đoạn thẳng description / restate the question → first step worked with "?" result → 3 misses reveal.
- Look: low-poly cave (dark palette from 03 builder), instanced crystals dim → lit, torch light from emissive materials only (no extra shadow maps); camera moves chamber to chamber (instant with reduced motion); ≤60 draw calls. Test hook `window.__cave`.
- Celebration: "Bạn đã giải hết câu đố trong hang!"; quest card reaches the chapter 2 closing card.
- Touch: every step by tap (cards, pad, Đúng/Sai, Xong, hint, next); keys optional (digits, Enter, 1–4, Space toggles in multi-select, H); targets ≥44 px; no key hints on coarse pointers.

## Architecture
```
src/levels/cave/index.ts  cave-scene.ts  cave-round-flow.ts  cave-chamber-formats.ts  cave-hints.ts
src/levels/cave/cave-diorama-builder.ts  cave-crystal-view.ts  cave-chamber-camera.ts  cave-panel.ts  cave-input.ts
src/levels/cave/cave-celebration.ts  cave-strings.ts  cave-test-hook.ts  cave-level.css
src/levels/cave/cave-round-flow.test.ts  cave-chamber-formats.test.ts  cave-hints.test.ts
tests/e2e/cave-level.spec.ts  cave-level-leak.spec.ts
```

## Related code files
- Create: above. Modify: none. Delete: none.

## Implementation Steps
1. RED chamber formats: required mix present, rotation rule, weakest first, multi-select scoring (all and only correct), verdict + explain = one outcome; GREEN.
2. RED hints sweep (every skill × format × step: no rung ≥2 shows the result); GREEN.
3. Diorama, crystals, chamber camera.
4. Panel/input with step kit; celebration + exit.
5. e2e on desktop (keyboard), phone + tablet portrait + tablet landscape (taps only): seed workshop done → cave gate → 7 chambers → back; `cave` completed; quest card closing card; `sk:` keys; ≤60 draw calls; leak 10 cycles.
6. Screenshots `reports/cave-screens/` (4 projects, incl. multi-select and explain step).

## Todo list
- [ ] chamber formats + round flow + tests
- [ ] hints sweep
- [ ] diorama, crystals, camera
- [ ] panel, input
- [ ] celebration
- [ ] e2e 4 projects + leak
- [ ] screenshots

## Success Criteria
- Unit + cave e2e green on desktop, phone, tablet portrait, tablet landscape; own chunk; ≤60 draw calls; no leaks; closing card shown.
- Touch: no step needs a keyboard; targets ≥44 px; no key hints on coarse pointers; layout verified at tablet portrait + landscape.

## Scope Contract
- Changed: new folder + its e2e.
- Impacted: quest chain end state.
- Will verify: unit + cave e2e on 4 projects + leak.
- Deliberately skipped: parity (09), other levels.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Long word problems on a phone panel | M | M | ≤2 sentences, numbers bold, read-aloud via announcer; scroll-free check at 412 px |
| Dark cave unreadable | M | M | Lit crystals + high-contrast panel; screenshots review |
| Choose-all invites tapping everything | M | L | "Xong" checks all and only correct; hint names one wrong choice |

## Security Considerations
- None.

## Next steps
- 09 merge.
