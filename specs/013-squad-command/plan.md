# Plan — Feature 013: Squad Command (Cannon Fodder style)

## Constitution Check
- I/II: ✅ vanilla Canvas + DOM.
- III: ✅ e2e exercises recruit/attack/KIA.
- IV: ✅ squad capped at 3; cheap steering.
- V: ✅ merc as data object; keys data-driven map.
- VI: ✅ gate.

## Approach
1. **State**: add to `Game` constructor: `this.squad=[]; this.kiaCount=0; this.squadHold=false;`
   Add `MAX_SQUAD=3` const. Add `recruitMerc()`, `updateSquad(dt)`, `mercDie(m)`.
2. **Merc object**: `{x,y,hp,maxHp,dmg,speed,attackCd,state:'follow',dead:false,
   name, color}` generated near player (offset).
3. **recruitMerc()**: if squad.length<MAX_SQUAD push new merc at player +- random
   offset; play 'levelup' sfx; log "Recruited <name>".
4. **updateSquad(dt)**: for each alive merc:
   - if !squadHold: steer toward player (if dist>1.5) with speed*dt, sliding
     collision (reuse isWalkable checks).
   - find nearest enemy within aggro (e.g. 4 tiles); if in attack range (<1.5)
     and attackCd<=0: call `this.hitEnemy(e, merc.dmg)`; attackCd=0.8.
   - else move toward enemy if within 6 tiles.
5. **Enemy targeting**: in `updateEnemies`, when choosing attack target, pick
   nearest among [player, ...alive mercs]. Currently enemies attack `this.player`.
   Refactor: compute `targets=[player, ...squad.filter(alive)]`; nearest target
   for movement + attack. Enemy attack applies damage to that target (merc hp or
   player hp). Keep player death logic; if merc hp<=0 → mercDie.
6. **mercDie(m)**: mark dead, remove from squad, `kiaCount++`, particle burst,
   log "KIA: <name>". (Cannon Fodder memorial.)
7. **HUD**: add `#squadBar` container (bottom-left above combat log) with 3 pip
   divs + KIA text. `updateUI` refreshes pips (alive=gold, dead/dismissed=dim,
   empty=hollow) and KIA count.
8. **Input**: keydown `KeyQ`→recruitMerc; `KeyR`→toggle squadHold. HUD buttons
   `recruitBtn`, `holdBtn` onclick.
9. **Render**: draw mercs like player but smaller, distinct color, with small HP
   bar; if squadHold show a "HOLD" marker.
10. **Tests**:
   - `tests/squad.test.mjs`: MAX_SQUAD const, squad array init, recruitMerc
     pushes (cap 3), mercDie increments kiaCount, keys Q/R wired.
   - `e2e.mjs`: start; recruit 3 (cap); spawn enemy; run updates; assert a
     merc can die and kiaCount increases; HUD pip count = 3.
11. **Edge**: squad reset on `start()`/`respawn()` (new run). `continue()` keeps
    session squad? Keep simple: squad starts empty each run (session KIA reset on
    new game only, not floor change).

## Files
- `index.html` (state, recruitMerc, updateSquad, mercDie, enemy retarget, HUD,
  input, render)
- `tests/squad.test.mjs` (new), `tests/e2e.mjs` (extend), `specs/013-...`

## Risks
- Enemy retarget refactor touches combat balance; keep damage numbers same.
- Merc steering perf negligible (<=3 entities).
