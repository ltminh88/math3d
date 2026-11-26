# Phase 3B: speech and pack client

## Context links
- Parent: [plan.md](plan.md)
- Depends on: [Phase 1B](phase-01b-exercise-engine-and-ui.md); clips from [Phase 2C](phase-02c-audio-clips.md) when merged
- Contract: `src/english/english-pack-contract.ts` (Phase 0)
- Reuse: `src/core/audio/speech-voice-picker.ts`, `src/core/audio/audio-gesture-unlock.ts`,
  `src/store/app-settings.ts` (sound setting)
- Research: [researcher-01](research/researcher-01-offline-tts-report.md) (iOS unlock),
  [researcher-02](research/researcher-02-vercel-function-report.md) (endpoint)

## Overview
- Date: 2026-11-26
- Description: speaker (clip → Web Speech → read item), muted prompt, pack client with its own
  IndexedDB, parent passphrase dialog.
- Priority: P2
- Implementation status: pending
- Review status: not reviewed
- Owner: Lane B, muse-min
- Effort: 1d

## Key Insights
- Speaker order: pre-generated MP3 clip first, Web Speech en-US as fallback; with neither, the
  item becomes a read item with one parent notice.
- Muted game: show a "bật âm thanh" prompt; never skip silently.
- iOS: unlock the AudioContext on the first tap; speak only after a tap on "🔊 Nghe".
- The pack client sends nothing until a passphrase is entered.

## Requirements
- Functional
  - `english-speaker.ts`: clip if `audio-map` has the id; else `pickVoice(...,'en')`, en-US,
    rate 0.8, `cancel()` before each `speak`; else read item.
  - `pack-client.ts`: `POST /api/english-pack` per contract; handles 200, 401 (clears stored
    passphrase), 503, offline, malformed body (`isEnglishPack` false).
  - `pack-storage.ts`: own IndexedDB database (not the game store); keeps passphrase and pack
    so the pack works offline.
  - `pack-unlock-dialog.ts`: "Phụ huynh" button → "Mật khẩu gia đình" input.
  - Pack items join the planner with `source: 'pack'`.
- Non-functional: tap-only, ≥ 44 px; no network request before unlock; files < 200 lines.

## Architecture
- Widget "🔊 Nghe" tap → gesture unlock → speaker → (clip | speechSynthesis | read item).
- Dialog → pack-client → contract validator → pack-storage → planner pool merge.

## Related code files
- Create
  - `src/ui/english/english-speaker.ts` (new) + test (new)
  - `src/english/pack/pack-client.ts` (new), `pack-storage.ts` (new) + tests (new)
  - `src/ui/english/pack-unlock-dialog.ts` (new)
  - `src/english/content/audio-map.ts` (new, empty typed map) only if 2C has not merged yet
  - `tests/e2e/english-pack-unlock.spec.ts` (new)
- Modify: `src/ui/english/english-run.ts`, `src/ui/english/english-strings.ts`, the five widgets
  (Nghe button)
- Delete: none

## Implementation Steps
1. Claim on #11; branch from latest main.
2. Speaker: clip path, Web Speech fallback, read-item fallback, muted prompt; unit-test each branch.
3. Wire gesture unlock on the first tap.
4. Pack storage (own IndexedDB) and client; unit-test with a fake fetch: 200, 401, 503,
   offline, malformed.
5. Unlock dialog and the merge of pack items into the run.
6. E2E: `page.route` serves the synthetic fixture; speechSynthesis fake; assert no request
   before a passphrase; wrong passphrase clears; reload offline keeps the pack.
7. Gates; PR; watch CI.

## Todo list
- [ ] Speaker with 3-step fallback + muted prompt
- [ ] iOS gesture unlock
- [ ] Pack storage + client + tests
- [ ] Unlock dialog + pool merge
- [ ] `english-pack-unlock.spec.ts`
- [ ] Gates green, PR

## Success Criteria
- Every fallback branch covered by a unit test; e2e green on 4 projects.
- No `/api/english-pack` request before a passphrase; 401 wipes the stored passphrase.

## Risk Assessment
- Android without an English voice and no clip. Mitigation: read item + parent notice.
- IndexedDB blocked (private mode). Mitigation: catch, keep pack in memory for the session.

## Security Considerations
- Passphrase only in the POST body, never in a URL or log.
- Separate IndexedDB keeps the pack out of save codes and the game store.

## Next steps
- Phase 4 (real function) and Phase 6 (daily practice).
