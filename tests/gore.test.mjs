#!/usr/bin/env node
// Unit test for Feature 014 — Blood & Gore Overhaul.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

test('Particle supports gib type', () => {
  assert.ok(/type===\s*['"]gib['"]/.test(html), 'gib particle type not drawn');
});

test('carnage state initialised', () => {
  assert.ok(/this\.carnage=\{kills:0,streak:0,streakTimer:0\}/.test(html), 'carnage state missing');
});

test('bloodlustMult boosts damage, capped', () => {
  assert.ok(/bloodlustMult\(\)\{/.test(html), 'bloodlustMult missing');
  assert.ok(/1\+Math\.min\(this\.carnage\.streak,10\)\*0\.05/.test(html),
    'bloodlust cap / formula wrong');
  assert.ok(/hitEnemy/.test(html) && /bloodlustMult\(\)/.test(html),
    'hitEnemy does not use bloodlust');
});

test('directional blood spray on hit', () => {
  assert.ok(/type:\s*['"]circle['"][\s\S]*?angle:ang/.test(html) ||
            /angle:ang,spread/.test(html), 'no directional spray angle');
});

test('gib burst on death scaled by size', () => {
  assert.ok(/const gibCount=e\.boss\?42:/.test(html), 'gib count not computed');
  assert.ok(/type:\s*['"]gib['"]/.test(html), 'death does not emit gibs');
});

test('death screen-shake scaled by enemy size', () => {
  assert.ok(/shakeIntensity=Math\.max\(this\.shakeIntensity,2\+e\.size\*0\.3\)/.test(html),
    'shake not scaled by size');
});

test('carnage kill + streak tracked', () => {
  assert.ok(/this\.carnage\.kills\+\+/.test(html), 'kills not incremented');
  assert.ok(/this\.carnage\.streak\+\+/.test(html), 'streak not incremented');
  assert.ok(/this\.carnage\.streakTimer=4/.test(html), 'streak timer not set');
});

test('streak decays when timer expires', () => {
  assert.ok(/streakTimer-=dt[\s\S]*?streak=0/.test(html) ||
            /carnage\.streakTimer>0\)\{/.test(html) && /streak=0/.test(html),
    'streak does not decay');
});

test('carnage HUD present', () => {
  assert.ok(/id=["']carnageBar["']/.test(html), 'carnageBar missing');
  assert.ok(/id=["']carnageText["']/.test(html), 'carnageText missing');
  assert.ok(/id=["']bloodlustText["']/.test(html), 'bloodlustText missing');
  assert.ok(/BLOODLUST x'/.test(html), 'bloodlust label not rendered');
});
