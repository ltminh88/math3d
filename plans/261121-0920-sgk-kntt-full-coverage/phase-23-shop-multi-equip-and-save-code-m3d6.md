# Phase 23: Shop — wear many items at once + save code M3D6

## Context links
- [plan.md](plan.md) · issue [#45 decision](https://github.com/ltminh88/math3d/issues/45#issuecomment-7074215079)
- `src/shop/cosmetic-catalog.ts` (slot/anchor), `src/shop/equipped-cosmetics-applier.ts`, `src/shop/shop-panel*.ts`, `src/store/save-schema.ts` (cosmetics), `src/store/save-code-*.ts`, `src/store/save-migrations.ts`

## Overview
P2, 6h, lane muse-min (+ reviewer review of save code). Author decision 22/11: each item has its own **Mặc vào / Cởi ra**; wear any number; **same body spot (head/neck/back) → new item replaces old**; village decor: any number, each has its own spot.

## Key Insights
- Today `equipped: Record<CosmeticSlot, id>` (one per group). New model: per character `head|neck|back → id` + `decor: id[]`.
- Save code `e` is decoded strictly in M3D5 → bump once to **M3D6** (reads M3D1–M3D6; M3D5 `e` maps to the new model). Store needs an append-only migration step (SCHEMA_VERSION 2) if the persisted shape changes.
- Draw calls: worn items keep merging into one mesh per character; decor merged/instanced.

## Requirements
- Toggle wear/unwear per item; same-spot replacement; decor unlimited (catalog-defined spots).
- Old saves/codes import with the same items worn.
- Touch ≥44 px; vi + en strings.

## Architecture
`equipped` → `{ vlm: Partial<Record<Anchor,id>>, avatar: Partial<Record<Anchor,id>>, decor: id[] }`. Pure reducer `wearItem/unwearItem` (unit-tested). Applier rebuilds merged mesh on change. Codec v6 payload + migration v1→v2.

## Related code files
Ownership: `src/shop/**`, `src/store/save-schema.ts`, `src/store/save-migrations.ts`, `src/store/save-code-v6-*.ts`, `src/store/save-code-codec.ts`, `src/ui/save-code-dialog.ts`, related tests + `tests/e2e/shop*.spec.ts`.

## Implementation Steps
1. RED: reducer tests (3 spots worn; same-spot replace; decor many); codec test M3D5→M3D6 equipped mapping; migration test.
2. Implement model, reducer, applier, panel buttons.
3. Codec M3D6 + migration; e2e: buy 3 items, wear all, reload → still worn; import an M3D5 code.
4. Gates; screenshots 4 projects.

## Todo list
- [ ] reducer · [ ] applier · [ ] panel · [ ] migration · [ ] M3D6 · [ ] e2e · [ ] screenshots

## Success Criteria
VLM can wear hat + scarf + cape together; second hat swaps the first; codes/saves from before import unchanged.

## Risk Assessment
Save data is safety-critical → full save-code + migration suites; reviewer reads every codec line. Parity: shop panel shots may change → parity-change label, reviewer recaptures.

## Security Considerations
Decoded ids still validated (pattern + caps); unknown well-formed ids dropped as in M3D5.

## Next steps
Phase 24 (new items).
