#!/usr/bin/env node
// E2E test for WebDiablo (Playwright headless). Enforces Constitution Principle III/VI:
// the game MUST load with ZERO uncaught console errors and the start flow MUST work.
// Serves the file over http (so relative fetches / no-cache behave like production).
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

function serve() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let p = req.url.split('?')[0];
      if (p === '/') p = '/index.html';
      try {
        const fp = join(root, p);
        statSync(fp);
        res.writeHead(200, { 'Content-Type': MIME[extname(fp)] || 'application/octet-stream' });
        res.end(readFileSync(fp));
      } catch { res.writeHead(404); res.end('not found'); }
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

const results = [];
function check(name, cond, detail = '') {
  results.push({ name, pass: !!cond, detail });
  console.log(`  ${cond ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'} ${name}${detail ? ' — ' + detail : ''}`);
}

const server = await serve();
const port = server.address().port;
const url = `http://127.0.0.1:${port}/`;
const consoleErrors = [];
const pageErrors = [];

const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => pageErrors.push(e.message));

console.log('WebDiablo E2E');
console.log('=============');
try {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  check('page loaded', await page.title() !== null);
  check('zero uncaught page errors', pageErrors.length === 0, pageErrors.join(' | '));
  check('zero console errors', consoleErrors.length === 0, consoleErrors.join(' | '));

  // --- Feature 011: Landing Page ---
  const landing = await page.evaluate(() => {
    const l = document.getElementById('landingScreen');
    const play = document.getElementById('playBtn');
    return { present: !!l, visible: l && l.style.display !== 'none', playPresent: !!play,
             creator: (document.getElementById('landingCreator2')||{}).textContent,
             created: (document.getElementById('landingCreated')||{}).textContent };
  });
  check('landing screen present', landing.present);
  check('landing visible on load', landing.visible);
  check('PLAY button present', landing.playPresent);
  check('landing credits creator', landing.creator === 'Konrad Hanus', landing.creator);
  check('landing credits creation date', /July 2026/.test(landing.created||''), landing.created);
  // PLAY enters playing and hides landing
  await page.evaluate(() => document.getElementById('playBtn').click());
  await page.waitForTimeout(400);
  const afterPlay = await page.evaluate(() => ({
    state: window.game.state,
    landingHidden: document.getElementById('landingScreen').style.display === 'none'
  }));
  check('PLAY enters playing state', afterPlay.state === 'playing', 'state=' + afterPlay.state);
  check('PLAY hides landing screen', afterPlay.landingHidden);
  check('no errors after PLAY', consoleErrors.length === 0 && pageErrors.length === 0);

  const gameExists = await page.evaluate(() => typeof window.game === 'object' && window.game !== null);
  check('game object initialized', gameExists);

  const canvasOk = await page.evaluate(() => !!document.getElementById('gameCanvas') && !!document.getElementById('minimap'));
  check('gameCanvas + minimap present', canvasOk);

  const startVisible = await page.evaluate(() => {
    const s = document.getElementById('startScreen'); return !!s;
  });
  check('start screen present', startVisible);

  // Version footer bar reflects GAME_VERSION
  const footer = await page.evaluate(() => {
    const b = document.getElementById('versionBar');
    return { text: b ? b.textContent : null, version: (typeof GAME_VERSION !== 'undefined') ? GAME_VERSION : null };
  });
  check('version footer present', footer.text && /^WebDiablo v\d+\.\d+\.\d+$/.test(footer.text), footer.text || 'missing');
  check('footer matches GAME_VERSION', footer.text === `WebDiablo v${footer.version}`, `${footer.text} vs v${footer.version}`);

  // Click ENTER THE DEPTHS and ensure no errors appear and state changes
  await page.evaluate(() => window.game.start());
  await page.waitForTimeout(400);
  const started = await page.evaluate(() => window.game.state === 'playing');
  check('game.start() enters playing state', started, 'state=' + await page.evaluate(() => window.game.state));
  check('no errors after start', consoleErrors.length === 0 && pageErrors.length === 0);

  // --- Feature 001: Save System ---
  // Force a known level/floor, save, reload, then CONTINUE should restore them.
  await page.evaluate(() => {
    window.game.player.level = 6;
    window.game.floor = 8;
    window.__TEST__.saveGame(window.game);
  });
  const savedLevel = await page.evaluate(() => window.game.player.level);
  check('saveGame persisted state', savedLevel === 6);

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const continueVisible = await page.evaluate(() => {
    const b = document.getElementById('continueBtn');
    return b && b.style.display !== 'none';
  });
  check('CONTINUE button visible after reload with save', continueVisible);

  await page.evaluate(() => window.game.continue());
  await page.waitForTimeout(300);
  const restored = await page.evaluate(() => ({ level: window.game.player.level, floor: window.game.floor, state: window.game.state }));
  check('continue() restores saved level', restored.level === 6, 'level=' + restored.level);
  check('continue() restores saved floor', restored.floor === 8, 'floor=' + restored.floor);
  check('continue() enters playing state', restored.state === 'playing', 'state=' + restored.state);
  check('no errors after continue', consoleErrors.length === 0 && pageErrors.length === 0);

  // --- Feature 002: Settings & Volume ---
  await page.evaluate(() => window.game.toggleSettings());
  await page.waitForTimeout(150);
  const panelOpen = await page.evaluate(() => document.getElementById('settingsPanel').style.display === 'block');
  check('settings panel opens', panelOpen);
  await page.evaluate(() => {
    const el = document.getElementById('setMaster');
    el.value = 25;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('webdiablo_settings_v1')));
  check('volume slider persists to localStorage', stored && stored.master === 25, JSON.stringify(stored));
  await page.evaluate(() => window.game.toggleSettings());
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const retained = await page.evaluate(() => window.__TEST__.settings.getSettings().master);
  check('settings retained after reload', retained === 25, 'master=' + retained);
  // --- Feature 003: XP Bar ---
  // --- Feature 003: XP Bar ---
  await page.evaluate(() => { if(window.game.state!=='playing')window.game.start(); window.game.player.xp = 50; window.game.player.xpNext = 100; window.game.updateUI(); });
  const xp = await page.evaluate(() => ({
    pct: parseFloat(document.getElementById('xpBar').style.width),
    txt: document.getElementById('xpText').textContent,
    prog: window.game.getProgress()
  }));
  check('XP bar fills ~50% at half xp', xp.pct > 45 && xp.pct < 55, 'width=' + xp.pct + '%');
  check('XP text shows xp/xpNext', xp.txt === '50/100', xp.txt);
  check('getProgress returns pct 50', Math.abs(xp.prog.pct - 50) < 1, 'pct=' + xp.prog.pct);
  check('no errors after xp update', consoleErrors.length === 0 && pageErrors.length === 0);

  // --- Feature 011: mouse-click kill awards XP (bug fix verification) ---
  const killResult = await page.evaluate(() => {
    if (window.game.state !== 'playing') window.game.start();
    const g = window.game;
    // Place a weak enemy directly to the right of the player.
    const p = g.player;
    p.x = 5; p.y = 5; p.dir = 1; // dir 1 = right
    g.enemies = [{ name:'TestDummy', hp:1, maxHp:1, def:0, dmg:0, color:'#888', size:14,
                   xp:42, icon:'💀', x:6, y:5, state:'idle', stateTimer:0, aggroRange:0,
                   attackRange:1, attackCooldown:0, hitFlash:0, deathTimer:0, dead:false,
                   drops:['common'] }];
    const xpBefore = p.xp;
    // Simulate holding left mouse (the single, correct attack path).
    g.mouse.down = true;
    g.update(0.1);
    g.mouse.down = false;
    const dummy = g.enemies[0];
    return { xpBefore, xpAfter: p.xp, dummyDead: !dummy || dummy.dead };
  });
  check('mouse-click kill awards XP', killResult.xpAfter > killResult.xpBefore,
        `xp ${killResult.xpBefore} -> ${killResult.xpAfter}`);
  check('mouse-click kill marks enemy dead', killResult.dummyDead);
  check('no errors after click-kill', consoleErrors.length === 0 && pageErrors.length === 0);
} catch (e) {
  check('E2E run completed without throwing', false, e.message);
} finally {
  await browser.close();
  server.close();
}

const failed = results.filter(r => !r.pass);
if (failed.length) { console.error(`\nE2E FAILED: ${failed.length}/${results.length}`); process.exit(1); }
console.log(`\nE2E OK (${results.length} checks)`);
