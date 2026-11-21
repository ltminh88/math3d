# Phase 12: Fractions — một phần mấy, 1/2..1/9 (B14)

## Context links
- [plan.md](plan.md), [research 01 §B14](research/researcher-01-hk1-missing-lessons.md)

## Overview
P1 (HK1 gap). Effort 4h. Lane muse-min. Deps 02. Branch `muse/fractions`.

## Key Insights
- Unit fractions only (Q7). Picture skills need a scene (`kind: 'fraction-shape'` circle/bar/grid with n parts, k shaded, `equal: boolean`); renderer lands in 16 → ship a scene-free skill (`fraction-of-set-number`, `fraction-read`) so B14 is playable at once.
- Unequal-parts trap = the core misconception; scene data carries part sizes, not pixels.
- Fraction of set: N divisible by n, N ≤ 45 (all ≤100 anyway).

## Requirements
Skills: `fraction-read` (word↔1/n), `fraction-shaded` (scene), `fraction-pick-picture` (scene, which of 3–4 shows 1/n), `fraction-of-set-circle` (scene: objects grid), `fraction-of-set-number`, `fraction-wp`.

## Architecture
`src/fractions/`: entries, item-for-skill, `fraction-generators.ts`, `fraction-set-generators.ts`, `fraction-scene-types.ts`, `fraction-distractors.ts`, `fraction-strings.ts`, oracles, tests.

## Related code files
Ownership: `src/fractions/**`.

## Implementation Steps
RED (sweep, oracle: shaded/total = 1/n only when equal parts; set results integer) → implement → GREEN → gates.

## Todo list
- [ ] scene-free skills
- [ ] scene skills + scene types
- [ ] strings

## Success Criteria
B14 covered with ≥1 scene-free skill; scene skills appear in dialogs after 16.

## Risk Assessment
| Risk | Countermove |
|---|---|
| "1/n" typography on small screens | render as stacked fraction in renderer; text form "một phần n" in prompt |

## Security Considerations
None.

## Next steps
16 renderer.
