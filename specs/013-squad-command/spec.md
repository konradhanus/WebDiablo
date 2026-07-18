# Feature 013 — Squad Command (Cannon Fodder style)

**Branch:** master | **Type:** MINOR (new core mechanic)

## Overview
Introduce a Cannon-Fodder-style squad: the player can recruit up to 3
mercenaries who follow the hero, automatically attack nearby enemies, and can
die permanently (KIA — replaced by a memorial tally, the iconic Cannon Fodder
"train them up, watch them die" loop). Adds a squad HUD row and command keys.

This is the signature twist blending Diablo (solo hero) with Cannon Fodder
(squad carnage): you are not alone in the dark, but your comrades are
expendable.

## User Scenarios
1. Player presses `Q` (or clicks RECRUIT on HUD) → a mercenary spawns near them.
2. Mercenary follows the player and auto-attacks enemies in range (melee).
3. Mercenary takes damage from enemies; at 0 HP it dies (KIA) and is removed.
4. A squad tally shows recruited / alive / KIA; KIA persists for the session.
5. Player presses `R` → toggles "hold position" (mercs stop following).

## Requirements
- R1. `game.squad=[]` with cap 3; `recruitMerc()` spawns a merc near player.
- R2. Mercs follow player (simple steering) when not holding; attack enemies in
      melee range on a cooldown; deal damage via existing `hitEnemy`.
- R3. Mercs have hp; enemy attacks can target mercs (extend enemy attack to pick
      nearest of player OR merc). On merc death: remove, increment `kiaCount`.
- R4. HUD: squad pips (max 3) showing alive/dead/empty; KIA counter text.
- R5. Keys: `Q` recruit, `R` toggle hold. Buttons in HUD clickable too.
- R6. `kiaCount` shown; persists across floors (reset on new game/respawn).
- R7. Zero deps; tests green; no console errors.

## Out of Scope
- Persistent squad across browser reloads (session only).
- Merc equipment/leveling (future iteration).

## Success Metrics
- `npm test` green. E2E: recruit adds merc; merc attacks; enemy can kill merc;
  KIA increments; HUD pips reflect state; no console errors. Live Pages updated.
