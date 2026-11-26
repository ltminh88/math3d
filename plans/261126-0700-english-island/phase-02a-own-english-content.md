# Phase 2A: own English content for stages 1–8

## Context links
- Parent: [plan.md](plan.md)
- Depends on: [Phase 1A](phase-01a-island-region-level-shell.md) (lane order), [Phase 0](phase-00-shared-contracts.md) (types)
- Docs: `docs/code-standards.md` (content rules), `AGENTS.md`

## Overview
- Date: 2026-11-26
- Description: our own word bank, topics, patterns, units and SVG pictures for 8 stages
  (blocks A–D, E–H+R1, I–L+R2, M–P+R3, Q–T+R4, U–X+R5, Y–Z+R6, A–Z review).
- Priority: P2
- Implementation status: pending
- Review status: not reviewed (reviewer reads the content to confirm it is ours)
- Owner: Lane A, muse-88
- Effort: 1d

## Key Insights
- The repo is public: words, topic/pattern lists, our own sentences, emoji/SVG pictures only.
- Muses never open `English /`; Phase 4's overlap check catches accidental matches.
- Content is data only and loads with the island chunk, so the main chunk does not grow.

## Requirements
- Functional
  - `word-bank.ts`: per letter, words with a Vietnamese gloss and an emoji/SVG picture or `null`.
  - `topics.ts`: the 12 topic sets; `patterns.ts`: the 7 patterns, each ≥ 6 of our own
    3–6-word sentences; `units.ts`: units mapped to stages; `svg-pictures.ts`.
- Non-functional: main chunk unchanged within 2 kB; files < 200 lines (split the word bank by
  letter block if needed).

## Architecture
- Content modules export plain data typed by Phase 0; generators (1B) read them through `units.ts`.
- `content-schema.test.ts` is the gate for references and item shape.

## Related code files
- Create (all new) in `src/english/content/`
  - `word-bank.ts` (split as `word-bank-a-h.ts` etc. if > 200 lines)
  - `topics.ts`, `patterns.ts`, `units.ts`, `svg-pictures.ts`
  - `content-schema.test.ts`
- Modify: `src/english/content/seed-unit-1.ts` (from Phase 0) only if stage 1 moves into `units.ts`
- Delete: none

## Implementation Steps
1. Claim on #11; branch `muse/...` from main after Phase 0 and 1A merge.
2. Write the word bank by letter block with glosses and pictures.
3. Write topics, patterns (own sentences), units per stage, SVG pictures.
4. Write `content-schema.test.ts`:
   - every referenced id exists;
   - ≥ 4 own items per skill;
   - `order-words` sentences have one correct order;
   - `fill-pattern`: 1 blank, 2–4 options;
   - no listen item without a picture.
5. Check main chunk size against main.
6. Gates; PR; reviewer reads the content.

## Todo list
- [ ] Word bank (26 letters)
- [ ] 12 topics
- [ ] 7 patterns with ≥ 6 sentences each
- [ ] Units for 8 stages
- [ ] SVG pictures
- [ ] Schema test
- [ ] Chunk size check, PR

## Success Criteria
- Schema test green; every skill has ≥ 4 own items.
- Main chunk within 2 kB of main; reviewer confirms all content is ours.

## Risk Assessment
- Unintended overlap with book sentences. Mitigation: write sentences fresh; Phase 4
  `check-overlap.mjs` runs before every deploy.
- Ambiguous word order (two valid orders). Mitigation: schema test checks uniqueness.

## Security Considerations
- Public repo: copyright is the risk, not secrets. No book text, no book pictures.

## Next steps
- Phase 2C (audio clips for this content); feeds Phase 6.
