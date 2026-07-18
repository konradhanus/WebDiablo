#!/usr/bin/env node
// Unit tests for Feature 001 — Save System. Zero deps.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

// Extract ONLY the SaveManager region (between the VERSION comment and AUDIO ENGINE comment)
// so we unit-test pure logic without executing DOM-dependent top-level code.
const smStart = script.indexOf('// ==================== SAVE MANAGER');
const smEnd = script.indexOf('// ==================== AUDIO ENGINE');
const saveManagerSrc = script.slice(smStart, smEnd);

// Build a sandbox with a minimal localStorage + window, run the SaveManager portion.
function harness(player, floor) {
  const store = {};
  const sandbox = {
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; },
    },
    window: {},
    performance: { now: () => 0 },
    console,
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(saveManagerSrc, sandbox);
  const g = { state: 'playing', player, floor, audio: {}, generateFloor() {}, updateUI() {}, logMsg() {} };
  return { sandbox, store, g };
}

// helper to build a sandbox from a pre-populated localStorage store (for invalid data tests)
function harnessWithStore(store) {
  const sandbox = {
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; },
    },
    window: {}, console,
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(saveManagerSrc, sandbox);
  return sandbox;
}

test('saveGame writes a valid JSON save with version+floor+player', () => {
  const { sandbox, store, g } = harness({ level: 3, hp: 50 }, 4);
  const ok = sandbox.saveGame(g);
  assert.equal(ok, true);
  const saved = JSON.parse(store['webdiablo_save_v1']);
  assert.equal(saved.version, 1);
  assert.equal(saved.floor, 4);
  assert.equal(saved.player.level, 3);
});

test('saveGame returns false when game not playing', () => {
  const { sandbox, g } = harness({ level: 1 }, 1);
  g.state = 'menu';
  assert.equal(sandbox.saveGame(g), false);
});

test('loadGame round-trips a saved state', () => {
  const { sandbox, g } = harness({ level: 7, xp: 123 }, 9);
  sandbox.saveGame(g);
  const data = sandbox.loadGame();
  assert.equal(data.floor, 9);
  assert.equal(data.player.level, 7);
  assert.equal(data.player.xp, 123);
});

test('hasSave true after save, false after clearSave', () => {
  const { sandbox, g } = harness({ level: 2 }, 2);
  sandbox.saveGame(g);
  assert.equal(sandbox.hasSave(), true);
  sandbox.clearSave();
  assert.equal(sandbox.hasSave(), false);
});

test('loadGame returns null on corrupt/invalid data (graceful)', () => {
  const store = { 'webdiablo_save_v1': '{not valid json' };
  const sandbox = harnessWithStore(store);
  assert.equal(sandbox.loadGame(), null);
});

test('loadGame returns null on version mismatch', () => {
  const store = { 'webdiablo_save_v1': JSON.stringify({ version: 999, floor: 1, player: { level: 1 } }) };
  const sandbox = harnessWithStore(store);
  assert.equal(sandbox.loadGame(), null);
});
