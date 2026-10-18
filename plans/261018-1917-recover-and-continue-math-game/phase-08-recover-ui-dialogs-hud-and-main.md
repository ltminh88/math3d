# Phase 08: Recover UI (state, template, HUD, dialogs, input, labels) and main bootstrap

## Context links
- [plan.md](plan.md) · [inventory §1 lines 1913-2548; §3 DOM/CSS coupling; §6 shared lets](research/researcher-01-recovered-code-inventory.md)
- Depends on: 03, 04. Parallel with: 05/06, 07 (G2) — talks to world/map only through shims + `world-public-api.ts` names.

## Overview
- Date: 2026-10-18
- Description: Split the single-scope UI chunk (~580 lines, ~12 shared mutable `let`s) into typed modules around one `gameState` object; recover the innerHTML template, HUD, quest card, dialogs (milo, quiz, book, help, settings, reset, complete), map overlay wiring, keyboard/joystick, projected world labels, area toasts, bootstrap with WebGL-failure fallback, and the WebMCP read-only tool.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed

## Key Insights
- Shared lets (`ie` save, `_e` world, `jn` question, `Kt` table, `Yn` hint level, `ya`, `ba` timer, `Xa` dialog kind, `Dn`, `Ei`, `bi`, `ec`, `ul`, `dl`) -> fields of one `gameState` object. `ie = Ga()` is reassigned on reset -> always read `gameState.save`, never destructure/alias.
- Event order: HUD refresh `_n()` called ad hoc after mutations; translator runs after every innerHTML -> keep each call site's order.
- DOM ids, classes (`playing`, `collapsed`, `locked`, `near`, `arrive` reflow trick, `bump`, `correct/incorrect`, `feedback success|gentle`, `reward-pop`, `known`, `done`) and ARIA attributes exactly as inventory §3; template string verbatim (DOM normalized-HTML parity).
- Quirks kept: window `blur` auto-opens settings; quiz keys 1-3; quest complete +50 XP +10 coins when bridge=6 and x>12, |z|<4.
- WebMCP `document.modelContext` tool is read-only progress; keep behind feature check (Unresolved Q3 may remove later).

## Requirements
- Modules < 200 lines; template may be split into partial template strings concatenated in original order.
- Map overlay (2320-2394) uses 07 render functions.
- `src/main.ts` becomes the real entry (imports CSS index, `bootstrapGame()`); `legacy-main.js` + `legacy-ui.js` + `legacy-webmcp.js` deleted.

## Architecture
```
src/ui/icons.ts                 (1913-1938) SVG icon set, icon(), byId()
src/ui/dom-template.ts          (1958-2000) template parts
src/ui/game-state.ts            single mutable state + accessors
src/ui/toast-and-persist.ts     (2001-2030) toast, persist wrapper (one-time write-fail toast), bump
src/ui/hud.ts                   (2031-2086) level/xp/coins/quest card/labels refresh, quest collapse key
src/ui/dialog.ts                (2087-2102) open/close, kind
src/ui/menu-language-start.ts   (2103-2140) language toggle (reload), start/menu, avatar
src/ui/milo-dialog.ts           (2141-2163)
src/ui/quiz-dialog.ts           (2164-2239) hint ladder render, reward pop, answer handling
src/ui/book-help-dialogs.ts     (2240-2274)
src/ui/settings-dialog.ts       (2275-2319) settings, reset confirm, wiring
src/ui/map-overlay.ts           (2320-2394)
src/ui/keyboard-joystick.ts     (2395-2444)
src/ui/world-labels.ts          (2445-2471) DOM label projection, area-change toast
src/ui/bootstrap-game.ts        (2472-2519) world create, hooks, quest complete, WebGL fallback
src/webmcp/progress-tool.ts     (2520-2548)
src/main.ts
```

## Related code files
- Create: above. Modify: `src/main.ts`, `src/legacy/shims/ui.js` (then removed). Delete: `legacy-ui.js`, `legacy-main.js`, `legacy-webmcp.js`.

## Implementation Steps
1. Grep UI chunk for every `_e.` member access -> confirm against 06 `world-public-api.ts` (coordinate with 06 owner; API list is read-only for 08).
2. Rename map for UI cluster; introduce `gameState` mechanically (replace each let read/write with `gameState.x`), parity run before splitting files.
3. Split into modules per architecture, parity after each 3-4 modules.
4. Replace bootstrap; delete legacy UI chunks; parity.
5. Commit + tag `recovery-p08`.

## Todo list
- [ ] world API access audit
- [ ] rename map + gameState introduction (+ parity)
- [ ] template, icons, HUD, toast (+ parity)
- [ ] dialogs (+ parity)
- [ ] overlay, input, labels (+ parity)
- [ ] bootstrap + WebMCP + main (+ parity)

## Success Criteria
- `npm run test:parity` full scenario list green (both projects), normalized DOM equal for every dialog state, localStorage playthrough trace equal, audio trace equal.
- Existing `tests/e2e/boot-smoke.spec.ts` updated to assert `#hud`/`#welcome` present and passes.
- No file in `src/ui/*.ts` > 200 lines.

## Scope Contract
- Changed: all UI/DOM code + entry. Impacted: every screen, save writes, input.
- Will verify: full parity suite (DOM + pixel + traces) — cheapest layer that sees DOM order bugs.
- Skipped: unit tests for UI modules (parity covers; add none unless logic extracted).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Aliased stale save after reset | M | H | `gameState.save` only; reset scenario in parity |
| Translator ordering broken by split | M | M | EN scenarios for every dialog |
| Joystick/touch behavior drift | M | M | mobile-pixel scenario: joystick drag 1 s, position trace |
Rollback: shim back to `legacy-ui.js` from tag `recovery-p07`/`p06`.

## Security Considerations
- innerHTML only with static template strings (no user input). Player name/nickname rendered with `textContent`. WebMCP tool read-only, returns no PII.

## Next steps
- 09 sign-off; 12 changes quiz dialog/HUD for learning core; 17 adds account entry in settings dialog.
