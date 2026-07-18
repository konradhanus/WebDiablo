# Feature 012 — Atmospheric Tile & Lighting Rework (Diablo-style)

**Branch:** master | **Type:** MINOR (visual overhaul, player-facing)

## Overview
Rebuild the dungeon's visual identity from the flat current tiles into a
cohesive dark-fantasy pixel aesthetic inspired by Diablo, while keeping the
zero-dependency single-file constraint. Introduce:
- Richer wall/floor/corridor rendering with edge shading, grout lines, and
  subtle dithering for a hand-placed pixel look.
- Dynamic torch lighting: warm radial light pools emitted from the player and
  from wall "braziers" placed in rooms (procedural, no assets).
- Persistent blood splatter decals on the floor where enemies die (Cannon
  Fodder carnage vibe), fading slowly.
- A unified dark palette (deep browns/black + ember orange + blood red).

This directly serves the "next level" rewrite brief: the game must *look* like
a premium dark-fantasy crawler, not a prototype.

## User Scenarios
1. Player descends a floor → sees textured stone walls with depth, lit floor.
2. Player walks → a warm torch glow follows them; braziers in rooms cast pools.
3. Player kills enemies → dark blood stains remain on the ground behind them.

## Requirements
- R1. Walls render with top-bevel highlight + bottom shadow + grout lines.
- R2. Floor tiles get subtle per-tile variation + occasional cracks/rubble.
- R3. Player emits a warm radial light (torch) via a light-map overlay.
- R4. Braziers: N per room (data-driven), drawn as glowing ember sources that
      contribute to the light map.
- R5. Blood decals: array of {x,y,r,age} added on enemy death; drawn under
      entities; fade over ~20s; capped (e.g. 200) for perf (Constitution IV).
- R6. No external assets; all procedural. Build + tests stay green.

## Out of Scope
- Sprite overhaul of player/enemies (later iteration).
- True shadow-casting FOV (keep current fog-of-war).

## Success Metrics
- `npm test` green.
- E2E: no console errors; braziers placed; blood array grows on kills;
  light map renders (no exceptions).
- Live Pages serves new version.
