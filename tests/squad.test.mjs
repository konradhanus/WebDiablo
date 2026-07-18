#!/usr/bin/env node
// Unit test for Feature 013 — Squad Command (Cannon-Fodder style).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

test('MAX_SQUAD constant = 3', () => {
  assert.ok(/const MAX_SQUAD\s*=\s*3/.test(html), 'MAX_SQUAD not 3');
});

test('Game initialises squad state', () => {
  assert.ok(/this\.squad\s*=\s*\[\]/.test(html), 'squad not initialised');
  assert.ok(/this\.kiaCount\s*=\s*0/.test(html), 'kiaCount not initialised');
  assert.ok(/this\.squadHold\s*=\s*false/.test(html), 'squadHold not initialised');
});

test('recruitMerc caps at MAX_SQUAD and pushes a merc', () => {
  assert.ok(/recruitMerc\(\)\{/.test(html), 'recruitMerc missing');
  assert.ok(/if\(this\.squad\.length>=MAX_SQUAD\)/.test(html), 'no squad cap check');
  assert.ok(/this\.squad\.push\(m\)/.test(html), 'merc not pushed');
});

test('mercDie increments kiaCount', () => {
  assert.ok(/mercDie\(m\)\{/.test(html), 'mercDie missing');
  assert.ok(/this\.kiaCount\+\+/.test(html), 'kiaCount not incremented on death');
  assert.ok(/KIA/.test(html), 'no KIA log');
});

test('enemies can target squad members (not only player)', () => {
  assert.ok(/for\(const m of this\.squad\)/.test(html), 'enemy loop does not scan squad');
  assert.ok(/mercDie\(target\)/.test(html), 'enemy kill does not call mercDie');
});

test('squad HUD + keys wired', () => {
  assert.ok(/id=["']squadBar["']/.test(html), 'squadBar missing');
  assert.ok(/id=["']squadPips["']/.test(html), 'squadPips missing');
  assert.ok(/id=["']kiaText["']/.test(html), 'kiaText missing');
  assert.ok(/id=["']recruitBtn["']/.test(html) && /id=["']holdBtn["']/.test(html), 'squad buttons missing');
  assert.ok(/KeyQ/.test(html) && /recruitMerc/.test(html), 'Q key not wired to recruit');
  assert.ok(/KeyR/.test(html) && /squadHold/.test(html), 'R key not wired to hold');
});

test('updateSquad called in update loop', () => {
  assert.ok(/this\.updateSquad\(dt\)/.test(html), 'updateSquad not called');
});
