# Plan: Kill Counter (→1.5.0)
- Add `this.stats={kills:0,floorKills:0,gold:0,floorStart:0}`.
- Increment on enemy death; record floorStart on floor gen.
- `#statsHud` element updates each frame (throttled).
- getRunStats() computes floorTimeMs from performance.now().
- __TEST__ hook.
- Tests: unit (increment/reset), e2e (kill increments HUD).
