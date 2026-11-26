# English Island: phases

Every PR passes the AGENTS.md gates: lint, typecheck, vitest, build, golden `--check`, and
Playwright on all 4 projects (desktop, mobile-pixel, tablet-portrait, tablet-landscape). Touch
projects use `tap()` only, and targets are at least 44 px.

## Phase 0: shared contracts (one Muse, merged first)
- **Owned files (new)**
  - `src/english/english-types.ts`: `EnglishWord`, `EnglishUnit`, `EnglishTopic`,
    `EnglishPattern`, and an `EnglishItem` union over the kinds `listen-pick-picture |
    match-pairs | order-words | fill-pattern | letter-pick`. Each item carries `skillId` and
    `source:'own'|'pack'`.
  - `src/english/english-skill-entries.ts`: 41 ids:
    - `en-letters-{ad,eh,il,mp,qt,ux,yz}` and `en-alphabet-order`
    - `en-sounds-*` and `en-words-*`
    - `en-topic-{numbers,animals,colours,shapes,body,fruit,time,face,feelings,vegetables,routines,nature}`
    - `en-sent-{how-many,oclock,feelings,this-is,colour-is,routine,i-see}`
  - `src/english/english-pack-contract.ts`:
    - Endpoint `POST /api/english-pack`, body `{passphrase, part:'items'|'images', stage?}`.
    - Responses: 200, 401 `bad-passphrase`, 503 when the env var is missing. All `no-store`.
    - A pure `isEnglishPack()` validator.
  - `src/english/content/seed-unit-1.ts`: stage 1, our own content.
  - `src/english/fixtures/synthetic-pack.ts`: made-up words and SVG data URIs, no book text.
  - `src/ui/english/english-run.ts`: stub `startEnglishRun(port)`. Lane B owns it afterwards.
- **Shared edits (append-only, done once here)**
  - `skill-entry.ts`: add `'english'`.
  - `skill-catalog.ts` and its test: append the English entries.
  - `kntt-lesson-index.test.ts`: exempt `'english'`.
  - `sticker-book.ts`: add an `'english'` topic.
  - `.gitignore`: add `/English */`.
- **Accept:** no runtime UI change, golden byte-identical, all gates green.

## Phase 1A: region, level shell, gate, map (Lane A)
- **Owned files**
  - `src/config/expansion-{regions,roads,signposts,region-strings}.ts`
  - `src/config/level-gate-config.ts`
  - `src/world/regions/island-region-builder.ts`, `expansion-world-builder.ts`,
    `expansion-scatter-clearing*.ts`
  - `src/levels/island/**`, `src/levels/shared/level-host-strings.ts`
  - `src/store/save-code-v3-payload.ts` (`M3D3_LEVELS`)
  - `src/ui/quest-chain*.ts`, only if the author wants the island in the chain
  - e2e: `island-level.spec.ts`, `island-level-leak.spec.ts`, `level-draw-calls.spec.ts`,
    region spec
- **Region:** icon 🏝️. A baked islet (pond ring, sand, palms, plank bridge) sits on walkable
  ground, placed with the free-ground probe. `requires: 'bridge'`, `stages: 8`, `rounds: 8`,
  `tables: [2]` with a comment (as in numberfort).
- **Accept:**
  - Golden and `REGIONS` tests untouched. Draw calls at most 60.
  - Save-code round trip keeps `island`.
  - The PR has the `parity-change` label.

## Phase 2A: own content (Lane A)
- **Files in `src/english/content/**`**
  - `word-bank.ts`: per letter, each word with a vi gloss and an emoji/SVG picture, or `null`.
  - `topics.ts`: the 12 topic sets.
  - `patterns.ts`: the 7 patterns, each with at least 6 of our own 3–6-word sentences.
  - `units.ts`: units mapped to stages.
  - `svg-pictures.ts`.
- **Tests (`content-schema.test.ts`)**
  - Every referenced id exists.
  - At least 4 own items per skill.
  - `order-words` sentences have a unique correct order.
  - `fill-pattern` items have 1 blank and 2–4 options.
  - No listen item without a picture.
- **Accept:** main chunk size unchanged within 2 kB. The reviewer reads the content to confirm
  it is our own.

## Phase 2C: audio clips (Lane A, after 2A)
- **`tools/english-audio/generate-clips.mjs`:** generates one clip per word, letter name and
  sentence in our own content, offline with an open-source TTS (Piper or similar).
  - Use a voice whose license allows redistribution. Name the license in the PR.
- **Output:** `public/english-audio/<id>.mp3` (mp3 for iOS), plus `src/english/content/audio-map.ts`.
  - Clips load lazily and stay out of the SW precache. Total size goes in the PR body.
- **Tests:** every listen item has a clip in the map, and the generator is deterministic.
- **Speaker order (Phase 3B):** clip first, then Web Speech en-US. With neither available, the
  item becomes a read item with a parent notice.

## Phase 1B: engine and exercise UI (Lane B)
- **`src/english/engine/**`** (pure, no DOM and no `three`)
  - `item-planner.ts`: weakest-first by Leitner, seeded, never the same item twice in a row.
  - `item-generators.ts`: tier set by `skillTierOf(box)`; 3 choices, then 4 with confusable
    letters (b/d, p/q), then listen-only.
  - `answer-check.ts`.
  - `english-wrong-feedback.ts`: gentle Vietnamese feedback that never gives the answer.
- **`src/ui/english/**`**
  - Widgets: picture-choice-grid, tap-pair-matcher, word-tile-order, fill-choice,
    letter-choice.
  - `english-strings.ts`, namespace `english-island`. English words render with `lang="en"
    translate="no"` and never go through `t()`.
- **Reuse:** ui-button, aria-announcer, step-miss-budget (reveal after 3 misses), hint-ladder,
  level-run-tally, and `learning.record` with `sk:en-*`.
- **E2E (`english-exercises.spec.ts`):** drives every kind by tap through
  `window.__game.island.currentAnswer()` (test builds only).

## Phase 3B: speech and pack client (Lane B)
- **`english-speaker.ts`**
  - `pickVoice(...,'en')`, en-US, rate 0.8, `cancel()` before each `speak`.
  - Speaks only after a tap on the "🔊 Nghe" button.
  - With no voice or muted: text fallback, plus one notice for the parent.
- **`src/english/pack/pack-client.ts` and `pack-storage.ts`**
  - Own IndexedDB database (not the game store). Remembers the passphrase and the pack, and
    works offline.
  - A 401 clears the stored passphrase.
- **`pack-unlock-dialog.ts`:** "Phụ huynh" button → "Mật khẩu gia đình" input.
- **Tests**
  - Unit: fake fetch for 200, 401, 503, offline, and a malformed body.
  - E2E (`english-pack-unlock.spec.ts`): `page.route` with the synthetic fixture, plus a
    speechSynthesis fake. No request before a passphrase is entered.

## Phase 6: English in daily practice (Lane B)
- `ui/practice-run.ts` renders `sk:en-*` keys through the English widgets (`isKeyRenderable` is
  true for English).
- Practice mixes at most 2 English items per run. If the island is still locked, no English
  items appear.
- E2E: a practice run with seeded English stats shows an English item and can be answered by tap.

## Phase 4: deploy side (reviewer only)
1. Preview-deploy a dummy `api/english-pack.mjs`. Check that the function runs, that its source
   is not served, and that the SPA rewrite does not catch it. If that fails, fall back to the
   Build Output API with `--prebuilt`.
2. `tools/english-pack/pack-handler.ts` (committed, our code only):
   - SHA-256 plus `timingSafeEqual`, a 500 ms delay on failure, no body logging,
     `private, no-store`.
   - Images served per stage, under 4.5 MB.
3. `tools/english-pack/build-pack.mjs`: `English /pack-src/` → `English /pack.json`.
4. `tools/english-pack/emit-pack-function.mjs <deployDir>`: fails if any static file contains
   pack strings.
5. `tools/english-pack/check-overlap.mjs`: fails if any repo sentence equals a pack sentence.
6. Config: `public/vercel.json` (exclude `/api/` from the rewrite, `no-store` headers),
   `vite.config.ts` `navigateFallbackDenylist: [/^\/api\//]`, and the env var
   `ENGLISH_PACK_PASSPHRASE`.
7. Deploy command gains `node tools/english-pack/emit-pack-function.mjs .preview/deploy` before
   the `vercel deploy` step.
- **Accept:**
  - curl returns 401 without the passphrase or with a wrong one, and 200 with the right one.
  - No static URL exposes the pack, and the SW precache has no `api/`.
  - Works offline after unlock.

## Phase 5: parity and docs (reviewer)
- `npm run parity:baselines` after 1A and 1B merge.
- Update `docs/code-standards.md` (the `english/` layer and the content rule),
  `docs/deployment-guide.md` (pack step and env var), and the changelog.
