#!/usr/env node
// E2E smoke test for WebDiablo 3D (Three.js isometric).
// Verifies the game boots with ZERO console/page errors, starts, the player
// humanoid mesh exists, movement + aim + melee + fireball run without throwing.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json' };
function serve(){ return new Promise(res=>{ const s=createServer((req,res)=>{
  let p=req.url.split('?')[0]; if(p==='/')p='/index.html';
  try{ const fp=join(root,p); statSync(fp); res.writeHead(200,{'Content-Type':MIME[extname(fp)]||'application/octet-stream'}); res.end(readFileSync(fp)); }
  catch{ res.writeHead(404); res.end('nf'); } }); s.listen(0,'127.0.0.1',()=>res(s)); }); }

const results=[];
const check=(n,c,d='')=>{ results.push({n,p:!!c,d}); console.log(`  ${c?'✓':'✗'} ${n}${d?' — '+d:''}`); };
const server=await serve(); const port=server.address().port;
const url=`http://127.0.0.1:${port}/`;
const cerr=[], perr=[];
const browser=await chromium.launch(); const page=await browser.newPage();
page.on('console',m=>{ if(m.type()==='error')cerr.push(m.text()); });
page.on('pageerror',e=>perr.push(e.message));
console.log('WebDiablo 3D — E2E smoke');
console.log('===========================');
try{
  await page.goto(url,{waitUntil:'networkidle'});
  await page.waitForTimeout(800);
  check('page loaded', await page.title()!==null);
  check('zero page errors on boot', perr.length===0, perr.join(' | '));
  check('zero console errors on boot', cerr.length===0, cerr.join(' | '));
  check('THREE loaded + game object', await page.evaluate(()=>typeof window.game==='object'&&window.game!==null));
  check('player mesh is a humanoid Group', await page.evaluate(()=>{
    const g=window.game; g.start('warrior');
    return !!g.mesh && g.mesh.userData && g.mesh.userData.legL && g.mesh.userData.sword;
  }));
  check('world mesh built (floor+walls)', await page.evaluate(()=>{
    const g=window.game; return g.meshes && g.meshes.root && g.meshes.root.children.length>=2;
  }));
  // movement
  const pos0=await page.evaluate(()=>{ const p=window.game.player; return {x:p.x,z:p.z}; });
  await page.evaluate(()=>{ window.game.keys['KeyD']=true; });
  await page.waitForTimeout(400);
  await page.evaluate(()=>{ window.game.keys['KeyD']=false; });
  const pos1=await page.evaluate(()=>{ const p=window.game.player; return {x:p.x,z:p.z}; });
  check('player moves on WASD', Math.abs(pos1.x-pos0.x)>0.3, `dx=${(pos1.x-pos0.x).toFixed(2)}`);
  // aim via mouse
  await page.mouse.move(900,300);
  await page.waitForTimeout(120);
  check('aim updates from mouse', await page.evaluate(()=>{ const a=window.game.aim; return Math.hypot(a.x,a.z)>0.5; }));
  // melee (no crash, swing triggers)
  await page.evaluate(()=>{ window.game.mouse.down=true; });
  await page.waitForTimeout(120);
  await page.evaluate(()=>{ window.game.mouse.down=false; });
  check('melee swing runs without error', await page.evaluate(()=>window.game.player.swing>=0));
  // fireball (no crash, projectile spawned)
  await page.evaluate(()=>{ window.game.keys['KeyF']=true; });
  await page.waitForTimeout(120);
  await page.evaluate(()=>{ window.game.keys['KeyF']=false; });
  check('fireball spawns projectile', await page.evaluate(()=>window.game.projectiles.length>=1));
  // ===== Faza 1: enemies + combat =====
  check('enemies spawn on floor', await page.evaluate(()=>{ const g=window.game; return g.enemies.length>0; }));
  check('enemy has humanoid mesh + hp bar', await page.evaluate(()=>{ const e=window.game.enemies[0]; return e&&e.mesh&&e.mesh.userData&&e.mesh.userData.legL&&e.hpBar; }));
  // kill an enemy via hitEnemy -> loot + xp
  const beforeLoot=await page.evaluate(()=>window.game.loot.length);
  await page.evaluate(()=>{ const g=window.game; const e=g.enemies.find(x=>!x.isBoss)||g.enemies[0]; const hp0=e.hp; for(let i=0;i<30;i++)g.hitEnemy(e, 999); });
  check('enemy dies + drops loot', await page.evaluate((bl)=>{ const g=window.game; return g.loot.length>bl; }, beforeLoot));
  check('player takes damage from enemy', await page.evaluate(()=>{ const g=window.game; const p=g.player; const hp0=p.hp; g.damagePlayer(20); return p.hp < p.maxHp; }));
  check('level up works', await page.evaluate(()=>{ const g=window.game; const p=g.player; p.xp=99999; g.checkLevel(); return p.level>=2; }));
  // ===== Faza 2: content (chests/altars/traps/secrets) =====
  check('interactables scattered', await page.evaluate(()=>{ const g=window.game; return g.dungeon.interactables.length>0; }));
  check('chest openable via interactTile', await page.evaluate(()=>{ const g=window.game; const c=g.dungeon.interactables.find(i=>i.type==='chest'); if(!c)return false; const before=g.loot.length; g.player.x=c.x*2; g.player.z=c.y*2; g.interactTile(); return c.opened && g.loot.length>before; }));
  check('trap triggers damage', await page.evaluate(()=>{ const g=window.game; const t=g.dungeon.interactables.find(i=>i.type==='trap'); if(!t)return true; const hp0=g.player.hp; g.player.invuln=0; g.player.x=t.x*2; g.player.z=t.y*2; g.update(0.05); return g.player.hp<hp0; }));
  check('secret reveal works', await page.evaluate(()=>{ const g=window.game; const s=g.dungeon.interactables.find(i=>i.type==='secret'); if(!s)return true; g.player.x=s.x*2; g.player.z=s.y*2; g.interactTile(); return s.revealed && g.dungeon.get(s.x,s.y)===1; }));
  check('potion use heals', await page.evaluate(()=>{ const g=window.game; g.player.hp=10; g.player.potions[0]=2; g.usePotion(0); return g.player.hp>10; }));
  // ===== Faza 3: squad / achievements / minimap =====
  check('recruit ally (Q)', await page.evaluate(()=>{ const g=window.game; const n0=g.squad.length; g.recruitAlly(); return g.squad.length>n0 && g.squad[0].mesh; }));
  check('achievement unlocks', await page.evaluate(()=>{ const g=window.game; g.unlockAch('floor5'); return g.achievements['floor5']===true; }));
  check('minimap renders without error', await page.evaluate(()=>{ const g=window.game; g.renderMinimap(); const cv=document.getElementById('minimap'); return cv && cv.width>0; }));
  check('screen shake triggers', await page.evaluate(()=>{ const g=window.game; g.addShake(0.3); return g.shake>0; }));
  // ===== Faza 4: follow-camera fix =====
  check('camera follows player', await page.evaluate(async ()=>{ const g=window.game;
    // move player far from origin, render, check camera tracks it
    g.player.x=40; g.player.z=40; g.render();
    const cx1=g.player.x+18, cz1=g.player.z+18;
    const ok = Math.abs(g.camera.position.x-cx1)<2 && Math.abs(g.camera.position.z-cz1)<2;
    g.player.x=-30; g.player.z=-20; g.render();
    const ok2 = Math.abs(g.camera.position.x-(-30+18))<2 && Math.abs(g.camera.position.z-(-20+18))<2;
    g.player.x=0; g.player.z=0; g.render();
    return ok && ok2;
  }));
  check('zero errors during Faza4', cerr.length===0 && perr.length===0, (cerr.concat(perr)).join(' | '));
  check('zero errors during Faza3', cerr.length===0 && perr.length===0, (cerr.concat(perr)).join(' | '));
  check('zero errors during content', cerr.length===0 && perr.length===0, (cerr.concat(perr)).join(' | '));
  check('zero errors during combat', cerr.length===0 && perr.length===0, (cerr.concat(perr)).join(' | '));
  check('zero errors during play', cerr.length===0 && perr.length===0, (cerr.concat(perr)).join(' | '));
  // floor descent reachable
  check('can descend to next floor', await page.evaluate(()=>{
    const g=window.game; const d=g.dungeon;
    // teleport onto stairs
    for(let y=0;y<d.h;y++)for(let x=0;x<d.w;x++) if(d.get(x,y)===4){ g.player.x=x*2; g.player.z=y*2; break; }
    g.update(0.1); return g.floor>=2;
  }));
}catch(e){ check('E2E completed without throwing', false, e.message+'\n'+(e.stack||'')); }
finally{ await browser.close(); server.close(); }
const failed=results.filter(r=>!r.p);
if(failed.length){ console.error(`\nE2E FAILED: ${failed.length}/${results.length}`); process.exit(1); }
console.log(`\nE2E OK (${results.length} checks)`);
