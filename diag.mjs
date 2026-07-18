import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';
const root = join(dirname(fileURLToPath(import.meta.url)), '.');
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css' };
const srv = await new Promise(r=>{ const s=createServer((q,s)=>{ let p=q.url.split('?')[0]; if(p==='/')p='/index.html'; try{ statSync(join(root,p)); s.writeHead(200,{'Content-Type':MIME[extname(p)]||'application/octet-stream'}); s.end(readFileSync(join(root,p))); }catch{ s.writeHead(404); s.end('x'); } }); s.listen(0,'127.0.0.1',()=>r(s)); });
const port=srv.address().port;
const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1000,height:700}});
const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{if(m.type()==='error')errs.push('CON:'+m.text());});
await pg.goto('http://127.0.0.1:'+port+'/',{waitUntil:'networkidle'});
await pg.waitForTimeout(600);
const info = await pg.evaluate(async ()=>{ const g=window.game; g.start('warrior');
  await new Promise(r=>setTimeout(r,700));
  const cv=document.getElementById('game');
  const tmp=document.createElement('canvas'); tmp.width=cv.width; tmp.height=cv.height;
  const ctx=tmp.getContext('2d'); ctx.drawImage(cv,0,0);
  const ch=tmp.height, cw=tmp.width;
  // brightness of center 200x200
  let cd=ctx.getImageData(cw/2-100, ch/2-100, 200, 200).data, bright=0,n=0;
  for(let i=0;i<cd.length;i+=4){ bright+=(cd[i]+cd[i+1]+cd[i+2]); n++; }
  const centerBright=bright/(n*3);
  // count non-background pixels in whole frame (bg is PALETTE.bg ~ 0x11151f)
  let colored=0, tot=0; cd=ctx.getImageData(0,0,cw,ch).data;
  for(let i=0;i<cd.length;i+=4){ tot++; const r=cd[i],gg=cd[i+1],bb=cd[i+2];
    if(Math.abs(r-17)+Math.abs(gg-21)+Math.abs(bb-31) > 40) colored++; }
  return { centerBright, coloredPct:(colored/tot*100).toFixed(1), meshPos:[g.mesh.position.x,g.mesh.position.y,g.mesh.position.z], playerWorld:[g.player.x,g.player.z] };
});
console.log('DIAG3:', JSON.stringify(info,null,2));
console.log('ERRORS:', errs.join(' | ')||'none');
await pg.screenshot({path:join(root,'diag_shot.png')});
await b.close(); srv.close();
