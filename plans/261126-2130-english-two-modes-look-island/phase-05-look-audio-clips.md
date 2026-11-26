# Phase 5: Look audio clips

## Context links
- Parent: [plan.md](plan.md)
- Depends on: Phase 4 (Look content merged), parent Phase 2C (generator + SW rules merged)
- Pattern: parent [Phase 2C](../261126-0700-english-island/phase-02c-audio-clips.md)
- Voice decision: Kokoro `af_heart`, speed 0.9 (parent plan Validation Log)

## Overview
- Date: 2026-11-26
- Description: run 2C's generator over the Look content: word, sentence, prompt and phonics-key
  clips, a separate generated `audio-map-look.ts`, credits line.
- Priority: P2
- Implementation status: pending
- Owner: muse-88 (owner of 2C's generator)
- Effort: 0.5d

## Key Insights
- Same pipeline, same voice and loudness → both islands sound the same.
- `audio-map.ts` is generated and owned by 2C; Look gets its own `audio-map-look.ts` so the two
  books never rewrite each other's map. The speaker looks up the map of the run's book.
- Words shared with CEC but spelled differently (color/colour) are separate clip ids; identical
  words may reuse the CEC clip by text hash (generator already skips existing hashes).
- Estimated ~250 clips (~1.3 MB); clips stay lazy and out of the precache (2C's `globIgnores`).

## Requirements
- Functional
  - Generator accepts `--book look` (reads Look content, writes `public/english-audio/look/*.mp3`
    and `src/english/content/look/audio-map-look.ts`). Default run stays CEC, unchanged output.
  - Speaker: clip map chosen by `book.id` (one-line lookup in the Phase 1 run speech module).
  - `AUDIO-CREDITS.md` notes the Look clips (same engine, voice, license).
- Non-functional: deterministic (re-run = no diff); same ffmpeg chain as 2C; offline after play
  via runtime CacheFirst.

## Architecture
- Look content → `generate-clips.mjs --book look` → WAV (ignored) → ffmpeg → MP3 +
  `audio-map-look.ts` → `english-run-speech.ts` picks map by book → clip → Web Speech → read item.

## Related code files
- Modify: `tools/english-audio/generate-clips.mjs` (+ test), `src/ui/english/english-run-speech.ts`
  (map by book; ask muse-min on #11 — owner of Phase 1 files), `public/english-audio/AUDIO-CREDITS.md`
- Create: `public/english-audio/look/*.mp3`, `src/english/content/look/audio-map-look.ts` (generated)
- Never commit: model weights, WAVs, engine code
- Delete: none

## Implementation Steps
1. Claim on #11 after Phase 4 merges; branch `muse/english-look-audio`.
2. Add `--book` to the generator; test: CEC run produces a byte-identical `audio-map.ts`.
3. Generate Look clips; spot-check ~10 (send 3 via Telegram relay `send-audio` if the author wants).
4. Speaker picks the map by book; unit test for both books.
5. E2E: Look stage 1 "🔊 Nghe" requests `/english-audio/look/...`; muted game shows "bật âm thanh".
6. Gates; PR (no parity change).

## Todo list
- [ ] Generator `--book look` + CEC no-diff test
- [ ] Look clips + map
- [ ] Speaker map by book + test
- [ ] E2E clip request
- [ ] PR

## Success Criteria
- Every Look word, sentence and prompt has a clip; CEC map unchanged.
- Re-running the generator makes no diff.

## Risk Assessment
- Kokoro mispronounces short words (mom, pen). Mitigation: phonetic override table (2C's).
- Bundle growth. Mitigation: clips are static files outside the precache.
- Quota on muse-88. Mitigation: small phase; can hand over via #11 at 99%.

## Security Considerations
- Clips are of our own text only; no book audio, no pack text spoken into public files.

## Next steps
- Phase 7 docs mention the `--book` flag.
