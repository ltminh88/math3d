# QA full playthrough — math3d (main @ 0ceeefa, tag full-map-reviewed)

Date: 2026-10-25 · Tester: QA agent · Build: `vite build --mode test` served on :4191 · Chromium + SwiftShader
Devices: desktop 1280×800 (keyboard + mouse) and Pixel 7 emulation (touch), plus phone landscape 839×412.
Scripts: scratchpad `qa/s1…s9-*.mjs` (not committed). Screenshots of bugs: `reports/qa-shots/`.

Real path first, everywhere: on both devices one "child" profile (persistent browser profile) played
title → VLM → bridge quiz → walk across the bridge → walk along the road to each gate → all four levels
→ closing card, with no teleport and no seeding. Teleport/seed was used only afterwards, for focused
checks (big building, true claim, EN strings, keyboard/reduced motion, orientation, perf).

Note on timing: SwiftShader renders 1–3 fps here (frame dt is capped at 0.05 s), so wall-clock walking
times below are slower than a real device. Real-time estimates use the walk speed 6.5 u/s.

## 1. Summary

| Area | Desktop | Phone | Notes |
|---|---|---|---|
| Title, avatar, language default VI, start | Pass | Pass | |
| Walk to VLM, talk, accept quest | Pass | Pass | |
| Bridge quiz (wrong, hints, 6 segments) | Pass | Pass | hint rungs 3–4 repeat rung 2; facts repeat (P-1) |
| Crossing the bridge for real | Pass | Pass | straight line east/tap far bank → stuck at the river bank (m-6) |
| Quest card directions → field gate on foot | Pass | Pass | ~40 u ≈ 7 s real time; directions findable |
| Field level full play | **Fail** | **Fail** | prompt/grid mismatch race (M-1), texture leak (M-3), tiny cells on phone (M-5) |
| Forest level full play | Pass | Pass | only ÷2 facts, same numbers twice in a row (m-3) |
| City level incl. windows round | Pass | Pass (portrait) | 10-floor top under the speech bubble (M-6); landscape cut off (M-7) |
| Tower (5 formats, hints 1–4, 3-miss reveal, true-claim confirm) | Pass | Pass | hint button stays enabled after rung 4 (m-4) |
| Closing quest card | Pass | Pass | |
| Persistence (reload after each level, mid-level) | Pass | Pass | player always respawns in the village (m-7) |
| Leave level midway ("Về thế giới") | Pass* | Pass* | *per-answer coins/XP are kept (m-8, product call) |
| Shop (enough/insufficient, equip/unequip, reload, blocked in level) | Pass | Pass | |
| Map (M + button + minimap), book, help | Pass | Pass | map labels overlap in landscape (p-4) |
| Settings (sound, music) | Pass | Pass | |
| Language EN and back, level strings in EN | Pass with issues | – | switch reloads the page (m-7); title strings untranslated (m-9) |
| Save code export → import in fresh context | **Fail** | **Fail** | levels and shop items not carried (M-2) |
| Keyboard-only (Tab focus, Enter/Space) | Pass with issues | – | Tab past the HUD opens Settings (m-10) |
| Reduced motion (field) | Pass | – | race M-1 does not occur with reduced motion |
| Portrait vs landscape | – | **Fail** landscape | M-7, p-4 |
| Draw calls in levels ≤ 60 | Pass | Pass | field 43, forest 8, city 6, tower 5 (world 290–420) |
| Memory back to baseline after leaving | **Fail** field | **Fail** field | +2 textures per field visit (M-3); one-time +geo on phone (m-11) |
| Page errors / console errors | 0 | 0 | none in any run |

No Blocker found: every level can be finished on both devices, and progress survives reloads.

## 2. Bugs (ranked)

### Major

**M-1 Field: a new round can start with the previous round's rotation — prompt says "3 rows of 6", the plot shows 6 rows of 3.**
- Device: desktop and phone (reproduced 2/2 desktop, 2 rounds out of 5 on phone). Not with reduced motion.
- Steps: field level → answer a non-square round correctly (e.g. 3×6 equations round) → press "Luống tiếp theo" right away (within ~1 s, while the plot turns).
- Expected: next round plot matches its prompt "Trồng 3 hàng, mỗi hàng 6 cây".
- Actual: the plot finishes the old rotation on the *new* grid: 6 stakes / 6 rows of 3, label "6 × 3 = ?" while the prompt and VLM still say 3 rows of 6. A child planting row by row gets the wrong picture of the fact.
- Shots: `qa-shots/s2-desktop-04-round4-start.png`, `qa-shots/s2-desktop-zz-round4-planting-stuck.png`, `qa-shots/s2-phone-04c-round2-grid-mismatch.png`.
- Likely cause: `src/levels/field/field-game.ts` `rotate()` (≈l.153–158): after `await view.rotate()` it calls `showGrid(model.rotateGrid(grid))` on whatever `grid` is current; only the `done` phase is guarded, not "round changed". `settle()` fires `void rotate()` after a correct answer (≈l.138).

**M-2 Save code (M3D1) loses level progress and shop purchases.**
- Device: desktop and phone.
- Steps: finish all 4 levels and buy items → Settings → "Xuất mã lưu" → open a fresh browser → title "Nhập mã lưu" → paste.
- Expected: same progress on the new device.
- Actual: XP, coins, bridge come back, but gates are back to `open, locked, locked, locked`, quest card is "Cánh Đồng Phép Tính" (1/5), owned cosmetics `[]`. The child loses four completed levels and items paid for with coins.
- Shot: `qa-shots/s6-desktop-16-fresh-import.png`.
- Likely cause: `src/store/save-code-codec.ts` encodes only `SaveV1` (+ Leitner boxes) via `src/ui/save-code-dialog.ts:97`; `levelProgress`, `ownedCosmetics`, equipped items (and division facts) are not in the code. Needs an M3D2 payload or a warning in the export dialog.

**M-3 Field leaks 2 textures every visit.**
- Device: desktop (20 → 22 → 24 → 26 after 3 visits) and phone (10 → 12 → 14 → 16). Forest, city, tower stay flat.
- Steps: stand at the field gate, read `__game.memory()`, enter field, "Về thế giới", repeat.
- Expected: textures back to baseline (the field leak e2e only checks geometries, so it passes).
- Likely cause: the field sun's shadow map is never disposed — `src/levels/city/city-scene.ts:145` calls `sun.shadow.dispose()`, the field (`src/levels/field/field-stage.ts` creates the shadow-casting sun, `field-scene.ts` dispose) does not.

**M-4 e2e suite red on mobile: `field-level.spec.ts:158` (geometry leak) fails 3/3.**
- `Expected: 270 Received: 271` after the first leave on `mobile-pixel` (desktop passes). Reproducible serially (`--workers=1 --repeat-each=3`). In my own phone run the field stayed flat on geometries, but city showed a one-time +3 geometries/+1 texture on phone and stayed flat afterwards (m-11), so this looks like a one-time lazily-built world object on phone being counted as a leak — or a real 1-geometry leak on the phone field path. Needs a look before the suite can be trusted again.

**M-5 Field cells are too small to tap on a phone.**
- Device: Pixel 7 portrait. Cell spacing measured from the hook: ~24 CSS px (3×4 plot), ~17–19 px (3×10 plot). Recommended touch target ≥ 44 px.
- A single tap on `cell:2:0` after a drag did not plant; a basket drag across row 0 planted 8 cells in rows 0–1. A 7-year-old's finger will hit the wrong cells often.
- On rotated tall plots the "9 × 3 = ?" label also covers the bottom row and the basket.
- Shots: `qa-shots/s2b-phone-01-after-basket-drag.png`, `qa-shots/s2-phone-04c-round2-grid-mismatch.png`.
- Likely file: `src/levels/field/field-stage.ts` / `field-scene.ts` camera framing (`CAMERA` radius) for portrait.

**M-6 City windows round: the top floor of a 10-floor building sits under VLM's speech bubble on the phone.**
- Device: Pixel 7 portrait, 6 × 10 building (found on the first seeded try).
- Expected: every floor visible so the child can count floors / light them.
- Actual: 9 rows of windows visible, the 10th is hidden behind the bubble (top floor y≈131 px, bubble bottom ≈130 px). A 9×9/9×10 case (wider) was not hit in 1 try, so horizontal fit for 9 windows is unverified.
- Shot: `qa-shots/s4big-phone-a0-r1-windows-10floors-x6.png`. Likely file: `src/levels/city/city-camera.ts`.

**M-7 Phone landscape: city level panel is cut off and covers the street.**
- Device: 839×412 (Pixel 7 turned sideways), also after rotating mid-level.
- Actual: answer cards 3–4 and the hint button extend below the screen (bottom 429–486 px of 412); the speech bubble + panel cover the houses and house numbers, so the 3D delivery cannot be seen.
- Shot: `qa-shots/s9-landscape-04-city-level.png`. Likely file: `src/levels/city/city-labels-celebration-responsive.css` (no short-landscape layout); compare `src/styles/game/14-short-landscape-and-reduced-motion.css`.

### Minor

- **m-1 Field: planting tip says "R để xoay ruộng" while Rotate (and Hint) are disabled during planting.** R and H do nothing then. Shot `qa-shots/s2-desktop-05-round0-rotated.png`. `src/levels/field/field-strings.ts` `keysTip`, `field-game.ts:80`.
- **m-2 Field: after 3 wrong answers the reveal shows "3 × 6 = 18" but the pad still displays the last wrong number (21).** Clear the pad on reveal. `src/levels/field/field-game.ts` settle / number pad.
- **m-3 Forest: only ÷2 facts in a whole run, and the same numbers twice in a row** (share 14:2 then pack 14:2; 18:2 then 18:2) on both devices. Also "Gần đúng rồi" ("almost!") is shown for any wrong answer, even 99 for 4 : 2. `src/levels/forest/forest-round-flow.ts`, `forest-round-texts.ts`.
- **m-4 Tower: hint button stays enabled after rung 4** — a 5th press shows the same rung-4 text (field disables it at rung 4). Shot `qa-shots/s5-desktop-05-floor1-hint5.png`. `src/levels/tower/tower-round-controller.ts`.
- **m-5 Tower and city rung-4 "×10 trick" hints are hard for 7–9 year olds**: "Mốc dễ nhớ: 3 × 10 = 30. Từ 30 đếm lùi 3 cho tới 27. Lùi mấy bước thì bớt ở 10 đi nhé!", "6 × 10 = 60. Bớt đi 4 lần 6 (tức là bớt 24) là ra 6 × 6", "8 × 1 = 8 … Thêm mấy bước thì cộng vào 1 nhé!". The trick only helps for ×9 (maybe ×8). `src/levels/tower/tower-hints.ts`, `src/levels/city/city-hints.ts`.
- **m-6 A child who heads straight for the far bank gets stuck at the river** (desktop: holding east from VLM → stopped at x=3.5,z=6.2; phone: 6 taps on the far bank → no movement). They have to discover the bridge at z≈0 themselves; nothing points to it once it is built. Tap-to-move also stops dead when blocked (`src/world/player-controller.ts` `walk()` clears `destination`). Shots `qa-shots/s1-desktop-11-desktop-after-straight-east.png`, `qa-shots/s1-phone-11-phone-after-direct-tap.png`.
- **m-7 The player always respawns at the village start (-6, 6)** after any reload or language switch, and the language button reloads the page back to the title screen. Each new session = walk the whole road again (~65 u to the city/tower gates). Shot `qa-shots/s6-desktop-13a-after-language-click.png`. `src/ui/menu-language-start.ts:59-61`.
- **m-8 Leaving a level midway keeps the per-answer rewards** (+5 coins, +10 XP for the one answered round; no stars/bonus, gate state unchanged). Matches the code comment in `level-run-result.ts`, but the brief said "no reward" — product decision.
- **m-9 English: title screen keeps "MỘT CUỘC PHIÊU LƯU NHỎ" and "Khám phá bảng cửu chương"**; "Rừng Nhân Chia" is called "Multiplication Forest" though it is the division level; top-bar sound button aria-label stays Vietnamese. Shot `qa-shots/s7-desktop-01-title-EN.png`. `src/ui/dom-template.ts`, `src/i18n/legacy-translations-en.ts`.
- **m-10 Keyboard: tabbing past the last HUD button opens the Settings dialog** (window blur → `openSettings`, kept quirk in `src/ui/keyboard-joystick.ts`). A keyboard user Tab-cycling through the HUD lands in Settings. Shot `qa-shots/s8-desktop-02-world-focus.png`.
- **m-11 Phone: one-time growth after the first city visit** (+3 geometries/+1 texture, then flat for later visits). Probably lazy world content near the city gate; same family as M-4.
- **m-12 Celebration card under-reports the reward on first completion**: forest/city show "+35 XP · +20 xu" but the wallet gets +85 XP / +30 xu (first-clear bonus +50/+10 not mentioned). Children would enjoy seeing the bonus. `src/levels/*/…-celebration.ts`, `level-run-result.ts:12`.

### Polish

- **p-1 Bridge quiz repeats facts**: 6 questions used only 3 facts (16, 2, 14 twice each on desktop; 14 three times on phone), and "2 × 1 / 1 × 1" questions are trivially easy. Hint rungs 3 and 4 repeat rung 2 verbatim; the hint button gives no sign it is exhausted.
- **p-2 City (phone): VLM's speech bubble half-covers the house number badges**; hint is a small text link (`💡 Gợi ý`, ~56×47 px) with a pulsing animation. Shot `qa-shots/s4-phone-04-round0-wrong-house.png`.
- **p-3 Forest gate on phone: the player is completely hidden behind trees** when standing at the gate; the gate's front is half covered by a tree canopy. Shot `qa-shots/s3-phone-01-at-forest-gate.png`.
- **p-4 Map in phone landscape**: region labels on the canvas overlap ("Cánh Đồng" under "Tháp Toán Học", "Làng Khởi Đầu" under "Khu Vườn Bên Sông"), the region list covers the lower half and is cut off ("THẾ GIỚI 04" clipped). Shot `qa-shots/s9-portrait-07-map-rotated.png`.
- **p-5 Square fields read oddly**: "Đúng rồi! 3 × 3 = 9, và 3 × 3 cũng bằng 9." and rung-4 hint "Xoay ruộng: 3 hàng, mỗi hàng 3 cây — số cây vẫn y như cũ!".
- **p-6 Small top-bar buttons on phone**: language/sound/settings/help 38×38, quest toggle 26 px tall (target ≥ 44).
- **p-7 Quest card on phone says "nhấn E hoặc bấm nút Vào cổng"** — E is meaningless on a phone.
- **p-8 Field level does not expose `data-max-draw-calls`** on `.level-layer` like the other three levels (test-hook consistency only).
- **p-9 Stars feel strict**: ★☆☆ after 4/5 good rounds where one used hints (field desktop, city, tower); a child doing well mostly sees 1 star.

## 3. UX notes for a 7-year-old (Vietnamese-friendly)

- Đường đi: thẻ nhiệm vụ chỉ đường rõ ("Đi theo con đường bên kia cầu…", cổng có dấu ✨), bé tìm được cổng mà không cần bản đồ. Nhưng mỗi lần mở lại game bé phải đi bộ lại từ làng — đi tới Tháp mất khoảng 65 đơn vị (≈10 giây trên máy thật, lâu hơn nếu bé chạm từng đoạn trên điện thoại: 7–13 lần chạm cho một đoạn đường trong lần chạy đầu).
- Qua cầu: bé có xu hướng đi thẳng sang bờ bên kia và bị "kẹt" ở mép sông mà không có lời nhắc nào. Nên có mũi tên/ánh sáng chỉ vào đầu cầu khi cầu đã xây xong.
- Cánh đồng: trên điện thoại ô đất quá nhỏ để ngón tay bé chạm đúng; kéo giỏ cây dễ trồng nhầm hàng. Câu "Trồng 3 hàng, mỗi hàng 6 cây" mà ruộng lại hiện 6 hàng 3 cây (M-1) sẽ làm bé bối rối đúng lúc đang học ý nghĩa phép nhân.
- Gợi ý bậc 4 ("mẹo số 10") quá dài và trừu tượng với bé lớp 2. Gợi ý bậc 3 (đếm thêm 6: 6, 12, 18…) dễ hiểu hơn nhiều.
- Rừng: cả lượt chỉ có phép chia cho 2 và lặp lại số y hệt ở lượt kế tiếp — bé dễ chán. "Gần đúng rồi" khi trả lời sai xa là lời khen sai.
- Thành phố: hiểu được, vui (bác đưa thư, bật đèn từng tầng). Khi xoay ngang điện thoại thì không thấy nhà và số nhà nữa.
- Tháp: 7 tầng là độ dài vừa phải; câu "đố vui" + bước xác nhận khi câu đúng ("Giờ che kết quả lại, bạn còn nhớ không?") hay.
- Độ dài màn: cánh đồng/rừng/thành phố 5 lượt, tháp 7 tầng — hợp lý, mỗi màn khoảng 3–5 phút với bé.
- Chuyển đổi ngôn ngữ làm game tải lại về màn hình tiêu đề — bé tưởng bị "thoát game".
- Mã lưu: phụ huynh chuyển máy sẽ thấy mất hết màn đã chơi và đồ đã mua (M-2) — dễ gây mất lòng tin.

## 4. Automated suites (real numbers)

| Suite | Result |
|---|---|
| `npm run lint` | exit 0 — 407 files, 0 errors, 9 warnings (CSS `noImportantStyles` ×3, `noDescendingSpecificity` ×6) |
| `npm run typecheck` | exit 0 |
| `npm test` (vitest) | exit 0 — 71 files, **473 / 473 passed** (2.7 s) |
| `npm run build` | exit 0 — chunk > 700 kB warning, PWA precache 46 entries (1064.72 KiB) |
| `E2E_PORT=4179 npx playwright test` | exit 1 — **62 passed, 1 failed, 1 skipped** (9.5 min). Failed: `[mobile-pixel] field-level.spec.ts:158` leak (270 → 271), reproduced 3/3 serially. Skipped: `full-chain` on mobile (desktop-only by design). |
| Parity | skipped per brief (20/20 at full-map-reviewed, unchanged) |

## 5. Performance sanity

| Where | Desktop draw calls | Phone draw calls | Memory after 3 leave cycles |
|---|---|---|---|
| World (village / bridge / fork / city gate) | 373 / 362 / 390 / 409 (start view 420) | 292 / 299 / 288 / 237 | – |
| Field | 43 (celebration 48) | 40–43 | geometries flat; **textures +2 per visit** |
| Forest | 8 | 8 | flat |
| City | 6 (max 10 in play) | 6 | flat (phone: one-time +3 geo/+1 tex) |
| Tower | 5 (max 6) | 5 | flat |

All levels are well under the 60-call budget. 0 page errors and 0 console errors across all runs.

## Unresolved questions

1. Should leaving a level midway keep per-answer coins/XP (m-8)?
2. Is "one cosmetic per tab" (wings and crown can't be worn together) intended? The shop doesn't say so when one replaces the other.
3. M-4: is the +1 mobile geometry a real phone-path field leak or a lazily built world object? Needs a diff of `renderer.info` objects before/after on mobile.
4. 9×9 / 9×10 windows building horizontal fit on phone not verified (random facts; 1 seeded try gave 6×10).
