# Phase 04: Hub village, world map, VLM guide, story intro

## Context links
- [plan.md](./plan.md) · [research 01 §2 hub movement, §3 budget, §5 PWA update prompt](research/researcher-01-threejs-game-architecture-report.md)
- Depends on: [phase 02](./phase-02-engine-core-input-audio-ui-kit.md), [phase 03](./phase-03-learning-core-and-local-store.md)

## Overview
- Date: 2026-10-18
- Description: App boot + router, cosmetics shop (spend coins on VLM/avatar outfits + village decorations, visual only), hub village (tap-to-move + WASD), VLM guide character built in code, world map with 5 regions (Bridge, Field, Forest playable; City, Tower shown "coming soon"), story intro (storm scatters number stones from the Math Tower), shared level kit used by 05/06/07, SW update prompt, settings, e2e driver.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed

## Key Insights
- Only the hub is walkable; levels are fixed-camera dioramas. Walkable area = 6-8 rectangles + obstacle circles with push-out (no navmesh).
- Level registry auto-discovers `src/levels/*/index.ts` via `import.meta.glob` (lazy) -> 05/06/07 add levels without touching shared files. A region in `world-map-config.ts` with no discovered level renders as "coming soon" (real feature, also covers City/Tower).
- `level-session-controller` is the single glue between scene, learning core, UI kit and store, so the three level phases only implement visuals + round interaction.
- PWA update prompt shown only in hub (never mid-level).
- Cosmetics never affect learning: catalog = `{id, slot: 'vlm-outfit'|'avatar-outfit'|'village-decor', price, buildMesh}`; applied by hub/character builders reading equipped ids. Prices tuned so a level run (~30 coins) buys an item every 1-2 runs.
- Read-aloud: level kit calls 02 narrator for question + hint text when `readAloud` setting on.
- Story: game "Hành Trình Đá Số" — storm scattered number stones from the Math Tower; VLM and player repair each region.
- `window.__game` debug hook only when `import.meta.env.MODE === 'test'`.

## Requirements
- Functional: first launch -> story intro (skippable after first view) -> hub; VLM greets and points to map; map shows progress stars per region and unlock state (from `progression.ts`).
- Functional: shop panel in hub (from shop stall building + menu): tabs by slot, owned/equipped state, price, buy confirm, equip; not reachable from levels; purchase via `store.purchaseCosmetic`. Initial catalog ~12 items (4 per slot), all low-poly built in code.
- Functional: hub menu: map, shop, settings (language vi/en, sound, volume, read-aloud, reduced motion), parent-area entry slot (filled by 09; hidden until then).
- Functional: level kit: round loop (plan session -> present question -> accept answer -> feedback -> hint ladder -> record), HUD (round progress, hint button, pause), complete panel (stars, XP, coins, back to map), `commitSession` at end; abandon mid-level commits nothing.
- Non-functional: hub <= 100 draw calls, <= 100k tris; reduced motion disables camera sway, particles, storm shake.

## Architecture
```
src/main.ts                 -> boot()
src/app/boot.ts             fonts/i18n/settings -> webgl check -> store load -> scene manager -> first scene
src/app/app-router.ts       scene ids: intro | hub | map | level:<id>
src/app/hub-menu.ts         DOM menu (map, settings, parent-area slot)
src/app/settings-panel.ts
src/app/service-worker-prompt.ts   registerSW onNeedRefresh -> toast in hub
src/app/debug-hook.ts       window.__game {sceneId, store snapshot, renderer.info, worldToScreen(id), answerCurrent()}
src/scenes/hub/ hub-scene.ts hub-terrain-builder.ts hub-buildings-builder.ts hub-props-instanced.ts hub-walkable-area.ts player-avatar.ts tap-to-move-controller.ts keyboard-move-controller.ts hub-interactables.ts
src/scenes/world-map/ world-map-scene.ts world-map-config.ts region-marker-builder.ts
src/scenes/story-intro/ story-intro-scene.ts story-intro-timeline.ts
src/characters/ vlm-guide-model.ts vlm-guide-animator.ts vlm-dialogue-runner.ts
src/story/ story-strings.ts hub-strings.ts map-strings.ts
src/shop/ cosmetic-catalog.ts cosmetic-mesh-builders.ts shop-panel.ts shop-purchase-flow.ts equipped-cosmetics-applier.ts shop-strings.ts
src/levels/shared/ level-definition-contract.ts level-registry.ts level-session-controller.ts level-hud.ts level-complete-panel.ts hint-presenter.ts feedback-effects.ts level-shared-strings.ts
tests/e2e/helpers/game-driver.ts   wait for scene, tap world object, solve current question via debug hook
tests/e2e/hub-navigation.spec.ts
tests/e2e/shop-purchase.spec.ts
```
`LevelDefinition = { id, regionId, tables, rounds, createScene(ctx, session): GameScene }`; level scene implements `presentQuestion(q)`, `showHint(rung, q)`, `celebrate(result)`; controller owns flow.

## Related code files
Create: all files above; tests `src/levels/shared/level-session-controller.test.ts` (flow with fake scene + seeded learning), `src/scenes/hub/hub-walkable-area.test.ts`, `src/shop/shop-purchase-flow.test.ts` (affordability, owned, equip rules), `src/shop/cosmetic-catalog.test.ts` (unique ids, valid slots, id regex matches server).
Modify: `src/main.ts` (replace stub body with `boot()`).
Delete: none.

## Implementation Steps
1. Boot + router + debug hook; settings panel + hub menu.
2. VLM guide model (low-poly, distinct from any existing character: own palette/silhouette), animator (idle bob, talk, cheer, point), dialogue runner using speech bubble.
3. Hub: terrain, buildings (house, well, signpost to map), instanced props, walkable area, avatar, tap-to-move with ground ring marker, WASD/arrows.
4. Story intro timeline (storm, stones fly to regions, VLM asks for help), skip button, `meta.introSeen`.
5. World map scene + config (5 regions, storyline line per region), unlock + stars from store.
6. Level kit: contract, registry (glob), session controller, HUD, complete panel, hint presenter, feedback effects (shake + sound + icon, never red X).
7. SW update prompt in hub.
7b. Shop: catalog + mesh builders, panel, purchase flow, equipped applier on hub + VLM + avatar; e2e `shop-purchase.spec.ts` (seed coins via debug hook -> buy -> equip -> visible on reload).
8. E2E driver + `hub-navigation.spec.ts`: boot -> intro skip -> hub -> open map -> City shows "coming soon" -> language switch to en updates text -> reload keeps setting.
9. **Perf recheck** of hub on iPad 9th gen + Windows Core i5; append to `reports/perf-spike-report.md`.

## Todo list
- [ ] boot, router, debug hook, menu, settings
- [ ] VLM guide model/animator/dialogue
- [ ] hub scene + movement
- [ ] story intro
- [ ] world map + config
- [ ] level kit (+controller test)
- [ ] SW update prompt
- [ ] cosmetics shop (+tests, e2e)
- [ ] e2e driver + hub spec
- [ ] device perf recheck

## Success Criteria
- `hub-navigation.spec.ts` green on desktop + mobile projects.
- Hub on iPad 9th gen + Windows Core i5 >= 55 fps avg while walking; draw calls <= 100.
- Buying + equipping persists across reload; insufficient coins shows friendly message; no learning code imports `src/shop/**` (grep).
- Controller test proves: abandon -> no commit; completion -> exactly one `commitSession`.
- No string literal visible to users outside `*-strings.ts` (grep check for Vietnamese diacritics in `.ts` files outside strings files).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Hub scope creep (NPCs, quests) | M | M | hub = menu in 3D; only map + VLM interactables in MVP |
| `import.meta.glob` lazy chunk misses PWA precache | L | M | glob patterns include all js; offline e2e in 10 |
| Kids 7 can't read prompts | M | H | VLM icons + short sentences + read-aloud (02 narrator) where vi voice exists |
| Shop becomes a distraction | M | M | shop only in hub, small catalog, no timers/ads/real money |
Rollback: revert phase commits; restore stub `src/main.ts`.

## Security Considerations
- Debug hook tree-shaken out of production: phase 10 asserts `__game` absent in `dist/`.

## Next steps
- Unblocks 05, 06, 07, 09 (parallel).
