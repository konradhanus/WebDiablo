#!/usr/bin/env node
// Unit tests for Feature 003 — XP Bar / Progression. Zero deps.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

// Extract just the getProgress method body and expose it on a minimal object.
const m = script.match(/getProgress\(\)\{([\s\S]*?)\n  \}/);
const src = `this.getProgress=function(){${m[1]}};`;
function makeGame(player) {
  const g = { player };
  vm.createContext(g);
  vm.runInContext(src, g);
  return g;
}

test('getProgress returns correct pct at half xp', () => {
  const g = makeGame({ xp: 50, xpNext: 100, level: 3 });
  const pr = g.getProgress();
  assert.equal(pr.pct, 50);
  assert.equal(pr.xp, 50);
  assert.equal(pr.xpNext, 100);
  assert.equal(pr.level, 3);
});

test('getProgress clamps pct to <=100', () => {
  const g = makeGame({ xp: 500, xpNext: 100, level: 1 });
  assert.equal(g.getProgress().pct, 100);
});

test('getProgress never negative', () => {
  const g = makeGame({ xp: -10, xpNext: 100, level: 1 });
  assert.equal(g.getProgress().pct, 0);
});
test('getProgress handles missing player', () => {
  const g = { player: undefined }; vm.createContext(g);
  vm.runInContext(src, g);
  const pr = g.getProgress();
  assert.equal(pr.pct, 0);
  assert.equal(pr.level, 1);
});
