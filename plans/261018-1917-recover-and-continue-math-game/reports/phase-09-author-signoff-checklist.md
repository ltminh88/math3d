# Phase 09 – author sign-off checklist (live vs recovered build)

Sign this before step 4 (commit + tag `recovered-r180`) and before any rename. Tick each box in
both columns; note any difference under "Findings".

- Live (oracle): https://math.aigame3d.com
- Local (recovered build): from the repo root run `npm run build && npm run preview -- --host`,
  then open http://localhost:4173 (desktop) or `http://<Mac LAN IP>:4173` (iPad, same Wi-Fi).
- Browsers: desktop Chrome, iPad Safari. Open live and local side by side (two windows).

## 1. Export the live save (desktop Chrome and iPad Safari)

On https://math.aigame3d.com, open DevTools > Console (iPad: Safari Web Inspector from a Mac,
Develop > iPad > math.aigame3d.com) and run:

```js
copy(JSON.stringify(Object.fromEntries(
  ['aigame3d_multiplication_save', 'aigame3d_language', 'aigame3d_quest_collapsed']
    .map((k) => [k, localStorage.getItem(k)])
    .filter(([, v]) => v !== null),
)));
```

`copy()` puts the JSON on the clipboard (if `copy` is unavailable, drop it and copy the printed
string). Paste it into a scratch file; keep it private (it is the child's progress).

## 2. Import it into the local build

On http://localhost:4173, DevTools > Console:

```js
const saved = /* paste the JSON from step 1 here */ {};
for (const [k, v] of Object.entries(saved)) localStorage.setItem(k, v);
location.reload();
```

Origins differ, so nothing is shared automatically; this paste is the only carry-over.

## 3. Side-by-side checks (live | local)

| # | Check | Desktop Chrome | iPad Safari |
|---|-------|----------------|-------------|
| 1 | Imported save loads identically: XP, coins, level, bridge segments, avatar, quest card state, language | [ ] | [ ] |
| 2 | Fonts look the same (headings Baloo 2, body Nunito, Vietnamese diacritics) | [ ] | [ ] |
| 2b | Walk to the river with D held (default camera); tap the ground in front of Milo and the player walks to him | [ ] | [ ] |
| 3 | New game (Settings > reset, or a private window): welcome screen, avatar pick boy/girl | [ ] | [ ] |
| 4 | Walk with WASD / arrows (desktop) and joystick (iPad); tap-to-move on the ground | [ ] | [ ] |
| 5 | Talk to Milo, accept the quest | [ ] | [ ] |
| 6 | Quiz: wrong answer shows hints 1-3; 6 correct answers build the 6 bridge segments | [ ] | [ ] |
| 7 | Cross the bridge; quest complete dialog; keep playing | [ ] | [ ] |
| 8 | Minimap + full map (M / map button): regions, lock state, region detail | [ ] | [ ] |
| 9 | Book (learn), help, settings (sound/music), reset confirm/cancel | [ ] | [ ] |
| 10 | EN toggle (reloads), back to VI | [ ] | [ ] |
| 11 | Reload keeps progress | [ ] | [ ] |
| 12 | Fonts still come from Google Fonts on both (self-hosted switch deferred: fontsource glyphs drift 0.7-3.5% per DOM shot vs live) | [ ] | [ ] |

## Findings

-

## Sign-off

- [x] Author: parity accepted, proceed to step 4 (commit + tag `recovered-r180`) — author (VLM), 2026-10-19 ("ổn, đổi tên luôn đi"). Automated parity gate still being stabilized (network fonts), see Findings.
