# Phase 0: shared contracts

## Context links
- Parent: [plan.md](plan.md)
- Depends on: none (merges first; Phase 1A runs in parallel, see below)
- Docs: `docs/code-standards.md` (layering, strings, tests), `AGENTS.md` (gates, Muse board #11)
- Research: none needed

## Overview
- Date: 2026-11-26
- Description: types, skill ids, content schema, pack API contract, synthetic fixture and a stub
  `startEnglishRun`. No runtime UI change.
- Priority: P2 (blocks 1B, 2A, 3B, 6)
- Implementation status: assigned (message R51, branch `muse-min/english-contracts`)
- Review status: not reviewed
- Owner: Lane B, muse-min
- Effort: 0.5d

## Key Insights
- Every later phase imports these files, so they must merge before 1B/2A start; 1A only needs
  `startEnglishRun` at its rebase step.
- Shared files (`skill-catalog.ts`, `sticker-book.ts`, `.gitignore`) are edited once here,
  append-only, so the lanes never touch them again.
- `/English */` is already in `.git/info/exclude` locally; adding it to `.gitignore` protects
  every worktree and every Muse clone.
- The synthetic pack is made up from scratch: it never contains book text.

## Requirements
- Functional
  - `EnglishItem` union over `listen-pick-picture | match-pairs | order-words | fill-pattern |
    letter-pick`; each item carries `skillId` and `source: 'own' | 'pack'`.
  - 41 `en-*` skill ids (letters, alphabet order, sounds, words, 12 topics, 7 sentence patterns).
  - Pack contract: `POST /api/english-pack`, body `{passphrase, part: 'items'|'images', stage?}`;
    responses 200, 401 `bad-passphrase`, 503 when the env var is missing; all `no-store`.
  - Pure `isEnglishPack()` validator.
- Non-functional: pure logic (no DOM, no `three`), runs under Vitest node; files < 200 lines;
  golden `--check` byte-identical.

## Architecture
- `src/english/` is a new pure-logic layer, like `reasoning/` or `time/`.
- `src/ui/english/english-run.ts` is the single UI entry point; the level shell (1A) calls it,
  the engine/UI (1B) fills it.
- Skill family `'english'` plugs into the existing Leitner `factStats`; entries use `lessons: []`.

## Related code files
- Create
  - `src/english/english-types.ts` (new)
  - `src/english/english-skill-entries.ts` (new)
  - `src/english/english-pack-contract.ts` (new) + `english-pack-contract.test.ts` (new)
  - `src/english/content/seed-unit-1.ts` (new): stage 1, our own content
  - `src/english/fixtures/synthetic-pack.ts` (new): made-up words, SVG data URIs
  - `src/ui/english/english-run.ts` (new): stub `startEnglishRun(port)`
- Modify (append-only)
  - `src/learning/skill-entry.ts`: add family `'english'`
  - `src/learning/skill-catalog.ts`, `src/learning/skill-catalog.test.ts`: append entries
  - `src/learning/kntt-lesson-index.test.ts`: exempt `'english'`
  - `src/learning/sticker-book.ts`: add `'english'` topic
  - `.gitignore`: add `/English */`
- Delete: none

## Implementation Steps
1. Read board #11, `AGENTS.md`, `git log --oneline -15 origin/main`; claim the lane row.
2. Write `english-types.ts` with the union and shared word/unit/topic/pattern types.
3. Write `english-skill-entries.ts` (41 ids) and append them to `SKILL_CATALOG`.
4. Add `'english'` to `skill-entry.ts`; exempt it in `kntt-lesson-index.test.ts`.
5. Write `english-pack-contract.ts`: endpoint, request/response types, error codes,
   `isEnglishPack()`; unit-test valid, missing-field and wrong-type bodies.
6. Write `seed-unit-1.ts` and `synthetic-pack.ts` (both pass `isEnglishPack`/schema checks).
7. Stub `startEnglishRun(port)` that resolves a finished run with 0 rounds.
8. Add the `'english'` sticker topic; add `/English */` to `.gitignore`.
9. Run all AGENTS.md gates; open PR; watch CI.

## Todo list
- [ ] Types and item union
- [ ] 41 skill ids + catalog append + catalog test
- [ ] Pack contract + validator + tests
- [ ] Seed unit 1 + synthetic fixture
- [ ] Stub `startEnglishRun`
- [ ] Sticker topic, `.gitignore`, kntt exemption
- [ ] Gates green, PR open, board updated

## Success Criteria
- No runtime UI change; golden byte-identical; lint, typecheck, vitest, build, Playwright
  (4 projects) green.
- `isEnglishPack(syntheticPack) === true`; malformed bodies rejected.

## Risk Assessment
- Contract churn after merge forces rebases in both lanes. Mitigation: review the item union
  and pack shape with the reviewer before opening the PR.
- Catalog test counts change. Mitigation: update the count in the same PR.

## Security Considerations
- No book content anywhere; fixture is synthetic. Muses never open `English /`.
- The contract holds no passphrase or secret, only the env var name.

## Next steps
- Unblocks 1B, 2A (via 1A), 3B, 6; Phase 1A rebases to wire `startEnglishRun`.
