# Phase 11: Arithmetic — mul/div 4–5 digit by 1 digit (B56, B57, B70, B71)

## Context links
- [plan.md](plan.md), [research 02 §CĐ10, CĐ14](research/researcher-02-hk2-missing-topics.md), [phase-10](phase-10-arithmetic-mul-div-to-1000.md)

## Overview
P2. Effort 4h. Lane muse-88. Deps 10. Branch `muse/arithmetic-mul-div-large`.

## Key Insights
Same generators parameterised by digit count; T3 adds expression `a + b × c` (mul first), money-change wp (tie-in with phase 14 contexts but own strings), compare results max/min.

## Requirements
Skills: `mul-4d-1d`, `mul-thousands-mental`, `div-4d-1d`, `div-4d-1d-remainder`, `div-thousands-mental`, `mul-5d-1d`, `div-5d-1d`, `div-5d-1d-remainder`, `mul-div-large-wp`, `mul-chain-operators`; products/quotients < 100 000.

## Architecture
Reuse `mul-generators.ts`/`div-generators.ts` with range param; `mul-div-large-word-problems.ts`.

## Related code files
Ownership: `src/arithmetic/**`.

## Implementation Steps
RED oracles/ranges → implement → GREEN → gates, pool counts.

## Todo list
- [ ] range params + tests
- [ ] wp + chain
- [ ] strings

## Success Criteria
B56, B57, B70, B71 covered.

## Risk Assessment
| Risk | Countermove |
|---|---|
| Files >200 lines after params | split per op/range |

## Security Considerations
None.

## Next steps
20.
