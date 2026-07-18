#!/usr/bin/env node
// Unit tests for WebDiablo — Node built-in test runner (node --test), zero deps.
// Strategy: the game is one HTML file, so we extract the inline script and evaluate
// selected pure data/logic in a sandbox, then assert invariants. As features add
// testable pure functions, expose them on a `globalThis.__TEST__` object and test here.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

// Extract GAME_VERSION without running the whole game (which needs a DOM).
function extractVersion() {
  return html.match(/const\s+GAME_VERSION\s*=\s*['"]([^'"]+)['"]/)[1];
}

// Extract a top-level `const NAME=[...]` array literal by brace matching and eval in a sandbox.
function extractArray(name) {
  const idx = script.indexOf(`const ${name}=`);
  if (idx === -1) return null;
  let i = script.indexOf('[', idx);
  if (i === -1) return null;
  let depth = 0, end = -1;
  for (let j = i; j < script.length; j++) {
    if (script[j] === '[') depth++;
    else if (script[j] === ']') { depth--; if (depth === 0) { end = j; break; } }
  }
  if (end === -1) return null;
  const literal = script.slice(i, end + 1);
  return vm.runInNewContext('(' + literal + ')', {});
}

test('GAME_VERSION is valid semver', () => {
  assert.match(extractVersion(), /^\d+\.\d+\.\d+$/);
});

test('ENEMY_TYPES table exists and every enemy has required stats', () => {
  const enemies = extractArray('ENEMY_TYPES');
  assert.ok(Array.isArray(enemies), 'ENEMY_TYPES should be an array');
  assert.ok(enemies.length >= 5, 'expected at least 5 enemy types');
  for (const e of enemies) {
    assert.ok(typeof e.name === 'string' && e.name.length, `enemy name: ${JSON.stringify(e)}`);
    assert.ok(e.hp > 0, `${e.name} hp>0`);
    assert.ok(e.dmg >= 0, `${e.name} dmg>=0`);
    assert.ok(e.xp > 0, `${e.name} xp>0`);
    assert.ok(Array.isArray(e.drops), `${e.name} has drops array`);
  }
});

test('at least one boss enemy exists', () => {
  const enemies = extractArray('ENEMY_TYPES');
  assert.ok(enemies.some(e => e.boss === true), 'expected at least one boss');
});

test('RARITIES table exists with valid entries', () => {
  const rarities = extractArray('RARITIES');
  assert.ok(Array.isArray(rarities) && rarities.length >= 3, 'expected >=3 rarities');
});

test('FLOOR_NAMES exist and are non-empty strings', () => {
  const floors = extractArray('FLOOR_NAMES');
  assert.ok(Array.isArray(floors) && floors.length >= 1);
  for (const f of floors) assert.ok(typeof f === 'string' && f.length);
});
