---
title: "Đảo Tiếng Anh (English Island)"
description: "New map region with Pre-A1 phonics/vocab exercises; own content in repo, optional book pack behind a family passphrase"
status: pending
priority: P2
effort: 5d
branch: main
tags: [english, region, level, content, vercel-function]
created: 2026-11-26
---

# Đảo Tiếng Anh

Twelfth region, level id `island`. Item kinds: listen→pick picture (Web Speech API, en-US),
word↔picture match, word ordering, fill-the-pattern, letter/sound. UI is in Vietnamese, the child
is "bạn". Works fully on our own content. A family passphrase unlocks a local-only "book pack"
that a Vercel function serves.

## Author decisions (fixed)
- **Repo:** stays public. It holds only our own content: words, topic and pattern lists, our own
  sentences, emoji/SVG pictures.
- **Book pack:** verbatim book text and picture crops live only under `English /` (git-excluded).
  At deploy they are bundled into `api/english-pack`, gated by the `ENGLISH_PACK_PASSPHRASE` env
  var. Never a static file.
- **Out of scope:** Supabase and the parent dashboard (paused).
- **Gate:** opens after the Bridge. Side region, not part of the math quest chain.
- **Voice:** recorded audio clips, generated offline with an open-licensed TTS voice and lazy
  loaded with the island chunk. Web Speech API is the fallback when a clip is missing. Muted
  game: show a "bật âm thanh" prompt, never silently skip.
- **Integration:** an English sticker page, and English items in "Luyện tập hôm nay".

## Design notes
- **Region:** follows the chapter 2/3 expansion pattern (expansion-* config, baked region
  builder, scatter clearing after the pass). `REGIONS`, `ROADS` and `WALKABLE_BOUNDS` are untouched
  and the golden `--check` stays byte-identical.
- **Skills:** the same Leitner `factStats` as math. Add family `'english'` and append the
  `en-*` entries to `SKILL_CATALOG` with `lessons: []`. "Học tiếp" and daily practice stay
  math-only.
- **Stages:** 8, following the syllabus blocks (A–D, E–H+R1, I–L+R2, M–P+R3, Q–T+R4, U–X+R5,
  Y–Z+R6, A–Z review). 8 rounds per run.

## Phases
| # | Phase | Owner | Depends | Status |
|---|---|---|---|---|
| 0 | Shared contracts: types, skill ids, content schema, pack API, stub run | one Muse | — | pending |
| 1A | Region, level shell, gate, map, save code | Lane A | 0 | pending |
| 2A | Own content for stages 1–8 | Lane A | 1A | pending |
| 1B | Engine + tap-only exercise UI | Lane B | 0 | pending |
| 3B | Speech + pack client + passphrase dialog | Lane B | 1B | pending |
| 2C | Audio clips for own content (TTS generator + clip map) | Lane A | 2A | pending |
| 6 | English items in daily practice | Lane B | 3B, 2A | pending |
| 4 | Pack builder, function, vercel.json/SW, deploy check | reviewer | 3B | pending |
| 5 | Parity baselines, docs | reviewer | 1A, 1B | pending |

Details: [phases.md](phases.md).

## Key risks
- **Speech:** iOS needs a user gesture, and some Android devices have no English voice. Fallback
  is a text variant.
- **Golden test and parity:** Lane A's PR carries the `parity-change` label.
- **Bundle size:** content and widgets load lazily with the island chunk.
- **Copyright:** Muses never see the pack. An overlap check runs before every deploy.
