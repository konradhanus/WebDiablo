#!/usr/bin/env node
// Unit tests for Feature 002 — Settings & Volume. Zero deps.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const sStart = script.indexOf('// ==================== SETTINGS MANAGER');
const sEnd = script.indexOf('// ==================== AUDIO ENGINE');
const src = script.slice(sStart, sEnd);

function harness(store = {}) {
  const sandbox = {
    localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
    window: {}, console,
  };
  sandbox.window = sandbox;
  sandbox.__TEST__ = {};
  sandbox.window.__TEST__ = sandbox.__TEST__;
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  return { sandbox, store };
}

test('getSettings returns defaults when nothing stored', () => {
  const { sandbox } = harness();
  const s = sandbox.getSettings();
  assert.equal(s.master, 80); assert.equal(s.music, 80);
  assert.equal(s.sfx, 80); assert.equal(s.muted, false);
});

test('saveSettings then getSettings round-trips', () => {
  const { sandbox } = harness();
  sandbox.saveSettings({ master: 10, music: 20, sfx: 30, muted: true });
  const s = sandbox.getSettings();
  assert.equal(s.master, 10); assert.equal(s.music, 20);
  assert.equal(s.sfx, 30); assert.equal(s.muted, true);
});

test('getSettings falls back to defaults on corrupt data', () => {
  const { sandbox } = harness({ 'webdiablo_settings_v1': 'not json' });
  const s = sandbox.getSettings();
  assert.equal(s.master, 80); assert.equal(s.music, 80);
  assert.equal(s.sfx, 80); assert.equal(s.muted, false);
});

test('applySettings sets audio master gain from settings', () => {
  const { sandbox } = harness();
  const audio = { muted: false, master: 1, setMuted() {}, setMaster(v) { this.master = v; } };
  sandbox.saveSettings({ master: 50, sfx: 50, music: 80, muted: false });
  sandbox.applySettings({ audio });
  // master/(100) * sfx/(100) = 0.5*0.5 = 0.25
  assert.equal(audio.master, 0.25);
});

test('applySettings mutes when muted=true', () => {
  const { sandbox } = harness();
  const audio = { muted: false, master: 1, setMuted(m) { this.muted = m; }, setMaster() {} };
  sandbox.saveSettings({ master: 80, sfx: 80, music: 80, muted: true });
  sandbox.applySettings({ audio });
  assert.equal(audio.muted, true);
});
