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
} catch (e) {
  check('E2E run completed without throwing', false, e.message);
} finally {
  await browser.close();
  server.close();
}

const failed = results.filter(r => !r.pass);
if (failed.length) { console.error(`\nE2E FAILED: ${failed.length}/${results.length}`); process.exit(1); }
console.log(`\nE2E OK (${results.length} checks)`);
