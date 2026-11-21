# Phase 10: Arithmetic — mul/div 2–3 digit by 1 digit (B23, B26, B36, B37, B41) — HK1 priority

## Context links
- [plan.md](plan.md), [research 01 §B23, B26, B36, B37, B41](research/researcher-01-hk1-missing-lessons.md), [phase-09](phase-09-arithmetic-add-sub.md)

## Overview
P1 (child is at B23–B30 now). Effort 6h. Lane muse-88. Deps 09 (same folder). Branch `muse/arithmetic-mul-div-1000`.

## Key Insights
- Remainder answer = two steps: "Thương?" then "Số dư?" on the number pad (step kit already sequences steps). Rule enforced: dư < số chia.
- Zero in quotient (middle or trailing 0 digit) is the T3 trap and the main `find-error` source.
- "Giảm n lần" (B37) = division wording; "cần ít nhất" rounds up when dư > 0.

## Requirements
Skills: `mul-2d-1d`, `mul-tens-mental`, `mul-2d-1d-wp`, `div-2d-1d`, `div-2d-1d-remainder`, `div-tens-mental`, `div-2d-1d-wp`, `mul-3d-1d`, `mul-hundreds-mental`, `mul-3d-1d-wp`, `div-3d-1d`, `div-3d-1d-remainder`, `div-hundreds-mental`, `div-reduce-times`, `mul-div-find-error`.
- Ranges: B23 product ≤99; B36 ≤999; divisors 2–9.

## Architecture
`src/arithmetic/mul-generators.ts`, `div-generators.ts`, `mul-div-word-problems.ts`, `mul-div-find-error.ts`, strings split as needed.

## Related code files
Ownership: `src/arithmetic/**`.

## Implementation Steps
1. RED: oracles (q, r by repeated subtraction in test), dư<chia, zero-in-quotient present at T3, ranges.
2. Implement; GREEN; e2e lesson-practice smoke B26 two-step remainder (tap).
3. Gates; pool counts.

## Todo list
- [ ] mul 2d/3d + mental
- [ ] div 2d/3d + remainder two-step
- [ ] wp + giảm n lần + find-error
- [ ] e2e smoke

## Success Criteria
B23, B26, B36, B37, B41 covered; remainder entered by tap on all touch projects.

## Risk Assessment
| Risk | Countermove |
|---|---|
| Two-step remainder feels like two questions | one story card, step labels "Thương" / "Số dư" |

## Security Considerations
None.

## Next steps
11 extends ranges.
