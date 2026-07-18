# Plan — Feature 011: Landing Page + XP Bug Fix

## Constitution Check
- I (zero-dep single-file): ✅ only inline HTML/CSS/JS added.
- II (vanilla platform): ✅ DOM + Canvas only.
- III (playtest-first): ✅ e2e covers landing + click-kill XP.
- IV (60fps): ✅ static overlay, no per-frame cost.
- V (data-driven): ✅ feature bullets are data; creator/date constants.
- VI (green-to-ship): ✅ release.mjs gate.

## Approach
1. **Add `CREDIT` constants** near GAME_VERSION: `CREATOR='Konrad Hanus'`,
   `CREATED='July 2026'`.
2. **Add `#landingScreen` overlay** in HTML (before `#startScreen` so it shows
   first). Pixel-dark styling: title glow, feature list, credit line, big PLAY
   button. Include a small "how to play" hint.
3. **Wire PLAY button** → `document.getElementById('landingScreen').style.display='none'; game.start();`
   Reuse existing `game.start()`.
4. **Ensure game starts from landing, not start screen.** Currently `startScreen`
   is the entry. Change entry order: landing shown first; start screen can stay
   as internal but we hide it and drive via landing. Simplest: keep `startScreen`
   hidden, show `landingScreen` on load; PLAY triggers `game.start()` which
   already hides `startScreen`.
5. **Fix XP bug**: Remove the duplicate inline kill block in `mousedown`. Instead,
   set `game.mouse.down=true` and let `update()` → `meleeAttack()` → `hitEnemy()`
   handle damage + XP. This unifies the path and removes `game.xpGain`.
   - Keep crit floating text by moving crit logic into `hitEnemy` (it already
     has crit). So inline handler only sets `mouse.down`.
6. **Tests**:
   - `tests/landing.test.mjs`: unit-ish — verify `#landingScreen` exists in HTML
     and PLAY button calls start (use DOM parse / regex for button wiring).
   - Extend `tests/e2e.mjs`: landing visible on load; after PLAY, state=playing;
     simulate a click-kill and assert `p.xp` increased.

## Files
- `index.html` (HTML + CSS + JS edits)
- `tests/landing.test.mjs` (new)
- `tests/e2e.mjs` (extend)

## Risks
- Landing covering canvas may block initial audio init gesture — `game.start()`
  calls `audio.init()` on click, so gesture requirement satisfied.
