# Feature 014 — Blood & Gore Overhaul (Cannon Fodder carnage)

**Branch:** master | **Type:** MINOR (juice / feel overhaul)

## Overview
Amplify the visceral, Cannon-Fodder-style carnage. Current deaths are a small
particle puff. Replace with a proper gore system:
- **Blood spray** on every hit (directional, from the wound toward the attacker).
- **Gib burst** on death: chunky red/black body-parts + bone bits flung outward.
- **Carnage meter**: a session counter of kills this run + a "Bloodlust" streak
  that briefly boosts the player's damage after consecutive kills.
- Stronger **screen shake** scaled to enemy size on death.
- **Gore decals** persist (reuse Feature 012 blood array, now chunkier).

## User Scenarios
1. Player swings → blood sprays from the enemy in the hit direction.
2. Enemy dies → it bursts into gibs (particles with gravity, rotation).
3. Player gets a kill-streak → HUD shows "BLOODLUST xN" and damage rises.
4. Big enemy dies → bigger shake + bigger gib burst.

## Requirements
- R1. `hitEnemy` emits directional blood spray (color from enemy tint + red).
- R2. On death, spawn `gib` particles (type 'gib': dark-red/black chunks, gravity,
      rotation) count scaled by enemy size/boss.
- R3. `this.carnage={kills:0,streak:0,streakTimer:0}`; kill increments; streak
      resets if no kill within 4s; `bloodlustMult=1+min(streak,10)*0.05`.
- R4. `hitEnemy` damage multiplied by `bloodlustMult` (player only).
- R5. Death screen-shake scaled: `shakeIntensity = 2 + size*0.3`.
- R6. HUD: carnage readout (kills + BLOODLUST xN) in squad bar area.
- R7. Zero deps; perf: gibs are short-lived particles (existing system). Green.

## Out of Scope
- Dismemberment sprites (keep particle-based).
- Persistent gore across reloads.

## Success Metrics
- `npm test` green. E2E: hit emits spray (particles grow), death spawns gibs
  (particle count jumps), streak increments damage, HUD updates, no errors.
- Live Pages updated.
