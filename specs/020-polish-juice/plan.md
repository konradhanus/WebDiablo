# Plan — Feature 020: Final Polish & Juice (v2.0)

## Constitution Check
- I/II/III/IV/V/VI: ✅ all vanilla; cheap (hit-stop skips sim; FPS rolling avg).

## Approach
1. **Hit-stop**: add `this.hitStopT=0`. In `update(dt)`: if `hitStopT>0`,
   `hitStopT-=dt; this.render(); return;` (skip sim, still draw). `hitEnemy`
   death: `this.hitStopT=0.05`. Boss heavy hit: `0.08`.
2. **Camera lerp**: replace hard `camX=...;camY=...` in render with lerp.
   Keep `this.camX/this.camY` state. In render compute target then lerp.
3. **Level-up burst**: `this.levelFlash=0`. On level up (in addXp/levelup
   path) emit ring particles + `this.levelFlash=0.3`. Render white overlay
   `alpha=levelFlash` then decay in update.
4. **FPS counter**: `this.fps=0;this._fpsAcc=0;this._fpsFrames=0`. In render
   accumulate; every 0.5s compute; update `#fpsCounter` text. Toggle via
   `KeyF4` (this.fpsVisible). Add element + CSS.
5. **Death stats**: `#deathStats` in death screen; fill on death
   (floor, kills=this.carnage.kills, bosses=this.meta.bosses,
   ach=count). `Main Menu` button → `location.href='index.html'` (landing).
6. **Balance**: tune ENEMY_TYPES + spawn scaling. Lower early dmg, raise late.
   Verify floor 1 clearable in e2e (already: click-kill test).
7. **Docs**: `CHANGELOG.md` (10 iterations, versions), `README.md`.
8. **Tests**: `tests/polish.test.mjs` (hit-stop set, camera lerp code, level
   flash, fps toggle, death stats fill, changelog/readme exist). `e2e.mjs`:
   kill → hitStopT>0; level-up → flash; F4 toggle; death fills stats; no errors.
9. **Release**: MAJOR bump → v2.0.0 (game complete).

## Files
- `index.html` (hit-stop, camera, flash, fps, death stats)
- `CHANGELOG.md`, `README.md` (new)
- `tests/polish.test.mjs` (new), `tests/e2e.mjs` (extend)

## Risks
- Hit-stop skipping sim could stall if set too high — cap 0.05-0.08.
- Camera lerp needs init at player pos (first frame). Handle gracefully.
