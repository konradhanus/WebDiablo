# Spec 022 — Brighter, Winding, Richer Dungeons

## WHY
The game currently feels too dark and too empty. Player feedback (Konrad, 2026-07-18):
"The game is too dark — make it brighter. It's boring and pointless now; earlier there
were cool corridors. Add more cool stuff." The dungeon is a flat set of rooms joined by
thin L-shaped 2-tile corridors, with near-black ambient overlay (alpha 0.82) and small
light pools. This kills readability and exploration feel. We want the original "cool
corridor" vibe back: brighter, more winding layouts, and more things to discover.

## WHAT (testable Functional Requirements)
- **FR1 — Brighter lighting.** The global ambient darkness overlay must be substantially
  lighter, player light radius larger, brazier light radius larger, and the edge vignette
  and ambient gradient noticeably weaker — so the playfield is clearly readable while
  keeping an atmospheric (not pitch-black) mood.
- **FR2 — Winding corridors.** Corridors between rooms must be wider and take more than
  a single L-bend — they should wind (multi-bend) and occasionally fork, producing a
  labyrinth feel instead of straight L connectors. All rooms must remain fully connected.
- **FR3 — Richer dungeons (more stuff).** Each floor must contain discoverable content
  beyond rooms/stairs:
  - **Traps** — hidden floor hazards that damage the player when stepped on (telegraphed
    after first trigger or via nearby visual cue).
  - **Treasure chests** — openable containers that drop loot.
  - **Altar shrines** — interactable objects that grant a buff (heal / temporary
    damage or speed boost).
  - **Secret walls** — walls that can be revealed/opened to expose a hidden cache.
- **FR4 — No regressions.** Build gate, all existing unit tests, and E2E must stay green.
  New tile types must be integrated with `isWalkable` / rendering and the `Dungeon`
  serializer used by tests.

## Success Criteria
- `npm test` is fully green (build + unit + e2e) after the change.
- Visually: ambient overlay alpha is ~0.45 or lower; player light radius ≥ 9 tiles;
  brazier radius ≥ 6 tiles; vignette alpha ≤ 0.3.
- Dungeon generation produces corridors with ≥ 2 bends on average and occasional forks;
  rooms stay connected (reachable from spawn to stairs).
- Every generated floor contains ≥ 1 chest, ≥ 1 altar, and ≥ 1 trap (per-floor counts
  scale mildly with floor number).
- A unit test asserts `carveCorridor` produces multi-bend paths and `Dungeon.generate`
  yields reachable stairs; an E2E test asserts brighter ambient (reads `PAL.ambient`) and
  that generated floors contain chests/altars/traps via `__TEST__` hooks.

## Out of scope
- New enemy types, new classes, new audio, mobile/touch changes (handled in 021).
- Balance overhaul of combat numbers beyond what traps/altars require.
