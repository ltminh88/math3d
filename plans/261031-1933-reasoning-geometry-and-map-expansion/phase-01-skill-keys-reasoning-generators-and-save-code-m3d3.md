# Phase 01: Skill keys, reasoning generators, adaptive tiers, save code M3D3, step kit, tablet e2e project

## Context links
- [plan.md](plan.md), [research 01](research/researcher-01-kntt-grade3-geometry-and-reasoning.md) §3–4, [scout 01](scout/scout-01-codebase-report.md) "Learning core"
- `src/learning/fact-key.ts`, `curriculum-tables.ts`, `session-planner.ts`, `session-recorder.ts`; `src/store/delta-validation.ts`, `save-code-*.ts`; `docs/recovery-notes.md` "Progress storage and save codes"

## Overview
- Date 2026-10-31. Priority P1. Status pending. Review: not started. No deps; parallel with 03.
- Foundation for every later phase: a bounded skill-key grammar so non-table items get Leitner stats, pure seeded reasoning generators with box-based tiers, a new save-code version that carries skills, shared step-answer widgets, and a tablet e2e project.

## Key Insights
- `FACT_KEY_PATTERN_SOURCE` is a cross-system contract (future SQL check) → extend by alternation only; `mul:`/`div:` branches unchanged.
- Stats key is a string in IndexedDB `[profileId,key]` → likely no schema migration (verify `save-migrations.ts`, `progress-repository.ts`, `profile-replacement.ts`, `store-to-save-v1.ts` for parse-or-throw on keys).
- `tableOfFact` drives planner interleaving and several callers throw on unknown keys → add `factGroup(key)` (table for mul/div, skill family for `sk:`); legacy v1 export (`store-to-save-v1.ts`) must skip `sk:` keys.
- M3D2 decode must stay exactly as shipped: freeze its `KNOWN_LEVELS` to the 5 shipped ids (today derived from `LEVEL_GATES`, which grows in 03).
- `QuestionOutcome.wrongAnswers: number[]`: numeric wrong answers only; choice/multi/verdict misses record `[]` (no format change).
- Tower's `TowerStep` (number | choice | verdict) is the model for a generic `ReasoningStep` (+ `multi`).
- Unverified [K] ranges (B13, B24–28, B38–39, patterns) → verify before locking `reasoning-ranges.ts`.

## Requirements
- Skill catalog `src/learning/skill-catalog.ts` (append-only; ids `^[a-z][a-z0-9-]{1,38}$`, each with family + KNTT lesson ref). Initial 39 ids:
  - reasoning (01): `wp-times-then-add`, `wp-divide-then-add`, `wp-more-less-then-total`, `wp-unit-then-times`, `wp-times-compare`, `div-rem-floor`, `div-rem-ceil`, `unknown-add-sub`, `unknown-mul-div`, `pattern-add`, `pattern-sub`, `pattern-skip-count`, `expr-order`, `expr-brackets`, `expr-from-story`, `choose-all-correct`, `tf-explain`, `wp-difference-compare`.
  - geometry (02): `geo-midpoint`, `geo-circle-parts`, `geo-radius-diameter`, `geo-right-angle`, `geo-count-right-angles`, `geo-shape-classify`, `geo-shape-count`, `geo-solid-identify`, `geo-solid-parts`.
  - measurement (02): `meas-ruler-read`, `meas-mm-convert`, `meas-gram`, `meas-ml`, `meas-temperature`, `meas-perimeter-polygon`, `meas-perimeter-rect`, `meas-perimeter-square`, `meas-area-count`, `meas-area-rect`, `meas-area-square`, `meas-wp-fence`.
- Key grammar: `sk:<id>`; pattern source `^(mul:…|div:…|sk:[a-z][a-z0-9-]{1,38})$`; `isFactKey` = pattern + catalog membership; `skillKey(id)`, `parseFactKey` returns `{op:'skill', id}`.
- Tiers: `tierOfBox(box)` → 1 (box 1–2), 2 (3–4), 3 (5); new skill = box 1.
- Reasoning generators (`src/reasoning/`, pure, `(rng, tier) => ReasoningItem`): steps `number | choice | multi | verdict(+fix)`; prompt = template id + params (text via strings module); misconception distractors (cộng thay vì nhân, hiệu vs thương, round-down trap for `div-rem-ceil`, left-to-right order, dư ≥ số chia).
- Ranges (author cap 2026-10-31): every number, intermediate result and answer ≤100 in all tiers. Tier 1 one-step-ish / small two-step; tier 2 full two-step (B28), remainders divisor ≤9; tier 3 expressions 2–3 ops with one bracket pair (B38), extra misconception distractor. Generators assert the cap (unit test over 1000 seeds).
- Store: `validateDelta` accepts `sk:` keys; planner/recorder work on mixed pools; `factGroup` replaces `tableOfFact` in planner interleaving.
- Save code `M3D3` (`save-code-v3-payload.ts`): all M3D2 fields + `k` skill tuples `[id, attempts, correct, totalMs, box, lastSeenSession, lastSeenSec, streak?, fluent?]`, levels = bridge + all gates. Strict decode (unknown skill/level → `payload`). Export writes M3D3; M3D1/M3D2 decode byte-for-byte as before.
- Step kit `src/ui/kit/`: `step-card.ts` (prompt + step chain), `multi-select-buttons.ts` (toggle + "Xong"), `verdict-buttons.ts` (Đúng/Sai) next to existing number pad/choice buttons; all ≥44 px, tap-only usable, keys optional.
- Test hook (test build only): `window.__game.seedFactStats(stats)` so e2e can reach box ≥3 tiers.
- Playwright: add `tablet-portrait` + `tablet-landscape` (iPad Pro 11 viewports, `browserName: 'chromium'`, `hasTouch`, `isMobile`, same `webglArgs`, `E2E_PORT` unchanged). Run the existing suite on them; record failures in `reports/tablet-baseline.md` (owners: 03 shell/world, 04 old levels).
- Docs: `docs/recovery-notes.md` save-code section (M3D3); note for future SQL check pattern.

## Architecture
```
src/learning/skill-catalog.ts  skill-tiers.ts  fact-key.ts (mod)  fact-group.ts  session-planner.ts (mod)
src/reasoning/reasoning-types.ts  reasoning-ranges.ts  word-problem-generators.ts  remainder-generators.ts
src/reasoning/unknown-and-pattern-generators.ts  expression-generators.ts  logic-statement-generators.ts
src/reasoning/reasoning-distractors.ts  reasoning-item-for-skill.ts  reasoning-strings.ts
src/store/delta-validation.ts (mod)  save-code-v3-payload.ts  save-code-v3-skills.ts  save-code-codec.ts (mod)  save-code-v2-payload.ts (freeze levels)
src/ui/kit/step-card.ts  multi-select-buttons.ts  verdict-buttons.ts  step-kit.css
src/levels/shared/test-debug-hook.ts (mod)  playwright.config.ts (mod)
```
Co-located `*.test.ts` for each pure module. All files <200 lines (`game-store.ts` 216 is not grown).

## Related code files
- Modify: `fact-key.ts`, `curriculum-tables.ts` (keep `tableOfFact`, add guard), `session-planner.ts`, `delta-validation.ts`, `save-code-codec.ts`, `save-code-v2-payload.ts`, `save-code-compact-json.ts` (if key regex), `store-to-save-v1.ts`, `progress-sync.ts` (if it parses keys), `test-debug-hook.ts`, `playwright.config.ts`, `docs/recovery-notes.md`.
- Create: files above. Delete: none.

## Implementation Steps
1. Land `skill-catalog.ts` + tests first as its own commit (unblocks 02).
2. RED: fact-key tests (`sk:` accepted only for catalog ids; mul/div cases unchanged, golden-style table); GREEN.
3. RED: planner with mixed pool (no throw, interleaves by `factGroup`); recorder + `validateDelta` accept `sk:`; GREEN. Grep every `parseFactKey`/`tableOfFact`/stats iteration; skip or group `sk:` keys.
4. Verify [K] ranges (B13, B24, B25, B27, B28, B38, B39, sequences) on loigiaihay/vietjack; write `research/researcher-02-kntt-reasoning-verification.md`; lock `reasoning-ranges.ts`.
5. RED per generator: exact answers, options unique (3–4), correct present once, distractors from named misconceptions, numbers within tier ranges, 1000 seeds deterministic; GREEN.
6. RED save code: M3D3 round-trip with skills; M3D1/M3D2 fixtures decode unchanged; unknown skill → `payload`; size of full save < 16384; GREEN.
7. Step kit widgets + small DOM unit tests (jsdom if present, else e2e in 04).
8. Test hook `seedFactStats`; tablet projects; run full e2e on tablets; write report.
9. Lint, typecheck, unit, build, golden `--check`.

## Todo list
- [ ] skill catalog commit
- [ ] fact key + group + planner + validation
- [ ] KNTT reasoning verification
- [ ] generators + tests
- [ ] M3D3 + tests
- [ ] step kit
- [ ] seedFactStats hook, tablet projects + baseline report
- [ ] docs

## Success Criteria
- Unit green; mul/div behaviour byte-equal (existing tests untouched); M3D1/M3D2 fixtures decode identical; goldens byte-identical; lint/typecheck/build clean.
- Step kit fully usable by tap: no keyboard needed, targets ≥44 px, no key hints on `(pointer: coarse)`; tablet projects run (failures listed with owners).

## Scope Contract
- Changed: learning key grammar, planner grouping, delta validation, save codes, new pure folders, kit widgets, test hook, playwright projects.
- Impacted: store writes, save import/export, every planner caller (bridge, 4 levels), legacy v1 export.
- Will verify: full unit suite (store + save codes are safety-critical: data/format), golden check, full e2e on desktop + phone (store paths), tablet run as baseline.
- Deliberately skipped: parity (no visual change; kit not yet mounted).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| A caller still throws on `sk:` keys | M | H | Grep list in step 3; e2e with seeded skill stats in 04 |
| Shipped save format accidentally changed | L | H | M3D1/M3D2 fixture tests; frozen v2 level set |
| Catalog grows later → old clients reject M3D3 codes | M | L | Catalog append-only; new ids → M3D4 (documented) |
| Generator ranges off-curriculum | M | M | Verification step; ranges in one data file |
| Tablet project exposes many old failures | M | M | Report with owners; fixed in 03/04, green gate in 09 |

## Security Considerations
- Save codes are untrusted input: strict decode, length cap, CRC, no `eval`; skill ids whitelisted by catalog.

## Next steps
- 02 after catalog commit; 04–08 consume generators, tiers and kit.
