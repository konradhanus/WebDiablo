import { chromium } from 'playwright';
const URL = 'http://localhost:6660/';
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport:{width:390,height:844}, isMobile:true, hasTouch:true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  // first load (online) to populate SW cache
  await page.goto(URL, { waitUntil:'networkidle' });
  await page.waitForTimeout(1500);
  // now go offline and reload
  await ctx.setOffline(true);
  await page.goto(URL, { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(2000);
  const ok = await page.evaluate(() => !!window.game && document.getElementById('landing') !== null);
  const state = await page.evaluate(() => window.game && window.game.state);
  console.log('OFFLINE reload — landing present:', ok, '| state:', state, '| errors:', errors.length);
  await browser.close();
  process.exit(ok && errors.length === 0 ? 0 : 1);
})();
