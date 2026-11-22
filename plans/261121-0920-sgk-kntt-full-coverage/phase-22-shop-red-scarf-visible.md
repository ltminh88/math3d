# Phase 22: Shop — VLM red scarf visible

## Context links
- [plan.md](plan.md) · issue [#45](https://github.com/ltminh88/math3d/issues/45) (author report 22/11)
- `src/shop/cosmetic-mesh-builders.ts:34` (`vlmRedScarf`), `src/world/characters-milo-avatar.ts:30,68-75` (`GUIDE_ANCHORS`, robe/beard)

## Overview
P2, 2h, lane muse-min. Bought "Khăn quàng đỏ" is invisible on VLM: ring r=0.44 at neck y=1.2 sits inside the robe cylinder (top y≈1.275, r≈0.45) and behind the beard; tails at z=0.42 are inside the robe.

## Key Insights
- Visual-only bug; no save/learning impact. Same risk for other worn items (avatar scarf, cape) → add a generic visibility test.

## Requirements
- Scarf visibly wraps above the robe top, under the beard; tails outside the robe front, beside the beard.
- Generic unit test: every worn cosmetic has ≥ N% of its vertices outside the wearer's body volume (robe cylinder / head sphere approximations).
- Desktop + phone screenshot in PR.

## Architecture
Adjust part offsets/radius in `vlmRedScarf` (or raise `GUIDE_ANCHORS.neck` only if all neck items are re-checked). Test reads body primitives from a small exported table (no test-only seams in runtime code beyond constants already present).

## Related code files
Ownership: `src/shop/cosmetic-mesh-builders.ts`, `src/shop/*.test.ts`, `src/world/characters-milo-avatar.ts` (anchors only if needed).

## Implementation Steps
1. RED: visibility test fails for `vlm-red-scarf`.
2. Fix geometry; GREEN; check all 12 items with the test.
3. Gates + e2e shop spec; screenshots.

## Todo list
- [ ] RED visibility test · [ ] fix scarf · [ ] audit other items · [ ] gates + screenshots

## Success Criteria
Scarf clearly visible on VLM on phone and desktop; test guards all items.

## Risk Assessment
Parity shots of VLM unaffected unless scarf equipped (baselines don't equip) — confirm; if changed, label parity-change.

## Security Considerations
None.

## Next steps
Phase 23 (multi-equip).
