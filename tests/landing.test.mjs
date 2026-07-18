#!/usr/bin/env node
// Unit test for Feature 011 — Landing Page + XP bug fix.
// Validates the landing DOM is present and correctly wired, and that the
// duplicate XP-kill path was removed (no `game.xpGain` reference remains).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

test('landing screen markup present', () => {
  assert.ok(/id=["']landingScreen["']/.test(html), 'landingScreen element missing');
  assert.ok(/id=["']playBtn["']/.test(html), 'playBtn element missing');
  assert.ok(/id=["']landingCreator["']/.test(html), 'landingCreator element missing');
  assert.ok(/id=["']landingCreated["']/.test(html), 'landingCreated element missing');
});

test('CREATOR and CREATED constants defined', () => {
  assert.ok(/const CREATOR\s*=\s*['"]Konrad Hanus['"]/.test(html), 'CREATOR not set to Konrad Hanus');
  assert.ok(/const CREATED\s*=\s*['"]July 2026['"]/.test(html), 'CREATED not set to July 2026');
});

test('PLAY button wired to hide landing + game.start()', () => {
  // The landing IIFE must add a click listener that hides #landingScreen and calls game.start()
  assert.ok(/getElementById\(['"]playBtn['"]\)/.test(html) &&
            /addEventListener\(['"]click['"]/.test(html), 'playBtn has no click listener');
  assert.ok(/landingScreen/.test(html) && /style\.display\s*=\s*['"]none['"]/.test(html),
    'PLAY does not hide landing');
  assert.ok(/game\.start\(\)/.test(html), 'PLAY does not call game.start()');
});

test('XP bug fixed: no duplicate game.xpGain path', () => {
  // The removed inline mousedown handler wrote to game.xpGain (undefined).
  // It must no longer appear anywhere in the file.
  assert.ok(!/game\.xpGain/.test(html), 'stale game.xpGain reference still present');
});

test('mousedown only sets mouse.down (single attack path)', () => {
  // After fix, the mousedown handler should just flag mouse.down; the central
  // Game.update -> meleeAttack -> hitEnemy path handles damage + XP.
  const md = html.match(/canvas\.addEventListener\(['"]mousedown['"][\s\S]*?\}\);/);
  assert.ok(md, 'mousedown handler missing');
  assert.ok(/mouse\.down\s*=\s*true/.test(md[0]) || /mouse\.down=true/.test(md[0]), 'mousedown does not set mouse.down');
  assert.ok(!/xpGain/.test(md[0]), 'mousedown still contains kill logic');
});
