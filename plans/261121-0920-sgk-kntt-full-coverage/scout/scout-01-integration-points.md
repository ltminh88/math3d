# Scout 01 — integration points for new skills, regions, lesson mode

Paths relative to repo root. Read-only scout; reviewer verified §0 by reading code.

## 0. Bug: daily practice probably crashes on geo/meas skills (high priority)
- `src/learning/daily-planner.ts:50-52` `learnedPool` = every key with attempts>0, includes `sk:geo-*`, `sk:meas-*` (valley/workshop record them: `valley-round-plan.ts:47-55`).
- `src/ui/daily-practice.ts:130-133` sends every `sk:` key to `skillPlan()` → `src/ui/daily-skill-item.ts:29-36` → `reasoningItemForSkill()` which throws for non-reasoning ids (`src/reasoning/reasoning-item-for-skill.ts:52-54`).
- No e2e covers it (`tests/e2e/daily-practice.spec.ts`). Production (0a86d75) has valley+workshop → likely live.
- Fix: one cross-family dispatcher `itemForSkill(id,rng,tier)`; `cave-chamber-formats.ts:78,151-153` already dispatches (with `startsWith('meas-')` hack).

## 1. Skill pipeline
- Catalog `src/learning/skill-catalog.ts`: `SkillFamily` :8-16, `entry(id,family,lesson)` :27, `SKILL_CATALOG` :33-76, append-only, id regex `[a-z][a-z0-9-]{1,38}`, `lesson` free text `/^T[12] /` (e.g. 'T1 B24, B28'). Helpers `isSkillId` :82, `skillEntry` :86, `skillsOfFamily` :90. Test `skill-catalog.test.ts` freezes `SHIPPED_IDS`.
- Stat key `sk:<id>` (`fact-key.ts:46-51`). Tier from Leitner box (`skill-tiers.ts`: 1-2→T1, 3-4→T2, 5→T3).
- Per family: `*-item-for-skill.ts` GENERATORS record (reasoning → `ReasoningItem`; geometry/measurement → `GeoItem`), `*-generators.ts` per sub-topic, `*-ranges.ts`, `*-distractors.ts` (misconception tags), `*-strings.ts` (`defineStrings` vi+en, generators emit `PromptRef`), `*-test-oracles.ts`, `geometry-test-sweep.ts` `sweepItem()` (unique options, 3-4 choices, misconception per wrong option, cap, determinism), `*-generators.test.ts` (catalog==GENERATORS keys, seed sweep, unknown id throws), `*-strings.test.ts`. `tools/practice/pool-counter.ts` counts pool per skill/tier.
- New family touches: catalog + SHIPPED_IDS; new `src/<family>/`; every family dispatcher (`cave-chamber-formats.ts:22,78,151-153`, `daily-skill-item.ts:35`, `levels/shared/test-debug-hook.ts:135`, `levels/shared/reasoning-round-slot.ts:61`); sticker book (`learning/sticker-book.ts:15-31,47+`, `ui/sticker-book-strings.ts:~130-170`); save code (`save-code-v3-skills.ts:44` decodes only known ids → new ids need new save-code version: copy `save-code-v4-payload.ts`→v5, bump `SAVE_CODE_VERSION` `save-code-codec.ts:26`, accept '5' :117-128); `tools/practice/pool-counting.ts`.

## 2. Consumers
- Daily: `daily-planner.ts:67-103` (6 due, 3 weak, 1 mastered; no topic filter; unlock field stars≥1). UI `ui/daily-practice.ts:49-150`, HUD button `ui/daily-hud-button.ts`.
- Level pools hard-coded: field `field-stage-plan.ts:21-45`; forest `forest-stage-plan.ts:25-46`; city `city-stage-plan.ts:17-50`; tower `tower-stage-plan.ts:17-45`; garden `garden-round-plan.ts:16-24,134-162`; valley `valley-stage-plan.ts:24-82`; workshop `workshop-stations.ts:15-60`; cave `cave-chamber-formats.ts:24-40`, `cave-stage-plan.ts:38-91`.
- `LevelDefinition.stages` (`level-types.ts:17-31`); replay via `levels/shared/level-stage-override.ts`.
- No per-lesson selection UI exists. Hooks: HUD tool-button beside `#open-daily` reusing daily run loop; or sticker-book topic page (`ui/sticker-book.ts:53-93`); or toolbar `dom-template.ts:44`.

## 3. Regions / levels
- `config/regions.ts` (6 original) byte-equal golden (`config.golden.test.ts:25-88`). Chapter 2 in `expansion-regions.ts:8-61` (world 7-9), `expansion-roads.ts`, `expansion-signposts.ts` (±30° test), lookups `expansion-region-lookup.ts`.
- RNG safety: `world/world-build-pipeline.ts:40-47` scatter first → `world/expansion-scatter-clearing.ts` (no RNG, no objects) → `world/expansion-world-builder.ts` after gates (UUIDs draw Math.random), baked 3 meshes + signpost atlas (~+5 draw calls). Builders `world/regions/*-builder.ts`, `expansion-region-group.ts`, map `map/map-render-expansion-layer.ts`.
- Register level: `levels/<id>/index.ts` default `LevelDefinition` (lazy `load`), auto-registered by `shared/level-registry.ts:44-46` glob; `config/level-gate-config.ts` unions :6-29 + gate :46-111; strings `level-host-strings.ts`, `level-gates.ts`, `ui/quest-chain.ts:75-77`, `quest-chain-strings.ts`, `ui/quest-chain-stage.ts:13-26`; save-code level set `save-code-v3-payload.ts:20-30` (new level id → save-code version bump); `dom-template.ts:43`, `map-overlay.ts:92`, `world-labels.ts:65` read LEVEL_GATES.

## 4. Save
- IndexedDB `src/store`; `factStats` keyed `[profileId,'sk:<id>']` (`learning-types.ts:4-17`); `stageStars[]` (`store/save-schema.ts:31-44`); `SCHEMA_VERSION=1`, append-only `store/save-migrations.ts:28-40`. New skill ids need no IDB migration, only save-code bump.

## 5. i18n
- `defineStrings(ns,{vi,en})` same keys enforced by type; vi source; `english-term-overrides.ts` en-only.

## 6. Tests
- e2e per level `<lvl>-level.spec.ts` + `<lvl>-level-leak.spec.ts` (`window.__game.seedProgress`, `teleportToGate`, `settled-renderer-memory.ts`), `full-chain.spec.ts`, `quest-chain-stages.spec.ts`, `chapter2-gates-and-regions.spec.ts`, `sticker-book.spec.ts`, `daily-practice.spec.ts`, save-code specs. 4 Playwright projects × 2 shards.
- Draw calls: scenes set `data-draw-calls`/`data-max-draw-calls`; specs assert ≤ budget.
- Parity: `tests/parity/` + vitest goldens (`config.golden`, `map-decor.golden`, `map-render.parity`, `legacy-translator.golden`, `quiz.golden`, `save-storage.golden`).

## Open
- Structure `lesson` (book + lesson numbers) instead of parsing strings?
- New families → existing levels / cave mixer / new regions? Each new region = builders + draw budget + save-code bump.
