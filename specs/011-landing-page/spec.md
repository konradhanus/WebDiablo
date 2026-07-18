# Feature 011 — Landing Page + Combat XP Bug Fix

**Branch:** master | **Type:** MINOR (new player-facing screen) + PATCH (bug fix)

## Overview
Add a polished landing/home page that loads before the game and serves as the
public face of WebDiablo ("Shadows of the Forgotten"). The page must:
- Describe the game and what it offers (dark-fantasy dungeon crawler with
  Diablo-style loot + Cannon Fodder-style squad carnage).
- Provide a prominent **PLAY** button that launches the game.
- Credit the creator (Konrad Hanus) and the creation date (July 2026).
- Reflect the dark, pixel-art retro aesthetic consistent with the game.

Also fix a latent combat bug discovered during audit: the left-click handler
in `mousedown` contains a duplicate kill path that writes to the undefined
`game.xpGain` instead of `p.xp`, so kills made by clicking the mouse award no
XP and double-trigger death particles. The two attack paths (`meleeAttack`
in `update()` and the inline `mousedown` handler) must be unified into a
single, correct damage path.

## User Scenarios
1. User opens `index.html` → sees landing page first (not the raw game canvas).
2. User reads about the game, sees "Created by Konrad Hanus — July 2026".
3. User clicks **PLAY** → landing hides, game `start()` runs, HUD appears.
4. User clicks an enemy with the mouse → enemy dies AND XP is correctly added
   (verified: `p.xp` increases; level-up possible).

## Requirements
- R1. Landing overlay (`#landingScreen`) present in DOM, shown on load, hidden
      after PLAY.
- R2. PLAY button calls `game.start()` (same path as ENTER THE DEPTHS).
- R3. Landing shows: title, tagline, feature bullets, creator + date credit,
      PLAY button. Pixel/retro dark styling, zero external assets.
- R4. Mouse-click kills now route through the single `hitEnemy` path and award
      XP to `p.xp` (no `game.xpGain` reference remains).
- R5. No new external dependencies; single `index.html`; builds green.

## Out of Scope
- Full game rework (later iterations 2–10).
- Audio/music on landing (later).

## Success Metrics
- `npm test` green (build + unit + e2e).
- E2E: landing visible on load; PLAY enters playing; click-kill awards XP.
- Live GitHub Pages serves the new version.
