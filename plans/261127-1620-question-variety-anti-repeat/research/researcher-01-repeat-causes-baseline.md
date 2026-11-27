# Repeat causes — baseline measurement (2026-11-27)

Scope: why the child sees "the same question" so often. Measured on `main` @ c116126 with a
throw-away vitest script over `tools/practice/pool-counting.ts` (removed after; Phase 1 makes it
permanent). 2000 seeded draws per skill × tier (seed 20261113), 10 trials for "median draws before
an exact repeat" (cap 300). English ids have no `itemForSkill` generator (expected; skipped).

## 1. Two kinds of "same question"
- **Exact repeat** — same visible prompt + answer (`itemSignature`, wrong options excluded).
- **Feels the same** — same story/frame template with other numbers. Measured as the *shape*:
  `story.key + step kinds + step prompt keys`, 1000 draws, tier 1.
Add/sub calc pools are huge on numbers (≈2000/2000 distinct) but almost all skills have
**one shape**. So for add/sub the problem is mostly "feels the same"; for mental mul/div,
length unit sense and a few others it is literal exact repeats.

## 2. Smallest exact pools (tier 1 unless noted; distinct / median-before-repeat)
| skill | lesson | pool | med | cause (file:line) |
|---|---|---|---|---|
| mul-hundreds-mental | T1 B36 | 5 | 3.5 | narrow T1 filter, `mul-generators.ts` ~L131–135 |
| mul-thousands-mental | T2 B56 | 5 | 3.5 | same pattern, `mul-div-large-generators.ts` |
| mul-tens-mental | T1 B23 | 6 | 4 | T1 = tens ≤3 × d ≤3 → 6 items, `mul-generators.ts:88` |
| div-tens-mental (T2) | T1 B26 | 3 | 3 | T2 needs quotient 30–40, `div-generators.ts:133-134` |
| div-hundreds/thousands-mental | B37/B57 | 8 | 5 | same filter pattern, `div-generators.ts:150+` |
| meas-len-choose-unit | B7/B30 | 14 | 4 | fixed 16 `OBJECTS`, each with one length, `length-compare-order-generators.ts:107-124` |
| meas-mm-convert | B30 | 20 | 6 | T1 n = 1..10 cm, `length-and-unit-generators.ts:92` (`RULER_MAX_CM = 10`, `measurement-ranges.ts:12`) |
| meas-len-convert-far | B7/B30 | 40 | 6.5 | small factor range, `length-ladder-generators.ts:102-111` |
| meas-ruler-read | B7/B30 | 45 | 11 | 5 `LONG_NOUNS` × 2–10 cm, `measurement-distractors.ts:8`, `length-and-unit-generators.ts:21-23` |
| mul-2d-1d / div-2d-1d | B23/B26 | 37–40 | 8–11 | product ≤ 99 + carry filter, `mul-generators.ts:22-47` |
| add-sub-mental-round (T1) | T1 B2 | 90 | 6 | round tens only |
| money-recognize/exchange | T2 B68 | 3–7 | 3 | curriculum-bound (notes only) |
| roman-*, fraction-read, clock-read-hour-half | — | 3–24 | 3–6 | curriculum-bound |
82 of 435 measured skill×tier cells have < 50 distinct items.

## 3. Template (shape) variety — the "feels the same" cause
| skill(s) | shapes | cause |
|---|---|---|
| add-sub-1000, add-4digit, sub-4digit, add-5digit, add-sub-1000-chain, all mul/div calc | 1–2 | one prompt frame (`addCalc`/`mulCalc`) per skill |
| add-sub-1000-wp | 3 | 3 frames add/sub/compare, `add-sub-word-problems.ts:39-` |
| big-number wp | — | only 3 `BIG_CONTEXTS`, `add-sub-word-problems.ts:17-27` |
| every reasoning word problem | 4–6 | 3 name pairs `NAMES`, 6 `GENERIC_NOUNS`, `reasoning-distractors.ts:103-115` |
| meas-len-* (8 ids) | 1–2 | one frame each; `LEN_OBJECTS` = 4, `length-add-sub-generators.ts:32` |
| pattern-add/sub, unknown-add-sub | 1–2 | one frame |

## 4. Run-level causes (how items are dealt)
- **Lesson run** (`src/ui/lesson-practice.ts:24-34`, `lesson-planner.ts:30-33`): seed =
  hash(profile, lesson, total attempts) — a replay re-plans, good. But a single-skill lesson
  re-rolls the same skill 6 times (`MAX_ITEMS_PER_SKILL = 6`) with **no within-run dedupe**:
  with a pool of 5–6 (B23/B36/B56) one run almost surely shows the same item twice.
- **Daily** (`daily-planner.ts:18-23`, `practice-run.ts:106`): seed = (day, profile); same day
  replays the same set on purpose. Items are drawn via `skillPlan` → `itemForSkill`
  (`daily-skill-item.ts:37-44`) with no memory of yesterday's items.
- **Level reasoning round** (`levels/shared/reasoning-round-slot.ts:55-61`): rng = `Math.random`
  (`level-host-ports.ts:82`), picks the least-attempted skill, no memory.
- Other `itemForSkill` callers: `lesson-walkthrough.ts:134`, `cave-chamber-formats.ts:151`,
  `market-stage-plan.ts:132`, `numberfort-stage-plan.ts:174`, `test-debug-hook.ts:142`.
- Level fact rounds use fixed curriculum fact pools: field 17, forest 36, city 30, tower 116 —
  repeats there are the Leitner design (same fact until mastered), not a bug.

## 5. Where memory can live
- `FactStat` already carries device-only fields (`errs`, `bugs`, `recent`) persisted via
  `progress-repository.ts:126-160` and written by `session-recorder.ts:96-102`; never in a save
  code, never synced. A per-skill `seen?: number[]` (32-bit fingerprints, last 24) fits the
  same path with no schema/server change.
- `progress-repository.ts` is already 202 lines → extract the local-merge helper when touching it.

## 6. Tool rot
`npx tsx tools/practice/pool-counter.ts` crashes: `item-for-skill.ts` imports
`dialog-scene-registry.ts`, which uses `import.meta.glob` (Vite only). Running the counting
through vitest works (5 s for all skills). Phase 1 makes the meter a vitest-run report.
