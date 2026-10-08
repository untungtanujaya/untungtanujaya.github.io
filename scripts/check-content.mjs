import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const manifest=JSON.parse(fs.readFileSync('docs/content-manifest.json','utf8'));
for(const [file,hash] of Object.entries(manifest))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),hash,`Source content changed: ${file}`);
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const pages=walk('dist').filter(f=>f.endsWith('.html'));
const errors=[];
for(const file of pages){
 const html=fs.readFileSync(file,'utf8');
 const pageURL=new URL(file.replace(/^dist/,'').replace(/index.html$/,''),'https://untungtanujaya.com');
 for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const value=match[1].replaceAll('&amp;','&');if(!value||/^(mailto:|data:|tel:|javascript:)/.test(value))continue;
  const url=new URL(value,pageURL);if(url.origin!==pageURL.origin)continue;
  const target=path.join('dist',decodeURIComponent(url.pathname));
  const resolved=fs.existsSync(target)&&fs.statSync(target).isFile()?target:path.join(target,'index.html');
  if(!fs.existsSync(resolved)){errors.push(`${file}: missing ${value}`);continue;}
  if(url.hash&&resolved.endsWith('.html')){const targetHTML=fs.readFileSync(resolved,'utf8');const anchor=decodeURIComponent(url.hash.slice(1));if(!targetHTML.includes(`id="${anchor}"`))errors.push(`${file}: missing anchor ${value}`);}
 }
 if(/dist\/(en|zh)\//.test(file)){
  assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,`${file}: exactly one h1`);
  assert.ok(html.includes('rel="canonical"'),`${file}: canonical`);
  assert.ok(html.includes('hreflang="zh-Hans"'),`${file}: locale alternate`);
  if(!file.includes('/tools/')) assert.ok(!html.includes('<astro-island'),`${file}: no React hydration on content pages`);
 }
}
assert.deepEqual(errors,[]);
for(const locale of ['en','zh']){
 for(const section of ['work','writing','research','research/publications','cv','tools','search'])assert.ok(fs.existsSync(`dist/${locale}/${section}/index.html`));
 const feed=fs.readFileSync(`dist/${locale}/feed.xml`,'utf8');assert.equal((feed.match(/<item>/g)||[]).length,8,'Seven articles and one research update');
}
assert.equal(fs.readFileSync('dist/CNAME','utf8').trim(),'untungtanujaya.com','Custom domain file must ship with the build');
assert.ok(fs.readFileSync('dist/en/index.html','utf8').includes('https://untungtanujaya.com/'),'Canonical uses production domain');
console.log(`PASS: ${Object.keys(manifest).length} original files unchanged; ${pages.length} HTML pages checked; internal links, anchors, locale metadata, feeds and static rendering verified.`);
