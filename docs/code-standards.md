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
- `learning/`, `reasoning/` (seeded reasoning generators, chapter 2), `geometry/` and `measurement/` (seeded KNTT grade-3 item generators with plain-data scene descriptors), `numbers/`, `arithmetic/`, `fractions/`, `time/`, `money/` and `data/` (the six new KNTT families, one folder each: `*-skill-entries.ts` + `*-item-for-skill.ts`, wired once in `practice/item-for-skill.ts`) and `store/` are pure logic: no `three`, no DOM imports. They must run under Vitest's node environment.
- `practice/` the cross-family dispatcher (`item-for-skill.ts`: one skill id + rng + tier -> the item its family generates) and the scene base types (`practice-scene.ts`): a generated item is a `ReasoningItem` plus an optional plain-data `scene` (`PracticeItem`), never a three.js object. Scenes are plain data, so tests run in node; the levels or the dialog scene registry draw them.
- Progress has one source of truth, the game store (IndexedDB); the UI keeps an optimistic view (`gameState.progress`) and writes every change through `src/ui/progress-sync.ts`. Settings (language, sound, music, quest card) have one source too: `src/store/app-settings.ts`. Never write the legacy `aigame3d_*` keys.
- `core/` holds only reusable pieces kept for later levels (input controllers, speech narrator, audio gesture unlock, quality tiers, context-loss, WebGL check, tweens, asset cache/disposer). It is not a second engine.
- `dev/` dev-only probes (`?debug=fps` frame-time overlay), never in the production bundle.
- `levels/shared/` the level host (one renderer: the world loop is suspended while a level runs), level gates, progression and the test-build hook `window.__game`. Each level lives in `levels/<id>/`; its `index.ts` default-exports only a `LevelDefinition` (self-registered via `import.meta.glob`) and loads its scene with a dynamic `import()` so the level stays its own chunk.
- Shipped levels, one nine-level chain in two chapters (nine thử thách; a chặng is a stage inside one level — see the stage model below). Each gate opens once the previous level is completed:
  - Chapter 1: `levels/field/` (meadow, multiplication as a planting grid), `levels/forest/` (division as fair sharing and fact families), `levels/city/` (tables 6–9: parcel delivery by house number and lighting windows), `levels/tower/` (the final climb, × and : over tables 2–9). Once a child shows mastery, each ends its run with one reasoning round on the step kit (`levels/shared/reasoning-round-*`).
  - Chapter 2 (opens after the tower): `levels/garden/` (Khu Vườn Quy Luật: patterns, unknowns, brackets), `levels/valley/` (Thung Lũng Hình Học: geometry), `levels/workshop/` (Xưởng Đo Đạc: measurement, perimeter, area), `levels/cave/` (Hang Đố Vui: mixed reasoning, the last stage).
  - Chapter-2 regions, roads and gates live in `config/expansion-*` and are added after the scatter; `REGIONS`, `ROADS` and `WALKABLE_BOUNDS` stay byte-equal (golden traces).
- Content rules (author): every number a child sees — prompt, intermediate, answer, hint — is ≤100; no kg↔g, l↔ml or m↔mm conversions (cm↔mm only); no hint rung from 2 up shows the answer; tiers come from the skill's Leitner box and raise reasoning, not number size. The six new families use the lesson's range instead (1 000 / 10 000 / 100 000); time allows giờ↔phút only, and money is notes only (no coins).
- `shop/` cosmetics (catalog, purchase flow, village stall, shop panel, equipped items on VLM): visual only, never imported by `learning/`, `quiz/` or `levels/`. Coins are spent through the store; the panel opens through `ui/dialog.ts`, so it stays closed while a level runs.
- Interactables (VLM, level gates, the phase 19 shop stall) register with `world.registerInteractable`; the interact button and E key use the nearest one in reach.
- Planned: `sync/**` Supabase.
- Save codes: export writes the newest version (`M3D4`); never change a shipped version's format — add a new `M3D<n>` and keep decoding the old ones (see `docs/recovery-notes.md`).
- Every drag interaction has a tap-select and a keyboard alternative (WCAG 2.5.7).

## Stages, daily practice, stickers
- Stage model: each level has `stages` on its `LevelDefinition`; progress keeps `stageStars`, a sparse per-stage star array (`src/levels/shared/level-stages.ts`: `stageStatus`, `nextStage`, `stagesCompleted`). Stage 1 inherits the level's stars — the invariant `stageStars[0] === stars` is enforced on read by `migrateLevelProgress` (`src/store/save-migrations.ts`), so a pre-stages save shows stage 1 complete with its old stars and stages 2+ open at 0. A run always plays `nextStage` (first stage with <1 star; all done → the last stage); the map panel can ask one run to replay a completed stage via a one-shot override (`src/levels/shared/level-stage-override.ts`). The quest chain's unit is still the level, not the stage: the quest card shows one chapter row of at most 5 cells, plus a stage sub-line ("Chặng n/m · s/3m sao", "Đã qua hết các chặng!" once every stage is done).
- First-completion bonus (+50 XP, +10 coins) pays only when a run completes the level (stars ≥ 1) while the store's `completedAt` is still 0 (`src/levels/shared/level-run-result.ts`); a stage 2+ run records only its own `stageStars` slot (merged by max), so replaying never re-pays it and never overwrites earned stars.
- Daily practice (`src/learning/daily-planner.ts`): unlocks once field stage 1 is done (field stars ≥ 1). The day's set (10 items: 6 due + 3 weakest + 1 mastered) is planned from the learned pool — every fact/skill with ≥ 1 attempt, never an untaught fact, never a repeat within one day; a smaller pool plans fewer items (no top-up). The set is deterministic per (today, profile), so a replay after an interruption resumes the same items. Streak (`src/learning/daily-streak.ts`): consecutive days with a completed run; a missed day restarts it silently at 1 on the next completion — no copy ever mentions losing a streak. The HUD button reads "Luyện tập hôm nay"; the quest card carries one daily line ("Hôm nay: chưa luyện" / "Hôm nay: đã luyện ✓").
- Stickers are derived from progress, never stored (`src/learning/sticker-book.ts`): a sticker is earned ⟺ its unit reached Leitner box 4+ (table stickers: a share of the table's mul+div facts at box 4+). The book reads the fact/skill stats the store already holds, so an old save's boxes *are* its stickers and nothing can desync from real mastery. Stickers are visual only, like `shop/` cosmetics: only the UI reads the derivation, never `quiz/` or `levels/`.

## Strings (i18n)
- Each module declares its own namespace: `const ts = defineStrings('bridge', { vi: {...}, en: {...} })`.
- `vi` is the source of truth; a missing `en` key fails typecheck.
- The game name and guide name ("VLM") live only in `src/i18n/common-strings.ts` (plus the static PWA manifest in `vite.config.ts`, keep in sync).

## Ownership by folder
Parallel work is split by folder (see the plan's "Parallel groups"). Levels self-register via `import.meta.glob`; `package.json` is only edited in phase 01 unless agreed otherwise.

## Tests
- Unit tests co-located as `*.test.ts` next to the code; run with `npm test`.
- E2E tests in `tests/e2e/*.spec.ts`; assert state (DOM, store) rather than pixels. Four Playwright projects: `desktop-chromium`, `mobile-pixel`, `tablet-portrait`, `tablet-landscape` (iPad Pro 11 viewport, touch). Touch projects use `tap()` only; every step must be playable without a keyboard, targets ≥44 px, no key hints on `(pointer: coarse)`.
- A test must protect real behavior or a credible regression; no tests for trivia.

## Env and secrets
- Every `.env*` file is git-ignored except `.env.example`. Only the Supabase publishable key goes in client env.
