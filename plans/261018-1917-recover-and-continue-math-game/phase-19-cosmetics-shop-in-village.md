# Phase 19: Cosmetics shop in the village (VLM/avatar outfits, village decor)

## Context links
- [plan.md](plan.md) · **Spec: [old phase 04 shop parts](../261018-1803-vlm-math-game-mvp/phase-04-hub-map-vlm-guide-story.md)** (catalog shape, slots, prices, purchase/equip rules, tests — valid unless changed below) · [old phase 03 store API](../261018-1803-vlm-math-game-mvp/phase-03-learning-core-and-local-store.md) · [phase 13 interactables](phase-13-level-host-and-region-progression.md) · [phase 16 owned_cosmetics](phase-16-supabase-backend.md)
- Depends on: 13 (interactables registry, world pause). Parallel with: 14, 15, 17 (G7). Validated 2026-10-18 (user: YES, ~+6h).

## Overview
- Date: 2026-10-18
- Description: Re-add the old-04 cosmetics shop, adapted to the recovered world: a shop stall in the village region opens a shop panel styled like recovered dialogs; coins buy visual-only items for VLM (guide NPC), the player avatar and village decor. Spending goes through the existing `purchaseCosmetic`/`equipCosmetic` store API.
- Priority: P2
- Implementation status: pending
- Review status: not reviewed

## Key Insights
- Store already ships `purchaseCosmetic(id, price)` (atomic debit, reject if insufficient, one outbox item), `equipCosmetic(slot, id)`, `snapshot.ownedCosmetics` (tested in `src/store/game-store.test.ts`). No store change.
- Cosmetics never affect learning or rewards: no `src/learning/**`, `src/quiz/**`, `src/levels/**` import of `src/shop/**` (grep gate). Bridge rewards stay frozen (12).
- Recovered characters (`src/world/characters.ts`: VLM with hat + beacon, avatar boy/girl) are simple groups -> outfits = extra low-poly meshes attached to named anchor points (head, body, back); village decor = meshes placed at fixed village slots (no RNG -> scatter and parity unchanged when nothing is equipped).
- Prices: Field/Forest run ~30 coins, bridge quest ~30 coins -> items 20-60 coins (one item every 1-2 runs, old-04 rule).

## Requirements
- Functional: catalog ~12 items, 4 per slot `'vlm-outfit' | 'avatar-outfit' | 'village-decor'`; id regex `^[a-z0-9-]{1,40}$` (matches 16). Panel: tabs per slot, owned/equipped state, price, buy confirm, equip/unequip, "Chưa đủ xu" friendly message. Entry: shop stall interactable in village + HUD shop button; not reachable inside levels.
- Equipped items visible in world, minimap untouched, persist across reload and (after 17) across devices.
- Non-functional: <= +6 draw calls with everything equipped (merged/instanced like recovered statics); strings via `defineStrings('shop', vi/en)`; keyboard + screen-reader reachable (18 audits).
- With nothing equipped, all world parity shots stay identical except the new stall (re-baselined, listed).

## Architecture
```
src/shop/cosmetic-catalog.ts         {id, slot, price, nameKey, buildMesh} x12
src/shop/cosmetic-mesh-builders.ts   low-poly outfit/decor meshes from recovered world-primitives palette
src/shop/shop-stall-builder.ts       stall mesh in village + registerInteractable (13 API)
src/shop/shop-panel.ts               dialog in recovered style (tabs, cards, confirm)
src/shop/shop-purchase-flow.ts       pure rules: affordable/owned/equip -> store calls
src/shop/equipped-cosmetics-applier.ts  store subscribe -> attach/detach meshes on VLM, avatar, village slots
src/shop/shop-strings.ts             defineStrings('shop')
src/world/characters.ts              + named anchor points (no visual change)
src/config/regions.ts                + village stall position + decor slots
src/ui/hud.ts                        + shop button, initShop() once store snapshot ready
```
Flow: interact/HUD -> panel -> `purchaseCosmetic` -> store event -> applier re-renders -> outbox (17 syncs).

## Related code files
- Create: `src/shop/**` above, `src/shop/shop-purchase-flow.test.ts`, `src/shop/cosmetic-catalog.test.ts`, `tests/e2e/shop-purchase.spec.ts`. Modify: `src/world/characters.ts`, `src/config/regions.ts`, `src/ui/hud.ts`, parity baselines for stall shots. Delete: none.

## Implementation Steps
1. Catalog + mesh builders + catalog test (unique ids, valid slots, regex, prices 20-60).
2. Purchase flow (pure) + tests: insufficient coins, already owned, equip only owned, unequip.
3. Anchor points in characters; stall + decor slots in regions config; stall interactable.
4. Panel UI + strings; HUD button.
5. Applier (subscribe, attach/detach, dispose on unequip).
6. E2E `shop-purchase.spec.ts`: seed coins via test hook -> stall -> buy -> equip -> visible -> reload -> still equipped; insufficient coins message. Parity re-baseline for stall shots only.

## Todo list
- [ ] catalog + meshes (+ test)
- [ ] purchase flow (+ tests)
- [ ] anchors, stall, decor slots
- [ ] panel + HUD button + strings
- [ ] applier
- [ ] e2e + parity re-baseline

## Success Criteria
- `npm test` + `npm run test:e2e -- shop-purchase` green; `npm run test:parity` green with only stall shots re-baselined.
- `grep -r "src/shop" src/learning src/quiz src/levels` empty.
- Everything equipped: draw calls <= baseline + 6; 10x equip/unequip leaves `renderer.info.memory.geometries` at baseline.

## Scope Contract
- Changed: new `src/shop/**`, character anchors, regions config, HUD. Impacted: world visuals near village, HUD, coins spend path (store already tested).
- Will verify: unit (catalog, flow), e2e (buy/equip/reload), parity (unchanged scenes), leak check.
- Skipped: store internals (unchanged, own tests), sync (17 integration tests cover cosmetics outbox).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Shop distracts from learning | M | M | village only, small catalog, no timers/ads/real money |
| Outfit meshes break parity of characters | L | M | anchors add no geometry; applier only when equipped |
| Edit clash with 13/17 files | L | M | 13 done before G7; 17 owns settings/bootstrap/main, 19 never edits them |
Rollback: remove HUD button + stall registration -> shop unreachable; owned items stay in store harmlessly.

## Security Considerations
- Visual only; prices client-side; server (16) bounds coins delta and clamps wallet >= 0, so tampering only affects own local cosmetics. No PII.

## Next steps
- 17 syncs owned/equipped cosmetics; 18 a11y/perf covers shop.
