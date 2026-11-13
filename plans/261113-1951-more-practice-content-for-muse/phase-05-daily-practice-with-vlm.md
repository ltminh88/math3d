# Phase 05: Daily practice with VLM

## Context links
- [plan.md](plan.md), [phase-00-design.md](phase-00-design.md) (daily shape),
  [phase-01-measure-pools-stage-model-and-save-code-m3d4.md](phase-01-measure-pools-stage-model-and-save-code-m3d4.md)
  (M3D4 `d` field, day intervals)
- `src/learning/session-planner.ts` (`planSession`, `BOX_INTERVAL`,
  `MAX_NEW_PER_SESSION`), `leitner-box.ts` (`lastSeenAt`),
  `session-recorder.ts`, `scoring.ts` (`questionReward`)
- `src/ui/guide-dialog.ts` (VLM dialog — verify the file name in the repo;
  the guide is the NPC "VLM" by the river), `src/ui/quiz-dialog.ts`
  (3-choice quiz dialog), `src/ui/kit/*` (step kit for `sk:` items)
- `src/quiz/learning-quiz-adapter.ts`, `src/quiz/quiz-reasoning-slot.ts`
- `src/store/app-settings.ts` (settings source — daily state is *progress*,
  not a setting, so it lives in the store / M3D4, not here)
- `src/levels/shared/level-progression.ts` (gate model the unlock reuses)

## Overview
- Priority P1. Status **not started**. Depends on 01 (M3D4 `d` field, day
  intervals). Parallel with 03/04/06 (different folders; this phase owns
  `learning/daily-*`, the VLM dialog entry and the daily panel).
- "Luyện tập hôm nay": 10 items due from the Leitner boxes, mixed over
  everything learned so far, playable every day, small coin reward, a
  kindly shown streak with no penalty. One sitting ≈ 10–15 min.

## Key Insights
- The daily run is *not* a level: it has no 3D scene, no gate and no
  stars, so it must not go through the level host (which suspends the
  world loop and owns the renderer). It is a world dialog — the same
  layer as the bridge quiz dialog — built from two existing pieces: the
  3-choice quiz dialog for mul/div facts and the step kit for `sk:`
  skills. Reusing both avoids a third answering UI that would need its
  own touch audit.
- The planner is a *date* planner, not a session planner. `planSession`
  counts sessions (`BOX_INTERVAL` in sessions, `lastSeenSession`); daily
  counts days (`lastSeenAt`, epoch ms, already stored). The two must not
  be conflated: changing `BOX_INTERVAL` to days would change every
  level's planning. The daily intervals mirror the session numbers in
  days (box 1: 1 day, 2: 2, 3: 4, 4: 8, 5: 16) in a new pure module.
- A day is the device-local calendar day (local `YYYYMMDD` int). Timezone
  is the child's device timezone — no server, no UTC conversion, no
  attempt to be clever about travel. The faked-clock test is what pins
  the behaviour, not the timezone choice.
- "No penalty" is a copy rule as much as a logic rule: the UI never says
  a streak was lost, never counts down, never shows a sad state. The
  streak is a count of consecutive days with a completed run; a missed
  day resets the count silently on the next completion (count restarts
  at 1). The code path that resets it must not render any "lost" copy —
  asserted in e2e.

## Requirements
- **Unlock**: after **field stage 1** (the proposal answering the brief's
  second open question; one constant, `DAILY_UNLOCK_LEVEL = 'field'`, so
  the author can move it to `'city'` or `'tower'` with a one-line change
  + a string change). Before that, VLM's dialog shows the locked line
  ("Luyện tập hôm nay sẽ mở sau khi con qua Cánh Đồng Phép Tính.") and
  the quest card shows nothing about daily.
- **Planner** (`src/learning/daily-planner.ts`, pure):
  - Pool = every fact/skill with attempts > 0 (learned so far only).
    Nothing untaught is ever introduced by daily practice.
  - Due = box < 5 and `today - lastSeenDay >= dayInterval(box)`.
    Pick: 6 due/weak first (lowest box, then oldest `lastSeenAt`), 3
    weakest not-due, 1 mastered (box 5, oldest) check. Spill rules mirror
    `planSession`; interleaving mirrors it too (no two neighbours from
    the same group where avoidable).
  - If the learned pool has fewer than 10 items, top up with at most 3
    unseen facts from the *current* level's tables (same cap as
    `MAX_NEW_PER_SESSION`); if still short, play fewer items (minimum 5)
    rather than repeat an item in one day.
  - Deterministic for (seed, date, stats): same day + same stats → same
    10 items, so a replay after an interruption resumes the same set.
- **Run** (world dialog, `src/ui/daily-practice.ts` + strings):
  - Entry: VLM dialog → "Luyện tập hôm nay" button. The quest card shows
    a one-line reminder ("Hôm nay: chưa luyện" / "Hôm nay: đã luyện ✓")
    — the line is the reminder, the dialog is the entry.
  - Each item renders in the quiz dialog (mul/div) or the step kit
    (`sk:` skills, same steps/hints as the levels, rung ≥ 2 never shows
    the answer). Answers record through the same session recorder
    (session number increments; Leitner boxes move exactly as in a level).
  - The run can be left mid-way (world resumes; progress of answered
    items is kept; unanswered items stay due tomorrow). Finishing all 10
    (or all available, if fewer) completes the run.
  - Reward: +5 coins per correct answer + +10 coins for finishing; no XP
    bonus, no stars, no first-completion bonus. One counted run per day:
    a second run the same day is allowed for practice but pays no daily
    finish reward and does not extend the streak.
  - Streak copy: "Bạn đã luyện {n} ngày liên tiếp!" — shown after a
    completed run and on the VLM dialog. No copy ever mentions losing a
    streak.
- **Storage**: `lastDailyDay` (local YYYYMMDD int, 0 = never) +
  `dailyStreak` (int), in the store and in M3D4's `d` field (phase 01).
  A run completed on `lastDailyDay + 1` increments the streak; on the
  same day it is already counted; on any later day it restarts at 1.
  Clock going backwards never increments the streak and never corrupts
  it (guard: `today < lastDailyDay` → treat as same day).
- **Tests**: unit tests for the planner (due ordering, top-up cap,
  fewer-than-10, determinism, no repeats in one day, empty pool →
  no run offered) and for the streak transitions (consecutive / same
  day / gap / clock-backwards); e2e on all 4 projects (enter via VLM by
  tap, play 10 items, coins + streak in the store, replay same day pays
  no second reward) **with a faked clock** (Playwright clock / seeded
  date) proving the across-days behaviour: day 1 completes, day 2 offers
  a new set, streak 2; a skipped day restarts at 1 with no sad copy.

## Architecture
```
src/learning/daily-planner.ts (new, pure)
src/learning/daily-intervals.ts (new in phase 01; used here)
src/learning/daily-streak.ts (new, pure: next streak from (lastDay, today, completed))
src/ui/daily-practice.ts (new: dialog panel, reuses quiz dialog + step kit)
src/ui/guide-dialog.ts (mod: "Luyện tập hôm nay" entry + locked line)
src/ui/quest-chain.ts (mod: one reminder line)
src/ui/daily-practice-strings.ts (new: vi source, en required)
tests/e2e/daily-practice.spec.ts (new, faked clock, 4 projects)
```
The daily panel never imports `shop/` or any `levels/` scene code. The
world is not suspended (dialog layer only); the player stays by the river.

## Related code files
- Modify: `guide-dialog.ts` (verify name), `quest-chain.ts`.
- Create: files above.
- Delete: none.

## Implementation Steps
1. Planner + streak as pure modules first, RED/GREEN (due ordering,
   top-up cap, determinism, streak transitions incl. clock-backwards).
2. Daily panel reusing the quiz dialog + step kit; VLM entry + locked
   line; quest-card reminder line.
3. Reward + one-counted-run-per-day wiring through the session recorder;
   verify coins in the store snapshot in e2e.
4. Faked-clock e2e (4 projects): day 1 → day 2 → skipped day; streak
   copy asserted kind at every step; no "lost streak" text anywhere in
   the bundle (grep test).
5. Lint, typecheck, unit, build, golden `--check` (dialog-only change:
   goldens byte-identical expected), e2e.

## Todo list
- [ ] daily planner + streak (pure, unit-tested)
- [ ] daily panel (quiz dialog + step kit reuse)
- [ ] VLM entry + locked line + quest-card reminder
- [ ] reward + one-counted-run-per-day
- [ ] faked-clock e2e, 4 projects

## Success Criteria
- A child with only field done gets a daily set drawn only from what
  they have learned (+ ≤ 3 new); a child who finished the cave gets a
  mixed set across all 39 skills + tables.
- Streak behaves as specified across faked days, including a skipped day
  and a backwards clock, with no penalty copy anywhere.
- Playable by tap alone on phone + both tablet projects; targets ≥ 44 px;
  leaving mid-run keeps answered items and resumes the world.
- No new npm dependency; no Supabase; no world/scatter change.

## Scope Contract
- Changed: daily planner + streak (pure), VLM dialog entry, daily panel,
  quest-card reminder line, e2e spec.
- Impacted: the session recorder (one more caller — no format change),
  the store (two M3D4 fields, defined in phase 01).
- Will verify: unit (planner, streak), e2e with faked clock (4 projects),
  golden check.
- Deliberately skipped: notifications/reminders outside the game, any
  server-side scheduling, a HUD button for daily (entry is VLM + quest
  line only — if the author wants a HUD button, that is phase 07's call),
  any change to level planning.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Daily set repeats items a child just did in a level | M | M | Due-first ordering + `lastSeenAt` means an item done today is not due today; the mastered-check slot is the only same-day repeat, and it is 1 of 10 |
| Faked-clock test passes but real clocks break (DST, travel) | M | M | Local-date int, backwards-clock guard; no UTC math anywhere in the feature |
| Quiz dialog + step kit fight over focus/keys in one panel | M | M | One item visible at a time; the panel owns focus; e2e asserts the pad/choices work by tap on touch projects |
| Child farms coins by replaying daily | L | M | One counted run/day enforced in the store write, not just the UI (unit test on the commit path) |

## Security Considerations
- Daily state is local progress, not a credential. The date comes from
  the device clock — a child setting the clock forward can only earn
  +10 coins a "day", which is not worth guarding against with a server.

## Next steps
- 07 wires the quest-card line into the final HUD copy; 08 re-measures
  the daily sitting length (target 10–15 min) in the author playthrough.
