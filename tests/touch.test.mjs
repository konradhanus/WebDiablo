#!/usr/bin/env node
// Unit-ish parse tests for Feature 021 — Touch & Mobile Controls.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

test('viewport meta blocks user zoom', () => {
  assert.ok(/name="viewport"[^>]*user-scalable=no/.test(html), 'viewport missing user-scalable=no');
  assert.ok(/viewport-fit=cover/.test(html), 'viewport missing cover fit');
});

test('touch hardening CSS present', () => {
  assert.ok(/touch-action:none/.test(html), 'touch-action:none missing');
  assert.ok(/overscroll-behavior:none/.test(html), 'overscroll-behavior missing');
  assert.ok(/-webkit-touch-callout:none/.test(html), 'touch-callout missing');
});

test('touchUI markup (joystick + buttons)', () => {
  assert.ok(/id="touchUI"/.test(html), 'touchUI container missing');
  assert.ok(/id="joystick"/.test(html), 'joystick missing');
  assert.ok(/id="joyKnob"/.test(html), 'joyKnob missing');
  for (const id of ['btnFire','btnSquad','btnHold','btnPot','btnAch','btnSet'])
    assert.ok(new RegExp('id="'+id+'"').test(html), 'button missing: ' + id);
});

test('touch controls only show in touch mode (gating)', () => {
  assert.ok(/body\.touch #touchUI\{display:block!important\}/.test(html), 'touch-show rule missing');
  assert.ok(/body:not\(\.touch\) #touchUI\{display:none!important\}/.test(html), 'touch-hide rule missing');
});

test('touch control JS wiring present', () => {
  assert.ok(/IS_TOUCH = window\.matchMedia/.test(html), 'IS_TOUCH detection missing');
  assert.ok(/\(pointer:coarse\)/.test(html), 'pointer:coarse check missing');
  assert.ok(/joy\.addEventListener\('pointerdown'/.test(html), 'joystick pointerdown missing');
  assert.ok(/applyJoy\(dx\/d, dy\/d\)/.test(html), 'applyJoy mapping missing');
  assert.ok(/canvas\.addEventListener\('pointerdown'/.test(html), 'canvas tap-attack missing');
  assert.ok(/g\.mouse\.down=true/.test(html), 'tap sets mouse.down missing');
  assert.ok(/bind\('btnFire',\(\)=>\{/.test(html), 'fire button bind missing');
  assert.ok(/bind\('btnPot',\(\)=>\{/.test(html), 'potion button bind missing');
});

test('joystick maps to WASD keys + facing', () => {
  assert.ok(/g\.keys\['KeyA'\]=vx<-0\.35/.test(html), 'KeyA mapping missing');
  assert.ok(/g\.keys\['KeyD'\]=vx>0\.35/.test(html), 'KeyD mapping missing');
  assert.ok(/g\.keys\['KeyW'\]=vy<-0\.35/.test(html), 'KeyW mapping missing');
  assert.ok(/g\.keys\['KeyS'\]=vy>0\.35/.test(html), 'KeyS mapping missing');
  assert.ok(/g\.player\.dir = vx>0\?1:3/.test(html), 'dir mapping missing');
});
