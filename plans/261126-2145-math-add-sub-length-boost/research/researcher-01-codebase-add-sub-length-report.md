# Researcher 01 — codebase map: add/sub + length conversion

Date 2026-11-26. Read-only scan of `src/`. Paths relative to repo root.

## 1. Skills today

### Add/sub (family `arithmetic`, `src/arithmetic/arithmetic-skill-entries.ts:17-28`)
| id | KNTT | generator | answer shape | range |
|---|---|---|---|---|
| add-sub-mental-round | T1 B2 | `mentalRound` add-sub-generators.ts:98 | 1 number step (pad) | ≤1000 |
| add-sub-1000 | T1 B2 | calc factory :158 (`addCalc`/`subCalc`) | 1 number step | ≤1000 |
| add-sub-1000-wp | T1 B2 | add-sub-word-problems.ts (1–2 steps, :123 two-step odds T1 0 / T2 .5 / T3 .7) | number steps | ≤1000 |
| add-sub-1000-chain | T1 B2 | `addSubChain` :168 (a op b op c) | 2 number steps (first, final) | ≤1000 |
| add-4digit / sub-4digit | T2 B54 / B55 | calc factory | 1 number step | ≤10 000 |
| add-sub-10000-wp | T2 B54,55 | word problems | number steps | ≤10 000 |
| add-5digit / sub-5digit | T2 B63 / B64 | calc factory | 1 number step | ≤100 000 |
| add-sub-100000-wp | T2 B63,64 | word problems | number steps | ≤100 000 |
| add-sub-find-error | T1 B2 + T2 B54,55,63,64 | `findError` :187 | `verdict` (Đúng/Sai + fix number) | tier-scaled 1k/10k/100k |
| add-missing-digit | same | `missingDigit` :222 | 1 number step | tier-scaled |

Related add/sub skills elsewhere (`src/learning/skill-catalog.ts`): `unknown-add-sub` T1 B3 (:39), `unknown-add-sub-wp` T1 B3 (:77), `pattern-add` / `pattern-sub` T1 B8 (:44-45).

- Ranges: `src/arithmetic/arithmetic-ranges.ts:16-26` (fixed), `:52` `tierRangeCap` (cross-range skills).
- Tier axis = carries, not size (`add-sub-generators.ts:2-3`): T1 no carry, T2 exactly 1, T3 ≥2 / borrow across zero (`pickAddPair` :34-45, `pickSubPair` :49-60, `pickChainTriple` :72). Counting in `carry-count.ts:7` `countAddCarries`, `:25` `countSubBorrows`, plus `hasBorrowAcrossZero`.
- Tier = Leitner box: box 1-2→T1, 3-4→T2, 5→T3 (`src/learning/skill-tiers.ts:7-15`).
- Item shape: `arithmeticItem` = `ReasoningItem`, "never a scene" (`arithmetic-distractors.ts:11-18`). Wrong-value builders exist: `wrongAddByForgotCarry` :21, `wrongSubByNoBorrow` :32, `wrongBySlip` :43 — today only used by find-error; calc items are number-pad only, no choices.
- Dispatcher: `arithmetic-item-for-skill.ts:18-40`.
- `add-sub-generators.ts` is already 264 lines (>200 rule) — new generators must go in new files.

### Length (family `measurement`, legacy catalog)
| id | KNTT | generator | tiers |
|---|---|---|---|
| meas-ruler-read | T1 B7, B30 (skill-catalog.ts:64) | `measRulerRead` length-and-unit-generators.ts:17 | T1 read cm (number); T2 read mm (number); T3 object starts at later mark → `qtyChoiceStep` with traps read-end / from (:39-55) |
| meas-mm-convert | T1 B30 (:65) | `measMmConvert` :83 | T1 cm→mm or mm→cm (number, :85-105); T2 compare "a cm vs b mm" choice with `ignore-unit` trap (:59-81); T3 convert then difference in mm (2 steps, :107-123) |

- Scene: `{kind:'ruler', maxCm:10, fromMm, toMm}` (:14-15); `RULER_MAX_CM = 10` (`measurement-ranges.ts:7`).
- **Only cm↔mm exists. No m, dm anywhere** (no `dm` unit string in src). `measurement-ranges.ts:1-3` and `docs/code-standards.md` content rules: every number ≤100, "no kg↔g, l↔ml or m↔mm (cm↔mm only)".
- Other length-ish: `geo-midpoint-length` T1 B16, perimeter skills T2 B50 (cm, fence in m), `meas-wp-fence`.

## 2. Reusable formats
- Step kinds (`src/reasoning/reasoning-types.ts:107-136`): `number` (number pad, `src/ui/kit/number-pad.ts`), `choice`, `multi` (choose all + "Xong"), `verdict` (Đúng/Sai + optional fix number), `set-clock`. No drag/order step, no "fill a column" step.
- Scene renderers (`src/ui/dialog-scenes/scenes/*`, kinds self-registered via glob in `dialog-scene-registry.ts:36-48`): `ruler`, `balance`, `jug`, `thermometers`, `side-polygon`, `rect`, `cells`, `segment`, `circle(-row)`, `angles/shapes/figure`, `solids`, `clock`, `month-calendar`, `notes` (money), `number-line` (integers, step ±1 only, `numbers-scene-types.ts:26-34`), `place-value` (digit block columns, :21-23), `data-table`, `tally/bag/dice`, `fraction-*`.
- **No column-addition (đặt tính) scene** exists. `place-value` is the nearest base (columns per place). Number line can't jump by 10/100 or show unit marks in m/dm.
- Prompts: each family registers `*-prompt-renderer.ts` (`src/practice/family-prompt-registry.ts:19-31`); strings via `defineStrings` (`arithmetic-strings.ts` 229 lines, `measurement-strings.ts`).

## 3. Where practice is chosen
| surface | file | weak-skill logic |
|---|---|---|
| Luyện tập hôm nay | `src/learning/daily-planner.ts:67-98` | pool = every fact/skill with ≥1 attempt (:51); 6 due (box<5 & interval days) + 3 weakest not-due + 1 mastered; sort box asc, then oldest (:58). Facts (×/÷) and skills compete in one pool — no family weighting. |
| Học tiếp / lesson runs | `src/ui/lesson-picker.ts:34` → `lesson-progress.nextLesson`; `src/learning/lesson-planner.ts:89-103` | lesson's keys weakest box first, round-robin, 6 items (`LESSON_RUN_ITEMS` :29); mix lessons (e.g. T2 B77 review add/sub, `kntt-lessons-tap2.ts:45`) weakest globally :114-135 |
| Leitner | `src/learning/leitner-box.ts:4-62` | wrong → box−1; clean first try <8 s → box+1; `errs` keeps last 3 wrong answers (`errsKept` :11) |
| error bank use | `src/quiz/daily-question.ts:27`, `quiz/learning-quiz-adapter.ts:75`, `levels/city/city-stage-plan.ts:115` | only ×/÷ facts use `errs` as distractors; skill items ignore it |
| wrong-answer explanation | `src/practice/wrong-answer-explanation.ts:48-81` | add/sub routed to `explainCarry` (`wrong-answer-carry.ts:108-123`: calc, wp, chain). **No explainer for meas-mm-convert / meas-ruler-read**, find-error, missing-digit, mental-round. |

Weighting hooks: (a) a "focus skills" boost in `pickDailyItems` (e.g. reserve N slots for focus families, or treat focus skills as due earlier via `daily-intervals.ts`); (b) lower interval for focus skills; (c) `errs` currently numeric — could drive "same misconception again" items.

## 4. Levels that play these skills
- `levels/numberfort/numberfort-stage-plan.ts:50-77`: stage 3 = add-4digit, sub-4digit, add-sub-10000-wp (+mul/div); stage 5 = add-5digit, sub-5digit, add-sub-100000-wp (+mul/div); stages 2-5 weakest-first (:92-115).
- `levels/workshop/workshop-stations.ts:19-20, 53-103`: ruler station, slot `['meas-ruler-read','meas-mm-convert']` in stages 1-5 (stage 4 mm-convert only).
- `levels/garden/garden-round-plan.ts:18-19, 137-157`: pattern-add/sub, unknown-add-sub.
- **No level plays add-sub-1000 / -wp / -chain / mental-round / find-error / missing-digit** (B2 skills appear only in lesson + daily). New add/sub items need a level slot (numberfort stage 1-2? garden? city?) to show up in play.

## 5. Parent-visible stats
- No parent/progress dashboard in `src/ui` (no "phụ huynh" outside English packs).
- Sticker book (`src/learning/sticker-book.ts:132`, `src/ui/sticker-book.ts`) shows per-skill box only; topics `arithmetic` = `skillsOfFamily('arithmetic')`, `measurement` explicit list (:101). Earned at box 4.
- Data exists: FactStat `attempts, correct, totalMs, box, lastSeen*, streak, fluent, errs`; save code M3D3+ tuple `[id, attempts, correct, totalMs, box, ...]` (`src/store/save-code-v3-skills.ts:1-2, 20-35`). A read-only per-skill accuracy view is feasible with no schema change.

## 6. Constraints
- `AGENTS.md`: branch + PR (no push to main), no prod deploy; gates `npm run lint`, `typecheck`, `test`, `build`, golden traces `--check`, `npx playwright test`; do not touch REGIONS/ROADS/WALKABLE_BOUNDS/golden/parity; UI change → `parity-change` label; Muse board #11, ≤2 PRs in CI.
- `docs/code-standards.md`: files <200 lines; families pure (no DOM/three); scenes plain data; catalog **append-only** (ids in save code, `skill-catalog.ts:3-7`); new id needs no new save version but old clients drop it; `vi` source of truth, missing `en` fails typecheck; tap-only kit, ≥44 px, touch e2e projects use `tap()` only; tiers from Leitner box raise reasoning, not number size; legacy-family numbers ≤100, arithmetic uses lesson range.

## Unresolved questions
1. m/dm/cm/mm: code-standards forbid m↔mm and cap numbers ≤100; KNTT grade 3 B30 only teaches mm (m, dm are grade 2). Does the author lift the rule for a new skill (e.g. m↔dm↔cm within 100, `1 m = 100 cm`), and which KNTT lesson ref does it map to (grade-2 review? B30 extension?)
2. Should "weak spot" focus be author-set (parent toggles add/sub + length) or automatic (lowest accuracy from attempts/correct)?
3. Column-addition (đặt tính) scene: new scene kind needed — acceptable as a UI/parity change?
4. Which level should play B2 add/sub skills (none today)? Workshop for new length skills is natural; add/sub B2 has no home.
5. Parent stats view: in-game screen (settings dialog?) or only sticker book extension?
