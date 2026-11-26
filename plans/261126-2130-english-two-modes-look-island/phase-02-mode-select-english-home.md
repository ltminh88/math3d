# Phase 2: mode select + English home page

## Context links
- Parent: [plan.md](plan.md)
- Depends on: none (needs only the merged `island` level); runs in parallel with Phase 1
- Research: [researcher-02](research/researcher-02-codebase-modes-and-second-island-report.md) §B,
  [brainstorm](../reports/brainstorm-261126-english-two-modes.md) approach B
- Docs: `docs/code-standards.md` (settings single source `app-settings.ts`, tap-only kit)

## Overview
- Date: 2026-11-26
- Description: two big welcome buttons ("Chơi game" / "Tiếng Anh lớp 1"); English mode opens a
  DOM English home (CEC stage cards + stars), card → island scene, exit → back to the home.
  Last choice stored per device; "Về menu" switches.
- Priority: P2 (author's first request)
- Implementation status: pending
- Owner: muse-88 (after 2C; quota resets 27/11 20:37)
- Effort: 1.5d

## Key Insights
- Welcome wiring: `menu-language-start.ts:64` `#play` → `startAdventure()`; `returnToMenu()`
  (`:42-56`) is what settings "Về menu" calls. Keep `#play` id so existing e2e stay green.
- `enterLevelFromMap(levelId, stage)` (`level-gates.ts:128-139`) skips the gate check by design —
  the kiosk relies on it; document it in a comment and test it.
- The host renders on `world.renderer` and calls `ports.world.suspend()/resume()`
  (`level-host.ts:74,92,159`; ports `level-host-ports.ts:120-137`). The world stays built but
  inactive in English mode; `resume()` must not set it active.
- Settings: `settings-store.ts:4-26` + `sanitizeSettings` (`:45-58`) migrate field-wise, so a new
  `playMode` field needs one default + one sanitize line, no version.
- Mode 1 lists only CEC (`ENGLISH_BOOKS.cec` once Phase 1 merges; until then the `island` id).

## Requirements
- Functional
  - Welcome: two big buttons (≥ 44 px, tap-first); the remembered mode is pre-selected/highlighted,
    the child still taps one each time.
  - `appSettings.playMode: 'game' | 'english'` (default `'game'`), written on each choice.
  - English home: title "Tiếng Anh lớp 1", 8 stage cards with names + stars from
    `levelProgress.island.stageStars`, next stage highlighted, "Về menu" button. No HUD, no
    quest card, no daily practice, no world toast.
  - Card tap → `enterLevelFromMap('island', n)`; on any host exit (normal, start failure, loop
    crash, abort via "Về" button) the home is shown again with fresh stars and the world stays
    inactive.
  - Normal mode unchanged; island gate in the world still waits for the bridge.
- Non-functional: English home in its own lazily imported module; main chunk within 2 kB;
  Vietnamese source strings + `en` keys (`defineStrings`).

## Architecture
- `LevelHostPorts` gains an exit target: `afterExit?: () => void` and a world port wrapper whose
  `resume()` is a no-op while `playMode === 'english'` session is active. Smallest version: a
  module-level "level exit target" (`'world' | 'english-home'`) set by the entry point, read by
  the three host exit paths.
- Flow: welcome → `startEnglishHome()` (world.active stays false) → card → host → exit target
  `'english-home'` → `showEnglishHome()`.

## Related code files
- Create: `src/ui/english/english-home.ts` (page), `english-home-stage-cards.ts`,
  `english-home-strings.ts`, `english-home.css`, `src/levels/shared/level-exit-target.ts`;
  `tests/e2e/english-mode.spec.ts`
- Modify: `src/ui/menu-language-start.ts`, `src/ui/dom-template.ts` (second button),
  `src/store/settings-store.ts` (+ test), `src/levels/shared/level-host.ts`,
  `level-host-ports.ts`, `level-gates.ts` (comment only on the gate skip)
- Do not touch: `english-run.ts` and `english-types.ts` (Phase 1), `level-gate-config.ts` (Phase 3)
- Delete: none

## Implementation Steps
1. Claim on #11; branch `muse/english-mode-home` from latest main.
2. `playMode` in settings + sanitize; unit test old blob → `'game'`, bad value → `'game'`.
3. Welcome button + pre-selection; `#play` keeps today's behaviour.
4. `level-exit-target.ts`; route the three host exit paths through it; unit test each path.
5. English home page + stage cards (reuse the map-panel stage-status helpers
   `levels/shared/level-stages.ts`); "Về menu" → `returnToMenu()`.
6. E2E (4 projects, `tap()` only): choose English → home → stage 1 → finish → home shows stars;
   abort mid-run → home; forced start failure → home; reload → English pre-selected; switch to
   "Chơi game" → world, island gate still locked before the bridge, island stars visible.
7. Gates; PR with `parity-change` (welcome shot changes, new English-home shot).

## Todo list
- [ ] `playMode` setting + migration test
- [ ] Welcome two buttons, remembered pre-selection
- [ ] Exit target for 3 host exit paths + tests
- [ ] English home page + stage cards + "Về menu"
- [ ] E2E english-mode spec on 4 projects
- [ ] PR `parity-change`

## Success Criteria
- In English mode nothing of the world is reachable (no HUD, gates, quest, shop, map).
- Every host exit path lands on the English home; world never becomes active.
- Stars earned in mode 1 show on the island gate/map in normal mode (same `levelProgress.island`).
- Normal-mode e2e and golden unchanged.

## Risk Assessment
- `world.resume()` re-activates input/loop even when inactive (unverified, researcher-02 Q2).
  Mitigation: read `WorldPublicApi.resume` first; the exit target skips `resume()` in English mode.
- Collision with Phase 1 on level-host files? None: Phase 1 touches only scene/run files.
- Map-panel stage helpers may be DOM-coupled. Mitigation: use only `level-stages.ts` (pure).

## Security Considerations
- None: device-level setting, no secrets, no pack access.

## Next steps
- Phase 3 (same lane); Phase 7 recaptures parity.
