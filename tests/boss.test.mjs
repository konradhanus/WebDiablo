#!/usr/bin/env node
// Unit test for Feature 017 — Boss Arena & Boss Mechanics.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

test('boss template factory scales with floor', () => {
  assert.ok(/function bossTemplateFor\(floor\)/.test(html), 'bossTemplateFor missing');
  assert.ok(/BOSS_NAMES/.test(html), 'BOSS_NAMES missing');
});

test('spawnBoss creates boss object with phase state', () => {
  assert.ok(/spawnBoss\(floor\)\{/.test(html), 'spawnBoss missing');
  assert.ok(/boss:true,phase:1,atkTimer:2\.5,telegraph:0/.test(html), 'boss state fields missing');
});

test('floor%5 triggers boss arena', () => {
  assert.ok(/if\(this\.floor%5===0\)\{[\s\S]*?this\.bossArena=true/.test(html), 'floor%5 does not set bossArena');
});

test('updateEnemies routes boss to updateBoss', () => {
  assert.ok(/if\(e\.boss\)\{this\.updateBoss\(e,dt\);continue;\}/.test(html), 'boss not routed to updateBoss');
});

test('boss has phased abilities', () => {
  assert.ok(/phase<3&&e\.hp<=e\.maxHp\*0\.33/.test(html), 'phase 3 trigger missing');
  assert.ok(/pendingAbility==='shockwave'|e\.pendingAbility='shockwave'/.test(html), 'shockwave missing');
  assert.ok(/pendingAbility==='summon'/.test(html), 'summon missing');
  assert.ok(/pendingAbility==='charge'/.test(html), 'charge missing');
  assert.ok(/pendingAbility==='firerain'/.test(html), 'firerain missing');
});

test('firebomb projectile handled in updateProjectiles', () => {
  assert.ok(/if\(pr\.type==='firebomb'\)/.test(html), 'firebomb not handled');
});

test('boss HP bar element + wiring', () => {
  assert.ok(/id=["']bossBar["']/.test(html), 'bossBar missing');
  assert.ok(/id=["']bossHpFill["']/.test(html), 'bossHpFill missing');
  assert.ok(/bossHpFill'\)\.style\.width/.test(html), 'boss HP not updated');
});

test('boss death grants guaranteed loot + opens gates', () => {
  assert.ok(/if\(e\.boss\)\{[\s\S]*?this\.bossArena=false;this\.boss=null/.test(html), 'boss death does not open gates');
  assert.ok(/VICTORY — /.test(html), 'no VICTORY banner');
  assert.ok(/const bonus=100\*this\.floor/.test(html), 'no boss XP bonus');
});

test('render calls updateSkillBar (no boss breakage)', () => {
  assert.ok(/render\(\)\{[\s\S]*?this\.updateSkillBar\(\)/.test(html), 'render missing updateSkillBar');
});
