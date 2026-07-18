#!/usr/bin/env node
// Unit test for Feature 019 — Achievements & Progression.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

test('ACHIEVEMENTS data array defined (7 entries)', () => {
  const m = html.match(/const ACHIEVEMENTS=\[([\s\S]*?)\];/);
  assert.ok(m, 'ACHIEVEMENTS missing');
  const ids = ['first_blood','boss_slayer','carnage_king','wave_survivor','squad_commander','floor_diver','untouched'];
  for (const id of ids) assert.ok(html.includes(`id:'${id}'`), `achievement ${id} missing`);
});

test('storage keys + helpers present', () => {
  assert.ok(/const ACH_KEY='webdiablo_achievements';/.test(html), 'ACH_KEY missing');
  assert.ok(/const META_KEY='webdiablo_meta';/.test(html), 'META_KEY missing');
  assert.ok(/function loadAchievements\(\)\{/.test(html), 'loadAchievements missing');
  assert.ok(/function saveAchievements\(/.test(html), 'saveAchievements missing');
  assert.ok(/function loadMeta\(\)\{/.test(html), 'loadMeta missing');
  assert.ok(/function saveMeta\(/.test(html), 'saveMeta missing');
});

test('unlock + toast + toggleAchPanel methods', () => {
  assert.ok(/unlock\(id\)\{/.test(html), 'unlock missing');
  assert.ok(/toast\(text,sub\)\{/.test(html), 'toast missing');
  assert.ok(/toggleAchPanel\(\)\{/.test(html), 'toggleAchPanel missing');
});

test('hooks wired at right moments', () => {
  assert.ok(/if\(this\.carnage\.kills===1\)this\.unlock\('first_blood'\)/.test(html), 'first_blood hook missing');
  assert.ok(/this\.unlock\('boss_slayer'\)/.test(html), 'boss_slayer hook missing');
  assert.ok(/this\.unlock\('carnage_king'\)/.test(html), 'carnage_king hook missing');
  assert.ok(/if\(w\.num>=3\)this\.unlock\('wave_survivor'\)/.test(html), 'wave_survivor hook missing');
  assert.ok(/this\.unlock\('squad_commander'\)/.test(html), 'squad_commander hook missing');
  assert.ok(/this\.unlock\('floor_diver'\)/.test(html), 'floor_diver hook missing');
  assert.ok(/if\(this\.floorDamageTaken===0\)this\.unlock\('untouched'\)/.test(html), 'untouched hook missing');
});

test('meta-progression HP bonus capped at +20%', () => {
  assert.ok(/const metaBonus=Math\.min\(0\.2,this\.meta\.bosses\*0\.02\)/.test(html), 'meta bonus formula missing');
  assert.ok(/this\.player\.maxHp=Math\.floor\(this\.player\.maxHp\*\(1\+metaBonus\)\)/.test(html), 'meta HP apply missing');
});

test('V key toggles achievements panel', () => {
  assert.ok(/if\(e\.code==='KeyV'\)game\.toggleAchPanel\(\)/.test(html), 'V key not bound');
});

test('achievements panel element exists in markup', () => {
  assert.ok(/<div id="achPanel"[^>]*>/.test(html), 'achPanel element missing in HTML');
});
