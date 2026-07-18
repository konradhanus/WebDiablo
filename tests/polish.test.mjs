#!/usr/bin/env node
// Unit test for Feature 020 — Final Polish & Juice (v2.0).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

test('hit-stop state + applied on kill', () => {
  assert.ok(/this\.hitStopT=0;/.test(html), 'hitStopT init missing');
  assert.ok(/if\(this\.hitStopT>0\)\{this\.hitStopT-=dt;this\.render\(\);return;\}/.test(html), 'hit-stop skip missing');
  assert.ok(/this\.hitStopT=Math\.max\(this\.hitStopT,0\.05\)/.test(html), 'kill hit-stop missing');
});

test('smoothed camera lerp', () => {
  assert.ok(/this\.camX\+=\(ctX-this\.camX\)\*0\.12/.test(html), 'camera lerp X missing');
  assert.ok(/this\.camY\+=\(ctY-this\.camY\)\*0\.12/.test(html), 'camera lerp Y missing');
});

test('level-up flash + particle ring', () => {
  assert.ok(/this\.levelFlash=0\.35/.test(html), 'level flash set missing');
  assert.ok(/if\(this\.levelFlash>0\)\{/.test(html), 'level flash render missing');
  assert.ok(/this\.levelFlash-=dt/.test(html), 'level flash decay missing');
});

test('FPS counter + F4 toggle', () => {
  assert.ok(/this\.fps=0;this\.fpsVisible=false/.test(html), 'fps state missing');
  assert.ok(/this\._fpsFrames\+\+;this\._fpsAcc\+=this\.lastDt/.test(html), 'fps accumulation missing');
  assert.ok(/if\(e\.code==='KeyF4'\)\{game\.fpsVisible=!game\.fpsVisible/.test(html), 'F4 toggle missing');
  assert.ok(/id="fpsCounter"/.test(html), 'fpsCounter element missing');
});

test('game-over stats filled + Main Menu', () => {
  assert.ok(/id="deathStats"/.test(html), 'deathStats element missing');
  assert.ok(/Floor reached: <b>'\+this\.floor\+'<\/b>/.test(html), 'death floor missing');
  assert.ok(/location\.href='index\.html'/.test(html), 'Main Menu button missing');
});

test('docs present', () => {
  assert.ok(fs.existsSync(join(root, 'CHANGELOG.md')), 'CHANGELOG.md missing');
  assert.ok(fs.existsSync(join(root, 'README.md')), 'README.md missing');
  const readme = fs.readFileSync(join(root, 'README.md'), 'utf8');
  assert.ok(/Controls/.test(readme) && /Cannon-Fodder/.test(readme), 'README content thin');
});
