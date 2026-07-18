#!/usr/bin/env node
// Unit test for Feature 015 — Enemy Horde Waves (Cannon-Fodder).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

test('wave state initialised', () => {
  assert.ok(/this\.wave=\{num:0,timer:25,active:false,toSpawn:0,spawnCd:0\}/.test(html),
    'wave state missing');
});

test('startWave increments and sets active', () => {
  assert.ok(/startWave\(\)\{/.test(html), 'startWave missing');
  assert.ok(/w\.num\+\+/.test(html), 'wave num not incremented');
  assert.ok(/w\.toSpawn=count/.test(html), 'toSpawn not set');
  assert.ok(/w\.active=true/.test(html), 'active not set');
  assert.ok(/showBanner\(/.test(html), 'banner not shown');
});

test('wave size formula scales & capped', () => {
  assert.ok(/Math\.min\(40,3\+this\.floor\*2\+w\.num\*2\)/.test(html),
    'wave count formula wrong');
});

test('updateWaves called in update loop', () => {
  assert.ok(/this\.updateWaves\(dt\)/.test(html), 'updateWaves not called');
});

test('wave clears → bonus xp + reset timer', () => {
  assert.ok(/const bonus=20\*w\.num/.test(html), 'bonus xp formula missing');
  assert.ok(/player\.xp\+=bonus/.test(html), 'bonus not added');
  assert.ok(/w\.active=false/.test(html) && /w\.timer=25/.test(html),
    'wave not reset on clear');
  assert.ok(/WAVE CLEARED/.test(html), 'cleared banner missing');
});

test('spawnWaveEnemy tags wave enemies', () => {
  assert.ok(/spawnWaveEnemy\(\)\{/.test(html), 'spawnWaveEnemy missing');
  assert.ok(/e\.wave=true/.test(html), 'wave enemies not tagged');
});

test('wave HUD + banner elements present', () => {
  assert.ok(/id=["']waveBar["']/.test(html), 'waveBar missing');
  assert.ok(/id=["']waveText["']/.test(html), 'waveText missing');
  assert.ok(/id=["']waveBanner["']/.test(html), 'waveBanner missing');
  assert.ok(/updateWaveHud\(\)/.test(html), 'updateWaveHud not called');
});
