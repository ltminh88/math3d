# Scout 01: codebase facts for reasoning, geometry and map expansion

## World and map
- `src/config/regions.ts`: `RegionId` = village|garden|meadow|forest|city|tower; `REGIONS` l.38-105 (6 entries). Garden = "Khu Vườn Bên Sông", center [17,-2], size [12,16], unlock 'start', no level/gate. Scenery `src/world/regions/village-garden-builder.ts:64-81`.
- `src/config/world-constants.ts`: RIVER x 4..10; `WALKABLE_BOUNDS` west x -50..4, east x 10..70, z -44..44. Roads `src/config/roads.ts` (east trunk (10,0)→(46,0), branches to meadow/forest/city/tower).
- Build order `src/world/world-build-pipeline.ts:27-56` (load-bearing): terrain → regions → bridge → `scatterWorld` → clouds → merge.
- Scatter `src/world/world-scatter.ts`: one LCG seed 1337; 230 bank trees (150 low power) over the whole bounds, rejected by `isBlocked` (`world-scatter-exclusion.ts:39-61`, reads REGIONS + ROADS). Changing REGIONS/ROADS/bounds shifts every later scatter draw.
- Gates/shop added post-scatter from separate lists: `src/config/level-gate-config.ts` (`LEVEL_GATES`, header: REGIONS stays byte-equal, golden), `SHOP_STALL`. `tests/e2e/level-gate.spec.ts:153` checks no obstacle overlaps a gate.
- Goldens (`tools/recovery/golden/generate-golden-traces.mjs`, runs the ORIGINAL bundle; cannot be regenerated for new data): `constants.json` (REGIONS, ROADS, bounds; `src/config/config.golden.test.ts:26-43` toEqual), `region-at-point.json`, `map-decor.json` (tufts depend on region footprints), `map-hit-test.json`, `lcg-first-1000.json`, quiz hintText.
- Parity (`tests/parity`): scene dumps incl. scatter instances and gates, renderInfo (~265 world draw calls), DOM shots incl. quiz dialog; re-baselined per feature before (049e009, 9196d9e).
- Map: `src/map/map-render-world-layer.ts:89-110` and `map-render-screen-layer.ts:30-40` loop REGIONS; `map-view-transform.ts` fits WALKABLE_BOUNDS, `regionAtMapPoint`; `map-render.parity.test.ts` runs original draw code fed with current REGIONS. EN names in `src/i18n/legacy-translations-en.ts`.
- Free space (coords only): east bank z 31..44 and z -44..-30 (x 10..70); x 10..22 north/south of garden; west bank z 20..44 / -44..-20 (props at (-38,-11), (-40,18)). All currently covered by scatter trees/rocks/grass.

## Learning core
- `src/learning/fact-key.ts`: pattern only `mul:AxB` / `div:P/D` (also intended verbatim for a future SQL check). `ParsedFact` mul|div.
- `learning-types.ts`: FactStat (box 1-5, errs:number[]), SessionDelta v:1.
- `leitner-box.ts` applyAttempt; `curriculum-tables.ts` (`LevelId` stale: bridge|field|forest), `tableOfFact` mul/div regex.
- `session-planner.ts` planSession: 60% due/weak, 30% new (≤3), 10% mastered; interleaving by table.
- `session-recorder.ts` QuestionOutcome {factKey, ms, correct, firstTry, usedHint, wrongAnswers:number[]}.
- `question-types.ts` / `question-generator.ts` / distractor-classes / distractor-picker: numeric only.
- Store: IndexedDB `save-migrations.ts` (MIGRATIONS append-only, v1), factStats keyed [profileId,key].
- Reject non-mul/div keys: `store/delta-validation.ts:30` (MAX_FACTS 300), `save-code-v2-facts.ts:20-25` (rebuilds keys as mul if `\d+x\d+` else div), `save-code-compact-json.ts:15`, `save-code-v2-payload.ts:36` KNOWN_LEVELS = bridge + LEVEL_GATES ids; tableOfFact, quiz `orient`, tower factTriple, city/field/forest planners throw.

## Bridge quiz
- `src/quiz/question-types.ts` Question {id, factKey, a, b, answer:number, options}; `learning-quiz-adapter.ts` quizFactPool mul only, `buildQuizQuestion` l.62-80, `createQuizPlanner` l.95-115.
- `src/ui/quiz-dialog.ts` `quizBodyHtml` hard-coded bridge/`a × b = ?` template, N `.answer` buttons; `quiz-answer.ts:96-107` numeric equality. Quiz DOM is in DOM parity.

## Levels
- Contract `src/levels/shared/level-types.ts` (LevelDefinition, LevelLearning, LevelContext; no openDialog). Registry `level-registry.ts:10-40` (folder = id, matching LEVEL_GATES entry).
- Progression `level-progression.ts`; `src/ui/quest-chain-stage.ts:7` CHAIN_LEVELS. Adding a level: LevelGate unions, LEVEL_GATES, CHAIN_LEVELS, gate e2e.
- Round planners: field `field-round-flow.ts` (build|equations|recall, recall at box≥3); forest `forest-round-flow.ts` (share|pack|family); city `city-round-flow.ts` (deliver|windows|reverse); tower `tower-question-formats.ts` (choice|pad|missing|family|truefalse, multi-step `TowerStep` number|choice|verdict — most generic multi-step structure).

## Constraints
- Draw calls: test-mode `renderer.info.render.calls`, `DRAW_CALL_BUDGET = 60` in level specs. Leaks: `*-level-leak.spec.ts` + `tests/e2e/settled-renderer-memory.ts`.
- Hooks: `window.__parity`, `window.__game` (`levels/shared/test-debug-hook.ts`), per-level hooks; parity seeds Math.random.
- i18n `defineStrings` (`src/i18n/i18n.ts:45-52`); levels via `ctx.defineStrings`.
- Files <200 lines; already over/near: `store/game-store.ts` 216, `config/regions.ts` 156, `learning/question-generator.ts` 175.

## Open questions
- New regions inside REGIONS (breaks original-bundle goldens) or a separate post-scatter list?
- Leitner keys for word-problem/geometry items (key grammar, save code, delta validation) or stat-less?
