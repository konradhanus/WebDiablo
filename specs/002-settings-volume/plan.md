# Implementation Plan: Settings Menu & Volume

**Spec**: ./spec.md | **Version**: → 1.2.0

## Constitution Check
- I/II/III/IV/V/VI all satisfied (native DOM + localStorage, tested via e2e).

## Approach
- Add `AudioEngine.setBusGain(bus, v)`; wire master/music/sfx to Web Audio GainNodes.
- Add SettingsManager: `getSettings()`, `saveSettings()`, `applySettings()`, `DEFAULTS`.
- UI: `#settingsPanel` with 3 range inputs + mute checkbox + close; toggled by `game.toggleSettings()` (key `O`).
- Boot: load settings, apply to audio engine.
- Expose `window.__TEST__.settings = {getSettings, applySettings, saveSettings, DEFAULTS}`.

## Phases
- P0: AudioEngine gain buses.
- P1: SettingsManager + persistence.
- P2: Settings panel UI + toggle.
- P3: Tests (unit for load/save/defaults; e2e for open→set→reload retained).
