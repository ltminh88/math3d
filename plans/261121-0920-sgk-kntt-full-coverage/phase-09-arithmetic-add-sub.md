# Phase 09: Arithmetic — add/sub to 1 000, 10 000, 100 000 (B2, B54–55, B63–64)

## Context links
- [plan.md](plan.md), [research 01 §B2](research/researcher-01-hk1-missing-lessons.md), [research 02 §CĐ10, CĐ12](research/researcher-02-hk2-missing-topics.md)
- `src/reasoning/word-problem-contexts.ts` (theme reuse), `reasoning-step-answers.ts`

## Overview
P1. Effort 5h. Lane muse-88. Deps 02. Branch `muse/arithmetic-add-sub`.

## Key Insights
- No column-input UI in v1: "result only" via number pad; carries are the tier axis (T1 none, T2 one, T3 chains / borrow across zero, e.g. round thousands − 2-digit).
- `find-error` (Đ/S on a worked result) is a cheap high-value form: show a wrong result built from a misconception (forgot carry, borrowed twice) — verdict buttons exist in kit.
- Word problems 1–2 steps reuse contexts; names/objects random; no book numbers.

## Requirements
Skills: `add-sub-mental-round` (B2), `add-sub-1000`, `add-sub-1000-wp`, `add-sub-1000-chain`, `add-4digit`, `sub-4digit`, `add-sub-10000-wp`, `add-5digit`, `sub-5digit`, `add-sub-100000-wp`, `add-sub-find-error`, `add-missing-digit` (T3).
- Shared `carry-count.ts` helper used for tier selection; oracle computes carries independently (digit loop in test file).

## Architecture
`src/arithmetic/`: entries, item-for-skill, `add-sub-generators.ts`, `add-sub-word-problems.ts`, `carry-count.ts`, `arithmetic-ranges.ts`, `arithmetic-distractors.ts`, `arithmetic-strings.ts`, oracles, tests.

## Related code files
Ownership: `src/arithmetic/**`.

## Implementation Steps
1. RED: sweep, oracles (sum/diff/carries), tier constraints (T1 has 0 carries…), ranges.
2. Implement; GREEN; pool counts; gates.

## Todo list
- [ ] carry helper + oracle
- [ ] add/sub per range
- [ ] wp + chain + find-error
- [ ] strings

## Success Criteria
B2, B54, B55, B63, B64 covered; no scene needed (works in dialog immediately).

## Risk Assessment
| Risk | Countermove |
|---|---|
| Large numbers hard to read on phone | thin-space grouping `12 345` via one formatter in strings |

## Security Considerations
None.

## Next steps
10, 11.
