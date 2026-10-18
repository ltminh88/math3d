# Scout: current repo state and reuse map (2026-10-18)

Repo: /Users/minhlt/Downloads/Projects/private/learning_game, branch main, 8 commits. Old plan: `plans/261018-1803-vlm-math-game-mvp/` (greenfield rebuild premise, now superseded: user is the original author, source lost).

## Committed and green (lint, tsc 7, 157 vitest, 4 playwright e2e)
| Area | Files | Reuse verdict |
|---|---|---|
| Tooling (old phase 01) | package.json (all deps pinned: three 0.186.1, vite 8.3.4, vite-plugin-pwa 2.0.0, supabase-js 2.118.0, idb 8.0.4, TS 7.0.2, vitest 5.0.5, playwright 1.64.1, biome 2.5.15, supabase CLI, fake-indexeddb, @types/node 24), tsconfig, biome.json, vite.config.ts (PWA generateSW, prompt), playwright.config.ts (desktop + mobile-pixel, SwiftShader), CI workflow | KEEP. Manifest name/theme/icons must change to the original game's identity. |
| i18n | src/i18n/i18n.ts (`defineStrings(ns,{vi,en})`, `t`, `initLanguage`, storage key `nsq.language`), common-strings.ts | KEEP mechanism; original game's VI→EN map (`jl`) and key `aigame3d_language` must migrate into it. |
| Fonts | src/styles/fonts.css (self-hosted Baloo 2 600/800, Nunito 400/700, vietnamese+latin) | KEEP; original loads same families from Google Fonts. Check original CSS weights. |
| Learning core (old 03) | src/learning/** (seeded RNG, fact keys `m{a}x{b}`-style, distractor picker, expression choice, hint ladder, Leitner box, session planner/recorder, scoring, progression, curriculum tables) | KEEP; replaces original's weak `a×(b±1)` distractors and 30-item review queue. Needs an adapter to original question UI (3-choice + new input types). |
| Store (old 03) | src/store/** (idb schema v-migrations, game-store commitSession/purchaseCosmetic, outbox w/ idempotent batchId, memory fallback, DbBlockedError, settings-store) | KEEP; add one-time import of original localStorage save `aigame3d_multiplication_save` (+ `aigame3d_quest_collapsed`). |
| Engine (old 02) | src/core/** (renderer factory, scene manager, game loop, input drag/tap/keyboard, audio engine + iOS gesture unlock, speech narrator, quality tiers), src/ui/kit/**, src/dev/** bench, bench.html | PARTIAL. Recovered original engine (world, camera, controls, synth) becomes the base. Keep: audio-gesture-unlock, speech-narrator/voice-picker, drag/tap/drop-zone/keyboard-target-guard (for new Field/Forest interactions), quality tiers/adaptive quality, context-loss, webgl check, number-pad/choice-buttons/toast/aria-announcer if styled to original CSS. Retire perf bench scenes (keep frame-stats). |
| Styles | src/styles/base-reset.css (`:where(#ui) > *` pointer rule) | Replace by recovered game-styles.css (2146 lines) split into modules. |

## Uncommitted
- `recovered/original/` raw prod files: index.html, index-CO4MPNqj.js (568 KB), index-D1ngBGok.css, favicon.svg.
- `recovered/formatted/` biome-formatted: game-bundle.js (23.5k lines), three-section.js (lines 1–20995, three r180 + BufferGeometryUtils), game-app-section.js (2548 lines app), game-styles.css.

## Old-plan phases still valid in substance
- 08 Supabase backend (schema, RLS, `sync_batch` RPC, pgTAP, keep-alive) — content reusable nearly verbatim; Docker not running yet on this Mac.
- 09 auth/profiles/sync client — reusable; UI must follow original visual language.
- 06 Field / 07 Forest level designs — reusable as gameplay specs; must be built inside recovered world (regions "Cánh Đồng Phép Tính", "Rừng Nhân Chia" already exist as walkable areas in original).
- 10 polish/a11y/e2e/deploy — reusable; deploy target: replace current math.aigame3d.com hosting (host unknown → ask).
