# Phase 2C: audio clips for our own content

## Context links
- Parent: [plan.md](plan.md)
- Depends on: [Phase 2A](phase-02a-own-english-content.md)
- Research: [researcher-01-offline-tts-report.md](research/researcher-01-offline-tts-report.md)
- Docs: `docs/deployment-guide.md` (service worker), `vite.config.ts` (workbox)

## Overview
- Date: 2026-11-26
- Description: deterministic offline generator for ~490 MP3 clips (words, letter names,
  sentences), the clip map, credits, and SW caching rules.
- Priority: P2
- Implementation status: pending
- Review status: not reviewed
- Owner: Lane A, muse-88
- Effort: 0.75d

## Key Insights
- Engine: Kokoro-82M, voice `af_heart` (Apache-2.0), speed ~0.9; letter names spelled
  phonetically ("bee", "cee") so the engine does not read "capital B".
- Fallback engine: Piper `en_US-ljspeech-high` (public domain).
- Rejected: espeak-ng, Coqui XTTS, Piper voices ryan, hfc_*, lessac. amy is unconfirmed.
- Before the bulk run, the author auditions ~20 hard words with both voices and picks one.
- Current workbox `globPatterns` has no `mp3`, but add `globIgnores: ['english-audio/**']`
  anyway so a later pattern change cannot precache 2.5 MB.

## Requirements
- Functional
  - `tools/english-audio/generate-clips.mjs` (or `.py`): reads the content data, deterministic,
    skips a clip when it exists and its text hash matches.
  - Output `public/english-audio/<id>.mp3` + `src/english/content/audio-map.ts` (id → text hash).
  - ffmpeg: trim silence, RMS normalise with `ffmpeg-normalize`, `alimiter`, mono, 24 kHz,
    `libmp3lame` 40k.
  - `public/english-audio/AUDIO-CREDITS.md`: engine, voice, version, license.
- Non-functional: ~2.5 MB total for ~490 clips; clips lazy-loaded, never precached; runtime
  CacheFirst for `/english-audio/` so a played clip works offline.

## Architecture
- Content data → generator → WAV (local, ignored) → ffmpeg → MP3 in `public/english-audio/`
  → `audio-map.ts` → speaker (3B) plays `/english-audio/<id>.mp3` when the map has the id.
- `audio-map.ts` is a generated file: whichever of 2C/3B lands first creates it; the
  generator owns its content afterwards.

## Related code files
- Create
  - `tools/english-audio/generate-clips.mjs` (new) + `generate-clips.test.ts` (new)
  - `public/english-audio/*.mp3` (new), `public/english-audio/AUDIO-CREDITS.md` (new)
  - `src/english/content/audio-map.ts` (new, generated)
- Modify
  - `vite.config.ts`: `globIgnores` for `english-audio/**`, `runtimeCaching` CacheFirst for
    `/english-audio/`
  - `.gitignore`: WAV scratch dir
- Never commit: engine code, model weights, WAVs

## Implementation Steps
1. Author audition: 20 hard words in both voices; record the choice in the PR.
2. Write the generator: collect ids/texts from content, hash text, skip unchanged clips.
3. Run the TTS locally (pinned engine version), then the ffmpeg chain per clip.
4. Emit `audio-map.ts` and `AUDIO-CREDITS.md`.
5. Add workbox `globIgnores` + runtime CacheFirst; verify precache manifest has no `english-audio`.
6. Tests: every listen item has a clip in the map; a second run changes no file (deterministic).
7. Gates; PR body lists total size, voice and license.

## Todo list
- [ ] Voice audition and choice
- [ ] Generator with hash skip
- [ ] ~490 MP3s + credits
- [ ] `audio-map.ts`
- [ ] Workbox ignore + runtime cache
- [ ] Tests, PR with size

## Success Criteria
- Every listen item has a clip; rerun is a no-op; total ≈ 2.5 MB.
- Precache list unchanged in size; a played clip plays again offline.

## Risk Assessment
- Kokoro glitches on very short inputs. Mitigation: trailing period, listen through all
  clips once, regenerate bad ones; Piper ljspeech as fallback.
- Version drift changes timbre on regeneration. Mitigation: pin versions in credits.
- iOS autoplay. Mitigation: 3B unlocks the AudioContext on the first tap.

## Security Considerations
- Licenses only: Apache-2.0 / public domain voices; credits file committed.

## Next steps
- Phase 3B plays these clips first; Phase 5 notes the audio rule in docs.
