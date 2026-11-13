# Phase 01: Measure pools, stage model, save code M3D4

## Context links
- [plan.md](plan.md), [phase-00-design.md](phase-00-design.md)
- `src/learning/session-planner.ts` (`SESSION_LENGTH = 10`, `BOX_INTERVAL`,
  `planSession`), `leitner-box.ts` (`LEITNER`, `Attempt`, `lastSeenAt`),
  `skill-catalog.ts` (append-only), `skill-tiers.ts`, `fact-key.ts`
- `src/store/save-schema.ts` (`LevelProgress`), `progress-repository.ts`
  (spread-defaults read), `save-code-codec.ts` (`SAVE_CODE_VERSION = 3`,
  `MAX_SAVE_CODE_CHARS = 16384`), `save-code-v3-payload.ts` (frozen 9 ids),
  `save-code-v3-skills.ts`, `save-migrations.ts`
- `src/levels/shared/level-types.ts` (`LevelDefinition`, `LevelResult`),
  `level-registry.ts` (validates `rounds`), `level-progression.ts`
  (`isGateOpen`, `gateStatus`), `level-run-result.ts`
  (`LEVEL_COMPLETE_BONUS`, first-completion decided at commit time)
- `src/reasoning/reasoning-item-for-skill.ts`,
  `src/geometry/geometry-item-for-skill.ts`,
  `src/measurement/measurement-item-for-skill.ts`
- Chapter 2 phase 01 (the M3D3 precedent: freeze the old level set, strict
  decode, shipped-code fixture test).

## Overview
- Priority P1. Status **not started**. No deps; unblocks every later phase.
- Foundation in three parts: (a) measure what exists — distinct-prompt
  counts per skill/tier and the in-level median seconds per round;
  (b) land the stage data model (`stages` on the definition, `stageStars`
  on progress) with the migration rule; (c) land save code M3D4 carrying
  the new fields, with M3D1/2/3 decoding byte-for-byte as before.
- This phase writes **no level content and no UI**. Its outputs are the
  numbers every later phase is judged against.

## Key Insights
- `LevelProgress` is read with `{...newLevelProgress(id, l.levelId), ...l}`,
  so a new optional field with a default is backward compatible in
  IndexedDB — but the save code is *not* forgiving: a field that is not in
  the payload is lost on import, so stages + daily fields need M3D4.
- `completedAt` is set when `stars >= 1` (`progress-repository.ts`); keeping
  its stage-1 meaning is what lets the quest chain, gates and
  `firstCompletionBonus` stay untouched. The first-completion bonus
  (+50 XP / +10 coins) is paid once per *level*, on stage 1 only — later
  stages pay only their per-question rewards, or the bonus would be farmed
  44 times.
- `lastSeenAt` (epoch ms) already exists on every fact/skill stat, so the
  daily planner (phase 05) needs no new per-fact storage — only the two
  daily fields in M3D4.
- Stickers are derived from boxes, so they need no storage at all. If a
  sticker ever needed its own field, that decision belongs here, before
  M3D4 freezes — not in phase 06.
- The skill catalog is append-only and M3D3 decodes only listed ids. This
  phase must answer, per skill, "can this pool be widened without a new
  id?" — a "yes, needs a new id" answer after M3D4 lands would mean M3D5.

## Requirements
- **Counting harness** (pure, node-runnable, e.g.
  `tools/practice/pool-counter.ts` + a Vitest that asserts the counts it
  prints): for every skill in the catalog (39 `sk:` skills) × tier 1–3,
  and for every mul/div fact pool per level, draw 10,000 seeded items and
  report: distinct *visible prompt signatures* (template id + numbers +
  scene params — the exact thing a child would recognise as "the same
  question"), median draws before an exact repeat, and the count of
  distinct signatures. Same harness counts story contexts per word-problem
  skill (today: 1 template per skill — verify, do not assume). Output is a
  committed report,
  `plans/261113-1951-more-practice-content-for-muse/reports/pool-counts-before.md`,
  with a before/after table phase 02 fills in.
- **Play-time measurement protocol**: instrument round start/end
  timestamps on the level test hooks (`window.__game` / per-level hooks;
  test builds only) and record them in the full-chain e2e run. Report the
  median in-level seconds per round *by round kind* (tables recall,
  multi-step reasoning, geometry, measurement) and overall. Playwright
  wall time is **not** the child time: report the e2e median alongside
  the calibration implied by the author's 1-hour observation (~55–60 s
  in-level, see phase 00). If the measured median is < 58 s, the design's
  contingency triggers: add a 7th stage to city + tower (design change
  recorded here, before phase 03 starts). Re-estimate the total effort
  after this measurement.
- **Stage model**:
  - `LevelDefinition.stages: number` (registry: positive integer; a level
    with `stages: 1` behaves exactly as today — this is what lets the
    migration ship safely).
  - `LevelProgress.stageStars: readonly number[]` (best stars per stage;
    length `stages`, default `[0, …]`; stage 1 default inherits from the
    existing `stars` on migration — see below).
  - Pure helper `src/levels/shared/level-stages.ts`: `stageStatus(level,
    stage)` → `'locked' | 'open' | 'completed'` (stage *n* open iff stage
    *n−1* has ≥ 1 star; stage 1 always open once the level gate is open),
    `nextStage(level)`, `stagesCompleted(level)`. Unit tests: a fresh
    level, a level with stage 1 done, a level with a gap (never happens
    from real play — assert it cannot open stage 3 with stage 2 at 0).
  - The level host passes the stage number into `LevelContext` (new
    read-only field `stage: number`); the scene's round planner receives
    it. The host itself does not know stage content — each level's
    `*-round-plan.ts` maps stage → pool/tier/format.
  - Gate text: the gate pop-panel shows "Chặng {n}/{stages}" for the next
    uncompleted stage (strings via the level's own namespace; `vi` source,
    `en` required). The gate never looks locked once its level is open.
- **Migration** (in `save-migrations.ts` + a unit test + an e2e): an
  existing record with `stars > 0, completedAt > 0` and no `stageStars`
  becomes `stageStars = [stars, 0, …]`; a record with `stars = 0` becomes
  all zeros. A child who already finished the cave sees stage 1 complete
  with their stars and stages 2+ open.
- **Save code M3D4** (`src/store/save-code-v4-payload.ts`):
  - Export writes M3D4 (`SAVE_CODE_VERSION = 4`); M3D1/M3D2/M3D3 decode
    unchanged (frozen fixtures for all three, including the shipped M3D2
    fixture and a new shipped M3D3 fixture taken before this change).
  - New compact fields only: `s` = per-level stage stars (only levels
    with a non-zero stage beyond stage 1, to keep codes short), `d` =
    `[lastDailyDay, dailyStreak]` (phase 05 owns the semantics; the field
    exists here so its shape is frozen). No other new fields.
  - Strict decode: unknown level/skill id → `payload` error, as M3D3
    does; full-save encoded length stays < 16384 chars (test with a
    synthetic maxed-out snapshot: all facts + skills + all stages).
  - `docs/recovery-notes.md` save-code section documents M3D4.
- **Catalog freeze decision**: the report lists, per skill, whether its
  pool can reach the phase-02 target without a new id. If any skill
  cannot, this phase proposes the new id(s) (append-only) *now* — they
  ship in M3D4's catalog, not later.

## Architecture
```
tools/practice/pool-counter.ts (new, node-only; imports pure generators)
src/learning/daily-intervals.ts (new: BOX -> days, shared by phase 05; pure)
src/levels/shared/level-stages.ts (new, pure)
src/levels/shared/level-types.ts (mod: stages, ctx.stage)
src/levels/shared/level-registry.ts (mod: validate stages)
src/store/save-schema.ts (mod: stageStars)
src/store/progress-repository.ts (mod: newLevelProgress default)
src/store/save-code-v4-payload.ts (new)
src/store/save-code-codec.ts (mod: version 4)
src/store/save-migrations.ts (mod: stageStars migration)
```
Co-located `*.test.ts` for each pure module. All files < 200 lines.

## Related code files
- Modify: `level-types.ts`, `level-registry.ts`, `save-schema.ts`,
  `progress-repository.ts`, `save-code-codec.ts`, `save-migrations.ts`,
  `docs/recovery-notes.md`, `src/levels/shared/test-debug-hook.ts`
  (add a stage seeder for e2e: `seedStageProgress(levelId, stageStars)`).
- Create: files above + the pool-counts report.
- Delete: none.

## Implementation Steps
1. Land the counting harness first, as its own commit; run it and write
   the `pool-counts-before.md` report (before/after table with the "after"
   column empty). RED: harness asserts a known-small pool (e.g.
   `meas-temperature`: 6 places) counts exactly what manual reasoning
   predicts; GREEN.
2. RED: `level-stages.ts` pure tests (fresh / stage-1-done / gap);
   GREEN. RED: registry rejects `stages: 0` and accepts `stages: 1`
   with today's behaviour; GREEN.
3. RED: migration unit tests (finished level → stage 1 inherits stars;
   unfinished → all zero); GREEN. RED: e2e importing a shipped M3D3 code
   shows the cave's stages as stage 1 complete, rest open; GREEN.
4. RED: M3D4 round-trip (stages + daily fields); M3D1/2/3 fixtures decode
   identical; unknown level/skill → `payload`; maxed-out save < 16384
   chars; GREEN.
5. Run the play-time measurement on the full-chain e2e; write the
   measured median + the go/no-go on the city+tower 7th stage into this
   phase file's Implementation notes and update phase 00's estimate table
   if the number moves. Re-estimate total effort.
6. Lint, typecheck, unit, build, golden `--check` (must be byte-identical:
   this phase touches no world code).

## Todo list
- [ ] pool counter + before-report
- [ ] play-time measurement + contingency decision
- [ ] `level-stages.ts` + registry + host `stage`
- [ ] `stageStars` + migration (+ e2e)
- [ ] M3D4 (+ frozen fixtures, size test, docs)
- [ ] catalog freeze decision (new ids or none)
- [ ] re-estimate total effort

## Success Criteria
- Pool counts are committed numbers, not estimates, per skill × tier.
- A pre-existing finished save keeps its stars and sees stage 1 complete;
  no existing save loses progress in unit tests or e2e.
- M3D1/2/3 fixtures decode identically; M3D4 round-trips; goldens
  byte-identical; lint/typecheck/unit/build clean.
- The play-time estimate is a measured number with a stated protocol, and
  the 7th-stage contingency has a yes/no answer recorded here.

## Scope Contract
- Changed: stage model, progress record, save-code version, test hooks,
  measurement tooling.
- Impacted: every level's `index.ts` gains `stages: 1` (no behaviour
  change), the store, save import/export.
- Will verify: unit (store + save codes are safety-critical), golden
  check, the migration e2e, full e2e on desktop + phone (store paths).
- Deliberately skipped: any stage content, any daily UI, any sticker UI,
  any pool widening (phase 02), any visual change (no parity run needed).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| M3D4 accidentally changes M3D3 decoding | L | H | Frozen fixtures for M3D1/2/3; strict-decode tests |
| Stage-1 inheritance misreads an old record | M | H | Migration unit tests + e2e on a shipped code |
| Pool counter's "signature" misses a visible repeat (e.g. same numbers, different template) | M | M | Signature = template + numbers + scene params; spot-check 20 sampled items by eye in the report |
| e2e median misleads (Playwright overhead) | H | M | Report e2e median *and* the 1-hour calibration; the contingency uses the calibrated number, not raw wall time |
| A skill needs a new id after M3D4 freezes | M | M | Freeze decision is an explicit deliverable of this phase, before any stage work |

## Security Considerations
- Save codes are untrusted input: strict decode, length cap, CRC, no
  `eval`; stage stars validated (integers 0–3, length ≤ stages); skill
  ids whitelisted by catalog.

## Next steps
- 02 after the counter + catalog freeze; 03–06 consume the stage model
  and M3D4.
