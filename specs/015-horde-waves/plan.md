# Plan — Feature 015: Enemy Horde Waves

## Constitution Check
- I/II: ✅ vanilla.
- III: ✅ e2e drives wave start/clear.
- IV: ✅ spawn count capped; wave ends when cleared.
- V: ✅ wave as data.
- VI: ✅ gate.

## Approach
1. **State**: `this.wave={num:0,timer:25,active:false,toSpawn:0,spawnCd:0}`.
   Interval constant `WAVE_INTERVAL=25`.
2. **updateWaves(dt)** called in `update()`:
   - if active: decrement `spawnCd`; if `toSpawn>0 && spawnCd<=0`, spawn one
     enemy at a staggered spawn point, `toSpawn--`, `spawnCd=0.25`.
     When `toSpawn==0 && aliveWaveEnemies==0` → complete wave (bonus xp, banner,
     `active=false`, `timer=WAVE_INTERVAL`, `num++`).
   - else: `timer-=dt`; if `timer<=0` → `startWave()`.
3. **startWave()**: `num++`, compute `count=Math.min(40,3+floor*2+num*2)`,
   choose enemy template mix based on `floor`+`num`, set `toSpawn=count`,
   `active=true`, `spawnCd=0`, show banner `WAVE n` via `showBanner()`.
4. **Spawn point**: pick random angle around player at radius ~10-14 tiles,
   find nearest walkable tile; fallback to player+offset.
5. **Enemy templates**: reuse ENEMY_TYPES; for wave pick from a weighted list
   scaling with depth (skeleton early; add 'fast' (rat/wraith), 'brute'
   (orc/ogre) deeper). Mark wave enemies with `e.wave=true` for counting.
6. **HUD**: `#waveBar` text `WAVE ${num} · next ${ceil(timer)}s` or
   `WAVE ${num} — INCOMING` while active. `updateUI` refreshes (or a lightweight
   per-frame update in render to avoid spamming DOM — use a dedicated
   `updateWaveHud()` called each frame, throttled).
7. **Banner**: `#waveBanner` element; `showBanner(text,cls)` sets text + adds
   'show' class, removes after 1.8s.
8. **Wave complete bonus**: `player.xp += 20*wave.num; logMsg; showBanner('WAVE
   CLEARED','clear')`.
9. **Tests**:
   - `tests/waves.test.mjs`: wave state init, startWave logic (count formula,
     active flag, banner call), complete logic (xp bonus, reset), HUD element
     ids, updateWaves called in update.
   - `e2e.mjs`: start; force `wave.timer=0; update(0.1)` → active true + enemies
     increased + banner visible; kill all wave enemies via repeated
     `hitEnemy`/update → wave complete (num incremented, xp gained); no errors.
10. **Performance**: staggered spawn avoids spike; enemy cap respected.

## Files
- `index.html` (wave state, updateWaves, startWave, spawn helper, HUD, banner,
  updateUI hook)
- `tests/waves.test.mjs` (new), `tests/e2e.mjs` (extend)

## Risks
- Spawn point inside wall → enemy stuck; use isWalkable search + fallback.
- Wave never completes if an enemy flees off and is unkillable — wave enemies
  have no flee state / always chase, so they die. Fine.
