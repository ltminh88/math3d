# Phase 03: Tower level "Tháp Toán Học" (final challenge, tables 2–9, × and :)

## Context links
- [plan.md](plan.md), [phase 01](phase-01-gates-progression-and-quest-chain.md)
- Reference implementations: `src/levels/field/**`, `src/levels/forest/**` (fact-family card, sharing hints)
- Learning core: `mulFactsForTables`, `divFactsForTables`, session planner (fluency order), distractor picker, expression choice, hint ladder

## Overview
- Priority: P1. Status: done (worktree branch, awaiting 04 merge). Depends on 01. Parallel with 02.
- Story: the floating number stones of the tower fell down. Each correct answer puts a stone back and lights a floor; the child climbs up with VLM to the beacon at the top.

## Key Insights
- This is the final challenge: mixed review across all tables, weighted to the child's weak facts (lowest Leitner boxes first, from planSession over tables 2–9, × and :).
- It must feel like a climb, but there is no timer and no lives (same kind tone as the rest; three misses reveal, never fail the run).

## Requirements
- `index.ts`: `{id:'tower', regionId:'tower', tables:[2,3,4,5,6,7,8,9], rounds:7, requires:'city', load: () => import('./tower-scene')}`. Seven floors (rounds), so the climb feels bigger; check the host accepts `rounds:7`.
- Question formats, rotated so no two floors in a row share one:
  - (1) 3 choices "a × b = ?";
  - (2) number pad "p : d = ?";
  - (3) missing factor "? × 7 = 56";
  - (4) fact family (reuse the forest card pattern, written fresh in the tower folder or via a shared helper from 01);
  - (5) "đố vui" true/false: "6 × 7 = 48 đúng hay sai?", then the fix.
- Fact keys: `mul:` and `div:` recorded once per floor.
- Hints:
  1. encouragement;
  2. the related fact (multiplication for a division and vice versa);
  3. split strategy (from city), or skip count for small tables;
  4. reveal the next step.
- Look: the recovered tower silhouette (purple `#9b92cf`, the region's floating stones) as a stacked low-poly tower. The camera rises a floor per correct answer (instant with reduced motion). Instanced stones; a beacon at the top for the celebration.
- Celebration: "Bạn đã lên tới đỉnh tháp!", stars, back to the gate. The quest chain reaches its closing card.
- ≤60 draw calls; leak check; test hook `window.__tower` (test build only).

## Architecture
```
src/levels/tower/index.ts  tower-scene.ts  tower-diorama-builder.ts  tower-climb-camera.ts  tower-floor-view.ts
src/levels/tower/tower-round-flow.ts  tower-question-formats.ts  tower-hints.ts  tower-panel.ts  tower-strings.ts
src/levels/tower/tower-test-hook.ts  tower-level.css  tower-round-flow.test.ts  tower-question-formats.test.ts
tests/e2e/tower-level.spec.ts
```

## Related code files
- Create: the above. Modify: none. Delete: none.

## Implementation Steps
1. Question formats (pure) + tests, RED first: each format's prompt and answer, exact division, no repeated format back to back, true/false with a plausible wrong product.
2. Round flow + tests: 7 floors, weak facts first, outcomes recorded.
3. Hints + tests.
4. Diorama, floors, climbing camera.
5. Panel/HUD + input (choices with 1–3 keys, number pad, Enter).
6. Celebration + exit.
7. e2e both projects: seed field + forest + city completed → tower gate → 7 floors → back; `tower` completed; quest card shows the closing card; `mul:` and `div:` keys recorded; ≤60 draw calls; 10× leak check.
8. Screenshots in `reports/tower-screens/`.

## Todo list
- [x] question formats + tests
- [x] round flow + tests
- [x] hints + tests
- [x] diorama + climb camera
- [x] panel + input
- [x] celebration
- [x] e2e
- [x] screenshots

## Implementation notes
- Host/registry handle `rounds: 7` generically (registry only checks a positive integer; the host never assumes 5).
- Facts: `ctx.learning.planSession(towerFactPool(), 7)` (pool = `mul:` + `div:` over tables 2-9), then `planTowerFacts`: distinct facts, topped up to 7 (seen facts weakest first, then shuffled fresh ones), at least one × and one : (one fact swapped for its inverse if needed), sorted weakest Leitner box first. The planner shuffles its pick, so the weak-first order is applied here.
- Formats (`assignFormats`): rotation choice → pad → missing → family → truefalse; a floor takes the next format that fits its operation (choice = × only, pad = : only) and differs from the previous floor, so no two floors in a row share one. Choice distractors come from `pickDistractors` fed by the fact's `errs`. True/false: 1/3 true claims; a false claim shows a table-neighbour product (p ± a, p ± b) or quotient ± 1 and must be fixed on the pad; verdict + fix = one recorded question; judging a false claim true banks the claimed number as the wrong answer.
- Hints (`hintSpec`, pure): 1 encourage; 2 related fact (product → "? : x = y", division → "? × d = p", missing factor → "p : d = ?"); 3 split (`7 × 8 = 7 × 5 + 7 × 3 = 35 + 21`) for products with both factors ≥ 6, skip count (answer hidden) otherwise, skip count to p for divisions; 4 the step's full equation.
- Look: baked tower (7 floors, cream cornices, gold roof, door, trees) = 1 mesh; instanced light bands (dim → gold) and instanced number stones (ground → beside their floor, arc + bob); beacon pulses at the top. Camera climbs one floor per finished floor (eased, instant with reduced motion) and frames the beacon above/beside the celebration card. Draw calls stay far under 60.
- Keys: `tower-keyboard.ts` on `document` (capture, `ctx.disposer.signal`): 1-3 cards (1 Đúng / 2 Sai), digits + Enter to the kit pad on number steps (card steps consume digits so the hidden pad never types), Enter climbs after a floor.
- Test hook `window.__tower` (test build only; absent from `dist/`): `state()`, `formats()`, `factKeys()`.
- e2e `tower-level.spec.ts`: leak test takes one warm-up visit and waits for the world's geometry count to hold 3 s before the baseline (the world near the tower gate keeps uploading meshes for several seconds on the slow mobile project; without it the baseline was 12 short).
- Screenshots: `reports/tower-screens/` (world near the gate, floor 1 and floor 4 on desktop + mobile, hint rung 3, top/celebration desktop + mobile).
- Merge-time (04): `level-host-ports.ts` labels the level layer with `gateForest` for every non-field level (tower layer reads "Cổng Rừng Nhân Chia"); use `gateNameOf(definition.id)`. Specs expecting the tower gate "coming-soon"/"Sắp ra mắt" now fail (see report).

## Success Criteria
- Unit + `tower-level` e2e green on both projects; lint/typecheck/build clean; own chunk; climb readable on mobile-pixel.

## Scope Contract
- Changed: new folder only.
- Impacted: quest chain end state.
- Will verify: unit + e2e.
- Skipped: parity (04).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| 7 rounds too long for 7-year-olds | M | M | Playtest in 04; `rounds` is a one-line change |
| A true/false format invites guessing | M | L | Always ask the child to fix a false statement, which is recorded as one question |
| A host or e2e assumption of 5 rounds | L | M | Check the host handles `definition.rounds` generically; unit-test it |

## Security Considerations
- None.

## Next steps
- 04 merge.
