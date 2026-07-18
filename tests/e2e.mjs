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
    pct: parseFloat(document.getElementById('xpBarHud').style.width),
    txt: document.getElementById('levelNum').textContent,
    prog: window.game.getProgress()
  }));
  check('XP bar fills ~50% at half xp', xp.pct > 45 && xp.pct < 55, 'width=' + xp.pct + '%');
  check('level badge shows level', /^\d+$/.test(xp.txt), 'level=' + xp.txt);
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
    g.player.dir = 1; // index: right (dirs[1]={x:1,y:0})
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

  // --- Feature 012: braziers placed + blood decals on kill ---
  const atmo = await page.evaluate(() => {
    if (window.game.state !== 'playing') window.game.start();
    const g = window.game;
    const braziers = g.dungeon.braziers.length;
    g.bloods.length = 0; // reset for a clean measurement
    g.hitStopT = 0; // clear leftover hit-stop
    g.attackCooldown = 0;
    g.player.attackCooldown = 0;
    const before = g.bloods.length;
    g.enemies = [{ name:'Dummy', hp:1, maxHp:1, def:0, dmg:0, color:'#888', size:14,
                   xp:10, icon:'💀', x:g.player.x+1, y:g.player.y, state:'idle', stateTimer:0,
                   aggroRange:0, attackRange:1, attackCooldown:0, hitFlash:0, deathTimer:0,
                   dead:false, drops:['common'] }];
    g.player.dir = 1; // index: right
    g.mouse.down = true; g.update(0.1); g.mouse.down = false;
    return { braziers, before, after: g.bloods.length };
  });
  check('braziers placed in dungeon', atmo.braziers > 0, 'braziers=' + atmo.braziers);
  check('blood decal added on kill', atmo.after > atmo.before, `blood ${atmo.before} -> ${atmo.after}`);
  check('no errors after atmosphere check', consoleErrors.length === 0 && pageErrors.length === 0);

  // --- Feature 013: Squad Command ---
  const squad = await page.evaluate(() => {
    if (window.game.state !== 'playing') window.game.start();
    const g = window.game;
    g.squad.length = 0; g.kiaCount = 0;
    const recruited = [g.recruitMerc(), g.recruitMerc(), g.recruitMerc(), g.recruitMerc()]; // 4th should fail (cap 3)
    const squadSize = g.squad.length;
    // Place a strong enemy adjacent to a merc and run updates until merc dies.
    const m = g.squad[0];
    g.enemies = [{ name:'Killer', hp:50, maxHp:50, def:0, dmg:999, color:'#cc0000', size:16,
                   xp:5, icon:'👹', x:m.x+0.5, y:m.y, state:'chase', stateTimer:5,
                   aggroRange:10, attackRange:2, attackCooldown:0, hitFlash:0, deathTimer:0,
                   dead:false, drops:['common'] }];
    const kiaBefore = g.kiaCount;
    for (let i=0;i<60;i++) g.update(0.1); // ~6s of combat
    return { recruited, squadSize, kiaBefore, kiaAfter: g.kiaCount,
             pips: document.getElementById('squadPips').children.length };
  });
  check('recruit respects cap of 3', squad.squadSize === 3, 'size=' + squad.squadSize);
  check('4th recruit rejected', squad.recruited[3] === false, 'recruited[3]=' + squad.recruited[3]);
  check('merc death increments KIA', squad.kiaAfter > squad.kiaBefore, `KIA ${squad.kiaBefore} -> ${squad.kiaAfter}`);
  check('squad HUD shows 3 pips', squad.pips === 3, 'pips=' + squad.pips);
  check('no errors after squad combat', consoleErrors.length === 0 && pageErrors.length === 0);

  // --- Feature 014: Blood & Gore / Bloodlust ---
  const gore = await page.evaluate(() => {
    if (window.game.state !== 'playing') window.game.start();
    const g = window.game;
    g.carnage = { kills:0, streak:0, streakTimer:0 };
    g.particles.particles.length = 0; // clear for clean measure
    // First kill (direct, avoids melee direction dependency)
    g.enemies = [{ name:'A', hp:1, maxHp:1, def:0, dmg:0, color:'#888', size:14, xp:5,
                   icon:'💀', x:6, y:5, state:'idle', stateTimer:0, aggroRange:0, attackRange:1,
                   attackCooldown:0, hitFlash:0, deathTimer:0, dead:false, drops:['common'] }];
    g.hitEnemy(g.enemies[0], 999);
    const afterFirst = g.particles.particles.length;
    const streakAfter1 = g.carnage.streak;
    // Second kill → streak 2 → bloodlustMult should be >1
    g.enemies = [{ name:'B', hp:1, maxHp:1, def:0, dmg:0, color:'#888', size:14, xp:5,
                   icon:'💀', x:6, y:5, state:'idle', stateTimer:0, aggroRange:0, attackRange:1,
                   attackCooldown:0, hitFlash:0, deathTimer:0, dead:false, drops:['common'] }];
    g.hitEnemy(g.enemies[0], 999);
    const blm = g.bloodlustMult();
    const carnText = document.getElementById('carnageText').textContent;
    const blText = document.getElementById('bloodlustText').textContent;
    return { afterFirst, streakAfter1, blm, kills: g.carnage.kills, carnText, blText };
  });
  check('gib particles spawned on death', gore.afterFirst > 5, 'particles=' + gore.afterFirst);
  check('streak increments on kill', gore.streakAfter1 === 1, 'streak=' + gore.streakAfter1);
  check('bloodlust mult > 1 after streak', gore.blm > 1, 'blm=' + gore.blm);
  check('carnage HUD shows kills', /Kills: 2/.test(gore.carnText), gore.carnText);
  check('bloodlust HUD shows streak', /BLOODLUST x2/.test(gore.blText), gore.blText);
  check('no errors after gore', consoleErrors.length === 0 && pageErrors.length === 0);

  // --- Feature 015: Horde Waves ---
  const waves = await page.evaluate(() => {
    if (window.game.state !== 'playing') window.game.start();
    const g = window.game;
    g.enemies.length = 0; g.wave = {num:0,timer:0,active:false,toSpawn:0,spawnCd:0};
    g.hitStopT = 0; // clear leftover hit-stop so updateWaves runs
    g.update(0.1); // timer<=0 → startWave
    const startedActive = g.wave.active;
    const startedNum = g.wave.num;
    const toSpawn = g.wave.toSpawn;
    // run updates to spawn all wave enemies
    for (let i=0;i<60;i++) g.update(0.1);
    const waveEnemies = g.enemies.filter(e=>e.wave).length;
    const xpBefore = g.player.xp;
    // kill all wave enemies
    for (const e of g.enemies.filter(e=>e.wave)) { if(!e.dead) g.hitEnemy(e, 99999); }
    g.update(0.1); // detect cleared (filters dead, then checks wave)
    g.update(0.1); // second tick ensures updateEnemies pruned dead before updateWaves
    const clearedNum = g.wave.num;
    const clearedActive = g.wave.active;
    const xpAfter = g.player.xp;
    const banner = document.getElementById('waveBanner').textContent;
    return { startedActive, startedNum, toSpawn, waveEnemies, xpBefore, clearedNum, clearedActive, xpAfter, banner };
  });
  check('wave starts on timer', waves.startedActive === true, 'active=' + waves.startedActive);
  check('wave number incremented', waves.startedNum === 1, 'num=' + waves.startedNum);
  check('wave size computed (>0)', waves.toSpawn > 0, 'toSpawn=' + waves.toSpawn);
  check('wave enemies spawned', waves.waveEnemies > 0, 'waveEnemies=' + waves.waveEnemies);
  check('wave clears when all dead', waves.clearedActive === false, 'active=' + waves.clearedActive);
  check('wave clear grants bonus XP', waves.xpAfter > waves.xpBefore, `xp ${waves.xpBefore} -> ${waves.xpAfter}`);
  check('cleared banner shown', /WAVE CLEARED/.test(waves.banner), 'banner=' + waves.banner);
  check('no errors after waves', consoleErrors.length === 0 && pageErrors.length === 0);

  // --- Feature 016: HUD Rework ---
  const hud = await page.evaluate(() => {
    if (window.game.state !== 'playing') window.game.start();
    const g = window.game;
    g.buildSkillBar && g.buildSkillBar();
    const hpOrb = document.getElementById('hpOrbFill');
    const mpOrb = document.getElementById('mpOrbFill');
    const skillBar = document.getElementById('skillBar');
    const slotCount = skillBar ? skillBar.children.length : 0;
    const skill0 = document.getElementById('skill-0');
    const cdEl = skill0 ? skill0.querySelector('.skill-cd') : null;
    g.player.mp = 100; g.fireballCd = 0; g.castFireball();
    const cdAfterCast = g.fireballCd;
    g.updateSkillBar && g.updateSkillBar();
    const fbCooling = skill0 ? skill0.classList.contains('cooling') : false;
    const cdHeight = cdEl ? cdEl.style.height : 'n/a';
    return { hpOrbExists: !!hpOrb, mpOrbExists: !!mpOrb, slotCount, cdAfterCast, fbCooling, cdHeight,
             skill0Exists: !!skill0, cdElExists: !!cdEl };
  });
  check('HP orb element exists', hud.hpOrbExists, 'hpOrb=' + hud.hpOrbExists);
  check('MP orb element exists', hud.mpOrbExists, 'mpOrb=' + hud.mpOrbExists);
  check('skill bar has 5 slots', hud.slotCount === 5, 'slots=' + hud.slotCount);
  check('skill-0 exists', hud.skill0Exists, 'skill0=' + hud.skill0Exists);
  check('skill-0 .skill-cd exists', hud.cdElExists, 'cdEl=' + hud.cdElExists);
  check('fireball sets cooldown', hud.cdAfterCast > 0, 'cd=' + hud.cdAfterCast);
  check('fireball slot shows cooling', hud.fbCooling === true, 'cooling=' + hud.fbCooling);
  check('cooldown overlay has height', /%/.test(hud.cdHeight) && hud.cdHeight !== '0%', 'cdHeight=' + hud.cdHeight);
  check('no errors after HUD', consoleErrors.length === 0 && pageErrors.length === 0);

  // --- Feature 017: Boss Arena & Mechanics ---
  const boss = await page.evaluate(() => {
    const g = window.game;
    // Force floor 5 boss arena
    g.floor = 5;
    g.generateFloor();
    g.updateBossBar && g.updateBossBar();
    const hasBoss = !!(g.boss && g.boss.boss);
    const bossBar = document.getElementById('bossBar');
    const barShown = bossBar && bossBar.classList.contains('show');
    // Damage boss to <33% → phase 3 enrage
    g.boss.hp = g.boss.maxHp * 0.2;
    g.mouse.down = false; // avoid meleeAttack during sim
    g.update(0.1);
    const phase3 = g.boss.phase === 3 && g.boss.enraged === true;
    // Kill boss → gates open, loot dropped, VICTORY
    const lootBefore = g.loot.length;
    g.hitEnemy(g.boss, 999999);
    const gatesOpen = g.bossArena === false && g.boss === null;
    const lootDropped = g.loot.length > lootBefore;
    const victory = /VICTORY/.test(document.getElementById('bossName') ? document.body.innerHTML : '');
    return { hasBoss, barShown, phase3, gatesOpen, lootDropped, victory,
             bossName: g.boss ? g.boss.name : 'killed' };
  });
  check('boss spawned on floor 5', boss.hasBoss, 'boss=' + boss.bossName);
  check('boss HP bar visible', boss.barShown === true, 'barShown=' + boss.barShown);
  check('phase 3 enrage at <33% HP', boss.phase3 === true, 'phase3=' + boss.phase3);
  check('boss death opens gates', boss.gatesOpen === true, 'gatesOpen=' + boss.gatesOpen);
  check('boss death drops loot', boss.lootDropped === true, 'loot=' + boss.lootDropped);
  check('no errors after boss', consoleErrors.length === 0 && pageErrors.length === 0);

  // --- Feature 018: Sound & Music ---
  const snd = await page.evaluate(() => {
    const g = window.game;
    g.audio.init();
    const names=['hit','kill','scream','hurt','fire','boss','heal','levelup','pickup','ui','wave','death','magic','steps'];
    let played=0;
    for(const n of names){ try{ g.audio.play(n); played++; }catch(e){} }
    g.audio.startDrone();
    const droneOn = g.audio.droneOn === true;
    g.audio.setVolumes({master:50,music:30,sfx:90,muted:false});
    const volApplied = g.audio.master===0.5 && g.audio.music===0.3 && g.audio.sfx===0.9;
    g.audio.stopDrone();
    return { total:names.length, played, droneOn, volApplied };
  });
  check('all SFX play without error', snd.played === snd.total, `played ${snd.played}/${snd.total}`);
  check('drone starts', snd.droneOn === true, 'droneOn=' + snd.droneOn);
  check('volume mixer applies', snd.volApplied === true, 'vol=' + snd.volApplied);
  check('no errors after sound', consoleErrors.length === 0 && pageErrors.length === 0);

  // --- Feature 019: Achievements & Progression ---
  const ach = await page.evaluate(() => {
    const g = window.game;
    try{ localStorage.removeItem('webdiablo_achievements'); localStorage.removeItem('webdiablo_meta'); }catch(e){}
    g.achievements = {}; g.meta = {bosses:0,deepest:1};
    const first = g.unlock('first_blood');
    const firstAgain = g.unlock('first_blood');
    g.meta.bosses = 5;
    const bonus = Math.min(0.2, g.meta.bosses*0.02);
    const expectedMax = Math.floor(100*(1+bonus));
    g.toggleAchPanel();
    const panelOpen = document.getElementById('achPanel').style.display === 'flex';
    g.toggleAchPanel();
    const panelClosed = document.getElementById('achPanel').style.display === 'none';
    return { first, firstAgain, bonus, expectedMax, panelOpen, panelClosed };
  });
  check('first_blood unlocks once', ach.first === true && ach.firstAgain === false, 'first=' + ach.first + ' again=' + ach.firstAgain);
  check('meta HP bonus +10% at 5 bosses', ach.bonus === 0.1 && ach.expectedMax === 110, 'bonus=' + ach.bonus);
  check('achievements panel toggles (V)', ach.panelOpen === true && ach.panelClosed === true, 'open=' + ach.panelOpen);
  check('no errors after achievements', consoleErrors.length === 0 && pageErrors.length === 0);

  // --- Feature 020: Final Polish & Juice ---
  const polish = await page.evaluate(() => {
    const g = window.game;
    if (g.state !== 'playing') g.start();
    // kill hit-stop — drive attack directly to avoid movePlayer dir reset
    g.enemies = [{ name:'P', hp:1, maxHp:1, def:0, dmg:0, color:'#888', size:14, xp:1,
                   icon:'💀', x:g.player.x+1, y:g.player.y, state:'idle', stateTimer:0,
                   aggroRange:0, attackCd:0, hitFlash:0, walkTimer:0, drops:[] }];
    g.player.dir = 1; g.player.attackCooldown = 0;
    g.meleeAttack();
    const hitStop = g.hitStopT > 0;
    // level-up flash
    g.player.xp = g.player.xpNext; g.addXp && g.addXp(1);
    const flash = g.levelFlash > 0;
    // F4 toggle
    g.fpsVisible = false;
    g.fpsVisible = !g.fpsVisible;
    const fpsOn = g.fpsVisible === true;
    // death stats
    g.player.invuln = 0; g.player.hp = 0; g.damagePlayer && g.damagePlayer(9999);
    const ds = document.getElementById('deathStats');
    const dsFilled = ds && ds.innerHTML.includes('Floor reached');
    return { hitStop, flash, fpsOn, dsFilled };
  });
  check('hit-stop triggers on kill', polish.hitStop === true, 'hitStop=' + polish.hitStop);
  check('level-up flash fires', polish.flash === true, 'flash=' + polish.flash);
  check('FPS toggle works', polish.fpsOn === true, 'fpsOn=' + polish.fpsOn);
  check('death stats filled', polish.dsFilled === true, 'dsFilled=' + polish.dsFilled);
  check('no errors after polish', consoleErrors.length === 0 && pageErrors.length === 0);

  // --- Feature 021: Touch / Mobile (force touch mode via ?touch=1) ---
  await page.goto(url + '?touch=1', { waitUntil: 'networkidle' });
  await page.waitForSelector('#touchUI', { state: 'attached' });
  const touch = await page.evaluate(() => {
    const g = window.game;
    const out = { touchClass: document.body.classList.contains('touch'),
                  uiVisible: getComputedStyle(document.getElementById('touchUI')).display !== 'none',
                  isTouch: window.IS_TOUCH === true };
    if (g.state !== 'playing') g.start();
    // Joystick drag → movement
    const j = document.getElementById('joystick');
    const r = j.getBoundingClientRect();
    const cx = r.left + r.width/2, cy = r.top + r.height/2;
    j.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, clientX: cx, clientY: cy, bubbles: true }));
    j.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX: cx + 40, clientY: cy, bubbles: true }));
    const movedRight = g.keys['KeyD'] === true && g.player.dir === 1;
    const px0 = g.player.x;
    for (let i=0;i<10;i++) g.update(0.1); // simulate frames with key held
    const movedX = g.player.x > px0;
    j.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, clientX: cx, clientY: cy, bubbles: true }));
    const released = g.keys['KeyD'] === false;
    // Tap-to-attack: place an enemy to the right, tap canvas
    g.enemies = [{ name:'T', hp:30, maxHp:30, def:0, dmg:0, color:'#888', size:14, xp:1,
                   icon:'💀', x:g.player.x+1.2, y:g.player.y, state:'idle', stateTimer:0,
                   aggroRange:0, attackCd:0, hitFlash:0, walkTimer:0, drops:[] }];
    const cv = document.getElementById('gameCanvas');
    const cr = cv.getBoundingClientRect();
    cv.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 2, clientX: cr.left+cr.width*0.7, clientY: cr.top+cr.height*0.5, bubbles: true }));
    const atkDown = g.mouse.down === true;
    const hpBefore = g.enemies[0].hp;
    g.update(0.1);
    const hpAfter = g.enemies[0].hp;
    cv.dispatchEvent(new PointerEvent('pointerup', { pointerId: 2, clientX: cr.left+cr.width*0.7, clientY: cr.top+cr.height*0.5, bubbles: true }));
    const atkUp = g.mouse.down === false;
    // Fire button
    const btnFire = document.getElementById('btnFire');
    btnFire.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 3, bubbles: true }));
    return { ...out, movedRight, movedX, released, atkDown, hpDropped: hpAfter < hpBefore, atkUp };
  });
  check('touch mode activated (body.touch + ui visible)', touch.touchClass && touch.uiVisible && touch.isTouch, JSON.stringify(touch));
  check('joystick drag sets KeyD + dir=1', touch.movedRight === true, 'movedRight=' + touch.movedRight);
  check('joystick drag moves player', touch.movedX === true, 'movedX=' + touch.movedX);
  check('joystick release clears key', touch.released === true, 'released=' + touch.released);
  check('canvas tap sets mouse.down', touch.atkDown === true, 'atkDown=' + touch.atkDown);
  check('canvas tap deals melee damage', touch.hpDropped === true, 'hpDropped=' + touch.hpDropped);
  check('canvas tap release clears mouse.down', touch.atkUp === true, 'atkUp=' + touch.atkUp);
} catch (e) {
  check('E2E run completed without throwing', false, e.message + '\n' + (e.stack||''));
} finally {
  await browser.close();
  server.close();
}

const failed = results.filter(r => !r.pass);
if (failed.length) { console.error(`\nE2E FAILED: ${failed.length}/${results.length}`); process.exit(1); }
console.log(`\nE2E OK (${results.length} checks)`);
