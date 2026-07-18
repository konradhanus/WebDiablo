# Feature 015 — Enemy Horde Waves (Cannon Fodder)

**Branch:** master | **Type:** MINOR (new game mode layer)

## Overview
Add a wave-survival layer on top of the dungeon: periodic **horde waves** of
enemies spawn from the edges of the visible map, escalating in size and
toughness. A "WAVE N" banner announces each wave; surviving a wave grants bonus
XP/gold. This brings the signature Cannon-Fodder "waves of fodder" pressure to
the Diablo-style crawler.

## User Scenarios
1. Player explores; after `waveInterval` seconds the first wave triggers.
2. Banner "WAVE 1" flashes; N enemies spawn at map edges near the player.
3. Each cleared wave increments counter, short breather, then next wave (bigger).
4. Surviving grants bonus XP; HUD shows current wave + time-to-next.
5. Difficulty scales: count = base + floor*wave; tougher enemy mix deeper.

## Requirements
- R1. `this.wave={num:0, timer:INTERVAL, active:false, spawned:0, alive:0}`.
- R2. When `timer<=0` and not active: start wave — compute spawn count, set
     `active=true`, show banner, spawn enemies over the next ~2s (staggered).
- R3. Spawn points: walkable tiles near map edge / offscreen relative to camera,
     within a ring around the player.
- R4. Wave size: `count = 3 + floor*2 + wave*2` (capped). Mix: early waves
     skeletons; deeper waves add fast/brute types.
- R5. When all wave enemies dead → wave complete: bonus `xp = 20*wave`, banner
     "WAVE CLEARED", set `timer=INTERVAL` for next, `active=false`.
- R6. HUD: `#waveBar` showing "WAVE n · next in Ts" or "WAVE n — CLEAR!".
- R7. Banner element `#waveBanner` (center-top) with animation.
- R8. Only one wave "active" at a time; respects existing enemy cap (~40).
- R9. Zero deps, green tests.

## Out of Scope
- Separate "arena mode" UI (waves overlay the normal dungeon run).
- Persisting wave progress across death (resets on new run).

## Success Metrics
- `npm test` green. E2E: forcing `wave.timer=0` triggers a wave (enemy count
  rises, banner shown), clearing enemies completes wave (num increments, bonus
  XP), HUD updates, no errors. Live Pages updated.
