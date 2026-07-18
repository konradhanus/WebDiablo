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
