# Phase 04: Reasoning rounds in the bridge quiz and field/forest/city/tower

## Context links
- [plan.md](plan.md), [phase 01](phase-01-skill-keys-reasoning-generators-and-save-code-m3d3.md)
- `src/quiz/learning-quiz-adapter.ts` (l.62-115), `src/ui/quiz-dialog.ts` (`quizBodyHtml`), `src/quiz/quiz-answer.ts:96-107`
- Round planners: `levels/field/field-round-flow.ts`, `forest/forest-round-flow.ts`, `city/city-round-flow.ts`, `tower/tower-question-formats.ts` (`TowerStep`)

## Overview
- Date 2026-10-31. Priority P1. Status **done** (branch `feat/ch2-p04-reasoning-rounds`, not merged). Review: not started. Depends on 01. Parallel with 05–08.
- Each existing activity gains one reasoning round kind that appears once the child has mastered its tables, getting harder with the skill's box. Gameplay, rewards and round counts unchanged. Also fixes tablet/touch gaps in these four levels.

## Key Insights
- Gate by mastery: fresh profiles never see reasoning items → parity playthrough (fresh, seeded) keeps the original quiz template; e2e reaches them via `seedFactStats` (01).
- Bridge rewards are frozen (`quiz-rewards.ts`, asserted vs original); the quiz answers are numeric with 3 options → bridge reasoning uses numeric word problems only.
- `quizBodyHtml` is in DOM parity → refactor into templates with the mul template byte-identical (unit snapshot vs current output before touching it).
- One reasoning round replaces one standard round (last round), max one per run → run length unchanged.

## Requirements
- Rule (pure, shared): `reasoningSlot(stats, levelFacts)` → true when ≥3 of the run's planned facts are box ≥3, or the level's reasoning skill was seen before; tier from `tierOfBox(skillBox)`.
- Bridge: every 5th question when the chosen table's facts average box ≥3 → word problem built on the current table (e.g. `wp-times-then-add`, `wp-times-compare`); 3 numeric options from 01 distractors; hint ladder text for word problems (new strings; original hint golden untouched); records `sk:` key; a correct answer still builds a plank.
- Field → `wp-times-then-add` / `pattern-skip-count` (rows of plants: "mỗi luống 6 cây, gấp 4 lần…"), pad answer.
- Forest → `div-rem-floor` / `div-rem-ceil` (sharing fruit into baskets with leftovers; "cần mấy giỏ?"), two steps: quotient, remainder (or round-up).
- City → `wp-times-compare` / `unknown-mul-div` (parcels: "gấp mấy lần", "? × 7 = 56" already near), choice + pad.
- Tower → `expr-brackets` / `expr-order` / `tf-explain` (floor stones with an expression; verdict then fix), reusing `TowerStep` + `verdict`.
- Steps rendered with the 01 step kit; hints: encourage → sơ đồ đoạn thẳng text / first step → strategy → reveal after 3 misses (recorded not correct).
- Touch: fix the tablet failures listed for these levels; every key (digits, Enter, H, arrows, 1–4) has an on-screen control; level panels fit tablet portrait + landscape.

## Architecture
```
src/quiz/quiz-reasoning-slot.ts  quiz-word-problem-question.ts  learning-quiz-adapter.ts (mod)
src/ui/quiz-dialog.ts (mod, split)  quiz-dialog-templates.ts  quiz-word-problem-strings.ts
src/levels/shared/reasoning-round-slot.ts  (pure rule for the 4 old levels; 05–08 do not use it)
src/levels/field/field-reasoning-round.ts  forest/forest-remainder-round.ts  city/city-compare-round.ts  tower/tower-expression-floor.ts
+ mods in each *-round-flow.ts / scene wiring; tests co-located
tests/e2e/reasoning-rounds.spec.ts
```

## Related code files
- Modify: adapter, quiz dialog, quiz answer (if type widens), four round flows + scenes/panels, their e2e specs for tablet fixes.
- Create: above. Delete: none.

## Implementation Steps
1. RED: snapshot `quizBodyHtml` output for the mul template across seeds; split templates; snapshot stays identical.
2. RED: `reasoningSlot` rule tests (fresh → never; seeded box 3 → once, last round; tier mapping).
3. RED per level round: answers exact, steps recorded once with `sk:` key, round count unchanged; GREEN.
4. Bridge word problem in quiz + hints; reward path untouched (existing reward tests green).
5. UI wiring with step kit; on-screen controls for all keys; tablet layout fixes.
6. e2e `reasoning-rounds.spec.ts`: seed box-3 stats → each activity shows its reasoning round, solve by keyboard (desktop) and taps only (phone, tablet portrait, tablet landscape); `sk:` keys in store; existing level specs green on all 4 projects.
7. Parity run: expect no diff from this phase (fresh profiles); if any, explain or fix.

## Todo list
- [x] quiz template snapshot + split
- [x] slot rule + tests
- [x] 4 level rounds + tests
- [x] bridge word problem + hints
- [x] UI + touch controls + tablet fixes
- [x] e2e on 4 projects
- [x] parity check

## Success Criteria
- Unit + e2e green on desktop, phone, tablet portrait/landscape; quiz mul template byte-identical; rewards/goldens unchanged; parity unchanged.
- Touch: no step requires a keyboard; targets ≥44 px; no key hints on coarse pointers; panels verified at tablet sizes.

## Scope Contract
- Changed: quiz adapter/dialog templates, four level folders, shared slot rule.
- Impacted: bridge quiz DOM (parity), level runs, store writes (`sk:` keys).
- Will verify: unit (quiz, slot, rounds), full e2e on 4 projects (quiz + levels), parity full run, golden check.
- Deliberately skipped: map/world (03), new levels (05–08).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Quiz DOM drift breaks parity | M | M | Byte snapshot before refactor; mastery gate |
| Word problems too long for the small quiz dialog on phones | M | M | ≤2 short sentences; layout check 412 px + tablets |
| Reasoning round feels like a penalty | L | M | Only after mastery, one per run, bonus-tone copy |

## Security Considerations
- Prompt params are numbers/ids from generators; strings rendered via text nodes / escaped templates (no user input in HTML).

## Implementation notes (2026-11-02)
- Quiz: `quizBodyHtml` moved to `src/ui/quiz-dialog-templates.ts`; the multiplication body is snapshot-locked (`quiz-dialog-templates.test.ts`, taken before the split). Word problems (`wp-times-then-add`, `wp-times-compare` on the chosen table, 3 numeric options from `numberOptions`, tier 1 one misconception + near miss, tier 2+ two misconceptions) come every 5th question of the planner when the table's pool averages box ≥3 — in **both** bridge and practice mode (a child who masters the tables has usually finished the bridge). Same frozen reward/plank; own hint ladder (re-read, sơ đồ đoạn thẳng, worked) and feedback (`quiz-word-problem-strings.ts`). `<kbd>` badges of the quiz answers are hidden on `(pointer: coarse)` (CSS only).
- Levels: shared `levels/shared/reasoning-round-{slot,flow,strings,panel,test-hook}.ts` + `reasoning-round.css`. Slot: ≥3 run facts in box ≥3 or a level skill seen; skill seen least goes next; rng untouched when no slot. The round takes the last slot (run length unchanged), recorded once under `sk:<id>`, counted in the level tally (stars/XP). All four levels render it with the step kit (tower included — deviation: not via `TowerStep`, the kit covers verdict + fix).
- Touch: field key tips / equation `kbd`, tower guide + "(phím n)" card names, forest/city/tower key-help rows and `kbd` badges hidden on coarse pointers; level pads are destroyed when the reasoning panel takes over (they listened on `document`).
- Parity: fresh profiles never reach a reasoning round or word problem, rng consumption unchanged → no expected diff on desktop. The coarse-pointer CSS (quiz `kbd`, level key rows) could change a coarse-pointer parity capture if one exists; re-baseline belongs to phase 09.

## Next steps
- 09 merge and full-chain e2e.
