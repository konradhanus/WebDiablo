#!/usr/bin/env node
// Unit test for Feature 016 — HUD Rework (dark-fantasy Diablo styling).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

test('HP/MP orb elements present (replaced old bars)', () => {
  assert.ok(/id=["']hpOrb["']/.test(html), 'hpOrb missing');
  assert.ok(/id=["']hpOrbFill["']/.test(html), 'hpOrbFill missing');
  assert.ok(/id=["']mpOrb["']/.test(html), 'mpOrb missing');
  assert.ok(/id=["']mpOrbFill["']/.test(html), 'mpOrbFill missing');
  // old bars removed
  assert.ok(!/id=["']hpBar["']/.test(html), 'old hpBar should be removed');
  assert.ok(!/id=["']mpBar["']/.test(html), 'old mpBar should be removed');
});

test('skill bar container present', () => {
  assert.ok(/id=["']skillBar["']/.test(html), 'skillBar missing');
  assert.ok(/buildSkillBar\(\)/.test(html), 'buildSkillBar not defined');
  assert.ok(/updateSkillBar\(\)/.test(html), 'updateSkillBar not defined');
});

test('updateUI drives orb fills', () => {
  assert.ok(/hpOrbFill'\)\.style\.height/.test(html), 'hpOrbFill not updated');
  assert.ok(/mpOrbFill'\)\.style\.height/.test(html), 'mpOrbFill not updated');
  assert.ok(/xpBarHud'\)\.style\.width/.test(html), 'xpBarHud not updated');
});

test('fireball cooldown gating + state', () => {
  assert.ok(/this\.fireballCd=0/.test(html), 'fireballCd not initialised');
  assert.ok(/if\(this\.fireballCd>0\)return/.test(html), 'no cd gate in castFireball');
  assert.ok(/this\.fireballCd=0\.6/.test(html), 'cd not set on cast');
  assert.ok(/if\(this\.fireballCd>0\)this\.fireballCd-=dt/.test(html), 'cd not decremented');
});

test('render calls updateSkillBar each frame', () => {
  assert.ok(/render\(\)\{[\s\S]*?updateSkillBar\(\)/.test(html), 'render does not call updateSkillBar');
});

test('buildSkillBar wired to start()', () => {
  assert.ok(/this\.buildSkillBar\(\);[\s\S]*?lastTime=performance\.now\(\)/.test(html),
    'buildSkillBar not called in start()');
});

test('minimap restyled (class-based)', () => {
  assert.ok(/class=["']minimap-canvas["']/.test(html), 'minimap not restyled');
  assert.ok(/\.minimap-canvas\{/.test(html), 'minimap CSS missing');
});

test('serif headers for dark-fantasy feel', () => {
  assert.ok(/font-family:Georgia/.test(html), 'no Georgia serif applied');
});
