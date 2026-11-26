# Phase 6: per-book pack function

## Context links
- Parent: [plan.md](plan.md)
- Depends on: Phase 1 (contract `book` field, per-book storage key), parent
  [Phase 4](../261126-0700-english-island/phase-04-book-pack-function-deploy.md) shipped (function,
  rewrites, SW denylist, deploy command)
- Docs: `docs/deployment-guide.md`

## Overview
- Date: 2026-11-26
- Description: one `/api/english-pack` function serves both books; `build-pack.mjs` and
  `check-overlap.mjs` run per book; a local Look pack source next to the CEC one.
- Priority: P2 (Look works fully on own content without it)
- Implementation status: pending
- Owner: reviewer only (Muses never open `English /`)
- Effort: 0.75d

## Key Insights
- Phase 1 already made the client book-aware: request `book` (absent = `cec`), storage key
  `'current'` for CEC, `'look'` for Look. This phase is server + build tooling only.
- Look has 8 stages (Q1), so `ENGLISH_PACK_STAGES` 1–8 and per-stage image parts stay as they are.
- One passphrase covers both books (one family); a book the deploy has no pack for → 503
  `pack-unavailable`, never 500.
- Hobby limits unchanged: < 4.5 MB per response → images per stage per book.

## Requirements
- Functional
  - `pack-handler.ts`: validate `book ∈ {'cec','look'}` (whitelist; anything else 400); pick the
    inlined pack for that book; same timing-safe compare, delay, `no-store`, no body logging.
  - `build-pack.mjs --book look` reads the local Look source folder and writes the local Look
    pack JSON; validator = `isEnglishPack` with the Look skill ids.
  - `emit-pack-function.mjs` inlines both packs (either may be absent); static-leak scan covers
    both.
  - `check-overlap.mjs` per book: no repo sentence equals a pack sentence of the same book.
- Non-functional: response sizes asserted per book/stage; deploy command gains no new flags.

## Architecture
- `English /<cec src>` + `English /<look src>` → `build-pack.mjs --book …` → two local pack
  JSONs → `emit-pack-function.mjs` → `api/english-pack.mjs` `{cec, look}` literals →
  `POST {passphrase, part, stage?, book?}` → handler → pack part.

## Related code files
- Modify: `tools/english-pack/pack-handler.ts` (+ test), `build-pack.mjs`,
  `emit-pack-function.mjs`, `check-overlap.mjs`
- Never commit: `English /**`, generated `api/english-pack.mjs`, local pack JSONs
- Delete: none

## Implementation Steps
1. Handler: `book` whitelist + per-book lookup; tests: cec default, look ok, unknown book 400,
   missing look pack 503, wrong passphrase 401/403 for both books.
2. `build-pack.mjs --book look`; author places the Look source in the local folder (reviewer
   builds the per-unit items from the book there, grouped into the 8 stages of Q1).
3. `check-overlap.mjs` per book against `src/english/content/**` (CEC) and `content/look/**`.
4. Emit + leak scan for both; dummy-pack preview + the 5 curl checks repeated with `book:'look'`.
5. Preview deploy; unlock Look on a tablet → Look stage plays pack items; CEC pack still loads.
6. Production only on "deploy đi".

## Todo list
- [ ] Handler per book + tests
- [ ] `build-pack.mjs --book look`
- [ ] Overlap check per book
- [ ] Emit both + leak scan
- [ ] Preview curl checks for both books
- [ ] Prod deploy on "deploy đi"

## Success Criteria
- curl: wrong passphrase 401/403, right one 200 for both books; unknown book 400.
- No static file holds pack strings of either book; SW precaches no `api/`.
- A device unlocked before this phase keeps its CEC pack.

## Risk Assessment
- Function bundle grows with two packs. Mitigation: size assert; 250 MB limit far away.
- Overlap check misses paraphrase. Mitigation: it guards exact sentences; own content is written
  only from researcher-01 templates.

## Security Considerations
- Pack gated, not encrypted; passphrase only in env + POST body; `book` whitelisted so it cannot
  pick an arbitrary key or path.

## Next steps
- Phase 7 documents the per-book pack build.
