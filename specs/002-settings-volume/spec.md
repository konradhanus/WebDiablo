# Feature Specification: Settings Menu & Volume Controls

**Feature Dir**: specs/002-settings-volume
**Target version**: 1.2.0 (MINOR)

## Overview
Player has no control over audio. Add an in-game Settings panel (Esc/gear) with master/music/SFX
volume sliders, mute toggle, and a "reset settings" option. Settings persist across sessions.

## User Scenarios
1. Player opens Settings, lowers master volume, hears it immediately. Reopens game → level retained.
2. Player mutes all audio → no sound.
3. Player returns to menu from settings.

## Functional Requirements
- FR1: Settings panel toggle (gear button + key `O`).
- FR2: Master / Music / SFX volume sliders (0–100), applied live to AudioEngine gains.
- FR3: Mute toggle.
- FR4: Settings persisted to localStorage (`webdiablo_settings_v1`), loaded on boot.
- FR5: `getSettings()` / `applySettings()` exposed on `window.__TEST__`.

## Success Criteria
- SC1: Volume change is audible within 1s.
- SC2: Settings survive reload 100%.
- SC3: Invalid stored settings fall back to defaults (no crash).

## Key Entities
- Settings: `{master, music, sfx, muted}` (0–100 ints, muted bool).

## Assumptions
- AudioEngine supports per-bus gain (we will add `setMasterGain` etc.).
