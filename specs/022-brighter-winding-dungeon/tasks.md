# Tasks 022 — Brighter, Winding, Richer Dungeons

## A. Brighter lighting (FR1)
- [ ] A1. Lower `PAL.ambient` alpha 0.82 → 0.42 in `index.html`.
- [ ] A2. Raise player light radius 6.5 → 9 and brazier radius 4.5 → 6.
- [ ] A3. Weaken ambient gradient outer 0.7 → 0.42, mid 0.3 → 0.2.
- [ ] A4. Weaken vignette outer 0.5 → 0.28.

## B. Winding corridors (FR2)
- [ ] B1. Add `carveWinding(x1,y1,x2,y2)` — 3-wide, 2–3 random waypoints, ~25% fork.
- [ ] B2. Replace `carveCorridor` calls in `generate()` MST loop with `carveWinding`.
- [ ] B3. Keep single-L `carveCorridor` as fallback; verify all rooms stay connected.

## C. Richer dungeons (FR3)
- [ ] C1. Extend `TILE` with TRAP/CHEST/ALTAR/SECRET (numeric, unused by isWalkable).
- [ ] C2. Add `this.interactables=[]`, `this.secrets=[]` to `Dungeon` constructor.
- [ ] C3. Scatter traps/chests/altars/secrets in `generate()` (counts scale w/ floor).
- [ ] C4. Render chest/altar/trap/secret in `renderWorld`.
- [ ] C5. Wire interaction: E opens chest (loot), altar (heal+buff); trap triggers on step.
- [ ] C6. Reuse existing loot table + `floatingText`/`particles`/`audio` for feedback.

## D. Testability + tests (FR4)
- [ ] D1. Expose `makeDungeon`, `TILE`, `PAL` via `window.__TEST__`.
- [ ] D2. Add `tests/dungeon022.test.mjs`: winding path has ≥2 bends, stairs reachable,
       floor has ≥1 chest/altar/trap.
- [ ] D3. Extend `tests/e2e.mjs`: assert `PAL.ambient` brighter + generated content present,
       zero console errors.

## E. Gate + ship
- [ ] E1. Run `npm test` — must be fully green.
- [ ] E2. `node scripts/release.mjs minor "brighter winding richer dungeons"`.
- [ ] E3. Verify live URL serves new version.

## F. Skill
- [ ] F1. Write `webdiablo-dev-deploy` skill capturing spec→plan→tasks→impl→test→release loop.
