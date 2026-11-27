# Phase 5: story variety — names, nouns, contexts

## Context links
- Parent: [plan.md](plan.md)
- Depends on: [Phase 1](phase-01-repeat-meter-and-baseline.md) (before/after rows)
- Research: [baseline](research/researcher-01-repeat-causes-baseline.md) §3
- Reuse: `src/reasoning/reasoning-distractors.ts` (120, `GENERIC_NOUNS` L103–110, `NAMES` L111–115),
  `word-problem-contexts.ts` (177), `reasoning-strings.ts` (188), `arithmetic-strings.ts` (229, read only)

## Overview
- Date: 2026-11-27
- Description: every word problem in reasoning and the arithmetic families picks its child names
  and countable nouns from `reasoning-distractors.ts`; today 3 name pairs × 6 nouns. Grow to
  ~10 pairs × ~16 nouns and add 4–6 compare contexts, so the same story frame reads differently.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed
- Owner: Lane B, muse-min
- Effort: 0.75d

## Key Insights
- `pickName`/`pickNoun`/`pickNames` are shared by add/sub, mul/div and reasoning word problems →
  one small edit raises variety everywhere, without touching Lane A's `add-sub-*` files.
- Nouns are `i:` ids rendered through string tables; each new noun needs vi + en
  (singular/plural if the table has it) and must make sense for counting (no mass nouns).
- Number sizes do not change → content rules (≤100 / lesson range) unaffected.
- Rng: `pick` over a longer list returns other indexes → every seeded word-problem golden
  value can change → this is the main **`parity-change`** risk of the plan.

## Requirements
- Functional
  - `NAMES`: ~10 Vietnamese pairs, mixed boy/girl, short and common (e.g. Mai–Nam, Lan–Hùng …).
  - `GENERIC_NOUNS`: ~16 classroom/home/market countables (pencil, notebook, sticker, orange,
    egg, chicken, balloon, cake …) — check `reasoning-strings.ts` first and reuse existing `i:` ids.
  - `COMPARE_CONTEXTS` (`word-problem-contexts.ts:113`): +4–6 contexts in the same shape.
  - Strings test: every `i:` id has vi + en; no string > existing max length on the dialog.
  - Sweep: existing family sweeps (`*-test-sweep.ts`) still pass for 2000 draws.
- Non-functional: files < 200 lines (move nouns to `word-problem-nouns.ts` if needed).

## Architecture
Unchanged flow; only the lists grow. Generators keep calling `pickName`, `pickNoun`, `pickNames`.

## Related code files
- Create: maybe `src/reasoning/word-problem-nouns.ts`
- Modify: `reasoning-distractors.ts`, `word-problem-contexts.ts`, `reasoning-strings.ts`
  (+ strings tests); golden snapshots that print a name/noun
- Delete: none

## Implementation Steps
1. Branch `muse-min/story-variety`. Meter rows "before" for every `wp-*`, `*-wp`, `unknown-*-wp`.
2. Grow lists + strings; run strings tests.
3. Update golden/unit snapshots that pin a name or noun; explain each in the PR.
4. Meter rows "after": shapes per word-problem skill ≥ 4 (T3), story contexts listed.
5. Parity run; if shots change → `parity-change`, reviewer recaptures in Phase 9.

## Todo list
- [ ] Before rows
- [ ] Names, nouns, compare contexts + strings
- [ ] Snapshots updated with reasons
- [ ] After rows, parity, PR

## Success Criteria
- Every word-problem skill: ≥ 4 shapes (story key) or ≥ 30 distinct (name, noun) combos at T1.
- Strings and sweep tests green; no layout overflow in the e2e tablet project.

## Risk Assessment
- Snapshot churn. Mitigation: one PR, list of changed snapshots, no logic change.
- Odd sentences ("Mai có 7 quả trứng gà và mua thêm…") — reviewer reads 20 sample items in vi.

## Security Considerations
- Own text only; no SGK sentences copied.

## Next steps
- Phase 8 reuses the longer lists for add/sub big-number contexts.
