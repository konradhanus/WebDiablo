# Plan — Feature 012: Atmospheric Tile & Lighting Rework

## Constitution Check
- I/II: ✅ procedural Canvas2D only.
- III: ✅ e2e asserts no errors + braziers/blood behavior.
- IV: ✅ blood decals capped; light map is one extra fill per frame (cheap).
- V: ✅ braziers as data; palette constants.
- VI: ✅ release gate.

## Approach
1. **Palette constants** (near GAME_VERSION):
   `WALL_TOP='#3a2a22'`, `WALL_BODY='#241812'`, `WALL_BOTTOM='#140c08'`,
   `FLOOR_A='#211913'`, `FLOOR_B='#1b140f'`, `TORCH='#ff8a3a'`,
   `BLOOD='#5a0a0a'`.
2. **Braziers (data)**: in `Dungeon.generate`, after rooms carved, for each room
   place 0–2 braziers at wall-adjacent floor tiles: `this.braziers.push({x,y})`.
   Expose `this.braziers=[]` in constructor.
3. **Light map**: in `Game.render`, after drawing tiles but before entities,
   build a radial-gradient light overlay from: player position (torch) + each
   brazier (warm pool). Use `globalCompositeOperation` tricks OR simpler: draw a
   dark overlay, then `lighter` radial gradients for light sources. Keep it to
   one full-canvas pass.
   - Implement: fill canvas with `rgba(0,0,0,.82)` (ambient dark), then for each
     light source `ctx.globalCompositeOperation='lighter'`; radial gradient
     warm→transparent; reset to `source-over`. This yields torch-lit pools.
4. **Blood decals**: add `this.bloods=[]` in Game constructor. In `hitEnemy`
   on death, push `{x:e.x,y:e.y,r:6+rand*6,age:0}`. In `update`, age them,
   drop when age>20 or length>200 (shift oldest). In `render`, draw under
   entities as dark-red soft blobs with alpha by age.
5. **Tile drawing upgrade** in `render()` tile loop:
   - WALL: fill body, draw 2px top highlight `WALL_TOP`, 3px bottom shadow
     `WALL_BOTTOM`, plus 1px vertical grout seams every few tiles.
   - FLOOR: alternate `FLOOR_A/B` by (x+y)%2; occasional crack (deterministic
     by tile hash) as thin dark line; rubble dot.
   - Keep fog-of-war logic intact.
6. **Tests**:
   - `tests/tiles.test.mjs`: HTML/script contains new palette consts +
     braziers array init + bloods array init + lighter-composite light code.
   - Extend `e2e.mjs`: start game, assert `game.dungeon.braziers.length>0`,
     kill an enemy via update, assert `game.bloods.length>0`.
7. **Perf**: blood cap 200; braziers capped by rooms (fine).

## Files
- `index.html` (palette, Dungeon.braziers, Game.bloods, render tile+light+blood)
- `tests/tiles.test.mjs` (new)
- `tests/e2e.mjs` (extend)

## Risks
- Light overlay with `lighter` could wash out; tune ambient alpha + radius.
- Must not break fog-of-war (draw light before entities, after tiles; fog still
  applies to tile visibility separately). Keep existing vignette after.
