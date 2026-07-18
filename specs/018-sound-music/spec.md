# Feature 018 — Sound & Music System (WebAudio)

**Branch:** master | **Type:** MINOR (audio overhaul)

## Overview
Replace the near-silent audio stubs with a real procedural WebAudio sound
design: a low dark-fantasy **ambient drone** loop, plus event SFX synthesised
at runtime (no audio files → zero deps):
- `hit` — short metallic clang (square+noise burst, fast decay)
- `kill` — fleshy squelch + low thud
- `scream` — descending sine (enemy death wail)
- `fire` — whoosh (filtered noise sweep)
- `boss` — deep roar (low sawtooth + distortion)
- `hurt` — player damage sting
- `heal` — bright chime
- `levelup` — ascending arpeggio
- `ui` — UI click
- `pickup` — item pickup blip
- `wave` — horn call for wave start
Volume mixer already exists (master/music/sfx/mute) — **wire it in** so the
drone respects `music` and SFX respect `sfx`.

## User Scenarios
1. Player starts game → ambient drone begins (fades in); respects music volume.
2. Player attacks → `hit`/`kill`/`scream` play (respect sfx volume).
3. Settings: lowering Music volume ducks drone; Mute silences all.
4. Boss appears → `boss` roar; Boss death → big sting.
5. No external audio files; works offline.

## Requirements
- R1. Rewrite `AudioEngine` to use `AudioContext` with master gain → (musicGain
     + sfxGain). `init()` created on first user gesture (browser autoplay).
- R2. `play(name)` synthesises the right SFX via oscillators/noise buffers.
- R3. `startDrone()`/`stopDrone()` manage a looping ambient bed (two detuned
     oscillators + slow LFO on filter). Fades in/out.
- R4. Mixer wiring: `setVolumes({master,music,sfx,muted})` updates gains.
     `getSettings()`/`saveGame` already persist; `updateUI`/settings panel
     calls `audio.setVolumes`.
- R5. Guard: if `AudioContext` unavailable, all methods no-op (no crash).
- R6. Zero deps, green tests.

## Out of Scope
- Streaming music tracks, positional 3D audio, external samples.

## Success Metrics
- `npm test` green. E2E: init audio on gesture, play each SFX without error,
  drone starts/stops, volume changes affect gain. No console/page errors.
