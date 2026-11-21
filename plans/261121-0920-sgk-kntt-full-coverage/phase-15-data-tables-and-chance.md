# Phase 15: Data — tables, tally, chắc chắn / có thể / không thể (B73–74)

## Context links
- [plan.md](plan.md), [research 02 §B73, B74](research/researcher-02-hk2-missing-topics.md)

## Overview
P2. Effort 4h. Lane muse-min. Deps 02. Branch `muse/data-chance`.

## Key Insights
- Table scene `kind: 'data-table'` {headers, rows, hiddenCell?}; tally `kind: 'tally'`; bag `kind: 'bag'` {items by colour, pick k}; dice faces.
- Chance answers = 3 fixed choices (chắc chắn / có thể / không thể); oracle enumerates outcomes in test.

## Requirements
Skills: `tally-count`, `table-read`, `table-max-min`, `table-sums`, `table-fill-missing`, `chance-bag`, `chance-dice`.

## Architecture
`src/data/`: entries, item-for-skill, `table-generators.ts`, `chance-generators.ts`, `data-scene-types.ts`, `data-strings.ts`, oracles, tests.

## Related code files
Ownership: `src/data/**`.

## Implementation Steps
RED (enumeration oracle) → implement → GREEN → gates.

## Todo list
- [ ] table/tally generators
- [ ] chance generators
- [ ] strings

## Success Criteria
B73, B74 covered (all need scenes → playable after 17; note in PR).

## Risk Assessment
| Risk | Countermove |
|---|---|
| All data skills scene-bound → B73/74 "Sắp có" until 17 | 17 scheduled right after in same lane |

## Security Considerations
None.

## Next steps
17.
