# Phase 08: Numbers — rounding and Roman numerals (B47, B48, B61)

## Context links
- [plan.md](plan.md), [research 02 §B47, B48, B61](research/researcher-02-hk2-missing-topics.md), [phase-07](phase-07-numbers-place-value-compare-order.md)

## Overview
P1. Effort 4h. Lane muse-88. Deps 07 (same folder). Branch `muse/numbers-rounding-roman`.

## Key Insights
- One rounding rule in code (`roundTo(n, place)`, 5 rounds up) used by generator; oracle is an independent hand table incl. carries (rounding up across a thousand, and a 4-digit number rounding up to 10 000).
- Roman: I..XX only (I, V, X; IV, IX, XIV, XIX). Roman clock (hour only) is a time-scene item → `roman-clock-hour` lives in phase 13 to keep scenes in one family.

## Requirements
Skills: `round-tens`, `round-hundreds`, `round-thousands`, `round-ten-thousands`, `round-which-place` (T3), `roman-to-number`, `number-to-roman`, `roman-sequence`.
- Distractors: wrong direction, wrong place, truncation; Roman: additive misread (IV→6), IX/XI swap.

## Architecture
`src/numbers/rounding-generators.ts`, `roman-numeral-generators.ts`, `roman-numerals.ts` (pure converter), entries/item-for-skill/strings additions.

## Related code files
Ownership: `src/numbers/**`.

## Implementation Steps
1. RED oracles (hand tables), sweep, catalog==GENERATORS.
2. Implement; GREEN; gates; pool counts.

## Todo list
- [ ] rounding + oracle
- [ ] Roman converter + generators
- [ ] strings

## Success Criteria
B47, B48, B61 covered; all values in lesson range.

## Risk Assessment
| Risk | Countermove |
|---|---|
| numbers-strings.ts >200 lines | split `rounding-roman-strings.ts` |

## Security Considerations
None.

## Next steps
20 uses these in Lâu Đài Số.
