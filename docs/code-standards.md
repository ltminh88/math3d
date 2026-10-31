# Code standards

## Files and naming
- kebab-case file names that say what the file does (`game-store.ts`, not `utils.ts`).
- Keep code files under 200 lines; split by responsibility when they grow.
- TypeScript strict + `noUncheckedIndexedAccess`. Lint/format with Biome (`npm run lint`).

## Layering
One engine only: the recovered world. Folders under `src/`:
- `config/` world constants, regions, roads, seeded LCG (pure data).
- `save/` legacy v1 save format and parser (read-only: migration and save codes); `game/` XP and levels; `quiz/` the recovered hint text, frozen quiz rewards and the adapter from `learning/` (Leitner planner, distractors, recorder) to the 3-choice quiz dialog.
- `audio/` recovered Web Audio synth; `i18n/` `defineStrings` namespaces and the legacy translator.
- `world/` Three.js world (renderer setup, builders, scatter, characters, player, camera, frame loop); `map/` minimap and world-map canvas rendering.
- `ui/` DOM shell, HUD, dialogs and bootstrap; `ui/kit/` keeps number-pad, choice-buttons, aria-announcer and the step kit (step-card, multi-select, verdict buttons) for levels; every kit control is tap-usable, ≥44 px, keys optional.
- `webmcp/` WebMCP tools exposed by the page.
- `learning/`, `reasoning/` (seeded reasoning generators, chapter 2) and `store/` are pure logic: no `three`, no DOM imports. They must run under Vitest's node environment.
- Progress has one source of truth, the game store (IndexedDB); the UI keeps an optimistic view (`gameState.progress`) and writes every change through `src/ui/progress-sync.ts`. Settings (language, sound, music, quest card) have one source too: `src/store/app-settings.ts`. Never write the legacy `aigame3d_*` keys.
- `core/` holds only reusable pieces kept for later levels (input controllers, speech narrator, audio gesture unlock, quality tiers, context-loss, WebGL check, tweens, asset cache/disposer). It is not a second engine.
- `dev/` dev-only probes (`?debug=fps` frame-time overlay), never in the production bundle.
- `levels/shared/` the level host (one renderer: the world loop is suspended while a level runs), level gates, progression and the test-build hook `window.__game`. Each level lives in `levels/<id>/`; its `index.ts` default-exports only a `LevelDefinition` (self-registered via `import.meta.glob`) and loads its scene with a dynamic `import()` so the level stays its own chunk.
- Shipped levels: `levels/field/` (meadow, multiplication as a planting grid), `levels/forest/` (division as fair sharing and fact families), `levels/city/` (tables 6–9: parcel delivery by house number and lighting windows) and `levels/tower/` (the final climb, × and : over tables 2–9). Each gate opens once the previous level is completed: field → forest → city → tower.
- `shop/` cosmetics (catalog, purchase flow, village stall, shop panel, equipped items on VLM): visual only, never imported by `learning/`, `quiz/` or `levels/`. Coins are spent through the store; the panel opens through `ui/dialog.ts`, so it stays closed while a level runs.
- Interactables (VLM, level gates, the phase 19 shop stall) register with `world.registerInteractable`; the interact button and E key use the nearest one in reach.
- Planned: `sync/**` Supabase.
- Save codes: export writes the newest version (`M3D3`); never change a shipped version's format — add a new `M3D<n>` and keep decoding the old ones (see `docs/recovery-notes.md`).
- Every drag interaction has a tap-select and a keyboard alternative (WCAG 2.5.7).

## Strings (i18n)
- Each module declares its own namespace: `const ts = defineStrings('bridge', { vi: {...}, en: {...} })`.
- `vi` is the source of truth; a missing `en` key fails typecheck.
- The game name and guide name ("VLM") live only in `src/i18n/common-strings.ts` (plus the static PWA manifest in `vite.config.ts`, keep in sync).

## Ownership by folder
Parallel work is split by folder (see the plan's "Parallel groups"). Levels self-register via `import.meta.glob`; `package.json` is only edited in phase 01 unless agreed otherwise.

## Tests
- Unit tests co-located as `*.test.ts` next to the code; run with `npm test`.
- E2E tests in `tests/e2e/*.spec.ts`; assert state (DOM, store) rather than pixels.
- A test must protect real behavior or a credible regression; no tests for trivia.

## Env and secrets
- Every `.env*` file is git-ignored except `.env.example`. Only the Supabase publishable key goes in client env.
