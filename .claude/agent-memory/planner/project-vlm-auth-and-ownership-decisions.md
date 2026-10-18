---
name: project-vlm-auth-and-ownership-decisions
description: VLM math game MVP plan decisions (2026-10-18) - auth model without OTP, picture password as guard, parallel file-ownership scheme
metadata:
  type: project
---

Auth: parent = Google OAuth + email/password (NO email OTP/magic link; user decided 2026-10-18 because children don't use phones). Parent signs in once per child device; parent area behind parent gate. Child = avatar profile picker + optional picture password (3 of 9 pictures), salted hash, verified offline, a profile-switch guard, not a credential. QR pairing and teacher class codes are post-MVP.

**Why:** kids 7-9 have no email/phone; shared family devices.
**How to apply:** never re-introduce OTP in plans for this project; treat auth/sync/RLS as safety-critical (full tests).

Ownership scheme for parallel phases: levels self-register via `import.meta.glob`, strings via per-module `defineStrings(ns)`, all deps installed in scaffold phase so `package.json` is never touched in parallel. Plan: plans/261018-1803-vlm-math-game-mvp/.
