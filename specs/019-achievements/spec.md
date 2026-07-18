# Feature 019 — Achievements & Progression

**Branch:** master | **Type:** MINOR (meta progression)

## Overview
Add a persistent **Achievements** system that rewards milestones and a light
**meta-progression** layer:
- Achievements (unlock once, persisted in localStorage): 
  - `first_blood` — defeat your first enemy
  - `boss_slayer` — defeat a boss
  - `carnage_king` — reach a 10+ kill streak (bloodlust)
  - `wave_survivor` — clear wave 3+
  - `squad_commander` — have a full squad (3 mercs) at once
  - `floor_diver` — reach floor 10
  - `untouched` — clear a floor without taking damage
- Each unlock shows a toast + plays `levelup` SFX + logs.
- **Meta-progression**: total bosses slain / deepest floor stored; a small
  permanent bonus (e.g. +2% max HP per boss slain, capped) applied on `start()`.
- **Achievements panel** (toggle with `V`) lists all with locked/unlocked
  state and description.
- No external deps; zero new network calls.

## User Scenarios
1. Player kills first enemy → "First Blood" toast + persisted.
2. Player downs boss → "Boss Slayer" + meta boss count++.
3. Reload page → achievements still unlocked; meta bonus applied.
4. Press V → panel shows progress.

## Requirements
- R1. `ACHIEVEMENTS` data array (id, name, desc, icon).
- R2. `loadAchievements()`/`saveAchievements()` via localStorage
  (`webdiablo_achievements`); `loadMeta()`/`saveMeta()` (`webdiablo_meta`).
- R3. `unlock(id)` — if not already, mark + toast + sfx + log + save.
- R4. Hook unlocks at right moments: first kill (hitEnemy death, kill count),
  boss (boss death), streak 10 (bloodlust), wave clear (wave 3+), squad full
  (recruitMerc when length===MAX_SQUAD), floor 10 (generateFloor), untouched
  (floor clear with 0 damage taken — track `floorDamageTaken`).
- R5. Meta bonus in `start()`: `player.maxHp += meta.bosses*0.02*baseMaxHp`
  (cap +20%). Applied after base stats.
- R6. Achievements panel `#achPanel` toggled by `V`; renders list with state.
- R7. Zero deps; green tests.

## Out of Scope
- Cloud sync, complex skill trees, currency economy.

## Success Metrics
- `npm test` green. E2E: unlock first_blood on kill; boss_slayer on boss death;
  achievement persists across reload; meta bonus applied; panel toggles; no
  errors. Live Pages updated.
