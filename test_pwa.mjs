import { chromium } from 'playwright';

const URL = 'http://localhost:6660/';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 12/13/14
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE ERROR: ' + m.text()); });
  page.on('pageerror', e => errors.push('PAGE ERROR: ' + e.message));

  await page.goto(URL, { waitUntil: 'networkidle' });

  // 1) manifest linked
  const manifestHref = await page.getAttribute('link[rel="manifest"]', 'href').catch(() => null);
  console.log('manifest href:', manifestHref);

  // 2) service worker registered
  await page.waitForTimeout(1500);
  const swReady = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return 'no-sw-support';
    const reg = await navigator.serviceWorker.getRegistration();
    return reg ? (reg.active ? 'active' : 'registered') : 'none';
  });
  console.log('service worker:', swReady);

  // 3) start the game (tap ENTER THE DEPTHS)
  await page.click('#playBtn');
  await page.waitForTimeout(2500); // allow models to load

  const state = await page.evaluate(() => window.game && window.game.state);
  console.log('game state after start:', state);

  // 4) touch controls visible
  const touchVisible = await page.evaluate(() => {
    const ui = document.getElementById('touchUI');
    return ui ? getComputedStyle(ui).display !== 'none' : false;
  });
  console.log('touch controls visible:', touchVisible);

  // 5) canvas actually rendering (non-blank)
  const canvasOk = await page.evaluate(() => {
    const c = document.getElementById('game');
    return c && c.width > 0 && c.height > 0;
  });
  console.log('canvas sized:', canvasOk);

  // 6) simulate joystick drag -> player should move
  const before = await page.evaluate(() => ({ x: window.game.player.x, z: window.game.player.z }));
  const joy = await page.$('#joy');
  const box = await joy.boundingBox();
  await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width/2 + 40, box.y + box.height/2, { steps: 5 });
  await page.waitForTimeout(800);
  await page.mouse.up();
  const after = await page.evaluate(() => ({ x: window.game.player.x, z: window.game.player.z }));
  const moved = Math.hypot(after.x - before.x, after.z - before.z);
  console.log('player moved by (units):', moved.toFixed(2));

  console.log('\n=== ERRORS (' + errors.length + ') ===');
  errors.forEach(e => console.log(e));

  await browser.close();
  process.exit(errors.length > 0 || state !== 'playing' ? 1 : 0);
})();
