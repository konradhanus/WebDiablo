# Plan 022 — Brighter, Winding, Richer Dungeons

## Constitution Check
- **I. Zero-Dependency, Single-File** ✓ — all changes stay inside `index.html`
  (palette tweak, `Dungeon` methods, new tile render). No new deps, no build step.
- **II. Vanilla Web Platform** ✓ — Canvas2D + existing `ParticleSystem`/`AudioEngine`.
  No framework.
- **III. Playtest-First** ✓ — E2E (`tests/e2e.mjs`) will assert zero console errors,
  brighter ambient, and generated content via `__TEST__` hooks; manual smoke in browser
  before release.
- **IV. Performance Budget** ✓ — new per-tile objects (traps/chests/altars) are
  bounded arrays iterated with off-screen culling already in place; no per-frame
  allocations beyond existing patterns.
- **V. Data-Driven, Simple Code** ✓ — traps/chests/altars expressed as data arrays
  + a generic `interactables` list; rendering is a single switch on `TILE`/type.
- **VI. Green-to-Ship** ✓ — pipeline: e2e → build-check → unit → bump → push → deploy.
  This plan produces the spec + tasks + impl + tests that feed that gate.

## Technical Approach

### A. Brighter lighting (FR1)
Edit `PAL` (line ~348) and the render path (2187–2380):
- `PAL.ambient` alpha `0.82 → 0.42` (lighter global dark).
- Player light radius `r:6.5 → 9`, brazier `r:4.5 → 6` (bigger pools).
- Ambient gradient (2368): outer alpha `0.7 → 0.42`, mid `0.3 → 0.2`.
- Vignette (2378): outer alpha `0.5 → 0.28`.
Mood stays dark-fantasy but is clearly readable.

### B. Winding corridors (FR2)
Rewrite `carveCorridor(x1,y1,x2,y2)` to:
- Carve 3 tiles wide (was 2) for a roomier feel.
- Route via 2–3 random waypoints (multi-bend) instead of a single L.
- With ~25% chance, add a forked branch to a random offset (labyrinth feel).
Keep `TILE.CORRIDOR` so `isWalkable` stays valid. Add `carveWinding` helper used by
the MST connect loop. Guarantee connectivity by keeping the existing spanning-tree
connectivity check.

### C. Richer dungeons (FR3)
Add to `TILE`: `TRAP:7, CHEST:8, ALTAR:9, SECRET:10`.
- `carveCorridor`/`isWalkable`: traps/chests/altars/secret-caches are walkable-ish —
  treat CHEST/ALTAR/SECRET as blocking (entities stop on them) but TRAP walkable.
  Simpler: keep them as FLOOR underneath + an `interactables[]` entry, so movement
  logic is untouched and we avoid `isWalkable` churn. (Chosen: floor-based objects.)
- In `Dungeon.generate`: after carving, scatter (counts scale with floorNum):
  - traps: `2 + floorNum/2` on corridor/room tiles (hidden until stepped).
  - chests: `1 + floor/3` on room tiles → drop loot on open (reuse loot table).
  - altars: `1 + floor/4` on room tiles → heal + temp buff on interact.
  - secret caches: `floor%2===0 ? 1 : 0` behind a SECRET wall tile (revealed by bump).
- Expose `this.interactables = []` (traps/chests/altars) and `this.secrets = []`.
- Render in `renderWorld`: draw chest (box icon), altar (glow), trap (subtle floor
  rune, brighter after triggered), secret wall (cracked wall).
- Interaction: extend `interact()` (E key) to handle chest/altar; trap triggers on
  `updatePlayer` movement into its tile (damage + screen shake + sfx).

### D. Testability hooks (FR4)
Extend `window.__TEST__` with `makeDungeon(w,h,floor)` returning a `Dungeon` instance
after `generate`, plus `TILE` and `PAL` (already global, but expose for e2e). E2E reads
`PAL.ambient` to assert brightness and counts `interactables`/traps on a generated floor.

## Phases
1. Spec + plan + tasks (this file).
2. Implement lighting + corridor + content changes in `index.html`.
3. Add `__TEST__` hooks + `tests/dungeon022.test.mjs` (unit) + e2e assertions.
4. `npm test` green.
5. `node scripts/release.mjs minor "brighter winding richer dungeons"` → deploy.
6. Write `webdiablo-dev-deploy` skill capturing the loop.
