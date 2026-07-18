# Plan — Feature 018: Sound & Music System

## Constitution Check
- I: ✅ WebAudio only (browser built-in). No files/deps.
- II: ✅ vanilla JS.
- III: ✅ e2e exercises audio without errors.
- IV: ✅ drone is 2 osc + filter, cheap.
- V: ✅ audio params as data.
- VI: ✅ gate.

## Approach
1. **Rewrite AudioEngine** in `index.html`:
   - `init()` lazily creates `AudioContext`, masterGain → destination,
     musicGain/sfxGain → masterGain. Reads saved volumes.
   - `setVolumes(v)`: master.gain = muted?0:v.master/100; music.gain=v.music/100;
     sfx.gain=v.sfx/100. (smooth ramp).
   - `play(name)`: switch → synth helper. Each SFX = short-lived nodes connected
     to sfxGain, auto-stopped.
   - `startDrone()` / `stopDrone()`: two detuned sawtooth/triangle oscillators
     through a lowpass filter with slow LFO; connected to musicGain; gain ramp.
   - `noiseBuffer()` helper for percussive SFX.
   - Guards: wrap in try/catch; if no ctx, return.
2. **Wire mixer**: find settings panel handlers (`saveGame`/slider) → call
   `this.audio.setVolumes(this.audioSettings)` after change. Also call in
   `start()` after init. Ensure `init()` on first click/keydown (autoplay).
3. **Hook SFX** (most already call `this.audio.play('x')`): verify names match
   new set (hit, kill, scream, fire, boss, hurt, heal, levelup, ui, pickup,
   wave). Add `scream` on enemy death, `hurt` on player damage, `pickup` on
   loot pickup, `wave` on wave start, `levelup` on level up, `ui` on button
   clicks. Add `startDrone` in start(), `stopDrone` on death/menu.
4. **Tests**:
   - `tests/sound.test.mjs`: AudioEngine exists; play() handles all names
     (regex in index.html for each synth branch + setVolumes + startDrone/
     stopDrone + guard); mixer wired (settings slider calls setVolumes).
   - `e2e.mjs`: init audio; play each SFX (no error); startDrone sets flag;
     setVolumes changes master gain; no errors.
5. **Perf**: short nodes, disconnect on end.

## Files
- `index.html` (AudioEngine rewrite, mixer wiring, SFX hooks)
- `tests/sound.test.mjs` (new), `tests/e2e.mjs` (extend)

## Risks
- AudioContext autoplay: init on first gesture (start button click already in
  start()). Safe.
- Some browsers block until gesture — covered by init-in-start.
