# Feature Specification: Save System (localStorage)

**Feature Dir**: specs/001-save-system
**Created**: 2026-07-18
**Game version target**: 1.1.0 (MINOR — new player-facing feature)

## Overview
Players lose all progress when they close or refresh the game. This feature persists the
player's run to the browser's local storage so they can continue where they left off.

## User Scenarios & Testing
1. A player kills enemies, levels up, then closes the tab. On reopening, the game offers to
   **Continue** from the saved state.
2. A player who has no save sees only "ENTER THE DEPTHS" (new game).
3. When the player dies, the save is cleared (no continuing a dead run).

## Functional Requirements
- FR1: The game MUST auto-save the player's state (level, hp, mp, xp, floor, gold, potions,
  equipped items, position) at key moments (floor change, level up, on interval).
- FR2: On load, if a valid save exists AND the player is not dead, the start screen MUST show
  a **CONTINUE** button that restores the saved state.
- FR3: On death, the save MUST be cleared.
- FR4: The save MUST be namespaced and versioned (`webdiablo_save_v1`) to tolerate future
  format changes gracefully (invalid/old saves are ignored, not crashed on).
- FR5: A helper `hasSave()` MUST return whether a valid save exists (for UI + testing).

## Success Criteria
- SC1: A player can close the game and resume with the same level and floor 100% of the time.
- SC2: Loading the game with no save never shows a broken Continue button.
- SC3: A corrupt/invalid save never crashes the game (graceful fallback to new game).

## Key Entities
- **SaveState**: `{ version, player, floor, timestamp }` stored as JSON in localStorage.

## Assumptions
- Single save slot is sufficient (no multiple profiles).
- localStorage is available (standard evergreen browsers per constitution).

## Out of Scope
- Cloud sync, multiple save slots, export/import.
