# Phase 11: Daily practice with VLM + HUD button

## Context links
- [plan.md](plan.md), [phase-00-design.md](phase-00-design.md) (daily shape),
  [phase-01-measure-pools-stage-model-and-save-code-m3d4.md](phase-01-measure-pools-stage-model-and-save-code-m3d4.md)
  (M3D4 `d` field, day intervals)
- `src/learning/session-planner.ts` (`planSession`, `BOX_INTERVAL`),
  `leitner-box.ts` (`lastSeenAt`), `session-recorder.ts`,
  `scoring.ts` (`questionReward`)
- `src/ui/guide-dialog.ts` (VLM dialog — verify the file name in the repo;
  the guide is the NPC "VLM" by the river), `src/ui/quiz-dialog.ts`
  (3-choice quiz dialog), `src/ui/kit/*` (step kit for `sk:` items),
  `src/ui/hud.ts` (top bar — the daily button lives here)
- `src/quiz/learning-quiz-adapter.ts`, `src/quiz/quiz-reasoning-slot.ts`
- `src/store/app-settings.ts` (settings source — daily state is *progress*,
  not a setting, so it lives in the store / M3D4, not here)
- `src/levels/shared/level-progression.ts` (gate model the unlock reuses)

## Overview
- Priority P1. Status **not started**. Depends on 01 (M3D4 `d` field, day
  intervals). Parallel with 03–10 and 12 (different folders; this phase
  owns `learning/daily-*`, the VLM dialog entry, the daily panel and the
  HUD button). Effort **16 h** (branch `muse/daily-practice`, one PR).
- "Luyện tập hôm nay": up to 10 items due from the Leitner boxes, mixed
  over everything learned so far, playable every day, small coin reward, a
  kindly shown streak with no penalty. One sitting ≈ 10–15 min. Entry is
  the VLM dialog **and** a HUD button (author decision 7, PR #1 review).

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
  - If the learned pool has fewer than 10 items, the child plays fewer
    items — **no top-up with untaught facts** (PR #1 review, point 6:
    the earlier draft both promised "never untaught" and topped up with
    up to 3 unseen facts; the top-up is removed). No item repeats within
    one day. If the pool is empty (cannot happen after field stage 1,
    which always leaves attempted facts — but guarded anyway), VLM shows
    the locked line instead of an empty run.
  - Deterministic for (seed, date, stats): same day + same stats → same
    items, so a replay after an interruption resumes the same set.
- **Run** (world dialog, `src/ui/daily-practice.ts` + strings):
  - Entry: **two ways in** (author decision 7 on PR #1): VLM dialog →
    "Luyện tập hôm nay" button, **and a HUD button** ("Luyện tập hôm
    nay", ≥ 44 px, tap-usable). The HUD button sits in the top bar next
    to the quest toggle — never over the movement controls (joystick /
    interact button) on phone or tablet; its placement is proven on all
    4 projects (desktop, phone, tablet portrait/landscape) with
    screenshots of the top bar + joystick area. The quest card shows a
    one-line reminder ("Hôm nay: chưa luyện" / "Hôm nay: đã luyện ✓").
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
- **Tests**: unit tests for the planner (due ordering, fewer-than-10
  with no top-up and no repeats, determinism, empty pool → no run
  offered) and for the streak transitions (consecutive / same day / gap /
  clock-backwards); e2e on all 4 projects (enter via VLM by tap **and**
  via the HUD button by tap, play the day's items, coins + streak in the
  store, replay same day pays no second reward) **with a faked clock**
  (Playwright clock / seeded date) proving the across-days behaviour:
  day 1 completes, day 2 offers a new set, streak 2; a skipped day
  restarts at 1 with no sad copy. E2e also asserts the HUD button is
  ≥ 44 px, tappable, and does not cover the joystick / interact button
  on phone and both tablet projects (hit-area check on the top bar +
  joystick area).

## Architecture
```
src/learning/daily-planner.ts (new, pure)
src/learning/daily-intervals.ts (new in phase 01; used here)
src/learning/daily-streak.ts (new, pure: next streak from (lastDay, today, completed))
src/ui/daily-practice.ts (new: dialog panel, reuses quiz dialog + step kit)
src/ui/guide-dialog.ts (mod: "Luyện tập hôm nay" entry + locked line)
src/ui/hud.ts (mod: daily-practice HUD button, top bar)
src/ui/quest-chain.ts (mod: one reminder line)
src/ui/daily-practice-strings.ts (new: vi source, en required)
tests/e2e/daily-practice.spec.ts (new, faked clock, 4 projects)
```
The daily panel never imports `shop/` or any `levels/` scene code. The
world is not suspended (dialog layer only); the player stays by the river.
The HUD button is hidden while a level runs (same guard as the other HUD
buttons) and never overlaps the joystick / interact button.

## Related code files
- Modify: `guide-dialog.ts` (verify name), `quest-chain.ts`, `hud.ts`.
- Create: files above.
- Delete: none.

## Implementation Steps
1. Planner + streak as pure modules first, RED/GREEN (due ordering,
   fewer-than-10 with no top-up, determinism, streak transitions incl.
   clock-backwards).
2. Daily panel reusing the quiz dialog + step kit; VLM entry + locked
   line; quest-card reminder line; HUD button in the top bar.
3. Reward + one-counted-run-per-day wiring through the session recorder;
   verify coins in the store snapshot in e2e.
4. Faked-clock e2e (4 projects): day 1 → day 2 → skipped day; streak
   copy asserted kind at every step; no "lost streak" text anywhere in
   the bundle (grep test). HUD button placement e2e (hit-area check).
5. Lint, typecheck, unit, build, golden `--check` (dialog + HUD-button
   change: the HUD is world chrome, so the golden check is expected to
   stay byte-identical — the button is DOM, not world geometry; if a
   golden diff appears it is reported, never silently re-baselined),
   e2e. Deploy a preview of this branch (no `--prod`) and put its URL in
   the pull request, so the author can check the button placement on a
   phone/tablet early.

## Visible changes in the world outside the levels
- HUD: new "Luyện tập hôm nay" button in the top bar (visible in the
  world, not inside a level).
- Quest card: daily reminder line ("Hôm nay: chưa luyện / đã luyện ✓").
- VLM guide dialog: "Luyện tập hôm nay" entry.
- The parity reviewer re-shoots the HUD top bar (all 4 projects), the
  quest card and the VLM dialog; these are intentional changes.

## Todo list
- [ ] daily planner + streak (pure, unit-tested)
- [ ] daily panel (quiz dialog + step kit reuse)
- [ ] VLM entry + locked line + quest-card reminder + HUD button
- [ ] reward + one-counted-run-per-day
- [ ] faked-clock e2e, 4 projects (+ HUD placement check)
- [ ] preview deploy + URL in PR

## Success Criteria
- A child with only field done gets a daily set drawn only from what
  they have learned — never an untaught fact — and plays fewer items if
  that pool is under 10; a child who finished the cave gets a mixed set
  across all 39 skills + tables.
- Streak behaves as specified across faked days, including a skipped day
  and a backwards clock, with no penalty copy anywhere.
- Playable by tap alone on phone + both tablet projects; targets ≥ 44 px;
  the HUD button never covers the movement controls; leaving mid-run
  keeps answered items and resumes the world.
- No new npm dependency; no Supabase; no world/scatter change.
- The phase's pull request carries a preview-deploy URL (no `--prod`).

## Scope Contract
- Changed: daily planner + streak (pure), VLM dialog entry, daily panel,
  HUD button, quest-card reminder line, e2e spec.
- Impacted: the session recorder (one more caller — no format change),
  the store (two M3D4 fields, defined in phase 01), the HUD top bar.
- Will verify: unit (planner, streak), e2e with faked clock (4 projects),
  HUD placement check, golden check, preview playthrough by the author.
- Deliberately skipped: notifications/reminders outside the game, any
  server-side scheduling, any change to level planning.
- **No top-up, ever**: the planner has no code path that introduces an
  untaught fact into a daily set (asserted in unit tests).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Daily set repeats items a child just did in a level | M | M | Due-first ordering + `lastSeenAt` means an item done today is not due today; the mastered-check slot is the only same-day repeat, and it is 1 of 10 |
| Faked-clock test passes but real clocks break (DST, travel) | M | M | Local-date int, backwards-clock guard; no UTC math anywhere in the feature |
| Quiz dialog + step kit fight over focus/keys in one panel | M | M | One item visible at a time; the panel owns focus; e2e asserts the pad/choices work by tap on touch projects |
| Child farms coins by replaying daily | L | M | One counted run/day enforced in the store write, not just the UI (unit test on the commit path) |
| HUD button covers the joystick / interact button | M | H | Top-bar placement; hit-area e2e on phone + both tablet projects; screenshots of the top bar + joystick area in the PR |

## Security Considerations
- Daily state is local progress, not a credential. The date comes from
  the device clock — a child setting the clock forward can only earn
  +10 coins a "day", which is not worth guarding against with a server.

## Next steps
- 13 finalises the quest-card line copy (the HUD button itself is built
  here, per author decision 7); 14 measures the daily sitting length
  (target 10–15 min) in the author playthrough on staging.
