# Phase 4: Look own content, skills, stickers

## Context links
- Parent: [plan.md](plan.md)
- Depends on: Phase 1 (book descriptor, `LOOK_SKILL_IDS`, `prompt` field); e2e needs Phase 3;
  parent Phase 6 merged first (it owns `sticker-book-strings.ts`, same lane)
- Research: [researcher-01](research/researcher-01-look1-book-report.md) (topics, word load,
  our own pattern templates — the only source; never open `English /`)
- Pattern: parent [Phase 2A](../261126-0700-english-island/phase-02a-own-english-content.md)

## Overview
- Date: 2026-11-26
- Description: our own Look content for 8 stages (Q1): word bank by unit with Vietnamese glosses
  and emoji/SVG pictures, our own sentences on the pattern templates, question prompts for
  fill/order items, phonics keys; register `en-look-*` skills; a "Look 1" sticker page.
- Priority: P2
- Implementation status: pending
- Owner: muse-min
- Effort: 1.5d

## Key Insights
- Stage plan (Q1): 1 Starter (numbers 1–10, colors, big/small, greetings) · 2 U1–2 (school things,
  toys) · 3 U3–4 (people, family) · 4 U5–6 (body, home) · 5 U7–8 (town, farm animals + can) ·
  6 U9–10 (clothes, food) · 7 U11–12 (beach, free time) · 8 review (all + reading-extra words).
- Skill ids (pinned in Phase 1, appended here, never reordered): `en-look-starter-numbers`,
  `en-look-starter-colors`, `en-look-starter-greetings`, `en-look-u{1..12}-words`,
  `en-look-u{1..12}-pattern`, `en-look-phonics-initial`, `en-look-phonics-short-vowels` → 29 ids.
- Look is topic + grammar driven: per stage ~8 rounds = 2× listen→picture, 1× match pairs,
  1× pattern pick (fill with question prompt, e.g. prompt "What's this?" → "It's a ___."),
  1× order-words (≤ 4 tiles), 1× phonics letter-pick, 2× mixed review.
- American spelling (Q2): color, favorite, mom, eraser, pants, candy, soccer.
- CEC overlap (A–Z initial sounds): Look phonics is its own skill pair, so Leitner moves fast for a
  child who already finished CEC; no cross-book skill sharing.

## Requirements
- Functional
  - `src/english/content/look/`: `look-word-bank-*.ts` (by unit, split < 200 lines),
    `look-patterns.ts` (own sentences + question prompts), `look-units.ts` (stage → pool),
    `look-svg-pictures.ts` (only where no emoji fits, e.g. eraser, verb phrases U12).
  - `ENGLISH_BOOKS.look` points at the real units (replaces the Phase 1 placeholder).
  - 29 `en-look-*` entries appended to the skill catalog (family `'english'`, `lessons: []`).
  - Sticker page "Look 1" (labels per unit skill pair) next to the CEC page.
  - `content-schema` test for Look: every referenced id exists; ≥ 4 own items per skill;
    `order-words` has one correct order and ≤ 4 tiles; every fill item has 2–3 options incl.
    the answer; every word en-US spelled per a small allow-list; no item sentence is taken from
    the book (reviewer's `check-overlap.mjs` confirms at deploy).
- Non-functional: content lazy-loaded inside the Look chunk; no network; strings vi first.

## Architecture
- Content data (pure, node-testable) → `ENGLISH_BOOKS.look.unitForStage` → shared run (Phase 1)
  → widgets. Stickers derived from Leitner boxes as today (`sticker-book.ts`).

## Related code files
- Create: `src/english/content/look/**` (+ `look-content-schema.test.ts`)
- Modify: `src/english/english-books.ts` (look entry), `src/english/english-skill-entries.ts`
  (append), `src/ui/sticker-book-strings.ts` + the sticker page module (after parent 6 merges),
  `src/levels/look/look-stage-plan.ts` names (coordinate with Phase 3 owner on #11)
- Do not touch: `src/english/content/*.ts` of CEC (2A), `audio-map*.ts` (2C / Phase 5)
- Delete: none

## Implementation Steps
1. Claim on #11 after Phase 1 and parent 6 merge; branch `muse-min/english-look-content`.
2. Word bank per unit (core words, glosses, pictures) from the researcher-01 topic table — our
   own word choice, no book page order or captions.
3. Patterns: own sentences on the 12 templates; question prompts for fill/order items.
4. Units: stage → word/pattern pool per Q1 grouping; review stage draws from all.
5. Append the 29 skill entries; save-code round trip keeps `sk:en-look-*`.
6. Sticker page "Look 1" + strings.
7. Schema test; e2e: play Look stage 1 to the end by tap (needs Phase 3), stars recorded under
   `levelProgress.look`, skills under `sk:en-look-*`.
8. Gates; PR `parity-change` (sticker book shot).

## Todo list
- [ ] Word bank per unit (en-US)
- [ ] Own patterns + question prompts
- [ ] Units → 8 stages
- [ ] 29 skill entries appended + round trip
- [ ] "Look 1" sticker page
- [ ] Schema test + e2e Look stage 1
- [ ] PR `parity-change`

## Success Criteria
- Each of the 8 stages plays 8 rounds of own content; no empty skill.
- Old save codes still decode; new code keeps `en-look-*` stats.
- Look stickers appear only after Leitner box 4+ on a Look skill.

## Risk Assessment
- U12 verb phrases lack emoji. Mitigation: simple SVG pictures or use listen + text choices.
- Accidental copy of book sentences. Mitigation: work only from researcher-01; overlap check
  per book at deploy (Phase 6).
- Daily practice pulls Look items before the gate opens. Mitigation: parent 6 lock filter by
  `book.levelId` gate (Phase 1 makes it book-aware).

## Security Considerations
- Public repo: own content only; nothing from `English /`.

## Next steps
- Phase 5 generates clips for this content; Phase 6 adds the Look pack.
