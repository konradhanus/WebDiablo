# Plan: Pause & Menu (→1.4.0)
- Add `#pauseScreen` overlay (hidden by default).
- `game.pause()` sets state='paused', shows overlay; `update()` early-returns when paused.
- `game.resume()` restores 'playing'.
- ESC key toggles (only in playing/paused).
- Quit → show startScreen, state='menu'.
- Expose `window.__TEST__.pause API`.
- Tests: unit (state transitions), e2e (ESC pauses, enemies frozen, resume).
