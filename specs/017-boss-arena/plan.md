# Plan — Feature 017: Boss Arena & Boss Mechanics

## Constitution Check
- I/II: ✅ Canvas + DOM.
- III: ✅ e2e drives boss spawn/phase/death.
- IV: ✅ minion cap; AoE cheap.
- V: ✅ boss as data.
- VI: ✅ gate.

## Approach
1. **Boss template**: add `BOSS_TYPES` array (name/icon/color/size/dmg/hp by
   floor). `spawnBoss(floor)` picks template, builds boss object with
   `boss:true,phase:1,atkTimer:2,ability:null,telegraph:0,enraged:false,
   summonCd:0`.
2. **Arena generation**: in `generateFloor()`, after normal gen, if
   `floor%5===0`: clear a 13x13 region at center, wall it, place boss at
   center, place player at entrance, place stairs behind boss. Set
   `this.bossArena=true`. (Keep simple: reuse room carve; seal with walls;
   stairs INSIDE arena so player must kill boss to reach — or open after.)
   Simpler: spawn boss in the largest room; on boss death, reveal stairs.
3. **Boss AI**: extend `updateEnemies` with `if(e.boss){ this.updateBoss(e,dt);
   continue; }`. `updateBoss(e,dt)`:
   - phase check: if hp<33% & phase<3 → phase=3, enraged=true, banner, sound.
     if hp<66% & phase<2 → phase=2.
   - `atkTimer-=dt`; if<=0 pick ability by phase, start telegraph
     (`e.telegraph=0.8`, `e.pendingAbility=...`); when telegraph done, execute.
   - execute: shockwave (damage in radius + particles), summon (spawnEnemy x2),
     charge (set e.charge=true, dir to player; in move step dash), firerain
     (spawn 4 firebomb projectiles at random offsets).
   - movement: toward player (slower); if charging, faster dash.
4. **Damage to player**: reuse existing enemy-attack path (boss has attackRange
   big). For AoE, direct HP subtraction with invuln check.
5. **Boss HP bar**: `#bossBar` (hidden default). In `render()` or `updateUI`,
   if `this.bossArena && boss alive` show + set width = hp/maxHp. Hide else.
6. **Boss death**: in `hitEnemy` death branch, if `e.boss`: set
   `this.bossArena=false` (gates open / stairs revealed), drop guaranteed rare
   item, `player.xp += 100*floor`, banner "VICTORY", sound boss. (Reuse loot
   drop but force rarity.)
7. **HUD/CSS**: `#bossBar` top-center (below waveBar ~top:110px), dark red gradient,
   boss name label, segmented.
8. **Tests**:
   - `tests/boss.test.mjs`: boss template/spawn, arena on floor%5, boss branch
     in updateEnemies, phase transitions, bossBar element, boss death loot.
   - `e2e.mjs`: set floor=5; start; assert boss exists + bossBar visible;
     set boss.hp to 30% → update → phase 3/enraged; kill boss → loot dropped +
     bossArena false; no errors.
9. **Perf**: minion cap 6; AoE = distance check only.

## Files
- `index.html` (BOSS_TYPES, spawnBoss, arena gen, updateBoss, boss HP bar,
  boss death, CSS, updateUI/render hook)
- `tests/boss.test.mjs` (new), `tests/e2e.mjs` (extend)

## Risks
- Arena gen complexity: keep it as "boss in central room + stairs locked until
  dead". Simpler & robust.
- Boss AoE hitting through walls: only damage if line-of-sight-ish (skip LOS,
  just radius — fine for arena).
