# Plan — Feature 014: Blood & Gore Overhaul

## Constitution Check
- I/II: ✅ particle system extension, no deps.
- III: ✅ e2e checks particles + HUD.
- IV: ✅ gibs are short-lived; capped by particle array reuse.
- V: ✅ carnage as data.
- VI: ✅ gate.

## Approach
1. **Particle 'gib' type**: extend `Particle` draw to handle `type==='gib'`
   (draw a small rotated rect in dark red/black). Add gravity already in update
   (vy+=80*dt) — good. Add `rotSpeed` (already present).
2. **Blood spray in hitEnemy**: when applying damage, emit ~6 particles
   `type:'circle'` red, angle biased away from player→enemy direction (i.e.
   from enemy outward toward attacker is reversed; spray should go from enemy
   away from attacker). Compute `ang=atan2(e.y-p.y,e.x-p.x)` and emit spread.
   Currently hitEnemy already emits blood circle particles — enhance count/color
   and add directional spray.
3. **Gib burst on death**: in `hitEnemy` death branch, emit
   `count = e.boss?40:(8+e.size)` gibs with `colors:['#7a0a0a','#4a0606','#1a1a1a']`,
   type 'gib', speed 120-200, life .8-1.4, size 2-5.
4. **Carnage state**: add `this.carnage={kills:0,streak:0,streakTimer:0}` in
   constructor. In `update(dt)` decrement streakTimer; if <=0 reset streak=0.
   In `hitEnemy` death: `this.carnage.kills++; this.carnage.streak++;
   this.carnage.streakTimer=4;`.
5. **Bloodlust damage**: `bloodlustMult=1+Math.min(this.carnage.streak,10)*0.05`.
   In `hitEnemy`, multiply `actualDmg` by bloodlustMult (player melee). Keep
   projectile/fireball separate (don't multiply) for balance clarity, or apply
   to all player damage — apply to melee + fireball both via a helper
   `this.playerDamage(dmg)`.
6. **Shake on death**: set `this.shakeTimer=Math.max(this.shakeTimer,.25);
   this.shakeIntensity=Math.max(this.shakeIntensity, 2+e.size*0.3);` on death.
7. **HUD**: extend `#squadBar` (or add `#carnageBar`) showing
   `Kills: N  BLOODLUST xS` where S=streak if >1 else hidden. Update in
   `updateUI`.
8. **Tests**:
   - `tests/gore.test.mjs`: gib type handling in Particle draw (regex for
     'gib'), carnage state init, bloodlust mult computation, shake scaling.
   - `e2e.mjs`: start; record particle count; do a kill; assert particle count
     increased (gibs) and carnage.kills incremented and bloodlustMult>1 after
     streak; HUD carnage text updates; no errors.
9. **Perf**: gibs short-lived; particle array naturally bounded by removal.

## Files
- `index.html` (Particle gib draw, hitEnemy spray+gibs+bloodlust+shake, carnage
  state+update, HUD carnage, updateUI)
- `tests/gore.test.mjs` (new), `tests/e2e.mjs` (extend)

## Risks
- Multiplying all damage by bloodlust could trivialise game; cap at +50% (streak
  10). Fine.
- Particle count spikes on boss death (40 gibs) — acceptable, short-lived.
