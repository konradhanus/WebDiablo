import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';
const root = join(dirname(fileURLToPath(import.meta.url)), '.');
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.glb':'model/gltf-binary' };
const srv = await new Promise(r=>{ const s=createServer((q,s)=>{ let p=q.url.split('?')[0]; if(p==='/')p='/index.html'; try{ statSync(join(root,p)); s.writeHead(200,{'Content-Type':MIME[extname(p)]||'application/octet-stream'}); s.end(readFileSync(join(root,p))); }catch{ s.writeHead(404); s.end('x'); } }); s.listen(0,'127.0.0.1',()=>r(s)); });
const port=srv.address().port;
const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1000,height:700}});
const errs=[]; pg.on('pageerror',e=>errs.push('PE:'+e.message)); pg.on('console',m=>{if(m.type()==='error')errs.push('CE:'+m.text());});
await pg.goto('http://127.0.0.1:'+port+'/',{waitUntil:'networkidle'});
await pg.waitForTimeout(400);
await pg.evaluate(()=>document.getElementById('playBtn').click());
await new Promise(r=>setTimeout(r,7000)); // let all models load
const info = await pg.evaluate(()=>{
  const g=window.game;
  return { state:g.state, enemies:g.enemies.length, heroLoaded:!!g.mesh,
    enemyModels: g.enemies.slice(0,4).map(e=>e.type+':'+(e.mesh?e.mesh.type:'none')),
    enemyActions: g.enemies[0]&&g.enemies[0].actions?Object.keys(g.enemies[0].actions):null };
});
console.log('INFO:', JSON.stringify(info));
// walk test
const walk = await pg.evaluate(async ()=>{
  const g=window.game; g.keys['KeyW']=true;
  const t0=g.heroMixer?g.heroMixer.time:0;
  await new Promise(r=>setTimeout(r,600));
  g.keys['KeyW']=false;
  return { mixerAdvanced: g.heroMixer?(g.heroMixer.time!==t0):'no', walking:g.player.walking };
});
console.log('WALK:', JSON.stringify(walk));
// attack test
const atk = await pg.evaluate(async ()=>{
  const g=window.game; g.player.swing=0.3;
  await new Promise(r=>setTimeout(r,200));
  return { swing: g.player.swing };
});
console.log('ATK:', JSON.stringify(atk));
// pixel brightness of center (hero should be there)
const px = await pg.evaluate(()=>{
  const cv=document.getElementById('game'); const tmp=document.createElement('canvas'); tmp.width=cv.width; tmp.height=cv.height;
  const c=tmp.getContext('2d'); c.drawImage(cv,0,0);
  const d=c.getImageData(cv.width/2-120,cv.height/2-120,240,240).data;
  let bright=0,colored=0,n=0;
  for(let i=0;i<d.length;i+=4){ const r=d[i],gr=d[i+1],b=d[i+2]; const lum=(r+gr+b)/3; bright+=lum; if(Math.abs(r-gr)>20||Math.abs(gr-b)>20||Math.abs(r-b)>20)colored++; n++; }
  return { avgBright:(bright/n).toFixed(1), coloredPct:((colored/n)*100).toFixed(1) };
});
console.log('PIX:', JSON.stringify(px));
console.log('ERRORS:', errs.join(' | ')||'none');
await pg.screenshot({path:join(root,'diag_shot.png')});
await b.close(); srv.close();
