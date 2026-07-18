# Plan — Feature 019: Achievements & Progression

## Constitution Check
- I/II/III/IV/V/VI: ✅ all vanilla, localStorage, cheap.

## Approach
1. **Data**: `ACHIEVEMENTS=[{id,name,desc,icon},...]` (7 entries). `META_KEY`,
   `ACH_KEY` localStorage keys.
2. **Storage helpers**: `loadAchievements()` returns Set/obj; `saveAchievements(a)`;
   `loadMeta()` → `{bosses:0,deepest:1}`; `saveMeta(m)`.
3. **unlock(id)**: if already in `this.achievements` return; add; save;
   `this.toast(name,icon)`; `audio.play('levelup')`; `logMsg`.
   `toast()` creates a transient DOM element (#toast container) auto-removed.
4. **Hooks**:
   - `hitEnemy` death: after `this.carnage.kills++`, if kills===1 →
     `unlock('first_blood')`. If `this.carnage.streak>=10` → `unlock('carnage_king')`.
     If `e.boss` → `unlock('boss_slayer')` + `meta.bosses++` + saveMeta.
   - `startWave` clear (wave 3+): `unlock('wave_survivor')` (in check at w.num>=3).
   - `recruitMerc`: after push, if `this.squad.length===MAX_SQUAD` →
     `unlock('squad_commander')`.
   - `generateFloor`: if `this.floor>=10` → `unlock('floor_diver')`. Track
     `this.floorDamageTaken=0` per floor; on player damage increment; on floor
     clear (stairs) if 0 → `unlock('untouched')`.
   - meta bonus in `start()`: after player base stats, `const bonus=Math.min(0.2,
     meta.bosses*0.02); player.maxHp=Math.floor(player.maxHp*(1+bonus)); player.hp=player.maxHp;`
5. **Panel**: `#achPanel` (hidden) + `toggleAchPanel()` bound to `KeyV`. Renders
   list: locked = grey "???", unlocked = name+desc+icon. Show progress
   `X/7`.
6. **CSS**: toast (top-center, fade), achPanel (center modal, dark).
7. **Tests**: `tests/achievements.test.mjs` (data, unlock idempotent, meta bonus
   capped, hooks referenced, panel toggle, storage keys). `e2e.mjs`: kill→
   first_blood; boss death→boss_slayer+meta; reload persists; V toggles panel;
   no errors.
8. **Perf**: localStorage writes cheap; toasts capped.

## Files
- `index.html` (ACHIEVEMENTS, storage, unlock/toast, hooks, panel, CSS, V key)
- `tests/achievements.test.mjs` (new), `tests/e2e.mjs` (extend)

## Risks
- localStorage in headless: available; tests wrap in try.
- Reload persistence: e2e reloads page and checks.
