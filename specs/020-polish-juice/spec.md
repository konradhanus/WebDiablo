# Feature 020 — Final Polish & Juice (v2.0)

**Branch:** master | **Type:** MAJOR (polish + stability + docs)

## Overview
Final pass to make WebDiablo feel *finished*:
- **Hit-stop**: micro freeze (~40-60ms) on impactful hits/kills for weight.
- **Camera**: smooth follow (lerp toward player) instead of hard snap.
- **Level-up burst**: particle ring + screen flash on level up.
- **FPS counter**: lightweight top-right stat (toggle with `F4`).
- **Game-over / victory stats**: death screen shows floor reached, kills,
  bosses slain, achievements; main menu button.
- **Balance pass**: tune enemy HP/dmg scaling so floors 1-15 feel fair; ensure
  early floors aren't brutally hard and late floors ramp.
- **Changelog + README**: `CHANGELOG.md` (all 10 iterations), `README.md`
  (how to run, controls, features). Keep zero-dep.
- **Regression guard**: full e2e + unit green.

## User Scenarios
1. Killing an enemy → tiny hit-stop + shake → feels impactful.
2. Camera glides smoothly; no jitter.
3. Level up → ring of particles + brief flash.
4. Press F4 → FPS overlay.
5. Die → stats screen with summary + Main Menu.
6. `README.md` documents controls/features/run.

## Requirements
- R1. `hitStop(t)` sets `this.hitStopT`; `update()` decrements and skips sim
  while >0 (but still renders). Applied on kill + heavy boss hits.
- R2. Camera: `this.camX = lerp(camX, targetX, 0.12)` each frame in render.
- R3. `levelFlash` timer; on level up emit ring + set flash. Render white
  overlay alpha = flash.
- R4. FPS: rolling avg; `#fpsCounter` updated in render; toggle F4.
- R5. Death screen rewrite: fill stats (floor, kills, bosses, achievements
  count) into `#deathStats`. Main Menu reloads to landing.
- R6. Balance: adjust `ENEMY_TYPES` base stats/scaling; verify floors 1-10
  beatable in e2e smoke (player can clear floor 1).
- R7. `CHANGELOG.md`, `README.md` created.
- R8. Zero deps; green tests.

## Out of Scope
- New content; art overhaul beyond polish.

## Success Metrics
- `npm test` green. E2E: hit-stop set on kill; camera lerp; level-up flash;
  FPS toggle; death stats filled; no errors. README/CHANGELOG present. Live
  Pages on v2.0.0.
