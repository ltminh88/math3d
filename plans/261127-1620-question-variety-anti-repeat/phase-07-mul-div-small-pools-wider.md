# Phase 7: mul/div mental + small pools wider

## Context links
- Parent: [plan.md](plan.md)
- Depends on: [Phase 1](phase-01-repeat-meter-and-baseline.md); confirm on #11 that boost 1A/2A do not edit these files
- Research: [baseline](research/researcher-01-repeat-causes-baseline.md) §2–3
- Reuse: `src/arithmetic/mul-generators.ts` (156, `mulTensMental` L62–100, `mulHundredsMental`
  L105+), `div-generators.ts` (234 → split), `mul-div-large-generators.ts` (191),
  `mul-div-word-problems.ts` (176), `mul-div-find-error.ts`, `arithmetic-ranges.ts` (read only)

## Overview
- Date: 2026-11-27
- Description: the mental ×/÷ skills (B23, B26, B36, B37, B56, B57) have 3–11 items per tier and
  repeat inside one lesson run. Widen ranges where the lesson allows and add a second form per
  skill (missing factor "□ × 3 = 60" and a true/false check) so calc skills have ≥ 2 shapes.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed
- Owner: Lane B, muse-min (non add/sub arithmetic files; Lane A owns `add-sub-*`)
- Effort: 0.75d

## Key Insights
- `mul-tens-mental` T1 filter `tens > 3 || d > 3 → reject` (`mul-generators.ts:88`) leaves 6
  items; T2 is the complement. Hundreds/thousands and div twins follow the same pattern.
- `div-tens-mental` T2 needs quotient 30–40 (`div-generators.ts:133`) → 3 items.
- Arithmetic is one of the six new families → the lesson range applies (B23/B26 ≤ 100,
  B36/B37 ≤ 1000, B56/B57 ≤ 10 000). Q4 keeps T1 mul-tens ≤ 100.
- Tiers raise reasoning, not number size: the new forms go to T2/T3; T1 gets the wider range.
- Fallback items (fixed `'60 : 3'` etc.) are never reached in practice; keep them.

## Requirements
- Functional
  - T1 ranges: tens 1–5 × d 2–5 (product ≤ 100); hundreds 1–4 × 2–4 (≤ 1000); thousands the
    same pattern (≤ 10 000); div twins = inverse facts of the mul ranges.
  - T2: wider range + "missing factor" form (`□ × d = p`, `p : □ = q`).
  - T3: today's two-step chain + a true/false verdict (reuse `mul-div-find-error.ts` shape).
  - `mul-2d-1d` / `div-2d-1d` (37–40 items): keep ≤ 99 rule, add the missing-number form.
  - Split `div-generators.ts` (234 lines) into `div-calc-generators.ts` + `div-mental-generators.ts`.
  - Sweep: every number within the lesson range; answers integral; no remainder where exact.
- Non-functional: files < 200 lines; ids unchanged (catalog append-only, no new ids).

## Architecture
Same ids, same dispatcher; generators pick a form by tier, then numbers inside the lesson range.

## Related code files
- Create: `src/arithmetic/div-calc-generators.ts`, `div-mental-generators.ts`,
  maybe `mul-div-missing-factor.ts`
- Modify: `mul-generators.ts`, `mul-div-large-generators.ts`, `arithmetic-strings.ts` (only if a
  new prompt key is needed — coordinate on #11, Lane A edits this file in 1A), tests
- Delete: `div-generators.ts` (replaced by the split, re-exports kept if imported widely)

## Implementation Steps
1. Branch `muse-min/mul-div-variety`. Before rows.
2. Pure split of `div-generators.ts` (no behaviour change, tests green) — own commit.
3. Ranges per tier; missing-factor and verdict forms.
4. Sweep + `mul-div-generators.test.ts` updated; golden values that pin a mental item explained.
5. After rows; e2e lesson specs B23/B36; parity (`parity-change` if a city/tower shot shows one).

## Todo list
- [ ] Before rows
- [ ] Split div file
- [ ] Wider T1, new T2/T3 forms
- [ ] Sweep + tests
- [ ] After rows, e2e, parity, PR

## Success Criteria
- Every mental ×/÷ skill × tier ≥ 30 distinct and ≥ 2 shapes; a 6-item lesson run of any of
  them has no exact repeat even before Phase 3.

## Risk Assessment
- `arithmetic-strings.ts` is shared with Lane A. Mitigation: reuse existing prompt keys
  (`mentalCalc`, `askResult`, verdict keys); new key only after 1A merges.
- Harder T1 than the child is used to. Mitigation: products stay ≤ 100 at T1 (Q4).

## Security Considerations
- None.

## Next steps
- Phase 9 after-report.

## Decisions (reviewer R117, 2026-11-27, ANSWER to M110)
- T1 stays below the ≥30-distinct bar (10/9/14/14) because the lesson caps bound
  the pair count — so the missing-number form goes to T1 too (option (b)): same
  T1 number ranges, no widening, no cap breach (99/999). After: T1 distinct
  30/27/42/42, shapes 2 (mul-2d-1d/div-2d-1d: 120/111, shapes 3).
- `mul-hundreds-mental` T1 = 27 distinct (9 pairs × 3 forms) goes into the
  Phase 9 allow-list with the reason: lesson cap B36/B37 ≤ 1000 → 9 pairs max.
- Option (c) (widen T1 ranges) is NOT done.
