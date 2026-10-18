# Phase 03: Recover config, save, xp, quiz modules

## Context links
- [plan.md](plan.md) · [inventory §1 lines 1-154, 1256-1389; §4 save format; §5 split items 1-3](research/researcher-01-recovered-code-inventory.md)
- Depends on: 01 (golden traces), 02 (chunks + rename tool). Parallel with: 04 (G1).

## Overview
- Date: 2026-10-18
- Description: Replace legacy config/save/quiz chunks with typed TS modules (meaningful names via rename maps), proven equal to the original by golden-trace Vitest. Behavior frozen, quirks included.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed

## Key Insights
- These are the only user-facing contract (saved data). Keep `aigame3d_multiplication_save` read/write byte-compatible (key order in JSON too, so localStorage trace matches).
- Quirks preserved deliberately: version !== 1 -> full reset; only first 30 `questionStats` + 30 `review` ids kept; `questAccepted = true || bridge>0` logic; `attempts = correct + wrong`.
- `Math.random` stays the RNG source here (parity); inject as optional param `rng = Math.random` so tests pass a seeded fn without changing call order.
- Constants as decimal ints converted to hex only mechanically (e.g. 16773326 -> 0xfff0ce); never retuned.

## Requirements
- Modules expose exactly what legacy consumers use (names via shim re-export aliases until 08 retypes callers).
- Golden tests: parse/validate 40 fixtures, picker/question 500-step sequences x seeds x tables, stats update, hint text, level thresholds, region-at-point grid, LCG streams.
- No DOM/three import in `src/save/**`, `src/quiz/**`, `src/game/**` (config may import nothing either; colors as numbers).

## Architecture
```
src/config/world-constants.ts   tables [2..10], SAVE_KEY, BRIDGE_SEGMENTS=6, XP thresholds, river, walkable bounds, sky colors
src/config/regions.ts           6 regions (VI text verbatim), regionAtPoint, isRegionUnlocked, regionById
src/config/roads.ts             9 road polylines
src/config/seeded-lcg.ts        Park-Miller 16807 (used by world scatter/decorate + map decor)
src/game/xp-levels.ts           levelForXp, thresholds
src/save/save-types.ts          SaveV1, QuestionStat, StatKey `m{a}_{b}`
src/save/save-storage.ts        defaultSave, clampInt, parseSave (validation verbatim), loadSave, writeSave(try/catch)
src/quiz/question-generator.ts  shuffle, buildQuestion, pickNextFact (70% review)
src/quiz/answer-stats.ts        isCorrect, applyAnswerStats
src/quiz/hint-text.ts           hint ladder text levels 0..3
src/legacy/shims/{config,save,quiz}.js   re-export TS modules under legacy names
*.golden.test.ts co-located, reading tests/parity/golden/*.json
```

## Related code files
- Create: above. Modify: the 3 shims. Delete: `src/legacy/legacy-config.js`, `legacy-save.js`, `legacy-quiz.js`.

## Implementation Steps
1. Per cluster, LLM-assisted rename map (`tools/recovery/rename-maps/config|save|quiz.json`), human review, apply with `apply-rename-map.ts` on a copy.
2. Move to TS, add types, split per architecture; keep statement order.
3. Golden tests green (Vitest node env).
4. Point shims to TS modules; delete legacy chunks; `npm run test:parity`.
5. Commit + tag `recovery-p03`.

## Todo list
- [ ] rename maps reviewed
- [ ] config modules (+ LCG golden)
- [ ] save modules (+ 40 fixture golden)
- [ ] xp + quiz modules (+ sequence golden)
- [ ] shims swapped, legacy chunks deleted
- [ ] parity suite green

## Success Criteria
- `npm test -- src/config src/save src/quiz src/game` green; every golden JSON asserted with `toEqual`.
- `npm run test:parity` thresholds of 02 still met (both projects), localStorage trace identical.
- `grep -rE "from 'three'|document\.|window\." src/save src/quiz src/game src/config` -> nothing.

## Scope Contract
- Changed: config/save/quiz/xp logic moved to TS. Impacted: world/map/ui chunks consuming them via shims; saved data.
- Will verify: golden unit tests (lowest layer that can fail on logic drift) + full parity run (catches wiring).
- Skipped: nothing else (all consumers covered by parity run).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Rename collapses two different identifiers | L | M | ts-morph scope-safe rename; golden tests |
| JSON key order changes in writeSave | M | M | build object in original literal order; localStorage trace compare |
| Short-circuit RNG consumption reordered | L | H | keep expressions verbatim; 500-step traces |
Rollback: restore shims to `export * from '../legacy-*.js'` (chunks restored from tag `recovery-p02`).

## Security Considerations
- Save parsing stays defensive (clamps, regex keys); no eval. localStorage writes wrapped in try/catch.

## Next steps
- 05-08 import these modules directly; 12 builds migration on `parseSave`.
