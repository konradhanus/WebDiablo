#!/usr/bin/env node
// Unit test for Feature 012 — Atmospheric tile & lighting rework.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

test('palette constants defined (Feature 012)', () => {
  assert.ok(/const PAL\s*=\s*\{/.test(html), 'PAL palette missing');
  assert.ok(/wallTop\s*:/.test(html) && /wallBottom\s*:/.test(html), 'wall palette incomplete');
  assert.ok(/torch\s*:/.test(html), 'torch color missing');
  assert.ok(/blood\s*:/.test(html), 'blood color missing');
  assert.ok(/ambient\s*:/.test(html), 'ambient overlay missing');
});

test('Dungeon has braziers array', () => {
  assert.ok(/this\.braziers\s*=\s*\[\]/.test(html), 'Dungeon.braziers not initialised');
  assert.ok(/this\.braziers\.push\(\{x:bx,y:by/.test(html), 'braziers not placed in generate()');
});

test('Game has blood decals array', () => {
  assert.ok(/this\.bloods\s*=\s*\[\]/.test(html), 'Game.bloods not initialised');
  assert.ok(/this\.bloods\.push\(\{x:e\.x,y:e\.y/.test(html), 'blood not added on enemy death');
  assert.ok(/if\(this\.bloods\.length>200\)this\.bloods\.shift\(\)/.test(html), 'blood not capped (perf)');
});

test('light map uses additive compositing', () => {
  assert.ok(/globalCompositeOperation\s*=\s*['"]lighter['"]/.test(html), 'no additive light compositing');
  assert.ok(/PAL\.ambient/.test(html) && /fillRect\(0,0,canvas\.width,canvas\.height\)/.test(html),
    'ambient dark overlay not drawn');
});

test('tile rework draws wall bevel + floor checker', () => {
  assert.ok(/PAL\.wallTop/.test(html), 'wall top bevel not used');
  assert.ok(/PAL\.floorA/.test(html) && /PAL\.floorB/.test(html), 'floor checker not used');
});
