#!/usr/env node
// Unit test for Feature 022 — Brighter, Winding, Richer Dungeons.
// Structure guards (regex) in the spirit of the existing suite, PLUS a real
// vm-based test that runs the actual Dungeon class to prove generation produces
// chests/altars/traps/secrets and stays fully connected.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

test('Feature 022 — palette is brighter', () => {
  assert.ok(/ambient:'rgba\(2,1,3,\.(4[0-9]|[0-3]\d)\)'/.test(html),
    'ambient alpha should be <= 0.49 (was 0.82)');
  assert.ok(/r:9,t:PAL\.torch/.test(html), 'player light radius should be 9 (was 6.5)');
  assert.ok(/r:6\*fl,t:'#ffb060'/.test(html), 'brazier radius should be 6 (was 4.5)');
  assert.ok(/gradient\.addColorStop\(1,'rgba\(0,0,0,\.42\)'\)/.test(html),
    'ambient gradient outer alpha should be 0.42 (was 0.7)');
  assert.ok(/vig\.addColorStop\(1,'rgba\(0,0,0,\.28\)'\)/.test(html),
    'vignette outer alpha should be 0.28 (was 0.5)');
});

test('Feature 022 — new tile types defined', () => {
  assert.ok(/const TILE=\{[^}]*TRAP:7,CHEST:8,ALTAR:9,SECRET:10\}/.test(html),
    'TILE must include TRAP/CHEST/ALTAR/SECRET');
});

test('Feature 022 — Dungeon scatters content in generate()', () => {
  assert.ok(/this\.interactables=\[\]/.test(html), 'Dungeon.interactables not initialised');
  assert.ok(/this\.secrets=\[\]/.test(html), 'Dungeon.secrets not initialised');
  assert.ok(/type:'chest'/.test(html), 'chests not scattered');
  assert.ok(/type:'altar'/.test(html), 'altars not scattered');
  assert.ok(/type:'trap'/.test(html), 'traps not scattered');
  assert.ok(/TILE\.SECRET/.test(html), 'secret walls not placed');
});

test('Feature 022 — winding carveCorridor (multi-bend, 3-wide)', () => {
  assert.ok(/const waypoints=\[\{x:x1,y:y1\}\]/.test(html), 'carveCorridor not winding');
  assert.ok(/const bends=2\+Math\.floor\(Math\.random\(\)\*2\)/.test(html),
    'carveCorridor should take 2-3 bends');
  assert.ok(/const width=3;/.test(html), 'corridors should be 3 tiles wide');
});

test('Feature 022 — interact + render hooks present', () => {
  assert.ok(/interactTile\(\)\{/.test(html), 'interactTile() handler missing');
  assert.ok(/ib\.type==='chest'&&!ib\.opened/.test(html), 'chest open logic missing');
  assert.ok(/ib\.type==='altar'&&!ib\.used/.test(html), 'altar blessing logic missing');
  assert.ok(/ib\.type==='trap'&&!ib\.triggered/.test(html), 'trap trigger logic missing');
  assert.ok(/Feature 022: draw discoverable interactables/.test(html), 'render block missing');
});

test('Feature 022 — __TEST__ exposes dungeon factory', () => {
  assert.ok(/window\.__TEST__\.makeDungeon=\(w,h,floor\)=>/.test(html), '__TEST__.makeDungeon missing');
  assert.ok(/window\.__TEST__\.Dungeon=Dungeon;/.test(html), '__TEST__.Dungeon missing');
  assert.ok(/window\.__TEST__\.TILE=TILE;/.test(html), '__TEST__.TILE missing');
  assert.ok(/window\.__TEST__\.PAL=PAL;/.test(html), '__TEST__.PAL missing');
});

// ---- Real execution test: run the actual Dungeon class in a vm sandbox ----
test('Feature 022 — generated floors have content & stay connected (vm)', () => {
  // Extract the inline region containing TILE, TILE_COLORS, and class Dungeon.
  const start = html.indexOf('const TILE={WALL:0');
  const end = html.indexOf("const canvas=document.getElementById('gameCanvas');");
  assert.ok(start > 0 && end > start, 'could not locate Dungeon source region');
  const region = html.slice(start, end);
  const sandbox = { Math, Uint8Array, console };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(region + '\nthis.__D = Dungeon; this.__TILE = TILE;', sandbox);
  const Dungeon = sandbox.__D;
  const TILE = sandbox.__TILE;
  assert.ok(typeof Dungeon === 'function', 'Dungeon class not compiled');

  const reach = (d) => {
    const W = d.width, H = d.height, seen = new Uint8Array(W * H);
    const q = [[d.rooms[0].cx, d.rooms[0].cy]];
    seen[d.idx(q[0][0], q[0][1])] = 1;
    const walk = (x, y) => { const t = d.get(x, y); return t === 1||t===2||t===3||t===4||t===5||t===6; };
    while (q.length) {
      const [x, y] = q.shift();
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nx = x+dx, ny = y+dy;
        if (nx<0||ny<0||nx>=W||ny>=H) continue;
        const i = d.idx(nx, ny);
        if (!seen[i] && walk(nx, ny)) { seen[i] = 1; q.push([nx, ny]); }
      }
    }
    for (let y=0; y<H; y++) for (let x=0; x<W; x++)
      if (d.get(x,y) === 4 && !seen[d.idx(x,y)]) return false;
    return true;
  };

  let chests=0, altars=0, traps=0, secrets=0, allReach=true;
  for (let f=1; f<=6; f++) {
    const d = new Dungeon(60, 60);
    d.generate(f);
    chests += d.interactables.filter(i => i.type==='chest').length;
    altars += d.interactables.filter(i => i.type==='altar').length;
    traps  += d.interactables.filter(i => i.type==='trap').length;
    secrets += d.secrets.length;
    if (!reach(d)) allReach = false;
  }
  assert.ok(chests >= 6, 'expected >=1 chest per floor, got total ' + chests);
  assert.ok(altars >= 6, 'expected >=1 altar per floor, got total ' + altars);
  assert.ok(traps >= 6, 'expected >=1 trap per floor, got total ' + traps);
  assert.ok(secrets >= 1, 'expected secret caches on even floors, got ' + secrets);
  assert.ok(allReach, 'some generated floor was not fully connected');
});
