# Phase 1: engine per-book split

## Context links
- Parent: [plan.md](plan.md)
- Depends on: parent Phase 2A (PR #85, muse-min) merged — it edits `english-run.ts` (`unitForStage`)
- Research: [researcher-02](research/researcher-02-codebase-modes-and-second-island-report.md) §C
- Docs: `docs/code-standards.md` (200-line rule, layering), `AGENTS.md`

## Overview
- Date: 2026-11-26
- Description: make the English engine book-aware through one `EnglishBook` descriptor; CEC
  becomes book `cec`, no behaviour change. Split `english-run.ts` (420 lines) under 200 lines.
  Extract the island scene into a shared English level scene so `look` is a thin shell.
  Pin the Look contract (skill ids, prompt field, pack `book` field, storage key per book).
- Priority: P2 (blocks 3 wiring, 4, 6, parent 6)
- Implementation status: pending
- Owner: muse-min (owns 1B/3B engine + widgets)
- Effort: 1d

## Key Insights
- `startEnglishRun(port)` already only needs `{stage, ui, learning, signal}`; add `book` to the port.
- CEC-specific spots: `english-types.ts:7` blocks, `english-skill-entries.ts:9-19`,
  `english-pack-contract.ts:15`, `pack-storage.ts:42` (`'current'`), `island-stage-plan.ts`,
  `english-test-hook.ts:52,76` (`levelId:'island'`).
- `order-words` and `fill-pattern` already exist; Look needs only an optional question `prompt`.
- Pack storage key: CEC keeps `'current'` (back-compat with already-unlocked devices), Look uses `'look'`.
- Phase 1 does NOT register Look skills in the catalog (that would surface empty stickers early);
  it only pins the id list and type. Phase 4 registers them.

## Requirements
- Functional
  - `src/english/english-books.ts`: `EnglishBook {id:'cec'|'look', levelId:'island'|'look',
    stages, rounds, stageNames, skillIds, unitForStage, packKey, spelling:'en-GB'|'en-US'}`;
    `ENGLISH_BOOKS.cec` filled from today's code; `ENGLISH_BOOKS.look` with placeholder content
    (one seed unit) so 3 and 4 build against it.
  - `EnglishRunPort.book`; run reads units, skills and pack key from the book.
  - `LOOK_SKILL_IDS` + `EnglishSkillId` widened with `en-look-*` literal union (ids fixed here,
    list in Phase 4 Key Insights).
  - `FillPatternItem.prompt?` / `OrderWordsItem.prompt?` (question line); widgets render it.
  - Pack contract: request + pack gain optional `book` (absent = `cec`); validator checks a
    pack's skill ids against that book; `ENGLISH_PACK_STAGES` stays 1–8.
  - `pack-storage.ts`: record per `book.packKey`; unlock dialog asks for the run's book.
  - Shared scene: `levels/shared/english-level-scene.ts` (book + diorama builder + strings in,
    `LevelModule` out); `island-scene.ts` becomes a ~20-line call into it.
  - Test hook commits `book.levelId`, not a literal `'island'`.
- Non-functional: zero behaviour change for CEC (all island e2e + unit tests green unchanged);
  every touched file < 200 lines; main chunk within 2 kB.

## Architecture
```
levels/island/index.ts ─┐                     ┌─ english/english-books.ts (cec, look)
levels/look/index.ts  ──┴→ shared/english-level-scene.ts → ui/english/english-run.ts
                                                            ├ english-run-round.ts (one round)
                                                            ├ english-run-widgets.ts (mount by kind)
                                                            └ english-run-speech.ts (speak text, gloss)
```

## Related code files
- Create: `src/english/english-books.ts` (+ test), `src/english/look-skill-ids.ts`,
  `src/ui/english/english-run-round.ts`, `english-run-widgets.ts`, `english-run-speech.ts`,
  `src/levels/shared/english-level-scene.ts`
- Modify: `src/ui/english/english-run.ts`, `english-test-hook.ts`, `fill-choice.ts`,
  `word-tile-order.ts`, `pack-unlock-dialog.ts`; `src/english/english-types.ts`,
  `english-pack-contract.ts` (+ test), `pack/pack-storage.ts` (+ test), `pack/pack-client.ts`;
  `src/levels/island/island-scene.ts`, `island-test-hook.ts`
- Do not touch: `src/english/content/**` (2A), `audio-map.ts` (2C), `daily-planner.ts` (parent 6)
- Delete: none

## Implementation Steps
1. Claim on #11 after #85 merges; branch `muse-min/english-book-split` from latest main.
2. Write `english-books.ts` with `cec` mirroring today's constants; unit test: cec descriptor
   equals the old constants (stages 8, rounds 8, 41 skill ids, pack key `'current'`).
3. Split `english-run.ts` by responsibility (round loop / widget mount / speech+gloss); move code,
   no logic edits; add `book` to the port.
4. Add `prompt?` to fill/order items + render it in the two widgets (≥ 44 px targets unchanged).
5. Pin `LOOK_SKILL_IDS` and widen the type; `ENGLISH_BOOKS.look` placeholder.
6. Pack: optional `book` in contract + validator; storage keyed by `packKey`; tests for
   "old record under `'current'` still loads as cec".
7. Extract `english-level-scene.ts`; island scene calls it with `ENGLISH_BOOKS.cec`.
8. Gates: lint, typecheck, vitest, build, golden `--check`, Playwright 4 projects (island specs).
9. PR without `parity-change` (no UI change); update #11.

## Todo list
- [ ] Book descriptor + test
- [ ] `english-run.ts` split < 200 lines each
- [ ] Prompt line on fill/order items
- [ ] Look skill ids pinned (not registered)
- [ ] Pack contract `book` + per-book storage key + tests
- [ ] Shared English level scene; island uses it
- [ ] All gates green; PR

## Success Criteria
- All existing island unit/e2e tests pass unchanged; no parity shot changes.
- `wc -l` of every touched file < 200; `ENGLISH_BOOKS.look` compiles against the same run.
- A device with a pack under `'current'` still shows it unlocked for CEC.

## Risk Assessment
- Rebase pain with 2A/2C. Mitigation: start only after #85 merges; never edit content/audio-map.
- Hidden behaviour change in the split. Mitigation: move-only commits first, then the `book`
  param in a separate commit; island e2e as the safety net.
- Pack migration: wrong key loses an unlocked pack. Mitigation: cec key stays `'current'`.

## Security Considerations
- No pack data in the repo; the contract holds only shapes and the env var name.

## Next steps
- Unblocks Phase 3 wiring, Phase 4 content, Phase 6 function, and parent Phase 6.
