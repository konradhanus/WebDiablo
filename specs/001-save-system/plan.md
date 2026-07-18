# Implementation Plan: Save System

**Spec**: ./spec.md | **Game version**: → 1.1.0

## Constitution Check
- ✅ I. Zero-dep: uses only `localStorage` (native).
- ✅ II. Vanilla: no libraries.
- ✅ III. Playtest: covered by E2E (save→reload→continue).
- ✅ IV. Performance: save is throttled (interval + events), JSON is small.
- ✅ V. Data-driven: save is a plain serializable object.
- ✅ VI. Green-to-ship: unit + e2e + build gate before release.

## Technical Approach
Add a small `SaveManager` (plain functions, not a class to keep it light) exposed on
`window.__TEST__` for unit/e2e access:
- `SAVE_KEY = 'webdiablo_save_v1'`
- `saveGame(game)` → serialize {version:1, player, floor, ts} → localStorage.
- `loadGame()` → parse + validate; return state or null on any error.
- `hasSave()` → boolean.
- `clearSave()` → remove key.

Wiring:
- Call `saveGame` on floor change, on level up, and every 15s while playing.
- On boot, if `hasSave()`, inject a CONTINUE button into #startScreen that calls a new
  `game.continue()` restoring state then entering 'playing'.
- On death (`respawn`/death path), call `clearSave()`.

## Phases
- Phase 0: expose test hooks (`window.__TEST__ = { saveGame, loadGame, hasSave, clearSave }`).
- Phase 1: implement SaveManager + wiring.
- Phase 2: CONTINUE button UI.
- Phase 3: tests (unit for (de)serialize/validate; e2e for save→reload→continue).
