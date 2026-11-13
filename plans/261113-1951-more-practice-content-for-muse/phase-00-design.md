# Phase 00: Design — more practice from the same world (step 0, no code)

## Context links
- [plan.md](plan.md) (the brief; it governs where it differs from this design)
- `README.md`, `docs/code-standards.md`, `docs/project-changelog.md`
- `plans/261031-1933-reasoning-geometry-and-map-expansion/plan.md` (chapter 2: 126 h, 9 phases — the calibration for the estimates below)
- `src/learning/skill-catalog.ts` (39 `sk:` skills, append-only), `session-planner.ts`, `leitner-box.ts`, `skill-tiers.ts`
- `src/levels/shared/level-progression.ts`, `level-registry.ts`, `level-types.ts`, `level-run-result.ts`
- `src/store/save-schema.ts` (`LevelProgress`), `save-code-codec.ts` (`SAVE_CODE_VERSION = 3`, cap 16384 chars), `save-code-v3-payload.ts` (frozen 9-level set)

## Chosen design (summary)
No new world, no new regions, no new level scenes. Four mechanisms, all reusing
what chapter 2 built:

1. **Stages inside each level** — re-entering a gate plays the next stage
   ("Chặng 1 · 2 · …"). Stage 1 is today's run, byte-for-byte the current
   behaviour, and it alone unlocks the next gate, so nobody is ever blocked.
   Later stages change *what* is practised (skill subset, tier floor, round
   format), never the run length: a run stays 5–8 rounds.
2. **Daily practice with VLM** ("Luyện tập hôm nay") — 10 items due from the
   Leitner boxes, mixed over everything learned so far, one counted run a day,
   small coin reward, a kindly shown day streak with no penalty.
3. **Wider item pools** — more story contexts, shapes and scene variants inside
   the existing seeded generators, so a child does not see the same prompt
   twice within three runs. Counts are measured before and after (phase 01
   builds the counter; phase 02 does the widening).
4. **Mastery stickers** — a sticker book, one page per topic, one sticker per
   mastery unit (table or `sk:` skill) earned at Leitner box 4+. Stickers are
   *derived* from boxes already stored, never stored separately and never
   bought: cosmetic only, no shop import.

## Stage table (the proposal)
Tables-heavy levels get **6 stages**, skill levels get **5 stages**:

| Level | Rounds/run | Stages | Fresh rounds | What changes per stage |
|---|---|---|---|---|
| field (bảng 3, 4) | 5 | 6 | 30 | planting → commutativity → missing factor → word problems → recall speed → mastery |
| forest (chia 2–5) | 5 | 6 | 30 | share/pack/family → remainders → fact families → word problems → pack speed → mastery |
| city (bảng 6–9) | 5 | 6 | 30 | delivery → reverse delivery → compare → word problems → two-step delivery → mastery |
| tower (bảng 2–9) | 7 | 6 | 42 | mixed ×/÷ → expressions → true/false → word problems → remainders → mastery climb |
| garden (quy luật) | 6 | 5 | 30 | 8 skills, tier rises with box (1 → 2 → 3), kinds rotate as today |
| valley (hình học) | 6 | 5 | 30 | 9 `geo-*` skills, rotated figures / choose-all in later stages |
| workshop (đo lường) | 6 | 5 | 30 | 12 `meas-*` skills, perimeter/area emphasis in later stages |
| cave (tổng hợp) | 7 | 5 | 35 | weakest-first mixed; word problems → logic → geometry+measurement → mastery |
| **Total** | — | **44 runs** | **257 rounds** | **5.5× today's 47 rounds / 8 runs** |

Why not a flat 3 stages (the brief's example)? 3 stages = 141 rounds, which
the estimate below shows is only ~3 h — it would miss the 5-hour goal by
nearly half. Why not 6 everywhere? The chapter-2 skill pools are small
(garden 8 skills, valley 9); a 6th stage there would repeat the same skills
with nothing new to vary except tier, while the tables pools (tower: 144
mul/div facts; forest: 72) still have unused format × fact combinations at
stage 6. The split is the honest middle: more stages where the pool is
deepest. **Contingency (committed, not vague):** if phase 01 measures the
in-level median below 58 s/round, a 7th stage is added to city + tower
(+12 rounds, ≈ +14 min) before phase 03 builds the stages.

## Play-time estimate (fresh content, first play-through)
Method (as the brief asks: rounds × median seconds per round, from the e2e
runs — the protocol is defined in phase 01, and the number is re-measured in
phase 08). Calibration anchor: the author's child finished everything in
~1 hour. The bridge needs only 6 correct answers (1 segment each,
`BRIDGE_SEGMENTS = 6`), ~5 min; walking between 8 gates + 8 celebrations is
~10–12 min; that leaves ~43–46 min in-level for 47 rounds, i.e. an **in-level
median of ~55–60 s/round** (tables rounds ~35–50 s, multi-step
reasoning/geometry/measurement rounds ~75–110 s, weighted by the mix).

| Component | Calculation | Time |
|---|---|---|
| In-level rounds | 257 rounds × 55 s | 236 min |
| In-level rounds (upper) | 257 rounds × 60 s | 257 min |
| Per-run overhead (walk to gate, enter, celebration, exit) | 44 runs × ~75 s | 55 min |
| Bridge quiz (unchanged) | 6 questions | ~5 min |
| **Total** | | **≈ 4.9 h at 55 s/round; ≈ 5.3 h at 60 s/round** |

So the design projects **≈ 5 hours** (4.9–5.3 h range). The low end sits
just under 5 h, which is exactly why the city+tower 7th-stage contingency
above is part of the design, not an afterthought. After the first
play-through, the daily loop is 10 items/day ≈ 10–15 min/day, indefinitely,
driven by Leitner due dates — that is the retention loop, not counted in the
5 hours. Replays beyond stage completion are unlimited but are *not* counted
as fresh content.

## Data model (the one structural decision)
- `LevelDefinition` gains `stages: number` (registry validates it like
  `rounds` today). `rounds` keeps its meaning: rounds *per stage*.
- `LevelProgress` gains one field, `stageStars: number[]` (best stars per
  stage, 0 = not done). `completedAt` keeps its stage-1 meaning, so the
  quest chain, `isGateOpen`, `questStage` and the M3D3-era chain are
  untouched. Stage *n* opens when stage *n−1* has ≥ 1 star (same level
  only). Existing saves migrate as: stage 1 inherits the level's current
  stars/`completedAt`; stages 2+ start open at 0. A child who finished the
  cave sees every new stage open with their stars kept.
- **Save code M3D4.** New progress fields need a new version (the catalog
  rule in `skill-catalog.ts` and the frozen M3D3 level set already say so):
  `save-code-v4-payload.ts`, export writes M3D4, M3D1/M3D2/M3D3 decode
  byte-for-byte as before. Added payload is small: per-level stage stars
  (8 × ≤6 numbers) + daily fields (`lastDailyDay` as YYYYMMDD int,
  `dailyStreak`). Stickers need *no* save-code field — they are derived from
  fact/skill boxes, which M3D3 already carries. Full-save size stays under
  the 16384-char cap (verified in phase 01; today's full save is ~11 KB).
- **No new skill ids** unless phase 01 proves a pool cannot be widened
  without one. New ids would also land in M3D4, so the freeze decision is
  made in phase 01, before any stage is built.
- IndexedDB: adding an optional field with a default in `newLevelProgress`
  is backward compatible — `progress-repository.ts` already spreads
  `{...newLevelProgress(id, l.levelId), ...l}`, so old records read fine.

## Daily practice (shape)
- Entry: talk to VLM in the village (guide dialog), "Luyện tập hôm nay".
  The quest card shows a small "Hôm nay: chưa luyện / đã luyện ✓" line so
  the child can find it without walking first.
- Planner (`src/learning/daily-planner.ts`, pure): pool = facts/skills with
  attempts > 0 (learned so far only — nothing untaught is ever introduced);
  due/weak first by box interval in *days* (box 1: 1 day, 2: 2, 3: 4, 4: 8,
  5: 16 — mirroring the session intervals in `session-planner.ts`, but on
  `lastSeenAt`, which is already stored); 10 items (6 due/weak, 3 weakest
  not-due, 1 mastered check; spill rules mirror `planSession`); if the
  learned pool is under 10, top up with at most 3 unseen facts from the
  current level's tables, and play fewer than 10 rather than repeat an item
  in one day.
- Reward: +5 coins per correct answer (the standard `questionReward`) +
  +10 coins for finishing; no XP bonus, no stars, no first-completion bonus.
  One counted run per calendar day (device-local date); replays are allowed
  for practice but pay no second daily reward.
- Streak: consecutive calendar days with a completed daily run, shown kindly
  ("Bạn đã luyện 3 ngày liên tiếp!"). A missed day resets the count
  silently — no sad copy, no lost-streak message, no countdown. Never a
  penalty, never a paywall.

## Stickers (shape)
- 47 stickers, 6 topic pages: Bảng nhân (8 — one per table 2–9, earned when
  ≥ 70% of that table's mul/div facts reach box 4+), Chia và số dư, Tìm số
  chưa biết và quy luật, Biểu thức và đúng/sai, Hình học, Đo lường (39 —
  one per `sk:` skill, earned at box 4+). The brief says box 4 or higher;
  box 4 is tier 2, so stickers arrive *before* full mastery (box 5), which
  keeps them reachable.
- The book lives in the world UI (`src/ui/sticker-book.ts`, new; it reads
  the store, never `shop/` — the code-standards rule that `shop/` is never
  imported by `learning/`, `quiz/` or `levels/` is respected by keeping
  stickers out of the shop entirely). Earning a sticker is a celebration
  line from VLM, nothing else.

## What is deliberately not in the design
- No new 3D worlds, regions, roads or gates: `REGIONS`, `ROADS`,
  `WALKABLE_BOUNDS` and the golden traces are untouched. Stage dressing
  changes happen *inside* each level's own diorama (its own builder files),
  never in the world scatter — a scatter change would reshuffle the seeded
  world and break the goldens.
- No Supabase/accounts/sync, no new npm dependencies, no numbers above 100,
  no unit conversions other than cm↔mm, no hint rung ≥ 2 that shows the
  answer. No change to a shipped save-code format — only the additive M3D4.
- No longer runs: stages are 5–7 rounds exactly as today. More practice
  means more runs (44 vs 8), not longer sittings.

## Phases
| # | Phase | Effort | Depends |
|---|---|---|---|
| 01 | [Measure pools, stage model, M3D4](phase-01-measure-pools-stage-model-and-save-code-m3d4.md) | 14 h | — |
| 02 | [Wider item pools](phase-02-wider-item-pools.md) | 12 h | 01 (counter + catalog freeze) |
| 03 | [Stages, chapter 1: field, forest, city, tower](phase-03-stages-chapter-1-field-forest-city-tower.md) | 20 h | 01 |
| 04 | [Stages, chapter 2: garden, valley, workshop, cave](phase-04-stages-chapter-2-garden-valley-workshop-cave.md) | 18 h | 01, 02 |
| 05 | [Daily practice with VLM](phase-05-daily-practice-with-vlm.md) | 14 h | 01 |
| 06 | [Sticker book](phase-06-sticker-book-mastery.md) | 10 h | 01 |
| 07 | [Quest card / HUD / migration / docs](phase-07-quest-card-hud-migration-and-docs.md) | 8 h | 03–06 |
| 08 | [Merge, full e2e, parity, staging, author review](phase-08-merge-e2e-parity-staging-author-review.md) | 14 h | all |
| | **Total** | **≈ 110 h** (±20%; re-estimated after phase 01) | |

Calibration: chapter 2 was 126 h for 4 brand-new levels + map expansion +
generators + tablet projects. This work reuses every scene and generator,
so it is smaller — but 8 levels × stages + daily + stickers + M3D4 is still
the same order of magnitude, and the e2e surface grows from a 9-stage chain
to a 44-run chain. Parallel groups (ownership by folder): 03 and 04 are
parallel by level folder; 05 (learning/daily + guide dialog) and 06 (ui
sticker book) are parallel with them; 07 and 08 are last, in order.

## Risks (headline; each phase file carries its own table)
| Risk | L | I | Countermove |
|---|---|---|---|
| Stages feel like grinding the same scene 5–6× | H | H | Per-stage format/tier/skill rotation (the table above) + in-diorama dressing; phase 08 author playthrough on iPad is the judge, not a unit test |
| In-level median < 58 s → under 5 h | M | H | Committed contingency: 7th stage for city + tower; re-measured in phase 08 |
| M3D4 migration loses stars/stages on import | L | H | Frozen M3D1/2/3 fixtures; stage-1 inheritance rule; e2e import of a shipped M3D3 code |
| Daily date bugs (timezone, clock changes) | M | M | Device-local YYYYMMDD int; one counted run/day; faked-clock e2e |
| 44-run e2e becomes too slow/flaky | M | M | Seed hooks (`seedProgress`, `teleportToGate`, new stage seeder) — walk stages via hooks, not by walking the world 44 times |
| Pool widening still repeats within 3 runs | M | M | Counting harness in phase 01 sets the bar; phase 02 reports before/after per skill/tier and lists any skill that cannot reach it |

## Open questions for the author (answer in this pull request)
1. **Stages: 6 for the tables levels, 5 for the skill levels — is that the
   right split, or should it be a flat 5 (or a flat 6) everywhere?**
   The estimate says a flat 5 lands at ~4.7 h and a flat 6 at ~5.6 h; the
   split lands at ~5.0 h. If you prefer a flat number, say which — the
   stage-content table above is written so the count can change without
   redesigning the formats.
2. **Should daily practice be reachable before the tower is finished?**
   Proposal: yes — unlock after **field stage 1**, because the daily pool
   only ever contains what the child has already learned, so nothing is
   spoiled and review starts months earlier. If you would rather gate it
   later (after city? after tower?), say where.
3. Sticker pages: 6 topic pages / 47 stickers as above — is that grouping
   right, or one page per level (8 pages) instead?
4. Daily reward: +10 coins for finishing + 5 per correct, one counted run
   per day — are those amounts right?
5. Migration: stage 1 inherits a finished level's stars — agreed?
6. Contingency: is a 7th stage for city + tower acceptable if the measured
   median comes in low, or would you rather lengthen later stages to 8
   rounds instead?
7. Daily entry is the VLM dialog (quest card only shows the reminder line)
   — is that findable enough, or do you want a HUD button too?

## Questions this design could not answer from the repo alone
- [K] The exact per-round median from e2e runs (phase 01 measures it; the
  estimate above is calibrated on the author's 1-hour observation instead).
- [K] Whether field already has a missing-factor round format (phase 03
  verifies in `field-round-flow.ts` before promising stage 3's format).
- [K] The exact distinct-prompt count per skill/tier today (phase 01's
  counting harness produces it; the "before" column is therefore empty in
  this design on purpose — no invented numbers).
