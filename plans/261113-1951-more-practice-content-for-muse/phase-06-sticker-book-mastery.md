# Phase 06: Sticker book (mastery goals)

## Context links
- [plan.md](plan.md), [phase-00-design.md](phase-00-design.md) (sticker
  shape), [phase-01-measure-pools-stage-model-and-save-code-m3d4.md](phase-01-measure-pools-stage-model-and-save-code-m3d4.md)
  (stickers are derived — no storage decision left)
- `src/learning/skill-catalog.ts` (39 skills, families, KNTT lessons),
  `skill-tiers.ts` (`tierOfBox`), `leitner-box.ts` (box 4 = tier 2),
  `curriculum-tables.ts` (`mulFactsForTables`, `divFactsForTables`)
- `src/store/game-store-api.ts` (snapshot the book reads),
  `src/ui/quest-chain.ts` (where the book is linked from),
  `src/ui/guide-dialog.ts` (VLM's celebration line)
- `src/shop/*` — **do not import**: the code-standards rule is that
  `shop/` is visual only and never imported by `learning/`, `quiz/` or
  `levels/`. Stickers are not shop items; this phase proves it by keeping
  them out of `shop/` entirely.

## Overview
- Priority P1. Status **not started**. Depends on 01 (derivation rule
  frozen: no sticker storage). Parallel with 03/04/05 (this phase owns
  `ui/sticker-book.*` + the derivation module only).
- A sticker book: one page per topic, one sticker per mastery unit,
  earned when the unit reaches Leitner box 4+. Replaying has a visible
  purpose; nothing is gated by stickers and nothing is bought with them.

## Key Insights
- The cheapest correct design is derivation: a sticker is earned ⟺ its
  unit's box ≥ 4, computed from the fact/skill stats the store already
  holds. That makes stickers free in the save code (M3D3 already carries
  every box), immune to migration bugs (an old save's boxes *are* its
  stickers), and impossible to desync from real mastery. Any design that
  stored "stickers earned" separately would need a second source of truth
  and a second migration — rejected.
- Box 4 (not 5) is the earn line, per the brief. Box 4 is tier 2, so a
  sticker arrives while the child is still climbing to full mastery
  (box 5 / tier 3) — reachable, not a grind wall. A table sticker needs
  ≥ 70% of that table's mul/div facts at box 4+ (a single fluent fact
  should not earn a whole table's sticker; a single weak fact should not
  block it forever).
- The book is a *world* UI (a dialog/panel like the quest card), not a
  level UI and not a shop panel: it opens from the quest card and from
  VLM, it never opens while a level runs, and it never touches coins.

## Requirements
- **Derivation** (`src/learning/sticker-book.ts`, pure):
  - 47 stickers in 6 topic pages:
    - Bảng nhân (8): one per table 2–9; earned when ≥ 70% of that
      table's mul+div facts are box ≥ 4.
    - Chia và số dư (skills `div-rem-floor`, `div-rem-ceil` + the
      division fact families — count the two `sk:` skills here; the
      tables' division facts already count toward Bảng nhân).
    - Tìm số chưa biết và quy luật (`unknown-add-sub`,
      `unknown-mul-div`, `pattern-add`, `pattern-sub`,
      `pattern-skip-count`).
    - Biểu thức và đúng/sai (`expr-order`, `expr-brackets`,
      `expr-from-story`, `choose-all-correct`, `tf-explain`,
      `wp-times-then-add`, `wp-divide-then-add`,
      `wp-more-less-then-total`, `wp-unit-then-times`,
      `wp-times-compare`, `wp-difference-compare`).
    - Hình học (9 `geo-*` skills).
    - Đo lường (12 `meas-*` skills).
  - Each sticker: `{ id, topic, earned: boolean, box }` — `box` is shown
    so the child can see progress ("còn 1 ô nữa" is *not* shown as a
    number the child must interpret; the page shows earned stickers in
    colour and unearned as grey outlines with a hint of the topic only).
  - Pure function of `(stats)` — unit tests: fresh stats → 0 earned;
    a skill at box 4 → earned; at box 3 → not; a table at 70% → earned,
    at 69% → not; an old M3D3 save's stats derive the same stickers
    after import.
- **Book UI** (`src/ui/sticker-book.ts` + `sticker-book-strings.ts`,
  `vi` source, `en` required): 6 pages, tap to flip, each sticker a
  ≥ 44 px target (tap shows its name + the KNTT topic line, e.g.
  "Bảng nhân 7 — con đã thuộc!"); a page header counts earned
  ("3/8"); the book opens from the quest card (a "Sổ dán hình" button)
  and from VLM's dialog. It is a dialog, so it closes with the same
  close control as other dialogs and never opens during a level run.
- **Earning moment**: when a recorded answer moves a unit to box 4, VLM
  says so on the next world return ("Con vừa dán được hình Bảng nhân 7!")
  — a line in the guide dialog / a toast, not a modal that interrupts
  play. The celebration fires at most once per unit (tracked in memory
  per session from the derived state — the *announcement* is ephemeral,
  the sticker is derived, so nothing needs storing).
- **Tests**: unit tests for the derivation (above); e2e on all 4 projects
  (seed stats at box 3 → play one clean round → sticker earned and shown
  in the book; seed a table at 70% → table sticker earned; book opens by
  tap, pages flip, targets ≥ 44 px, no key hints on coarse pointers).

## Architecture
```
src/learning/sticker-book.ts (new, pure: derive stickers from stats)
src/ui/sticker-book.ts (new: book dialog)
src/ui/sticker-book-strings.ts (new: vi/en)
src/ui/quest-chain.ts (mod: "Sổ dán hình" button)
src/ui/guide-dialog.ts (mod: earning line)
tests/e2e/sticker-book.spec.ts (new, 4 projects)
```
No `shop/` import anywhere in this phase. No store change. No save-code
change.

## Related code files
- Modify: `quest-chain.ts`, `guide-dialog.ts`.
- Create: files above.
- Delete: none.

## Implementation Steps
1. Derivation module first, RED/GREEN (fresh / box 3 / box 4 / table
   70% boundary / old-save stats).
2. Book UI (pages, flip, counts, ≥ 44 px targets); quest-card button +
   VLM entry.
3. Earning line (ephemeral per-session announcement; verify it fires
   once per unit per session and never blocks play).
4. E2E on 4 projects with seeded stats.
5. Lint, typecheck, unit, build, golden `--check` (dialog-only change).

## Todo list
- [ ] sticker derivation (pure, unit-tested)
- [ ] book UI (6 pages, tap flip, counts)
- [ ] quest-card + VLM entry
- [ ] earning line (once per unit per session)
- [ ] e2e, 4 projects

## Success Criteria
- 47 stickers, 6 pages, all derived — no sticker field in the store, the
  save code or IndexedDB (grep proves it).
- A child who already mastered a table before this ships opens the book
  and sees that sticker already earned (derivation from old boxes).
- Book fully usable by tap on phone + both tablet projects; never opens
  during a level run; earning a sticker never interrupts play.
- Cosmetic only: no gate, price, coin or XP reads the sticker state
  (grep: no importer outside `ui/` + the derivation's own tests).

## Scope Contract
- Changed: sticker derivation + book UI + two entry points + e2e spec.
- Impacted: quest card (one button), guide dialog (one line).
- Will verify: unit (derivation incl. boundaries), e2e (4 projects),
  golden check, a grep audit for `shop/` imports and sticker-state
  consumers.
- Deliberately skipped: new sticker art assets (stickers reuse the
  existing emoji/icon set — `src/ui/icons.ts`; no new image files), any
  shop integration, any reward tied to stickers, any social/sharing
  feature.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| 70% table threshold feels arbitrary to the author | L | M | One constant, `TABLE_STICKER_SHARE = 0.7`; the author can move it in review without redesign |
| Earning line fires repeatedly / interrupts play | M | M | Ephemeral per-session set; toast/line only, never a modal; e2e asserts at most one announcement per unit |
| Book page grouping confuses (a skill's topic is arguable) | L | L | Topic per skill follows the catalog `family` + lesson; the grouping is a data table, one-line moves |

## Security Considerations
- None: derived display-only state, no input, no network.

## Next steps
- 07 finalises the quest-card button copy; 08 checks the book on iPad
  with the author.
