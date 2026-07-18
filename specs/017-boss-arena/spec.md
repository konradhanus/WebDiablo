# Feature 017 — Boss Arena & Boss Mechanics (Diablo)

**Branch:** master | **Type:** MINOR (new end-game content)

## Overview
Add a proper boss encounter: every 5th floor (5,10,15…) is a **Boss Arena** —
a large sealed room. A brutal boss with **phased mechanics** awaits:
- Phase 1 (100–66% HP): melee + periodic **shockwave AoE** (telegraphed ring).
- Phase 2 (66–33%): adds **summoned minions** + **charge attack** (telegraph
  line, then dash).
- Phase 3 (<33%): **enrage** — faster, **rain of fire** AoE bombs.
Boss death drops **guaranteed rare+ loot** + big XP + advances floor. Boss has
a dedicated HP bar at top-center and a dramatic entrance banner.

## User Scenarios
1. Player descends to floor 5 → boss arena generated, gates seal.
2. Boss banner "THE <NAME> AWAKENS"; boss HP bar appears.
3. Player fights; boss uses telegraphed attacks the player must dodge.
4. Boss dies → loot chest + "VICTORY" + floor advance, gates open.
5. Player dies → normal death screen.

## Requirements
- R1. `generateFloor()` detects `floor%5===0` → build arena (big room, seal
     exits) and spawn ONE boss via `spawnBoss(type)`.
- R2. Boss object extends enemy with `boss:true`, `phase:1`, `atkTimer`,
     `ability:null`, `telegraph:0`, unique `name`/`icon`/`color`.
- R3. Boss AI in `updateEnemies` (boss branch): cycle abilities by phase;
     telegraph then execute. Abilities:
     - `shockwave`: ring particles + damage if player within radius.
     - `summon`: spawn 2-3 minions (reuse spawnEnemy).
     - `charge`: set velocity toward player's telegraphed pos; high damage on
       contact.
     - `firerain`: spawn falling bombs (projectiles type 'firebomb') at random
       nearby tiles.
- R4. Phase transitions at 66%/33% HP: brief invuln + banner + sound.
- R5. Boss HP bar `#bossBar` (top-center, below wave bar) visible only during
     boss; `updateUI`/`render` refreshes width.
- R6. Boss death: guaranteed `generateItem` with rarity >= rare; XP bonus =
     `100*floor`; gates open (mark stairs reachable); "VICTORY" banner.
- R7. Zero deps; perf: cap minions; AoE checks cheap. Green.

## Out of Scope
- Multiple bosses per arena, boss variety beyond 1 template (scale name by
  floor). Multi-phase for normal enemies.

## Success Metrics
- `npm test` green. E2E: forcing floor=5 generates arena+boss (boss exists,
  bossBar shows), damaging boss to 33% triggers phase 3 (enrage flag), killing
  boss drops loot + advances state, no errors. Live Pages updated.
