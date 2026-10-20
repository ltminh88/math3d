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
- `ui/` DOM shell, HUD, dialogs and bootstrap; `ui/kit/` keeps number-pad, choice-buttons, aria-announcer for later levels.
- `webmcp/` WebMCP tools exposed by the page.
- `learning/` and `store/` are pure logic: no `three`, no DOM imports. They must run under Vitest's node environment.
- Progress has one source of truth, the game store (IndexedDB); the UI keeps an optimistic view (`gameState.progress`) and writes every change through `src/ui/progress-sync.ts`. Settings (language, sound, music, quest card) have one source too: `src/store/app-settings.ts`. Never write the legacy `aigame3d_*` keys.
- `core/` holds only reusable pieces kept for later levels (input controllers, speech narrator, audio gesture unlock, quality tiers, context-loss, WebGL check, tweens, asset cache/disposer). It is not a second engine.
- `dev/` dev-only probes (`?debug=fps` frame-time overlay), never in the production bundle.
- Planned: `levels/**` game content hosted by the world, `sync/**` Supabase.
- Cosmetics are visual only and never touch learning logic.
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
