---
title: "Đảo Tiếng Anh (English Island)"
description: "New map region with Pre-A1 phonics/vocab exercises; own content in repo, optional book pack behind a family passphrase"
status: pending
priority: P2
effort: 7.5d
branch: main
tags: [english, region, level, content, vercel-function]
created: 2026-11-26
---

# Đảo Tiếng Anh

Twelfth region, level id `island`. Item kinds: listen→pick picture, word↔picture match, word
ordering, fill-the-pattern, letter/sound. UI in Vietnamese, the child is "bạn". Works fully on
our own content; a family passphrase unlocks a local-only book pack served by a Vercel function.
Every PR passes the AGENTS.md gates (lint, typecheck, vitest, build, golden `--check`,
Playwright on 4 projects, `tap()` only, targets ≥ 44 px).

## Phases
| # | Phase | Owner | Depends | Effort | Status |
|---|---|---|---|---|---|
| 0 | [Shared contracts](phase-00-shared-contracts.md) | Lane B, muse-min (R51, `muse-min/english-contracts`) | — | 0.5d | assigned |
| 1A | [Region, level shell, gate, map](phase-01a-island-region-level-shell.md) | Lane A, muse-88 (R52, `muse/english-island-region`) | 0 (rebase only) | 1d | assigned |
| 1B | [Engine + tap-only UI](phase-01b-exercise-engine-and-ui.md) | Lane B, muse-min | 0 | 1.5d | pending |
| 2A | [Own content, stages 1–8](phase-02a-own-english-content.md) | Lane A, muse-88 | 1A | 1d | pending |
| 2C | [Audio clips](phase-02c-audio-clips.md) | Lane A, muse-88 | 2A | 0.75d | pending |
| 3B | [Speech + pack client](phase-03b-speech-and-pack-client.md) | Lane B, muse-min | 1B | 1d | pending |
| 6 | [English in daily practice](phase-06-english-in-daily-practice.md) | Lane B, muse-min | 3B, 2A | 0.5d | pending |
| 4 | [Book pack function + deploy](phase-04-book-pack-function-deploy.md) | reviewer | 3B | 1d | pending |
| 5 | [Parity + docs](phase-05-parity-and-docs.md) | reviewer | 1A, 1B (docs after 4) | 0.25d | pending |

Lane A (muse-88): 1A → 2A → 2C. Lane B (muse-min): 0 → 1B → 3B → 6. Reviewer: 4, 5.
Phase 1A runs in parallel with Phase 0 (region, map, gate first), then rebases to wire
`startEnglishRun` once Phase 0 merges.

## Author decisions (fixed)
- **Repo:** public; holds only our own content (words, topic/pattern lists, own sentences,
  emoji/SVG pictures).
- **Book content:** verbatim only in the local, git-excluded `English /` folder; bundled at
  deploy into a passphrase-gated function. Muses never open `English /`.
- **Gate:** opens after the bridge; side region outside the math quest chain.
- **Stickers:** an English sticker page.
- **Daily practice:** at most 2 English items per run, only once the island is unlocked (Phase 6).
- **Voice:** pre-generated MP3 clips first (Kokoro `af_heart`, fallback Piper ljspeech-high),
  Web Speech en-US as fallback. Muted game → "bật âm thanh" prompt, never a silent skip.
  Neither clip nor voice → the item becomes a read item.
- **Deploy:** zero-config `api/english-pack.mjs` emitted into `.preview/deploy/`, same command;
  Build Output API v3 `--prebuilt` is the fallback.
- **Out of scope:** Supabase and the parent dashboard (paused).

## Design notes
- Region follows the chapter 2/3 expansion pattern; `REGIONS`, `ROADS`, `WALKABLE_BOUNDS`
  untouched, golden byte-identical.
- Skills: Leitner `factStats`, family `'english'`, 41 `en-*` entries with `lessons: []`.
  "Học tiếp" stays math-only.
- Stages: 8 (A–D, E–H+R1, I–L+R2, M–P+R3, Q–T+R4, U–X+R5, Y–Z+R6, A–Z review), 8 rounds per run.

## Key risks
- **Speech:** iOS needs a tap (AudioContext unlock); some Android devices lack an English
  voice → clips first, read item last.
- **Golden and parity:** UI PRs carry `parity-change`; reviewer recaptures (Phase 5).
- **Bundle size:** content, widgets and clips load lazily; clips excluded from the precache.
- **Copyright:** Muses never see the pack; `check-overlap.mjs` runs before every deploy.
- **Function source leak:** mandatory dummy-pack preview + curl checks before the real pack.
- **Shared file:** `src/english/content/audio-map.ts` is generated; 2C's generator owns it.

## Research
- [Offline TTS](research/researcher-01-offline-tts-report.md)
- [Vercel function](research/researcher-02-vercel-function-report.md)

## Unresolved questions
- Voice choice after the author's 20-word audition (Kokoro `af_heart` vs Piper ljspeech-high).
- The family passphrase (the author sets `ENGLISH_PACK_PASSPHRASE`).
- Whether to include picture crops from the book (needs a manual cropping step by the author).

## Validation Log
Session 2026-11-26. All answers took the recommended option.
- 8 stages by book block, 8 rounds per run → **confirmed**.
- Vietnamese gloss → **shown only after the item is answered** (e.g. "cat = con mèo"). Never shown
  during the item (Phase 1B).
- Island placement → **west bank, near the Bridge**, on existing walkable ground (Phase 1A).
- Deploy gains the pack-emit step, with a preview test first; prod still waits for "deploy đi" → **confirmed**.
