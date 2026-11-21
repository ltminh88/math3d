# Phase 07: Numbers — read/write, place value, neighbours, compare, order (B1, B45–46, B59–60)

## Context links
- [plan.md](plan.md), [research 01 §B1](research/researcher-01-hk1-missing-lessons.md), [research 02 §CĐ8, CĐ11](research/researcher-02-hk2-missing-topics.md)
- Template family: `src/measurement/` (generators, ranges, distractors, strings, oracles, sweep tests)

## Overview
P1. Effort 5h. Lane muse-88. Deps 02. Branch `muse/numbers-place-value`.

## Key Insights
- One generator family scales by range: `range = 1000 | 10000 | 100000` chosen by skill id (B1/B45/B59), tiers raise traps (zero digits, boundary 999/1000, 9 999/10 000), not size.
- Reading numbers in words (Vietnamese "linh/lẻ", "mốt", "tư", "lăm", "không trăm") is a pure helper `numberToVietnameseWords(n)` with its own oracle table (hand-written cases).
- Scene: base-10 blocks / place-value table / number line as plain data (`kind: 'place-value' | 'number-line'`); renderers in phase 16. Until then those skills are filtered from dialogs, so prefer scene-free forms for T1 where possible.

## Requirements
Skills (ids final at PR): `num-read-write-1000`, `num-place-value-1000`, `num-neighbors-1000`, `num-compare-1000`, `num-order-1000`, `num-sequence-1000`, `num-read-write-10000`, `num-place-value-10000`, `num-compare-10000`, `num-order-10000`, `num-read-write-100000`, `num-expand-100000`, `num-compare-100000`, `num-order-100000`; each with `lessons`.
- Forms: number pad (write number, missing in sequence, liền trước/sau), MCQ (đọc là…, >,<,= as 3 choices, largest/smallest), multi-select order (existing kit), compare vs expanded sum (T3).
- Distractors tagged misconception: swapped digits, dropped zero, off-by-ten, wrong place.

## Architecture
`src/numbers/`: `numbers-skill-entries.ts`, `numbers-item-for-skill.ts`, `number-words-vi.ts`, `place-value-generators.ts`, `compare-order-generators.ts`, `numbers-ranges.ts`, `numbers-distractors.ts`, `numbers-strings.ts`, `numbers-scene-types.ts`, `numbers-test-oracles.ts`, tests.

## Related code files
Ownership: `src/numbers/**` only.

## Implementation Steps
1. RED: catalog==GENERATORS, seed sweep via `sweepItem` (unique options, 3–4 choices, determinism), oracle per form, words oracle table, number ranges per skill.
2. Generators + strings; GREEN. `tools/practice/pool-counter` counts in PR.
3. Gates; e2e lesson-practice smoke for B1 (if 06 merged).

## Todo list
- [ ] words helper + oracle
- [ ] place value / neighbours / sequence
- [ ] compare / order
- [ ] strings vi/en + pool counts

## Success Criteria
Lessons B1, B45, B46, B59, B60 covered (coverage test); every number within its lesson range.

## Risk Assessment
| Risk | Countermove |
|---|---|
| Vietnamese reading rules wrong | oracle table reviewed by author (listed in PR) |

## Security Considerations
Own numbers only; no textbook items.

## Next steps
08, 16, 20.
