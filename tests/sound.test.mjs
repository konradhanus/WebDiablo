#!/usr/bin/env node
// Unit test for Feature 018 — Sound & Music System (WebAudio).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

test('AudioEngine has master/music/sfx gains', () => {
  assert.ok(/musicGain=null;this\.sfxGain=null/.test(html), 'music/sfx gains missing');
});

test('setVolumes method present (mixer wiring)', () => {
  assert.ok(/setVolumes\(v\)\{/.test(html), 'setVolumes missing');
});

test('startDrone / stopDrone present', () => {
  assert.ok(/startDrone\(\)\{/.test(html), 'startDrone missing');
  assert.ok(/stopDrone\(\)\{/.test(html), 'stopDrone missing');
});

test('all SFX branches synthesised', () => {
  for (const name of ['hit','kill','scream','hurt','fire','boss','heal','levelup','pickup','ui','wave','death','magic','steps']) {
    assert.ok(new RegExp(`case'${name}':`).test(html), `SFX '${name}' branch missing`);
  }
});

test('drone uses detuned oscillators + filter (no deps)', () => {
  assert.ok(/createOscillator\(\);o1\.type='sawtooth'/.test(html), 'drone osc missing');
  assert.ok(/createBiquadFilter\(\);lp\.type='lowpass'/.test(html), 'drone filter missing');
});

test('damagePlayer unified path exists (fixes missing-method bug)', () => {
  assert.ok(/damagePlayer\(dmg\)\{/.test(html), 'damagePlayer missing');
  assert.ok(/this\.audio\.play\('hurt'\)/.test(html), 'no hurt SFX on damage');
});

test('start() starts drone + applies volumes', () => {
  assert.ok(/this\.audio\.startDrone\(\); \/\/ Feature 018/.test(html), 'startDrone not called in start');
  assert.ok(/this\.audio\.setVolumes\(window\.__TEST__\.settings\.getSettings\(\)\)/.test(html), 'volumes not applied in start');
});

test('projectile uses damagePlayer (invuln respected)', () => {
  assert.ok(/this\.damagePlayer\(pr\.dmg\); \/\/ Feature 018/.test(html), 'projectile not routed via damagePlayer');
});

test('applySettings routes to setVolumes', () => {
  assert.ok(/game\.audio\.setVolumes\(s\);/.test(html), 'applySettings does not call setVolumes');
});

test('AudioEngine guards against no AudioContext', () => {
  assert.ok(/if\(!AC\)return;/.test(html), 'no AudioContext guard');
  assert.ok(/catch\(e\)\{this\.enabled=false;\}/.test(html), 'no try/catch guard');
});
