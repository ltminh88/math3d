# Brainstorm: two English modes (CEC grade-1 only + full game with CEC & Look 1)

Date 2026-11-26 · read-only scout of main (e0796dd) · author request: mode (1) "Tiếng Anh sơ cấp lớp 1"
(island only, all else locked) and mode (2) today's game + CEC part + NAT-GEO-LOOK-1 part.

## Ground truth (what the code does today)
- **Start flow:** `dom-template.ts` welcome = avatar (boy/girl) → `#play` → `startAdventure()`
  (`ui/menu-language-start.ts`): world active, HUD, toast "Di chuyển đến VLM". No mode, no child
  picker. Also "Khám phá bảng cửu chương" and save-code import on the welcome.
- **Profiles:** schema supports many (`store/save-schema.ts` Profile: guest|child, nickname,
  settings.equipped) but `profile-repository.ts` only ever loads/creates ONE active guest. No
  switcher UI. Save-code import replaces the active profile. → a sibling on the same device shares
  progress today; nothing in this request changes that.
- **Gates:** `config/level-gate-config.ts` (`island` requires `'bridge'`, pos [-8,10]) →
  `levels/shared/level-progression.ts` (`isGateOpen`, `gateStatus`, pure) → `level-gates.ts`
  `currentGateStatus()` (single choke point for world gates). `enterLevelFromMap(levelId, stage)`
  enters a level directly (map panel), and does NOT re-check gate status itself.
- **Quest chain:** `ui/quest-chain.ts` uses `progressionState`; island is outside the chain. Bridge
  quest (VLM, ×-table quiz) is separate (`gameState.progress.questComplete`).
- **Geography:** island centre [-6,13] is on the WEST bank (river x 4..10), i.e. reachable on foot
  without the bridge; only its gate waits for the bridge.
- **Level host:** `level-host.ts` suspends the world, runs the island scene (own 3D diorama
  chunk), resumes the world on exit. `startEnglishRun(port)` (`ui/english/english-run.ts`) only
  needs `{stage, ui, learning, signal}` — already decoupled from the world.
- **Save codes:** export writes M3D6; decoders strict on top-level keys (`M3D5_KEYS`), levels
  whitelisted by `M3D3_LEVELS` (island added in 1A, precedent for adding ids), skill tuples
  lenient (unknown ids dropped), `MAX_STAGE_STARS = 8`. Any new top-level field = M3D7.
- **Book pack:** `english-pack-contract.ts` stages fixed `[1..8]`, `EnglishPack` has no book id,
  `pack-storage.ts` stores one record under key `'current'`. Skill ids `en-*` (41) are shaped around
  CEC (letter blocks A–Z, topics, patterns). → a second book needs a `book` dimension everywhere.
- Note: `english-run.ts` is 420 lines (rule: <200) — touching it for book-awareness is the moment
  to split it.

## Approaches

### A. Per-profile/device mode flag + gate filtering inside the 3D world
Welcome gets "Phiêu lưu đầy đủ" / "Tiếng Anh lớp 1". In english mode `progressionState` returns
every gate locked except island (requires overridden to open); child walks the village to the islet.
- Pros: child keeps the 3D walk; one obvious place for gate logic.
- Cons: gates are only ONE of many entry points. Must also suppress: VLM bridge quest + quest card,
  "Sổ cửu chương"/`#learn`, "Học tiếp" lesson HUD, daily practice math items, shop? map panel
  entries, help/guide copy, "Di chuyển đến VLM" toast, world labels. Each is a leak risk and a
  test. Bridge quest still teaches ×-tables to a grade-1 child unless hidden.
- Edge: switching mode mid-game → quest card state flips; save-code import carries no mode unless
  M3D7. Sibling: device-level flag = shared, same as progress.
- Parity: welcome + HUD/quest-card shots change in english mode only; golden untouched.
- Fit: `level-progression.ts`, `level-gates.ts`, `quest-chain.ts`, `hud.ts`, `daily-practice.ts`,
  `lesson-hud-button.ts`, `menu-language-start.ts`, `app-settings.ts`.
- Effort 3–4d · risk MEDIUM-HIGH (whack-a-mole, ~8 surfaces). **Pushback:** "lock everything" by
  filtering is the expensive way to hide a world the child never needs.

### B. English-only "kiosk": skip the world, boot straight into the island level
Mode (1) `#play` does not call `startAdventure()`; it opens a small DOM "Đảo Tiếng Anh" home
(stage cards + stars, reuses map-panel stage list) → `enterLevelFromMap('island', stage)`. The
island diorama (3D, own chunk) still plays; on exit the host returns to the English home, not the
world. World stays inactive → nothing else is reachable, no gate filtering needed.
- Pros: one entry point, nothing to leak; reuses level host, run, stars, stickers, rewards; same
  `levelProgress.island` and `sk:en-*` records, so switching to full mode keeps all progress.
  Light on tablets (world never activated after boot).
- Cons: needs an "exit target" hook in the level host (resume world vs show English home); child
  loses free walking (acceptable for a grade-1 English drill — author to confirm). Bridge rule is
  bypassed only on this path; in full mode the island gate still waits for the bridge.
- Edge: mode stored in `appSettings` (device, localStorage) → no save-code change. Mode switch
  = back to welcome (settings "Về menu" exists: `returnToMenu`). Sibling: same as today.
- Parity: one new welcome button (+ welcome shot), one new home shot; full-mode shots unchanged.
  Golden untouched.
- Fit: `menu-language-start.ts`, `dom-template.ts` (button), new `ui/english/english-home*.ts`,
  `level-host-ports.ts`/`level-gates.ts` (exit target), `app-settings.ts`.
- Effort 1.5–2d · risk LOW-MEDIUM.

### C. Pure 2D English app (no 3D at all, `startEnglishRun` in a DOM page)
- Pros: smallest runtime; could even be its own route.
- Cons: must rebuild the `LevelLearning` port, result commit, stars and sticker payout that the
  level host owns today → duplicate code paths writing `island` progress (DRY violation, drift
  risk). Loses the diorama reward moment. **Pushback:** B gets the same isolation for less code.
- Effort 2–2.5d · risk MEDIUM.

### D. Where Look 1 lives (applies to mode 2, and optionally to mode 1's home)
- **D1. Second island region** (`look` region + builder + gate): new free-ground probe, scatter
  clearing, draw-call budget, region label, map entry, parity. ~2d for scenery that adds no
  learning. Reject unless the author wants "a new world" as a reward.
- **D2. Stages 9+ on the same island:** breaks `MAX_STAGE_STARS = 8` (decoder change), pack stages
  `[1..8]`, stage list of 17+; forces CEC before Look (wrong if school uses Look). Mixes two
  curricula in one Leitner pool. Reject.
- **D3. Second gate/building on the same islet** (e.g. lighthouse "Ngọn hải đăng Look", levelId
  `look`, own stage plan by book unit, `requires: 'bridge'` like island): gates are placed after
  scatter (golden-safe), `M3D3_LEVELS` gains `look` (island precedent). Engine becomes book-aware
  via one `EnglishBook` descriptor {id, levelId, stages, stageNames, units, skillPrefix}; pack
  contract gains `book: 'cec' | 'look'`, storage key per book, function serves per book.
  Skills `en-look-*` (lenient decoder keeps old codes valid). ~1.5d shell + content work.
  **Recommended.**

## Recommendation: B (kiosk) for mode 1 + D3 (second gate on the islet) for Look 1
Why: the request is "only English, everything else locked". B makes that true by construction
(world never starts) instead of by policing ~8 UI surfaces (A). It reuses the existing level host
and run, writes the same records, so a child who later switches to the full game keeps every star.
No save-code version bump (mode is device-level), golden untouched, parity changes limited to
the welcome + one new home shot. D3 keeps both books as separate levels with separate stages,
skills and packs — clean for Leitner, no stage-cap change, no new region geometry.

Suggested order (each its own PR, `parity-change` where UI moves):
1. Book-aware engine refactor (split `english-run.ts` <200 lines, `EnglishBook` descriptor, CEC =
   book #1; no behaviour change) — 1d.
2. Mode 1 kiosk: welcome choice, `appSettings.playMode`, English home, host exit target — 1.5d.
3. Look gate `look` on the islet + stage plan + `M3D3_LEVELS` + e2e — 1d.
4. Look own content (words/patterns we write) — 1d. 5. Pack: `book` field, per-book storage key,
   function serves both, `check-overlap.mjs` per book (reviewer) — 0.5d.
Total ≈ 5d. Phase 6 (English in daily practice) should wait for step 1 so it is book-aware once.

Mode 1 home could list both books later (one line: add Look card) — keep it CEC-only per request.

## Risks
- Host exit target: a level crash/stale-chunk path must also land on the English home, not a dead
  world → e2e for exit, abort, reload.
- `enterLevelFromMap` skips the gate check; kiosk relies on that — document it, test it.
- Look skill ids must be appended (not reordered) in the catalog; save-code round trip test.
- Copyright: Look pack goes through the same local-only folder + overlap check; Muses never open it.

## Open questions (with recommended answers)
1. Where is the mode chosen and stored? → **Welcome screen, two big buttons; stored per device in
   `appSettings`; changeable via "Về menu".** (Per-profile needs M3D7 and a profile UI that
   does not exist.)
2. In mode 1, does the child still walk the 3D village? → **No: straight to an English home →
   island diorama.** Walking adds nothing but leaks.
3. In full mode, should the island/Look gates still wait for the bridge? → **Yes for now**
   (unchanged); progress earned in mode 1 still shows as stars on the gate.
4. Look 1 placement? → **Second gate/building on the same islet (D3), own stages by book unit
   (author gives unit count; Muses never read the book).**
5. Do siblings need separate progress on one device? → **Not in this plan;** use save codes. A
   real profile switcher is a separate project.

**Status:** DONE

## Author decisions (2026-11-26, terminal)
- Mode 1 "Tiếng Anh lớp 1": **own English home page** (option B), no 3D world; pick a stage → play inside the island scene → back to the home page.
- Mode choice: **asked every time at the welcome screen** (two big buttons), last choice remembered on the device, change via "Về menu"; one shared progress (stars, stickers, `sk:en-*`).
- Look 1 in normal play: **a separate second island** (author overrode D3). Needs its own region on existing walkable ground, golden stays byte-identical (expansion-region pattern like `island`), own level id (e.g. `look`), own stages from the book's units.
- Gates in normal play: **unchanged** — CEC island and Look island both open after the Bridge.
- Siblings / per-child profiles: out of scope (recommended default, not asked).
